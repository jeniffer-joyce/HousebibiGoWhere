import { ref, onMounted, onUnmounted } from 'vue'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/firebase_config'

export function useProducts() {
  const products = ref([])
  const loading = ref(true)
  const error = ref(null)
  let unsubscribe = null

  onMounted(() => {
    try {
      // Create query for products
      const productsRef = collection(db, 'products')
      const productsQuery = query(productsRef, orderBy('createdAt', 'desc'))

      // ✅ Use onSnapshot for real-time updates instead of getDocs
      unsubscribe = onSnapshot(
        productsQuery,
        (snapshot) => {
          products.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // ✅ Ensure rating is always a number
            rating: typeof doc.data().rating === 'number' ? doc.data().rating : 0
          }))
          loading.value = false
          console.log('✅ Products loaded/updated:', products.value.length)
        },
        (err) => {
          console.error('Error fetching products:', err)
          error.value = err.message
          loading.value = false
        }
      )
    } catch (err) {
      console.error('Error setting up products listener:', err)
      error.value = err.message
      loading.value = false
    }
  })

  // ✅ Clean up listener when component unmounts
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
      console.log('🔌 Products listener unsubscribed')
    }
  })

  return {
    products,
    loading,
    error
  }
}