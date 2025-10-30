<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { db, auth } from "@/firebase/firebase_config"
import { doc, getDoc, setDoc, updateDoc, arrayRemove, arrayUnion, onSnapshot, collection, query, where, getDocs } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Loading from '@/components/status/Loading.vue';


const router = useRouter()
const currentUser = ref(null)
const cartItems = ref([])
const loading = ref(true)
const updatingItemId = ref(null)
const selectedItems = ref(new Set())
const shopProfilePics = ref({})
const stockWarnings = ref(new Map()) // Map of cartItemId to actual available stock
const actualStockMap = ref(new Map()) // Map of cartItemId to current actual stock from database

// Auth state
onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    if (user) {
        loadCart()
    } else {
        loading.value = false
    }
})

// Load cart from Firestore
let unsubscribe = null
async function loadCart() {
    if (!currentUser.value) return

    loading.value = true

    // Real-time listener for cart updates
    unsubscribe = onSnapshot(
        doc(db, 'carts', currentUser.value.uid),
        (docSnap) => {
            if (docSnap.exists()) {
                cartItems.value = docSnap.data().items || []
                // Load shop profile pictures
                loadShopProfilePics()
                // Validate stock availability
                validateCartStock()
            } else {
                cartItems.value = []
            }
            loading.value = false
        },
        (error) => {
            console.error('Error loading cart:', error)
            loading.value = false
        }
    )
}

// Load shop profile pictures from businesses collection
async function loadShopProfilePics() {
    const sellerIds = [...new Set(cartItems.value.map(item => item.sellerId))]

    for (const sellerId of sellerIds) {
        if (shopProfilePics.value[sellerId]) continue // Skip if already loaded

        try {
            const businessDoc = await getDoc(doc(db, 'businesses', sellerId))
            if (businessDoc.exists()) {
                shopProfilePics.value[sellerId] = businessDoc.data().profilePic || null
            }
        } catch (error) {
            console.error(`Error loading profile pic for seller ${sellerId}:`, error)
        }
    }
}

// Validate cart items against current product stock
async function validateCartStock() {
    if (!currentUser.value || cartItems.value.length === 0) return

    stockWarnings.value.clear()
    actualStockMap.value.clear()

    for (const item of cartItems.value) {
        try {
            // Skip if item doesn't have productId
            if (!item.productId) {
                console.warn('Cart item missing productId:', item)
                continue
            }

            // Fetch the current product document
            const productDoc = await getDoc(doc(db, 'products', item.productId))

            if (!productDoc.exists()) {
                console.error('Product not found:', item.productId)
                // Product no longer exists
                actualStockMap.value.set(item.cartItemId, 0)
                stockWarnings.value.set(item.cartItemId, { available: 0, requested: item.quantity })
                continue
            }

            const productData = productDoc.data()
            let actualStock = 0

            // Check if product has variations (sizes)
            if (item.availableSizes && item.availableSizes.length > 0 && item.sizeIndex !== undefined) {
                // Product with variations - check specific size stock from 'quantity' field
                actualStock = productData.quantity?.[item.sizeIndex] || 0
            } else {
                // Simple product - check main stock from 'quantity' field
                actualStock = productData.quantity || 0
            }

            // Store the actual stock for this item
            actualStockMap.value.set(item.cartItemId, actualStock)

            // Compare actual stock with cart quantity
            // Show warning only if quantity EXCEEDS available stock
            if (item.quantity > actualStock) {
                stockWarnings.value.set(item.cartItemId, {
                    available: actualStock,
                    requested: item.quantity
                })
            }

            // Note: We only show warnings, we don't auto-update the cart
            // Users must manually adjust quantities
        } catch (error) {
            console.error(`Error validating stock for item ${item.cartItemId}:`, error)
        }
    }
}

// Clean up listener on unmount
onMounted(() => {
    return () => {
        if (unsubscribe) unsubscribe()
    }
})

// Update item quantity
async function updateQuantity(item, newQuantity) {
    if (!currentUser.value || newQuantity < 1) return

    // Get actual current stock
    const actualStock = getActualStock(item)

    // Validate against actual stock
    if (newQuantity > actualStock) {
        alert(`Only ${actualStock} items available in stock`)
        return
    }

    updatingItemId.value = item.cartItemId

    try {
        const cartRef = doc(db, 'carts', currentUser.value.uid)
        const cartSnap = await getDoc(cartRef)

        if (cartSnap.exists()) {
            const items = cartSnap.data().items || []
            const updatedItems = items.map(i =>
                i.cartItemId === item.cartItemId
                    ? { ...i, quantity: newQuantity }
                    : i
            )

            await updateDoc(cartRef, {
                items: updatedItems,
                updatedAt: new Date()
            })
        }
    } catch (error) {
        console.error('Error updating quantity:', error)
        alert('Failed to update quantity')
    } finally {
        updatingItemId.value = null
    }
}

