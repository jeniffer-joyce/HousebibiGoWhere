<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useProducts } from '@/composables/useProducts.js'
import { db, auth } from '@/firebase/firebase_config'
import { user } from '@/store/user.js'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import ToastNotification from '@/components/ToastNotification.vue' // Import toast
import { RouterLink } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Import useFavorites
import { useFavorites } from '@/composables/useFavorites.js'

// Fetch products from Firestore
const { products, loading, error } = useProducts()

// Use favorites composable
const { favoriteProducts, toggleProductFavorite, loadFavoriteProducts } = useFavorites()

// Toast notification state
const showToast = ref(false)
const toastConfig = reactive({
  type: 'warning',
  title: 'Login Required',
  message: 'Please log in or sign up to add items to your wishlist'
})
// Filters data
const filters = ref({
  category: [], // dynamically populated from button_categories
  price: ['Under $20', '$20 - $50', '$50 - $100', 'Over $100'],
  seller: [], // dynamically populated
  rating: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
})

// Track selected filter option
const selectedFilters = reactive({
  category: null,
  price: null,
  seller: null,
  rating: null,
})

// Sort selection
const selectedSort = ref('Most Popular')

// Track which dropdown is open
const openFilter = ref(null)

// Selected filter pills for display
const selectedFilterArray = computed(() => {
  return Object.entries(selectedFilters).filter(([key, val]) => val)
})

// Handle wishlist button click
function handleWishlistClick(product) {
  if (!user.isLoggedIn) {
    // Show toast notification
    showToast.value = true
  } else {
    // TODO: Add to wishlist logic for logged-in users
    console.log('Adding to wishlist:', product)
    // You can implement actual wishlist functionality here later
  }
}

// Close toast notification
function closeToast() {
  showToast.value = false
}
// Toggle dropdown open/close
function toggleDropdown(key) {
  openFilter.value = openFilter.value === key ? null : key
}

// Select an option
function selectOption(key, option) {
  selectedFilters[key] = option
  openFilter.value = null
}

// Clear all filters
function clearAllFilters() {
  Object.keys(selectedFilters).forEach(key => selectedFilters[key] = null)
  openFilter.value = null
}

// Clear individual filter
function clearFilter(key) {
  selectedFilters[key] = null
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  if (!event.target.closest('.filter-dropdown')) {
    openFilter.value = null
  }
}

// Load categories from button_categories collection
// Store category data with both name and slug
const categoryList = ref([])

async function loadCategories() {
  try {
    const categoriesRef = collection(db, 'button_categories')
    const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'))
    const snapshot = await getDocs(categoriesQuery)
    
    // Store full category objects
    categoryList.value = snapshot.docs.map(doc => ({
      name: doc.data().name,
      slug: doc.data().slug
    }))
    
    // Display names in dropdown
    filters.value.category = categoryList.value.map(cat => cat.name)
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadCategories()
})

onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

// Normalize products to handle array/single price
const normalizedProducts = computed(() => {
  return products.value.map(product => {
    let sizesArray = []

    if (Array.isArray(product.price) && product.price.length) {
      sizesArray = product.price.filter(p => typeof p === 'number').map(p => ({ price: p }))
    } else if (typeof product.price === 'number') {
      sizesArray = [{ price: product.price }]
    } else {
      sizesArray = [{ price: 0 }]
    }

    return {
      ...product,
      sizes: sizesArray
    }
  })
})

// Dynamically populate seller filter based on available products
const availableSellers = computed(() => {
  const sellersSet = new Set()
  normalizedProducts.value.forEach(p => sellersSet.add(p.sellerName))
  return Array.from(sellersSet)
})

// Update filters.seller when products load or change
watch([products, normalizedProducts], () => {
  filters.value.seller = availableSellers.value
}, { immediate: true })

