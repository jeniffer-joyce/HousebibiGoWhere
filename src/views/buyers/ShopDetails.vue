<template>
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center min-h-[320px]">
            <Loading />
        </div>

        <!-- Content -->
        <div v-else class="max-w-5xl mx-auto">
            <!-- ===================== Profile Card ===================== -->
            <div
                class="flex flex-col items-center text-center p-6 bg-creamy-white dark:bg-gray-800/50 rounded-xl shadow-sm">
                <div class="relative mb-4">
                    <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32"
                        :style="{ backgroundImage: `url('${business.profilePic}')` }"></div>
                </div>

                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                    <span class="inline-flex items-center gap-2">
                        {{ business.name }}
                        <span v-if="business.verified" class="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full
                     bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 align-middle"
                            title="Verified UEN - A trusted, registered business">
                            <span class="material-symbols-outlined text-base leading-none">verified</span>
                            Verified

                        </span>
                    </span>
                </h1>

                <p class="mt-2 text-gray-600 dark:text-gray-400">
                    {{ business.description || 'No bio yet.' }}
                </p>

                <p class="mt-2 text-gray-600 dark:text-gray-400">
                    <span class="material-symbols-outlined text-lg text-red-500">location_on</span>
                    Located @ {{ business.address || '—' }}
                </p>


                <div class="flex flex-wrap items-center justify-center gap-2 mt-2 text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-lg text-yellow-500">star</span>
                    <span class="font-medium">{{ displayRating }} / 5.0</span>
                    <span class="text-gray-400 dark:text-gray-600">·</span>
                    <span>{{ followingCount }} Following</span>
                    <span class="text-gray-400 dark:text-gray-600">·</span>
                    <span>{{ followersCount }} Followers</span>
                </div>
                <button
                    class="mt-4 flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-sm hover:bg-opacity-90 transition-colors">Follow</button>
            </div>
            <div class="mt-8">
                <div class="border-b border-primary/20">
                    <nav aria-label="Tabs" class="-mb-px flex space-x-8">
                        <a class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-background-dark/60 dark:text-background-light/60 hover:text-primary hover:border-primary/50 dark:hover:border-primary/50"
                            href="#"> About </a>
                        <a aria-current="page"
                            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-primary text-primary"
                            href="#"> Products </a>
                        <a class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-background-dark/60 dark:text-background-light/60 hover:text-primary hover:border-primary/50 dark:hover:border-primary/50"
                            href="#"> Reviews </a>
                    </nav>
                </div>
            </div>
            <section class="mt-10 overflow-visible">
                <h2 class="text-2xl font-bold text-background-dark dark:text-background-light mb-6">Best Selling
                </h2>
                <TransitionGroup tag="div" name="fade" v-if="topProducts.length > 0"
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div v-for="product in topProducts" :key="product.productId"
                        class="group flex flex-col rounded-lg overflow-hidden bg-white dark:bg-background-dark/50 shadow-sm transition-shadow hover:shadow-lg">
                        <div class="w-full bg-center bg-no-repeat aspect-square bg-cover bg-gray-200"
                            :style="`background-image: url('${product.imageUrl}')`" />
                        <div class="p-4 flex-1 flex flex-col">
                            <h3 class="text-base font-semibold text-background-dark dark:text-background-light">
                                {{ product.name }}
                            </h3>
                            <p class="text-sm text-background-dark/70 dark:text-background-light/70 mt-auto pt-2">
                                {{
                                    Array.isArray(product.price)
                                        ? `$${Math.min(...product.price)}+`
                                        : `$${product.price}`
                                }}
                            </p>
                            <p class="text-xs text-background-dark/50 dark:text-background-light/50 mt-1">
                                {{ product.totalSales }} sold
                            </p>
                        </div>
                    </div>
                </TransitionGroup>

                <div v-else class="text-center py-8 text-background-dark/70 dark:text-background-light/70">
                    No products sold yet
                </div>

                <div class="mt-8 flex justify-center">
                    <button @click="viewAllProducts"
                        class="flex items-center justify-center rounded-lg h-10 px-6 bg-primary/10 dark:bg-primary/20 text-primary text-sm font-bold hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                        {{ showAll ? 'Collapse' : 'View All Products' }}
                    </button>
                </div>
            </section>
            <section class="mt-12">
                <h2 class="text-2xl font-bold text-background-dark dark:text-background-light mb-6">Customer Reviews
                </h2>
                <div class="space-y-8">
                    <div class="flex flex-col gap-3 p-4 rounded-lg bg-white dark:bg-background-dark/50 shadow-sm">
                        <div class="flex items-center gap-3">
                            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                                style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDDXSJSZps974dSmZos44bQ4fkVJvtVwiH3d7TXHIdpmz3GwZlK5Ntcd1NJUcd-6g8bZUiLD4FGP3Ja7r8X6IsNfzOC5XwSlD8dTS321IodUu8SSmC11Tq1cQeJzFXpCYuVrirtXgVOFcibUQPIXcF3hWDvx9TuHppAF5yqeA1RxWVPfk37kj-r25aJA2rksTLnAN3FPKU7WhoUuGS1vS19-C6IXVkli9flviCrfkgBLGJeFcgIi6Cs-jamK7CGv9BsGEFvtoldckBo");'>
                            </div>
                            <div class="flex-1">
                                <p class="text-sm font-semibold text-background-dark dark:text-background-light">Sophia
                                </p>
                                <p class="text-xs text-background-dark/60 dark:text-background-light/60">2 weeks ago</p>
                            </div>
                        </div>
                        <div class="flex gap-0.5 text-primary">
                            <span class="material-symbols-outlined text-base">star</span>
                            <span class="material-symbols-outlined text-base">star</span>
                            <span class="material-symbols-outlined text-base">star</span>
                            <span class="material-symbols-outlined text-base">star</span>
                            <span class="material-symbols-outlined text-base">star</span>
                        </div>
                        <p class="text-sm text-background-dark/80 dark:text-background-light/80">
                            Absolutely love the throw blanket I purchased! It's so soft and cozy, perfect for chilly
                            evenings. The quality is excellent, and the craftsmanship is evident. Highly recommend!
                        </p>
                    </div>
                    <div class="flex flex-col gap-3 p-4 rounded-lg bg-white dark:bg-background-dark/50 shadow-sm">
                        <div class="flex items-center gap-3">
                            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                                style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuA8OR5kpRLPMky4F6t0lMZm_G4o3WNgP5M2uxKWJOXHUyFAaPDwUeDLt4Ccv0wKiDKya4MeGm_74lmKLI9NvPiLZKzWnba2oD1o1ZL_Afqsi5i7W-5lGuBScMWHOwS0EDvBKl2irDcYgCRkkN-a1TGVYlBP-JL_jYT_IPwayaoPvWhuKn3U-j4Yh_e2ocWCZHpuotpk7cFjIEXfpbKKcSCiFtyCvYN3LN-qp8ASWis8dCVAk4NDpEE7O7Fnm_BtGuz5d2b01ljaIOFn");'>
                            </div>
                            <div class="flex-1">
                                <p class="text-sm font-semibold text-background-dark dark:text-background-light">Ethan
                                </p>
                                <p class="text-xs text-background-dark/60 dark:text-background-light/60">1 month ago</p>
                            </div>
                        </div>
                        <div class="flex gap-0.5">
                            <span class="material-symbols-outlined text-base text-primary">star</span>
                            <span class="material-symbols-outlined text-base text-primary">star</span>
                            <span class="material-symbols-outlined text-base text-primary">star</span>
                            <span class="material-symbols-outlined text-base text-primary">star</span>
                            <span
                                class="material-symbols-outlined text-base text-background-dark/30 dark:text-background-light/30">star</span>
                        </div>
                        <p class="text-sm text-background-dark/80 dark:text-background-light/80">
                            The scented candles are lovely, but the scent could be a bit stronger. Overall, a good
                            product
                            for the price.
                        </p>
                    </div>
                    <div class="flex flex-col gap-3 p-4 rounded-lg bg-white dark:bg-background-dark/50 shadow-sm">
                        <div class="flex items-center gap-3">
                            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                                style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBDXu2pguYR7AezNQUFVJpWpYk048Zh5-5JBnNGcZCQgEmSuYW52uOeSm82u56G4oOAjXKNN0XyVrb_dmTVv-w0yIvE2VUl4bYITx0EatHHHgB8jlZbwSHNARNDW2cpxByTgLKB7BKkA-4iuKoV0c10lexiYhiYN72V5QkvdLqwHZiaNpZdUp7imVopNqsMxX5hcom67-6qB-PZt2TXrqxu1iD-FG2AqaEFzLAvZbyYNyWZAQxfpHci5DgfeAox8aFxS9N72PSw_4FJ");'>
                            </div>
                            <div class="flex-1">
                                <p class="text-sm font-semibold text-background-dark dark:text-background-light">Olivia
                                </p>
                                <p class="text-xs text-background-dark/60 dark:text-background-light/60">2 months ago
                                </p>
                            </div>
                        </div>
                        <div class="flex gap-0.5 text-primary">
                            <span class="material-symbols-outlined text-base">star</span>
                            <span class="material-symbols-outlined text-base">star</span>
                            <span class="material-symbols-outlined text-base">star</span>
                            <span class="material-symbols-outlined text-base">star</span>
                            <span class="material-symbols-outlined text-base">star</span>
                        </div>
                        <p class="text-sm text-background-dark/80 dark:text-background-light/80">
                            The artisan soap set is a fantastic gift! The soaps smell amazing and are beautifully
                            packaged.
                            The recipient was thrilled. Will definitely order again.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    </main>
