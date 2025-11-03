<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db, auth } from '@/firebase/firebase_config'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore'
import { useToast } from '@/composables/useToast.js'

const router = useRouter()
const route = useRoute()
const sessionId = ref('')
const loading = ref(true)
const orderCreated = ref(false)
const error = ref(false)

onMounted(async () => {
  // Get session ID from URL query parameters
  sessionId.value = route.query.session_id || ''
  
  if (!sessionId.value) {
    error.value = true
    loading.value = false
    useToast().error('Invalid payment session')
    return
  }

  try {
    // Get selected items from session storage
    const selectedItemIds = JSON.parse(sessionStorage.getItem('checkoutItems') || '[]')
    
    if (selectedItemIds.length === 0) {
      throw new Error('No items found in checkout')
    }

    // Get current user's cart
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    const cartDoc = await getDoc(doc(db, 'carts', currentUser.uid))
    if (!cartDoc.exists()) {
      throw new Error('Cart not found')
    }

    const cartData = cartDoc.data()
    const allCartItems = cartData.items || []
    
    // Filter only the selected items
    const selectedItems = allCartItems.filter(item => 
      selectedItemIds.includes(item.cartItemId)
    )

    if (selectedItems.length === 0) {
      throw new Error('Selected items not found in cart')
    }

    // Get user details for shipping address
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
    const userData = userDoc.data()
    
    // Get the selected address (from session or default)
    const addresses = userData?.addresses || []
    const defaultAddress = addresses.find(a => a.default === 1) || addresses[0]

    if (!defaultAddress) {
      throw new Error('No shipping address found')
    }

    // Group items by seller
    const itemsBySeller = {}
    selectedItems.forEach(item => {
      if (!itemsBySeller[item.sellerId]) {
        itemsBySeller[item.sellerId] = []
      }
      itemsBySeller[item.sellerId].push(item)
    })

    // Create an order for each seller
    for (const [sellerId, items] of Object.entries(itemsBySeller)) {
      const orderRef = doc(collection(db, 'orders'))
      const orderId = orderRef.id

      // Calculate totals
      const productsTotalPrice = items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      )
      const shippingFee = 1.99
      const grandTotal = productsTotalPrice + shippingFee

      // Prepare products array for order
      const products = items.map(item => ({
        productId: item.productId,
        item_name: item.item_name,
        img_url: item.img_url,
        price: item.price,
        quantity: item.quantity,
        size: item.size || (item.availableSizes && item.sizeIndex !== null && item.sizeIndex !== undefined ? item.availableSizes[item.sizeIndex] : null),
        sizeIndex: item.sizeIndex !== undefined ? item.sizeIndex : null,
        sellerId: item.sellerId,
        sellerUsername: item.sellerUsername,
        shopName: item.shopName,
        totalPrice: item.price * item.quantity
      }))

      // Create order document
      const orderData = {
        orderId: orderId,
        uid: currentUser.uid,
        sellerId: sellerId,
        sellerUsername: items[0].sellerUsername,
        shopName: items[0].shopName,
        products: products,
        shippingAddress: {
          fullName: defaultAddress.fullName,
          phoneNumber: defaultAddress.phone || defaultAddress.phoneNumber,
          streetName: defaultAddress.streetName,
          unitNumber: defaultAddress.unitNumber || '',
          postalCode: defaultAddress.postalCode
        },
        totals: {
          productsTotalPrice: productsTotalPrice,
          shippingFee: shippingFee,
          grandTotal: grandTotal
        },
        payment: {
          method: 'card',
          transactionId: sessionId.value,
          paidAt: serverTimestamp()
        },
        status: 'to_ship',
        statusLog: [
        {
            status: 'to_pay',
            time: new Date(),  // ✅ Use Date object instead
            by: 'system'
        },
        {
            status: 'to_ship',
            time: new Date(),  // ✅ Use Date object instead
            by: 'system'
        }
        ],
        logistics: {
          shipper: null,
          trackingNumber: null,
          shippedAt: null,
          deliveredAt: null
        },
        createdAt: serverTimestamp()
      }

      // Save order to Firestore
      await setDoc(orderRef, orderData)
    }

    // Remove selected items from cart
    const remainingItems = allCartItems.filter(item => 
      !selectedItemIds.includes(item.cartItemId)
    )

    await updateDoc(doc(db, 'carts', currentUser.uid), {
      items: remainingItems
    })

    // Clear session storage
    sessionStorage.removeItem('checkoutItems')

    orderCreated.value = true
    loading.value = false

  } catch (err) {
    console.error('Error creating order:', err)
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    })
    error.value = true
    loading.value = false
    useToast().error(`Failed to create order: ${err.message}`)
  }
})

