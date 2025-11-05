<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { db, auth } from "@/firebase/firebase_config"
import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayRemove, collection, getDocs, addDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { getFunctions, httpsCallable } from "firebase/functions"
import { stripePromise } from '@/firebase/services/stripe'
import Loading from '@/components/status/Loading.vue'
import { useToast } from '@/composables/useToast.js'

const router = useRouter()
const currentUser = ref(null)
const userDetails = ref(null)
const cartItems = ref([])
const selectedItems = ref(new Set())
const loading = ref(true)
const shopProfilePics = ref({})
const stockWarnings = ref(new Map())

// Shipping fee constant
const SHIPPING_FEE = 1.99

// Payment processing state
const processingPayment = ref(false)
const savedCards = ref([])
const selectedCardIndex = ref(null)
const useNewCard = ref(true)

// Address modal state
const showAddressModal = ref(false)
const editAddressIndex = ref(-1)
const selectedAddressIndex = ref(0)
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

// ✅ CARD MODAL STATE
const showCardModal = ref(false)
const cardForm = ref({
  cardholderName: '',
  cardNumber: '',
  expiryDate: '',
  brand: 'Card',
  last4: '',
})
const cardTouched = ref({
  cardholderName: false,
  cardNumber: false,
  expiryDate: false,
})
const savingCard = ref(false)
const cardFormError = ref('')

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

// Load user data including addresses and payment methods
async function loadUserData() {
  if (!currentUser.value) return

  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.value.uid))
    if (userDoc.exists()) {
      userDetails.value = userDoc.data()

      // Fetch saved cards from subcollection 'payment_methods'
      const paymentMethodsCol = collection(db, 'users', currentUser.value.uid, 'payment_methods')
      const paymentSnap = await getDocs(paymentMethodsCol)
      savedCards.value = paymentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      console.log('Fetched saved cards:', savedCards.value)

      // Set default card if available
      const defaultCardIndex = savedCards.value.findIndex(c => c.isDefault)
      if (defaultCardIndex !== -1) {
        selectedCardIndex.value = defaultCardIndex
        useNewCard.value = false
      }

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

                // Get selected items from route state or session storage
                const selectedFromCart = history.state?.selectedItems ||
                    JSON.parse(sessionStorage.getItem('checkoutItems') || '[]')

                if (selectedFromCart.length > 0) {
                    selectedFromCart.forEach(itemId => selectedItems.value.add(itemId))
                } else {
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
            const productDoc = await getDoc(doc(db, 'products', item.productId))

            if (!productDoc.exists()) {
                stockWarnings.value.set(item.cartItemId, { available: 0, requested: item.quantity })
                continue
            }

            const productData = productDoc.data()
            let actualStock = 0

            if (item.availableSizes && item.availableSizes.length > 0 && item.sizeIndex !== undefined) {
                actualStock = productData.quantity?.[item.sizeIndex] || 0
            } else {
                actualStock = productData.quantity || 0
            }

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
                sellerName: item.sellerName || item.shopName || item.businessName || 'Unknown Shop',
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

// Calculate subtotal (items only, before shipping)
const orderSubtotal = computed(() => {
    return selectedCartItems.value.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
    }, 0)
})

// Calculate total (subtotal + shipping)
const orderTotal = computed(() => {
    return orderSubtotal.value + SHIPPING_FEE
})

// Get selected address
const selectedAddress = computed(() => {
    if (!userDetails.value?.addresses || userDetails.value.addresses.length === 0) return null
    return userDetails.value.addresses[selectedAddressIndex.value]
})

// Get selected card
const selectedCard = computed(() => {
    if (useNewCard.value || selectedCardIndex.value === null) return null
    return savedCards.value[selectedCardIndex.value]
})

// Check if there are any stock warnings
const hasStockWarnings = computed(() => {
    return stockWarnings.value.size > 0
})

// ✅ CARD UTILITIES
function luhnOk(num) {
  const s = (num || '').replace(/\D/g, '')
  if (s.length !== 16) return false
  let sum = 0, alt = false
  for (let i = s.length - 1; i >= 0; i--) {
    let n = parseInt(s[i], 10)
    if (alt) { n *= 2; if (n > 9) n -= 9 }
    sum += n; alt = !alt
  }
  return sum % 10 === 0
}

