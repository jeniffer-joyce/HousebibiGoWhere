import { ref, onMounted } from 'vue'
import { getSellerProducts } from '@/firebase/services/sellers/products.js'

export function useProducts() {
  const products = ref([])
  const loading = ref(true)
  const error = ref(null)

  onMounted(async () => {
    try {
      // You can pass a sellerID if you want to filter by seller later.
      const result = await getSellerProducts()
      products.value = result
    } catch (err) {
      console.error('❌ Error loading products:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  })

  return {
    products,
    loading,
    error
  }
}