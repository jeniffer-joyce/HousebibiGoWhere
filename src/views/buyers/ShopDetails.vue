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
          <MessageButton :seller-id="business.uid" :seller-name="business.name" variant="secondary" size="md" />
        </div>
      </div>
      <!-- Mobile Horizontal Menu -->
      <nav class="sm:hidden sticky z-40 dark:bg-gray-800/80 backdrop-blur-md border-y border-gray-200 dark:border-gray-700 flex justify-center gap-6 py-2 text-sm font-medium text-background-dark dark:text-background-light
                 transition-transform duration-300 ease-in-out" :class="showTopNav ? 'top-16 mt-10' : 'top-0 mt-0'">
        <button v-for="section in ['about', 'products', 'reviews']" :key="section" @click="scrollToSection(section)"
          :class="[
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
            <h2 v-if="showAll" class="text-2xl font-bold text-background-dark dark:text-background-light mb-6">All
              Products
            </h2>
            <h2 v-else class="text-2xl font-bold text-background-dark dark:text-background-light mb-6">Best
              Selling
            </h2>
            <div v-if="showAll" class="mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between w-full">
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
                v-for="(product, index) in showAll ? filteredSortedProducts : topProducts" :key="product.productId"
                :style="{ '--delay': index }"
                class="group flex flex-col rounded-lg overflow-hidden bg-white dark:bg-background-dark/50 shadow-sm transition-shadow hover:shadow-lg relative">

                <div class="w-full bg-center bg-no-repeat aspect-square bg-cover bg-gray-200"
                  :style="`background-image: url('${product.imageUrl}')`" />
                <button @click="toggleFavorite(business.id)"
                  class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors">
                  <svg
                    :class="['h-6 w-6 transition-colors', business.isFavorite ? 'text-red-500 fill-current' : 'text-slate-400']"
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
                    <p class="text-md font-bold text-background-dark/70 dark:text-background-light/70">
                      {{ Array.isArray(product.price)
                        ? `$${Math.min(...product.price)}-$${Math.max(...product.price)}`
                        : `$${product.price}` }}
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


          <!-- ===================== Location Section (SIMPLE EMBED - NO GEOCODING) ===================== -->
          <section class="mt-10" id="location">
            <h2 class="text-2xl font-bold text-background-dark dark:text-background-light mb-6">
              Location
            </h2>

            <!-- Google Map Embed (Search Mode - Simple Marker) -->
            <div v-if="business.address" class="w-full h-96 rounded-lg overflow-hidden shadow-md">
              <iframe
                :src="`https://www.google.com/maps/embed/v1/search?key=${googleMapsApiKey}&q=${encodeURIComponent(business.address)}&zoom=16`"
                width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
            <div v-else
              class="w-full h-96 rounded-lg overflow-hidden shadow-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <p class="text-background-dark/60 dark:text-background-light/60">Address not available</p>
            </div>
          </section>

          <!-- ===================== DYNAMIC REVIEWS ===================== -->
          <section class="mt-10" id="reviews">
            <!-- Header Row (filters on the right) -->
            <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 class="text-2xl font-bold text-background-dark dark:text-background-light">Reviews</h2>

              <div class="ml-auto flex flex-wrap items-center gap-3">
                <span class="text-sm text-slate-500">Sort</span>
                <div class="relative">
                  <select v-model="rv.ui.sort"
                    class="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="high">Highest rating</option>
                    <option value="low">Lowest rating</option>
                  </select>
                  <span
                    class="pointer-events-none material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                    expand_more
                  </span>
                </div>

                <span class="ml-2 text-sm text-slate-500">Product</span>
                <div class="relative">
                  <select v-model="rv.ui.productId"
                    class="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    <option value="all">All</option>
                    <option v-for="p in rv.productOptions" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                  <span
                    class="pointer-events-none material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                    expand_more
                  </span>
                </div>

                <button @click="rv.reset()" class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm
                    hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  <span class="material-symbols-outlined text-base">filter_alt_off</span>
                  Reset
                </button>
              </div>
            </div>

            <!-- Empty -->
            <div v-if="rv.listSorted.length === 0"
              class="rounded-xl border border-slate-200 p-10 text-center text-slate-600 dark:border-slate-700 dark:text-slate-400">
              No reviews yet.
            </div>

            <!-- Review Cards -->
            <div v-else class="space-y-6">
              <div v-for="r in rv.listSorted" :key="r.key"
                class="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                <!-- Top row: avatar/name/time (left)  •  Seller/Delivery stars (right) -->
                <div class="flex flex-wrap items-start justify-between gap-4">
                  <div class="flex items-start gap-3">
                    <img :src="rv.avatarUrl(r)" class="h-12 w-12 rounded-full object-cover" :alt="rv.displayName(r)" />
                    <div>
                      <p class="font-semibold text-slate-900 dark:text-white">{{ rv.displayName(r) }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ rv.formatTime(r.createdAt) }}</p>
                    </div>
                  </div>

                  <!-- Seller / Delivery rating (added back) -->
                  <div class="flex items-center gap-6">
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-slate-600 dark:text-slate-300">Seller</span>
                      <template v-for="n in 5" :key="'ss-'+r.key+n">
                        <span class="material-symbols-outlined text-[20px]"
                          :class="n <= (r.sellerService || 0) ? 'text-sky-500' : 'text-slate-300'">star</span>
                      </template>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-slate-600 dark:text-slate-300">Delivery</span>
                      <template v-for="n in 5" :key="'dv-'+r.key+n">
                        <span class="material-symbols-outlined text-[20px]"
                          :class="n <= (r.delivery || 0) ? 'text-sky-500' : 'text-slate-300'">star</span>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Product image + name/size + item stars (stacked) -->
                <div class="mt-4 flex items-start gap-3">
                  <!-- product image -->
                  <img :src="r.productImage || defaultProductThumb"
                    class="h-12 w-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    alt="product" />

                  <!-- right column: name/size (top), stars (below) -->
                  <div class="flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="font-semibold text-slate-900 dark:text-white">
                        {{ r.productName || 'Product' }}
                      </p>
                      <span v-if="r.size"
                        class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        Size: {{ r.size }}
                      </span>
                    </div>

                    <!-- stars directly under name/size -->
                    <div class="mt-1 flex items-center gap-1">
                      <template v-for="n in 5" :key="'it-'+r.key+n">
                        <span class="material-symbols-outlined text-[20px]"
                          :class="n <= r.rating ? 'text-sky-500' : 'text-slate-300'">star</span>
                      </template>
                      <span class="ml-1 text-xs text-slate-500">{{ r.rating }}/5</span>
                    </div>
                  </div>
                </div>

                <!-- Text -->
                <p class="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {{ r.text }}
                </p>

                <!-- Review photos (zoomable) -->
                <div v-if="r.images?.length" class="mt-4 flex flex-wrap gap-3">
                  <img v-for="(img, i) in r.images" :key="i" :src="img"
                    class="h-24 w-24 cursor-zoom-in rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                    @click="openLightbox(r.images, i)" alt="review photo" />
                </div>
              </div>
            </div>

            <!-- Lightbox -->
            <div v-if="lb.open" class="fixed inset-0 z-[120] flex items-center justify-center bg-black/70"
              @click.self="closeLightbox">
              <button class="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-1 text-sm shadow"
                @click="closeLightbox">
                Close
              </button>
              <button class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
                @click="prev">
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <img :src="lb.images[lb.index]" class="max-h-[86vh] max-w-[90vw] rounded-xl object-contain shadow-2xl" />
              <button class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
                @click="next">
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </section>
          <!-- ===================== /DYNAMIC REVIEWS ===================== -->
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
import { onMounted, onUnmounted, ref, computed, reactive, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import Loading from '@/components/status/Loading.vue';
import MessageButton from '@/components/messageButton.vue';
import defaultProfilePic from '@/assets/defaultBusinessLogo.png'
import { getSellerProductsSortedBySales } from '@/composables/productUtils.js';

/* --------- ADDED: Firestore imports for dynamic reviews --------- */
import { db } from '@/firebase/firebase_config'
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore'
/* --------------------------------------------------------------- */

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
  const offset = 120; // slightly bigger than your sticky/header height
  for (const id of sections) {
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    // consider a section active if its top is above the offset and at least part is visible
    if (rect.top <= offset && rect.bottom > offset) {
      activeSection.value = id;
      break;
    }
  }
};