// Final displayed products: filtered + sorted
const displayedProducts = computed(() => {
  let list = [...normalizedProducts.value]

  // Apply filters
  list = list.filter(product => {
    const prices = product.sizes.map(s => s.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)

    const matchesCategory = !selectedFilters.category || (() => {
  // Find the category object by name
    const selectedCat = categoryList.value.find(cat => cat.name === selectedFilters.category)
    // Match product's category (slug) with selected category's slug
    return selectedCat && product.category === selectedCat.slug
  })()

    const matchesPrice =
      !selectedFilters.price ||
      (selectedFilters.price === 'Under $20' && max < 20) ||
      (selectedFilters.price === '$20 - $50' && min >= 20 && max <= 50) ||
      (selectedFilters.price === '$50 - $100' && min >= 50 && max <= 100) ||
      (selectedFilters.price === 'Over $100' && min > 100)

    const matchesSeller =
      !selectedFilters.seller || product.sellerName === selectedFilters.seller

    const matchesRating =
      !selectedFilters.rating || Math.floor(product.rating || 0) === Number(selectedFilters.rating[0])

    return matchesCategory && matchesPrice && matchesSeller && matchesRating
  })

  // Apply sorting
  switch (selectedSort.value) {
    case 'Price: Low to High':
      list.sort((a, b) => Math.min(...a.sizes.map(s => s.price)) - Math.min(...b.sizes.map(s => s.price)))
      break
    case 'Price: High to Low':
      list.sort((a, b) => Math.max(...b.sizes.map(s => s.price)) - Math.max(...a.sizes.map(s => s.price)))
      break
    case 'Newest':
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      break
    case 'Most Popular':
    default:
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }

  return list
})

// NEW: Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(12) // products per page
const totalPages = computed(() => Math.ceil(displayedProducts.value.length / itemsPerPage.value))

// NEW: Paginated products
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return displayedProducts.value.slice(start, end)
})

// NEW: Generate visible page numbers (show 1, 2, …, last)
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  } else {
    if (currentPage.value <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages.value)
    } else if (currentPage.value >= totalPages.value - 2) {
      pages.push(1, '...', totalPages.value - 3, totalPages.value - 2, totalPages.value - 1, totalPages.value)
    } else {
      pages.push(
        1,
        '...',
        currentPage.value - 1,
        currentPage.value,
        currentPage.value + 1,
        '...',
        totalPages.value
      )
    }
  }
  return pages
})

// NEW: Handle page navigation
function goToPage(page) {
  if (page === '...') return
  currentPage.value = page
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

// ✅ CONSOLIDATED onMounted - Only ONE onMounted block
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadCategories()
  
  // Load favorites if user is logged in
  if (user.value?.uid) {
    loadFavoriteProducts(user.value.uid)
  }
  
  // ✅ Restore page from URL query parameter
  const pageFromQuery = parseInt(route.query.page)
  if (pageFromQuery && pageFromQuery > 0) {
    currentPage.value = pageFromQuery
  }
})

watch(currentPage, (newPage) => {
  router.replace({
    name: 'Products',  // ✅ FIXED: Use correct route name
    query: { page: newPage }
  })
})

// Reset to page 1 when filters/sort change
watch([selectedFilters, selectedSort], () => {
  currentPage.value = 1
})

// Debug watcher
watch(paginatedProducts, (products) => {
  console.log('📄 Current page:', currentPage.value)
  console.log('📦 Products on page:', products.length)
  if (products[0]) {
    console.log('First product:', products[0].item_name)
  }
}, { immediate: true })

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

</script>

