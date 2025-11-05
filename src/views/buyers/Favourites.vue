<script setup>
import { ref, computed, onMounted } from 'vue'
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue'
import MessageButton from '@/components/messageButton.vue'
import { useFavorites } from '@/composables/useFavorites.js'
import { useToast } from '@/composables/useToast.js'
import { auth, db } from '@/firebase/firebase_config'
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const followedBusinesses = ref([])
const loadingBusinesses = ref(true)

const {
  isSidebarCollapsed,
  favoriteProducts,
  handleSidebarToggle,
  toggleProductFavorite
} = useFavorites()

const searchQuery = ref('')

const filteredProducts = computed(() => {
  if (!Array.isArray(favoriteProducts.value)) return []
  
  if (!searchQuery.value) return favoriteProducts.value
  return favoriteProducts.value.filter(p =>
    p.item_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

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
  if (!userId) {
    loadingBusinesses.value = false
    return
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (!userDoc.exists()) {
      followedBusinesses.value = []
      loadingBusinesses.value = false
      return
    }
    
    const userData = userDoc.data()
    const favoriteBusinessIds = userData.favoriteBusinesses || []
    
    if (favoriteBusinessIds.length === 0) {
      followedBusinesses.value = []
      loadingBusinesses.value = false
      return
    }
    
    const businessPromises = favoriteBusinessIds.map(id => 
      getDoc(doc(db, 'businesses', id))
    )
    
    const businessDocs = await Promise.all(businessPromises)
    
    followedBusinesses.value = businessDocs
      .filter(doc => doc.exists())
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        isFavorite: true
      }))
    
  } catch (error) {
    console.error('Error loading followed businesses:', error)
    followedBusinesses.value = []
  } finally {
    loadingBusinesses.value = false
  }
}

async function unfollowBusiness(businessId, businessName) {
  if (!auth.currentUser) {
    useToast.error('Please log in to manage favorites')
    return
  }
  
  try {
    const userRef = doc(db, 'users', auth.currentUser.uid)
    const businessRef = doc(db, 'businesses', businessId)
    
    await updateDoc(userRef, {
      favoriteBusinesses: arrayRemove(businessId)
    })
    
    const businessDoc = await getDoc(businessRef)
    if (businessDoc.exists()) {
      const currentFollowers = businessDoc.data().followers || 0
      await updateDoc(businessRef, {
        followers: Math.max(0, currentFollowers - 1)
      })
    }
    
    followedBusinesses.value = followedBusinesses.value.filter(b => b.id !== businessId)
    
    useToast.success(`Unfollowed ${businessName}`)
    
  } catch (error) {
    console.error('Error unfollowing business:', error)
    useToast.error('Failed to unfollow business')
  }
}

onMounted(() => {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      await loadFollowedBusinesses(firebaseUser.uid)
    } else {
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
               class="relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
            
            <!-- Clickable Product Link -->
            <RouterLink 
              :to="{ name: 'ProductDetails', params: { id: product.id }, query: { fromFavourites: 'true', shop: product.seller_id || product.sellerId || product.sellerID,  // ✅ ADD THIS
      productsPage: 1 }}"
              class="block"
            >
              <div class="relative w-full h-48 sm:h-56 md:h-48 lg:h-52 overflow-hidden">
                <img 
                  :src="product.img_url" 
                  :alt="product.item_name" 
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
              </div>
              
              <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                    {{ product.item_name }}
                  </h3>
                  <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">{{ product.sellerName }}</p>
                  <p class="font-bold text-slate-900 dark:text-white">
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
            </RouterLink>

            <!-- Favorite button (positioned absolutely to stay outside the link) -->
            <button 
              @click.prevent="toggleProductFavorite(product)"
              title="Unfavourite this product"
              class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 hover:scale-110 transition-all duration-200 z-10"
            >
              <svg :class="['h-6 w-6 transition-colors', product.isFavorite ? 'text-red-500 fill-current' : 'text-slate-400']"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
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

      <!-- Favorites Grid for Businesses -->
      <div v-if="filteredBusinesses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div v-for="business in filteredBusinesses" :key="business.id"
             class="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
          <div class="relative w-full h-48 sm:h-56 md:h-48 lg:h-52">
            <img 
              :src="business.profilePic || 'https://via.placeholder.com/400x300?text=No+Image'" 
              :alt="business.name" 
              class="w-full h-full object-cover" 
            />
            
            <!-- Heart button with native tooltip -->
            <button 
              @click="unfollowBusiness(business.id, business.name)"
              title="Unfavourite this business"
              class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 hover:scale-110 transition-all duration-200 shadow-md z-10"
              type="button"
            >
              <svg class="h-6 w-6 text-red-500 fill-current"
                   viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>

          <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div class="mb-2">
              <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                {{ business.category || 'Business' }}
              </span>
            </div>
            
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">{{ business.name }}</h3>
            
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
              {{ business.bio || business.description || 'No description available' }}
            </p>

            <div class="flex items-center gap-2 mb-4">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <span class="ml-1 font-semibold text-slate-900 dark:text-white">
                  {{ business.rating ? business.rating.toFixed(1) : 'N/A' }}
                </span>
              </div>
              <span class="text-sm text-slate-500 dark:text-slate-400">
                {{ business.followers || 0 }} followers
              </span>
            </div>

            <div class="flex flex-col sm:flex-row gap-2">
              <RouterLink 
                :to="{ name: 'ShopDetails', params: { id: business.id || business.uid } }" 
                class="flex-1"
              >
                <button class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Visit Store
                </button>
              </RouterLink>
              <!-- Message Button Component -->
              <MessageButton 
                :seller-id="business.id || business.uid" 
                :seller-name="business.name || business.businessName" 
                variant="secondary" 
                size="md"
                class="w-full sm:w-auto"
              />
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