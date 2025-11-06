<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db, auth } from '@/firebase/firebase_config'
import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore'
import { useToast } from '@/composables/useToast.js'

const router = useRouter()
const route = useRoute()
const sessionId = ref('')
const loading = ref(true)
const orderCreated = ref(false)
const error = ref(false)
let orderProcessingStarted = false

onMounted(async () => {
  if (orderProcessingStarted) {
    console.log('⏭️ Order already being processed, skipping...')
    return
  }
  orderProcessingStarted = true

  sessionId.value = route.query.session_id || ''
  
  if (!sessionId.value) {
    error.value = true
    loading.value = false
    useToast().error('Invalid payment session')
    return
  }

  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    // ✅ STEP 1: Get full items from sessionStorage
    const checkoutItems = JSON.parse(sessionStorage.getItem('checkoutItems') || '[]')
    if (checkoutItems.length === 0) {
      throw new Error('No items found in checkout')
    }

    console.log('✅ checkoutItems from sessionStorage:', checkoutItems)

    // ✅ STEP 2: Get user data (address, etc.)
    const userDocRef = doc(db, 'users', currentUser.uid)
    const userDocSnap = await getDoc(userDocRef)
    
    if (!userDocSnap.exists()) {
      throw new Error('User data not found')
    }

    const userData = userDocSnap.data()
    const SHIPPING_FEE = 1.99

    // ✅ STEP 3: Group items by seller and create orders
    const itemsBySeller = {}
    checkoutItems.forEach(item => {
      if (!itemsBySeller[item.sellerId]) {
        itemsBySeller[item.sellerId] = []
      }
      itemsBySeller[item.sellerId].push(item)
    })

    console.log('✅ Items grouped by seller:', Object.keys(itemsBySeller))

    // ✅ STEP 4: Create orders
    const orderPromises = Object.entries(itemsBySeller).map(async ([sellerId, sellerItems]) => {
      try {
        const productsTotalPrice = sellerItems.reduce((sum, item) => 
          sum + ((item.price || 0) * (item.quantity || 1)), 0
        )

        const orderData = {
          orderId: '', // Will be set after creation
          uid: currentUser.uid,
          sellerId: sellerId,
          sellerUsername: sellerItems[0].sellerUsername || '',
          shopName: sellerItems[0].shopName || 'Shop',
          products: sellerItems.map(item => ({
            productId: item.productId || '',
            sellerId: item.sellerId || '',
            item_name: item.item_name || item.name || 'Product',
            img_url: item.img_url || item.image || '',
            price: item.price || 0,
            quantity: item.quantity || 1,
            size: item.size || null,
            sizeIndex: item.sizeIndex !== null ? item.sizeIndex : null,
            sellerUsername: item.sellerUsername || '',
            shopName: item.shopName || '',
            totalPrice: (item.price || 0) * (item.quantity || 1)
          })),
          shippingAddress: {
            fullName: userData.addresses?.[0]?.fullName || '',
            phoneNumber: userData.addresses?.[0]?.phone || '',
            streetName: userData.addresses?.[0]?.streetName || '',
            unitNumber: userData.addresses?.[0]?.unitNumber || '',
            postalCode: userData.addresses?.[0]?.postalCode || ''
          },
          totals: {
            productsTotalPrice: Number(productsTotalPrice.toFixed(2)),
            shippingFee: Number(SHIPPING_FEE.toFixed(2)),
            grandTotal: Number((productsTotalPrice + SHIPPING_FEE).toFixed(2))
          },
          payment: {
            method: 'card',
            transactionId: sessionId.value,
            paidAt: serverTimestamp()
          },
          status: 'to_ship',
          statusLog: [
            { status: 'to_pay', time: new Date(), by: 'system' },
            { status: 'to_ship', time: new Date(), by: 'system' }
          ],
          logistics: {
            shipper: null,
            trackingNumber: null,
            shippedAt: null,
            deliveredAt: null
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        const ordersRef = collection(db, 'orders')
        const orderDocRef = await addDoc(ordersRef, orderData)
        
        console.log(`✅ Order created for seller ${sellerId}:`, orderDocRef.id)

        // ✅ TRY to update orderId (non-critical if fails)
        try {
          await updateDoc(orderDocRef, { orderId: orderDocRef.id })
          console.log(`✅ OrderId updated: ${orderDocRef.id}`)
        } catch (updateErr) {
          console.warn(`⚠️ OrderId update failed (non-critical):`, updateErr.message)
          // Continue anyway - order is already created with the document ID as reference
        }
        
        return orderDocRef.id
      } catch (err) {
        console.error(`❌ Failed to create order for seller ${sellerId}:`, err)
        throw err
      }
    })

    const orderIds = await Promise.all(orderPromises)
    console.log('✅ All orders created successfully:', orderIds)

    // ✅ STEP 5: Clean up sessionStorage
    sessionStorage.removeItem('checkoutItems')
    console.log('✅ SessionStorage cleaned')

    // ✅ STEP 6: Show success
    orderCreated.value = true
    loading.value = false

    useToast().success('Order confirmed! Check your email for details.')

  } catch (err) {
    console.error('=== FULL ERROR ===')
    console.error('Error:', err)
    console.error('Error code:', err.code)
    console.error('Error message:', err.message)
    
    error.value = true
    loading.value = false
    useToast().error(`Error: ${err.message}`)
  }
})

function continueShopping() {
  router.push('/')
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
      <div class="mb-6 flex justify-center">
        <div class="rounded-full bg-green-100 dark:bg-green-900/20 p-6">
          <svg class="h-16 w-16 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>

      <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
        Payment Successful! 🎉
      </h1>
      
      <p class="text-lg text-slate-600 dark:text-slate-400 mb-2">
        Thank you for your purchase!
      </p>
      
      <p class="text-sm text-slate-500 dark:text-slate-500 mb-8">
        Your order has been confirmed and will be processed shortly.
      </p>

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

      <div class="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">What's Next?</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="flex items-start gap-4">
            <span class="inline-block w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mt-1">1</span>
            <div class="flex flex-col items-center">
              <img src="https://img.icons8.com/ios-filled/50/000000/task-completed.png" alt="Order Confirmation" class="w-8 h-8 mb-1">
              <p class="text-sm font-medium text-slate-900 dark:text-white">Order Confirmation</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 text-center">Click on "View My Orders"</p>
            </div>
          </div>
          
          <div class="flex items-start gap-4">
            <span class="inline-block w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mt-1">2</span>
            <div class="flex flex-col items-center">
              <img src="https://img.icons8.com/ios-filled/50/000000/process.png" alt="Processing" class="w-8 h-8 mb-1">
              <p class="text-sm font-medium text-slate-900 dark:text-white">Processing</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 text-center">Seller prepares your items</p>
            </div>
          </div>
          
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