<template>
<main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex items-center gap-2 text-sm text-subtle-light dark:text-subtle-dark mb-6">
    <RouterLink to="/" class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary">Home</RouterLink>
    <span class="material-symbols-outlined text-base">chevron_right</span>
    <span class="font-medium text-foreground-light dark:text-foreground-dark">Products</span>
  </div>

  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Sidebar filters -->
    <aside class="w-full lg:w-1/4">
      <div class="sticky top-28">
        <h2 class="text-2xl font-bold mb-6">Products</h2>
        <div class="space-y-6">
          <div>
            <h3 class="font-bold mb-3 flex justify-between items-center">
              Filters
              <button v-if="selectedFilterArray.length" @click="clearAllFilters" class="text-sm text-primary hover:underline">Clear All</button>
            </h3>

            <!-- Selected filter pills -->
            <div class="flex flex-wrap gap-2 mb-2">
              <span v-for="([key, val], idx) in selectedFilterArray" :key="key"
                    class="flex items-center gap-1 bg-blue-200 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
                {{ val }}
                <button @click="clearFilter(key)" class="text-xs font-bold">&times;</button>
              </span>
            </div>

            <!-- Filter Dropdowns -->
            <div class="flex flex-wrap gap-2">
              <div v-for="(options, key) in filters" :key="key" class="relative filter-dropdown">
                <button @click.stop="toggleDropdown(key)" 
                        class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-background-light dark:bg-background-dark hover:bg-primary/10 dark:hover:bg-primary/20">
                  {{ selectedFilters[key] || key.charAt(0).toUpperCase() + key.slice(1) }}
                  <span class="material-symbols-outlined text-lg transition-transform duration-200"
                        :class="{ 'rotate-180': openFilter === key }">expand_more</span>
                </button>

                <div v-if="openFilter === key" class="absolute mt-2 bg-background-light dark:bg-background-dark border rounded-lg shadow-lg z-10 w-40">
                  <div v-for="option in options" :key="option" @click="selectOption(key, option)"
                       class="px-4 py-2 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer">
                    {{ option }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sort by -->
          <div>
            <h3 class="font-bold mb-3">Sort by</h3>
            <div class="relative">
              <select v-model="selectedSort"
                      class="form-select appearance-none w-full rounded-lg border-background-dark/20 dark:border-background-light/20 bg-background-light dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-12 px-4 focus:border-primary focus:ring-primary">
                <option>Most Popular</option>
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
              <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-subtle-light dark:text-subtle-dark">unfold_more</span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Products Grid -->
    <div class="flex-1">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-16">
        <span class="text-gray-500 dark:text-gray-400">Loading products...</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-16 text-red-500">
        <span>Error loading products: {{ error }}</span>
      </div>

      <!-- Products -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="item in paginatedProducts"
          :key="item.id"
          class="relative group block hover:opacity-90 transition"
        >
          <!-- ✨ Product link -->
          <RouterLink
            :to="{
            name: 'ProductDetails',
            params: { id: item.id },
            query: { fromProductsPage: true, shop: item.sellerID, productsPage: currentPage }
          }"
            class="block overflow-hidden rounded-lg bg-background-light dark:bg-background-dark"
          >
            <!-- Product image -->
            <div
              class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              :style="{ backgroundImage: `url(${item.img_url})` }"
            ></div>

            <!-- Product Info -->
            <div class="pt-3">
              <h3 class="font-bold text-base truncate">{{ item.item_name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                {{ item.sellerName }}
              </p>
              <p class="font-bold mt-1">
                {{
                  (() => {
                    if (!item.sizes || !item.sizes.length) return '$0'
                    const prices = item.sizes.map(s => s.price)
                    const min = Math.min(...prices)
                    const max = Math.max(...prices)
                    return min === max ? `$${min}` : `$${min} - $${max}`
                  })()
                }}
              </p>

              <div class="flex items-center mt-1">
                <span v-for="n in 5" :key="n" class="text-yellow-500 text-sm">
                  <span v-if="n <= item.rating">★</span>
                  <span v-else class="text-gray-300 dark:text-gray-600">★</span>
                </span>
                <span
                  class="ml-2 text-xs text-subtle-dark dark:text-subtle-dark"
                >
                  {{ item.rating }}/5
                </span>
              </div>
            </div>
          </RouterLink>

          <!-- Favorite button now OUTSIDE the link -->
          <button
            @click="toggleProductFavorite(item)"
            class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors z-20"
          >
            <svg
              :class="[
                'h-6 w-6 transition-colors',
                favoriteProducts.some(p => p.id === item.id && p.isFavorite)
                  ? 'text-red-500 fill-current'
                  : 'text-gray-400'
              ]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>



        <!-- 🔹 Enhanced Pagination Controls -->
        <div class="flex flex-wrap justify-center items-center gap-2 mt-8 text-sm">
          <!-- Prev -->
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-40"
          >
            ‹ Prev
          </button>

          <!-- Page numbers -->
          <template v-for="(page, idx) in visiblePages" :key="idx">
            <button
              v-if="page !== '...'"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 rounded transition',
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              {{ page }}
            </button>
            <span v-else class="px-2 select-none">…</span>
          </template>

          <!-- Next -->
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-40"
          >
            Next ›
          </button>

          <!-- Last -->
          <button
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-40"
          >
            Last »
          </button>

          <!-- Go to page dropdown -->
          <div class="ml-4 flex items-center gap-2">
            <label for="goto" class="text-gray-600 dark:text-gray-300">Go to page:</label>
            <select
              id="goto"
              v-model.number="currentPage"
              class="border rounded px-2 py-1 bg-gray-100 dark:bg-gray-800"
            >
              <option
                v-for="n in totalPages"
                :key="n"
                :value="n"
              >
                {{ n }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>


  
    <!-- Toast Notification -->
    <ToastNotification
      :show="showToast"
      :type="toastConfig.type"
      :title="toastConfig.title"
      :message="toastConfig.message"
      :duration="4000"
      @close="closeToast"
    />
</main>
</template>