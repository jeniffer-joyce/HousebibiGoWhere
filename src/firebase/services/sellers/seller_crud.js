// ============================================================================
// seller_crud.js  (FULL FILE)
// ============================================================================
// Public API (unchanged function names / signatures):
//   - authReady()
//   - fetchSellerComposite()            // now also auto-syncs address into /businesses
//   - updateSellerProfile(patch)
//   - updateSellerBusiness(patch)
//   - changePassword(currentPassword, newPassword)
//   - deleteSellerAccount(currentPassword)
//
// What’s NEW in this file:
//   • combineAddressFromUser(userDoc): builds "unitNo + addressLine + postalCode"
//   • In fetchSellerComposite(), after loading user + business, we:
//       - compute combinedAddress from /users
//       - if it’s non-empty and different from businesses.address, we patch businesses.address
//     (This is intentionally lightweight and won’t overwrite a non-empty business address
//      with empties. It only updates when we have a real combined value.)
// ============================================================================

import { auth, db } from '@/firebase/firebase_config'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore'
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from 'firebase/auth'

// ---------------------------------------------
// Auth gate
// ---------------------------------------------
let _authReadyOnce
export function authReady() {
  if (_authReadyOnce) return _authReadyOnce
  _authReadyOnce = new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged(() => {
      unsub()
      resolve(true)
    })
  })
  return _authReadyOnce
}

// ---------------------------------------------
// Helpers
// ---------------------------------------------
async function getCurrentUid() {
  await authReady()
  const u = auth.currentUser
  return u?.uid || null
}

