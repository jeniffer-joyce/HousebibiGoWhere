// composables/useCart.js
import { ref } from 'vue'
import { db, auth } from "@/firebase/firebase_config"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"

export function useCart() {
    const adding = ref(false)
    const error = ref(null)

    /**
     * Add item to cart
     * @param {Object} product - The product object from Firestore
     * @param {number} quantity - Quantity to add
     * @param {number} sizeIndex - Index of selected size (0 if no sizes)
     */
    async function addToCart(product, quantity = 1, sizeIndex = 0) {
        if (!auth.currentUser) {
            throw new Error('Please log in to add items to cart')
        }

        if (!product || !product.id) {
            throw new Error('Invalid product')
        }

        adding.value = true
        error.value = null

        try {
            const uid = auth.currentUser.uid
            const cartRef = doc(db, 'carts', uid)

            // Prepare cart item data
            const hasSize = product.size && Array.isArray(product.size) && product.size.length > 0
            
            // Helper function to safely get array value
            const getArrayValue = (arr, index, defaultVal = 0) => {
                if (!arr) return defaultVal
                if (!Array.isArray(arr)) return arr
                return arr[index] ?? defaultVal
            }
            
            // Build cart item with safe defaults
            const cartItem = {
                cartItemId: `${product.id}_${hasSize ? sizeIndex : 'nosize'}_${Date.now()}`,
                productId: product.id || '',
                sellerId: product.sellerID || '',
                shopName: product.sellerName || 'Shop',
                sellerUsername: product.username || product.sellerUsername || '',
                item_name: product.item_name || product.name || 'Product',
                img_url: product.images?.[0] || product.img_url || '',
                price: hasSize 
                    ? parseFloat(getArrayValue(product.price, sizeIndex, 0))
                    : parseFloat(product.price || 0),
                quantity: quantity,
                maxStock: hasSize 
                    ? parseInt(getArrayValue(product.quantity, sizeIndex, 0))
                    : parseInt(product.quantity || 0)
            }
            
            // Only add size-related fields if product has sizes
            if (hasSize) {
                cartItem.size = product.size[sizeIndex] || null
                cartItem.sizeIndex = sizeIndex
                cartItem.availableSizes = product.size
                cartItem.allPrices = product.price
                cartItem.allStock = product.quantity
            } else {
                cartItem.size = null
                cartItem.sizeIndex = null
                cartItem.availableSizes = null
                cartItem.allPrices = null
                cartItem.allStock = null
            }
            
            cartItem.addedAt = new Date()

            // Get existing cart
            const cartSnap = await getDoc(cartRef)

            if (cartSnap.exists()) {
                // Cart exists - check if same item+size exists
                const existingItems = cartSnap.data().items || []
                const existingItemIndex = existingItems.findIndex(item => 
                    item.productId === cartItem.productId && 
                    item.sizeIndex === cartItem.sizeIndex
                )

                if (existingItemIndex >= 0) {
                    // Item exists - update quantity
                    const existingItem = existingItems[existingItemIndex]
                    const newQuantity = Math.min(
                        existingItem.quantity + quantity,
                        cartItem.maxStock
                    )
                    
                    existingItems[existingItemIndex] = {
                        ...existingItem,
                        quantity: newQuantity
                    }

                    await updateDoc(cartRef, {
                        items: existingItems,
                        updatedAt: serverTimestamp()
                    })
                } else {
                    // New item - add to array
                    await updateDoc(cartRef, {
                        items: [...existingItems, cartItem],
                        updatedAt: serverTimestamp()
                    })
                }
            } else {
                // Create new cart
                await setDoc(cartRef, {
                    uid: uid,
                    items: [cartItem],
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                })
            }

            return { success: true }
        } catch (err) {
            console.error('Error adding to cart:', err)
            error.value = err.message
            throw err
        } finally {
            adding.value = false
        }
    }

    /**
     * Get cart item count for a user
     */
    async function getCartCount() {
        if (!auth.currentUser) return 0

        try {
            const cartRef = doc(db, 'carts', auth.currentUser.uid)
            const cartSnap = await getDoc(cartRef)

            if (cartSnap.exists()) {
                const items = cartSnap.data().items || []
                return items.reduce((sum, item) => sum + item.quantity, 0)
            }
            return 0
        } catch (err) {
            console.error('Error getting cart count:', err)
            return 0
        }
    }

    return {
        adding,
        error,
        addToCart,
        getCartCount
    }
}