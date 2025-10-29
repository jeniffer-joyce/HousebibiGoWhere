<script setup>
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue'
import { useFavorites } from '@/composables/useFavorites.js'

const {
  isSidebarCollapsed,
  favorites,
  favoriteProducts,
  handleSidebarToggle,
  toggleFavorite,
  toggleProductFavorite
} = useFavorites()

</script>

<template>
    <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <!-- Sidebar Navigation -->
        <BuyerSideBar @sidebar-toggle="handleSidebarToggle" />

        <!-- Main Content Area -->
        <main 
            class="flex-1 p-8 transition-all duration-300"
            :class="isSidebarCollapsed ? 'ml-20' : 'ml-64'">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">My Favorites</h1>
                    <p class="text-slate-600 dark:text-slate-400 mt-1">Businesses you love</p>
                </div>
                <div class="flex items-center gap-4">
                    <!-- Search -->
                    <div class="relative">
                        <input
                            type="text"
                            placeholder="Search favorites"
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

            <!-- 🔹 Favorited Products Section -->
            <div v-if="favoriteProducts.length > 0" class="mb-8">
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">Your Favorite Products</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div v-for="product in favoriteProducts" :key="product.id" class="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div class="relative">
                            <img :src="product.img_url" :alt="product.item_name" class="w-full h-48 object-cover" />
                            <button @click="toggleProductFavorite(product.id)" class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                <svg :class="['h-6 w-6 transition-colors', product.isFavorite ? 'text-red-500 fill-current' : 'text-slate-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="p-5">
                            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">{{ product.item_name }}</h3>
                            <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">{{ product.sellerName }}</p>
                            <p class="font-bold">
                            <!-- Show min-max prices -->
                            {{
                                (() => {
                                    if (!product.sizes || !product.sizes.length) return '$0';
                                    const prices = product.sizes.map(s => s.price);
                                    const min = Math.min(...prices);
                                    const max = Math.max(...prices);
                                    return min === max ? `$${min}` : `$${min} - $${max}`;
                                })()
                            }}
                        </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Favorites Count -->
            <div class="mb-6">
                <p class="text-slate-600 dark:text-slate-400">
                    You have <span class="font-semibold text-primary">{{ favorites.length }}</span> favorite businesses
                </p>
            </div>

            <!-- Favorites Grid -->
            <div v-if="favorites.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                    v-for="business in favorites"
                    :key="business.id"
                    class="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <!-- Business Image -->
                    <div class="relative">
                        <img :src="business.image" :alt="business.name" class="w-full h-48 object-cover" />
                        <button
                            @click="toggleFavorite(business.id)"
                            class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors">
                            <svg
                                :class="['h-6 w-6 transition-colors', business.isFavorite ? 'text-red-500 fill-current' : 'text-slate-400']"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Business Info -->
                    <div class="p-5">
                        <div class="mb-2">
                            <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                {{ business.category }}
                            </span>
                        </div>
                        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">{{ business.name }}</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">{{ business.description }}</p>
                        
                        <!-- Rating -->
                        <div class="flex items-center gap-2 mb-4">
                            <div class="flex items-center">
                                <svg class="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                </svg>
                                <span class="ml-1 font-semibold text-slate-900 dark:text-white">{{ business.rating }}</span>
                            </div>
                            <span class="text-sm text-slate-500 dark:text-slate-400">({{ business.reviews }} reviews)</span>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-2">
                            <button class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                                Visit Store
                            </button>
                            <button class="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-16">
                <svg class="h-24 w-24 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">No favorites yet</h3>
                <p class="text-slate-600 dark:text-slate-400 mb-6">Start exploring and add businesses to your favorites!</p>
                <button class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    Explore Businesses
                </button>
            </div>
        </main>
    </div>
</template>

<style scoped>
button {
    transition: all 0.2s ease;
}
</style>