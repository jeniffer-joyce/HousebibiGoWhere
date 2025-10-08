<script setup>
import { onMounted, ref, computed } from 'vue';
import { getCategories } from '@/firebase/services/home/categories.js';
import { getBusinesses } from '@/firebase/services/home/business.js';
import Loading from '@/components/status/Loading.vue'


const categories = ref([]);
const businesses = ref([]);
const selectedCategory = ref('all');
const loading = ref(true)


onMounted(async () => { // same as window.addEventListener("DOMContentLoaded", ()
    // categories.value = await getCategories();
    // businesses.value = await getBusinesses();
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
    if (selectedCategory.value === 'all') return businesses.value
    return businesses.value.filter(b => b.category === selectedCategory.value)
})
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
                <div class="relative mt-4 w-full max-w-xl">
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
            </div>
            <div v-if="loading" class="flex justify-center items-center min-h-[300px]">
                <Loading size="lg"/>
            </div>
            <div v-else>
                <div>
                    <h3 class="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Categories</h3>
                    <div class="flex flex-wrap gap-3">
                        <button
                            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                            @click="selectedCategory = 'all'">
                            All
                        </button>
                        <button v-for="category in categories" :key="category.slug"
                            class="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30 transition-colors"
                            @click="selectedCategory = category.slug">
                            {{ category.name }}
                        </button>
                    </div>
                </div>

                <!-- Featured Businesses -->
                <div>
                    <h3 class="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Featured Businesses</h3>
                    <div
                        class="hide-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                        <div v-for="business in filteredBusinesses" :key="business.name"
                            class="flex w-64 shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-md dark:bg-slate-900">
                            <img :src="business.image" :alt="business.name" class="h-40 w-full object-cover" />
                            <p class="px-4 py-3 text-base font-semibold text-slate-800 dark:text-slate-200">
                                {{ business.name }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
        </div>
    </main>
</template>