const scrollToSection = (sectionId) => {
  const navbarHeight = 70;
  const section = document.getElementById(sectionId);
  if (section) {
    activeSection.value = sectionId;
    window.scrollTo({
      top: section.offsetTop - navbarHeight,
      behavior: 'smooth'
    });
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // Run once at load to highlight correct section if not at top
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

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

  /* --------- ADDED: Live reviews listener --------- */
  const q = query(
    collection(db, 'reviews'),
    where('sellerId', '==', uid),
    orderBy('createdAt', 'desc')
  )
  unsubReviews = onSnapshot(q, async (snap) => {
    const rows = []
    const tasks = []

    snap.forEach(d => {
      const rev = { id: d.id, ...d.data() }
      const createdAt = rev.createdAt
      const sellerService = Number(rev.sellerService || 0)
      const delivery = Number(rev.delivery || 0)
      const buyerId = rev.buyerId

      if (Array.isArray(rev.items)) {
        rev.items.forEach((it, idx) => {
          const row = {
            key: `${d.id}-${idx}`,
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
          rows.push(row)

          tasks.push((async () => {
            const u = await fetchBuyer(buyerId)
            if (u) { row.buyerName = u.displayName; row.buyerPhoto = u.photoURL || null }
            const p = await fetchProduct(it.productId)
            if (p) { row.productName = p.name; row.productImage = p.imageUrl || null }
          })())
        })
      }
    })

    await Promise.all(tasks)
    reviewsFlat.value = rows
  }, err => console.error('reviews onSnapshot error:', err))
  /* ------------------------------------------------ */

  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  _unsubReviews?.()
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

/* ===================== ADDED: Reviews helpers ===================== */
const _buyers = new Map();    // buyerId -> {displayName, photoURL}
const _products = new Map();  // productId -> {name, imageUrl}

async function getBuyer(uid) {
  if (!uid) return null;
  if (_buyers.has(uid)) return _buyers.get(uid);

  let snap = await getDoc(doc(db, "users", uid)).catch(() => null);
  let data = snap?.exists() ? snap.data() : null;

  if (!data) {
    snap = await getDoc(doc(db, "profiles", uid)).catch(() => null);
    data = snap?.exists() ? snap.data() : null;
  }

  const user = {
    displayName: data?.displayName || data?.name || "User",
    photoURL: data?.photoURL || data?.avatar || ""
  };
  _buyers.set(uid, user);
  return user;
}

async function getProduct(productId) {
  if (!productId) return null;
  if (_products.has(productId)) return _products.get(productId);

  const snap = await getDoc(doc(db, "products", productId)).catch(() => null);
  const d = snap?.exists() ? snap.data() : null;
  const prod = {
    name: d?.name || d?.item_name || "Product",
    imageUrl: d?.imageUrl || d?.img_url || ""
  };
  _products.set(productId, prod);
  return prod;
}

function mask(name) {
  const n = (name || "User").trim();
  if (n.length <= 2) return n[0] + "*";
  return `${n[0]}${"*".repeat(Math.max(1, n.length - 2))}${n[n.length - 1]}`;
}

function niceTime(ts) {
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ==================== REACTIVE STATE ====================
const rv = reactive({
  raw: [], // flattened rows
  ui: { sort: "newest", productId: "all" },

  productOptions: computed(() => {
    const m = new Map();
    rv.raw.forEach(r => {
      if (r.productId && r.productName) m.set(r.productId, r.productName);
    });
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }));
  }),

  listSorted: computed(() => {
    let list = rv.raw;
    if (rv.ui.productId !== "all") list = list.filter(x => x.productId === rv.ui.productId);

    if (rv.ui.sort === "newest")
      list = [...list].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    else if (rv.ui.sort === "oldest")
      list = [...list].sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    else if (rv.ui.sort === "high")
      list = [...list].sort((a, b) => b.rating - a.rating);
    else if (rv.ui.sort === "low")
      list = [...list].sort((a, b) => a.rating - b.rating);

    return list;
  }),

  reset() {
    rv.ui.sort = "newest";
    rv.ui.productId = "all";
  },

  // Template helpers
  displayName(r) {
    return Number(r.anonymous) === 1 ? mask(r.buyerName) : (r.buyerName || "User");
  },
  avatarUrl(r) {
    if (Number(r.anonymous) === 1)
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "Anonymous"
      )}&background=64748b&color=fff&size=64`;
    return (
      r.buyerPhoto ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        r.buyerName || "User"
      )}&background=10b981&color=fff&size=64`
    );
  },
  formatTime: niceTime
});

