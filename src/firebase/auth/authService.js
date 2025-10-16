// --- Firebase app, auth, db from your config ---
import { auth, db } from '../firebase_config' 

// --- Firebase Auth (CDN) ---
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"

// --- Firestore (CDN) ---
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

// --- File Upload ---
import { uploadBusinessLicense } from '../services/fileUpload.js'

// Helpers
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

/** Reserve username atomically (lowercase key) */
async function reserveUsername(usernameLower, payload) {
  const ref = doc(db, 'usernames', usernameLower)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (snap.exists()) throw new Error('username-already-in-use')
    tx.set(ref, payload) // { uid, email }
  })
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
  licenseFile = null, // <-- NEW: actual File object
  onUploadProgress = null, // <-- NEW: optional progress callback
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
      // If upload fails, we should probably delete the auth user
      // to avoid partial registration
      console.error('License upload failed:', uploadError)
      // You might want to delete the user here: await cred.user.delete()
      throw uploadError
    }
  }

  // 4) Firestore profile (includes username in the document)
  const profile = {
    uid: cred.user.uid,
    email,
    username: uname, // Store username in users collection
    displayName: displayName || '',
    role,
    createdAt: serverTimestamp(),
    ...extra,
    // Add the file URL instead of just filename
    ...(licenseFileURL ? { licenseFileURL, licenseFileName: licenseFile.name } : {}),
  }
  
  // Remove the old licenseFileName from extra if it exists (we're replacing it)
  delete profile.licenseFileName
  if (licenseFileURL) {
    profile.licenseFileURL = licenseFileURL
    profile.licenseFileName = licenseFile.name
  }

  await setDoc(doc(db, 'users', cred.user.uid), profile)

  return cred.user
}

/** Login with username OR email + password */
export async function loginWithIdentifier(identifier, password, captchaToken) {
  // Optional: require captcha for login too (e.g., after N failed attempts)
  if (captchaToken) {
    await verifyCaptchaToken(captchaToken)
  }

  let email = identifier.trim()
  if (!isEmail(identifier)) {
    const uname = toKey(identifier)
    const snap = await getDoc(doc(db, 'usernames', uname))
    if (!snap.exists()) {
      const e = new Error('auth/user-not-found')
      e.code = 'auth/user-not-found'
      throw e
    }
    email = snap.data().email
  }
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}