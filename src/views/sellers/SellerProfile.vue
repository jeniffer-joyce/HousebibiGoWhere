<!-- SellerProfile.vue -->
<template>
  <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- ===========================
           Profile Card
           =========================== -->
      <div class="flex flex-col items-center text-center p-6 bg-creamy-white dark:bg-gray-800/50 rounded-xl shadow-sm">
        <div class="relative mb-4">
          <!-- Avatar: safe fallback if logo missing -->
          <div
            class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32"
            :style="{ backgroundImage: `url('${seller.logo || placeholderImg}')` }"
          ></div>
        </div>

        <!-- Name + Verified badge -->
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          <span class="inline-flex items-center gap-2">
            {{ seller.name || 'Unnamed Seller' }}
            <span
              v-if="seller.verified"
              class="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full
                     bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 align-middle">
              <span class="material-symbols-outlined text-base leading-none">verified</span>
              Verified
            </span>
          </span>
        </h1>

        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ seller.bio || 'No bio yet.' }}
        </p>

        <p class="mt-2 text-gray-600 dark:text-gray-400">
          <span class="material-symbols-outlined text-lg text-red-500">location_on</span>
          Located @ {{ seller.address || '—' }}
        </p>

        <div class="flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400">
          <span class="material-symbols-outlined text-lg text-yellow-500">star</span>
          <span class="font-medium">{{ (seller.rating ?? 0).toFixed(1) }} / 5.0</span>
          <span class="text-gray-400 dark:text-gray-600">·</span>
          <span>20 Followings</span>
          <span class="text-gray-400 dark:text-gray-600">·</span>
          <span>120 Followers</span>
        </div>

        <button
          class="mt-6 flex items-center justify-center gap-2 h-10 px-6 bg-primary/10 dark:bg-primary/20 text-primary font-bold text-sm rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
          <span class="material-symbols-outlined text-lg">settings</span>
          <span>Edit Profile Page</span>
        </button>
      </div>
      <!-- /Profile Card -->

      <!-- ===========================
           Tabs
           =========================== -->
      <div class="mt-8">
        <div class="border-b border-gray-200 dark:border-gray-800">
          <nav aria-label="Tabs" class="-mb-px flex gap-6 px-4">
            <button
              v-for="t in tabs"
              :key="t"
              @click="activeTab = t"
              class="shrink-0 border-b-2 px-1 pb-4 text-sm font-medium transition-colors"
              :class="activeTab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 dark:text-gray-400 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300'">
              {{ t }}
            </button>
          </nav>
        </div>

        <!-- ===========================
             Products / Services Grid
             =========================== -->
        <div v-if="activeTab === 'Products'" class="py-6" id="product_list">
          <!-- Control bar: Search (left) + Filter (right) -->
          <div class="mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <!-- Search input (LEFT) -->
            <div class="relative max-w-md w-full md:w-80">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                v-model.trim="searchTerm"
                type="text"
                placeholder="Search items…"
                class="w-full h-10 pl-10 pr-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                v-if="searchTerm"
                @click="searchTerm = ''"
                class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Clear">
                <span class="material-symbols-outlined text-gray-500 text-base">close</span>
              </button>
            </div>

            <!-- Filter dropdown (RIGHT) -->
            <div class="relative filter-menu-root">
              <button
                @click="toggleFilterMenu"
                @keydown.escape="showFilter = false"
                class="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                <span class="material-symbols-outlined text-base">filter_alt</span>
                <span>{{ currentFilterLabel }}</span>
                <span class="material-symbols-outlined text-base transition-transform" :class="showFilter ? 'rotate-180' : ''">expand_more</span>
              </button>

              <!-- Menu -->
              <div
                v-show="showFilter"
                class="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden z-10">
                <button
                  class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  :class="filter === 'all' ? 'text-primary font-semibold' : 'text-gray-700 dark:text-gray-200'"
                  @click="setFilter('all')">
                  <span>All</span>
                  <span class="text-xs text-gray-500">({{ totalCount }})</span>
                </button>
                <button
                  class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 border-t border-gray-100 dark:border-gray-800"
                  :class="filter === 'product' ? 'text-primary font-semibold' : 'text-gray-700 dark:text-gray-200'"
                  @click="setFilter('product')">
                  <span>Products</span>
                  <span class="text-xs text-gray-500">({{ productCount }})</span>
                </button>
                <button
                  class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 border-t border-gray-100 dark:border-gray-800"
                  :class="filter === 'service' ? 'text-primary font-semibold' : 'text-gray-700 dark:text-gray-200'"
                  @click="setFilter('service')">
                  <span>Services</span>
                  <span class="text-xs text-gray-500">({{ serviceCount }})</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Render grid only if we actually have items -->
          <div
            v-if="hasAnyFiltered"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            id="product_grid">

            <!-- Single card -->
            <div
              v-for="(p, idx) in filteredItems"
              :key="idx"
              class="group relative flex flex-col overflow-hidden rounded-lg bg-creamy-white dark:bg-gray-800/50 h-full">

              <!-- Image + hover overlay + stock badge + multi-image controls -->
              <div class="relative">
                <!-- Image with fallback (now uses cardImage) -->
                <div
                  class="aspect-square w-full bg-cover bg-center"
                  :style="{ backgroundImage: `url('${cardImage(p, idx)}')` }"
                ></div>

                <!-- Prev/Next arrows (only if multiple images) -->
                <button
                  v-if="hasMultipleImages(p)"
                  @click.stop="prevImage(idx, p)"
                  class="hidden group-hover:flex absolute left-2 top-1/2 -translate-y-1/2 items-center justify-center size-8 rounded-full bg-black/40 text-white hover:bg-black/60">
                  <span class="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <button
                  v-if="hasMultipleImages(p)"
                  @click.stop="nextImage(idx, p)"
                  class="hidden group-hover:flex absolute right-2 top-1/2 -translate-y-1/2 items-center justify-center size-8 rounded-full bg-black/40 text-white hover:bg-black/60">
                  <span class="material-symbols-outlined text-base">chevron_right</span>
                </button>

                <!-- Dots -->
                <div
                  v-if="hasMultipleImages(p)"
                  class="pointer-events-none absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1">
                  <span
                    v-for="(img, i) in imagesOf(p)"
                    :key="i"
                    class="size-1.5 rounded-full"
                    :class="(imgIndex[idx] ?? 0) === i ? 'bg-white' : 'bg-white/50'">
                  </span>
                </div>

                <!-- Stock/Slots badge (unified) -->
                <span
                  class="absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-semibold shadow"
                  :class="stockClass(p)">
                  {{ stockLabel(p) }}
                </span>

                <!-- Hover overlay with EDIT button (type-aware label) -->
                <div
                  class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition
                         group-hover:bg-black/30 group-hover:opacity-100">
                  <button
                    @click="onEdit(p)"
                    class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold
                           bg-white text-gray-900 shadow hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">
                    <span class="material-symbols-outlined text-base">settings</span>
                    {{ isService(p) ? 'Edit Service' : 'Edit Product' }}
                  </button>
                </div>
              </div>

              <!-- Card body (equal height support via grow + mt-auto spacer) -->
              <div class="p-4 flex flex-col grow">
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white line-clamp-2 min-h-[3rem]">
                    {{ p.name || (isService(p) ? 'Untitled Service' : 'Untitled Product') }}
                  </h3>

                  <!-- Price or Price Range: service-aware -->
                  <p class="mt-1 text-sm text-primary font-semibold">
                    {{ isService(p) ? servicePriceDisplay(p) : priceDisplay(p) }}
                  </p>
                </div>

                <!-- Service: packages (labels) -->
                <div v-if="isService(p) && hasPackages(p)" class="mt-3 flex flex-wrap gap-1.5">
                  <span
                    v-for="(pk, i) in p.packages"
                    :key="i"
                    class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs
                           border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                    {{ pk?.name || 'Package' }}
                  </span>
                </div>

                <!-- Product: sizes (grey out when qty 0) -->
                <div v-else-if="hasSizes(p)" class="mt-3 flex flex-wrap gap-1.5">
                  <span
                    v-for="(s, i) in p.size"
                    :key="i"
                    class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
                    :class="sizeChipClass(p, i)">
                    {{ s }}
                  </span>
                </div>

                <!-- Service: timeslots (grey when full/past) -->
                <div v-if="isService(p) && Array.isArray(p.timeslots) && p.timeslots.length" class="mt-3 flex flex-wrap gap-1.5">
                  <span
                    v-for="(slot, i) in p.timeslots"
                    :key="i"
                    class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
                    :class="timeslotChipClass(slot)"
                    :title="slotInPast(slot) ? 'Past slot' : `${slot.label} • ${Math.max(0, (slot.capacity||0) - (slot.booked||0))} left`">
                    {{ slot.label }}
                  </span>
                </div>

                <!-- spacer to push future buttons to the bottom -->
                <div class="mt-auto"></div>
              </div>
            </div>
          </div>

          <!-- Empty state (respects filter + search) -->
          <div v-else class="py-16 flex items-center justify-center">
            <h3 class="text-gray-500 dark:text-gray-400 text-lg font-medium">{{ emptyMessage }}</h3>
          </div>

          <!-- Add button always visible -->
          <div class="mt-8 flex justify-center">
            <button @click="addProductModal = true"
                    class="flex items-center justify-center gap-2 h-12 px-8 bg-accent text-white font-bold text-sm rounded-lg shadow-lg hover:bg-vibrant-coral/90 transition-all transform hover:scale-105">
              <span class="material-symbols-outlined">add_circle</span>
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        <!-- Wishlist (placeholder) -->
        <div
          v-else-if="activeTab === 'Wishlist'"
          id="wishlist_list"
          class="py-16 flex items-center justify-center">
          <h3 class="text-gray-500 dark:text-gray-400 text-lg font-medium">No wishlist items yet.</h3>
        </div>

        <!-- Reviews (placeholder) -->
        <div
          v-else
          id="reviews_list"
          class="py-16 flex items-center justify-center">
          <h3 class="text-gray-500 dark:text-gray-400 text-lg font-medium">No reviews yet.</h3>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

