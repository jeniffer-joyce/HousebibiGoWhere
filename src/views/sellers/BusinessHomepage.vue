<!-- BusinessHomepage.vue -->
<template>
  <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center min-h-[320px]">
      <Loading />
    </div>

    <!-- Content -->
    <div v-else class="max-w-5xl mx-auto">
      <!-- ===================== Profile Card ===================== -->
      <div class="flex flex-col items-center text-center p-6 bg-creamy-white dark:bg-gray-800/50 rounded-xl shadow-sm">
        <div class="relative mb-4">
          <div
            class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32"
            :style="{ backgroundImage: `url('${seller.profilePic}')` }"
          ></div>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          <span class="inline-flex items-center gap-2">
            {{ seller.name }}
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

        <div class="flex flex-wrap items-center justify-center gap-2 mt-2 text-gray-500 dark:text-gray-400">
          <span class="material-symbols-outlined text-lg text-yellow-500">star</span>
          <span class="font-medium">{{ displayRating }} / 5.0</span>
          <span class="text-gray-400 dark:text-gray-600">·</span>
          <span>{{ followingCount }} Following</span>
          <span class="text-gray-400 dark:text-gray-600">·</span>
          <span>{{ followersCount }} Followers</span>
        </div>

        <RouterLink
        :to="{ name: 'edit-profile', params: { username: seller.username } }"
        class="mt-6 flex items-center justify-center gap-2 h-10 px-6 bg-primary/10 dark:bg-primary/20 text-primary font-bold text-sm rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
          <span class="material-symbols-outlined text-lg">settings</span>
          <span>Edit Profile Page</span>
        </RouterLink>

      </div>

      <!-- ===================== Control Bar: Search + Sort ===================== -->
      <section class="mt-8">
        <div class="mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <!-- Search (LEFT) -->
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

          <!-- Sorting (RIGHT) -->
          <div class="relative sort-menu-root self-start md:self-auto">
            <button
              @click="toggleSortMenu"
              @keydown.escape="showSort = false"
              class="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
              <span class="material-symbols-outlined text-base">sort</span>
              <span>{{ currentSortLabel }}</span>
              <span class="material-symbols-outlined text-base transition-transform" :class="showSort ? 'rotate-180' : ''">expand_more</span>
            </button>

            <!-- Sort Menu -->
            <div
              v-show="showSort"
              class="absolute right-0 mt-2 w-60 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden z-10">
              <div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Sort by</div>

              <button
                v-for="opt in sortOptions"
                :key="opt.value"
                class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                :class="sortMode === opt.value ? 'text-primary font-semibold' : 'text-gray-700 dark:text-gray-200'"
                @click="setSort(opt.value)">
                <span>{{ opt.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ===================== Product Grid (sorted + paginated 8 per page) ===================== -->
        <div
          v-if="pagedProducts.length"
          class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          id="product_grid"
        >
          <!-- Single card -->
          <div
            v-for="(p, idx) in pagedProducts"
            :key="p.id || idx"
            class="group relative flex flex-col overflow-hidden rounded-lg bg-creamy-white dark:bg-gray-800/50 h-full"
          >
            <!-- Image + stock badge + hover overlay -->
            <div class="relative">
              <!-- Thumbnail -->
              <div
                class="aspect-square w-full bg-cover bg-center"
                :style="{ backgroundImage: `url('${p.thumbnail || '/avatar.png'}')` }"
              ></div>

              <!-- Stock badge -->
              <span
                class="absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-semibold shadow"
                :class="stockClass(p)"
              >
                {{ stockLabel(p) }}
              </span>

              <!-- Hover overlay -->
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition
                       group-hover:bg-black/30 group-hover:opacity-100"
              >
                <button
                  @click="onEdit(p)"
                  class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold
                         bg-white text-gray-900 shadow hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  <span class="material-symbols-outlined text-base">settings</span>
                  Edit Product
                </button>
              </div>
            </div>

            <!-- Card body -->
            <div class="p-4 flex flex-col grow">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white line-clamp-2 min-h-[3rem] break-words">
                  {{ p.item_name || 'Untitled Product' }}
                </h3>

                <!-- Price or Price Range -->
                <p class="mt-1 text-sm text-primary font-semibold">
                  {{ priceDisplay(p) }}
                </p>
              </div>

              <!-- Variants / Sizes -->
              <div v-if="hasSizes(p)" class="mt-3 flex flex-wrap gap-1.5">
                <span
                  v-for="(s, i) in p.size"
                  :key="i"
                  class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
                  :class="sizeChipClass(p, i)"
                >
                  {{ s }}
                </span>
              </div>

              <div class="mt-auto"></div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="py-16 flex items-center justify-center">
          <h3 class="text-gray-500 dark:text-gray-400 text-lg font-medium">
            No products found.
          </h3>
        </div>

        <!-- Pagination controls (Back / Next + Page X of Y) -->
        <div v-if="pagesTotal > 1" class="mt-6 flex items-center justify-center gap-4">
          <button
            class="px-4 py-2 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="page === 1"
            @click="page--"
            title="Previous page"
          >
            ‹ Back
          </button>
          <span class="text-sm text-gray-600 dark:text-gray-300">
            Page {{ page }} of {{ pagesTotal }}
          </span>
          <button
            class="px-4 py-2 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="page === pagesTotal"
            @click="page++"
            title="Next page"
          >
            Next ›
          </button>
        </div>

        <!-- Add Product button -->
        <div class="mt-8 flex justify-center">
          <button
            @click="onAddProduct"
            class="flex items-center justify-center gap-2 h-12 px-8 bg-accent text-white font-bold text-sm rounded-lg shadow-lg hover:bg-vibrant-coral/90 transition-all transform hover:scale-105"
          >
            <span class="material-symbols-outlined">add_circle</span>
            <span>Add New Product</span>
          </button>
        </div>
      </section>
    </div>

    <!-- Add Product Modal -->
    <AddProductModal
      :show="showAddModal"
      @close="showAddModal = false"
      @save="handleAddProduct"
    />
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch, onActivated } from 'vue'
import { user } from '@/store/user.js'
import Loading from '@/components/status/Loading.vue'
import AddProductModal from '@/components/modals/AddProductModal.vue'
import { auth } from '@/firebase/firebase_config'


// Auth-linked seller info (now from /businesses/{uid})
import { waitForAuthReady, getCurrentSellerAccount } from '@/firebase/services/sellers/seller_info.js'

// Products service
import { getSellerProducts, createProduct } from '@/firebase/services/sellers/seller_product.js'

const loading = ref(true)
const seller = ref({})
const products = ref([])
const searchTerm = ref('')
const showAddModal = ref(false)

// Sorting state (default: no explicit sorting)
const showSort = ref(false)
const sortMode = ref('none')
const sortOptions = [
  { value: 'none',      label: 'Default' },
  { value: 'name_asc',  label: 'A → Z' },
  { value: 'name_desc', label: 'Z → A' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc',label: 'Price: High → Low' },
  { value: 'date_desc', label: 'Date: Most recent → Oldest' },
  { value: 'date_asc',  label: 'Date: Oldest → Most recent' },
]

// Pagination
const pageSize = 8
const page = ref(1)

// Derived seller rating
const displayRating = computed(() => {
  const n = Number(seller.value?.rating)
  return Number.isFinite(n) ? n.toFixed(1) : '0.0'
})

// Followers / Following counters (safe defaults)
const followersCount = computed(() => Number(seller.value?.followers ?? 0))
const followingCount = computed(() => Number(seller.value?.following ?? 0))

const currentSortLabel = computed(() =>
  sortOptions.find(o => o.value === sortMode.value)?.label || 'Default'
)

// Toggle handlers
function toggleSortMenu() { showSort.value = !showSort.value }
function setSort(mode) { sortMode.value = mode; showSort.value = false; page.value = 1 }

// Search-only filter (no categories)
const filteredProducts = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return products.value
  return products.value.filter(p =>
    [p.item_name, p.description, Array.isArray(p.size) ? p.size.join(' ') : p.size]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(term)
  )
})

