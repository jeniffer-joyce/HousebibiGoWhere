// import { Component } from 'react'
import { watch } from "vue";
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'
import Products from '../views/Products.vue'
import About from '../views/About.vue'

// Seller Views
import ForSellers from '../views/ForSellers.vue'
import SellerOrders from '../views/sellers/SellerOrders.vue'
import { user } from '../store/user.js'
import SellerMessages from "../views/sellers/SellerMessages.vue";
import BusinessHomepage from "../views/sellers/BusinessHomepage.vue";
import EditAccount from "../views/sellers/EditAccount.vue";

import MyProfile from "../views/sellers/account/MyProfile.vue";
import MyBusiness from "../views/sellers/account/MyBusiness.vue";
import Notifications from "../views/sellers/account/Notifications.vue";
import ChangePassword from "../views/sellers/account/ChangePassword.vue";
import DeleteAccount from "../views/sellers/account/DeleteAccount.vue";
import ReturnRefund from "../views/sellers/account/ReturnRefund.vue";

// Seller TEST View (Developers only)
import CurrentSeller from "../views/sellers/CurrentSeller.vue";
import DevAccountView from "../views/sellers/account/DevAccountView.vue";

// Buyer Views
import BuyerDashboard from "../views/buyers/BuyerDashboard.vue";
import BuyerOrders from "../views/buyers/BuyerOrders.vue";
import BuyerAccount from "../views/buyers/BuyerAccount.vue";
import BuyerFavourites from "../views/buyers/Favourites.vue";
import BuyerMessages from "../views/buyers/BuyerMessages.vue";
import Cart from "../views/buyers/Cart.vue";
import CompleteProfile from '../views/CompleteProfile.vue';

import ProductDetails from '../views/buyers/ProductDetails.vue'
import ShopDetails from "../views/buyers/ShopDetails.vue";
import Checkout from "../views/buyers/Checkout.vue";

// Buyer Account Tabs
import ProfileTab from '../views/buyers/account/ProfileTab.vue'
import AddressesTab from '../views/buyers/account/AddressesTab.vue'
import PaymentsTab from '../views/buyers/account/PaymentsTab.vue'
import NotificationsTab from '../views/buyers/account/NotificationsTab.vue'
import ChangePasswordTab from '../views/buyers/account/ChangePasswordTab.vue'
import PrivacySettingsTab from '../views/buyers/account/PrivacySettingsTab.vue'


// For both seller and buyer roles
import ChangeEmail from '../views/ChangeEmail.vue'
import EmailChangeDone from '../firebase/auth/EmailChangeDone.vue'


import { db } from '@/firebase/firebase_config'
import { doc, getDoc } from 'firebase/firestore'
import { auth } from '@/firebase/firebase_config'
import { onAuthStateChanged } from 'firebase/auth'

// ✅ define authReady here so the guard can await it
const authReady = new Promise((resolve) => {
  const off = onAuthStateChanged(auth, () => {
    off();
    resolve();
  });
});

