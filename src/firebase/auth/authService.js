import { auth, db } from '@/firebase/firebase_config.js'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  fetchSignInMethodsForEmail,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { uploadBusinessLicense } from '../services/fileUpload.js'

const isEmail = (s) => /\S+@\S+\.\S+/.test(s)
const toKey = (s) => (s || '').trim().toLowerCase()

/** Verify reCAPTCHA token via Cloudflare Worker (server-side secret) */
export async function verifyCaptchaToken(token) {
  if (!token) {
    const e = new Error('captcha/missing-token')
    e.code = 'captcha/missing-token'
    throw e
  }

  const WORKER_URL = import.meta.env.VITE_CAPTCHA_VERIFY_URL
  if (!WORKER_URL) {
    const e = new Error('captcha/misconfigured')
    e.code = 'captcha/misconfigured'
    throw e
  }

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  let data = {}
  try { data = await res.json() } catch (_) {}

  if (!res.ok || !data?.success) {
    const e = new Error('captcha/failed')
    e.code = 'captcha/failed'
    throw e
  }
  return true
}

/** Ensure a users/{uid} profile exists (used for Google sign-in) */
async function ensureProviderProfile(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? '',
      createdAt: serverTimestamp(),
    })
  }
}

/**
 * Register user with username + email/password.
 * Requires a valid reCAPTCHA token (captchaToken).
 * For sellers, can optionally upload business license file.
 */
export async function registerUserWithUsername({
  username,
  email,
  password,
  displayName,
  role = 'buyer',
  extra = {},
  captchaToken,
  licenseFile = null,
  onUploadProgress = null,
}) {
  // 0) Verify captcha first (server-side via Worker)
  await verifyCaptchaToken(captchaToken)

  const uname = toKey(username)
  if (!/^[A-Za-z0-9]{8,20}$/.test(uname)) {
    const e = new Error('invalid-username')
    e.code = 'invalid-username'
    throw e
  }

  // 1) Create auth user
  const cred = await createUserWithEmailAndPassword(auth, email, password)

  // 2) Optional displayName
  if (displayName) await updateProfile(cred.user, { displayName })

  // 3) Upload business license if seller and file provided
  let licenseFileURL = null
  if (role === 'seller' && licenseFile) {
    try {
      licenseFileURL = await uploadBusinessLicense(
        licenseFile,
        cred.user.uid,
        onUploadProgress
      )
    } catch (uploadError) {
      console.error('License upload failed:', uploadError)
      throw uploadError
    }
  }

  // 4) Firestore profile
  const profile = {
    uid: cred.user.uid,
    email,
    username: uname,
    displayName: displayName || '',
    role,
    createdAt: serverTimestamp(),
    ...extra,  // ✅ This should include NRIC from singpassData
    ...(licenseFileURL ? { licenseFileURL, licenseFileName: licenseFile.name } : {}),
  }

  console.log('💾 Creating user profile with data:', profile) // ✅ Add this log

  await setDoc(doc(db, 'users', cred.user.uid), profile)

  return cred.user
}

/** Login with username OR email + password */
export async function loginWithIdentifier(identifier, password, captchaToken) {
  if (captchaToken) {
    await verifyCaptchaToken(captchaToken)
  }

  let email = identifier.trim()
  
  // If not an email, try to find user by username in /users collection
  if (!isEmail(identifier)) {
    const uname = toKey(identifier)
    
    // Search for user with this username (requires Firestore query or composite index)
    // For now, just treat it as email-only login
    const e = new Error('auth/user-not-found')
    e.code = 'auth/user-not-found'
    throw e
  }
  
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

/* ------------------------------------------------------------------ */
/*                        GOOGLE AUTH (WEB)                            */
/* ------------------------------------------------------------------ */

/** Popup flow (works on most desktop browsers) */
export async function loginWithGooglePopup() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  try {
    const { user } = await signInWithPopup(auth, provider)
    await ensureProviderProfile(user)
    return user
  } catch (err) {
    if (err?.customData?.email && err.code === 'auth/account-exists-with-different-credential') {
      const methods = await fetchSignInMethodsForEmail(auth, err.customData.email)
      err.hint = `This email is already linked to: ${methods.join(', ')}`
    }
    throw err
  }
}

/** Redirect flow (use on iOS Safari or if popups are blocked) */
export async function loginWithGoogleRedirect() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  await signInWithRedirect(auth, provider)
}

/** Call on mounted() of your Login page if using redirect */
export async function handleGoogleRedirectResult() {
  const res = await getRedirectResult(auth)
  if (res?.user) {
    await ensureProviderProfile(res.user)
    return res.user
  }
  return null
}