/* -----------------------------
 * Mock Seller Data
 * ----------------------------- */
const seller = reactive({
  userID: 'A0000001',
  dateCreated: '2023-01-15 10:30:00 UTC+8',
  name: 'The Cozy Corner',
  verified: true,
  account_type: 'seller',
  uen: '12345678A',
  rating: 4.8,
  bio: 'Handmade crafts and unique home decor items. Bringing warmth and style to your living space. Crafted with love in Singapore. Follow us for the latest updates and exclusive offers!',
  logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvDcbMzFfeOb3_h2t6uZzdwHccl2CtXAV_HefE3Vq9CTAeiMu4sCE6Jhdva_sb7S3PV3u9zSaANk2iz7iFIRPCHqAvHuCd-xacQWdeUyun9Iy7oICCCN_X1QqwJ1lyHqbtjGYzhOn5mKV_i9eD1o6fGeWgjfIB87h1dAcVufqCvvW4N0925h4gJ92uxp7J-7z5vz7SHWEf4IObyuH5WZLYNVL2GAYYWtkDBuyJtHtigkoLtjT0cc6ghqtBLxUoRxa4OnNWmD2O1c0b',
  address: '216 Wadapp St, Singapore',
  products: [
    { type: 'product', name: 'Handmade Knitted Blanket', category: 'Home Decor', price: [12.5, 15.3, 18], availability: true, quantity: [10,15,5], size: ['Small','Medium','Large'], description: 'A cozy and warm blanket, perfect for chilly evenings.', images: ['https://picsum.photos/seed/blanket1/600/600','https://picsum.photos/seed/blanket2/600/600','https://picsum.photos/seed/blanket3/600/600'] },
    { type: 'product', name: 'Ceramic Coffee Mug', category: 'Kitchenware', price: [12.5, 15.0], availability: true, quantity: [20,15], size: ['300ml','450ml'], description: 'A stylish mug for your morning coffee or tea.', img: 'https://www.seriouseats.com/thmb/E8ZdOHHO16DIjR02TTd2pNO6AsA=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/sea-tier-3-primary-best-coffee-mugs-ebrockob-001-87ba5747529f4351b06c885febf1ba7e.jpeg' },
    {
      type: 'service',
      name: 'Home Styling Consultation',
      category: 'Services',
      description: '1–2 hour design consultation at your place or via video call.',
      img: 'https://picsum.photos/seed/consult/600/600',
      packages: [
        { name: 'Basic (1 hr)', price: 49.0 },
        { name: 'Standard (90m)', price: 69.0 },
        { name: 'Premium (2 hr)', price: 89.0 }
      ],
      timeslots: [
        { label: '10:00', start: '2025-10-13T10:00:00+08:00', end: '2025-10-13T11:00:00+08:00', capacity: 1, booked: 0 },
        { label: '14:00', start: '2025-10-13T14:00:00+08:00', end: '2025-10-13T15:00:00+08:00', capacity: 2, booked: 1 },
        { label: '16:00', start: '2025-10-13T16:00:00+08:00', end: '2025-10-13T17:00:00+08:00', capacity: 1, booked: 1 }
      ],
      availability: true
    },
    { type: 'product', name: 'Yoga Mat', category: 'Fitness', price: [12.0, 20.0, 30.0], availability: true, quantity: [25,10,0], size: ['Standard','Thick','Extra Thick'], description: 'A non-slip mat for all your yoga and exercise needs.', img: ['https://picsum.photos/seed/yog1/600/600','https://picsum.photos/seed/yog2/600/600'] },
    { type: 'product', name: 'Scented Candles Set', category: 'Home Fragrance', price: 20.0, availability: true, quantity: 40, size: null, description: 'A set of three scented candles to create a relaxing atmosphere.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxM4GDJ-QHi29SrHwwJXPDkDpuCEyJHc2Y1XtgxlM_cP6zWz5XtmTwLanIyFZYMjGwEhrs7BNLxrHqoVDNOIZvWv42gXUhyD20gPEgmOnQZhJrrkrtdtQzPAL5DffP-EAqnestASgC1_BPEtc-uCVBpyoEj3zLF4MjYwLSe0RXNKk_WlLODzYW4C2tKrrenLK4kN8glkeRx5A9lhu6lvQPUxrbXfGlGvoVn7hwzv0XtfIDUBkbNoDQDl05IJg3RZu_4X5lbrvoDnxi' }
  ]
})