const routes = [
  {
    path: '/',
    // name: 'home',
    component: Home
  },
  {
    path: '/login/',
    component: Login
  },
  {
    path: '/signup/',
    component: SignUp
  },
  {
    path: '/products/',
    component: Products
  },
  {
    path: '/about/',
    component: About
  },
  {
    path: '/for-sellers/',
    component: ForSellers
  },
  {
    path: '/seller-orders/',
    component: SellerOrders
  },
  {
    path: '/seller-messages/',
    component: SellerMessages
  },
  {
    path: '/current-seller/',
    component: CurrentSeller
  },
  {
    path: '/:username/',
    component: BusinessHomepage,
    name: 'business-home',
    props: r => ({ username: String(r.params.username || '').toLowerCase() })
  },
  {
    path: '/:username/edit-profile/',
    component: EditAccount,
    name: 'edit-profile',
    redirect: (to) => {
    return { name: 'edit-profile.my-profile', params: to.params }
    },
    props: r => ({ username: String(r.params.username || '').toLowerCase() }),
    children: [
      { path: 'my-profile', name: 'edit-profile.my-profile', component: MyProfile },
      { path: 'my-business', name: 'edit-profile.my-business', component: MyBusiness },
      { path: 'return-refund', name: 'edit-profile.return-refund', component: ReturnRefund },
      { path: 'notifications', name: 'edit-profile.notifications', component: Notifications },
      { path: 'change-password', name: 'edit-profile.change-password', component: ChangePassword },
      { path: 'delete-account', name: 'edit-profile.delete-account', component: DeleteAccount },
    ]
  },
  {
    path: '/dev-account-view/',
    component: DevAccountView
  },
  {
    path: '/buyer-dashboard/',
    component: BuyerDashboard
  },
  {
    path: '/buyer-orders/',
    component: BuyerOrders
  },
  {
    path: '/buyer-account/',
    component: BuyerAccount,
    children: [
      { path: 'profile', component: ProfileTab },
      { path: 'addresses', component: AddressesTab },
      { path: 'banks-cards', component: PaymentsTab },
      { path: 'notifications', component: NotificationsTab },
      { path: 'password', component: ChangePasswordTab },
      { path: 'privacy', component: PrivacySettingsTab },
    ]
  },
  {
    path: '/email-change/success/',
    component: EmailChangeDone,
  },
  {
    path: '/change-email/',
    component: ChangeEmail,
  },
  {
    path: '/buyer-favourites/',
    component: BuyerFavourites
  },
  {
    path: '/buyer-messages/',
    component: BuyerMessages
  },
  {
    path: '/complete-profile/',
    component: CompleteProfile
  },
  {
    path: '/shop-details/:id',
    component: ShopDetails,
    name: "ShopDetails",
    props: true
  },
  {
    path: '/product-details/:id',
    component: ProductDetails,
    name: "ProductDetails",
    props: true
  },
  {
    path: '/cart',
    component: Cart,
  },
  {
    path: '/checkout',
    component: Checkout,
  },
  {
  path: '/order-success',
  name: 'OrderSuccess',
  component: () => import('@/views/OrderSuccess.vue'),
  meta: {
    requiresAuth: true // Optional: only logged-in users can access
  }
}

  


]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  // 1) wait for Firebase to restore any existing session
  await authReady

  // 2) detect if user returned from hosted handler (password reset, email link, etc.)
  const cameFromHosted =
    typeof to.query.mode === 'string' && typeof to.query.oobCode === 'string'

  if (cameFromHosted) {
    try {
      await auth.currentUser?.reload()
    } catch (e) {
      console.warn('Auth reload after hosted redirect failed', e)
    }
  }

  // 3) 🔑 Cold-start redirect: if hitting "/" with an authenticated user,
  //    read Firestore once to get role + username and redirect to /:username/
  if (to.path === '/' && auth.currentUser) {
    try {
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid))
      if (snap.exists()) {
        const data = snap.data() || {}
        const role = String(data.role || '').toLowerCase()
        const uname = String(data.username || '').trim().toLowerCase()
        if (role === 'seller' && uname) {
          return next({ name: 'business-home', params: { username: uname } })
        }
      }
    } catch (e) {
      console.warn('Cold-start redirect lookup failed:', e)
      // fall through to next()
    }
  }

  // If navigating to /:username/edit-profile, ensure it's the owner
  if (to.name === 'edit-profile' && auth.currentUser) {
    try {
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid))
      const data = snap.exists() ? snap.data() : null
      const myUsername = String(data?.username || '').toLowerCase()
      const targetUsername = String(to.params.username || '').toLowerCase()
      if (myUsername && targetUsername && myUsername !== targetUsername) {
        // kick them back to their own page
        return next({ name: 'edit-profile', params: { username: myUsername } })
      }
    } catch (e) {
      console.warn('Username ownership check failed:', e)
    }
  }

  next()
})


router.beforeEach((to, from, next) => {
  if (user.loading) {
    // If already logged in and heading to /login/, don't block the view;
    // Login.vue will take care of redirect after it signs in.
    if (to.path === '/login/' && user.isLoggedIn) return next()

    const unwatch = watch(() => user.loading, (val) => {
      if (!val) {
        unwatch()
        next({ ...to, replace: true })
      }
    })
  } else {
    // If user hits "/" and is a logged-in seller -> go to /:username/
    if (to.path === '/' && user.isLoggedIn && user.role === 'seller') {
      const uname = String(user?.username || '').trim().toLowerCase()
      if (uname) return next({ name: 'business-home', params: { username: uname } })
      return next('/') // fallback
    }

    // If a route requires seller but user isn't a seller
    if (to.meta?.requiresSeller && user.role !== 'seller') return next('/')

    return next()
  }
})


export default router;