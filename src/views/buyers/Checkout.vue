<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db, auth } from "@/firebase/firebase_config"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Loading from '@/components/status/Loading.vue';
import { useToast } from '@/composables/useToast.js';


const router = useRouter()
const currentUser = ref(null)
const userDetails = ref(null)
const cartItems = ref([])
const selectedItems = ref(new Set())
const loading = ref(true)
const shopProfilePics = ref({})
const stockWarnings = ref(new Map()) // Map of cartItemId to actual available stock

// Address modal state
const showAddressModal = ref(false)
const editAddressIndex = ref(-1)
const selectedAddressIndex = ref(0) // Default to first address
const savingAddress = ref(false)
const addressError = ref('')

// Address form
const addressForm = ref({
    fullName: '',
    phoneLocal: '',
    postalCode: '',
    streetName: '',
    unitNumber: '',
    type: '',
    makeDefault: false,
})
const touched = ref({
    fullName: false,
    phone: false,
    postal: false,
    street: false,
    type: false
})

// Auth state
onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    if (user) {
        loadUserData()
        loadCart()
    } else {
        loading.value = false
        router.push('/login')
    }
})

// Load user data including addresses
async function loadUserData() {
    if (!currentUser.value) return

    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.value.uid))
        if (userDoc.exists()) {
            userDetails.value = userDoc.data()
            // Find default address or use first one
            if (userDetails.value.addresses && userDetails.value.addresses.length > 0) {
                const defaultIdx = userDetails.value.addresses.findIndex(a => a.default === 1)
                selectedAddressIndex.value = defaultIdx !== -1 ? defaultIdx : 0
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error)
    }
}

