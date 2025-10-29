<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useProducts } from '@/composables/useProducts.js'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db, auth } from '@/firebase/firebase_config'
import { user } from '@/store/user.js'

// Fetch products from Firestore
const { products, loading, error } = useProducts()

// Filters data
const filters = ref({
  price: ['Under $20', '$20 - $50', '$50 - $100', 'Over $100'],
  seller: [], // dynamically populated
  rating: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
})

// Track selected filter option
const selectedFilters = reactive({
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

onMounted(() => document.addEventListener('click', handleClickOutside))
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

    return matchesPrice && matchesSeller && matchesRating
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

// Favourites
const favourites = ref(new Set()) // product IDs

// Load user favourites on mount
async function loadFavourites() {
  if (!user.uid) return
  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) {
    const favs = snap.data().favourites || []
    favourites.value = new Set(favs)
  }
}

async function toggleFavourite(productId) {
  if (!user.uid) {
    alert('Please login to favourite products')
    return
  }

  const userRef = doc(db, 'users', user.uid)

  if (favourites.value.has(productId)) {
    // Remove from favourites
    favourites.value.delete(productId)
    await updateDoc(userRef, {
      favourites: arrayRemove(productId)
    })
  } else {
    // Add to favourites
    favourites.value.add(productId)
    await updateDoc(userRef, {
      favourites: arrayUnion(productId)
    })
  }
}

onMounted(loadFavourites)
</script>

<template>
<main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex items-center gap-2 text-sm text-subtle-light dark:text-subtle-dark mb-6">
    <RouterLink to="/" class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary">Home</RouterLink>
    <span class="material-symbols-outlined text-base">chevron_right</span>
    <span class="font-medium text-foreground-light dark:text-foreground-dark">Crafts</span>
  </div>

  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Sidebar filters -->
    <aside class="w-full lg:w-1/4">
      <div class="sticky top-28">
        <h2 class="text-2xl font-bold mb-6">Crafts</h2>
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
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div class="group" v-for="item in displayedProducts" :key="item.id">
          <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
            <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                 :style="{ backgroundImage: `url(${item.img_url})` }"></div>
                  <button
                    @click="toggleFavourite(item.id)"
                    class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    <svg
                      :class="['h-6 w-6 transition-colors', favourites.has(item.id) ? 'text-red-500 fill-current' : 'text-gray-400']"
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
          <div class="pt-3">
            <h3 class="font-bold text-base">{{ item.item_name }}</h3>
            <p class="text-sm">{{ item.sellerName }}</p>
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
            <!-- Ratings -->
            <div class="flex items-center mt-1">
              <span v-for="n in 5" :key="n" class="text-yellow-500 text-sm">
                <span v-if="n <= item.rating">★</span>
                <span v-else class="text-gray-300 dark:text-gray-600">★</span>
              </span>
              <span class="ml-2 text-xs text-subtle-dark dark:text-subtle-dark">{{ item.rating }}/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
</template>