// Sorting helpers
function toDate(val) {
  if (!val) return 0
  if (val instanceof Date) return val.getTime()
  const d = new Date(val)
  return isNaN(d.getTime()) ? 0 : d.getTime()
}
function minPrice(p) {
  const arr = Array.isArray(p.price) ? p.price : [p.price ?? 0]
  const nums = arr.map(Number).filter(n => !isNaN(n))
  return nums.length ? Math.min(...nums) : 0
}
function maxPrice(p) {
  const arr = Array.isArray(p.price) ? p.price : [p.price ?? 0]
  const nums = arr.map(Number).filter(n => !isNaN(n))
  return nums.length ? Math.max(...nums) : 0
}

// Sorted products based on sortMode
const sortedProducts = computed(() => {
  const arr = [...filteredProducts.value]
  switch (sortMode.value) {
    case 'none':
      return arr
    case 'name_asc':
      return arr.sort((a, b) => String(a.item_name || '').localeCompare(String(b.item_name || '')))
    case 'name_desc':
      return arr.sort((a, b) => String(b.item_name || '').localeCompare(String(a.item_name || '')))
    case 'price_asc':
      return arr.sort((a, b) => minPrice(a) - minPrice(b))
    case 'price_desc':
      return arr.sort((a, b) => maxPrice(b) - maxPrice(a))
    case 'date_asc':
      return arr.sort((a, b) => toDate(a.createdAt) - toDate(b.createdAt))
    case 'date_desc':
      return arr.sort((a, b) => toDate(b.createdAt) - toDate(a.createdAt))
    default:
      return arr
  }
})