// Update item size/variation
async function updateSize(item, newSizeIndex) {
    if (!currentUser.value || !item.availableSizes) return

    updatingItemId.value = item.cartItemId

    try {
        const cartRef = doc(db, 'carts', currentUser.value.uid)
        const cartSnap = await getDoc(cartRef)

        if (cartSnap.exists()) {
            const items = cartSnap.data().items || []
            const updatedItems = items.map(i => {
                if (i.cartItemId === item.cartItemId) {
                    const newQuantity = Math.min(i.quantity, item.allStock[newSizeIndex])
                    return {
                        ...i,
                        sizeIndex: newSizeIndex,
                        size: item.availableSizes[newSizeIndex],
                        price: item.allPrices[newSizeIndex],
                        maxStock: item.allStock[newSizeIndex],
                        quantity: newQuantity
                    }
                }
                return i
            })

            await updateDoc(cartRef, {
                items: updatedItems,
                updatedAt: new Date()
            })
        }
    } catch (error) {
        console.error('Error updating size:', error)
        alert('Failed to update size')
    } finally {
        updatingItemId.value = null
    }
}

// Remove item from cart
async function removeItem(item) {
    if (!currentUser.value) return

    if (!confirm('Remove this item from cart?')) return

    updatingItemId.value = item.cartItemId

    try {
        const cartRef = doc(db, 'carts', currentUser.value.uid)
        const cartSnap = await getDoc(cartRef)

        if (cartSnap.exists()) {
            const items = cartSnap.data().items || []
            const updatedItems = items.filter(i => i.cartItemId !== item.cartItemId)

            await updateDoc(cartRef, {
                items: updatedItems,
                updatedAt: new Date()
            })

            // Remove from selected items if it was selected
            selectedItems.value.delete(item.cartItemId)
        }
    } catch (error) {
        console.error('Error removing item:', error)
        alert('Failed to remove item')
    } finally {
        updatingItemId.value = null
    }
}

// Selection functions
function toggleItemSelection(cartItemId) {
    if (selectedItems.value.has(cartItemId)) {
        selectedItems.value.delete(cartItemId)
    } else {
        selectedItems.value.add(cartItemId)
    }
    // Trigger reactivity
    selectedItems.value = new Set(selectedItems.value)
}

function toggleShopSelection(sellerId) {
    const shopItems = itemsBySeller.value[sellerId].items
    const allSelected = shopItems.every(item => selectedItems.value.has(item.cartItemId))

    if (allSelected) {
        // Deselect all items from this shop
        shopItems.forEach(item => selectedItems.value.delete(item.cartItemId))
    } else {
        // Select all items from this shop
        shopItems.forEach(item => selectedItems.value.add(item.cartItemId))
    }
    // Trigger reactivity
    selectedItems.value = new Set(selectedItems.value)
}

function selectAll() {
    cartItems.value.forEach(item => selectedItems.value.add(item.cartItemId))
    selectedItems.value = new Set(selectedItems.value)
}

function clearAll() {
    selectedItems.value.clear()
    selectedItems.value = new Set(selectedItems.value)
}

function isShopFullySelected(sellerId) {
    const shopItems = itemsBySeller.value[sellerId].items
    return shopItems.length > 0 && shopItems.every(item => selectedItems.value.has(item.cartItemId))
}

function isShopPartiallySelected(sellerId) {
    const shopItems = itemsBySeller.value[sellerId].items
    const selectedCount = shopItems.filter(item => selectedItems.value.has(item.cartItemId)).length
    return selectedCount > 0 && selectedCount < shopItems.length
}

