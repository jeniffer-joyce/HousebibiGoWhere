<script setup>
import { ref, computed, onMounted } from 'vue'
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue'
import MessageButton from '@/components/messageButton.vue'
import { useFavorites } from '@/composables/useFavorites.js'
import { useToast } from '@/composables/useToast.js'
import { uiState } from '@/store/ui.js'
import { auth, db } from '@/firebase/firebase_config'
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const followedBusinesses = ref([])
const loadingBusinesses = ref(true)

const {
  favoriteProducts,
  toggleProductFavorite
} = useFavorites()

const isSidebarCollapsed = computed(() => uiState.isSidebarCollapsed.value)

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
  const q = searchQuery.value.toLowerCase()
  return followedBusinesses.value.filter(b => {
    const name = (b.name || b.businessName || '').toLowerCase()
    const category = (b.category || '').toLowerCase()
    return name.includes(q) || category.includes(q)
  })
})

async function loadFollowedBusinesses(userId) {
  if (!userId) { loadingBusinesses.value = false; return }
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) { followedBusinesses.value = []; loadingBusinesses.value = false; return }
    const favIds = userDoc.data().favoriteBusinesses || []
    if (!favIds.length) { followedBusinesses.value = []; loadingBusinesses.value = false; return }
    const docs = await Promise.all(favIds.map(id => getDoc(doc(db, 'businesses', id))))
    followedBusinesses.value = docs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data(), isFavorite: true }))
  } catch (e) {
    console.error('Error loading followed businesses:', e)
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
    await updateDoc(userRef, { favoriteBusinesses: arrayRemove(businessId) })
    const bdoc = await getDoc(businessRef)
    if (bdoc.exists()) {
      const currentFollowers = bdoc.data().followers || 0
      await updateDoc(businessRef, { followers: Math.max(0, currentFollowers - 1) })
    }
    followedBusinesses.value = followedBusinesses.value.filter(b => b.id !== businessId)
    useToast.success(`Unfollowed ${businessName}`)
  } catch (e) {
    console.error('Error unfollowing business:', e)
    useToast.error('Failed to unfollow business')
  }
}

onMounted(() => {
  onAuthStateChanged(auth, async (u) => {
    if (u) await loadFollowedBusinesses(u.uid)
    else { followedBusinesses.value = []; loadingBusinesses.value = false }
  })
})
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <!-- Sidebar Navigation -->
    <BuyerSideBar />

    <!-- Main Content Area -->
    <main
      class="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 min-h-screen"
      :class="isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'"
    >
      <!-- Container with max-width that adjusts based on sidebar state -->
      <div class="w-full mx-auto"
           :class="isSidebarCollapsed ? 'md:max-w-[calc(100vw-7rem)]' : 'md:max-w-[calc(100vw-18rem)]'"
      >
      <!-- Header -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 md:mb-8 gap-4">
        <div class="flex-shrink-0">
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            My Favorites
          </h1>
          <p class="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
            Products & Businesses you love
          </p>
        </div>

        <div class="w-full lg:w-96 lg:flex-shrink-0">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search your favorite products or businesses..."
            class="w-full pl-4 pr-4 py-2 md:py-2.5 text-sm md:text-base border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <!-- Favorite Products -->
      <div class="mb-6">
        <p class="text-sm md:text-base text-slate-600 dark:text-slate-400">
          You have <span class="font-semibold text-primary">{{ favoriteProducts.length }}</span> favorite products
        </p>
      </div>

      <div v-if="filteredProducts.length > 0" class="mb-8">
        <h2 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6">
          Your Favorite Products
        </h2>

        <div class="grid gap-4 md:gap-5"
             :class="isSidebarCollapsed 
               ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
               : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'"
        >
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
          >
            <RouterLink
              :to="{ name: 'ProductDetails', params: { id: product.id }, query: { fromFavourites: 'true', shop: product.seller_id || product.sellerId || product.sellerID, productsPage: 1 }}"
              class="block"
            >
              <div class="relative w-full h-32 sm:h-40 md:h-44 lg:h-48 overflow-hidden">
                <img :src="product.img_url" :alt="product.item_name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>

              <div class="p-3 md:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="text-sm md:text-base font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {{ product.item_name }}
                  </h3>
                  <p class="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">{{ product.sellerName }}</p>
                  <p class="text-sm md:text-base font-bold text-slate-900 dark:text-white">
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

            <button
              @click.prevent="toggleProductFavorite(product)"
              title="Unfavourite this product"
              class="absolute top-2 right-2 md:top-3 md:right-3 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 hover:scale-110 transition-all duration-200 z-10"
            >
              <svg class="h-5 w-5 md:h-6 md:w-6 transition-colors" :class="product.isFavorite ? 'text-red-500 fill-current' : 'text-slate-400'"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

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

      <!-- Favorite Businesses -->
      <div class="mb-6">
        <p class="text-sm md:text-base text-slate-600 dark:text-slate-400">
          You have <span class="font-semibold text-primary">{{ followedBusinesses.length }}</span> favorite businesses
        </p>
      </div>

      <div v-if="filteredBusinesses.length > 0">
        <h2 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6">
          Your Favorite Businesses
        </h2>
        
        <div class="grid gap-4 md:gap-5"
             :class="isSidebarCollapsed 
               ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
               : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3'"
        >
        <div
          v-for="business in filteredBusinesses"
          :key="business.id"
          class="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
        >
          <div class="relative w-full h-40 sm:h-44 md:h-48 lg:h-52">
            <img :src="business.profilePic || 'https://via.placeholder.com/400x300?text=No+Image'" :alt="business.name" class="w-full h-full object-cover" />
            <button
              @click="unfollowBusiness(business.id, business.name)"
              title="Unfavourite this business"
              class="absolute top-2 right-2 md:top-3 md:right-3 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 hover:scale-110 transition-all duration-200 shadow-md z-10"
              type="button"
            >
              <svg class="h-5 w-5 md:h-6 md:w-6 text-red-500 fill-current"
                   viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>

          <div class="p-4 md:p-5 flex-1 flex flex-col justify-between">
            <div class="mb-3">
              <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                {{ business.category || 'Business' }}
              </span>
            </div>

            <h3 class="text-base md:text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
              {{ business.name }}
            </h3>

            <p class="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-grow">
              {{ business.bio || business.description || 'No description available' }}
            </p>

            <!-- Actions: responsive button layout with proper wrapping -->
            <div class="flex flex-col sm:flex-row gap-2 mt-auto">
              <!-- Visit Store Button -->
              <RouterLink 
                :to="{ name: 'ShopDetails', params: { id: business.id || business.uid } }" 
                class="flex-1"
              >
                <button
                  class="w-full px-3 py-2 md:py-2.5 text-xs md:text-sm font-medium whitespace-nowrap rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  Visit Store
                </button>
              </RouterLink>

              <!-- Message Button -->
              <div class="flex-1 sm:flex-none sm:min-w-[44px]">
                <MessageButton
                  :seller-id="business.id || business.uid"
                  :seller-name="business.name || business.businessName"
                  variant="secondary"
                  size="sm"
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <svg class="h-24 w-24 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">No favorite businesses yet</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-6">Start exploring and add businesses to your favorites!</p>
        <RouterLink to="/businesses">
          <button class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Explore Businesses
          </button>
        </RouterLink>
      </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
button {
  transition: all 0.2s ease;
}
</style>