<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { db, auth } from "@/firebase/firebase_config"
import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayRemove } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { getFunctions, httpsCallable } from "firebase/functions"
import { stripePromise } from '@/firebase/services/stripe'
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

// Payment processing state
const processingPayment = ref(false)

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

            // If requested quantity exceeds available stock, add warning
            if (item.quantity > actualStock) {
                stockWarnings.value.set(item.cartItemId, {
                    available: actualStock,
                    requested: item.quantity
                })
            }
        } catch (error) {
            console.error(`Error validating stock for product ${item.productId}:`, error)
        }
    }
}

// Filter cart items to only show selected ones
const selectedCartItems = computed(() => {
    return cartItems.value.filter(item => selectedItems.value.has(item.cartItemId))
})

// Group items by seller
const itemsBySeller = computed(() => {
    const grouped = {}
    selectedCartItems.value.forEach(item => {
        if (!grouped[item.sellerId]) {
            grouped[item.sellerId] = {
                sellerName: item.sellerName,
                items: []
            }
        }
        grouped[item.sellerId].items.push(item)
    })
    return grouped
})

// Calculate subtotal for each seller
function getSellerSubtotal(sellerId) {
    const seller = itemsBySeller.value[sellerId]
    if (!seller) return 0
    return seller.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

// Calculate total
const orderTotal = computed(() => {
    return selectedCartItems.value.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
    }, 0)
})

// Get selected address
const selectedAddress = computed(() => {
    if (!userDetails.value?.addresses || userDetails.value.addresses.length === 0) return null
    return userDetails.value.addresses[selectedAddressIndex.value]
})

// Check if there are any stock warnings
const hasStockWarnings = computed(() => {
    return stockWarnings.value.size > 0
})

// Address form validation
const fullNameValid = computed(() => addressForm.value.fullName.trim().length > 0)
const phoneValid = computed(() => /^[89]\d{7}$/.test(addressForm.value.phoneLocal))
const postalValid = computed(() => /^\d{6}$/.test(addressForm.value.postalCode))
const streetValid = computed(() => addressForm.value.streetName.trim().length > 0)
const typeValid = computed(() => addressForm.value.type.length > 0)
const addressFormValid = computed(() => {
    return fullNameValid.value && phoneValid.value && postalValid.value && streetValid.value && typeValid.value
})

function sanitizePhone() {
    addressForm.value.phoneLocal = addressForm.value.phoneLocal.replace(/\D/g, '').slice(0, 8)
}

function sanitizeUnit() {
    addressForm.value.unitNumber = addressForm.value.unitNumber.replace(/[^0-9-]/g, '')
}

function openAddressModal(index = -1) {
    editAddressIndex.value = index
    if (index >= 0) {
        const addr = userDetails.value.addresses[index]
        addressForm.value = {
            fullName: addr.fullName,
            phoneLocal: addr.phone.replace('+65', ''),
            postalCode: addr.postalCode,
            streetName: addr.streetName,
            unitNumber: addr.unitNumber || '',
            type: addr.type,
            makeDefault: addr.default === 1
        }
    } else {
        addressForm.value = {
            fullName: '',
            phoneLocal: '',
            postalCode: '',
            streetName: '',
            unitNumber: '',
            type: '',
            makeDefault: false
        }
    }
    touched.value = {
        fullName: false,
        phone: false,
        postal: false,
        street: false,
        type: false
    }
    addressError.value = ''
    showAddressModal.value = true
}

function closeAddressModal() {
    showAddressModal.value = false
}