// Load cart from Firestore
let unsubscribe = null
async function loadCart() {
    if (!currentUser.value) return

    loading.value = true

    unsubscribe = onSnapshot(
        doc(db, 'carts', currentUser.value.uid),
        (docSnap) => {
            if (docSnap.exists()) {
                const items = docSnap.data().items || []
                cartItems.value = items

                // Only select items that were selected in cart
                // Get selected items from route state or session storage
                const selectedFromCart = history.state?.selectedItems ||
                    JSON.parse(sessionStorage.getItem('checkoutItems') || '[]')

                if (selectedFromCart.length > 0) {
                    selectedFromCart.forEach(itemId => selectedItems.value.add(itemId))
                } else {
                    // If no items passed, redirect back to cart
                    router.push('/cart')
                    return
                }

                loadShopProfilePics()
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

// Load shop profile pictures
async function loadShopProfilePics() {
    const sellerIds = [...new Set(cartItems.value.map(item => item.sellerId))]

    for (const sellerId of sellerIds) {
        if (shopProfilePics.value[sellerId]) continue

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
    stockWarnings.value.clear()

    for (const item of selectedCartItems.value) {
        try {
            // Fetch the current product document
            const productDoc = await getDoc(doc(db, 'products', item.productId))

            if (!productDoc.exists()) {
                // Product no longer exists
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

            // Compare actual stock with cart quantity
            if (actualStock < item.quantity) {
                stockWarnings.value.set(item.cartItemId, {
                    available: actualStock,
                    requested: item.quantity
                })
            }
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

// Computed properties
const selectedCartItems = computed(() => {
    return cartItems.value.filter(item => selectedItems.value.has(item.cartItemId))
})

const selectedItemsBySeller = computed(() => {
    const groups = {}
    selectedCartItems.value.forEach(item => {
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

const subtotal = computed(() => {
    return selectedCartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const shippingFee = computed(() => {
    // Calculate shipping per seller (placeholder logic)
    return Object.keys(selectedItemsBySeller.value).length * 3.00
})

const total = computed(() => {
    return subtotal.value + shippingFee.value
})

const hasAddresses = computed(() => {
    return userDetails.value?.addresses && userDetails.value.addresses.length > 0
})

const selectedAddress = computed(() => {
    if (!hasAddresses.value) return null
    return userDetails.value.addresses[selectedAddressIndex.value]
})

// Check if any items are out of stock or have insufficient quantity
const hasStockIssues = computed(() => {
    return stockWarnings.value.size > 0
})

const canProceedToPayment = computed(() => {
    return selectedAddress.value && !hasStockIssues.value && selectedCartItems.value.length > 0
})

// Address form validation
const fullNameValid = computed(() => (addressForm.value.fullName || '').trim().length > 0)
const phoneValid = computed(() => /^[89]\d{7}$/.test(addressForm.value.phoneLocal || ''))
const postalValid = computed(() => /^\d{6}$/.test(addressForm.value.postalCode || ''))
const streetValid = computed(() => (addressForm.value.streetName || '').trim().length > 0)
const typeValid = computed(() => ['home', 'work', 'others'].includes(addressForm.value.type))
const addressFormValid = computed(() =>
    fullNameValid.value && phoneValid.value && postalValid.value && streetValid.value && typeValid.value
)

// Address modal functions
function openAddressModal(index = -1) {
    addressError.value = ''
    touched.value = { fullName: false, phone: false, postal: false, street: false, type: false }
    editAddressIndex.value = index

    if (index === -1) {
        // New address
        addressForm.value = {
            fullName: userDetails.value?.displayName || '',
            phoneLocal: userDetails.value?.phone || '',
            postalCode: '',
            streetName: '',
            unitNumber: '',
            type: 'home',
            makeDefault: !hasAddresses.value,
        }
    } else {
        // Edit existing address
        const addr = userDetails.value.addresses[index]
        addressForm.value = {
            fullName: addr.fullName || '',
            phoneLocal: (addr.phoneNumber || '').replace('+65 ', ''),
            postalCode: addr.postalCode || '',
            streetName: addr.streetName || '',
            unitNumber: addr.unitNumber || '',
            type: addr.type || 'home',
            makeDefault: addr.default === 1,
        }
    }

    showAddressModal.value = true
}

function closeAddressModal() {
    showAddressModal.value = false
}

function sanitizePhone() {
    addressForm.value.phoneLocal = (addressForm.value.phoneLocal || '').replace(/\D/g, '').slice(0, 8)
}

function sanitizeUnit() {
    let v = (addressForm.value.unitNumber || '')
    v = v.replace(/[^\d-]/g, '').replace(/-+/g, '-')
    if (v.startsWith('-')) v = v.slice(1)
    const parts = v.split('-')
    if (parts.length > 2) v = parts[0] + '-' + parts.slice(1).join('')
    addressForm.value.unitNumber = v
}

async function saveAddress() {
    touched.value = { fullName: true, phone: true, postal: true, street: true, type: true }
    if (!addressFormValid.value) {
        addressError.value = 'Please fix the highlighted fields.'
        return
    }

    if (!currentUser.value) return

    try {
        savingAddress.value = true
        const newAddr = {
            fullName: addressForm.value.fullName.trim(),
            phoneNumber: `+65 ${addressForm.value.phoneLocal}`,
            postalCode: addressForm.value.postalCode.trim(),
            streetName: addressForm.value.streetName.trim(),
            unitNumber: addressForm.value.unitNumber.trim(),
            type: addressForm.value.type,
            default: addressForm.value.makeDefault ? 1 : 0,
        }

        const addresses = userDetails.value?.addresses ? [...userDetails.value.addresses] : []

        if (editAddressIndex.value === -1) {
            // Add new address
            if (addresses.length === 0) newAddr.default = 1
            else if (newAddr.default === 1) addresses.forEach(a => a.default = 0)
            addresses.push(newAddr)
            selectedAddressIndex.value = addresses.length - 1
        } else {
            // Update existing address
            if (newAddr.default === 1) addresses.forEach((a, i) => a.default = i === editAddressIndex.value ? 1 : 0)
            addresses[editAddressIndex.value] = { ...addresses[editAddressIndex.value], ...newAddr }
        }

        await setDoc(doc(db, 'users', currentUser.value.uid), { addresses }, { merge: true })

        // Update local state
        if (!userDetails.value) userDetails.value = {}
        userDetails.value.addresses = addresses

        closeAddressModal()
    } catch (error) {
        console.error('Error saving address:', error)
        addressError.value = 'Could not save address.'
    } finally {
        savingAddress.value = false
    }
}

// Helper functions
function formatPrice(price) {
    return `$${parseFloat(price).toFixed(2)}`
}

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

const { error, warning, info } = useToast()

// Checkout function
async function proceedToPayment() {
    if (!selectedAddress.value) {
        warning('Please add a delivery address', 'Missing Address')
        return
    }

    if (selectedCartItems.value.length === 0) {
        info('No items selected for checkout', 'Empty Cart')
        return
    }

    if (hasStockIssues.value) {
        error(
            'Some items are out of stock or have insufficient quantity. Please review your cart.',
            'Stock Issue'
        )
        return
    }

    // TODO: Implement payment gateway
    info('Payment gateway integration coming soon', 'Coming Soon')
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
                <RouterLink to="/cart" class="hover:text-primary">Cart</RouterLink>
                <span>/</span>
                <span class="font-medium text-gray-700 dark:text-gray-200">Checkout</span>
            </div> -->

            <!-- Page Title -->
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h1>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center min-h-[320px]">
                <Loading />
            </div>

            <!-- Empty Cart -->
            <div v-else-if="selectedCartItems.length === 0" class="text-center py-20">
                <svg class="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p class="text-xl text-gray-600 dark:text-gray-400 mb-4">No items to checkout</p>
                <RouterLink to="/cart"
                    class="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    Go to Cart
                </RouterLink>
            </div>

            <!-- Checkout Content -->
            <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
                <!-- Stock Warning Banner -->
                <div v-if="hasStockIssues" class="lg:col-span-3">
                    <div
                        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                        <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div class="flex-1">
                            <p class="font-semibold text-red-800 dark:text-red-300 text-sm sm:text-base">Stock
                                Availability Issue</p>
                            <p class="text-sm text-red-700 dark:text-red-400 mt-1">
                                Some items in your order are out of stock or have insufficient quantity. Please return
                                to your cart to update quantities or remove unavailable items.
                            </p>
                            <RouterLink to="/cart"
                                class="inline-block mt-2 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline">
                                Go to Cart →
                            </RouterLink>
                        </div>
                    </div>
                </div>

                <!-- Left Column - Forms -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Delivery Address Section -->
                    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Delivery Address</h2>
                            <button @click="openAddressModal()"
                                class="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                                + Add New
                            </button>
                        </div>

                        <!-- No addresses -->
                        <div v-if="!hasAddresses"
                            class="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <svg class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p class="text-gray-600 dark:text-gray-400 mb-3">No delivery address added yet</p>
                            <button @click="openAddressModal()"
                                class="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                                Add Address
                            </button>
                        </div>

                        <!-- Address list -->
                        <div v-else class="space-y-3">
                            <div v-for="(addr, idx) in userDetails.addresses" :key="idx"
                                @click="selectedAddressIndex = idx"
                                class="relative border-2 rounded-lg p-4 cursor-pointer transition-all"
                                :class="selectedAddressIndex === idx
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">

                                <!-- Radio button -->
                                <div class="absolute top-4 right-4">
                                    <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center" :class="selectedAddressIndex === idx
                                        ? 'border-primary bg-primary'
                                        : 'border-gray-300 dark:border-gray-600'">
                                        <div v-if="selectedAddressIndex === idx" class="w-2 h-2 bg-white rounded-full">
                                        </div>
                                    </div>
                                </div>

                                <div class="pr-8">
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="text-sm font-semibold capitalize text-gray-800 dark:text-gray-200">
                                            {{ addr.type }}
                                        </span>
                                        <span v-if="addr.default === 1"
                                            class="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-semibold">
                                            Default
                                        </span>
                                    </div>

                                    <p class="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{{
                                        addr.fullName }}</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ addr.phoneNumber }}</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">
                                        {{ addr.streetName }}<span v-if="addr.unitNumber">, #{{ addr.unitNumber
                                            }}</span>, Singapore {{ addr.postalCode }}
                                    </p>

                                    <button @click.stop="openAddressModal(idx)"
                                        class="mt-2 text-xs font-medium text-primary hover:text-primary/80">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Order Items Section -->
                    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6">
                        <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Order Items</h2>

                        <div class="space-y-4">
                            <div v-for="(sellerGroup, sellerId) in selectedItemsBySeller" :key="sellerId"
                                class="space-y-3">
                                <!-- Shop Header -->
                                <div class="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                                    <div v-if="shopProfilePics[sellerId]"
                                        class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-cover bg-center flex-shrink-0"
                                        :style="`background-image: url('${shopProfilePics[sellerId]}');`">
                                    </div>
                                    <div v-else
                                        class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                        <svg class="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <span class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                        {{ sellerGroup.shopName }}
                                    </span>
                                </div>

                                <!-- Items -->
                                <div v-for="item in sellerGroup.items" :key="item.cartItemId" class="flex gap-3 py-2"
                                    :class="{ 'opacity-60': stockWarnings.has(item.cartItemId) }">
                                    <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                                        :style="`background-image: url('${item.img_url}');`">
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                                            {{ item.item_name }}
                                        </p>
                                        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            {{ item.size || 'Standard' }}
                                        </p>

                                        <!-- Stock warning -->
                                        <p v-if="stockWarnings.has(item.cartItemId) && stockWarnings.get(item.cartItemId).available === 0"
                                            class="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                                            ⚠️ Out of stock
                                        </p>
                                        <p v-else-if="stockWarnings.has(item.cartItemId)"
                                            class="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
                                            ⚠️ Only {{ stockWarnings.get(item.cartItemId).available }} available (you
                                            have {{ item.quantity }})
                                        </p>

                                        <div class="flex items-center justify-between mt-1">
                                            <span class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                × {{ item.quantity }}
                                            </span>
                                            <span
                                                class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                                {{ formatPrice(item.price * item.quantity) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Method Section (Placeholder) -->
                    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6">
                        <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Payment Method</h2>
                        <div
                            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                            <svg class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <p class="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                                Payment gateway integration coming soon
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Right Column - Order Summary -->
                <div class="lg:col-span-1">
                    <div class="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm lg:sticky lg:top-10">
                        <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>

                        <!-- Items breakdown -->
                        <div class="space-y-3 mb-4 max-h-64 overflow-y-auto">
                            <div v-for="(sellerGroup, sellerId) in selectedItemsBySeller" :key="sellerId"
                                class="space-y-2">
                                <p class="text-sm font-medium text-gray-800 dark:text-white">{{ sellerGroup.shopName }}
                                </p>

                                <div v-for="(itemGroup, itemName) in groupItemsByName(sellerGroup.items)"
                                    :key="itemName" class="pl-3 space-y-1">
                                    <p class="text-xs text-gray-700 dark:text-gray-300">{{ itemName }}</p>

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

                        <!-- Pricing breakdown -->
                        <div class="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                <span>Subtotal</span>
                                <span class="font-medium text-gray-800 dark:text-white">{{ formatPrice(subtotal)
                                    }}</span>
                            </div>

                            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                <span>Shipping Fee</span>
                                <span class="font-medium text-gray-800 dark:text-white">{{ formatPrice(shippingFee)
                                    }}</span>
                            </div>

                            <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
                                <div
                                    class="flex justify-between text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                    <span>Total</span>
                                    <span>{{ formatPrice(total) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Place Order Button -->
                        <button @click="proceedToPayment" :disabled="!canProceedToPayment"
                            class="mt-6 w-full flex items-center justify-center rounded-lg h-11 sm:h-12 px-4 bg-primary text-white text-sm sm:text-base font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <span v-if="hasStockIssues">Stock Issues - Cannot Proceed</span>
                            <span v-else-if="!selectedAddress">Add Address to Continue</span>
                            <span v-else>Place Order</span>
                        </button>

                        <p v-if="hasStockIssues" class="mt-2 text-xs text-center text-red-600 dark:text-red-400">
                            Please update your cart before proceeding
                        </p>

                        <RouterLink to="/cart"
                            class="mt-3 w-full flex items-center justify-center text-primary hover:text-primary/80 text-xs sm:text-sm font-medium transition-colors">
                            ← Back to Cart
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>

        <!-- Address Modal -->
        <transition name="fade">
            <div v-if="showAddressModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @keydown.esc="closeAddressModal">
                <div class="absolute inset-0 bg-black/40" @click="closeAddressModal"></div>

                <div
                    class="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xl">
                    <div class="mb-4 flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                            {{ editAddressIndex === -1 ? 'New Address' : 'Edit Address' }}
                        </h3>
                        <button @click="closeAddressModal"
                            class="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Form -->
                    <form @submit.prevent="saveAddress" class="grid grid-cols-1 gap-4">
                        <!-- Full Name -->
                        <div>
                            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full
                                Name</label>
                            <input v-model.trim="addressForm.fullName" :disabled="savingAddress"
                                class="w-full rounded-lg border px-3 py-2 text-sm sm:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                :class="touched.fullName && !fullNameValid ? 'border-red-500' : ''"
                                @blur="touched.fullName = true" placeholder="e.g. Sarah Johnson" />
                            <p v-if="touched.fullName && !fullNameValid" class="text-xs text-red-600 mt-1">Full name is
                                required.</p>
                        </div>

                        <!-- Phone -->
                        <div>
                            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone
                                Number</label>
                            <div class="flex">
                                <span
                                    class="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm sm:text-base text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    +65
                                </span>
                                <input v-model="addressForm.phoneLocal" inputmode="numeric" maxlength="8"
                                    :disabled="savingAddress"
                                    class="w-full rounded-r-lg border border-slate-300 px-3 py-2 text-sm sm:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                    @input="sanitizePhone()"
                                    :class="touched.phone && !phoneValid ? 'border-red-500' : ''"
                                    @blur="touched.phone = true" placeholder="9xxxxxxx" />
                            </div>
                            <p v-if="touched.phone && !phoneValid" class="text-xs text-red-600 mt-1">Must start with 8
                                or 9 and contain exactly 8 digits.</p>
                        </div>

                        <!-- Postal Code & Street -->
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Postal
                                    Code</label>
                                <input v-model.trim="addressForm.postalCode" inputmode="numeric" maxlength="6"
                                    :disabled="savingAddress"
                                    class="w-full rounded-lg border px-3 py-2 text-sm sm:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                    @input="addressForm.postalCode = (addressForm.postalCode || '').replace(/\D/g, '').slice(0, 6)"
                                    @blur="touched.postal = true"
                                    :class="touched.postal && !postalValid ? 'border-red-500' : ''"
                                    placeholder="e.g. 238858" />
                                <p v-if="touched.postal && !postalValid" class="text-xs text-red-600 mt-1">Enter a valid
                                    6-digit postal code.</p>
                            </div>

                            <div class="sm:col-span-2">
                                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Street
                                    / Block</label>
                                <input v-model.trim="addressForm.streetName" :disabled="savingAddress"
                                    class="w-full rounded-lg border px-3 py-2 text-sm sm:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                    @blur="touched.street = true"
                                    :class="touched.street && !streetValid ? 'border-red-500' : ''"
                                    placeholder="e.g. 123 Orchard Road" />
                                <p v-if="touched.street && !streetValid" class="text-xs text-red-600 mt-1">Street /
                                    Block is required.</p>
                            </div>

                            <!-- Unit Number -->
                            <div class="sm:col-span-3">
                                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Unit
                                    Number</label>
                                <div class="flex">
                                    <span
                                        class="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">#</span>
                                    <input v-model="addressForm.unitNumber" :disabled="savingAddress"
                                        class="w-full rounded-r-lg border border-slate-300 px-3 py-2 text-sm sm:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                        @input="sanitizeUnit" placeholder="10-234 (optional)" />
                                </div>
                                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Digits and one dash only
                                    (e.g. 10-234).</p>
                            </div>
                        </div>

                        <!-- Type + Default -->
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
                            <div>
                                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Address
                                    Type</label>
                                <select v-model="addressForm.type" :disabled="savingAddress"
                                    class="w-full rounded-lg border px-3 py-2 text-sm sm:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                    :class="touched.type && !typeValid ? 'border-red-500' : ''"
                                    @blur="touched.type = true">
                                    <option value="" disabled>Select</option>
                                    <option value="home">Home</option>
                                    <option value="work">Work</option>
                                    <option value="others">Others</option>
                                </select>
                                <p v-if="touched.type && !typeValid" class="text-xs text-red-600 mt-1">Please choose a
                                    type.</p>
                            </div>

                            <div class="flex items-center gap-2 pt-0 sm:pt-6">
                                <input id="mkdef" type="checkbox" v-model="addressForm.makeDefault"
                                    class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                                <label for="mkdef" class="text-sm text-slate-700 dark:text-slate-300">Set as default
                                    address</label>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <button type="submit" :disabled="savingAddress || !addressFormValid"
                                class="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-60 text-sm sm:text-base">
                                {{ savingAddress ? 'Saving…' : editAddressIndex === -1 ? 'Add Address' : 'Save Changes'
                                }}
                            </button>
                            <button type="button" @click="closeAddressModal"
                                class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 text-sm sm:text-base">
                                Cancel
                            </button>
                            <p v-if="addressError" class="text-sm text-red-600">{{ addressError }}</p>
                        </div>
                    </form>
                </div>
            </div>
        </transition>
    </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>