<script setup>
import { ref } from 'vue';
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue';

// Sidebar collapsed state (unchanged)
const isSidebarCollapsed = ref(false);
function handleSidebarToggle(collapsed) {
  isSidebarCollapsed.value = collapsed;
}

// Mock data (unchanged)
const recentOrders = ref([
  {
    id: 1,
    title: 'Delicious homemade meals',
    date: 'July 10',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'Handcrafted clothing',
    date: 'July 5',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'Unique handmade crafts',
    date: 'June 28',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=300&fit=crop'
  }
]);

const favoriteBusinesses = ref([
  { id: 1, name: 'The Cozy Kitchen', image: 'https://ui-avatars.com/api/?name=The+Cozy+Kitchen&background=FFD7BA&color=8B4513&size=100' },
  { id: 2, name: 'Crafty Corner', image: 'https://ui-avatars.com/api/?name=Crafty+Corner&background=FFD7BA&color=8B4513&size=100' },
  { id: 3, name: 'Fashion Finds', image: 'https://ui-avatars.com/api/?name=Fashion+Finds&background=FFD7BA&color=8B4513&size=100' }
]);

const unreadMessages = ref([
  { id: 1, business: 'The Cozy Kitchen', message: 'Hi Sarah, your order is ready for...', avatar: 'https://ui-avatars.com/api/?name=The+Cozy+Kitchen&background=FF9B7A&color=fff&size=50' },
  { id: 2, business: 'Crafty Corner', message: 'Thanks for your review!', avatar: 'https://ui-avatars.com/api/?name=Crafty+Corner&background=90C8AC&color=fff&size=50' }
]);
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <!-- Sidebar -->
    <BuyerSideBar @sidebar-toggle="handleSidebarToggle" />

    <!-- Main Content -->
    <main
      class="flex-1 transition-all duration-300 px-4 sm:px-6 lg:px-8 py-6"
      :class="isSidebarCollapsed ? 'ml-20' : 'ml-64'"
    >
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>

        <div class="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <!-- Search -->
          <div class="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search"
              class="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <svg
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Notifications -->
          <button
            class="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg shrink-0"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <!-- Profile -->
          <img
            src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
            alt="Profile"
            class="h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 border-primary shrink-0"
          />
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- Recent Orders -->
        <div class="lg:col-span-2">
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
            Recent Orders
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
              v-for="order in recentOrders"
              :key="order.id"
              class="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div class="w-full aspect-[4/3]">
                <img :src="order.image" :alt="order.title" class="w-full h-full object-cover" />
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-slate-900 dark:text-white mb-1">{{ order.title }}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">Order placed on {{ order.date }}</p>
              </div>
            </div>
          </div>

          <!-- Favorite Businesses -->
          <div class="mt-6 sm:mt-8">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Favorite Businesses
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              <div
                v-for="business in favoriteBusinesses"
                :key="business.id"
                class="flex flex-col items-center cursor-pointer group"
              >
                <div
                  class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors"
                >
                  <img :src="business.image" :alt="business.name" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
                </div>
                <p class="text-sm font-medium text-slate-900 dark:text-white text-center px-2">
                  {{ business.name }}
                </p>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div class="mt-6 sm:mt-8">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Recommendations For You
            </h2>
            <div class="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <p class="text-slate-600 dark:text-slate-400">
                Discover new businesses tailored to your preferences...
              </p>
            </div>
          </div>
        </div>

        <!-- Unread Messages -->
        <div class="lg:col-span-1">
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
            Unread Messages
          </h2>
          <div class="space-y-3">
            <div
              v-for="message in unreadMessages"
              :key="message.id"
              class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div class="flex items-start gap-3">
                <img :src="message.avatar" :alt="message.business" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">{{ message.business }}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ message.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