function continueShopping() {
  router.push('/')
  // Scroll to top after navigation
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 100)
}

function viewOrders() {
  router.push('/buyer-orders')
}
</script>

<template>
  <main class="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
      <p class="text-slate-600 dark:text-slate-400">Processing your order...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="mb-6 flex justify-center">
        <div class="rounded-full bg-red-100 dark:bg-red-900/20 p-6">
          <svg class="h-16 w-16 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
      </div>
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Something Went Wrong
      </h1>
      <p class="text-slate-600 dark:text-slate-400 mb-8">
        We couldn't process your order. Please contact support with your payment confirmation.
      </p>
      <button 
        @click="continueShopping"
        class="px-8 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-all">
        Return to Home
      </button>
    </div>

    <!-- Success Content -->
    <div v-else-if="orderCreated" class="text-center py-12">
      <!-- Success Icon -->
      <div class="mb-6 flex justify-center">
        <div class="rounded-full bg-green-100 dark:bg-green-900/20 p-6">
          <svg class="h-16 w-16 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>

      <!-- Success Message -->
      <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
        Payment Successful! 🎉
      </h1>
      
      <p class="text-lg text-slate-600 dark:text-slate-400 mb-2">
        Thank you for your purchase!
      </p>
      
      <p class="text-sm text-slate-500 dark:text-slate-500 mb-8">
        Your order has been confirmed and will be processed shortly.
      </p>

      <!-- Order Details Card -->
      <div class="max-w-md mx-auto mb-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-left">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Order Details</h2>
        
        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-slate-600 dark:text-slate-400">Transaction ID:</span>
            <span class="font-mono text-slate-900 dark:text-white text-xs">
              {{ sessionId ? sessionId.substring(0, 20) + '...' : 'Processing...' }}
            </span>
          </div>
          
          <div class="flex justify-between text-sm">
            <span class="text-slate-600 dark:text-slate-400">Status:</span>
            <span class="text-green-600 dark:text-green-400 font-semibold">Confirmed</span>
          </div>
          
          <div class="flex justify-between text-sm">
            <span class="text-slate-600 dark:text-slate-400">Payment Method:</span>
            <span class="text-slate-900 dark:text-white">Credit Card</span>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p class="text-xs text-slate-500 dark:text-slate-400 text-center">
            A confirmation email will be sent to your registered email address.
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button 
          @click="viewOrders"
          class="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-all shadow-md">
          View My Orders
        </button>
        
        <button 
          @click="continueShopping"
          class="w-full sm:w-auto px-8 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          Continue Shopping
        </button>
      </div>

      <!-- Additional Info -->
      <div class="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">What's Next?</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">

          <!-- Step 1: Order Confirmation -->
          <div class="flex items-start gap-4">
            <!-- Step number -->
            <span class="inline-block w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mt-1">1</span>
            <!-- Icon + text centered -->
            <div class="flex flex-col items-center">
              <img src="https://img.icons8.com/ios-filled/50/000000/task-completed.png" alt="Order Confirmation" class="w-8 h-8 mb-1">
              <p class="text-sm font-medium text-slate-900 dark:text-white">Order Confirmation</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 text-center">Click on "View My Orders"</p>
            </div>
          </div>
          
          <!-- Step 2: Processing -->
          <div class="flex items-start gap-4">
            <span class="inline-block w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mt-1">2</span>
            <div class="flex flex-col items-center">
              <img src="https://img.icons8.com/ios-filled/50/000000/process.png" alt="Processing" class="w-8 h-8 mb-1">
              <p class="text-sm font-medium text-slate-900 dark:text-white">Processing</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 text-center">Seller prepares your items</p>
            </div>
          </div>
          
          <!-- Step 3: Delivery -->
          <div class="flex items-start gap-4">
            <span class="inline-block w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mt-1">3</span>
            <div class="flex flex-col items-center">
              <img src="https://img.icons8.com/ios-filled/50/000000/motorcycle-delivery-single-box.png" alt="Delivery" class="w-8 h-8 mb-1">
              <p class="text-sm font-medium text-slate-900 dark:text-white">Delivery</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 text-center">Track your shipment</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  </main>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>