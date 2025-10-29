<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { user } from '@/store/user.js';
import { useCategories } from '@/composables/home/useCategories';
import { usePreferences } from '@/composables/signup/usePreferences';
import { useSearch } from '@/composables/useSearch';
import Loading from '@/components/status/Loading.vue'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter();

const topRatedBusiness = computed(() => {
    if (businesses.value.length === 0) return null
    
    // Find business with highest rating
    const sorted = [...businesses.value].sort((a, b) => {
        const ratingA = a.rating || 0
        const ratingB = b.rating || 0
        return ratingB - ratingA
    })
    
    return sorted[0]
})
const {
    loading,
    categories,
    businesses,
    selectedCategories,
    toggleCategory,
    toggleAll,
    isAllSelected,
    isCategorySelected,
    filteredBusinesses } = useCategories();

const {
    showPreferencePrompt,
    selectedPreferences,
    hasSubmittedPreference,
    togglePreferenceSelection,
    isPreferenceSelected,
    savePreference,
    skipPreference } = usePreferences(selectedCategories, categories);

const categoryHeading = computed(() => {
    return hasSubmittedPreference.value ? 'For You' : 'Categories';
});

const searchQuery = ref('');
const {
    isSearching,
    searchResults } = useSearch(searchQuery);

// Handle business card click in search results
function handleSearchBusinessClick(business) {
    goToBusinessPage(business)
}

// Only show edit button if user is logged in
const showEditPreferencesButton = computed(() => {
    return user.isLoggedIn && !showPreferencePrompt.value;
});

// Check if a category is in user's preferences
const isPreferredCategory = computed(() => {
    return (slug) => user.preferences.categories.includes(slug);
});

// Sort categories to show preferred ones first
const sortedCategories = computed(() => {
    if (!user.isLoggedIn || user.preferences.categories.length === 0) {
        return categories.value;
    }

    const preferred = categories.value.filter(c => user.preferences.categories.includes(c.slug));
    const others = categories.value.filter(c => !user.preferences.categories.includes(c.slug));
    return [...preferred, ...others];
});

// Clear all selected preferences
function clearAllPreferences() {
    selectedPreferences.value = [];
}

// Arrows for featured businesses
const scrollContainer = ref(null);
const scrollAmount = 300;
const canScroll = ref(false);

// Arrows for category buttons
const categoryScrollContainer = ref(null);
const categoryScrollAmount = 200;
const canScrollCategories = ref(false);


// Navigate to business page
function goToBusinessPage(business) {
    if (!business) {
        console.error('No business provided')
        return
    }
    
    // Try multiple possible UID fields
    const businessUid = business.uid || business.id || business.userId
    
    if (!businessUid) {
        console.error('Business has no UID:', business)
        return
    }
    
    console.log('Navigating to business:', businessUid)
    router.push(`/shop-details/${businessUid}`)
}

// Check if content overflows horizontally
function checkScrollable() {
    if (!scrollContainer.value) return;
    const el = scrollContainer.value;
    canScroll.value = el.scrollWidth > el.clientWidth;
}

// Check if category buttons overflow horizontally
function checkCategoryScrollable() {
  if (!categoryScrollContainer.value) return;
  const el = categoryScrollContainer.value;
  canScrollCategories.value = el.scrollWidth > el.clientWidth;
}

// Run on load, when filteredBusinesses changes, and when window resizes
onMounted(() => {
    checkScrollable();
    checkCategoryScrollable();
    window.addEventListener('resize', checkScrollable);
    window.addEventListener('resize', checkCategoryScrollable);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', checkScrollable);
    window.removeEventListener('resize', checkCategoryScrollable);
});

watch(filteredBusinesses, async () => {
    await nextTick();
    checkScrollable();
});

watch(sortedCategories, async () => {
    await nextTick();
    checkCategoryScrollable();
});

function scrollLeft() {
    scrollContainer.value.scrollBy({ left: -scrollAmount, behavior: "smooth" });
}

function scrollRight() {
    scrollContainer.value.scrollBy({ left: scrollAmount, behavior: "smooth" });
}

function scrollCategoriesLeft() {
    categoryScrollContainer.value.scrollBy({ left: -categoryScrollAmount, behavior: "smooth" });
}

