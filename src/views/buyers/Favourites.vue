<script setup>
import { ref, computed, onMounted } from 'vue'
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue'
import { useFavorites } from '@/composables/useFavorites.js'
import { auth, db } from '@/firebase/firebase_config'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const followedBusinesses = ref([])
const loadingBusinesses = ref(true)

const {
  isSidebarCollapsed,
  favorites,
  favoriteProducts,
  handleSidebarToggle,
  toggleFavorite,
  toggleProductFavorite
} = useFavorites()

// Search input
const searchQuery = ref('')

// Filtered favorites for products
const filteredProducts = computed(() => {
  if (!Array.isArray(favoriteProducts.value)) return []
  
  if (!searchQuery.value) return favoriteProducts.value
  return favoriteProducts.value.filter(p =>
    p.item_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Filtered favorites for businesses
const filteredBusinesses = computed(() => {
  if (!Array.isArray(followedBusinesses.value)) return []
  
  if (!searchQuery.value) return followedBusinesses.value
  
  return followedBusinesses.value.filter(b => {
    const name = (b.name || b.businessName || '').toLowerCase()
    const category = (b.category || '').toLowerCase()
    const searchLower = searchQuery.value.toLowerCase()
    
    return name.includes(searchLower) || category.includes(searchLower)
  })
})

async function loadFollowedBusinesses(userId) {
  console.log('🔍 loadFollowedBusinesses called with userId:', userId)
  
  if (!userId) {
    console.log('❌ No userId provided')
    loadingBusinesses.value = false
    return
  }
  
  try {
    // Get user's favoriteBusinesses array
    const userDoc = await getDoc(doc(db, 'users', userId))
    console.log('📄 userDoc exists?', userDoc.exists())
    
    if (!userDoc.exists()) {
      console.log('❌ User document does not exist')
      followedBusinesses.value = []
      loadingBusinesses.value = false
      return
    }
    
    const userData = userDoc.data()
    console.log('📊 Full userData:', userData)
    
    const favoriteBusinessIds = userData.favoriteBusinesses || []
    console.log('⭐ favoriteBusinessIds:', favoriteBusinessIds)
    console.log('⭐ Count:', favoriteBusinessIds.length)
    
    if (favoriteBusinessIds.length === 0) {
      console.log('⚠️ No favorite businesses found')
      followedBusinesses.value = []
      loadingBusinesses.value = false
      return
    }
    
    // Fetch all followed businesses
    console.log('📡 Fetching', favoriteBusinessIds.length, 'businesses...')
    const businessPromises = favoriteBusinessIds.map(id => 
      getDoc(doc(db, 'businesses', id))
    )
    
    const businessDocs = await Promise.all(businessPromises)
    console.log('📦 Received', businessDocs.length, 'business documents')
    
    const validBusinesses = businessDocs
      .filter(doc => {
        const exists = doc.exists()
        if (!exists) {
          console.log('⚠️ Business document not found:', doc.id)
        }
        return exists
      })
      .map(doc => {
        const data = doc.data()
        console.log('✅ Loaded business:', doc.id, '-', data.name || data.businessName)
        return {
          id: doc.id,
          ...data,
          isFavorite: true
        }
      })
    
    followedBusinesses.value = validBusinesses
    console.log('✅ Final followedBusinesses count:', followedBusinesses.value.length)
    
  } catch (error) {
    console.error('❌ Error loading followed businesses:', error)
    followedBusinesses.value = []
  } finally {
    loadingBusinesses.value = false
  }
}

// ✅ Use Firebase Auth directly (most reliable approach)
onMounted(() => {
  console.log('🎬 Component mounted - setting up auth listener')
  
  // Listen for auth state changes
  onAuthStateChanged(auth, async (firebaseUser) => {
    console.log('🔥 Auth state changed')
    console.log('   User:', firebaseUser ? firebaseUser.uid : 'null')
    
    if (firebaseUser) {
      console.log('✅ User is authenticated, loading favorite businesses...')
      await loadFollowedBusinesses(firebaseUser.uid)
    } else {
      console.log('⚠️ No authenticated user')
      followedBusinesses.value = []
      loadingBusinesses.value = false
    }
  })
})
</script>



<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <!-- Sidebar Navigation -->
    <BuyerSideBar @sidebar-toggle="handleSidebarToggle" />

    <!-- Main Content Area -->
    <main
      class="flex-1 p-4 sm:p-6 md:p-8 transition-all duration-300"
      :class="isSidebarCollapsed ? 'ml-20' : 'ml-64'"
    >
      <!-- Header -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-0">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            My Favorites
          </h1>
          <p class="text-slate-600 dark:text-slate-400 mt-1">
            Products & Businesses you love
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
          <!-- Unified Search -->
          <div class="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 ml-auto">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search your favorite products or businesses..."
              class="w-full pl-4 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <!-- Favorites Count for Products -->
      <div class="mb-6">
        <p class="text-slate-600 dark:text-slate-400">
          You have <span class="font-semibold text-primary">{{ favoriteProducts.length }}</span> favorite products
        </p>
      </div>

      <!-- Favorited Products Section -->
      <div v-if="filteredProducts.length > 0" class="mb-8">
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Your Favorite Products
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <div v-for="product in filteredProducts" :key="product.id"
               class="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div class="relative w-full h-48 sm:h-56 md:h-48 lg:h-52">
              <img :src="product.img_url" :alt="product.item_name" class="w-full h-full object-cover" />
              <button @click="toggleProductFavorite(product)"
                      class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors">
                <svg :class="['h-6 w-6 transition-colors', product.isFavorite ? 'text-red-500 fill-current' : 'text-slate-400']"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>
            <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">{{ product.item_name }}</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">{{ product.sellerName }}</p>
                <p class="font-bold">
                  {{
                    (() => {
                      if (!product.sizes || !product.sizes.length) return '$0';
                      const prices = product.sizes.map(s => s.price);
                      const min = Math.min(...prices);
                      const max = Math.max(...prices);
                      return min === max ? `$${min}` : `$${min} - $${max}`;
                    })()
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State for Favorite Products -->
      <div v-else class="text-center py-16">
        <svg class="h-24 w-24 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor"
             viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">No favorite products yet</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-6">Start exploring and add products to your favorites!</p>
        <RouterLink to="/products/">
          <button class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Explore Products
          </button>
        </RouterLink>
      </div>

      <!-- Favorites Count for Businesses -->
      <div class="mb-6">
        <p class="text-slate-600 dark:text-slate-400">
          You have <span class="font-semibold text-primary">{{ followedBusinesses.length }}</span> favorite businesses
        </p>
      </div>

      <!-- ✅ FIXED: Favorites Grid for Businesses -->
      <div v-if="filteredBusinesses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div v-for="business in filteredBusinesses" :key="business.id"
             class="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
          <!-- ✅ FIXED: Use profilePic instead of image -->
          <div class="relative w-full h-48 sm:h-56 md:h-48 lg:h-52">
            <img 
              :src="business.profilePic || 'https://via.placeholder.com/400x300?text=No+Image'" 
              :alt="business.name" 
              class="w-full h-full object-cover" 
            />
            <button @click="toggleFavorite(business.id)"
                    class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors">
              <svg :class="['h-6 w-6 transition-colors', business.isFavorite ? 'text-red-500 fill-current' : 'text-slate-400']"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
          </div>

          <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <!-- Category Badge -->
            <div class="mb-2">
              <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                {{ business.category || 'Business' }}
              </span>
            </div>
            
            <!-- Business Name -->
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">{{ business.name }}</h3>
            
            <!-- ✅ FIXED: Use bio or description -->
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {{ business.bio || business.description || 'No description available' }}
            </p>

            <!-- ✅ FIXED: Rating without reviews count (since it doesn't exist in Firestore) -->
            <div class="flex items-center gap-2 mb-4">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <span class="ml-1 font-semibold text-slate-900 dark:text-white">
                  {{ business.rating ? business.rating.toFixed(1) : 'N/A' }}
                </span>
              </div>
              <!-- ✅ Show followers instead of reviews -->
              <span class="text-sm text-slate-500 dark:text-slate-400">
                {{ business.followers || 0 }} followers
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-2">
              <RouterLink 
                :to="{ name: 'ShopDetails', params: { id: business.id || business.uid } }" 
                class="flex-1"
              >
                <button class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Visit Store
                </button>
              </RouterLink>
              <button
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State for Businesses -->
      <div v-else class="text-center py-16">
        <svg class="h-24 w-24 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor"
             viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">No favorite businesses yet</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-6">Start exploring and add businesses to your favorites!</p>
        <RouterLink to="/businesses">
          <button class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Explore Businesses
          </button>
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
button {
    transition: all 0.2s ease;
}
</style>