/* -----------------------------
 * Tabs & UI state
 * ----------------------------- */
const tabs = ['Products', 'Wishlist', 'Reviews']
const activeTab = ref('Products')
const addProductModal = ref(false)

/* -----------------------------
 * Filter + Search state
 * ----------------------------- */
const filter = ref('all') // 'all' | 'product' | 'service'
const searchTerm = ref('')
const showFilter = ref(false)

/* Filter button label */
const currentFilterLabel = computed(() => {
  if (filter.value === 'product') return `Products (${productCount.value})`
  if (filter.value === 'service') return `Services (${serviceCount.value})`
  return `All (${totalCount.value})`
})

function toggleFilterMenu(e) {
  e?.stopPropagation?.()
  showFilter.value = !showFilter.value
}
function setFilter(next) {
  filter.value = next
  showFilter.value = false
}

/* click-outside fallback for the filter menu */
watch(showFilter, (open) => {
  const onDocClick = (e) => {
    const container = e?.target?.closest?.('.filter-menu-root')
    if (!container) showFilter.value = false
  }
  if (open) window.addEventListener('click', onDocClick, { once: true })
})

/* -----------------------------
 * Null-safe utilities & lists
 * ----------------------------- */
const placeholderImg = 'https://via.placeholder.com/600x600?text=No+Image'
const arr = (v) => (Array.isArray(v) ? v : [])
const items = computed(() => arr(seller.products).filter(Boolean))

