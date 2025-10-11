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

    // Fetch user role from Firestore
    try {
      const docRef = doc(db, "users", firebaseUser.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        console.log("Fetched user data:", data)

        user.role = data.role || "buyer"
        if (user.role === "seller" && data.logo) {
          user.avatar = data.logo || "/avatar.png"
        }
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