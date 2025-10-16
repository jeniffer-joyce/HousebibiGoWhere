// import { Component } from 'react'
import { watch } from "vue";
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'
import Categories from '../views/Categories.vue'
import About from '../views/About.vue'
import ForSellers from '../views/ForSellers.vue'
import SellerProfile from '../views/sellers/SellerProfile.vue'
import AddNewProduct from '../views/sellers/AddNewProduct.vue'
import EditProduct from '../views/sellers/EditProduct.vue'  
import SellerOrders from '../views/sellers/SellerOrders.vue'
import { user } from '../store/user.js'
import BuyerDashboard from "../views/buyers/BuyerDashboard.vue";
import BuyerOrders from "../views/buyers/BuyerOrders.vue";
import BuyerProfile from "../views/buyers/BuyerProfile.vue";
import BuyerFavourites from "../views/buyers/Favourites.vue";
import BuyerMessages from "../views/buyers/messages.vue";


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
        path: '/categories/',
        component: Categories
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
        path: '/add-new-product/',
        component: AddNewProduct
    },
    {
        path: '/edit-product/',
        component: EditProduct,
    },
    {
        path: '/seller-orders/',
        component: SellerOrders
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
        path: '/buyer-profile/',
        component: BuyerProfile
    },
    {
        path: '/buyer-favourites/',
        component: BuyerFavourites
    },
    {
        path: '/buyer-messages/',
        component: BuyerMessages
    },
    
]

const router = createRouter({
    history: createWebHistory(),
    routes
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