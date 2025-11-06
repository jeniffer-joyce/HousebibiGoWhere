<!-- src/views/sellers/SellerAnalytics.vue -->
<template>
  <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col justify-center items-center min-h-[480px] gap-4">
      <div class="relative">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span class="material-symbols-outlined text-2xl text-primary animate-pulse">analytics</span>
        </div>
      </div>
      <div class="text-center">
        <p class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Loading Analytics</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">Fetching your business data...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="max-w-7xl mx-auto">
      <!-- Header with gradient background -->
      <div class="mb-8 relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-2xl p-8 border border-primary/10 dark:border-primary/20">
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
              <span class="material-symbols-outlined text-3xl text-primary">analytics</span>
            </div>
            <div>
              <h1 class="text-4xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p class="mt-1 text-gray-600 dark:text-gray-400">Comprehensive insights into your business performance</p>
            </div>
          </div>
        </div>
        <!-- Decorative element -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <!-- Stats Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Orders -->
        <div class="group relative bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-blue-100 dark:border-blue-900/30 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Total Orders</p>
              <div class="p-3 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span class="material-symbols-outlined text-2xl text-white">shopping_bag</span>
              </div>
            </div>
            <p class="text-4xl font-bold text-gray-900 dark:text-white mb-1">{{ totalOrders }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">All time orders</p>
          </div>
        </div>

        <!-- Completed Orders -->
        <div class="group relative bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-emerald-100 dark:border-emerald-900/30 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Completed</p>
              <div class="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span class="material-symbols-outlined text-2xl text-white">check_circle</span>
              </div>
            </div>
            <p class="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{{ completedOrders }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Successfully fulfilled</p>
          </div>
        </div>

        <!-- Cancelled Orders -->
        <div class="group relative bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-red-100 dark:border-red-900/30 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">Cancelled</p>
              <div class="p-3 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span class="material-symbols-outlined text-2xl text-white">cancel</span>
              </div>
            </div>
            <p class="text-4xl font-bold text-red-600 dark:text-red-400 mb-1">{{ cancelledOrders }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Not completed</p>
          </div>
        </div>

        <!-- Average Rating -->
        <div class="group relative bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-amber-100 dark:border-amber-900/30 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Avg. Rating</p>
              <div class="p-3 bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span class="material-symbols-outlined text-2xl text-white">star</span>
              </div>
            </div>
            <div class="flex items-end gap-2 mb-1">
              <p class="text-4xl font-bold text-amber-600 dark:text-amber-400">{{ averageRating }}</p>
              <p class="text-xl text-gray-400 dark:text-gray-500 mb-1">/ 5.0</p>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">From {{ totalRatings }} ratings</p>
          </div>
        </div>
      </div>

      <!-- Time Range Filter -->
      <div class="mb-8 bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div class="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <span class="material-symbols-outlined text-xl text-primary">trending_up</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Performance Trends</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">Filter data by time period</p>
            </div>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="range in timeRanges"
              :key="range.value"
              @click="selectedTimeRange = range.value"
              class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              :class="selectedTimeRange === range.value
                ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/30 scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'"
            >
              {{ range.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Orders Over Time Chart -->
        <div class="group relative bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span class="material-symbols-outlined text-lg text-blue-600 dark:text-blue-400">show_chart</span>
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Orders Over Time</h3>
            </div>
            <div class="h-64 relative">
              <canvas ref="ordersChartCanvas"></canvas>
            </div>
          </div>
        </div>

        <!-- Cancelled Orders Chart -->
        <div class="group relative bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <span class="material-symbols-outlined text-lg text-red-600 dark:text-red-400">cancel</span>
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Cancelled Orders</h3>
            </div>
            <div class="h-64 relative">
              <canvas ref="cancelledChartCanvas"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating Distribution Chart -->
      <div class="group relative bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 mb-8 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl"></div>
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <span class="material-symbols-outlined text-lg text-amber-600 dark:text-amber-400">bar_chart</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Rating Distribution</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Customer satisfaction breakdown</p>
            </div>
          </div>
          <div class="h-64 relative">
            <canvas ref="ratingsChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Revenue Stats -->
      <div class="relative bg-gradient-to-br from-primary/5 via-primary/10 to-transparent dark:from-primary/10 dark:via-primary/20 dark:to-transparent rounded-2xl shadow-sm p-8 border border-primary/20 dark:border-primary/30 overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl"></div>
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-8">
            <div class="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
              <span class="material-symbols-outlined text-2xl text-white">payments</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Financial performance metrics</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <!-- Total Revenue -->
            <div class="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <div class="flex items-start justify-between mb-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <span class="material-symbols-outlined text-lg text-green-600 dark:text-green-400">account_balance_wallet</span>
                </div>
                <div class="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <span class="text-xs font-semibold text-green-600 dark:text-green-400">Total</span>
                </div>
              </div>
              <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Revenue</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">${{ totalRevenue.toFixed(2) }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">From completed orders</p>
            </div>

            <!-- Average Order Value -->
            <div class="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <div class="flex items-start justify-between mb-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <span class="material-symbols-outlined text-lg text-blue-600 dark:text-blue-400">shopping_cart</span>
                </div>
                <div class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <span class="text-xs font-semibold text-blue-600 dark:text-blue-400">Avg</span>
                </div>
              </div>
              <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Average Order Value</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">${{ averageOrderValue.toFixed(2) }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">Per completed order</p>
            </div>

            <!-- Completion Rate -->
            <div class="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <div class="flex items-start justify-between mb-3">
                <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <span class="material-symbols-outlined text-lg text-purple-600 dark:text-purple-400">verified</span>
                </div>
                <div class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <span class="text-xs font-semibold text-purple-600 dark:text-purple-400">Rate</span>
                </div>
              </div>
              <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Completion Rate</p>
              <div class="flex items-end gap-1">
                <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ completionRate.toFixed(1) }}</p>
                <p class="text-xl text-gray-500 dark:text-gray-400 mb-1">%</p>
              </div>
              <div class="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                  :style="{ width: `${completionRate}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <ToastNotification
      :show="toast.show"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      @close="toast.show = false"
    />
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { auth, db } from '@/firebase/firebase_config'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import Chart from 'chart.js/auto'
import ToastNotification from '@/components/ToastNotification.vue'

// State
const loading = ref(true)
const orders = ref([])
const reviews = ref([])
const selectedTimeRange = ref('30d')

// Chart refs
const ordersChartCanvas = ref(null)
const cancelledChartCanvas = ref(null)
const ratingsChartCanvas = ref(null)
let ordersChart = null
let cancelledChart = null
let ratingsChart = null

// Time ranges
const timeRanges = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'All Time', value: 'all' }
]

// Toast notification
const toast = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
})

function showToast(type, title, message) {
  toast.value = { show: true, type, title, message }
}

// Computed Statistics
const totalOrders = computed(() => filteredOrders.value.length)

const completedOrders = computed(() => 
  filteredOrders.value.filter(order => {
    const lastStatus = getLastStatus(order)
    return lastStatus === 'completed'
  }).length
)

const cancelledOrders = computed(() => 
  filteredOrders.value.filter(order => {
    const lastStatus = getLastStatus(order)
    return lastStatus === 'cancelled'
  }).length
)

const totalReviews = computed(() => {
  // Count the number of review documents, not individual ratings
  const count = reviews.value.length
  console.log('📊 Total review documents:', count)
  return count
})

const totalRatings = computed(() => {
  return filteredReviews.value.reduce((acc, r) => {
    const items = Array.isArray(r.items) ? r.items : []
    return acc + items.filter(it => Number(it?.rating) > 0).length
  }, 0)
})

// average of item-level ratings
const averageRating = computed(() => {
  const all = filteredReviews.value.flatMap(r =>
    (Array.isArray(r.items) ? r.items : [])
      .map(it => Number(it?.rating) || 0)
      .filter(n => n > 0)
  )
  if (!all.length) return '0.0'
  const sum = all.reduce((a, b) => a + b, 0)
  return (sum / all.length).toFixed(1)
})

const totalRevenue = computed(() => {
  return filteredOrders.value
    .filter(order => getLastStatus(order) === 'completed')
    .reduce((sum, order) => sum + (Number(order.totals?.grandTotal) || 0), 0)
})

const averageOrderValue = computed(() => {
  const completed = filteredOrders.value.filter(order => getLastStatus(order) === 'completed')
  if (completed.length === 0) return 0
  return totalRevenue.value / completed.length
})

const completionRate = computed(() => {
  if (totalOrders.value === 0) return 0
  return (completedOrders.value / totalOrders.value) * 100
})

// Filter orders by time range
const filteredOrders = computed(() => {
  if (selectedTimeRange.value === 'all') return orders.value
  
  const now = new Date()
  const days = parseInt(selectedTimeRange.value)
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  
  return orders.value.filter(order => {
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
    return orderDate >= cutoffDate
  })
})

// Helper function to get last status from statusLog
function getLastStatus(order) {
  if (!order.statusLog || order.statusLog.length === 0) {
    return order.status || 'unknown'
  }
  const sorted = [...order.statusLog].sort((a, b) => {
    const timeA = a.time?.toDate ? a.time.toDate() : new Date(a.time)
    const timeB = b.time?.toDate ? b.time.toDate() : new Date(b.time)
    return timeB - timeA
  })
  return sorted[0].status || 'unknown'
}

// Load Data
async function loadAnalyticsData() {
  try {
    loading.value = true
    const uid = auth.currentUser?.uid
    if (!uid) {
      showToast('error', 'Error', 'You must be logged in to view analytics')
      loading.value = false
      return
    }

    // Get seller's products to find orders
    const productsQuery = query(
      collection(db, 'products'),
      where('sellerId', '==', uid)
    )
    const productsSnap = await getDocs(productsQuery)
    const sellerProductIds = productsSnap.docs.map(doc => doc.id)

    console.log('🏪 Seller product IDs:', sellerProductIds)

    if (sellerProductIds.length === 0) {
      orders.value = []
      reviews.value = []
      loading.value = false
      return
    }

    // Get orders - Query by sellerId first (according to Firestore rules)
    // Then filter client-side for products
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('sellerId', '==', uid),
        orderBy('createdAt', 'desc')
      )
      const ordersSnap = await getDocs(ordersQuery)
      
      // Map orders
      orders.value = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      console.log('📦 Loaded orders:', orders.value.length)
    } catch (orderError) {
      console.error('❌ Error loading orders:', orderError)
      // Fallback: try without orderBy if index not set up
      try {
        const ordersQuerySimple = query(
          collection(db, 'orders'),
          where('sellerId', '==', uid)
        )
        const ordersSnapSimple = await getDocs(ordersQuerySimple)
        orders.value = ordersSnapSimple.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        console.log('📦 Loaded orders (simple query):', orders.value.length)
      } catch (fallbackError) {
        console.error('❌ Fallback order query also failed:', fallbackError)
        orders.value = []
        showToast('error', 'Orders Error', 'Unable to load orders. Check console for details.')
      }
    }

    // Get reviews - Query by sellerId to comply with Firestore rules
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('sellerId', '==', uid)
      )
      const reviewsSnap = await getDocs(reviewsQuery)
      reviews.value = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      console.log('📊 Loaded reviews:', reviews.value.length, reviews.value)
      
      // Log sample review for debugging
      if (reviews.value.length > 0) {
        console.log('📝 Sample review:', {
          rating: reviews.value[0].rating,
          type: typeof reviews.value[0].rating,
          sellerId: reviews.value[0].sellerId,
          hasItems: 'items' in reviews.value[0],
          hasSellerService: 'sellerService' in reviews.value[0],
          hasDelivery: 'delivery' in reviews.value[0]
        })
      }
    } catch (reviewError) {
      console.error('❌ Error loading reviews:', reviewError)
      console.error('Error details:', {
        code: reviewError.code,
        message: reviewError.message
      })
      reviews.value = []
      
      // Show user-friendly error
      if (reviewError.code === 'permission-denied') {
        showToast('warning', 'Reviews Access', 'Unable to load reviews. This might be due to Firestore permissions.')
      }
    }

  } catch (error) {
    console.error('❌ Error loading analytics data:', error)
    showToast('error', 'Error', 'Failed to load analytics data: ' + (error.message || 'Unknown error'))
  } finally {
    loading.value = false
  }
}

// Prepare chart data
function prepareOrdersOverTimeData() {
  const dateMap = new Map()
  
  filteredOrders.value.forEach(order => {
    const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
    const dateKey = date.toISOString().split('T')[0]
    dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1)
  })

  const sortedDates = Array.from(dateMap.keys()).sort()
  const labels = sortedDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
  const data = sortedDates.map(date => dateMap.get(date))

  return { labels, data }
}

function prepareCancelledOrdersData() {
  const dateMap = new Map()
  
  filteredOrders.value
    .filter(order => getLastStatus(order) === 'cancelled')
    .forEach(order => {
      const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
      const dateKey = date.toISOString().split('T')[0]
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1)
    })

  const sortedDates = Array.from(dateMap.keys()).sort()
  const labels = sortedDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
  const data = sortedDates.map(date => dateMap.get(date))

  return { labels, data }
}

watch([reviews, selectedTimeRange], () => { createCharts() })

function prepareRatingsDistributionData() {
  const dist = { 1:0, 2:0, 3:0, 4:0, 5:0 }

  filteredReviews.value.forEach(r => {
    const items = Array.isArray(r.items) ? r.items : []
    items.forEach(it => {
      const n = Math.round(Number(it?.rating) || 0)
      if (n >= 1 && n <= 5) dist[n]++
    })
  })

  return {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    data: [dist[1], dist[2], dist[3], dist[4], dist[5]]
  }
}

// Create/Update Charts
async function createCharts() {
  await nextTick()

  // Check if canvas elements exist
  if (!ordersChartCanvas.value || !cancelledChartCanvas.value || !ratingsChartCanvas.value) {
    return
  }

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#e5e7eb' : '#374151'
  const gridColor = isDark ? '#374151' : '#e5e7eb'

  // Orders Over Time Chart
  const ordersData = prepareOrdersOverTimeData()
  if (ordersChart) ordersChart.destroy()
  
  ordersChart = new Chart(ordersChartCanvas.value, {
    type: 'line',
    data: {
      labels: ordersData.labels,
      datasets: [{
        label: 'Orders',
        data: ordersData.data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#3b82f6',
        pointHoverBorderColor: '#ffffff',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (context) => `Date: ${context[0].label}`,
            label: (context) => `Orders: ${context.parsed.y}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            color: textColor,
            stepSize: 1,
            font: {
              size: 11
            }
          },
          grid: { 
            color: gridColor,
            drawBorder: false
          },
          border: {
            display: false
          }
        },
        x: {
          ticks: { 
            color: textColor,
            font: {
              size: 11
            }
          },
          grid: { 
            display: false
          },
          border: {
            display: false
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  })

  // Cancelled Orders Chart
  const cancelledData = prepareCancelledOrdersData()
  if (cancelledChart) cancelledChart.destroy()
  
  cancelledChart = new Chart(cancelledChartCanvas.value, {
    type: 'bar',
    data: {
      labels: cancelledData.labels,
      datasets: [{
        label: 'Cancelled Orders',
        data: cancelledData.data,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#ef4444',
        borderWidth: 0,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (context) => `Date: ${context[0].label}`,
            label: (context) => `Cancelled: ${context.parsed.y}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            color: textColor,
            stepSize: 1,
            font: {
              size: 11
            }
          },
          grid: { 
            color: gridColor,
            drawBorder: false
          },
          border: {
            display: false
          }
        },
        x: {
          ticks: { 
            color: textColor,
            font: {
              size: 11
            }
          },
          grid: { 
            display: false
          },
          border: {
            display: false
          }
        }
      }
    }
  })

  // Ratings Distribution Chart
  const ratingsData = prepareRatingsDistributionData()
  if (ratingsChart) ratingsChart.destroy()
  
  ratingsChart = new Chart(ratingsChartCanvas.value, {
    type: 'bar',
    data: {
      labels: ratingsData.labels,
      datasets: [{
        label: 'Number of Reviews',
        data: ratingsData.data,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(250, 204, 21, 0.8)',
          'rgba(163, 230, 53, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          '#ef4444',
          '#fb923c',
          '#facc15',
          '#a3e635',
          '#22c55e'
        ],
        borderWidth: 0,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            title: (context) => context[0].label,
            label: (context) => `Reviews: ${context.parsed.y}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            color: textColor,
            stepSize: 1,
            font: {
              size: 11
            }
          },
          grid: { 
            color: gridColor,
            drawBorder: false
          },
          border: {
            display: false
          }
        },
        x: {
          ticks: { 
            color: textColor,
            font: {
              size: 11,
              weight: '600'
            }
          },
          grid: { 
            display: false
          },
          border: {
            display: false
          }
        }
      }
    }
  })
}

