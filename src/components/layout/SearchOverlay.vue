<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSearch } from '@/composables/useSearch'
import Loading from '@/components/status/Loading.vue'

const props = defineProps({
    show: Boolean
})

const emit = defineEmits(['close'])

const router = useRouter()
const searchQuery = ref('')

const {
    isSearching,
    searchResults
} = useSearch(searchQuery)

// Navigate to business page
function goToBusinessPage(business) {
    if (!business) return
    
    const businessUid = business.uid || business.id || business.userId
    
    if (!businessUid) {
        console.error('Business has no UID:', business)
        return
    }
    
    emit('close')
    router.push(`/shop-details/${businessUid}`)
}

// Navigate to product page
function goToProductPage(product) {
    if (!product || !product.id) return
    
    emit('close')
    router.push(`/product-details/${product.id}`)
}
</script>

<template>
    <teleport to="body">
    <transition name="fade-slide">
        <div v-if="show" class="fixed inset-0 z-50 flex flex-col">
            <!-- Search Section - Takes up more space -->
            <div class="z-50 bg-white dark:bg-slate-900 shadow-lg flex flex-col h-[100vh] md:h-[100vh]">
                <!-- Header with Close Button -->
                <div class="flex-shrink-0 flex justify-between items-center px-4 sm:px-6 lg:px-8 pt-4 pb-2">
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white">Search</h2>
                    <button @click="$emit('close')" 
                        class="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Search Content -->
                <div class="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8 pb-6">
                    <div class="max-w-7xl w-full mx-auto flex flex-col flex-1 overflow-hidden">
                        <!-- Search Input -->
                        <div class="flex-shrink-0 relative mb-4 sm:mb-6">
                            <input 
                                v-model="searchQuery" 
                                type="text" 
                                placeholder="Search products or businesses..."
                                autofocus
                                class="w-full bg-transparent border-0 border-b-2 sm:border-b-4 border-slate-300 dark:border-slate-700 px-0 py-2 sm:py-3 text-xl sm:text-2xl text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-0" />
                            <span v-if="isSearching" class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2">
                                <svg class="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            </span>
                        </div>

                        <!-- Search Results - Scrollable -->
                        <div class="flex-1 overflow-y-auto -mx-2 px-2">
                            <!-- Loading State -->
                            <div v-if="isSearching" class="flex justify-center items-center py-12">
                                <Loading size="md" />
                            </div>

                            <!-- No Results -->
                            <div v-else-if="searchQuery.trim() && searchResults.businesses.length === 0 && searchResults.products.length === 0"
                                class="text-center py-12 text-slate-500 dark:text-slate-400">
                                <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p class="text-lg">No results found for "{{ searchQuery }}"</p>
                                <p class="text-sm mt-2">Try different keywords!</p>
                            </div>

                            <!-- Results -->
                            <div v-else-if="searchQuery.trim()" class="space-y-6 pb-4">
                                <!-- Businesses Section -->
                                <div v-if="searchResults.businesses.length > 0">
                                    <h4 class="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 sticky top-0 bg-white dark:bg-slate-900 py-2 -mx-2 px-2 z-10">
                                        Businesses ({{ searchResults.businesses.length }})
                                    </h4>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                        <button 
                                            v-for="business in searchResults.businesses" 
                                            :key="business.id"
                                            @click="goToBusinessPage(business)"
                                            class="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left group">
                                            <img 
                                                :src="business.image" 
                                                :alt="business.name" 
                                                class="h-14 w-14 sm:h-16 sm:w-16 rounded-lg object-cover group-hover:scale-105 transition-transform flex-shrink-0" />
                                            <div class="flex-1 min-w-0">
                                                <p class="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200 truncate">
                                                    {{ business.name }}
                                                </p>
                                                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                                                    {{ business.bio || business.description || 'View business' }}
                                                </p>
                                                <!-- Rating -->
                                                <div v-if="business.rating" class="flex items-center gap-1 mt-1">
                                                    <svg class="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                    </svg>
                                                    <span class="text-xs text-slate-600 dark:text-slate-400">{{ business.rating.toFixed(1) }}</span>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <!-- Products Section -->
                                <div v-if="searchResults.products.length > 0">
                                    <h4 class="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 sticky top-0 bg-white dark:bg-slate-900 py-2 -mx-2 px-2 z-10">
                                        Products ({{ searchResults.products.length }})
                                    </h4>
                                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                                        <button 
                                            v-for="product in searchResults.products" 
                                            :key="product.id"
                                            @click="goToProductPage(product)"
                                            class="group cursor-pointer text-left w-full">
                                            <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                                                <div 
                                                    class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                                                    :style="{ backgroundImage: `url(${product.img_url})` }">
                                                </div>
                                            </div>
                                            <div class="pt-2">
                                                <h3 class="font-semibold text-xs sm:text-sm line-clamp-2">{{ product.item_name }}</h3>
                                                <p class="text-xs text-slate-600 dark:text-slate-400 truncate">{{ product.sellerName }}</p>
                                                <p class="font-bold mt-1 text-xs sm:text-sm">{{ product.priceDisplay }}</p>
                                                <!-- Ratings -->
                                                <div class="flex items-center mt-1">
                                                    <span v-for="n in 5" :key="n" class="text-yellow-500 text-xs">
                                                        <span v-if="n <= product.rating">★</span>
                                                        <span v-else class="text-gray-300 dark:text-gray-600">★</span>
                                                    </span>
                                                    <span class="ml-1 text-xs text-slate-500">{{ product.rating }}/5</span>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Empty State (no search query) -->
                            <div v-else class="text-center py-12 text-slate-400 dark:text-slate-500">
                                <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                                <p class="text-base sm:text-lg">Start typing to search for products or businesses</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

                <!-- Unified Backdrop -->
                <div 
                @click="$emit('close')"
                class="flex-1 fixed inset-0 z-40 backdrop-blur-md backdrop-brightness-90 bg-slate-900/40 dark:bg-slate-950/60 cursor-pointer">
                </div>
            </div>
    </transition>
    </teleport>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>