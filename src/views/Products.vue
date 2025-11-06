<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useProducts } from '@/composables/useProducts.js'
import { db, auth } from '@/firebase/firebase_config'
import { user } from '@/store/user.js'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import ToastNotification from '@/components/ToastNotification.vue'
import { RouterLink } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

import { useFavorites } from '@/composables/useFavorites.js'

const { products, loading, error } = useProducts()
const { favoriteProducts, toggleProductFavorite, loadFavoriteProducts } = useFavorites()

const showToast = ref(false)
const toastConfig = reactive({
  type: 'warning',
  title: 'Login Required',
  message: 'Please log in or sign up to add items to your wishlist'
})

const RATING_OPTIONS = ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars']

const filters = ref({
  category: [],
  price: ['Under $20', '$20 - $50', '$50 - $100', 'Over $100'],
  seller: [],
  rating: [...RATING_OPTIONS],
})

const selectedFilters = reactive({
  category: null,
  price: null,
  seller: null,
  rating: null,
})

const selectedSort = ref('Most Popular')
const openFilter = ref(null)

const selectedFilterArray = computed(() => {
  return Object.entries(selectedFilters).filter(([key, val]) => val)
})

function handleWishlistClick(product) {
  if (!user.isLoggedIn) {
    showToast.value = true
  } else {
    console.log('Adding to wishlist:', product)
  }
}

function closeToast() {
  showToast.value = false
}

function toggleDropdown(key) {
  openFilter.value = openFilter.value === key ? null : key
}

function selectOption(key, option) {
  selectedFilters[key] = option
  openFilter.value = null
}

function clearAllFilters() {
  Object.keys(selectedFilters).forEach(key => selectedFilters[key] = null)
  openFilter.value = null
}

function clearFilter(key) {
  selectedFilters[key] = null
}

function handleClickOutside(event) {
  if (!event.target.closest('.filter-dropdown')) {
    openFilter.value = null
  }
}

const categoryList = ref([])

async function loadCategories() {
  try {
    const categoriesRef = collection(db, 'button_categories')
    const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'))
    const snapshot = await getDocs(categoriesQuery)
    
    categoryList.value = snapshot.docs.map(doc => ({
      name: doc.data().name,
      slug: doc.data().slug
    }))
    
    filters.value.category = categoryList.value.map(cat => cat.name)
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

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

    const rating = typeof product.rating === 'number' ? product.rating : 0

    return {
      ...product,
      sizes: sizesArray,
      rating: rating
    }
  })
})

const availableSellers = computed(() => {
  const sellersSet = new Set()
  normalizedProducts.value.forEach(p => sellersSet.add(p.sellerName))
  return Array.from(sellersSet)
})

// Store dropdown button refs for positioning
const dropdownButtonRefs = ref({})

// Computed property to get dropdown position
// Computed property to get dropdown position (relative to button)
const getDropdownPosition = computed(() => {
  return (key) => {
    return {
      top: '100%',
      left: '0',
      marginTop: '0.5rem'
    }
  }
})


const dropdownOptions = computed(() => ({
  category: categoryList.value.map(cat => cat.name),
  price: ['Under $20', '$20 - $50', '$50 - $100', 'Over $100'],
  seller: availableSellers.value,
  rating: RATING_OPTIONS
}))

watch([products, normalizedProducts], () => {
  filters.value.seller = availableSellers.value
}, { immediate: true })