async function saveAddress() {
    if (!addressFormValid.value || !currentUser.value) return

    savingAddress.value = true
    addressError.value = ''

    try {
        const newAddress = {
            fullName: addressForm.value.fullName.trim(),
            phone: `+65${addressForm.value.phoneLocal}`,
            postalCode: addressForm.value.postalCode,
            streetName: addressForm.value.streetName.trim(),
            unitNumber: addressForm.value.unitNumber.trim(),
            type: addressForm.value.type,
            default: addressForm.value.makeDefault ? 1 : 0
        }

        let addresses = userDetails.value.addresses || []

        if (addressForm.value.makeDefault) {
            addresses = addresses.map(a => ({ ...a, default: 0 }))
        }

        if (editAddressIndex.value >= 0) {
            addresses[editAddressIndex.value] = newAddress
        } else {
            addresses.push(newAddress)
        }

        await updateDoc(doc(db, 'users', currentUser.value.uid), { addresses })

        userDetails.value.addresses = addresses

        if (addressForm.value.makeDefault || editAddressIndex.value === selectedAddressIndex.value) {
            selectedAddressIndex.value = editAddressIndex.value >= 0 ? editAddressIndex.value : addresses.length - 1
        }

        useToast().success(editAddressIndex.value >= 0 ? 'Address updated!' : 'Address added!')
        closeAddressModal()
    } catch (error) {
        console.error('Error saving address:', error)
        addressError.value = 'Failed to save address. Please try again.'
    } finally {
        savingAddress.value = false
    }
}

async function deleteAddress(index) {
    if (!currentUser.value || !confirm('Delete this address?')) return

    try {
        const addresses = [...userDetails.value.addresses]
        addresses.splice(index, 1)

        await updateDoc(doc(db, 'users', currentUser.value.uid), { addresses })
        userDetails.value.addresses = addresses

        if (selectedAddressIndex.value >= addresses.length) {
            selectedAddressIndex.value = Math.max(0, addresses.length - 1)
        }

        useToast().success('Address deleted')
    } catch (error) {
        console.error('Error deleting address:', error)
        useToast().error('Failed to delete address')
    }
}

function formatPrice(price) {
    return `$${price.toFixed(2)}`
}
// STRIPE PAYMENT INTEGRATION
async function proceedToPayment() {
    // Validation checks
    if (!selectedAddress.value) {
        useToast().error('Please select a delivery address')
        return
    }

    if (selectedCartItems.value.length === 0) {
        useToast().error('No items selected for checkout')
        return
    }

    if (hasStockWarnings.value) {
        useToast().error('Please resolve stock availability issues before proceeding')
        return
    }

    processingPayment.value = true

    try {
        // Prepare items for Stripe
        const items = selectedCartItems.value.map(item => ({
            name: item.item_name,
            price: item.price,
            quantity: item.quantity,
            image: item.img_url || null
        }))

        // Get current URL for success/cancel redirects
        const baseUrl = window.location.origin

        // Get user auth token
        const token = await auth.currentUser.getIdToken()

        // Call Firebase Function via HTTP request
        const functionUrl = 'https://us-central1-craftconnect-3b52c.cloudfunctions.net/createCheckoutSession'
        
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                items: items,
                successUrl: `${baseUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${baseUrl}/checkout`
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Payment failed')
        }

        const data = await response.json()

        // Redirect to Stripe Checkout
        window.location.href = data.url

    } catch (error) {
        console.error('Payment error:', error)
        useToast().error(error.message || 'Payment failed. Please try again.')
        processingPayment.value = false
    }
}

// Cleanup
onBeforeUnmount(() => {
    if (unsubscribe) unsubscribe()
})
</script>

