import { ref, watch } from 'vue'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase/firebase_config'
import { user } from '@/store/user'

export function useFavorites() {
  // Sidebar state
  const isSidebarCollapsed = ref(false)
  function handleSidebarToggle(collapsed) {
    isSidebarCollapsed.value = collapsed
  }

  // State
  const favorites = ref([]) // businesses
  const favoriteProducts = ref([]) // products

  // Normalize multiple prices (for products)
  function normalizeProductData(products) {
    return products.map(p => {
      let sizesArray = []
      if (Array.isArray(p.price) && p.price.length) {
        sizesArray = p.price
          .filter(v => typeof v === 'number')
          .map(v => ({ price: v }))
      } else if (typeof p.price === 'number') {
        sizesArray = [{ price: p.price }]
      } else {
        sizesArray = [{ price: 0 }]
      }
      return { ...p, sizes: sizesArray }
    })
  }

  // Load favorite products
  async function loadFavoriteProducts(uid) {
    if (!uid) return
    const userRef = doc(db, 'users', uid)
    const snap = await getDoc(userRef)
    if (snap.exists()) {
      const favs = snap.data().favourites || []
      const productPromises = favs.map(async productId => {
        const prodSnap = await getDoc(doc(db, 'products', productId))
        if (!prodSnap.exists()) return null
        const data = prodSnap.data()
        return {
          id: prodSnap.id,
          item_name: data.item_name || 'Unnamed Product',
          sellerName: data.sellerName || 'Unknown Seller',
          price: data.price || 0,
          img_url: data.img_url || 'https://via.placeholder.com/150',
          rating: data.rating || 0,
          isFavorite: true
        }
      })

      const products = await Promise.all(productPromises)
      favoriteProducts.value = normalizeProductData(products.filter(p => p))
    }
  }

  // Load favorite businesses (NEW!)
  async function loadFavoriteBusinesses(uid) {
    if (!uid) return
    const userRef = doc(db, 'users', uid)
    const snap = await getDoc(userRef)
    if (snap.exists()) {
      const favBiz = snap.data().favouriteBusinesses || []
      const businessPromises = favBiz.map(async businessId => {
        const bizSnap = await getDoc(doc(db, 'businesses', businessId))
        if (!bizSnap.exists()) return null
        const data = bizSnap.data()
        return {
          id: bizSnap.id,
          name: data.name || 'Unnamed Business',
          category: data.category || 'Uncategorized',
          description: data.description || '',
          rating: data.rating || 0,
          reviews: data.reviews || 0,
          image: data.profilePic || 'https://via.placeholder.com/300x200',
          isFavorite: true
        }
      })
      const businesses = await Promise.all(businessPromises)
      favorites.value = businesses.filter(b => b)
    }
  }

  // Toggle functions
  function toggleFavorite(businessId) {
    const business = favorites.value.find(b => b.id === businessId)
    if (business) {
      business.isFavorite = !business.isFavorite
      if (!business.isFavorite) {
        setTimeout(() => {
          favorites.value = favorites.value.filter(b => b.id !== businessId)
        }, 300)
      }
    }
  }

  function toggleProductFavorite(productId) {
    const product = favoriteProducts.value.find(p => p.id === productId)
    if (!product) return
    product.isFavorite = !product.isFavorite
    if (!product.isFavorite) {
      favoriteProducts.value = favoriteProducts.value.filter(p => p.id !== productId)
    }
  }

  // Auto-load when user logs in
  watch(
    user,
    val => {
      if (val && val.uid) {
        loadFavoriteProducts(val.uid)
        loadFavoriteBusinesses(val.uid)
      }
    },
    { immediate: true }
  )

  return {
    // state
    isSidebarCollapsed,
    favorites,
    favoriteProducts,
    // methods
    handleSidebarToggle,
    toggleFavorite,
    toggleProductFavorite,
    loadFavoriteProducts,
    loadFavoriteBusinesses
  }
}