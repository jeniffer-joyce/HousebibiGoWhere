<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <BuyerSideBar v-model:collapsed="isSidebarCollapsed" />

    <main
      class="flex-1 p-6 sm:p-8 transition-all duration-300"
      :class="isSidebarCollapsed ? 'ml-16' : 'ml-64'"
    >
      <div class="mx-auto w-full max-w-6xl space-y-8">
        <!-- success banner -->
        <div v-if="banner.show" class="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {{ banner.msg }}
        </div>

        <!-- Title + Search -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">My Orders</h1>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track, manage and review your purchases
            </p>
          </div>

          <div class="w-full max-w-md">
            <div class="relative">
              <input
                v-model="queryStr"
                type="text"
                placeholder="Search by product, order #, or shop"
                class="w-full rounded-xl border border-slate-300 bg-white px-10 py-2.5 text-sm
                       shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                       dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <svg
                class="absolute left-3 top-2.5 h-5 w-5 text-slate-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
          <div class="grid grid-cols-7 gap-2">
            <button
              v-for="t in tabs"
              :key="t.key"
              @click="active = t.key"
              class="flex h-11 items-center justify-center gap-2 rounded-xl border transition dark:border-slate-700"
              :class="active === t.key
                       ? 'border-transparent bg-blue-600 text-white'
                       : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200'"
            >
              <span class="text-sm font-medium">{{ t.label }}</span>
              <span
                v-if="tabCounts[t.key] > 0"
                class="rounded-full px-2 py-0.5 text-xs font-bold"
                :class="active === t.key ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'"
              >
                {{ tabCounts[t.key] }}
              </span>
            </button>
          </div>
        </div>

        <!-- Loading / Empty -->
        <div v-if="loading" class="flex h-48 items-center justify-center text-slate-500 dark:text-slate-400">
          <svg class="mr-2 h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
          </svg>
          Loading orders…
        </div>

        <div
          v-else-if="visibleOrders.length === 0"
          class="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-800"
        >
          <p class="text-lg font-semibold text-slate-900 dark:text-white">No orders yet</p>
          <p class="mt-1 text-slate-500 dark:text-slate-400">You don’t have any orders here.</p>
        </div>

        <!-- Orders List -->
        <div v-else class="space-y-6">
          <article
            v-for="o in visibleOrders"
            :key="o.id"
            class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-700">
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <span class="text-slate-700 dark:text-slate-200">
                  <span class="font-medium">Order #:</span> {{ o.orderId }}
                </span>
                <span class="text-slate-300">•</span>
                <span class="text-slate-700 dark:text-slate-200">
                  <span class="font-medium">Shop:</span>
                  <span class="font-semibold">{{ o.products?.[0]?.shopName || '—' }}</span>
                </span>
                <RouterLink
                  class="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-50
                         dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  :to="`/${(o.products?.[0]?.sellerUsername || 'shop').toLowerCase()}/?id=${o.products?.[0]?.sellerId || ''}`"
                >
                  Visit Shop
                </RouterLink>
              </div>

              <div class="flex items-center gap-3 text-sm">
                <span class="text-slate-500 dark:text-slate-400">Placed: {{ formatDate(o.createdAt) }}</span>
                <span
                  class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                  :class="statusMap[statusOf(o)]?.cls"
                >
                  <span class="h-2 w-2 rounded-full" :class="statusMap[statusOf(o)]?.dot"></span>
                  {{ statusMap[statusOf(o)]?.label || statusOf(o) }}
                </span>
              </div>
            </div>

            <!-- Items -->
            <div class="divide-y divide-slate-100 dark:divide-slate-700">
              <div
                v-for="(it, idx) in o.products || []"
                :key="idx"
                class="flex items-start justify-between gap-4 p-4"
              >
                <div class="flex items-start gap-3">
                  <img :src="it.img_url" class="h-16 w-16 rounded-md object-cover" />
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">{{ it.item_name }}</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                      <span v-if="it.size">Size: {{ it.size }}</span>
                      <span v-if="it.size && (it.quantity ?? 1)"> • </span>
                      Qty: {{ it.quantity ?? 1 }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Item total</p>
                  <p class="text-lg font-semibold text-slate-900 dark:text-white">
                    S${{ ((it.totalPrice ?? it.price * (it.quantity ?? 1)) || 0).toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
              <div>
                <p class="text-sm text-slate-500 dark:text-slate-400">Order Total</p>
                <p class="text-xl font-bold text-slate-900 dark:text-white">
                  S${{ orderGrand(o).toFixed(2) }}
                </p>
              </div>

              <div class="flex flex-wrap items-center justify-end gap-2">
                <!-- Buttons -->
                <template v-if="statusOf(o) === 'to_pay'">
                  <button @click="payNow(o)" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Pay Now</button>
                  <button @click="changePayment(o)" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Change Payment</button>
                  <button @click="openCancelConfirm(o)" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Cancel Order</button>
                </template>

                <template v-else-if="statusOf(o) === 'to_ship'">
                  <button @click="openCancelConfirm(o)" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Cancel Order</button>
                </template>

                <template v-else-if="statusOf(o) === 'to_receive'">
                  <button @click="markReceived(o)" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Order Received</button>
                </template>

                <template v-else-if="statusOf(o) === 'completed'">
                  <button @click="rateOrder(o)" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Rate</button>
                  <button
                    @click="openReturnModal(o)"
                    class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    Request Return/Refund
                  </button>
                </template>

                <template v-else-if="statusOf(o) === 'cancelled'">
                  <button
                    @click="viewCancelledDetails(o)"
                    class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Cancelled Details
                  </button>
                </template>

                <template v-else-if="statusOf(o) === 'return_refund'">
                  <button
                    @click="viewReturnDetails(o)"
                    class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    View Return/Refund Details
                  </button>
                </template>

                <!-- Contact Seller -->
                <RouterLink
                  class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                  :to="`/${(o.products?.[0]?.sellerUsername || 'shop').toLowerCase()}/?id=${o.products?.[0]?.sellerId || ''}`"
                >
                  Contact Seller
                </RouterLink>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>

    <!-- Cancel Confirm Modal -->
    <div
      v-if="showCancelConfirm"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
      @click="showCancelConfirm=false"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:mx-4 dark:bg-slate-800" @click.stop>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Cancel this order?</h3>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to cancel order <span class="font-medium">{{ orderToCancel?.orderId }}</span>?
        </p>
        <div class="mt-5 flex justify-end gap-2">
          <button @click="showCancelConfirm=false" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">No, keep order</button>
          <button @click="confirmCancel" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Yes, cancel</button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CancelledDetailsModal
      v-if="!!selectedCancelled"
      :visible="true"
      :order="selectedCancelled"
      @close="selectedCancelled = null"
      @open-order="(o)=>{ selectedCancelled=null; selectedOrder=o }"
    />

    <OrderDetailsModal
      v-if="!!selectedOrder"
      :visible="true"
      :order="selectedOrder"
      @close="selectedOrder = null"
      @open-refund="(o)=>{ selectedOrder=null; orderForReturnDetails=o; showReturnDetails=true }"
    />

    <ReturnRequestModal
      v-if="showReturnModal"
      :visible="true"
      :order="orderForReturn"
      @submitted="handleReturnSubmitted"
      @close="showReturnModal=false; orderForReturn=null"
    />

    <ReturnRequestDetailsModal
      v-if="showReturnDetails"
      :visible="true"
      :order="orderForReturnDetails"
      @close="showReturnDetails=false; orderForReturnDetails=null"
      @open-order="openOrderFromRefund"
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
import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue'
import ReturnRequestModal from '@/components/orders/ReturnRequestModal.vue'
import ReturnRequestDetailsModal from '@/components/orders/ReturnRequestDetailsModal.vue'

/* UI states */
const banner = ref({ show:false, msg:'' })
const isSidebarCollapsed = ref(false)
const loading = ref(true)
const active = ref('all')
const queryStr = ref('')
const showCancelConfirm = ref(false)
const orderToCancel = ref(null)
const selectedCancelled = ref(null)
const selectedOrder = ref(null)
const showReturnModal = ref(false)
const orderForReturn = ref(null)
const showReturnDetails = ref(false)
const orderForReturnDetails = ref(null)
const orders = ref([])

/* Tabs */
const tabs = [
  { key: 'all', label: 'All' },
  { key: 'to_pay', label: 'To Pay' },
  { key: 'to_ship', label: 'To Ship' },
  { key: 'to_receive', label: 'To Receive' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'return_refund', label: 'Return/Refund' }
]

/* Status map */
const statusMap = {
  to_pay:        { label: 'To Pay',        cls: 'bg-blue-50 text-blue-700',   dot: 'bg-blue-600' },
  to_ship:       { label: 'To Ship',       cls: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-600' },
  to_receive:    { label: 'To Receive',    cls: 'bg-sky-50 text-sky-700',     dot: 'bg-sky-600' },
  completed:     { label: 'Delivered',     cls: 'bg-green-50 text-green-700', dot: 'bg-green-600' },
  cancelled:     { label: 'Cancelled',     cls: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' },
  return_refund: { label: 'Return/Refund', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-600' }
}

/* Status helpers */
function lastStatusFromLog(o) {
  const log = o?.statusLog || []
  if (!log.length) return null
  return log[log.length - 1]?.status || null
}
function statusOf(o) {
  return o?.status || lastStatusFromLog(o) || 'to_pay'
}

/* Counts */
const tabCounts = computed(() => {
  const c = { all: orders.value.length, to_pay: 0, to_ship: 0, to_receive: 0, completed: 0, cancelled: 0, return_refund: 0 }
  for (const o of orders.value) {
    const s = statusOf(o)
    if (c[s] !== undefined) c[s]++
  }
  return c
})

/* Search and filter */
const visibleOrders = computed(() => {
  const q = queryStr.value.trim().toLowerCase()
  const base = active.value === 'all'
    ? orders.value
    : orders.value.filter(o => statusOf(o) === active.value)
  const filtered = q
    ? base.filter(o => {
      const hay = [o.orderId, o.products?.[0]?.shopName, ...(o.products || []).map(p => p.item_name)].join(' ').toLowerCase()
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
  const sum = (o.products || []).reduce(
    (acc, p) => acc + (p.totalPrice ?? (p.price * (p.quantity ?? 1))),
    0
  )
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
    unsub = onSnapshot(
      q,
      (snap) => {
        orders.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        loading.value = false
      },
      (err) => { console.error('orders onSnapshot error:', err); loading.value = false }
    )
  })
  onBeforeUnmount(() => { stop(); unsub?.() })
})

/* Utils */
function formatDate(ts) {
  if (!ts) return '—'
  if (ts.toDate) {
    return ts.toDate().toLocaleString('en-SG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }
  try { return new Date(ts).toLocaleString('en-SG') } catch { return '—' }
}

/* Actions (no alerts) */
function payNow(o) { /* integrate your gateway */ }
function changePayment(o) { /* open change payment UI */ }

function openCancelConfirm(o) {
  orderToCancel.value = o
  showCancelConfirm.value = true
}
async function confirmCancel() {
  if (!orderToCancel.value) return
  const o = orderToCancel.value
  showCancelConfirm.value = false
  await updateDoc(doc(db, 'orders', o.id), {
    status: 'cancelled',
    statusLog: arrayUnion({ status: 'cancelled', by: 'buyer', time: Timestamp.now() })
  })
  orderToCancel.value = null
}

function markReceived(o) {
  updateDoc(doc(db, 'orders', o.id), {
    status: 'completed',
    statusLog: arrayUnion({ status: 'completed', by: 'buyer', time: Timestamp.now() })
  })
}
function rateOrder(o) { /* open rating UI */ }

function openReturnModal(o) {
  orderForReturn.value = o
  showReturnModal.value = true
}
function handleReturnSubmitted() {
  // Close the modal and show banner message (no alert)
  showReturnModal.value = false
  orderForReturn.value = null
  banner.value = { show: true, msg: 'Return/Refund request submitted successfully.' }
  setTimeout(() => { banner.value.show = false }, 3500)
}

function viewCancelledDetails(o) { selectedCancelled.value = o }
function viewOrderDetails(o)      { selectedOrder.value = o }
function viewReturnDetails(o) {
  orderForReturnDetails.value = o
  showReturnDetails.value = true
}

/* Relay from ReturnRequestDetails -> OrderDetails */
function openOrderFromRefund(o) {
  showReturnDetails.value = false
  orderForReturnDetails.value = null
  selectedOrder.value = o
}
</script>

<style scoped>
article:hover {
  transform: translateY(-1px);
  transition: box-shadow .2s, transform .2s;
}
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb {
  background-color: rgba(100,116,139,0.3);
  border-radius: 8px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100,116,139,0.5);
}
</style>
