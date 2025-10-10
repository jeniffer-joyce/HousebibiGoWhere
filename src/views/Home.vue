<script setup>
import { onMounted, ref, computed } from 'vue';
import { getCategories } from '@/firebase/services/home/categories.js';
import { getBusinesses } from '@/firebase/services/home/business.js';
import Loading from '@/components/status/Loading.vue'

const categories = ref([]);
const businesses = ref([]);
const selectedCategories = ref([]); // Changed to array for multiple selections
const loading = ref(true);

// Preference prompt state
const showPreferencePrompt = ref(true); // Always show on visit
const selectedPreferences = ref([]); // Changed to array for multiple interests
const hasSubmittedPreference = ref(false); // Track if user submitted preference this session

// Category labels mapping
const categoryLabels = {
    'food': 'Food & Beverages',
    'crafts': 'Handmade Crafts',
    'beauty': 'Beauty & Wellness',
    'services': 'Home Services',
    'fashion': 'Fashion & Accessories',
    'education': 'Education & Tutoring',
    'tech': 'Tech & Digital Services',
    'other': 'Other'
};

// Arrows
const scrollContainer = ref(null);
const scrollAmount = 300; // Amount of pixels to scroll per click

function scrollLeft() {
    scrollContainer.value.scrollBy({ left: -scrollAmount, behavior: "smooth" });
}

function scrollRight() {
    scrollContainer.value.scrollBy({ left: scrollAmount, behavior: "smooth" });
}

