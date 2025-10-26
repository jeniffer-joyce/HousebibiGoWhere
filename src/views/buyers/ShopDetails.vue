<template>
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center min-h-[320px]">
            <Loading />
        </div>

        <!-- Content -->
        <div v-else class=" ">
            <!-- ===================== Profile Card ===================== -->
            <div
                class=" max-w-5xl mx-auto flex flex-col items-center text-center p-6 bg-creamy-white dark:bg-gray-800/50 rounded-xl shadow-sm">
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
                    {{ business.description || 'No description.' }}
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
            <!-- Mobile Sidebar Toggle (hamburger)
            <div class="sm:hidden flex justify-between items-center gap-8 mt-8 px-4 py-2">
                <button @click="sidebarOpen = !sidebarOpen" class="text-primary focus:outline-none">
                    <span class="material-symbols-outlined text-2xl">
                        {{ sidebarOpen ? 'close' : 'menu' }}
                    </span>
                </button>
                <h2 class="text-base font-semibold text-background-dark dark:text-background-light">
                    Menu
                </h2>
            </div> -->
            <!-- Mobile Horizontal Menu -->
            <nav
                class="sm:hidden sticky z-40 dark:bg-gray-800/80 backdrop-blur-md border-y border-gray-200 dark:border-gray-700 flex justify-center gap-6 py-2 text-sm font-medium text-background-dark dark:text-background-light
                 transition-transform duration-300 ease-in-out"
                :class="showTopNav ? 'top-16 mt-10' : 'top-0 mt-0'">
                <button v-for="section in ['about', 'products', 'reviews']" :key="section"
                    @click="scrollToSection(section)" :class="[
                        activeSection === section
                            ? 'text-primary font-semibold'
                            : 'text-background-dark/70 dark:text-background-light/70 hover:text-primary',
                        'transition-colors',
                    ]">
                    {{ section.charAt(0).toUpperCase() + section.slice(1) }}
                </button>
            </nav>
            <div class="flex max-w-5xl mx-auto gap-8 mt-8">
                <!-- Sidebar -->
                <aside :class="[
                    'w-48 flex-shrink-0 sm:block',
                    sidebarOpen ? 'block' : 'hidden',
                    'sticky top-32 self-start'
                ]">
                    <nav aria-label="Sidebar" class="flex flex-col space-y-4 border-r border-primary/20 pr-4">
                        <a href="javascript:void(0)" @click="scrollToSection('about')" :class="[
                            'py-2 font-medium text-sm',
                            activeSection === 'about'
                                ? 'text-primary border-l-4 border-primary pl-2 bg-primary/5'
                                : 'text-background-dark/60 dark:text-background-light/60 hover:text-primary'
                        ]">About</a>

                        <a href="javascript:void(0)" @click="scrollToSection('products')" :class="[
                            'py-2 font-medium text-sm',
                            activeSection === 'products'
                                ? 'text-primary border-l-4 border-primary pl-2 bg-primary/5'
                                : 'text-background-dark/60 dark:text-background-light/60 hover:text-primary'
                        ]">Products</a>

                        <a href="javascript:void(0)" @click="scrollToSection('reviews')" :class="[
                            'py-2 font-medium text-sm',
                            activeSection === 'reviews'
                                ? 'text-primary border-l-4 border-primary pl-2 bg-primary/5'
                                : 'text-background-dark/60 dark:text-background-light/60 hover:text-primary'
                        ]">Reviews</a>
                    </nav>
                </aside>
                <div>
                    <section class="mt-10" id="about">
                        <h2 class="text-2xl font-bold text-background-dark dark:text-background-light mb-6">About
                        </h2>
                        {{ business.bio || 'No bio yet.' }}
                    </section>
                    <section class="mt-10" id="products">
                        <h2 v-if="showAll"
                            class="text-2xl font-bold text-background-dark dark:text-background-light mb-6">All Products
                        </h2>
                        <h2 v-else class="text-2xl font-bold text-background-dark dark:text-background-light mb-6">Best
                            Selling
                        </h2>
                        <div v-if="showAll"
                            class="mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between w-full">
                            <!-- Search -->
                            <div class="relative w-full md:w-80">
                                <span
                                    class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input v-model.trim="searchTerm" type="text" placeholder="Search in this shop…"
                                    class="w-full h-10 pl-10 pr-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                                <button v-if="searchTerm" @click="searchTerm = ''"
                                    class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Clear">
                                    <span class="material-symbols-outlined text-gray-500 text-base">close</span>
                                </button>
                            </div>

                            <!-- Sort -->
                            <div class="relative sort-menu-root self-end md:self-auto">
                                <button @click="toggleSortMenu" @keydown.escape="showSort = false"
                                    class="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <span class="material-symbols-outlined text-base">sort</span>
                                    <span>{{ currentSortLabel }}</span>
                                    <span class="material-symbols-outlined text-base transition-transform"
                                        :class="showSort ? 'rotate-180' : ''">expand_more</span>
                                </button>

                                <!-- Sort Menu -->
                                <div v-show="showSort"
                                    class="absolute right-0 mt-2 w-60 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden z-10">
                                    <div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Sort by
                                    </div>

                                    <button v-for="opt in sortOptions" :key="opt.value"
                                        class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                        :class="sortMode === opt.value
                                            ? 'text-primary font-semibold'
                                            : 'text-gray-700 dark:text-gray-200'
                                            " @click="setSort(opt.value)">
                                        <span>{{ opt.label }}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <TransitionGroup tag="div" name="fade"
                            v-if="(showAll ? filteredSortedProducts.length : topProducts.length) > 0"
                            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <RouterLink :to="`/product-details/${product.productId}`"
                                v-for="(product, index) in showAll ? filteredSortedProducts : topProducts"
                                :key="product.productId" :style="{ '--delay': index }"
                                class="group flex flex-col rounded-lg overflow-hidden bg-white dark:bg-background-dark/50 shadow-sm transition-shadow hover:shadow-lg relative">

                                <div class="w-full bg-center bg-no-repeat aspect-square bg-cover bg-gray-200"
                                    :style="`background-image: url('${product.imageUrl}')`" />
                                <button @click="toggleFavorite(business.id)"
                                    class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                    <svg :class="['h-6 w-6 transition-colors', business.isFavorite ? 'text-red-500 fill-current' : 'text-slate-400']"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z">
                                        </path>
                                    </svg>
                                </button>

                                <div class="p-4 flex-1 flex flex-col transition-all duration-300">
                                    <h3 class="text-base font-semibold text-background-dark dark:text-background-light">
                                        {{ product.name }}
                                    </h3>
                                    <div class="flex justify-between items-center mt-auto pt-2">
                                        <p
                                            class="text-md font-bold text-background-dark/70 dark:text-background-light/70">
                                            {{ Array.isArray(product.price) ?
                                                `$${Math.min(...product.price)}-$${Math.max(...product.price)}` :
                                                `$${product.price}` }}
                                        </p>
                                        <p class="text-xs text-background-dark/50 dark:text-background-light/50">
                                            {{ product.totalSales }} sold
                                        </p>
                                    </div>
                                </div>


                            </RouterLink>
                        </TransitionGroup>


                        <div v-else class="text-center py-8 text-background-dark/70 dark:text-background-light/70">
                            <p v-if="!showAll && topProducts.length === 0">No products sold yet</p>
                            <p v-else-if="showAll && allProducts.length === 0">No products sold yet</p>
                            <p v-else-if="showAll && allProducts.length > 0 && filteredSortedProducts.length === 0">
                                This product doesn’t exist
                            </p>
                        </div>


                        <div class="mt-8 flex justify-center">
                            <button @click="viewAllProducts"
                                class="flex items-center justify-center rounded-lg h-10 px-6 bg-primary/10 dark:bg-primary/20 text-primary text-sm font-bold hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                                {{ showAll ? 'Collapse' : 'View All Products' }}
                            </button>
                        </div>
                    </section>
                    <section id="reviews" class="mt-12">
                        <h2 class="text-2xl font-bold text-background-dark dark:text-background-light mb-6">Customer
                            Reviews
                        </h2>
                        <div class="space-y-8">
                            <div
                                class="flex flex-col gap-3 p-4 rounded-lg bg-white dark:bg-background-dark/50 shadow-sm">
                                <div class="flex items-center gap-3">
                                    <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                                        style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDDXSJSZps974dSmZos44bQ4fkVJvtVwiH3d7TXHIdpmz3GwZlK5Ntcd1NJUcd-6g8bZUiLD4FGP3Ja7r8X6IsNfzOC5XwSlD8dTS321IodUu8SSmC11Tq1cQeJzFXpCYuVrirtXgVOFcibUQPIXcF3hWDvx9TuHppAF5yqeA1RxWVPfk37kj-r25aJA2rksTLnAN3FPKU7WhoUuGS1vS19-C6IXVkli9flviCrfkgBLGJeFcgIi6Cs-jamK7CGv9BsGEFvtoldckBo");'>
                                    </div>
                                    <div class="flex-1">
                                        <p
                                            class="text-sm font-semibold text-background-dark dark:text-background-light">
                                            Sophia
                                        </p>
                                        <p class="text-xs text-background-dark/60 dark:text-background-light/60">2 weeks
                                            ago
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
                                    Absolutely love the throw blanket I purchased! It's so soft and cozy, perfect for
                                    chilly
                                    evenings. The quality is excellent, and the craftsmanship is evident. Highly
                                    recommend!
                                </p>
                            </div>
                            <div
                                class="flex flex-col gap-3 p-4 rounded-lg bg-white dark:bg-background-dark/50 shadow-sm">
                                <div class="flex items-center gap-3">
                                    <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                                        style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuA8OR5kpRLPMky4F6t0lMZm_G4o3WNgP5M2uxKWJOXHUyFAaPDwUeDLt4Ccv0wKiDKya4MeGm_74lmKLI9NvPiLZKzWnba2oD1o1ZL_Afqsi5i7W-5lGuBScMWHOwS0EDvBKl2irDcYgCRkkN-a1TGVYlBP-JL_jYT_IPwayaoPvWhuKn3U-j4Yh_e2ocWCZHpuotpk7cFjIEXfpbKKcSCiFtyCvYN3LN-qp8ASWis8dCVAk4NDpEE7O7Fnm_BtGuz5d2b01ljaIOFn");'>
                                    </div>
                                    <div class="flex-1">
                                        <p
                                            class="text-sm font-semibold text-background-dark dark:text-background-light">
                                            Ethan
                                        </p>
                                        <p class="text-xs text-background-dark/60 dark:text-background-light/60">1 month
                                            ago
                                        </p>
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
                                    The scented candles are lovely, but the scent could be a bit stronger. Overall, a
                                    good
                                    product
                                    for the price.
                                </p>
                            </div>
                            <div
                                class="flex flex-col gap-3 p-4 rounded-lg bg-white dark:bg-background-dark/50 shadow-sm">
                                <div class="flex items-center gap-3">
                                    <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                                        style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBDXu2pguYR7AezNQUFVJpWpYk048Zh5-5JBnNGcZCQgEmSuYW52uOeSm82u56G4oOAjXKNN0XyVrb_dmTVv-w0yIvE2VUl4bYITx0EatHHHgB8jlZbwSHNARNDW2cpxByTgLKB7BKkA-4iuKoV0c10lexiYhiYN72V5QkvdLqwHZiaNpZdUp7imVopNqsMxX5hcom67-6qB-PZt2TXrqxu1iD-FG2AqaEFzLAvZbyYNyWZAQxfpHci5DgfeAox8aFxS9N72PSw_4FJ");'>
                                    </div>
                                    <div class="flex-1">
                                        <p
                                            class="text-sm font-semibold text-background-dark dark:text-background-light">
                                            Olivia
                                        </p>
                                        <p class="text-xs text-background-dark/60 dark:text-background-light/60">2
                                            months
                                            ago
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
                                    The artisan soap set is a fantastic gift! The soaps smell amazing and are
                                    beautifully
                                    packaged.
                                    The recipient was thrilled. Will definitely order again.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
