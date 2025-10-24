<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <BuyerSideBar :collapsed="isSidebarCollapsed" />

    <main class="flex-1 p-6 sm:p-8 transition-all duration-300 ml-64">
      <div class="mx-auto w-full max-w-6xl space-y-8">

        <!-- ===== Header ===== -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">My Orders</h1>
            <p class="text-slate-500 dark:text-slate-400">Track, manage and review your purchases</p>
          </div>
          <input
            v-model="queryStr"
            type="text"
            placeholder="Search by product, order #, or shop"
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <!-- ===== Tabs ===== -->
        <div class="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div v-for="t in tabs" :key="t.key"
            @click="active = t.key"
            class="relative flex-1 cursor-pointer select-none rounded-lg px-4 py-2 text-center text-sm font-medium transition-all"
            :class="[
              active === t.key
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
            ]">
            {{ t.label }}
            <span v-if="tabCounts[t.key] > 0"
                  class="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-blue-600 dark:bg-blue-700 dark:text-white">
              {{ tabCounts[t.key] }}
            </span>
          </div>
        </div>

        <!-- ===== Orders ===== -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <span class="text-slate-500 dark:text-slate-300">Loading orders...</span>
        </div>

        <div v-else-if="!visibleOrders.length" class="flex items-center justify-center py-20">
          <span class="text-slate-500 dark:text-slate-300">You don’t have any orders here yet.</span>
        </div>

        <div v-else class="space-y-6">
          <article v-for="o in visibleOrders" :key="o.id"
            class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            
            <!-- Header -->
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
              <div class="flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <span class="font-medium">Order #{{ o.orderId }}</span>
                <span>•</span>
                <span>Shop: <span class="font-semibold">{{ o.products?.[0]?.shopName }}</span></span>
                <RouterLink
                  :to="`/${(o.products?.[0]?.sellerUsername || 'shop').toLowerCase()}/?id=${o.products?.[0]?.sellerId || ''}`"
                  class="ml-2 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
                  Visit Shop
                </RouterLink>
              </div>

              <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="statusMap[statusOf(o)]?.cls">
                  <span class="h-2 w-2 rounded-full" :class="statusMap[statusOf(o)]?.dot"></span>
                  {{ statusMap[statusOf(o)]?.label }}
                </span>
                <span>Placed: {{ formatDate(o.createdAt) }}</span>
              </div>
            </div>

            <!-- Items -->
            <div class="divide-y divide-slate-100 dark:divide-slate-700">
              <div v-for="(p, i) in o.products" :key="i"
                   class="flex items-center justify-between gap-4 p-4">
                <div class="flex items-center gap-3">
                  <img :src="p.img_url" class="h-14 w-14 rounded-md object-cover" />
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">{{ p.item_name }}</p>
                    <p class="text-sm text-slate-500">Qty: {{ p.quantity }} <span v-if="p.size">• Size: {{ p.size }}</span></p>
                  </div>
                </div>
                <p class="font-semibold text-slate-900 dark:text-white">S${{ (p.totalPrice ?? (p.price * p.quantity)).toFixed(2) }}</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 dark:border-slate-700">
              <div class="text-slate-500 dark:text-slate-400">
                <p class="text-sm">Order Total</p>
                <p class="text-xl font-bold text-slate-900 dark:text-white">S${{ orderGrand(o).toFixed(2) }}</p>
              </div>

              <div class="flex flex-wrap items-center justify-end gap-2">
                <!-- Buttons based on status -->
                <template v-if="statusOf(o) === 'to_pay'">
                  <button @click="payNow(o)" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Pay Now</button>
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
                  <button @click="requestReturn(o)" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Request Return/Refund</button>
                </template>

                <template v-else-if="statusOf(o) === 'cancelled'">
                  <button @click="viewCancelledDetails(o)" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Cancelled Details</button>
                </template>

                <RouterLink
                  class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  :to="`/${(o.products?.[0]?.sellerUsername || 'shop').toLowerCase()}/?id=${o.products?.[0]?.sellerId || ''}`">
                  Contact Seller
                </RouterLink>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  </div>

  <!-- Cancel confirmation popup -->
  <div v-if="showCancelConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Cancel Order</h2>
      <p class="text-slate-600 dark:text-slate-300 mb-6">Are you sure you want to cancel this order?</p>
      <div class="flex justify-end gap-3">
        <button @click="showCancelConfirm = false" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200">No</button>
        <button @click="confirmCancel" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Yes, Cancel</button>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <CancelledDetailsModal
    v-if="selectedCancelled"
    :visible="!!selectedCancelled"
    :order="selectedCancelled"
    @closeAll="closeAllModals"
    @showOrder="() => { selectedOrder = selectedCancelled; selectedCancelled = null }"
  />

  <OrderDetailsModal
    v-if="selectedOrder"
    :visible="!!selectedOrder"
    :order="selectedOrder"
    @closeAll="closeAllModals"
    @showRefund="() => { selectedCancelled = selectedOrder; selectedOrder = null }"
  />
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
import { useToast } from '@/composables/useToast'
const { success, error:toastError, info } = useToast()

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
const selectedOrder = ref(null)

