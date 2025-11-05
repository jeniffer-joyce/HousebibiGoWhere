import { reactive } from "vue"
import { auth, db } from "@/firebase/firebase_config.js"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, query, collection, where, onSnapshot } from "firebase/firestore"

export const user = reactive({
  isLoggedIn: false,
  name: null,
  avatar: null,
  uid: null,
  email: null,
  role: "buyer", // default role
  loading: true,
  cartCount: 0,
  favourites: [],
  favouriteBusinesses: [],
  needsOnboarding: false,
  preferences: {
    theme: "dark",
    language: "en",
    categories: [], // User's preferred categories
    hasSetPreferences: false // Whether user has set/skipped preferences
  },
  isSigningUp: false, // NEW: Track if user is in signup process
})

let unsubscribeCart = null

function subscribeToCartCount(userId) {
  if (unsubscribeCart) {
    unsubscribeCart()
  }

  if (!userId) {
    user.cartCount = 0
    return
  }

  const cartRef = doc(db, 'carts', userId)

  unsubscribeCart = onSnapshot(cartRef, (snapshot) => {
    if (snapshot.exists()) {
      const cartData = snapshot.data()
      user.cartCount = cartData?.items?.length || 0
    } else {
      user.cartCount = 0
    }
  }, (error) => {
    console.error('Error fetching cart count:', error)
    user.cartCount = 0
  })
}

// Listen for login/logout changes automatically
onAuthStateChanged(auth, async (firebaseUser) => {
  // If user is in signup process, skip the auth state change handling
  // This prevents the "user not found" message during signup
  if (user.isSigningUp) {
    console.log('⏭️ Skipping auth state change during signup')
    return
  }

  user.loading = true
  if (firebaseUser) {
    // Logged in
    user.isLoggedIn = true
    user.uid = firebaseUser.uid
    user.email = firebaseUser.email

    subscribeToCartCount(firebaseUser.uid)

    // Fetch user role and preferences from Firestore with retry logic
    try {
      const docRef = doc(db, "users", firebaseUser.uid)
      let attempts = 0
      let docSnap = null

      // Retry up to 5 times with longer delays for signup scenarios
      while (attempts < 5) {
        docSnap = await getDoc(docRef)
        if (docSnap.exists()) break
        attempts++
        if (attempts < 5) {
          // Progressive backoff: 500ms, 1000ms, 1500ms, 2000ms
          const delay = attempts * 500
          console.log(`🔄 User document not found, retry ${attempts}/5 in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }

      if (docSnap && docSnap.exists()) {
        const data = docSnap.data()
        console.log("✅ Fetched user data:", data)

        user.role = data.role || "buyer"

        // Load user preferences
        user.preferences.categories = data.preferredCategories || []
        user.preferences.hasSetPreferences = data.hasSetPreferences || false

        // Priority order for display name:
        // 1. Firestore displayName
        // 2. Firebase Auth displayName
        // 3. "Anonymous"
        user.name = data.displayName || firebaseUser.displayName || "Anonymous"

        // Priority order for avatar:
        // 1. For sellers: use their logo if available
        // 2. Firestore photoURL
        // 3. Firebase Auth photoURL
        // 4. Default avatar
        if (user.role === "seller" && data.logo) {
          user.avatar = data.logo
        } else if (data.photoURL) {
          user.avatar = data.photoURL
        } else if (firebaseUser.photoURL) {
          user.avatar = firebaseUser.photoURL
        } else {
          user.avatar = "/avatar.png"
        }

        console.log("👤 User display name:", user.name)
        console.log("🖼️ User avatar:", user.avatar)
      } else {
        console.warn("⚠️ User document not found in Firestore after 5 retries, defaulting to buyer role")
        user.role = "buyer"
        user.name = firebaseUser.displayName || "Anonymous"
        user.avatar = firebaseUser.photoURL || "/avatar.png"
        user.preferences.categories = []
        user.preferences.hasSetPreferences = false
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error)
      user.role = "buyer"
      user.name = firebaseUser.displayName || "Anonymous"
      user.avatar = firebaseUser.photoURL || "/avatar.png"
      user.preferences.categories = []
      user.preferences.hasSetPreferences = false
    }

  } else {
    // Logged out
    user.isLoggedIn = false
    user.name = null
    user.avatar = null
    user.uid = null
    user.email = null
    user.role = "buyer"
    user.cart = []
    user.favourites = []
    user.favouriteBusinesses = []
    user.preferences.categories = []
    user.preferences.hasSetPreferences = false

    if (unsubscribeCart) {
      unsubscribeCart()
      unsubscribeCart = null
    }
    user.cartCount = 0
  }
  user.loading = false
})