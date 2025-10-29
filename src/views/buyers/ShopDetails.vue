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
                
                <!-- Action Buttons -->
                <div class="mt-4 flex items-center gap-3">
                    <button
                        class="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-sm hover:bg-opacity-90 transition-colors">
                        Follow
                    </button>
                    
                    <!-- Message Button -->
                    <MessageButton 
                        :seller-id="business.uid"
                        :seller-name="business.name"
                        variant="secondary"
                        size="md"
                    />
                </div>
            </div>
            <!-- Mobile Sidebar Toggle (hamburger) -->
            <div class="sm:hidden flex justify-between items-center gap-8 mt-8 px-4 py-2">
                <button @click="sidebarOpen = !sidebarOpen" class="text-primary focus:outline-none">
                    <span class="material-symbols-outlined text-2xl">
                        {{ sidebarOpen ? 'close' : 'menu' }}
                    </span>
                </button>
                <h2 class="text-base font-semibold text-background-dark dark:text-background-light">
                    Menu
                </h2>
            </div>
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

                        <a href="javascript:void(0)" @click="scrollToSection('location')" :class="[
                            'py-2 font-medium text-sm',
                            activeSection === 'location'
                                ? 'text-primary border-l-4 border-primary pl-2 bg-primary/5'
                                : 'text-background-dark/60 dark:text-background-light/60 hover:text-primary'
                        ]">Location</a>

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
                        <h2 class="text-2xl font-bold text-background-dark dark:text-background-light mb-6">Best Selling
                        </h2>
                        <TransitionGroup tag="div" name="fade" v-if="topProducts.length > 0"
                            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <RouterLink :to="`/product-details/${product.productId}`"
                                v-for="(product, index) in topProducts" :key="product.productId"
                                :style="{ '--delay': index }"
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

                        <div v-else class="text-center py-12">
                            <p class="text-background-dark/60 dark:text-background-light/60">
                                No products to display
                            </p>
                        </div>

                        <!-- "View All" Button -->
                        <button v-if="allProducts.length > 3" @click="viewAllProducts"
                            class="mt-6 w-full px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium text-sm">
                            {{ showAll ? 'View Less' : 'View All Products' }}
                        </button>
                    </section>

                    <!-- ==================== REVIEWS ==================== -->
                    <section class="mt-12" id="reviews">
                      <h2 class="text-2xl font-bold text-background-dark dark:text-background-light mb-6">
                        Customer Reviews
                      </h2>

                      <!-- Toolbar: Product • Sort • Reset -->
                      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <!-- Product (no 'All' option) -->
                          <div class="flex items-center gap-2">
                            <span class="text-sm text-slate-500 dark:text-slate-400">Product</span>
                            <select
                              v-model="rvFilter.productId"
                              class="h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 text-sm w-full sm:w-60"
                            >
                              <option disabled value="">Select a product…</option>
                              <option v-for="p in productOptions" :key="p.productId" :value="p.productId">
                                {{ p.productName }}
                              </option>
                            </select>
                          </div>
                        </div>

                        <div class="flex items-center gap-3">
                          <!-- Sort -->
                          <div class="flex items-center gap-2">
                            <span class="text-sm text-slate-500 dark:text-slate-400">Sort</span>
                            <select
                              v-model="rvFilter.sort"
                              class="h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 text-sm w-44"
                            >
                              <option value="newest">Newest first</option>
                              <option value="oldest">Oldest first</option>
                              <option value="highest">Highest rating</option>
                              <option value="lowest">Lowest rating</option>
                              <option value="photos">Most photos</option>
                            </select>
                          </div>

                          <!-- Reset -->
                          <button
                            type="button"
                            @click="resetReviewFilters"
                            class="h-10 inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                            title="Clear filters"
                          >
                            <span class="material-symbols-outlined text-base">filter_alt_off</span>
                            Reset
                          </button>
                        </div>
                      </div>

                      <!-- Empty state -->
                      <div v-if="filteredReviews.length === 0"
                          class="rounded-xl border border-slate-200 dark:border-slate-700 p-10 text-center text-slate-600 dark:text-slate-400">
                        No reviews match your filters.
                      </div>

                      <!-- Review items (unchanged structure) -->
                      <div v-else class="space-y-6">
                        <div v-for="r in filteredReviews" :key="r.key"
                            class="p-8 bg-white dark:bg-background-dark/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                          <div class="flex items-start gap-4">
                            <!-- Avatar -->
                            <img :src="avatarUrl(r)" class="h-14 w-14 rounded-full object-cover flex-shrink-0" :alt="displayName(r)" />

                            <!-- Content -->
                            <div class="flex-1">
                              <div class="flex flex-wrap justify-between items-start gap-3">
                                <div>
                                  <p class="text-base font-semibold text-slate-900 dark:text-white">{{ displayName(r) }}</p>
                                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ formatTime(r.createdAt) }}</p>
                                </div>

                                <!-- Seller / Delivery ratings -->
                                <div class="flex items-center gap-4">
                                  <div class="flex items-center gap-1">
                                    <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Seller</span>
                                    <template v-for="n in 5" :key="'ss-'+r.key+n">
                                      <span class="material-symbols-outlined text-lg"
                                            :class="n <= r.sellerService ? 'text-blue-500' : 'text-slate-300'">star</span>
                                    </template>
                                  </div>
                                  <div class="flex items-center gap-1">
                                    <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Delivery</span>
                                    <template v-for="n in 5" :key="'dv-'+r.key+n">
                                      <span class="material-symbols-outlined text-lg"
                                            :class="n <= r.delivery ? 'text-blue-500' : 'text-slate-300'">star</span>
                                    </template>
                                  </div>
                                </div>
                              </div>

                              <!-- Product -->
                              <div class="mt-5 flex items-start gap-4">
                                <img :src="r.productImage || defaultProductThumb" class="h-16 w-16 rounded-lg object-cover" alt="product image" />
                                <div class="flex-1">
                                  <div class="flex flex-wrap items-center gap-2">
                                    <p class="font-semibold text-slate-900 dark:text-white">{{ r.productName || 'Product' }}</p>
                                    <span v-if="r.size" class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                      Size: {{ r.size }}
                                    </span>
                                  </div>

                                  <div class="mt-1 flex items-center gap-1">
                                    <template v-for="n in 5" :key="'it-'+r.key+n">
                                      <span class="material-symbols-outlined text-lg"
                                            :class="n <= r.rating ? 'text-blue-500' : 'text-slate-300'">star</span>
                                    </template>
                                    <span class="text-xs text-slate-500">{{ r.rating }}/5</span>
                                  </div>

                                  <p class="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {{ r.text }}
                                  </p>

                                  <div v-if="r.images?.length" class="mt-4 flex flex-wrap gap-3">
                                    <img v-for="(img, i) in r.images" :key="i" :src="img"
                                        class="h-24 w-24 rounded-lg object-cover border border-slate-200 dark:border-slate-700" alt="review photo" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
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
import { onMounted, onUnmounted, ref, computed, reactive } from "vue";
import { useRoute, RouterLink } from "vue-router";
import Loading from '@/components/status/Loading.vue';
import MessageButton from '@/components/messageButton.vue';
import defaultProfilePic from '@/assets/defaultBusinessLogo.png'
import { getSellerProductsSortedBySales } from '@/composables/productUtils.js';

