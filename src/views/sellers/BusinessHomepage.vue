<!-- src/views/sellers/BusinessHomepage.vue -->
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

      <!-- ===================== Control Bar ===================== -->
      <section class="mt-8">
        <div class="mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <!-- Search -->
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

          <!-- Sort -->
          <div class="relative sort-menu-root self-start md:self-auto">
            <button
              @click="toggleSortMenu"
              @keydown.escape="showSort = false"
              class="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
              <span class="material-symbols-outlined text-base">sort</span>
              <span>{{ currentSortLabel }}</span>
              <span class="material-symbols-outlined text-base transition-transform" :class="showSort ? 'rotate-180' : ''">expand_more</span>
            </button>

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

        <!-- ===================== Product Grid ===================== -->
        <div
          v-if="pagedProducts.length"
          class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          id="product_grid">
          <div
            v-for="(p, idx) in pagedProducts"
            :key="p.id || idx"
            class="group relative flex flex-col overflow-hidden rounded-lg bg-creamy-white dark:bg-gray-800/50 h-full">
            <div class="relative">
              <div
                class="aspect-square w-full bg-cover bg-center"
                :style="bgStyle(p)"></div>

              <span
                class="absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-semibold shadow"
                :class="stockClass(p)">
                {{ stockLabel(p) }}
              </span>

              <!-- Edit Overlay -->
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition
                       group-hover:bg-black/30 group-hover:opacity-100">
                <button
                  @click="onEdit(p)"
                  class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold
                         bg-white text-gray-900 shadow hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">
                  <span class="material-symbols-outlined text-base">settings</span>
                  Edit Product
                </button>
              </div>
            </div>

            <div class="p-4 flex flex-col grow">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white line-clamp-2 min-h-[3rem] break-words">
                  {{ p.item_name || 'Untitled Product' }}
                </h3>
                <p class="mt-1 text-sm text-primary font-semibold">{{ priceDisplay(p) }}</p>
              </div>

              <div v-if="hasSizes(p)" class="mt-3 flex flex-wrap gap-1.5">
                <span
                  v-for="(s, i) in p.size"
                  :key="i"
                  class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
                  :class="sizeChipClass(p, i)">
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

        <!-- Pagination -->
        <div v-if="pagesTotal > 1" class="mt-6 flex items-center justify-center gap-4">
          <button
            class="px-4 py-2 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="page === 1"
            @click="page--">
            ‹ Back
          </button>
          <span class="text-sm text-gray-600 dark:text-gray-300">Page {{ page }} of {{ pagesTotal }}</span>
          <button
            class="px-4 py-2 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="page === pagesTotal"
            @click="page++">
            Next ›
          </button>
        </div>

        <!-- Add Product -->
        <div class="mt-8 flex justify-center">
          <button
            @click="onAddProduct"
            class="flex items-center justify-center gap-2 h-12 px-8 bg-accent text-white font-bold text-sm rounded-lg shadow-lg hover:bg-vibrant-coral/90 transition-all transform hover:scale-105">
            <span class="material-symbols-outlined">add_circle</span>
            <span>Add New Product</span>
          </button>
        </div>
      </section>
    </div>

    <!-- 🧩 Add/Edit Product Modal -->
    <AddProductModal
      :show="showAddModal"
      :editProduct="editProduct"
      @close="() => { showAddModal = false; editProduct = null }"
      @save="handleAddProduct"
      @deleted="(id) => { products = products.filter(p => p.id !== id) }"
    />
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch, onActivated } from 'vue'
import { user } from '@/store/user.js'
import Loading from '@/components/status/Loading.vue'
import AddProductModal from '@/components/modals/AddProductModal.vue'
import { useToast } from '@/composables/useToast'
import { authReady, fetchSellerComposite } from '@/firebase/services/sellers/seller_crud.js'
import { getSellerProducts, createProduct, getMyProduct, updateMyProduct } from '@/firebase/services/sellers/seller_product.js'

const { success, error: toastError } = useToast()

const loading = ref(true)
const seller = ref({})
const products = ref([])
const searchTerm = ref('')
const showAddModal = ref(false)
const editProduct = ref(null)
const saving = ref(false)

// Sorting + pagination setup
const showSort = ref(false)
const sortMode = ref('none')
const pageSize = 8
const page = ref(1)

const sortOptions = [
  { value: 'none', label: 'Default' },
  { value: 'name_asc', label: 'A → Z' },
  { value: 'name_desc', label: 'Z → A' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'date_desc', label: 'Date: Most recent → Oldest' },
  { value: 'date_asc', label: 'Date: Oldest → Most recent' },
]

/* ==========================================================
   🔄 AUTO REFRESH / FETCH SELLER DATA
   ========================================================== */