onMounted(async () => {
    try {
        const [cats, biz] = await Promise.all([getCategories(), getBusinesses()])
        categories.value = cats;
        businesses.value = biz;
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
});

const filteredBusinesses = computed(() => {
    if (selectedCategories.value.length === 0) return businesses.value
    
    // Sort businesses so that the most recently selected category appears last (on the right)
    const result = businesses.value.filter(b => selectedCategories.value.includes(b.category));
    
    // Sort by the order of selection - businesses from the most recently selected category appear last
    return result.sort((a, b) => {
        const aIndex = selectedCategories.value.indexOf(a.category);
        const bIndex = selectedCategories.value.indexOf(b.category);
        return aIndex - bIndex;
    });
});

const categoryHeading = computed(() => {
    return hasSubmittedPreference.value ? 'For You' : 'Categories';
});

const toggleCategory = (categorySlug) => {
    const index = selectedCategories.value.indexOf(categorySlug);
    if (index === -1) {
        selectedCategories.value.push(categorySlug);
    } else {
        // If it's the last selected category, unselecting it means "All"
        if (selectedCategories.value.length === 1) {
            selectedCategories.value = [];
        } else {
            selectedCategories.value.splice(index, 1);
        }
    }
};

const toggleAll = () => {
    selectedCategories.value = [];
};

const isAllSelected = computed(() => {
    return selectedCategories.value.length === 0;
});

const isCategorySelected = (categorySlug) => {
    return selectedCategories.value.includes(categorySlug);
};

const togglePreferenceSelection = (value) => {
    const index = selectedPreferences.value.indexOf(value);
    if (index === -1) {
        selectedPreferences.value.push(value);
    } else {
        selectedPreferences.value.splice(index, 1);
    }
};

const isPreferenceSelected = (value) => {
    return selectedPreferences.value.includes(value);
};

const savePreference = () => {
    if (selectedPreferences.value.length > 0) {
        // Find matching category slugs from fetched categories
        selectedCategories.value = categories.value
            .filter(cat => {
                // Try to match by checking if preference keywords are in the category name or slug
                return selectedPreferences.value.some(pref => {
                    const prefLower = pref.toLowerCase();
                    const catNameLower = cat.name.toLowerCase();
                    const catSlugLower = cat.slug.toLowerCase();
                    return catNameLower.includes(prefLower) || 
                           catSlugLower.includes(prefLower) ||
                           prefLower.includes(catNameLower.split(' ')[0].toLowerCase());
                });
            })
            .map(cat => cat.slug);
        
        hasSubmittedPreference.value = true;
        showPreferencePrompt.value = false;
    }
};

const skipPreference = () => {
    selectedCategories.value = [];
    hasSubmittedPreference.value = false;
    showPreferencePrompt.value = false;
};
</script>

<template>
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-10">
            <div class="flex flex-col items-center gap-4 text-center">
                <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                    Discover Home-Based Businesses
                </h2>
                <p class="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                    Explore a world of unique products and services, right from your neighborhood.
                </p>
                <div class="relative mt-4 w-full max-w-xl flex items-center gap-3">
                    <div class="relative flex-1">
                        <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z">
                                </path>
                            </svg>
                        </span>
                        <input
                            class="h-14 w-full rounded-xl border-slate-300 bg-white pl-12 pr-4 text-lg text-slate-800 placeholder-slate-500 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:border-primary"
                            placeholder="Search for products or businesses" type="text" />
                    </div>
                    
                    <!-- Edit Preferences Icon Button -->
                    <button 
                        v-if="!showPreferencePrompt"
                        @click="showPreferencePrompt = true"
                        class="h-14 w-14 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                        title="Edit your preferences">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- User Preference Prompt -->
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
                        <h3 class="mb-2 text-xl font-bold text-slate-900 dark:text-white">What are your favorite categories?</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-400">Select multiple categories to personalize your experience</p>
                    </div>
                    <div class="flex w-full max-w-2xl flex-col gap-3">
                        <div class="flex flex-wrap gap-2 justify-center">
                            <button
                                v-for="(label, value) in categoryLabels"
                                :key="value"
                                @click="togglePreferenceSelection(value)"
                                :class="[
                                    'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                                    isPreferenceSelected(value)
                                        ? 'bg-primary text-white hover:bg-primary/90'
                                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700'
                                ]">
                                {{ label }}
                            </button>
                        </div>
                        <div class="flex gap-2 justify-center">
                            <button @click="savePreference" :disabled="selectedPreferences.length === 0"
                                class="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
                                Save Preferences
                            </button>
                            <button @click="skipPreference"
                                class="rounded-lg px-6 py-2.5 font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-600">
                                Skip
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
                        <button
                            :class="[
                                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                                isAllSelected
                                    ? 'bg-primary text-white hover:bg-primary/90' 
                                    : 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30'
                            ]"
                            @click="toggleAll">
                            All
                        </button>
                        
                        <!-- Category Buttons -->
                        <button
                            v-for="category in categories" 
                            :key="category.slug"
                            :class="[
                                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                                isCategorySelected(category.slug)
                                    ? 'bg-primary text-white hover:bg-primary/90' 
                                    : 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30'
                            ]"
                            @click="toggleCategory(category.slug)">
                            {{ category.name }}
                        </button>
                    </div>
                </div>

                <!-- Featured Businesses -->
                <div>
                    <h3 class="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Featured Businesses</h3>
                    <div v-if="filteredBusinesses.length === 0" class="text-center py-12 text-slate-500 dark:text-slate-400">
                        No businesses found for the selected categories. Try selecting different categories!
                    </div>
                    <div v-else class="relative">
                        <!-- Left Arrow -->
                        <button
                            @click="scrollLeft"
                            class="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors backdrop-blur-sm"
                            aria-label="Scroll left">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>

                        <!-- Scroll Container -->
                        <div
                            ref="scrollContainer"
                            class="hide-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scroll-smooth">
                            <div v-for="business in filteredBusinesses" :key="business.name"
                                class="flex w-64 shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-md dark:bg-slate-900">
                                <img :src="business.image" :alt="business.name" class="h-40 w-full object-cover" />
                                <p class="px-4 py-3 text-base font-semibold text-slate-800 dark:text-slate-200">
                                    {{ business.name }}
                                </p>
                            </div>
                        </div>

                        <!-- Right Arrow -->
                        <button
                            @click="scrollRight"
                            class="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors backdrop-blur-sm"
                            aria-label="Scroll right">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
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
</style>