const displayedProducts = computed(() => {
  let list = [...normalizedProducts.value]

  list = list.filter(product => {
    const prices = product.sizes.map(s => s.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)

    const matchesCategory = !selectedFilters.category || (() => {
      const selectedCat = categoryList.value.find(cat => cat.name === selectedFilters.category)
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

const currentPage = ref(1)
const itemsPerPage = ref(12)
const totalPages = computed(() => Math.ceil(displayedProducts.value.length / itemsPerPage.value))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return displayedProducts.value.slice(start, end)
})

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

function getRatingDisplay(rating) {
  const numRating = typeof rating === 'number' ? rating : 0
  return numRating > 0 ? numRating.toFixed(1) : 'No rating'
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadCategories()
  
  if (user.value?.uid) {
    loadFavoriteProducts(user.value.uid)
  }
  
  const pageFromQuery = parseInt(route.query.page)
  if (pageFromQuery && pageFromQuery > 0) {
    currentPage.value = pageFromQuery
  }
})

watch(currentPage, (newPage) => {
  router.replace({
    name: 'Products',
    query: { page: newPage }
  })
})

watch([selectedFilters, selectedSort], () => {
  currentPage.value = 1
})

watch(paginatedProducts, (products) => {
  console.log('📄 Current page:', currentPage.value)
  console.log('📦 Products on page:', products.length)
  if (products[0]) {
    console.log('First product:', products[0].item_name)
    console.log('First product rating:', products[0].rating)
  }
}, { immediate: true })

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
<main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
  <div class="flex items-center gap-2 text-sm text-subtle-light dark:text-subtle-dark mb-6">
    <RouterLink to="/" class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary">Home</RouterLink>
    <span class="material-symbols-outlined text-base">chevron_right</span>
    <span class="font-medium text-foreground-light dark:text-foreground-dark">Products</span>
  </div>

  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Sidebar filters -->
    <aside class="w-full lg:w-1/4 overflow-visible">
      <div class="sticky top-28 overflow-visible">
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
              <div v-for="(options, key) in dropdownOptions" :key="key" class="relative filter-dropdown">
                <button 
                  :ref="el => { if (el) dropdownButtonRefs[key] = el }"
                  @click.stop="toggleDropdown(key)" 
                  class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-background-light dark:bg-background-dark hover:bg-primary/10 dark:hover:bg-primary/20">
                  {{ selectedFilters[key] || key.charAt(0).toUpperCase() + key.slice(1) }}
                  <span class="material-symbols-outlined text-lg transition-transform duration-200"
                        :class="{ 'rotate-180': openFilter === key }">expand_more</span>
                </button>

                <div v-if="openFilter === key" class="absolute mt-2 bg-background-light dark:bg-background-dark border rounded-lg shadow-lg z-[9999] w-40 top-full left-0">
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
    <div class="flex-1 min-h-[60vh]">
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
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
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
            query: { fromProductsPage: true, shop: item.seller_username || item.sellerId || item.seller_id, productsPage: currentPage }
          }"
            class="block overflow-hidden rounded-lg bg-background-light dark:bg-background-dark"
          >
            <!-- Product image -->
            <div
              class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              :style="{ backgroundImage: `url(${item.img_url})` }"
            ></div>

            <!-- Product Info -->
            <div class="pt-2 md:pt-3 px-1 md:px-0">
              <h3 class="font-bold text-sm md:text-base truncate">{{ item.item_name }}</h3>
              <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                {{ item.sellerName }}
              </p>
              <p class="font-bold mt-1 text-sm md:text-base">
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

              <!-- ✅ Fixed Rating Display -->
              <div class="flex items-center mt-1">
                <template v-if="item.rating > 0">
                  <!-- Stars -->
                  <span v-for="n in 5" :key="n" class="text-yellow-500 text-xs md:text-sm">
                    <span v-if="n <= Math.floor(item.rating)">★</span>
                    <span v-else-if="n === Math.ceil(item.rating) && item.rating % 1 !== 0" class="relative inline-block">
                      <span class="text-gray-300 dark:text-gray-600">★</span>
                      <span class="absolute left-0 top-0 overflow-hidden" :style="`width: ${(item.rating % 1) * 100}%`">★</span>
                    </span>
                    <span v-else class="text-gray-300 dark:text-gray-600">★</span>
                  </span>
                  <!-- Rating number -->
                  <span class="ml-1 md:ml-2 text-xs text-gray-600 dark:text-gray-400">
                    {{ item.rating.toFixed(1) }}/5
                  </span>
                </template>
                <template v-else>
                  <!-- No rating yet -->
                  <span v-for="n in 5" :key="n" class="text-gray-300 dark:text-gray-600 text-xs md:text-sm">★</span>
                  <span class="ml-1 md:ml-2 text-xs text-gray-400 dark:text-gray-500">No rating</span>
                </template>
              </div>
            </div>
          </RouterLink>

          <!-- Favorite button now OUTSIDE the link -->
          <button
            @click="toggleProductFavorite(item)"
            class="absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors z-20"
          >
            <svg
              :class="[
                'h-5 w-5 md:h-6 md:w-6 transition-colors',
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
      <div class="flex flex-wrap justify-center items-center gap-1 md:gap-2 mt-8 text-xs md:text-sm px-2">
        <!-- Prev -->
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-2 md:px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-xs md:text-sm"
        >
          ‹ Prev
        </button>

        <!-- Page numbers -->
        <template v-for="(page, idx) in visiblePages" :key="idx">
          <button
            v-if="page !== '...'"
            @click="goToPage(page)"
            :class="[
              'px-2 md:px-3 py-1 rounded transition text-xs md:text-sm',
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            {{ page }}
          </button>
          <span v-else class="px-1 md:px-2 select-none">…</span>
        </template>

        <!-- Next -->
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-2 md:px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-xs md:text-sm"
        >
          Next ›
        </button>

        <!-- Last -->
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="px-2 md:px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-xs md:text-sm"
        >
          Last »
        </button>

        <!-- Go to page dropdown -->
        <div class="ml-2 md:ml-4 flex items-center gap-1 md:gap-2">
          <label for="goto" class="text-gray-600 dark:text-gray-300 hidden md:inline text-xs md:text-sm">Go to page:</label>
          <select
            id="goto"
            v-model.number="currentPage"
            class="border rounded px-1 md:px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs md:text-sm"
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

    <!-- Toast Notification -->
    <ToastNotification
      :show="showToast"
      :type="toastConfig.type"
      :title="toastConfig.title"
      :message="toastConfig.message"
      :duration="4000"
      @close="closeToast"
    />
  </div>
</main>
</template>