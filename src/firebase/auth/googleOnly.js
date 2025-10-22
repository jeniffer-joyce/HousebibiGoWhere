// src/firebase/auth/googleOnly.js
import { auth, db } from '@/firebase/firebase_config'

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  fetchSignInMethodsForEmail,
} from 'firebase/auth'

import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore'

async function ensureMinimalUserDoc(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    // Minimal fields only (no role, no username)
    await setDoc(ref, {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? '',
      createdAt: serverTimestamp(),
    })
  }
}

export async function googleSignInPopup() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  try {
    const { user } = await signInWithPopup(auth, provider)
    await ensureMinimalUserDoc(user)
    return user
  } catch (err) {
    if (err?.customData?.email && err.code === 'auth/account-exists-with-different-credential') {
      const methods = await fetchSignInMethodsForEmail(auth, err.customData.email)
      err.hint = `This email is already linked to: ${methods.join(', ')}`
    }
    throw err
  }
}

export async function googleSignInRedirect() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  await signInWithRedirect(auth, provider)
}

export async function handleGoogleRedirectResult() {
  const res = await getRedirectResult(auth)
  if (res?.user) {
    await ensureMinimalUserDoc(res.user)
    return res.user
  }
  return null
}