const sidebarOpen = ref(false);
const activeSection = ref('about');

const route = useRoute();
const uid = route.params.id;

const business = ref(null);
const allProducts = ref([]);
const showAll = ref(false);
const loading = ref(true);

// Google Maps API Key for Embed API
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const topProducts = computed(() => {
    return showAll.value ? allProducts.value : allProducts.value.slice(0, 3);
});

const handleScroll = () => {
    const sections = ['about', 'products', 'location', 'reviews'];
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
    const navbarHeight = 70;
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

    try {
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

const displayRating = computed(() => {
    const n = Number(business.value?.rating)
    return Number.isFinite(n) ? n.toFixed(1) : '0.0'
})

const followersCount = computed(() => Number(business.value?.followers ?? 0))
const followingCount = computed(() => Number(business.value?.following ?? 0))


/* ==================== REVIEWS ==================== */
/*
 reviews doc:
 {
   orderId, buyerId, sellerId, createdAt, sellerService, delivery,
   items: [{ productId, size?, rating, text, images[], anonymous:0|1 }]
 }
 We flatten each item -> one UI card, but keep sellerService/delivery & createdAt from parent.
*/
const reviewsFlat = ref([])

/* caches to avoid refetch spam */
const buyersCache = new Map()   // buyerId -> {displayName, photoURL}
const productsCache = new Map() // productId -> {name, imageUrl}

async function fetchBuyer(uid) {
    if (!uid) return null
    if (buyersCache.has(uid)) return buyersCache.get(uid)
    // Try users, then profiles
    let snap = await getDoc(doc(db, 'users', uid)).catch(() => null)
    let data = snap?.exists() ? snap.data() : null
    if (!data) {
        snap = await getDoc(doc(db, 'profiles', uid)).catch(() => null)
        data = snap?.exists() ? snap.data() : null
    }
    const user = {
        displayName: data?.displayName || data?.name || 'User',
        photoURL: data?.photoURL || data?.avatar || ''
    }
    buyersCache.set(uid, user)
    return user
}

async function fetchProduct(productId) {
    if (!productId) return null
    if (productsCache.has(productId)) return productsCache.get(productId)
    const snap = await getDoc(doc(db, 'products', productId)).catch(() => null)
    const data = snap?.exists() ? snap.data() : null
    const prod = {
        name: data?.name || data?.item_name || 'Product',
        imageUrl: data?.imageUrl || data?.img_url || ''
    }
    productsCache.set(productId, prod)
    return prod
}

function maskName(name) {
    if (!name) return 'Anonymous'
    const n = name.trim()
    if (n.length <= 2) return n[0] + '*'
    return `${n[0]}${'*'.repeat(Math.max(1, n.length - 2))}${n[n.length - 1]}`
}

function displayName(r) {
    if (Number(r.anonymous) === 1) return maskName(r.buyerName || 'User')
    return r.buyerName || 'User'
}

function avatarUrl(r) {
    if (Number(r.anonymous) === 1) {
        // show generic avatar for anonymous
        return `https://ui-avatars.com/api/?name=${encodeURIComponent('Anonymous')}&background=64748b&color=fff&size=64`
    }
    if (r.buyerPhoto) return r.buyerPhoto
    const name = r.buyerName || 'User'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&size=64`
}

function formatTime(ts) {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('en-SG', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

/* ==================== INIT ==================== */
onMounted(async () => {
    // Load business
    const businesses = await getBusinesses()
    business.value = businesses.find(b => b.uid === uid) || null

    // Load top sellers
    try {
        allProducts.value = await getSellerProductsSortedBySales(uid)
    } catch (e) {
        console.error('Error loading products:', e)
    }

    // Live reviews for this seller
    const q = query(
        collection(db, 'reviews'),
        where('sellerId', '==', uid),
        orderBy('createdAt', 'desc')
    )
    onSnapshot(q, async (snap) => {
        const temp = []
        const tasks = []

        snap.forEach(docSnap => {
            const rev = { id: docSnap.id, ...docSnap.data() }
            const createdAt = rev.createdAt
            const sellerService = Number(rev.sellerService || 0)
            const delivery = Number(rev.delivery || 0)
            const buyerId = rev.buyerId

            if (Array.isArray(rev.items)) {
                for (let i = 0; i < rev.items.length; i++) {
                    const it = rev.items[i] || {}
                    const key = `${docSnap.id}-${i}`

                    // placeholders; fill below
                    const row = {
                        key,
                        createdAt,
                        sellerService,
                        delivery,

                        buyerId,
                        buyerName: null,
                        buyerPhoto: null,

                        productId: it.productId,
                        productName: null,
                        productImage: null,

                        size: it.size || null,
                        rating: Number(it.rating || 0),
                        text: it.text || '',
                        images: Array.isArray(it.images) ? it.images : [],
                        anonymous: Number(it.anonymous ?? 0)
                    }

                    temp.push(row)

                    // fetch buyer + product details (cached)
                    tasks.push(
                        (async () => {
                            const user = await fetchBuyer(buyerId)
                            if (user) {
                                row.buyerName = user.displayName
                                row.buyerPhoto = user.photoURL || null
                            }
                            const prod = await fetchProduct(it.productId)
                            if (prod) {
                                row.productName = prod.name
                                row.productImage = prod.imageUrl
                            }
                        })()
                    )
                }
            }
        })

        await Promise.all(tasks)
        reviewsFlat.value = temp
    }, (err) => {
        console.error('reviews onSnapshot error:', err)
    })

    loading.value = false
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})

/* misc */
function toggleFavorite(id) { /* your follow/fav impl */ }
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
// ---------- Review Filters ----------
const rvFilter = reactive({
  productId: '',      // '' = no filter; otherwise a real productId
  sort: 'newest'      // 'newest'|'oldest'|'highest'|'lowest'|'photos'
})

// Build product options from the loaded reviews (no "All")
const productOptions = computed(() => {
  const map = new Map()
  reviewsFlat.value.forEach(r => {
    if (!r.productId) return
    if (!map.has(r.productId)) {
      map.set(r.productId, { productId: r.productId, productName: r.productName || 'Product' })
    }
  })
  return Array.from(map.values())
})

const filteredReviews = computed(() => {
  let arr = reviewsFlat.value.slice()

  // product-only filtering
  if (rvFilter.productId) arr = arr.filter(r => r.productId === rvFilter.productId)

  // sorting
  arr.sort((a, b) => {
    const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : +new Date(a.createdAt || 0)
    const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : +new Date(b.createdAt || 0)
    switch (rvFilter.sort) {
      case 'newest':  return tb - ta
      case 'oldest':  return ta - tb
      case 'highest': return (b.rating ?? 0) - (a.rating ?? 0)
      case 'lowest':  return (a.rating ?? 0) - (b.rating ?? 0)
      case 'photos':  return (b.images?.length ?? 0) - (a.images?.length ?? 0) || (tb - ta)
      default:        return tb - ta
    }
  })

  return arr
})

function resetReviewFilters() {
  rvFilter.productId = ''
  rvFilter.sort = 'newest'
}
</script>