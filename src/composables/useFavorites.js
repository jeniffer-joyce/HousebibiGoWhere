import { ref, watch } from 'vue'
import { getDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '@/firebase/firebase_config'
import { user } from '@/store/user'

  // State
const isSidebarCollapsed = ref(false)
const favorites = ref([]) // businesses
const favoriteProducts = ref([]) // products

export function useFavorites() {
  // Sidebar state
  function handleSidebarToggle(collapsed) {
    isSidebarCollapsed.value = collapsed
  }

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

  async function toggleProductFavorite(product) {
    if (!user.uid) {
      console.warn('User not ready')
      return
    }

    if (!product || !product.id) return; // safety check

    const userRef = doc(db, 'users', user.uid)

    // Check if product already in favoriteProducts
    const existing = favoriteProducts.value.find(p => p.id === product.id)

    if (existing) {
      existing.isFavorite = !existing.isFavorite

      if (existing.isFavorite) {
        // Add back to favorites in Firestore
        await updateDoc(userRef, { favourites: arrayUnion(product.id) })
      } else {
        // Remove from Firestore
        await updateDoc(userRef, { favourites: arrayRemove(product.id) })
        // Remove from local state
        favoriteProducts.value = favoriteProducts.value.filter(p => p.id !== product.id)
      }
    } else {
      // Add new product to favorites
      const newProd = { ...product, isFavorite: true }
      favoriteProducts.value.push(newProd)
      await updateDoc(userRef, { favourites: arrayUnion(product.id) })
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

  // Return shared refs
  return {
    isSidebarCollapsed,
    favorites,
    favoriteProducts,
    handleSidebarToggle,
    toggleFavorite,
    toggleProductFavorite,
    loadFavoriteProducts,
    loadFavoriteBusinesses
  }
}