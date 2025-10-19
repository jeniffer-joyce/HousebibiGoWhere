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
import SellerProfile from '../views/sellers/SellerProfile.vue'
import SellerOrders from '../views/sellers/SellerOrders.vue'
import { user } from '../store/user.js'
import BusinessHomepage from "../views/sellers/BusinessHomepage.vue";
// Buyer Views
import BuyerDashboard from "../views/buyers/BuyerDashboard.vue";
import BuyerOrders from "../views/buyers/BuyerOrders.vue";
import BuyerAccount from "../views/buyers/BuyerAccount.vue";
import BuyerFavourites from "../views/buyers/Favourites.vue";
import BuyerMessages from "../views/buyers/messages.vue";
import CompleteProfile from '../views/CompleteProfile.vue';

import ProfileTab from '../views/buyers/account/ProfileTab.vue'          
import AddressesTab from '../views/buyers/account/AddressesTab.vue'      
import PaymentsTab from '../views/buyers/account/PaymentsTab.vue'        
import NotificationsTab from '../views/buyers/account/NotificationsTab.vue' 
import ChangePasswordTab from '../views/buyers/account/ChangePasswordTab.vue' 
import PrivacySettingsTab from '../views/buyers/account/PrivacySettingsTab.vue'
import EmailChangeDone from '../firebase/auth/EmailChangeDone.vue'

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
        path: '/seller-profile/',
        component: SellerProfile
    },
    {
        path: '/seller-orders/',
        component: SellerOrders
    },
    {
        path: '/business-homepage/',
        component: BusinessHomepage
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
        path: '/buyer-account/email-change-done',
        component: EmailChangeDone, 
    },
    {
        path: '/buyer-account/change-email',
        component: () => import('../views/buyers/ChangeEmail.vue'),
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
    
]

const router = createRouter({
    history: createWebHistory(),
    routes
})
router.beforeEach(async (to, from, next) => {
  // 1️⃣ wait for firebase to restore any existing session
  await authReady

  // 2️⃣ detect if user returned from hosted handler
  const cameFromHosted =
    typeof to.query.mode === 'string' && typeof to.query.oobCode === 'string'

  if (cameFromHosted) {
    try {
      await auth.currentUser?.reload()
    } catch (e) {
      console.warn('Auth reload after hosted redirect failed', e)
    }
  }

  next()
})

router.beforeEach((to, from, next) => {
  if (user.loading) {
    const unwatch = watch(() => user.loading, (val) => {
      if (!val) {
        unwatch()
        next({ ...to, replace: true }) // re-run navigation
      }
    })
  } else {
    // existing role-based logic
    if (to.path === '/' && user.isLoggedIn && user.role === 'seller') next('/seller-profile/')
    else if (to.meta.requiresSeller && user.role !== 'seller') next('/')
    else next()
  }
})

export default router;