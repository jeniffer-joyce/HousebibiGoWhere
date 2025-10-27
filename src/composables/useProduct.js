// src/composables/useProduct.js
import { ref, computed } from 'vue'
import { getSellerProducts, getSellerInfo } from '@/firebase/services/sellers/products'

export function useProduct(productId) {
    const product = ref(null)
    const seller = ref(null)
    const loading = ref(true)
    const selectedImage = ref(0)
    const error = ref(null)

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

        // If product has images array, use it
        if (product.value.quantity && Array.isArray(product.value.quantity)) {
            return product.value.quantity
        }

        return []
    })

    // Get main display image
    const mainImage = computed(() => {
        const images = productImages.value
        if (images.length === 0) return ''
        return images[selectedImage.value] || images[0]
    })



    // // Availability status
    // const stockStatus = computed(() => {
    //     if (!product.value) return { text: 'Loading...', color: 'text-gray-500' }

    //     // const totalQuantity = Array.isArray(product.value.quantity) ? product.value.quantity.reduce((s, n) => s + (+n || 0), 0) : +product.value.quantity || 0

    //     if (totalQuantity <= 0) {
    //         return {

    //             text: 'Out of stock',
    //             color: 'text-red-600'
    //         }
    //     } else if (totalQuantity <= 10) {
    //         return {

    //             text: 'Limited availability',
    //             color: 'text-yellow-600'
    //         }
    //     } else {
    //         return {
    //             text: `In stock (${totalQuantity} available)`,
    //             color: 'text-green-600'
    //         }
    //     }

    // })

    // Load product data
    async function loadProduct() {
        try {
            loading.value = true
            error.value = null

            // Fetch all products (you might want to optimize this to fetch single product)
            const products = await getSellerProducts()

            // Find the specific product by ID
            product.value = products.find(p => p.id === productId.value)

            if (!product.value) {
                error.value = 'Product not found'
                return
            }

            if (product.value.sellerId) {
                // Fetch seller information
                seller.value = await getSellerInfo(product.value.sellerId)
            }

        } catch (err) {
            console.error('Error loading product:', err)
            error.value = err.message || 'Failed to load product'
        } finally {
            loading.value = false
        }
    }

    // Change selected image
    function selectImage(index) {
        if (index >= 0 && index < productImages.value.length) {
            selectedImage.value = index
        }
    }

    return {
        // State
        product,
        seller,
        loading,
        error,
        selectedImage,

        // Computed
        formattedPrice,
        productImages,
        mainImage,
        stock,

        // Methods
        loadProduct,
        selectImage
    }
}