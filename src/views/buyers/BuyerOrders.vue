<script setup>
import { ref } from 'vue';
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue';

// Mock data for orders
const orders = ref([
    {
        id: 1,
        orderNumber: 'ORD-001',
        title: 'Delicious homemade meals',
        business: 'The Cozy Kitchen',
        date: 'July 10, 2024',
        status: 'Delivered',
        amount: '$45.00',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
    },
    {
        id: 2,
        orderNumber: 'ORD-002',
        title: 'Handcrafted clothing',
        business: 'Fashion Finds',
        date: 'July 5, 2024',
        status: 'In Transit',
        amount: '$89.99',
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop'
    },
    {
        id: 3,
        orderNumber: 'ORD-003',
        title: 'Unique handmade crafts',
        business: 'Crafty Corner',
        date: 'June 28, 2024',
        status: 'Delivered',
        amount: '$34.50',
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=300&fit=crop'
    },
    {
        id: 4,
        orderNumber: 'ORD-004',
        title: 'Fresh baked goods',
        business: 'The Cozy Kitchen',
        date: 'June 15, 2024',
        status: 'Delivered',
        amount: '$28.00',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop'
    }
]);

const activeFilter = ref('all');

const filteredOrders = computed(() => {
    if (activeFilter.value === 'all') return orders.value;
    return orders.value.filter(order => 
        order.status.toLowerCase() === activeFilter.value.toLowerCase()
    );
});

function getStatusColor(status) {
    switch(status.toLowerCase()) {
        case 'delivered':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'in transit':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'processing':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
            return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
}
</script>

<template>
    <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <!-- Sidebar Navigation -->
        <BuyerSideBar />

        <!-- Main Content Area -->
        <main class="flex-1 ml-64 p-8">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">My Orders</h1>
                    <p class="text-slate-600 dark:text-slate-400 mt-1">Track and manage your orders</p>
                </div>
                <div class="flex items-center gap-4">
                    <!-- Search -->
                    <div class="relative">
                        <input
                            type="text"
                            placeholder="Search orders"
                            class="w-64 pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <!-- Notifications -->
                    <button class="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                        </svg>
                    </button>
                    <!-- Profile -->
                    <img src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff" alt="Profile" class="h-10 w-10 rounded-full border-2 border-primary" />
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700">
                <button
                    @click="activeFilter = 'all'"
                    :class="[
                        'pb-3 px-4 font-medium transition-colors',
                        activeFilter === 'all'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    ]">
                    All Orders
                </button>
                <button
                    @click="activeFilter = 'delivered'"
                    :class="[
                        'pb-3 px-4 font-medium transition-colors',
                        activeFilter === 'delivered'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    ]">
                    Delivered
                </button>
                <button
                    @click="activeFilter = 'in transit'"
                    :class="[
                        'pb-3 px-4 font-medium transition-colors',
                        activeFilter === 'in transit'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    ]">
                    In Transit
                </button>
            </div>

            <!-- Orders List -->
            <div class="space-y-4">
                <div
                    v-for="order in filteredOrders"
                    :key="order.id"
                    class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex gap-6">
                        <!-- Order Image -->
                        <img :src="order.image" :alt="order.title" class="w-32 h-32 rounded-lg object-cover" />
                        
                        <!-- Order Details -->
                        <div class="flex-1">
                            <div class="flex items-start justify-between mb-2">
                                <div>
                                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">{{ order.title }}</h3>
                                    <p class="text-sm text-slate-600 dark:text-slate-400">{{ order.business }}</p>
                                </div>
                                <span :class="['px-3 py-1 rounded-full text-sm font-medium', getStatusColor(order.status)]">
                                    {{ order.status }}
                                </span>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">Order Number</p>
                                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ order.orderNumber }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">Order Date</p>
                                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ order.date }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">Total Amount</p>
                                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ order.amount }}</p>
                                </div>
                            </div>

                            <div class="flex gap-3 mt-4">
                                <button class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                                    View Details
                                </button>
                                <button class="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Track Order
                                </button>
                                <button v-if="order.status === 'Delivered'" class="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Write Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="filteredOrders.length === 0" class="text-center py-16">
                    <svg class="h-24 w-24 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                    <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">No orders found</h3>
                    <p class="text-slate-600 dark:text-slate-400">You haven't placed any orders yet.</p>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
button {
    transition: all 0.2s ease;
}
</style>