function scrollCategoriesRight() {
    categoryScrollContainer.value.scrollBy({ left: categoryScrollAmount, behavior: "smooth" });
}
</script>

<template>
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-10">
            <div class="flex flex-col items-center gap-4 text-center">
                <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                    <span v-if="user.isLoggedIn">Welcome back, {{ user.name || 'Friend' }}! 👋</span>
                    <span v-else>Discover Home-Based Businesses</span>
                </h2>
                <p class="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                    <span v-if="user.isLoggedIn && user.preferences.categories.length > 0">
                        Here are businesses tailored to your preferences
                    </span>
                    <span v-else>
                        Explore a world of unique products and services, right from your neighborhood.
                    </span>
                </p>
                <div class="relative mt-4 w-full max-w-xl flex items-center gap-3">
                    <div class="relative flex-1">
                        <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <svg v-if="!isSearching" fill="currentColor" height="24" viewBox="0 0 256 256" width="24"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z">
                                </path>
                            </svg>
                            <svg v-else class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                        </span>
                        <input v-model="searchQuery"
                            class="h-14 w-full rounded-xl border-slate-300 bg-white pl-12 pr-4 text-lg text-slate-800 placeholder-slate-500 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:border-primary"
                            placeholder="Search for products or businesses..." type="text" />
                    </div>

                    <!-- Edit Preferences Icon Button (only for logged-in users) -->
                    <button v-if="showEditPreferencesButton" @click="showPreferencePrompt = true"
                        class="h-14 w-14 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                        title="Edit your preferences">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Search Results Section -->
            <div v-if="searchQuery.trim() && !loading"
                class="rounded-xl border border-primary/20 bg-white dark:bg-slate-900 p-6 shadow-lg">
                <h3 class="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Search Results</h3>
                
                <!-- Loading State -->
                <div v-if="isSearching" class="flex justify-center items-center py-8">
                    <Loading size="md" />
                </div>
                
                <!-- No Results -->
                <div v-else-if="searchResults.businesses.length === 0 && searchResults.products.length === 0"
                    class="text-center py-8 text-slate-500 dark:text-slate-400">
                    No results found for "{{ searchQuery }}". Try different keywords!
                </div>
                
                <!-- Results -->
                <div v-else class="space-y-6">
                    <!-- Businesses Section -->
                    <div v-if="searchResults.businesses.length > 0">
                        <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            Businesses ({{ searchResults.businesses.length }})
                        </h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <button 
                                v-for="business in searchResults.businesses" 
                                :key="business.id"
                                @click="handleSearchBusinessClick(business)"
                                class="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left group">
                                <img 
                                    :src="business.image" 
                                    :alt="business.name" 
                                    class="h-16 w-16 rounded-lg object-cover group-hover:scale-105 transition-transform" />
                                <div class="flex-1 min-w-0">
                                    <p class="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                        {{ business.name }}
                                    </p>
                                    <p class="text-sm text-slate-500 dark:text-slate-400 truncate">
                                        {{ business.bio || business.description || 'View business' }}
                                    </p>
                                    <!-- Rating -->
                                    <div v-if="business.rating" class="flex items-center gap-1 mt-1">
                                        <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
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
                        <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            Products ({{ searchResults.products.length }})
                        </h4>
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            <div 
                                v-for="product in searchResults.products" 
                                :key="product.id"
                                class="group">
                                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                                    <div 
                                        class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                                        :style="{ backgroundImage: `url(${product.img_url})` }">
                                    </div>
                                </div>
                                <div class="pt-2">
                                    <h3 class="font-semibold text-sm line-clamp-2">{{ product.item_name }}</h3>
                                    <p class="text-xs text-slate-600 dark:text-slate-400 truncate">{{ product.sellerName }}</p>
                                    <p class="font-bold mt-1 text-sm">{{ product.priceDisplay }}</p>
                                    <!-- Ratings -->
                                    <div class="flex items-center mt-1">
                                        <span v-for="n in 5" :key="n" class="text-yellow-500 text-xs">
                                            <span v-if="n <= product.rating">★</span>
                                            <span v-else class="text-gray-300 dark:text-gray-600">★</span>
                                        </span>
                                        <span class="ml-1 text-xs text-slate-500">{{ product.rating }}/5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- User Preference Prompt (only for logged-in first-time users) -->
            <div v-if="showPreferencePrompt"
                class="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-lg dark:border-primary/30 dark:from-primary/10 dark:to-primary/20">
                <div class="flex flex-col items-center gap-4 text-center">
                    <div class="rounded-full bg-primary/10 p-3">
                        <svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" stroke-width="2"
                            viewBox="0 0 24 24">
                            <path
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 class="mb-2 text-xl font-bold text-slate-900 dark:text-white">What are your favorite
                            categories?</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-400">Select multiple categories to personalize
                            your experience</p>
                    </div>
                    <div class="flex w-full max-w-2xl flex-col gap-3">
                        <div class="flex flex-wrap gap-2 justify-center">
                            <button v-for="category in categories" :key="category.slug"
                                @click="togglePreferenceSelection(category.slug)" :class="[
                                    'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                                    isPreferenceSelected(category.slug)
                                        ? 'bg-primary text-white hover:bg-primary/90'
                                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700'
                                ]">
                                {{ category.name }}
                            </button>
                        </div>

                        <!-- Clear All button (only show if there are selections) -->
                        <div v-if="selectedPreferences.length > 0" class="text-center">
                            <button @click="clearAllPreferences"
                                class="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline">
                                Clear all selections
                            </button>
                        </div>

                        <div class="flex gap-2 justify-center">
                            <button @click="savePreference"
                                class="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition-all hover:bg-primary/90">
                                {{ selectedPreferences.length > 0 ? 'Save Preferences' : 'Clear All Preferences' }}
                            </button>
                            <button @click="skipPreference"
                                class="rounded-lg px-6 py-2.5 font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-600">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="loading" class="flex justify-center items-center min-h-[300px]">
                <Loading size="lg" />
            </div>

            <template v-if="!loading">
                <!-- Categories Section with Horizontal Scroll -->
                <div>
                    <h3 class="mb-4 text-2xl font-bold text-slate-900 dark:text-white">{{ categoryHeading }}</h3>
                    <div class="relative flex items-center gap-3">
                        <!-- Static "All" Button -->
                        <button :class="[
                            'rounded-lg px-4 py-2 text-sm font-medium transition-colors shrink-0',
                            isAllSelected
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30'
                        ]" @click="toggleAll">
                            All
                        </button>

                        <!-- Scrollable Categories Container -->
                        <div class="relative flex-1 min-w-0">
                            <!-- Left Arrow for Categories -->
                            <button
                                v-if="canScrollCategories"
                                @click="scrollCategoriesLeft"
                                class="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/95 p-2 shadow-lg hover:bg-white dark:bg-slate-800/95 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors backdrop-blur-sm"
                                aria-label="Scroll categories left">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>

                            <!-- Category Buttons Scroll Container -->
                            <div
                                ref="categoryScrollContainer"
                                class="hide-scrollbar flex gap-3 overflow-x-auto scroll-smooth"
                                :class="{ 'pl-10': canScrollCategories, 'pr-10': canScrollCategories }">
                                <button
                                    v-for="category in sortedCategories" 
                                    :key="category.slug"
                                    :class="[
                                        'rounded-lg px-4 py-2 text-sm font-medium transition-colors shrink-0 whitespace-nowrap',
                                        isCategorySelected(category.slug)
                                            ? 'bg-primary text-white hover:bg-primary/90' 
                                            : 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30'
                                    ]"
                                    @click="toggleCategory(category.slug)">
                                    <span class="flex items-center gap-1.5">
                                        <!-- Heart icon for preferred categories -->
                                        <svg v-if="isPreferredCategory(category.slug)" class="h-3.5 w-3.5"
                                            fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        {{ category.name }}
                                    </span>
                                </button>
                            </div>

                            <!-- Right Arrow for Categories -->
                            <button
                                v-if="canScrollCategories"
                                @click="scrollCategoriesRight"
                                class="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/95 p-2 shadow-lg hover:bg-white dark:bg-slate-800/95 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors backdrop-blur-sm"
                                aria-label="Scroll categories right">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Featured Businesses -->
                <div>
                    <h3 class="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Featured Businesses</h3>
                    <div v-if="filteredBusinesses.length === 0"
                        class="text-center py-12 text-slate-500 dark:text-slate-400">
                        No businesses found for the selected categories. Try selecting different categories!
                    </div>
                    <div v-else class="relative">
                        <!-- Left Arrow -->
                        <button v-if="canScroll" @click="scrollLeft"
                            class="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors backdrop-blur-sm"
                            aria-label="Scroll left">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>

                        <!-- Scroll Container -->
                        <div ref="scrollContainer"
                            class="hide-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scroll-smooth">
                            <RouterLink :to="`/shop-details/${business.uid}`"
                                v-for="business in filteredBusinesses" :key="business.name"
                                :data-business="business.name"
                                class="flex w-64 shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-md dark:bg-slate-900 transition-transform hover:scale-105">
                                <img :src="business.image" :alt="business.name" class="h-40 w-full object-cover" />
                                <p class="px-4 py-3 text-base font-semibold text-slate-800 dark:text-slate-200">
                                    {{ business.name }}
                                </p>
                            </RouterLink>
                        </div>

                        <!-- <div ref="scrollContainer"
                            class="hide-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scroll-smooth">
                            <RouterLink v-for="business in filteredBusinesses" :key="business.id || business.name"
                                :to="{ name: 'ProductDetails', params: { id: business.id } }"
                                :data-business="business.name"
                                class="flex w-64 shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-md dark:bg-slate-900 transition-transform hover:scale-105 cursor-pointer">
                                <img :src="business.image" :alt="business.name" class="h-40 w-full object-cover" />
                                <p class="px-4 py-3 text-base font-semibold text-slate-800 dark:text-slate-200">
                                    {{ business.name }}
                                </p>
                            </RouterLink>
                        </div> -->

                        <!-- Right Arrow -->
                        <button v-if="canScroll" @click="scrollRight"
                            class="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors backdrop-blur-sm"
                            aria-label="Scroll right">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Special Recommendation -->
                <div>
                    <h3 class="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Special Recommendation</h3>
                    
                    <!-- Show loading state -->
                    <div v-if="loading" class="@container overflow-hidden rounded-xl bg-white shadow-lg dark:bg-slate-900 p-12 text-center">
                        <Loading size="md" />
                    </div>
                    
                    <!-- Show "No businesses" state -->
                    <div v-else-if="!topRatedBusiness" class="@container overflow-hidden rounded-xl bg-white shadow-lg dark:bg-slate-900 p-12 text-center">
                        <p class="text-slate-500 dark:text-slate-400">No businesses available yet</p>
                    </div>
                    
                    <!-- Show top-rated business -->
                    <div v-else class="@container overflow-hidden rounded-xl bg-white shadow-lg dark:bg-slate-900">
                        <div class="flex flex-col @[50rem]:flex-row">
                            <img 
                                :alt="topRatedBusiness.name" 
                                class="h-64 w-full object-cover @[50rem]:h-auto @[50rem]:w-1/2"
                                :src="topRatedBusiness.image || topRatedBusiness.profilePic || '/placeholder.png'" />
                            <div class="flex flex-col justify-center p-6 @[50rem]:w-1/2 @[50rem]:p-8">
                                <h4 class="text-2xl font-bold text-slate-900 dark:text-white">
                                    {{ topRatedBusiness.name }}
                                </h4>
                                <p class="mt-2 text-slate-600 dark:text-slate-400">
                                    {{ topRatedBusiness.bio || topRatedBusiness.description || 'Discover amazing products and services from this top-rated business.' }}
                                </p>
                                
                                <!-- Rating display -->
                                <div v-if="topRatedBusiness.rating" class="mt-3 flex items-center gap-2">
                                    <div class="flex items-center">
                                        <svg v-for="n in 5" :key="n" 
                                            class="w-5 h-5"
                                            :class="n <= topRatedBusiness.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                                            fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                        </svg>
                                    </div>
                                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        {{ topRatedBusiness.rating.toFixed(1) }} / 5.0
                                    </span>
                                </div>
                                
                                <button
                                    @click="goToBusinessPage(topRatedBusiness)"
                                    class="mt-6 w-full rounded-lg bg-primary px-6 py-3 text-base font-bold text-white shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 sm:w-auto transition-all hover:scale-105">
                                    Shop Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </main>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}

.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}
</style>