</template>

<style scoped>
/* Fade + scale transition for the product cards */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

<script setup>
import { getBusinesses } from '@/firebase/services/home/business.js';
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import Loading from '@/components/status/Loading.vue';
import defaultProfilePic from '@/assets/defaultBusinessLogo.png'
import { getSellerProductsSortedBySales } from '@/composables/productUtils.js';

const route = useRoute();
const uid = route.params.id; // Get the dynamic :id from URL

const business = ref(null);

const allProducts = ref([]); // all sorted products
const showAll = ref(false); // toggle for "View All"

const loading = ref(true);

const topProducts = computed(() => {
    return showAll.value ? allProducts.value : allProducts.value.slice(0, 3);
});

onMounted(async () => {
    const businesses = await getBusinesses();
    business.value = businesses.find(b => b.uid === uid);

    // Load top-selling product data
    try {
        // Fetch top 3 products
        allProducts.value = await getSellerProductsSortedBySales(uid);
    } catch (error) {
        console.error('Error loading products:', error);
    } finally {
        loading.value = false;
    }
});

const viewAllProducts = () => {
    showAll.value = !showAll.value;
};

// Style for profile picture background image
// const profilePicStyle = computed(() => {
//     return `background-image: url(${business.value?.profilePic || defaultProfilePic})`  // Default image if no profilePic
// });


// Derived seller rating
const displayRating = computed(() => {
    const n = Number(business.value?.rating)
    return Number.isFinite(n) ? n.toFixed(1) : '0.0'
})

// NEW: Followers / Following counters (safe defaults)
const followersCount = computed(() => Number(business.value?.followers ?? 0))
const followingCount = computed(() => Number(business.value?.following ?? 0))
</script>