/* orders */
const orders = ref([])

/* tabs */
const tabs = [
  { key: 'all', label: 'All' },
  { key: 'to_pay', label: 'To Pay' },
  { key: 'to_ship', label: 'To Ship' },
  { key: 'to_receive', label: 'To Receive' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'return_refund', label: 'Return/Refund' }
]

/* status chips */
const statusMap = {
  to_pay: { label: 'To Pay', cls: 'bg-blue-50 text-blue-700', dot: 'bg-blue-600' },
  to_ship: { label: 'To Ship', cls: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-600' },
  to_receive: { label: 'To Receive', cls: 'bg-sky-50 text-sky-700', dot: 'bg-sky-600' },
  completed: { label: 'Delivered', cls: 'bg-green-50 text-green-700', dot: 'bg-green-600' },
  cancelled: { label: 'Cancelled', cls: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' },
  return_refund: { label: 'Return/Refund', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-600' }
}

/* helpers */
function lastStatusFromLog(o) {
  const log = o?.statusLog || []
  return log.length ? log[log.length - 1].status : null
}
function statusOf(o) {
  return o?.status || lastStatusFromLog(o) || 'to_pay'
}

/* counts */
const tabCounts = computed(() => {
  const c = { all: orders.value.length, to_pay: 0, to_ship: 0, to_receive: 0, completed: 0, cancelled: 0, return_refund: 0 }
  for (const o of orders.value) {
    const s = statusOf(o)
    if (c[s] !== undefined) c[s]++
  }
  return c
})

/* visible orders */
const visibleOrders = computed(() => {
  const q = queryStr.value.trim().toLowerCase()
  const base = active.value === 'all' ? orders.value : orders.value.filter(o => statusOf(o) === active.value)
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

/* totals helper */
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
    const q = fsQuery(collection(db, 'orders'), where('uid', '==', u.uid), orderBy('createdAt', 'desc'))
    unsub?.()
    unsub = onSnapshot(q, (snap) => {
      orders.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    }, () => { loading.value = false })
  })
  onBeforeUnmount(() => { stop(); unsub?.() })
})

/* format date */
function formatDate(ts) {
  if (!ts) return '—'
  if (ts.toDate) return ts.toDate().toLocaleString('en-SG', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
  try { return new Date(ts).toLocaleString('en-SG') } catch { return '—' }
}

/* Actions */
function payNow(o){ info(`Pay for order ${o.orderId}`) }
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
function rateOrder(o){ info(`Rate order ${o.orderId}`) }
function requestReturn(o){
  updateDoc(doc(db, 'orders', o.id), {
    status:'return_refund',
    statusLog: arrayUnion({ status:'return_refund', by:'buyer', time: Timestamp.now() })
  })
}
function viewCancelledDetails(o){ selectedCancelled.value = o }
function viewOrderDetails(o){ selectedOrder.value = o }
function closeAllModals(){
  selectedCancelled.value = null
  selectedOrder.value = null
  showCancelConfirm.value = false
}
</script>

<style scoped>
article:hover { transform: translateY(-1px); transition: box-shadow .2s, transform .2s; }
</style>
