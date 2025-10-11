import { reactive } from "vue"
import { auth, onAuthStateChanged } from "../firebase/firebase_config"

export const user = reactive({
  isLoggedIn: false,
  name: null,
  avatar: null,
  uid: null,
  email: null,
  cart: [],
  wishlist: [],
  preferences: {
    theme: "dark",
    language: "en",
  },
})

// Listen for login/logout changes automatically
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    // Logged in
    user.isLoggedIn = true
    user.name = firebaseUser.displayName || "Anonymous"
    user.avatar = firebaseUser.photoURL || "../../public/avatar.png"
    user.uid = firebaseUser.uid
    user.email = firebaseUser.email
  } else {
    // Logged out
    user.isLoggedIn = false
    user.name = null
    user.avatar = null
    user.uid = null
    user.email = null
    user.cart = []
    user.wishlist = []
  }
})