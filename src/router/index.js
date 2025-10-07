// import { Component } from 'react'
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'
import Categories from '../views/Categories.vue'
import About from '../views/About.vue'
import ForSellers from '../views/ForSellers.vue'
import SellerShop from '../views/sellers/SellerShop.vue'
import AddNewProduct from '../views/sellers/AddNewProduct.vue'  
import SellerOrders from '../views/sellers/SellerOrders.vue'

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
        path: '/seller-shop/',
        component: SellerShop
    },
    {
        path: '/add-new-product/',
        component: AddNewProduct
    },
    {
        path: '/seller-orders/',
        component: SellerOrders
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;