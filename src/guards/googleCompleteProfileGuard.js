// src/guards/googleCompleteProfileGuard.js
import { auth, db, onAuthStateChanged } from '@/firebase/firebase_config'
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'

async function targetAfterLogin(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return { path: '/complete-profile/', query: { first: 1 } }
  const d = snap.data()
  const hasRole = !!d.role
  const hasUsername = !!d.username
  if (!hasRole || !hasUsername) return { path: '/complete-profile/', query: { first: 1 } }
  // Role decided
  return d.role === 'seller' ? { path: '/seller-profile/' } : { path: '/' }
}

/** Call this ONCE after router is created. No other code needs to change. */
export function registerGoogleCompleteProfileGuard(router) {
  onAuthStateChanged(auth, async (u) => {
    if (!u) return
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
