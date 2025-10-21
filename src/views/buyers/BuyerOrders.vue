<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <!-- Keep your real sidebar -->
    <BuyerSideBar @toggle="isSidebarCollapsed = $event" />

    <main class="flex-1 p-6 sm:p-8 transition-all duration-300" :class="isSidebarCollapsed ? 'ml-20' : 'ml-64'">
      <div class="mx-auto w-full max-w-6xl space-y-8">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Orders</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">Track, manage and review your purchases</p>
          </div>

          <!-- Search -->
          <div class="relative w-full max-w-md">
            <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
              </svg>
            </span>
            <input
              v-model="queryStr"
              type="search"
              placeholder="Search product, order #, or shop"
              class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3
                     text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none
                     focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800
                     dark:text-slate-200 dark:placeholder-slate-400"/>
          </div>
        </div>

        <!-- Tabs (now 7 equal columns, stretched full width) -->
        <div class="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
          <nav class="grid w-full grid-cols-7 gap-2">
            <button v-for="t in tabs" :key="t.key"
                    @click="active = t.key"
                    class="relative flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm
                           font-medium transition-colors"
                    :class="active === t.key
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'">
              <span>{{ t.label }}</span>
              <span v-if="tabCounts[t.key] > 0"
                    class="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                {{ tabCounts[t.key] }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Empty / Loading -->
        <div v-if="loading" class="rounded-xl border border-slate-200 bg-white p-16 text-center
                                   text-slate-500 dark:border-slate-700 dark:bg-slate-800">
          Loading orders…
        </div>
        <div v-else-if="visibleOrders.length === 0"
             class="rounded-xl border border-slate-200 bg-white p-16 text-center
                    text-slate-500 dark:border-slate-700 dark:bg-slate-800">
          You don’t have any orders here yet.
        </div>

        <!-- Orders -->
        <div v-else class="space-y-6">
          <article v-for="o in visibleOrders" :key="o.id"
                   class="rounded-xl border border-slate-200 bg-white shadow-sm transition
                          hover:shadow-md dark:border-slate-700 dark:bg-slate-800">

            <!-- Header row -->
            <header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <span class="font-medium text-slate-700 dark:text-slate-200">Order #{{ o.orderId }}</span>
                <span class="text-slate-300">•</span>
                <span class="text-slate-500 dark:text-slate-400">
                  Shop: <span class="font-medium text-slate-700 dark:text-slate-200">
                    {{ o.products?.[0]?.shopName || 'Shop' }}
                  </span>
                </span>
                <RouterLink
                  :to="`/${(o.products?.[0]?.sellerUsername || 'shop').toLowerCase()}/?id=${o.products?.[0]?.sellerId || ''}`"
                  class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700
                         hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
                  Visit shop
                </RouterLink>
              </div>

              <div class="flex items-center gap-3">
                <span class="text-xs text-slate-500 dark:text-slate-400">
                  Placed: {{ formatDate(o.createdAt) }}
                </span>
                <span :class="statusMap[statusOf(o)]?.cls"
                      class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
                  <span :class="statusMap[statusOf(o)]?.dot" class="h-2 w-2 rounded-full"></span>
                  {{ statusMap[statusOf(o)]?.label || statusOf(o) }}
                </span>
              </div>
            </header>

            <!-- Items -->
            <div class="divide-y divide-slate-100 px-4 dark:divide-slate-700">
              <div v-for="(p, idx) in o.products" :key="idx" class="flex items-center gap-3 py-4">
                <img :src="p.img_url" class="h-16 w-16 rounded-lg object-cover" alt="" />
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium text-slate-900 dark:text-white">{{ p.item_name }}</p>
                  <p class="text-sm text-slate-500 dark:text-slate-400">
                    Qty: {{ p.quantity }} <span v-if="p.size"> • Size: {{ p.size }}</span>
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Item total</p>
                  <p class="font-semibold text-slate-900 dark:text-white">
                    S${{ (p.totalPrice ?? (p.price * p.quantity)).toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer / actions -->
            <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-700">
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Order Total</p>
                <p class="text-xl font-bold text-slate-900 dark:text-white">
                  S${{ orderGrand(o).toFixed(2) }}
                </p>
              </div>

              <div class="flex flex-wrap items-center justify-end gap-2">
                <!-- To Pay -->
                <template v-if="statusOf(o) === 'to_pay'">
                  <button @click="payNow(o)" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Pay Now
                  </button>
                  <button @click="openCancelConfirm(o)" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Cancel Order
                  </button>
                </template>

                <!-- To Ship -->
                <template v-else-if="statusOf(o) === 'to_ship'">
                  <button @click="openCancelConfirm(o)" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Cancel Order
                  </button>
                </template>

                <!-- To Receive -->
                <template v-else-if="statusOf(o) === 'to_receive'">
                  <button @click="markReceived(o)" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Order Received
                  </button>
                </template>

                <!-- Completed -->
                <template v-else-if="statusOf(o) === 'completed'">
                  <button @click="rateOrder(o)" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Rate
                  </button>
                  <button
                    @click="requestReturn(o)"
                    class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50
                           dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
                    Request Return/Refund
                  </button>
                </template>

                <!-- Cancelled / Return-Refund -->
                <template v-else-if="statusOf(o) === 'cancelled' || statusOf(o) === 'return_refund'">
                  <button
                    @click="viewCancelledDetails(o)"
                    class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50
                           dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
                    Cancelled Details
                  </button>
                </template>

                <!-- Contact Seller -->
                <RouterLink
                  class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50
                         dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  :to="`/${(o.products?.[0]?.sellerUsername || 'shop').toLowerCase()}/?id=${o.products?.[0]?.sellerId || ''}`">
                  Contact Seller
                </RouterLink>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>

    <!-- Confirm Cancel -->
    <div v-if="showCancelConfirm" class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Cancel this order?</h3>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          This will move the order to <span class="font-medium">Cancelled</span> and start a refund process if payment was made.
        </p>
        <div class="mt-6 flex justify-end gap-2">
          <button @click="showCancelConfirm = false"
                  class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50
                         dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
            Never mind
          </button>
          <button @click="confirmCancel" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Cancelled Details -->
    <CancelledDetailsModal
      v-if="selectedCancelled"
      :order="selectedCancelled"
      @close="selectedCancelled = null"
      @open-order="viewOrderDetails"
    />

    <!-- Order Details -->
    <OrderDetailsModal
      v-if="selectedOrder"
      :order="selectedOrder"
      @close="selectedOrder = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue'

import { auth, db } from '@/firebase/firebase_config'
import {
  collection, query as fsQuery, where, orderBy, onSnapshot,
  doc, updateDoc, arrayUnion, Timestamp
} from 'firebase/firestore'

import CancelledDetailsModal from '@/components/orders/CancelledDetailsModal.vue'
import OrderDetailsModal   from '@/components/orders/OrderDetailsModal.vue'

/* UI state */
const isSidebarCollapsed = ref(false)
const loading = ref(true)
const active = ref('all')
const queryStr = ref('')

/* cancel confirm */
const showCancelConfirm = ref(false)
const orderToCancel = ref(null)

/* modals */
const selectedCancelled = ref(null)
const selectedOrder     = ref(null)

/* orders */
const orders = ref([])

/* tabs */
const tabs = [
  { key: 'all',           label: 'All' },
  { key: 'to_pay',        label: 'To Pay' },
  { key: 'to_ship',       label: 'To Ship' },
  { key: 'to_receive',    label: 'To Receive' },
  { key: 'completed',     label: 'Completed' },
  { key: 'cancelled',     label: 'Cancelled' },
  { key: 'return_refund', label: 'Return/Refund' }
]

/* status chips */
const statusMap = {
  to_pay:        { label: 'To Pay',        cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',         dot: 'bg-blue-600' },
  to_ship:       { label: 'To Ship',       cls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200', dot: 'bg-indigo-600' },
  to_receive:    { label: 'To Receive',    cls: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200',             dot: 'bg-sky-600' },
  completed:     { label: 'Delivered',     cls: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200',     dot: 'bg-green-600' },
  cancelled:     { label: 'Cancelled',     cls: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',       dot: 'bg-slate-500' },
  return_refund: { label: 'Return/Refund', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',     dot: 'bg-amber-600' }
}

/* ---- robust status helpers ---- */
function lastStatusFromLog(o) {
  const log = o?.statusLog || []
  if (!log.length) return null
  // assume time ascending in your data; otherwise pick the last
  return log[log.length - 1]?.status || null
}
function statusOf(o) {
  return o?.status || lastStatusFromLog(o) || 'to_pay'
}

/* counts per tab (use robust status) */
const tabCounts = computed(() => {
  const c = { all: orders.value.length, to_pay: 0, to_ship: 0, to_receive: 0, completed: 0, cancelled: 0, return_refund: 0 }
  for (const o of orders.value) {
    const s = statusOf(o)
    if (c[s] !== undefined) c[s]++
  }
  return c
})

/* search + tab filter + sort */
const visibleOrders = computed(() => {
  const q = queryStr.value.trim().toLowerCase()
  const base = active.value === 'all'
    ? orders.value
    : orders.value.filter(o => statusOf(o) === active.value)

  const filtered = q
    ? base.filter(o => {
        const hay = [
          o.orderId,
          o.products?.[0]?.shopName,
          ...(o.products || []).map(p => p.item_name)
        ].join(' ').toLowerCase()
        return hay.includes(q)
      })
    : base

  return filtered.sort((a, b) => {
    const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : +new Date(a.createdAt || 0)
    const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : +new Date(b.createdAt || 0)
    return tb - ta
  })
})

/* subtotal helper if totals missing */
function orderGrand(o) {
  if (o?.totals?.grandTotal != null) return Number(o.totals.grandTotal)
  const sum = (o.products || []).reduce((acc, p) => acc + (p.totalPrice ?? (p.price * p.quantity)), 0)
  return Number(sum.toFixed(2))
}

/* Firestore live query */
let unsub = null
onMounted(() => {
  const stop = auth.onAuthStateChanged(async (u) => {
    if (!u) { loading.value = false; return }
    const q = fsQuery(
      collection(db, 'orders'),
      where('uid', '==', u.uid),
      orderBy('createdAt', 'desc')
    )
    unsub?.()
    unsub = onSnapshot(q, (snap) => {
      orders.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    }, () => { loading.value = false })
  })
  onBeforeUnmount(() => { stop(); unsub?.() })
})

/* Utils */
function formatDate(ts) {
  if (!ts) return '—'
  if (ts.toDate) return ts.toDate().toLocaleString('en-SG', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
  try { return new Date(ts).toLocaleString('en-SG') } catch { return '—' }
}

/* Actions */
function payNow(o){ alert(`Pay for order ${o.orderId}`) }

function openCancelConfirm(o){ orderToCancel.value = o; showCancelConfirm.value = true }

async function confirmCancel(){
  if (!orderToCancel.value) return
  const o = orderToCancel.value
  showCancelConfirm.value = false
  await updateDoc(doc(db, 'orders', o.id), {
    status: 'cancelled',
    statusLog: arrayUnion({ status:'cancelled', by:'buyer', time: Timestamp.now() })
  })
  orderToCancel.value = null
}

function markReceived(o){
  updateDoc(doc(db, 'orders', o.id), {
    status:'completed',
    statusLog: arrayUnion({ status:'completed', by:'buyer', time: Timestamp.now() })
  })
}

function rateOrder(o){ alert(`Rate order ${o.orderId}`) }

function requestReturn(o){
  updateDoc(doc(db, 'orders', o.id), {
    status:'return_refund',
    statusLog: arrayUnion({ status:'return_refund', by:'buyer', time: Timestamp.now() })
  })
}

function viewCancelledDetails(o){ selectedCancelled.value = o }
function viewOrderDetails(o){ selectedOrder.value = o }
</script>

<style scoped>
article:hover { transform: translateY(-1px); transition: box-shadow .2s, transform .2s; }
</style>