/* Counts for filter menu */
const productCount = computed(() => items.value.filter(p => !isService(p)).length)
const serviceCount = computed(() => items.value.filter(p => isService(p)).length)
const totalCount   = computed(() => items.value.length)

/* Filter + search pipeline */
const filteredItems = computed(() => {
  let base = items.value
  if (filter.value === 'product') base = base.filter(p => !isService(p))
  if (filter.value === 'service') base = base.filter(p => isService(p))

  const q = searchTerm.value.toLowerCase()
  if (!q) return base

  return base.filter(p => {
    const inText =
      (p.name?.toLowerCase() || '').includes(q) ||
      (p.category?.toLowerCase() || '').includes(q) ||
      (p.description?.toLowerCase() || '').includes(q)

    const inPackages = isService(p)
      ? (p.packages || []).some(pk =>
          (pk?.name?.toLowerCase() || '').includes(q) ||
          String(pk?.price ?? '').toLowerCase().includes(q)
        )
      : false

    return inText || inPackages
  })
})
const hasAnyFiltered = computed(() => filteredItems.value.length > 0)

const emptyMessage = computed(() => {
  if (totalCount.value === 0) return 'No items yet.'
  if (searchTerm.value) return 'No items match your search.'
  if (filter.value === 'product') return 'No products to display.'
  if (filter.value === 'service') return 'No services to display.'
  return 'No items to display.'
})

/* -----------------------------
 * Money formatting
 * ----------------------------- */
const formatter = new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' })
const formatPrice = (val) => formatter.format(Number(val ?? 0))

const priceDisplay = (p = {}) => {
  const price = p.price
  if (Array.isArray(price)) {
    const nums = price.map(Number).filter(n => !isNaN(n)).sort((a,b)=>a-b)
    if (!nums.length) return formatPrice(0)
    const [min, max] = [nums[0], nums[nums.length - 1]]
    return min === max ? formatPrice(min) : `${formatPrice(min)}–${formatPrice(max)}`
  }
  return formatPrice(Number(price ?? 0))
}

/* -----------------------------
 * Product stock helpers
 * ----------------------------- */
const totalQty = (q) => {
  if (Array.isArray(q)) return q.map(Number).filter(n => !isNaN(n)).reduce((a,b)=>a+b, 0)
  const n = Number(q); return isNaN(n) ? 0 : n
}
const isOutOfStock = (p = {}) => !p.availability || totalQty(p.quantity) <= 0
const isLowStock   = (p = {}) => !isOutOfStock(p) && totalQty(p.quantity) <= 5