// Computed totals
const itemsSubtotal = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const selectedSubtotal = computed(() => {
    return cartItems.value
        .filter(item => selectedItems.value.has(item.cartItemId))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const totalItems = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const hasStockIssues = computed(() => {
    return stockWarnings.value.size > 0
})

// Get actual current stock for an item (from validation or cart)
function getActualStock(item) {
    // First check if we have validated actual stock
    if (actualStockMap.value.has(item.cartItemId)) {
        return actualStockMap.value.get(item.cartItemId)
    }
    // Fall back to cached maxStock from cart
    return item.maxStock
}

const selectedItemsCount = computed(() => {
    return cartItems.value
        .filter(item => selectedItems.value.has(item.cartItemId))
        .reduce((sum, item) => sum + item.quantity, 0)
})

// Group items by seller for shipping calculation and display
const itemsBySeller = computed(() => {
    const groups = {}
    cartItems.value.forEach(item => {
        if (!groups[item.sellerId]) {
            groups[item.sellerId] = {
                shopName: item.shopName,
                items: []
            }
        }
        groups[item.sellerId].items.push(item)
    })
    return groups
})

// Group selected items by seller for order summary
const selectedItemsBySeller = computed(() => {
    const groups = {}
    cartItems.value
        .filter(item => selectedItems.value.has(item.cartItemId))
        .forEach(item => {
            if (!groups[item.sellerId]) {
                groups[item.sellerId] = {
                    shopName: item.shopName,
                    items: []
                }
            }
            groups[item.sellerId].items.push(item)
        })
    return groups
})

// Format price
function formatPrice(price) {
    return `$${parseFloat(price).toFixed(2)}`
}

// Group items by item name for order summary display
function groupItemsByName(items) {
    const grouped = {}
    items.forEach(item => {
        if (!grouped[item.item_name]) {
            grouped[item.item_name] = []
        }
        grouped[item.item_name].push(item)
    })
    return grouped
}

// Navigate to checkout
function proceedToCheckout() {
    if (selectedItems.value.size === 0) {
        alert('Please select at least one item to checkout')
        return
    }

    // Pass selected items to checkout page via session storage and router state
    const selectedItemIds = Array.from(selectedItems.value)
    sessionStorage.setItem('checkoutItems', JSON.stringify(selectedItemIds))

    router.push({
        path: '/checkout',
        state: { selectedItems: selectedItemIds }
    })
}
</script>

<template>
    <main
        class="flex-1 px-4 sm:px-6 lg:px-8 xl:px-40 py-6 sm:py-10 bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
        <div class="max-w-8xl mx-auto">
            <!-- Breadcrumb -->
            <!-- <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
                <RouterLink to="/" class="hover:text-primary">Home</RouterLink>
                <span>/</span>
                <span class="font-medium text-gray-700 dark:text-gray-200">Shopping Cart</span>
            </div> -->

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center min-h-[320px]">
                <Loading />
            </div>

            <!-- Not Logged In -->
            <div v-else-if="!currentUser" class="text-center py-20">
                <p class="text-xl text-gray-600 dark:text-gray-400 mb-4">Please log in to view your cart</p>
                <RouterLink to="/login"
                    class="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    Log In
                </RouterLink>
            </div>

            <!-- Empty Cart -->
            <div v-else-if="cartItems.length === 0" class="text-center py-20">
                <svg class="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p class="text-xl text-gray-600 dark:text-gray-400 mb-4">Your cart is empty</p>
                <RouterLink to="/"
                    class="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    Continue Shopping
                </RouterLink>
            </div>

            <!-- Cart Content -->
            <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
                <!-- Cart Items -->
                <div class="lg:col-span-2">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Your Shopping Cart</h1>

                        <!-- Select All / Clear All Buttons -->
                        <div class="flex gap-2">
                            <button @click="selectAll"
                                class="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                                Select All
                            </button>
                            <button @click="clearAll"
                                class="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                Clear All
                            </button>
                        </div>
                    </div>

                    <!-- Items grouped by seller -->
                    <div class="space-y-4 sm:space-y-6">
                        <div v-for="(sellerGroup, sellerId) in itemsBySeller" :key="sellerId"
                            class="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">

                            <!-- Shop Header with Checkbox -->
                            <div
                                class="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-gray-600">
                                <input type="checkbox" :checked="isShopFullySelected(sellerId)"
                                    :indeterminate.prop="isShopPartiallySelected(sellerId)"
                                    @change="toggleShopSelection(sellerId)"
                                    class="w-4 h-4 sm:w-5 sm:h-5 text-primary rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary cursor-pointer flex-shrink-0" />

                                <!-- Shop Profile Picture -->
                                <div v-if="shopProfilePics[sellerId]"
                                    class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cover bg-center flex-shrink-0"
                                    :style="`background-image: url('${shopProfilePics[sellerId]}');`">
                                </div>
                                <div v-else
                                    class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>

                                <RouterLink :to="`/shop-details/${sellerId}`"
                                    class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary flex-1 min-w-0 truncate transition-colors">
                                    {{ sellerGroup.shopName }}
                                </RouterLink>

                                <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {{ sellerGroup.items.length }} item(s)
                                </span>
                            </div>

                            <!-- Shop Items -->
                            <div class="divide-y divide-gray-200 dark:divide-gray-700">
                                <div v-for="item in sellerGroup.items" :key="item.cartItemId"
                                    class="relative p-3 sm:p-4"
                                    :class="{ 'opacity-50': updatingItemId === item.cartItemId }">

                                    <div class="flex gap-2 sm:gap-3">
                                        <!-- Checkbox -->
                                        <input type="checkbox" :checked="selectedItems.has(item.cartItemId)"
                                            @change="toggleItemSelection(item.cartItemId)"
                                            class="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-primary rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary cursor-pointer flex-shrink-0" />

                                        <!-- Product Image -->
                                        <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-lg w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0"
                                            :style="`background-image: url('${item.img_url}');`">
                                        </div>

                                        <!-- Product Details & Actions -->
                                        <div class="flex-1 min-w-0 flex flex-col gap-2 sm:gap-3">
                                            <!-- Top Row: Name and Price (Mobile) / Name and Remove (Desktop) -->
                                            <div class="flex justify-between items-start gap-2">
                                                <p
                                                    class="font-semibold text-gray-800 dark:text-white text-sm sm:text-base flex-1 min-w-0">
                                                    {{ item.item_name }}
                                                </p>

                                                <!-- Price on mobile -->
                                                <div class="sm:hidden">
                                                    <p
                                                        class="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                                        {{ formatPrice(item.price * item.quantity) }}
                                                    </p>
                                                    <p class="text-xs text-gray-500 dark:text-gray-400 text-right">
                                                        {{ formatPrice(item.price) }} × {{ item.quantity }}
                                                    </p>
                                                </div>

                                                <!-- Remove button (desktop) -->
                                                <button @click="removeItem(item)"
                                                    :disabled="updatingItemId === item.cartItemId"
                                                    class="hidden sm:block text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 
                                                        disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0" title="Remove item">
                                                    <svg class="w-5 h-5" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <!-- Size Selector (if available) -->
                                            <div v-if="item.availableSizes && item.availableSizes.length > 0"
                                                class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                <label
                                                    class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                                                    Variation:
                                                </label>
                                                <select :value="item.sizeIndex"
                                                    @change="updateSize(item, parseInt($event.target.value))"
                                                    :disabled="updatingItemId === item.cartItemId" class="w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                                                        bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                                                        focus:outline-none focus:ring-2 focus:ring-primary
                                                        disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <option v-for="(size, index) in item.availableSizes" :key="index"
                                                        :value="index" :disabled="item.allStock[index] <= 0">
                                                        {{ size }} - {{ formatPrice(item.allPrices[index]) }}
                                                        <span v-if="item.allStock[index] <= 0">(Out of Stock)</span>
                                                        <!-- <span v-else-if="item.allStock[index] <= 5">({{ item.allStock[index] }} left)</span> -->
                                                    </option>
                                                </select>
                                            </div>

                                            <!-- Bottom Row: Quantity and Price/Remove -->
                                            <div class="flex items-center justify-between gap-2">
                                                <!-- Quantity Controls -->
                                                <div class="flex items-center gap-1 sm:gap-2">
                                                    <label
                                                        class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                                                        Qty:
                                                    </label>
                                                    <div class="flex items-center gap-1">
                                                        <button @click="updateQuantity(item, item.quantity - 1)"
                                                            :disabled="updatingItemId === item.cartItemId || item.quantity <= 1"
                                                            class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 
                                                                hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 
                                                                text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                                            −
                                                        </button>

                                                        <input type="number" :value="item.quantity"
                                                            @change="updateQuantity(item, parseInt($event.target.value) || 1)"
                                                            :min="1" :max="getActualStock(item)"
                                                            :disabled="updatingItemId === item.cartItemId" class="w-12 sm:w-16 h-7 sm:h-8 text-center text-xs sm:text-sm border border-gray-300 dark:border-slate-600 rounded-lg 
                                                                bg-white dark:bg-slate-700 text-gray-900 dark:text-white 
                                                                focus:outline-none focus:ring-2 focus:ring-primary
                                                                disabled:opacity-50 disabled:cursor-not-allowed 
                                                                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
                                                                [&::-webkit-inner-spin-button]:appearance-none" />

                                                        <button @click="updateQuantity(item, item.quantity + 1)"
                                                            :disabled="updatingItemId === item.cartItemId || item.quantity >= getActualStock(item)"
                                                            class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 
                                                                hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 
                                                                text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                                            +
                                                        </button>
                                                    </div>

                                                    <span
                                                        class="text-xs text-gray-500 dark:text-gray-400 hidden lg:inline">
                                                        ({{ getActualStock(item) }} left)
                                                    </span>
                                                </div>

                                                <!-- Price (Desktop) -->
                                                <div class="hidden sm:flex sm:flex-col sm:items-end">
                                                    <p
                                                        class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                                        {{ formatPrice(item.price * item.quantity) }}
                                                    </p>
                                                    <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                        {{ formatPrice(item.price) }} × {{ item.quantity }}
                                                    </p>
                                                </div>

                                                <!-- Remove button (Mobile) -->
                                                <button @click="removeItem(item)"
                                                    :disabled="updatingItemId === item.cartItemId"
                                                    class="sm:hidden text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 
                                                        disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-1" title="Remove item">
                                                    <svg class="w-5 h-5" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <!-- Stock warning (if exists) -->
                                            <div v-if="stockWarnings.has(item.cartItemId)"
                                                class="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <svg class="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <div class="flex-1">
                                                    <p class="text-xs font-medium text-red-800 dark:text-red-300">
                                                        <template
                                                            v-if="stockWarnings.get(item.cartItemId).available === 0">
                                                            Out of Stock
                                                        </template>
                                                        <template v-else>
                                                            Only {{ stockWarnings.get(item.cartItemId).available }}
                                                            available
                                                        </template>
                                                    </p>
                                                    <p class="text-xs text-red-700 dark:text-red-400 mt-0.5">
                                                        Please reduce quantity or remove this item
                                                    </p>
                                                </div>
                                            </div>

                                            <!-- Stock info (mobile only) -->
                                            <span class="sm:hidden text-xs text-gray-500 dark:text-gray-400">
                                                {{ getActualStock(item) }} available
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="lg:col-span-1">
                    <div class="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm lg:sticky lg:top-10">
                        <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Order Summary</h2>
                        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
                            {{ selectedItemsCount }} of {{ totalItems }} item(s) selected
                        </p>

                        <!-- Selected Items Breakdown -->
                        <div v-if="Object.keys(selectedItemsBySeller).length > 0" class="space-y-4 mb-4 sm:mb-6">
                            <div class="space-y-3">
                                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">Selected Items</p>

                                <!-- Loop through each shop -->
                                <div v-for="(sellerGroup, sellerId) in selectedItemsBySeller" :key="sellerId"
                                    class="space-y-2">
                                    <p class="text-sm font-medium text-gray-800 dark:text-white">{{ sellerGroup.shopName
                                        }}</p>

                                    <!-- Group items by name -->
                                    <div v-for="(itemGroup, itemName) in groupItemsByName(sellerGroup.items)"
                                        :key="itemName" class="pl-3 space-y-1">
                                        <p class="text-xs text-gray-700 dark:text-gray-300">{{ itemName }}</p>

                                        <!-- Show each variation/size -->
                                        <div v-for="item in itemGroup" :key="item.cartItemId"
                                            class="flex justify-between items-center text-xs pl-2">
                                            <span class="text-gray-600 dark:text-gray-400">
                                                {{ item.size || 'Standard' }} × {{ item.quantity }}
                                            </span>
                                            <span class="font-medium text-gray-800 dark:text-white">
                                                {{ formatPrice(item.price * item.quantity) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                class="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-300 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <span>Shipping Fee</span>
                                <span class="text-gray-500 dark:text-gray-400">Calculated at checkout</span>
                            </div>

                            <div class="border-t border-gray-200 dark:border-gray-700 my-3 sm:my-4"></div>

                            <div
                                class="flex justify-between text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span>{{ formatPrice(selectedSubtotal) }}</span>
                            </div>
                        </div>

                        <!-- Empty selection state -->
                        <div v-else class="space-y-4 mb-4 sm:mb-6">
                            <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                                No items selected
                            </p>
                        </div>

                        <button @click="proceedToCheckout"
                            class="mt-6 sm:mt-8 w-full flex items-center justify-center rounded-lg h-11 sm:h-12 px-4 sm:px-5 bg-primary text-white text-sm sm:text-base font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="selectedItems.size === 0">
                            Checkout ({{ selectedItems.size }})
                        </button>

                        <RouterLink to="/"
                            class="mt-3 sm:mt-4 w-full flex items-center justify-center text-primary hover:text-primary/80 text-xs sm:text-sm font-medium transition-colors">
                            ← Continue Shopping
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>