<template>
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
            <Loading size="lg" />
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column: Address & Items -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Delivery Address Section -->
                <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Delivery Address</h2>
                        <button @click="openAddressModal()"
                            class="text-sm font-medium text-primary hover:text-primary/80">
                            + Add New Address
                        </button>
                    </div>

                    <!-- No addresses -->
                    <div v-if="!userDetails?.addresses || userDetails.addresses.length === 0"
                        class="text-center py-8 text-slate-500 dark:text-slate-400">
                        <p class="mb-4">No delivery address added yet</p>
                        <button @click="openAddressModal()"
                            class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                            Add Address
                        </button>
                    </div>

                    <!-- Address list -->
                    <div v-else class="space-y-3">
                        <div v-for="(address, index) in userDetails.addresses" :key="index" @click="selectedAddressIndex = index"
                            :class="[
                                'rounded-lg border-2 p-4 cursor-pointer transition-all',
                                selectedAddressIndex === index
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                            ]">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="font-semibold text-slate-900 dark:text-white">{{ address.fullName
                                            }}</span>
                                        <span v-if="address.default === 1"
                                            class="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">Default</span>
                                        <span
                                            class="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">{{
                                                address.type }}</span>
                                    </div>
                                    <p class="text-sm text-slate-600 dark:text-slate-400">{{ address.phone }}</p>
                                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        {{ address.streetName }}
                                        <span v-if="address.unitNumber">#{{ address.unitNumber }}</span>,
                                        Singapore {{ address.postalCode }}
                                    </p>
                                </div>
                                <div class="flex gap-2">
                                    <button @click.stop="openAddressModal(index)"
                                        class="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary">
                                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button @click.stop="deleteAddress(index)"
                                        class="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500">
                                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stock Warnings -->
                <div v-if="hasStockWarnings"
                    class="rounded-xl border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
                    <div class="flex items-start gap-3">
                        <svg class="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 class="font-semibold text-red-900 dark:text-red-200 mb-2">Stock Availability Issues</h3>
                            <ul class="space-y-1 text-sm text-red-800 dark:text-red-300">
                                <li v-for="[itemId, warning] in stockWarnings" :key="itemId">
                                    {{ cartItems.find(i => i.cartItemId === itemId)?.name }}:
                                    Only {{ warning.available }} available (you requested {{ warning.requested }})
                                </li>
                            </ul>
                            <p class="mt-2 text-sm text-red-700 dark:text-red-400">
                                Please update quantities in your cart before proceeding.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Items by Seller -->
                <div v-for="(seller, sellerId) in itemsBySeller" :key="sellerId"
                    class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                    <div class="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                        <img v-if="shopProfilePics[sellerId]" :src="shopProfilePics[sellerId]" :alt="seller.sellerName"
                            class="h-10 w-10 rounded-full object-cover" />
                        <div v-else
                            class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {{ seller.sellerName.charAt(0) }}
                        </div>
                        <h3 class="font-bold text-lg text-slate-900 dark:text-white">{{ seller.sellerName }}</h3>
                    </div>

                    <div class="space-y-4">
                        <div v-for="item in seller.items" :key="item.cartItemId" class="flex gap-4">
                            <img :src="item.img_url" :alt="item.name"
                                class="h-20 w-20 rounded-lg object-cover shrink-0" />
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                                    {{ item.item_name }}
                                </p>
                                
                                <!-- Variation/Size -->
                                <p v-if="item.size" class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                    <span class="font-medium">Variation:</span> {{ item.size }}
                                </p>
                                
                                <!-- Description (if available) -->
                                <p v-if="item.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                    {{ item.description }}
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
                                        Qty: × {{ item.quantity }}
                                    </span>
                                    <span class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                        {{ formatPrice(item.price * item.quantity) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span class="text-slate-600 dark:text-slate-400">Subtotal:</span>
                        <span class="text-lg font-bold text-slate-900 dark:text-white">${{ getSellerSubtotal(sellerId).toFixed(2) }}</span>
                    </div>
                </div>
            </div>

            <!-- Right Column: Order Summary -->
            <div class="lg:col-span-1">
                <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sticky top-6">
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Order Summary</h2>

                    <div class="space-y-3 mb-6">
                        <div class="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Items ({{ selectedCartItems.length }})</span>
                            <span>${{ orderTotal.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Shipping</span>
                            <span class="text-green-600 dark:text-green-400">FREE</span>
                        </div>
                        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                            <span class="font-bold text-lg text-slate-900 dark:text-white">Total</span>
                            <span class="font-bold text-lg text-slate-900 dark:text-white">${{ orderTotal.toFixed(2) }}</span>
                        </div>
                    </div>

                    <button 
                        @click="proceedToPayment"
                        :disabled="processingPayment || !selectedAddress || selectedCartItems.length === 0 || hasStockWarnings"
                        class="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        <span v-if="processingPayment">Processing...</span>
                        <span v-else>Proceed to Payment</span>
                    </button>

                    <p class="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
                        By placing this order, you agree to our Terms & Conditions
                    </p>
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