const hasSizes = (p = {}) => Array.isArray(p.size) && p.size.length > 0
const sizeQtyAt = (p = {}, i) => {
  if (!Array.isArray(p.quantity)) return Number(p.quantity) || 0
  const n = Number(p.quantity[i]); return isNaN(n) ? 0 : n
}
const sizeAvailable = (p = {}, i) => sizeQtyAt(p, i) > 0
const sizeChipClass = (p = {}, i) =>
  sizeAvailable(p, i)
    ? 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
    : 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 line-through opacity-60'

/* -----------------------------
 * Service helpers
 * ----------------------------- */
const isService = (p = {}) => p?.type === 'service'
const hasPackages = (p = {}) => isService(p) && Array.isArray(p.packages) && p.packages.length > 0

const servicePriceDisplay = (p = {}) => {
  if (!hasPackages(p)) return priceDisplay(p)
  const nums = (p.packages || []).map(pk => Number(pk?.price)).filter(n => !isNaN(n)).sort((a,b)=>a-b)
  if (!nums.length) return formatPrice(0)
  const [min, max] = [nums[0], nums[nums.length - 1]]
  return min === max ? formatPrice(min) : `${formatPrice(min)}–${formatPrice(max)}`
}

const slotRemaining = (slot = {}) => Math.max(0, Number(slot.capacity || 0) - Number(slot.booked || 0))
const slotInPast = (slot = {}) => {
  const start = new Date(slot.start || '')
  return isNaN(start) ? false : start < new Date()
}
const slotAvailable = (slot = {}) => slotRemaining(slot) > 0 && !slotInPast(slot)

const timeslotChipClass = (slot = {}) =>
  slotAvailable(slot)
    ? 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
    : 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 line-through opacity-60'

const serviceHasCapacity = (p = {}) =>
  hasPackages(p) && Array.isArray(p.timeslots)
    ? p.timeslots.some(slot => slotAvailable(slot))
    : false

/* -----------------------------
 * MULTI-IMAGE HELPERS (per card)
 * ----------------------------- */
const imgIndex = reactive({}) // { [cardIdx]: currentImageIndex }

function imagesOf(p = {}) {
  // Accepts p.images (array), p.img (array or string), else placeholder
  if (Array.isArray(p.images) && p.images.length) return p.images
  if (Array.isArray(p.img) && p.img.length) return p.img
  if (typeof p.img === 'string' && p.img) return [p.img]
  return [placeholderImg]
}
function hasMultipleImages(p = {}) {
  return imagesOf(p).length > 1
}
function cardImage(p = {}, idx) {
  const imgs = imagesOf(p)
  const i = (imgIndex[idx] ?? 0) % imgs.length
  return imgs[i]
}
function nextImage(idx, p) {
  const len = imagesOf(p).length
  if (len <= 1) return
  imgIndex[idx] = ((imgIndex[idx] ?? 0) + 1) % len
}
function prevImage(idx, p) {
  const len = imagesOf(p).length
  if (len <= 1) return
  imgIndex[idx] = ((imgIndex[idx] ?? 0) - 1 + len) % len
}
function setImage(idx, i, p) {
  const len = imagesOf(p).length
  if (!len) return
  imgIndex[idx] = Math.min(Math.max(0, i), len - 1)
}

/* -----------------------------
 * Unified badge logic
 * ----------------------------- */
const isOutOfStockOrNoSlots = (p = {}) => isService(p) ? !p.availability || !serviceHasCapacity(p) : isOutOfStock(p)
const isLowStockOrFewSlots = (p = {}) =>
  isService(p)
    ? p.availability && Array.isArray(p.timeslots) &&
      p.timeslots.filter(slot => slotAvailable(slot)).length <= 2 &&
      !isOutOfStockOrNoSlots(p)
    : isLowStock(p)

const stockLabel = (p = {}) =>
  isOutOfStockOrNoSlots(p) ? (isService(p) ? 'No slots' : 'Out of stock')
  : isLowStockOrFewSlots(p) ? (isService(p) ? 'Few slots' : 'Low stock')
  : 'In stock'

const stockClass = (p = {}) =>
  isOutOfStockOrNoSlots(p)
    ? 'bg-red-600 text-white'
    : isLowStockOrFewSlots(p)
      ? 'bg-amber-500 text-white'
      : 'bg-emerald-600 text-white'

/* -----------------------------
 * Handlers
 * ----------------------------- */
function onEdit(item) {
  // Wire to a modal or route as needed
  console.log('Edit item:', item)
}
</script>