// ==================== LIVE SUBSCRIPTION ====================
let _unsubReviews = null;

onMounted(() => {
  const q = query(collection(db, "reviews"), where("sellerId", "==", uid), orderBy("createdAt", "desc"));
  _unsubReviews = onSnapshot(
    q,
    async snap => {
      const rows = [];
      const tasks = [];

      snap.forEach(ds => {
        const rev = { id: ds.id, ...ds.data() };
        const base = {
          createdAt: rev.createdAt,
          sellerService: Number(rev.sellerService || 0),
          delivery: Number(rev.delivery || 0),
          buyerId: rev.buyerId
        };

        (rev.items || []).forEach((it, i) => {
          const row = {
            key: `${ds.id}-${i}`,
            ...base,
            productId: it.productId || null,
            size: it.size || null,
            rating: Number(it.rating || 0),
            text: it.text || "",
            images: Array.isArray(it.images) ? it.images : [],
            anonymous: Number(it.anonymous ?? 0),

            // placeholders filled by tasks
            buyerName: null,
            buyerPhoto: null,
            productName: null,
            productImage: null
          };

          rows.push(row);
          tasks.push(
            (async () => {
              const u = await getBuyer(base.buyerId);
              if (u) {
                row.buyerName = u.displayName;
                row.buyerPhoto = u.photoURL;
              }
              const p = await getProduct(it.productId);
              if (p) {
                row.productName = p.name;
                row.productImage = p.imageUrl;
              }
            })()
          );
        });
      });

      await Promise.all(tasks);
      rv.raw = rows;
    },
    err => console.error("reviews onSnapshot error:", err)
  );
});

onUnmounted(() => {
  _unsubReviews?.();
});

// ==================== LIGHTBOX (image zoom) ====================
const lb = ref({ open: false, images: [], index: 0 });

function openLightbox(images, index = 0) {
  lb.value.open = true;
  lb.value.images = images || [];
  lb.value.index = index;
}

function closeLightbox() {
  lb.value.open = false;
  lb.value.images = [];
  lb.value.index = 0;
}

function next() {
  if (!lb.value.images.length) return;
  lb.value.index = (lb.value.index + 1) % lb.value.images.length;
}

function prev() {
  if (!lb.value.images.length) return;
  lb.value.index = (lb.value.index - 1 + lb.value.images.length) % lb.value.images.length;
}

function onKey(e) {
  if (!lb.value.open) return;
  if (e.key === "Escape") return closeLightbox();
  if (e.key === "ArrowRight") return next();
  if (e.key === "ArrowLeft") return prev();
}

onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));
/* ================================================================ */

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
</script>