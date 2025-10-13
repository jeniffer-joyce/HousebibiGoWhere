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

    // Fetch user role from Firestore with retry logic
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
        
        // Use seller's logo if available
        if (user.role === "seller" && data.logo) {
          user.avatar = data.logo
        }
      } else {
        console.warn("User document not found in Firestore after retries, defaulting to buyer role")
        user.role = "buyer"
      }
    } catch (error) {
      console.error("Error fetching user role:", error)
      user.role = "buyer"
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
  }
  user.loading = false
})