/* Fade + scale transition for the product cards */
.fade-enter-active {
    transition: all 0.5s ease;
    transition-delay: calc(var(--delay) * 0.05s);
    /* Stagger by 100ms per item */
}

.fade-leave-active {
    transition: all 0.3s ease;
    transition-delay: calc(var(--delay) * 0.025s);
    /* Faster stagger on leave */
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
}

.fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

/* Smooth move transition for reordering */
.fade-move {
    transition: transform 0.5s ease;
}

html {
    scroll-behavior: smooth;
}
</style>

<script setup>
import { getBusinesses } from '@/firebase/services/home/business.js';
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import Loading from '@/components/status/Loading.vue';
import defaultProfilePic from '@/assets/defaultBusinessLogo.png';
import { getSellerProductsSortedBySales } from '@/composables/productUtils.js';
import { uiState } from '@/store/ui.js';

const showTopNav = uiState.showTopNav;

const sidebarOpen = ref(false);
const activeSection = ref('about'); // Default to 'about' or whichever section you want to start with

const route = useRoute();
const uid = route.params.id; // Get the dynamic :id from URL

const business = ref(null);

const allProducts = ref([]); // all sorted products
const showAll = ref(false); // toggle for "View All"

const loading = ref(true);

const topProducts = computed(() => {
    return showAll.value ? allProducts.value : allProducts.value.slice(0, 3);
});

