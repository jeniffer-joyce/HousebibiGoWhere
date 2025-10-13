import { reactive } from "vue"
import { auth, onAuthStateChanged, db } from "../firebase/firebase_config"
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

export const user = reactive({
  isLoggedIn: false,
  name: null,
  avatar: null,
  uid: null,
  email: null,
  role: "buyer", // default role
  loading: true,
  cart: [],
  wishlist: [],
  preferences: {
    theme: "dark",
    language: "en",
    categories: [], // User's preferred categories
    hasSetPreferences: false // Whether user has set/skipped preferences
  },
})

// Listen for login/logout changes automatically
onAuthStateChanged(auth, async (firebaseUser) => {
  user.loading = true
  if (firebaseUser) {
    // Logged in
    user.isLoggedIn = true
    user.name = firebaseUser.displayName || "Anonymous"
    user.avatar = firebaseUser.photoURL || "/avatar.png"
    user.uid = firebaseUser.uid
    user.email = firebaseUser.email

    // Fetch user role and preferences from Firestore with retry logic
    try {
      const docRef = doc(db, "users", firebaseUser.uid)
      let attempts = 0
      let docSnap = null
      
      // Retry up to 3 times with delays (in case Firestore write is delayed after signup)
      while (attempts < 3) {
        docSnap = await getDoc(docRef)
        if (docSnap.exists()) break
        attempts++
        if (attempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms before retry
        }
      }
      
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data()
        console.log("Fetched user data:", data)

        user.role = data.role || "buyer"
        
        // Load user preferences
        user.preferences.categories = data.preferredCategories || []
        user.preferences.hasSetPreferences = data.hasSetPreferences || false
        
        // Use seller's logo if available
        if (user.role === "seller" && data.logo) {
          user.avatar = data.logo
        }
      } else {
        console.warn("User document not found in Firestore after retries, defaulting to buyer role")
        user.role = "buyer"
        user.preferences.categories = []
        user.preferences.hasSetPreferences = false
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      user.role = "buyer"
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
    user.wishlist = []
    user.preferences.categories = []
    user.preferences.hasSetPreferences = false
  }
  user.loading = false
})