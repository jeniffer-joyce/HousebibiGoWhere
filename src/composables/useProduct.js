// src/composables/useProduct.js
import { ref, computed, watch, onUnmounted } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/firebase_config'
import { getSellerInfo } from '@/firebase/services/sellers/products'

export function useProduct(productId) {
    const product = ref(null)
    const seller = ref(null)
    const loading = ref(true)
    const productError = ref(null)
    let unsubscribeProduct = null

    // Format price
    const formattedPrice = computed(() => {
        // If there's no price or the price array is empty, return an array with one default price
        if (!product.value?.price || product.value.price.length === 0) return ['$0.00'];

        // If price is an array, format each value and return as an array
        if (Array.isArray(product.value.price)) {
            return product.value.price.map(p => `$${parseFloat(p).toFixed(2)}`);
        }

        // Otherwise, format as a single price in an array
        return [`$${parseFloat(product.value.price).toFixed(2)}`];
    });

    // Get product images array
    const productImages = computed(() => {
        if (!product.value) return []

        // If product has images array, use it
        if (product.value.images && Array.isArray(product.value.images)) {
            return product.value.images
        }

        // Otherwise, use the main image
        if (product.value.img_url) {
            return [product.value.img_url]
        }

        return []
    })

    const stock = computed(() => {
        if (!product.value) return []

        // If product has quantity array, use it
        if (product.value.quantity && Array.isArray(product.value.quantity)) {
            return product.value.quantity
        }

        return []
    })

    // Get main display image
    const mainImage = computed(() => {
        const images = productImages.value
        if (images.length === 0) return ''
        return images[0]
    })

    // ✅ Real-time product loading with onSnapshot
    async function loadProduct() {
        try {
            loading.value = true
            productError.value = null

            if (!productId.value) {
                productError.value = 'No product ID provided'
                loading.value = false
                return
            }

            // Clean up previous listener if exists
            if (unsubscribeProduct) {
                unsubscribeProduct()
            }

            // ✅ Set up real-time listener for this specific product
            const productRef = doc(db, 'products', productId.value)
            
            unsubscribeProduct = onSnapshot(
                productRef,
                async (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data()
                        product.value = {
                            id: docSnap.id,
                            ...data,
                            // ✅ Ensure rating is always a number
                            rating: typeof data.rating === 'number' ? data.rating : 0
                        }

                        console.log('✅ Product loaded/updated:', product.value.item_name)
                        console.log('⭐ Product rating:', product.value.rating)

                        // Fetch seller information if sellerID exists
                        if (product.value.sellerID) {
                            try {
                                seller.value = await getSellerInfo(product.value.sellerID)
                            } catch (sellerErr) {
                                console.error('Error loading seller:', sellerErr)
                            }
                        }

                        loading.value = false
                    } else {
                        productError.value = 'Product not found'
                        product.value = null
                        loading.value = false
                    }
                },
                (err) => {
                    console.error('❌ Error loading product:', err)
                    productError.value = err.message || 'Failed to load product'
                    loading.value = false
                }
            )

        } catch (err) {
            console.error('❌ Error setting up product listener:', err)
            productError.value = err.message || 'Failed to load product'
            loading.value = false
        }
    }

    // Watch for productId changes and reload
    watch(productId, () => {
        if (productId.value) {
            loadProduct()
        }
    }, { immediate: true })

    // ✅ Clean up listener on unmount
    onUnmounted(() => {
        if (unsubscribeProduct) {
            unsubscribeProduct()
            console.log('🔌 Product listener unsubscribed')
        }
    })

    return {
        // State
        product,
        seller,
        loading,
        productError,

        // Computed
        formattedPrice,
        productImages,
        mainImage,
        stock,

        // Methods
        loadProduct
    }
}