// Reset to page 1 when search/sort changes
watch([searchTerm, sortMode], () => { page.value = 1 })

// Pagination derived values
const pagesTotal = computed(() => Math.max(1, Math.ceil(sortedProducts.value.length / pageSize)))
const pagedProducts = computed(() => {
  const start = (page.value - 1) * pageSize
  return sortedProducts.value.slice(start, start + pageSize)
})

// ✅ Function to reload seller data
async function reloadSellerData() {
  try {
    console.log('🔄 Reloading seller data...')
    const acct = await getCurrentSellerAccount()
    if (acct) {
      seller.value = acct
      console.log('✅ Seller data reloaded:', acct)
    }
  } catch (error) {
    console.error('❌ Error reloading seller data:', error)
  }
}

// Load data
onMounted(async () => {
  try {
    await waitForAuthReady()

    // Load business account
    const acct = await getCurrentSellerAccount()
    if (acct) seller.value = acct

    // Load products
    products.value = await getSellerProducts()
  } catch (e) {
    console.error('❌ Error initializing BusinessHomepage:', e)
  } finally {
    loading.value = false
  }
})

// ✅ Reload when page becomes active (after navigation)
onActivated(() => {
  console.log('📄 BusinessHomepage activated, reloading data...')
  reloadSellerData()
})

// ✅ Watch for user avatar changes
watch(() => user.avatar, (newAvatar, oldAvatar) => {
  if (newAvatar !== oldAvatar) {
    console.log('👤 User avatar changed:', newAvatar)
    reloadSellerData()
  }
}, { deep: true })

// ===================== Product Card helpers =====================

// Open Add Product Modal
function onAddProduct() {
  showAddModal.value = true
}

// Handle saving new product
async function handleAddProduct(productData) {
  try {
    console.log('💾 Saving product:', productData)
    
    // Add seller's business category to product data
    const productDataWithCategory = {
      ...productData,
      category: seller.value.category || 'uncategorized'
    }
    
    // Save to Firebase
    const newId = await createProduct(productDataWithCategory)
    
    console.log('✅ Product created with ID:', newId)
    
    // Add to local products array with normalized structure
    products.value.push({
      id: newId,
      item_name: productData.item_name,
      category: seller.value.category || 'uncategorized',
      description: productData.description,
      thumbnail: productData.img_url,
      img_url: productData.img_url,
      additional_images: productData.additional_images || [],
      images: [productData.img_url, ...(productData.additional_images || [])],
      price: Array.isArray(productData.price) ? productData.price : [productData.price],
      quantity: Array.isArray(productData.quantity) ? productData.quantity : [productData.quantity],
      size: Array.isArray(productData.size) ? productData.size : (productData.size ? [productData.size] : []),
      availability: productData.availability,
      imageSource: productData.imageSource,
      createdAt: productData.createdAt || new Date().toISOString(),
      sellerId: productData.sellerId,
      sellerName: productData.sellerName
    })
    
    // Close modal
    showAddModal.value = false
    
    // Success feedback
    alert('✅ Product added successfully!')
  } catch (error) {
    console.error('❌ Error adding product:', error)
    alert('Failed to add product. Please try again.')
  }
}

// Edit product handler
function onEdit(p) {
  console.log('Edit product clicked:', p.id)
  // TODO: Implement edit functionality
}

// check if product has variants/sizes
function hasSizes(p) {
  return Array.isArray(p.size) && p.size.length > 0
}

// compute total quantity (array or single)
function totalQuantity(p) {
  if (Array.isArray(p.quantity)) {
    return p.quantity.reduce((sum, n) => sum + (Number(n) || 0), 0)
  }
  return Number(p.quantity) || 0
}

// format price to 2 decimals
function fmt2(n) {
  const num = Number(n)
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

// price display ($x.xx or $x.xx - $y.xx)
function priceDisplay(p) {
  const arr = Array.isArray(p.price) ? p.price : [p.price]
  const nums = arr.map(Number).filter(n => !isNaN(n))
  if (nums.length === 0) return '$0.00'
  if (nums.length === 1) return `$${fmt2(nums[0])}`
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  return `$${fmt2(min)} - $${fmt2(max)}`
}

// stock label / class (colors as requested)
function stockLabel(p) {
  const qty = totalQuantity(p)
  if (qty <= 0) return 'Out of Stock'
  if (qty <= 10) return 'Low Stock'
  return 'In Stock'
}
function stockClass(p) {
  const qty = totalQuantity(p)
  if (qty <= 0) return 'bg-red-600 text-white'
  if (qty <= 10) return 'bg-amber-500 text-white'
  return 'bg-emerald-600 text-white'
}

// size chip color (disabled if that variant has 0 qty)
function sizeChipClass(p, i) {
  const q = Array.isArray(p.quantity) ? Number(p.quantity[i]) || 0 : 0
  if (q <= 0)
    return 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 opacity-60 cursor-not-allowed'
  return 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
}
</script>