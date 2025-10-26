/**
 * seller_crud.js
 * =============================
 * Centralized CRUD utilities for Seller-side account management.
 *
 * This file handles:
 *  - Retrieving both `users` and `businesses` documents linked by UID
 *  - Updating seller personal info (users/{uid})
 *  - Updating business info (businesses/{uid})
 *  - Changing passwords via Firebase Auth
 *  - Deleting all linked data safely (products, businesses, users)
 *
 * All functions assume the current user is authenticated in Firebase.
 */

import { auth, db } from '@/firebase/firebase_config'
import { onAuthStateChanged } from 'firebase/auth'
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  getDocs,
  collection,
  where,
  query,
  deleteDoc
} from 'firebase/firestore'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  signOut
} from 'firebase/auth'

/* ==========================================================
   🔐 AUTH HANDLING
   ========================================================== */

/**
 * Wait until Firebase restores any active session.
 * This ensures Firestore calls only run once the auth state is resolved.
 *
 * Usage:
 *   await authReady();
 */
export const authReady = () =>
  new Promise((resolve) => {
    const off = onAuthStateChanged(auth, () => {
      off()
      resolve()
    })
  })

/* ==========================================================
   📥 FETCH SELLER COMPOSITE DATA
   ========================================================== */

/**
 * Fetch both `users/{uid}` and `businesses/{uid}` documents for the logged-in user.
 *
 * Returns:
 *   {
 *     uid: string,
 *     user: object | null,         // Raw user doc
 *     business: object | null,     // Raw business doc
 *     composite: object            // Combined data for convenience
 *   }
 */
export async function fetchSellerComposite() {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not signed in')

  const userRef = doc(db, 'users', uid)
  const bizRef = doc(db, 'businesses', uid)

  // Fetch both docs concurrently
  const [userSnap, bizSnap] = await Promise.all([getDoc(userRef), getDoc(bizRef)])

  const user = userSnap.exists() ? userSnap.data() : null
  const business = bizSnap.exists() ? bizSnap.data() : null

  // Merge both docs for unified consumption
  const composite = { ...(user || {}), ...(business || {}) }

  return { uid, user, business, composite }
}

/* ==========================================================
   🧾 UPDATE USER PROFILE INFO
   ========================================================== */

/**
 * Update seller personal profile data in `users/{uid}`.
 * Optionally updates `profilePic` in `businesses/{uid}`.
 *
 * @param {object} payload
 * @param {string} payload.username
 * @param {string} payload.displayName
 * @param {string} payload.phone
 * @param {string} payload.gender
 * @param {string} payload.birthday
 * @param {string|null} payload.profilePicDataUrl
 */
export async function updateSellerProfile({
  username = '',
  displayName = '',
  phone = '',
  gender = '',
  birthday = '',
  profilePicDataUrl = null
}) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not signed in')

  const userRef = doc(db, 'users', uid)
  const bizRef = doc(db, 'businesses', uid)

  // Ensure both documents exist (create minimal shell docs if missing)
  const [uSnap, bSnap] = await Promise.all([getDoc(userRef), getDoc(bizRef)])
  if (!uSnap.exists()) await setDoc(userRef, { uid }, { merge: true })
  if (!bSnap.exists()) await setDoc(bizRef, { uid }, { merge: true })

  // Update user info
  const userPatch = { username, displayName, phone, gender, birthday }
  await updateDoc(userRef, userPatch)

  // Optionally update the business profile picture
  if (profilePicDataUrl) {
    await updateDoc(bizRef, { profilePic: profilePicDataUrl })
  }

  return true
}

/* ==========================================================
   🏢 UPDATE BUSINESS INFO
   ========================================================== */

/**
 * Update basic business info in `businesses/{uid}`.
 *
 * @param {object} payload
 * @param {string} payload.name
 * @param {string} payload.bio
 * @param {string} payload.description
 */
export async function updateSellerBusiness({ name, bio, description }) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not signed in')

  const bizRef = doc(db, 'businesses', uid)
  const bizSnap = await getDoc(bizRef)

  // Ensure doc exists
  if (!bizSnap.exists()) await setDoc(bizRef, { uid }, { merge: true })

  // Only write defined string fields
  const patch = {}
  if (typeof name === 'string') patch.name = name
  if (typeof bio === 'string') patch.bio = bio
  if (typeof description === 'string') patch.description = description

  if (Object.keys(patch).length > 0) {
    await updateDoc(bizRef, patch)
  }

  return true
}

/* ==========================================================
   🔑 PASSWORD MANAGEMENT
   ========================================================== */

/**
 * Change the currently signed-in user's password.
 * Requires reauthentication for security.
 *
 * @param {string} currentPassword - The existing password.
 * @param {string} newPassword - The new password.
 *
 * Throws if reauthentication fails or user not logged in.
 */
export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser
  if (!user || !user.email) throw new Error('No authenticated user')

  // Reauthenticate first
  const cred = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, cred)

  // Then perform password update
  await updatePassword(user, newPassword)

  // You could also log an audit entry here (e.g., Firestore 'security_logs')
  return true
}

/* ==========================================================
   ❌ ACCOUNT DELETION
   ========================================================== */

/**
 * Fully delete a seller account and all linked data.
 * Steps:
 *  1. Reauthenticate with password
 *  2. Delete all products referencing this sellerId (products/{id})
 *  3. Delete businesses/{uid} document
 *  4. Delete users/{uid} document
 *  5. Sign the user out
 *
 * @param {string} password - The current account password for verification.
 */
export async function deleteSellerAccount(password) {
  const user = auth.currentUser
  if (!user || !user.email) throw new Error('No authenticated user')

  // Step 1 — Reauthenticate to confirm identity
  const cred = EmailAuthProvider.credential(user.email, password)
  await reauthenticateWithCredential(user, cred)

  const uid = user.uid

  // Step 2 — Delete all products linked to this seller
  const productQ = query(collection(db, 'products'), where('sellerId', '==', uid))
  const productSnap = await getDocs(productQ)
  const deletions = productSnap.docs.map((d) => deleteDoc(d.ref))
  await Promise.all(deletions)

  // Step 3 — Delete business doc
  await deleteDoc(doc(db, 'businesses', uid))

  // Step 4 — Delete user doc
  await deleteDoc(doc(db, 'users', uid))

  // Step 5 — Sign out session to clear local auth
  await signOut(auth)

  return true
}
