// src/guards/googleCompleteProfileGuard.js
import { auth, db } from '@/firebase/firebase_config.js'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

async function targetAfterLogin(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) {
    return { path: '/complete-profile/', query: { first: 1 } }
  }
  const d = snap.data()
  const hasRole = !!d.role
  const hasUsername = !!d.username
  if (!hasRole || !hasUsername) {
    return { path: '/complete-profile/', query: { first: 1 } }
  }
  // Role decided → send to seller profile, else home/buyer area
  return d.role === 'seller' ? { path: '/seller-profile/' } : { path: '/' }
}

/** Call this ONCE after router is created. */
export function registerGoogleCompleteProfileGuard(router) {
  let handledOnce = false

  onAuthStateChanged(auth, async (u) => {
    if (!u) return

    // Determine if this session is a Google sign-in
    const isGoogle =
      Array.isArray(u.providerData) &&
      u.providerData.some(p => p?.providerId === 'google.com')

    // If NOT Google:
    //  - never auto-redirect to /complete-profile/
    //  - if user somehow is on /complete-profile/, bounce them out
    if (!isGoogle) {
      const cur = router.currentRoute.value
      if (cur.path.startsWith('/complete-profile')) {
        router.replace('/buyer-dashboard/') // or wherever your default buyer page is
      }
      return
    }

    // Avoid spamming redirects on every auth event
    if (handledOnce) return
    handledOnce = true

    // Google users only: make sure profile is completed
    const target = await targetAfterLogin(u.uid)
    const cur = router.currentRoute.value
    const shouldPush =
      (target.path && cur.path !== target.path) ||
      (target.name && cur.name !== target.name)

    if (shouldPush) {
      router.push(target)
    }
  })
}