function detectBrand(num) {
  const s = (num || '').replace(/\D/g, '')
  if (/^4/.test(s)) return 'Visa'
  if (/^5[1-5]/.test(s) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(s)) return 'Mastercard'
  if (/^3[47]/.test(s)) return 'American Express'
  if (/^6(?:011|5)/.test(s)) return 'Discover'
  return 'Card'
}

function formatCardNumber() {
  let digits = (cardForm.value.cardNumber || '').replace(/\D/g, '')
  digits = digits.substring(0, 16)
  cardForm.value.cardNumber = digits.replace(/(.{4})/g, '$1 ').trim()
  cardForm.value.brand = detectBrand(digits)
}

function formatExpiryDate() {
  let value = cardForm.value.expiryDate.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  cardForm.value.expiryDate = value
}

// ✅ CARD VALIDATION
const cardValid = {
  get cardholderName() {
    return (cardForm.value.cardholderName || '').trim().length > 0
  },
  get cardNumber() {
    return luhnOk(cardForm.value.cardNumber)
  },
  get expiry() {
    const exp = cardForm.value.expiryDate
    if (!exp || !exp.includes('/')) return false
    
    const [month, year] = exp.split('/')
    const m = parseInt(month, 10)
    const y = parseInt('20' + year, 10)
    
    if (!m || !y || m < 1 || m > 12) return false
    
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    if (y < currentYear) return false
    if (y === currentYear && m < currentMonth) return false
    
    return true
  },
}