const handleScroll = () => {
    const sections = ['about', 'products', 'reviews'];
    for (let i = 0; i < sections.length; i++) {
        const section = document.getElementById(sections[i]);
        if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                activeSection.value = sections[i];
                break;
            }
        }
    }
};
const scrollToSection = (sectionId) => {
    const navbarHeight = 70; // Adjust this to match the height of your navbar
    const section = document.getElementById(sectionId);
    if (section) {
        window.scrollTo({
            top: section.offsetTop - navbarHeight,
            behavior: 'smooth'
        });
    }
};
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
    window.addEventListener('scroll', handleScroll);
});
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
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

function toggleFavorite(id) {
    // alert(id);
}
// SEARCH + SORT 
const searchTerm = ref('')
const showSort = ref(false)
const sortMode = ref('none')

const sortOptions = [
    { value: 'none', label: 'Best Selling' },
    { value: 'name_asc', label: 'A → Z' },
    { value: 'name_desc', label: 'Z → A' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
]

const currentSortLabel = computed(() =>
    sortOptions.find(o => o.value === sortMode.value)?.label || 'Best Selling'
)

function toggleSortMenu() { showSort.value = !showSort.value }
function setSort(mode) { sortMode.value = mode; showSort.value = false }

/* Filter + Sort logic only used when showAll is true */
const filteredSortedProducts = computed(() => {
    let filtered = allProducts.value.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.value.toLowerCase())
    )

    switch (sortMode.value) {
        case 'name_asc': return filtered.sort((a, b) => a.name.localeCompare(b.name))
        case 'name_desc': return filtered.sort((a, b) => b.name.localeCompare(a.name))
        case 'price_asc': return filtered.sort((a, b) => getMinPrice(a) - getMinPrice(b))
        case 'price_desc': return filtered.sort((a, b) => getMaxPrice(b) - getMaxPrice(a))
        case 'sales_desc': return filtered.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
        default: return filtered
    }
})

function getMinPrice(p) {
    const prices = Array.isArray(p.price) ? p.price : [p.price]
    return Math.min(...prices.map(Number).filter(n => !isNaN(n)))
}
function getMaxPrice(p) {
    const prices = Array.isArray(p.price) ? p.price : [p.price]
    return Math.max(...prices.map(Number).filter(n => !isNaN(n)))
}
</script>