async function loadSellerData() {
  try {
    loading.value = true
    await authReady()
    const { business } = await fetchSellerComposite()
    if (business) seller.value = business
    products.value = await getSellerProducts()
  } catch (e) {
    console.error('❌ Failed to load seller data:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadSellerData)
onActivated(loadSellerData)
watch(() => user.avatar, loadSellerData, { deep: true })

/* ==========================================================
   📈 RATING + FOLLOWERS
   ========================================================== */
const displayRating = computed(() => {
  const n = Number(seller.value?.rating)
  return Number.isFinite(n) ? n.toFixed(1) : '0.0'
})
const followersCount = computed(() => Number(seller.value?.followers ?? 0))
const followingCount = computed(() => Number(seller.value?.following ?? 0))

/* ==========================================================
   🔍 SEARCH + SORT + PAGINATION
   ========================================================== */
const currentSortLabel = computed(() =>
  sortOptions.find(o => o.value === sortMode.value)?.label || 'Default'
)
function toggleSortMenu() { showSort.value = !showSort.value }
function setSort(mode) { sortMode.value = mode; showSort.value = false; page.value = 1 }

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

function toDate(val) { const d = new Date(val); return isNaN(d.getTime()) ? 0 : d.getTime() }
function minPrice(p) { return Math.min(...(Array.isArray(p.price) ? p.price : [p.price || 0])) }
function maxPrice(p) { return Math.max(...(Array.isArray(p.price) ? p.price : [p.price || 0])) }

const sortedProducts = computed(() => {
  const arr = [...filteredProducts.value]
  switch (sortMode.value) {
    case 'name_asc': return arr.sort((a, b) => a.item_name.localeCompare(b.item_name))
    case 'name_desc': return arr.sort((a, b) => b.item_name.localeCompare(a.item_name))
    case 'price_asc': return arr.sort((a, b) => minPrice(a) - minPrice(b))
    case 'price_desc': return arr.sort((a, b) => maxPrice(b) - maxPrice(a))
    case 'date_asc': return arr.sort((a, b) => toDate(a.createdAt) - toDate(b.createdAt))
    case 'date_desc': return arr.sort((a, b) => toDate(b.createdAt) - toDate(a.createdAt))
    default: return arr
  }
})

watch([searchTerm, sortMode], () => page.value = 1)
const pagesTotal = computed(() => Math.max(1, Math.ceil(sortedProducts.value.length / pageSize)))
const pagedProducts = computed(() => sortedProducts.value.slice((page.value - 1) * pageSize, page.value * pageSize))

/* ==========================================================
   🛒 PRODUCT FUNCTIONS
   ========================================================== */
function onAddProduct() {
  editProduct.value = null
  showAddModal.value = true
}

async function onEdit(p) {
  try {
    const fullData = await getMyProduct(p.id)
    editProduct.value = fullData
    showAddModal.value = true
  } catch (err) {
    console.error('❌ Failed to fetch product for editing:', err)
    toastError('Unable to load product details.')
  }
}

/* Normalize & push updates so images show immediately in grid */
async function handleAddProduct(productData) {
  try {
    saving.value = true

    if (editProduct.value) {
      // --- UPDATE
      await updateMyProduct(editProduct.value.id, productData)

      // Normalize local cache
      const images = [productData.img_url, ...(productData.additional_images || [])].filter(Boolean)
      const thumbnail = images[0] || ''

      const idx = products.value.findIndex(p => p.id === editProduct.value.id)
      if (idx !== -1) {
        products.value[idx] = {
          ...products.value[idx],
          ...productData,
          images,
          thumbnail,
          img_url: thumbnail,               // legacy
        }
      }

      success('✅ Product updated successfully!')
    } else {
      // --- CREATE
      const dataToCreate = {
        ...productData,
        category: seller.value.category || 'uncategorized'
      }
      const newId = await createProduct(dataToCreate)

      // Normalize local cache
      const images = [dataToCreate.img_url, ...(dataToCreate.additional_images || [])].filter(Boolean)
      const thumbnail = images[0] || ''

      products.value.push({
        id: newId,
        item_name: dataToCreate.item_name,
        description: dataToCreate.description,
        category: dataToCreate.category,
        images,
        thumbnail,
        img_url: thumbnail,                 // legacy
        price: Array.isArray(dataToCreate.price) ? dataToCreate.price : [dataToCreate.price],
        quantity: Array.isArray(dataToCreate.quantity) ? dataToCreate.quantity : [dataToCreate.quantity],
        size: Array.isArray(dataToCreate.size) ? dataToCreate.size : (dataToCreate.size ? [dataToCreate.size] : []),
        availability: dataToCreate.availability ?? true,
        createdAt: new Date().toISOString(),
      })

      success('✅ Product added successfully!')
    }

    editProduct.value = null
    showAddModal.value = false
  } catch (error) {
    console.error('❌ Error saving product:', error)
    toastError('Failed to save product. Please try again.')
  } finally {
    saving.value = false
  }
}

/* ==========================================================
   🧩 UI HELPERS
   ========================================================== */
function bgStyle(p) {
  const src = p?.thumbnail || (Array.isArray(p?.images) && p.images[0]) || '/avatar.png'
  return { backgroundImage: `url('${src}')` }
}

function hasSizes(p) { return Array.isArray(p.size) && p.size.length > 0 }
function totalQuantity(p) { return Array.isArray(p.quantity) ? p.quantity.reduce((s, n) => s + (+n || 0), 0) : +p.quantity || 0 }
function fmt2(n) { return (Number.isFinite(+n) ? (+n).toFixed(2) : '0.00') }
function priceDisplay(p) {
  const arr = Array.isArray(p.price) ? p.price : [p.price]
  const nums = arr.map(Number).filter(n => !isNaN(n))
  if (nums.length === 0) return '$0.00'
  if (nums.length === 1) return `$${fmt2(nums[0])}`
  return `$${fmt2(Math.min(...nums))} - $${fmt2(Math.max(...nums))}`
}
function stockLabel(p) { const q = totalQuantity(p); return q <= 0 ? 'Out of Stock' : q <= 10 ? 'Low Stock' : 'In Stock' }
function stockClass(p) {
  const q = totalQuantity(p)
  return q <= 0 ? 'bg-red-600 text-white' : q <= 10 ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
}
function sizeChipClass(p, i) {
  const q = Array.isArray(p.quantity) ? Number(p.quantity[i]) || 0 : 0
  return q <= 0
    ? 'border-gray-300 dark:border-gray-700 text-gray-400 opacity-60'
    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
}
</script>