const cardFormValid = computed(() => {
  return cardValid.cardholderName && cardValid.cardNumber && cardValid.expiry
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

// ✅ CARD MODAL FUNCTIONS
function openCardModal() {
  showCardModal.value = true
  cardForm.value = {
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    brand: 'Card',
    last4: '',
  }
  cardTouched.value = {
    cardholderName: false,
    cardNumber: false,
    expiryDate: false,
  }
  cardFormError.value = ''
}

function closeCardModal() {
  showCardModal.value = false
}

async function saveCard() {
  cardTouched.value.cardholderName = true
  cardTouched.value.cardNumber = true
  cardTouched.value.expiryDate = true
  cardFormError.value = ''

  if (!cardFormValid.value) {
    cardFormError.value = 'Please fill in all fields correctly'
    return
  }

  if (!auth.currentUser) {
    useToast().error('Please log in to save payment methods')
    return
  }

  savingCard.value = true
  try {
    const digits = (cardForm.value.cardNumber || '').replace(/\D/g, '')
    const [month, year] = cardForm.value.expiryDate.split('/')
    const expMonth = parseInt(month, 10)
    const expYear = parseInt('20' + year, 10)

    // ✅ CHECK IF THERE'S AN EXISTING DEFAULT CARD
    let hasExistingDefault = false
    if (savedCards.value && savedCards.value.length > 0) {
      hasExistingDefault = savedCards.value.some(card => card.isDefault === true)
    }

    // ✅ IF NO EXISTING DEFAULT, MAKE THIS CARD DEFAULT
    const isDefault = !hasExistingDefault

    const paymentMethodRef = collection(db, 'users', auth.currentUser.uid, 'payment_methods')
    
    await addDoc(paymentMethodRef, {
      cardholderName: cardForm.value.cardholderName.trim(),
      brand: detectBrand(digits),
      last4: digits.slice(-4),
      expMonth: expMonth,
      expYear: expYear,
      isDefault: isDefault, // ✅ USE COMPUTED VALUE
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    useToast().success('Card added successfully!')
    
    // Reload saved cards
    await loadUserData()
    
    closeCardModal()
  } catch (error) {
    console.error('Error saving card:', error)
    cardFormError.value = 'Failed to save card. Please try again.'
  } finally {
    savingCard.value = false
  }
}


function formatPrice(price) {
    return `$${price.toFixed(2)}`
}

// STRIPE PAYMENT INTEGRATION
async function proceedToPayment() {
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
    const items = selectedCartItems.value.map(item => {
        let sizeName = item.size || null
        if (
            !sizeName &&
            item.sizeIndex !== null &&
            item.sizeIndex !== undefined &&
            item.availableSizes &&
            item.availableSizes.length > 0
        ) {
            sizeName = item.availableSizes[item.sizeIndex] || null
        }

        return {
            cartItemId: item.cartItemId,  // ✅ ADD THIS
            item_name: item.item_name,    // ✅ Use item_name not name
            price: item.price,
            quantity: item.quantity,
            img_url: item.img_url || null, // ✅ Use img_url not image
            size: sizeName,
            sizeIndex: item.sizeIndex !== undefined ? item.sizeIndex : null,
            productId: item.productId,
            sellerId: item.sellerId || '',  // ✅ Default to empty string
            sellerUsername: item.sellerUsername || '',
            shopName: item.shopName || '',
            availableSizes: item.availableSizes || null  // ✅ Add this
        }
        })


    const itemsTotal = selectedCartItems.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const grandTotal = itemsTotal + SHIPPING_FEE

    console.log('🛒 Checkout Data:', {
      items,
      itemsTotal,
      shippingFee: SHIPPING_FEE,
      grandTotal,
      deliveryAddress: selectedAddress.value,
      savedCard: selectedCard.value ? {
            last4: selectedCard.value.last4 || '',
            cardholderName: selectedCard.value.cardholderName || ''
          } : null
    })

    const baseUrl = window.location.origin
    const token = await auth.currentUser.getIdToken()

    // ✅ FIX: Don't include full items array in metadata
    const paymentData = {
      items, // Pass items separately (not in metadata)
      shippingFee: SHIPPING_FEE,
      totalAmount: grandTotal,
      deliveryAddress: selectedAddress.value,
      successUrl: `${baseUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout`,
      // ✅ METADATA: Only essential info that won't exceed 500 chars
      metadata: {
        itemCount: selectedCartItems.value.length,
        subtotal: itemsTotal.toFixed(2),
        total: grandTotal.toFixed(2),
        userId: auth.currentUser.uid
      }
    }

    if (selectedCard.value) {
      paymentData.savedCard = {
        last4: selectedCard.value.last4 || '',
        cardholderName: selectedCard.value.cardholderName || ''
      }
    }

    const functionUrl = 'https://us-central1-craftconnect-3b52c.cloudfunctions.net/createCheckoutSession'

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Payment failed')
    }

    const data = await response.json()
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
                                        <span class="font-semibold text-slate-900 dark:text-white">{{ address.fullName }}</span>
                                        <span v-if="address.default === 1"
                                            class="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">Default</span>
                                        <span
                                            class="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">{{ address.type }}</span>
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

                <!-- Payment Method Section -->
                <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Payment Method</h2>
                        <router-link to="/buyer-account/banks-cards"
                            class="text-sm font-medium text-primary hover:text-primary/80">
                            Manage Cards
                        </router-link>
                    </div>

                    <!-- Saved Cards List - SHOWN FIRST -->
                    <div v-if="savedCards.length > 0" class="space-y-3 mb-4">
                        <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Your Saved Cards:</p>
                        <div
                            v-for="(card, index) in savedCards"
                            :key="index"
                            @click="selectedCardIndex = index; useNewCard = false"
                            class="rounded-lg border-2 p-4 cursor-pointer transition-all"
                            :class="
                                !useNewCard && selectedCardIndex === index
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                            ">
                            <div class="flex items-center gap-3">
                                <!-- Card Brand Icon -->
                                <div class="flex h-10 w-14 items-center justify-center rounded bg-slate-100 dark:bg-slate-700">
                                    <svg v-if="card.brand === 'Visa'" class="h-6 w-auto" viewBox="0 0 48 32" fill="none">
                                        <rect width="48" height="32" rx="4" fill="#1434CB" />
                                        <text x="24" y="20" text-anchor="middle" fill="white" font-family="sans-serif" font-size="12" font-weight="bold">VISA</text>
                                    </svg>
                                    <svg v-else-if="card.brand === 'Mastercard'" class="h-6 w-auto" viewBox="0 0 48 32">
                                        <rect width="48" height="32" rx="4" fill="#EB001B" />
                                        <circle cx="20" cy="16" r="8" fill="#FF5F00" />
                                        <circle cx="28" cy="16" r="8" fill="#F79E1B" />
                                    </svg>
                                    <svg v-else class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                                    </svg>
                                </div>

                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <p class="font-semibold text-slate-900 dark:text-white">
                                            •••• •••• •••• {{ card.last4 }}
                                        </p>
                                        <span v-if="card.isDefault"
                                            class="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                            Default
                                        </span>
                                    </div>
                                    <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                        {{ card.cardholderName }}
                                    </p>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">
                                        Expires {{ String(card.expMonth).padStart(2, '0') }}/{{ String(card.expYear).slice(-2) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Divider - ONLY SHOWN IF THERE ARE SAVED CARDS -->
                    <div v-if="savedCards.length > 0" class="my-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                        <p class="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">OR</p>
                    </div>

                    <!-- Enter New Card Option -->
                    <button
                        @click="openCardModal"
                        class="w-full rounded-lg border-2 p-4 cursor-pointer transition-all text-left hover:border-primary/50"
                        :class="useNewCard ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-700'">
                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-14 items-center justify-center rounded bg-slate-100 dark:bg-slate-700">
                                <svg class="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="font-semibold text-slate-900 dark:text-white">Enter card at checkout</p>
                                <p class="text-xs text-slate-500 dark:text-slate-400">Add and pay with a new card</p>
                            </div>
                        </div>
                    </button>
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
                                    {{ cartItems.find(i => i.cartItemId === itemId)?.item_name }}:
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
                            {{ seller.sellerName?.charAt(0) || '?' }}
                        </div>
                        <h3 class="font-bold text-lg text-slate-900 dark:text-white">{{ seller.sellerName || 'Unknown Shop' }}</h3>
                    </div>

                    <div class="space-y-4">
                        <div v-for="item in seller.items" :key="item.cartItemId" class="flex gap-4">
                            <img :src="item.img_url" :alt="item.item_name"
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
                                    ⚠️ Only {{ stockWarnings.get(item.cartItemId).available }} available (you have {{ item.quantity }})
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
                            <span>Subtotal ({{ selectedCartItems.length }} items)</span>
                            <span>${{ orderSubtotal.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Shipping</span>
                            <span>${{ SHIPPING_FEE.toFixed(2) }}</span>
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
                            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <input v-model.trim="addressForm.fullName" :disabled="savingAddress"
                                class="w-full rounded-lg border px-3 py-2 text-sm sm:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                :class="touched.fullName && !fullNameValid ? 'border-red-500' : 'border-slate-300'"
                                @blur="touched.fullName = true" placeholder="e.g. Sarah Johnson" />
                            <p v-if="touched.fullName && !fullNameValid" class="text-xs text-red-600 mt-1">Full name is required.</p>
                        </div>

                        <!-- Phone -->
                        <div>
                            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
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
                            <p v-if="touched.phone && !phoneValid" class="text-xs text-red-600 mt-1">Must start with 8 or 9 and contain exactly 8 digits.</p>
                        </div>

                        <!-- Postal Code & Street -->
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Postal Code</label>
                                <input v-model.trim="addressForm.postalCode" inputmode="numeric" maxlength="6"
                                    :disabled="savingAddress"
                                    class="w-full rounded-lg border px-3 py-2 text-sm sm:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                    @input="addressForm.postalCode = (addressForm.postalCode || '').replace(/\D/g, '').slice(0, 6)"
                                    @blur="touched.postal = true"
                                    :class="touched.postal && !postalValid ? 'border-red-500' : 'border-slate-300'"
                                    placeholder="e.g. 238858" />
                                <p v-if="touched.postal && !postalValid" class="text-xs text-red-600 mt-1">Enter a valid 6-digit postal code.</p>
                            </div>

                            <div class="sm:col-span-2">
                                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Street / Block</label>
                                <input v-model.trim="addressForm.streetName" :disabled="savingAddress"
                                    class="w-full rounded-lg border px-3 py-2 text-sm sm:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                    @blur="touched.street = true"
                                    :class="touched.street && !streetValid ? 'border-red-500' : 'border-slate-300'"
                                    placeholder="e.g. 123 Orchard Road" />
                                <p v-if="touched.street && !streetValid" class="text-xs text-red-600 mt-1">Street / Block is required.</p>
                            </div>

                            <!-- Unit Number -->
                            <div class="sm:col-span-3">
                                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Unit Number</label>
                                <div class="flex">
                                    <span
                                        class="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">#</span>
                                    <input v-model="addressForm.unitNumber" :disabled="savingAddress"
                                        class="w-full rounded-r-lg border border-slate-300 px-3 py-2 text-sm sm:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                        @input="sanitizeUnit" placeholder="10-234 (optional)" />
                                </div>
                                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Digits and one dash only (e.g. 10-234).</p>
                            </div>
                        </div>

                        <!-- Type + Default -->
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
                            <div>
                                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Address Type</label>
                                <select v-model="addressForm.type" :disabled="savingAddress"
                                    class="w-full rounded-lg border px-3 py-2 text-sm sm:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                    :class="touched.type && !typeValid ? 'border-red-500' : 'border-slate-300'"
                                    @blur="touched.type = true">
                                    <option value="" disabled>Select</option>
                                    <option value="home">Home</option>
                                    <option value="work">Work</option>
                                    <option value="others">Others</option>
                                </select>
                                <p v-if="touched.type && !typeValid" class="text-xs text-red-600 mt-1">Please choose a type.</p>
                            </div>

                            <div class="flex items-center gap-2 pt-0 sm:pt-6">
                                <input id="mkdef" type="checkbox" v-model="addressForm.makeDefault"
                                    class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                                <label for="mkdef" class="text-sm text-slate-700 dark:text-slate-300">Set as default address</label>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <button type="submit" :disabled="savingAddress || !addressFormValid"
                                class="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-60 text-sm sm:text-base">
                                {{ savingAddress ? 'Saving…' : editAddressIndex === -1 ? 'Add Address' : 'Save Changes' }}
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

        <!-- Card Modal -->
        <transition name="fade">
            <div
                v-if="showCardModal"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="closeCardModal">
                <div class="absolute inset-0 bg-black/50"></div>
                
                <div class="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
                    <div class="mb-6 flex items-center justify-between">
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white">
                            Add Payment Card
                        </h3>
                        <button
                            @click="closeCardModal"
                            class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <form @submit.prevent="saveCard" class="space-y-4">
                        <!-- Cardholder Name -->
                        <div>
                            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Cardholder Name
                            </label>
                            <input
                                v-model.trim="cardForm.cardholderName"
                                type="text"
                                placeholder="John Doe"
                                @blur="cardTouched.cardholderName = true"
                                class="w-full rounded-lg border px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                :class="cardTouched.cardholderName && !cardValid.cardholderName ? 'border-red-500' : 'border-slate-300'"
                                required
                            />
                            <p v-if="cardTouched.cardholderName && !cardValid.cardholderName" class="mt-1 text-xs text-red-600">
                                Cardholder name is required
                            </p>
                        </div>

                        <!-- Card Number -->
                        <div>
                            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Card Number
                            </label>
                            <input
                                v-model="cardForm.cardNumber"
                                type="text"
                                inputmode="numeric"
                                placeholder="1234 5678 9012 3456"
                                maxlength="19"
                                @input="formatCardNumber"
                                @blur="cardTouched.cardNumber = true"
                                class="w-full rounded-lg border px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                :class="cardTouched.cardNumber && !cardValid.cardNumber ? 'border-red-500' : 'border-slate-300'"
                                required
                            />
                            <p v-if="cardTouched.cardNumber && !cardValid.cardNumber" class="mt-1 text-xs text-red-600">
                                Please enter a valid card number (16 digits)
                            </p>
                        </div>

                        <!-- Expiry Date -->
                        <div>
                            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Expiry Date
                            </label>
                            <input
                                v-model="cardForm.expiryDate"
                                type="text"
                                inputmode="numeric"
                                placeholder="MM/YY"
                                maxlength="5"
                                @input="formatExpiryDate"
                                @blur="cardTouched.expiryDate = true"
                                class="w-full rounded-lg border px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                :class="cardTouched.expiryDate && !cardValid.expiry ? 'border-red-500' : 'border-slate-300'"
                                required
                            />
                            <p v-if="cardTouched.expiryDate && !cardValid.expiry" class="mt-1 text-xs text-red-600">
                                Invalid expiry (MM/YY)
                            </p>
                        </div>

                        <!-- Error Message -->
                        <p v-if="cardFormError" class="text-sm text-red-600">{{ cardFormError }}</p>

                        <!-- Action Buttons -->
                        <div class="flex gap-3">
                            <button
                                type="submit"
                                :disabled="savingCard"
                                class="flex-1 rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
                                {{ savingCard ? 'Saving...' : 'Add Card' }}
                            </button>
                            <button
                                type="button"
                                @click="closeCardModal"
                                class="rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                                Cancel
                            </button>
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