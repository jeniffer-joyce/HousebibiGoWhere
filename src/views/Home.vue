<script setup>
import { ref, computed } from 'vue';
import { user } from '@/store/user.js';
import { useCategories } from '@/composables/home/useCategories';
import { usePreferences } from '@/composables/signup/usePreferences';
import { useSearch } from '@/composables/useSearch';
import Loading from '@/components/status/Loading.vue'
import { RouterLink } from 'vue-router'

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
    searchSuggestions,
    selectSuggestion } = useSearch(searchQuery, businesses, selectedCategories);

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

// Arrows
const scrollContainer = ref(null);
const scrollAmount = 300;

function scrollLeft() {
    scrollContainer.value.scrollBy({ left: -scrollAmount, behavior: "smooth" });
}

function scrollRight() {
    scrollContainer.value.scrollBy({ left: scrollAmount, behavior: "smooth" });
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
                <div v-if="isSearching" class="flex justify-center items-center py-8">
                    <Loading size="md" />
                </div>
                <div v-else-if="searchSuggestions.length === 0"
                    class="text-center py-8 text-slate-500 dark:text-slate-400">
                    No businesses found matching "{{ searchQuery }}". Try different keywords!
                </div>
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button v-for="business in searchSuggestions" :key="business.name"
                        @click="selectSuggestion(business)"
                        class="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left">
                        <img :src="business.image" :alt="business.name" class="h-16 w-16 rounded-lg object-cover" />
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold text-slate-800 dark:text-slate-200 truncate">{{ business.name }}</p>
                            <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ business.description ||
                                'Click to view' }}</p>
                        </div>
                    </button>
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
                <!-- Categories Section -->
                <div>
                    <h3 class="mb-4 text-2xl font-bold text-slate-900 dark:text-white">{{ categoryHeading }}</h3>
                    <div class="flex flex-wrap gap-3">
                        <!-- All Button -->
                        <button :class="[
                            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                            isAllSelected
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30'
                        ]" @click="toggleAll">
                            All
                        </button>

                        <!-- Category Buttons (sorted with preferences first) -->
                        <button v-for="category in sortedCategories" :key="category.slug" :class="[
                            'rounded-lg px-4 py-2 text-sm font-medium transition-colors relative',
                            isCategorySelected(category.slug)
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30'
                        ]" @click="toggleCategory(category.slug)">
                            <span class="flex items-center gap-1.5">
                                <!-- Heart icon for preferred categories -->
                                <svg v-if="isPreferredCategory(category.slug)" class="h-3.5 w-3.5" fill="currentColor"
                                    viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                        clip-rule="evenodd"></path>
                                </svg>
                                {{ category.name }}
                            </span>
                        </button>
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
                        <button @click="scrollLeft"
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
                            <div v-for="business in filteredBusinesses" :key="business.name"
                                :data-business="business.name"
                                class="flex w-64 shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-md dark:bg-slate-900 transition-transform hover:scale-105">
                                <img :src="business.image" :alt="business.name" class="h-40 w-full object-cover" />
                                <p class="px-4 py-3 text-base font-semibold text-slate-800 dark:text-slate-200">
                                    {{ business.name }}
                                </p>
                            </div>
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
                        <button @click="scrollRight"
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
                    <div class="@container overflow-hidden rounded-xl bg-white shadow-lg dark:bg-slate-900">
                        <div class="flex flex-col @[50rem]:flex-row">
                            <img alt="The Cozy Corner" class="h-64 w-full object-cover @[50rem]:h-auto @[50rem]:w-1/2"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFRZNjbZkOjY-nw6l4nK6s-SBPbftnfdmu2nA6gyBQ1WQKSnxiY7aagZXYAF06NRs7uHncvFB7mMryoEayxMObeitafO5JfXfslNdViTa5XD7JDnHCWCe5LIzWESRahw21-nBtE5Iw20jNHe0iTlNgKOiqvpz0Tu4dYgMlb-20FUSPpej063dLJnNm4ufEkA7mIJLojJ6Hv9a2BdKMD9Y-8DftLijkGux_dP0zoRcvSI4SNH04WC3jIOkH_gbFIVs698CttmsMJbKO" />
                            <div class="flex flex-col justify-center p-6 @[50rem]:w-1/2 @[50rem]:p-8">
                                <h4 class="text-2xl font-bold text-slate-900 dark:text-white">The Cozy Corner</h4>
                                <p class="mt-2 text-slate-600 dark:text-slate-400">
                                    Discover unique handmade crafts and home decor items that add warmth and
                                    personality to your space.
                                </p>
                                <button
                                    class="mt-6 w-full rounded-lg bg-primary px-6 py-3 text-base font-bold text-white shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 sm:w-auto">
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