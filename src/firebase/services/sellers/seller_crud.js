// src/views/sellers/account/seller_crud.js
import { auth, db } from '@/firebase/firebase_config'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'


/** Wait until Firebase restores any session */
export const authReady = () =>
  new Promise((resolve) => {
    const off = onAuthStateChanged(auth, () => { off(); resolve(); })
  })

/** Fetch both user + business docs for current user */
export async function fetchSellerComposite () {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not signed in')

  const userRef = doc(db, 'users', uid)
  const bizRef  = doc(db, 'businesses', uid)

  const [userSnap, bizSnap] = await Promise.all([getDoc(userRef), getDoc(bizRef)])

  const user = userSnap.exists() ? userSnap.data() : null
  const business = bizSnap.exists() ? bizSnap.data() : null

  // merged view (useful if you want one object)
  const composite = { ...(user || {}), ...(business || {}) }

  return { uid, user, business, composite }
}

/**
 * Update seller profile info.
 * - Writes to users/{uid}: username, displayName, phone, gender, birthday
 * - If profilePicDataUrl is provided, writes to businesses/{uid}: profilePic
 *   (Later, switch to Firebase Storage and save a URL instead.)
 */
export async function updateSellerProfile ({
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
  const bizRef  = doc(db, 'businesses', uid)

  // make sure docs exist (in case they don't yet)
  // minimal creation to avoid update errors
  const [uSnap, bSnap] = await Promise.all([getDoc(userRef), getDoc(bizRef)])
  if (!uSnap.exists()) await setDoc(userRef, { uid }, { merge: true })
  if (!bSnap.exists()) await setDoc(bizRef,  { uid }, { merge: true })

  const userPatch = { username, displayName, phone, gender, birthday }
  await updateDoc(userRef, userPatch)

  if (profilePicDataUrl) {
    await updateDoc(bizRef, { profilePic: profilePicDataUrl })
  }

  return true
}
/** 
 * Update business info (name, bio, description)
 * Writes directly to businesses/{uid}
 */
export async function updateSellerBusiness({ name, bio, description }) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not signed in')

  const bizRef = doc(db, 'businesses', uid)
  const bizSnap = await getDoc(bizRef)
  if (!bizSnap.exists()) {
    // if doc doesn't exist, create it minimally
    await setDoc(bizRef, { uid }, { merge: true })
  }

  const patch = {}
  if (typeof name === 'string') patch.name = name
  if (typeof bio === 'string') patch.bio = bio
  if (typeof description === 'string') patch.description = description

  if (Object.keys(patch).length > 0) {
    await updateDoc(bizRef, patch)
  }

  return true
}

/**
 * Change the current user's password.
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export async function changePassword(currentPassword, newPassword) {
  // Ensure we have a user/session
  const user = auth.currentUser
  if (!user || !user.email) {
    throw new Error('No authenticated user')
  }

  // Reauthenticate first
  const cred = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, cred)

  // Then update
  await updatePassword(user, newPassword)

  // Optional: you could also write an audit log to Firestore here if you want.
  return true
}