// Watch for time range changes
watch(selectedTimeRange, () => {
  createCharts()
})

// Watch for theme changes
const themeObserver = new MutationObserver(() => {
  createCharts()
})

onMounted(async () => {
  await loadAnalyticsData()
  await createCharts()
  
  // Observe theme changes
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

const filteredReviews = computed(() => {
  if (selectedTimeRange.value === 'all') return reviews.value
  const days = parseInt(selectedTimeRange.value) // '7d' -> 7, '30d' -> 30
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return reviews.value.filter(r => {
    const d = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt)
    return d >= cutoff
  })
})
</script>

<style scoped>
/* Fade-in animation for cards */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Apply staggered animation to grid items */
.grid > * {
  animation: fadeInUp 0.6s ease-out backwards;
}

.grid > *:nth-child(1) { animation-delay: 0.1s; }
.grid > *:nth-child(2) { animation-delay: 0.2s; }
.grid > *:nth-child(3) { animation-delay: 0.3s; }
.grid > *:nth-child(4) { animation-delay: 0.4s; }

/* Smooth transitions for interactive elements */
.group:hover {
  transform: translateY(-2px);
}

/* Loading spinner pulse effect */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Gradient animation for buttons */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Smooth chart container appearance */
canvas {
  animation: fadeIn 0.8s ease-out;
}
</style>