async function readUser(uid) {
  if (!uid) return null
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

async function readBusiness(uid) {
  if (!uid) return null
  const snap = await getDoc(doc(db, 'businesses', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/** Build a clean "address" string from /users fields, e.g. "#12-34, 123 Example St, 543210". */
function combineAddressFromUser(userDoc = {}) {
  const unitNo = (userDoc.unitNo || '').toString().trim()
  const addressLine = (userDoc.addressLine || '').toString().trim()
  const postalCode = (userDoc.postalCode || '').toString().trim()

  const parts = []
  if (unitNo) parts.push(unitNo)
  if (addressLine) parts.push(addressLine)
  if (postalCode) parts.push(postalCode)

  // Return "" (empty string) if nothing to combine — we won’t patch Firestore in that case.
  return parts.join(', ').trim()
}

/** Safe, shallow object cleanup: drop keys with undefined only (keeps false/0/'' values). */
function dropUndefined(obj) {
  const out = {}
  Object.keys(obj || {}).forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

// ---------------------------------------------
// Public: fetchSellerComposite
// - Loads /users/{uid} and /businesses/{uid}
// - NEW: If we can build a non-empty combined address from user and it differs from
//        businesses.address, we patch /businesses/{uid}.address (non-destructive).
// ---------------------------------------------
export async function fetchSellerComposite() {
  const uid = await getCurrentUid()
  if (!uid) return { user: null, business: null }

  const [userDoc, businessDoc] = await Promise.all([readUser(uid), readBusiness(uid)])

  // ── NEW: Auto-sync address from /users → /businesses (non-destructive)
  // Build combined address string from user fields.
  const combinedAddress = combineAddressFromUser(userDoc)
  // Patch only if:
  //   - combinedAddress is non-empty, and
  //   - business address is missing OR different
  if (combinedAddress) {
    const currentBizAddress = (businessDoc?.address || '').toString().trim()
    if (combinedAddress !== currentBizAddress) {
      try {
        await updateDoc(doc(db, 'businesses', uid), { address: combinedAddress })
        // reflect local copy so callers see it immediately
        if (businessDoc) businessDoc.address = combinedAddress
      } catch (e) {
        // If /businesses/{uid} does not exist yet, create a minimal shell with address
        if (!businessDoc) {
          await setDoc(doc(db, 'businesses', uid), { address: combinedAddress }, { merge: true })
          // refetch to keep return shape consistent
          const updated = await readBusiness(uid)
          return { user: userDoc, business: updated }
        }
        // Silently ignore if permission or other transient error — UI should still load
        console.warn('Address auto-sync skipped:', e?.message || e)
      }
    }
  }

  return { user: userDoc, business: businessDoc }
}

// ---------------------------------------------
// Public: updateSellerProfile
// Updates /users/{uid} with personal details.
// Mirrors profilePic into /businesses/{uid} if provided.
// ---------------------------------------------
export async function updateSellerProfile(patch = {}) {
  const uid = await getCurrentUid()
  if (!uid) throw new Error('Not authenticated')

  const userRef = doc(db, 'users', uid)
  const cleaned = dropUndefined({
    displayName: patch.displayName,
    username: patch.username,
    email: patch.email, // note: changing auth email should be handled in your dedicated flow
    phone: patch.phone,
    gender: patch.gender,
    birthday: patch.birthday,
    profilePic: patch.profilePic,
    photoURL: patch.photoURL, // allow either
  })

  if (Object.keys(cleaned).length) {
    await updateDoc(userRef, cleaned)
  }

  // If a profile picture was changed, mirror into business doc as a convenience.
  if (cleaned.profilePic || cleaned.photoURL) {
    const finalPic = cleaned.profilePic || cleaned.photoURL
    try {
      await updateDoc(doc(db, 'businesses', uid), { profilePic: finalPic })
    } catch {
      // ignore if business doc not yet created; will be filled later
    }
  }

  // Also: if address-related fields were updated on the user, we can opportunistically
  // refresh the business address (uses the same non-destructive rule).
  if ('unitNo' in patch || 'addressLine' in patch || 'postalCode' in patch) {
    const userDoc = await readUser(uid)
    const combinedAddress = combineAddressFromUser(userDoc)
    if (combinedAddress) {
      try {
        await updateDoc(doc(db, 'businesses', uid), { address: combinedAddress })
      } catch {
        // ignore if business not created yet
      }
    }
  }
}

// ---------------------------------------------
// Public: updateSellerBusiness
// Updates /businesses/{uid} shop-facing fields (name, bio, description, category, address).
// NOTE: This does not fight the auto-sync; if you pass a non-empty address here,
//       it will be set as-is. Auto-sync only runs when we can build a non-empty
//       address from /users AND it differs, so your explicit business edits still win.
// ---------------------------------------------
export async function updateSellerBusiness(patch = {}) {
  const uid = await getCurrentUid()
  if (!uid) throw new Error('Not authenticated')

  const businessRef = doc(db, 'businesses', uid)
  const cleaned = dropUndefined({
    name: patch.name,
    bio: patch.bio,
    description: patch.description,
    category: patch.category,
    address: patch.address, // explicitly allow setting address here
    verified: patch.verified,
    uen: patch.uen,
    profilePic: patch.profilePic,
  })

  if (Object.keys(cleaned).length) {
    await updateDoc(businessRef, cleaned)
  }
}

// ---------------------------------------------
// Public: changePassword
// Reauth then update
// ---------------------------------------------
export async function changePassword(currentPassword, newPassword) {
  await authReady()
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')

  if (!user.email) throw new Error('Email not available for reauthentication')

  const cred = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, cred)
  await updatePassword(user, newPassword)
  return true
}

// ---------------------------------------------
// Public: deleteSellerAccount
// Deletes all products, business doc, user doc, then the auth user.
// ---------------------------------------------
export async function deleteSellerAccount(currentPassword) {
  await authReady()
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  if (!user.email) throw new Error('Email not available for reauthentication')

  // Reauth
  const cred = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, cred)

  const uid = user.uid

  // 1) Delete all products owned by seller
  const productsQ = query(collection(db, 'products'), where('sellerId', '==', uid))
  const productsSnap = await getDocs(productsQ)
  if (!productsSnap.empty) {
    const batch = writeBatch(db)
    productsSnap.forEach((d) => batch.delete(doc(db, 'products', d.id)))
    await batch.commit()
  }

  // 2) Delete business + user docs
  const batch2 = writeBatch(db)
  batch2.delete(doc(db, 'businesses', uid))
  batch2.delete(doc(db, 'users', uid))
  await batch2.commit()

  // 3) Finally delete auth user (signs out implicitly)
  await user.delete()
  return true
}
