<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <!-- Sidebar -->
    <BuyerSideBar :collapsed="isSidebarCollapsed" @toggle="handleSidebarToggle" />

    <!-- Main -->
    <main class="flex-1 ml-64 p-6 sm:p-8">
      <div class="mx-auto w-full max-w-6xl space-y-8">
        <!-- Header row -->
        <div class="flex items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white">My Orders</h1>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track, manage and review your purchases
            </p>
          </div>

          <!-- Search -->
          <div class="w-full max-w-md">
            <div
              class="relative rounded-lg border border-slate-200 bg-white px-3 py-2 pl-9 text-slate-900 shadow-sm
                     focus-within:ring-2 focus-within:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                   xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"/>
              </svg>
              <input
                v-model.trim="query"
                type="text"
                class="w-full bg-transparent outline-none"
                placeholder="Search by product, order #, or shop" />
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <nav
          class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-2 shadow-sm
                 dark:border-slate-700 dark:bg-slate-800">
          <button
            v-for="t in tabs"
            :key="t.key"
            @click="active = t.key"
            class="relative inline-flex items-center gap-2 rounded-lg px-5 py-2 font-medium transition
                   hover:bg-blue-50 dark:hover:bg-slate-700"
            :class="active === t.key ? 'bg-blue-500 text-white' : 'text-slate-700 dark:text-slate-200'"
          >
            {{ t.label }}
            <span
              v-if="tabCounts[t.key] > 0"
              class="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full text-xs font-semibold"
              :class="active === t.key ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'">
              {{ tabCounts[t.key] }}
            </span>
          </button>
        </nav>

        <!-- Empty / Loading states -->
        <div
          v-if="loading"
          class="rounded-xl border border-slate-200 bg-white p-14 text-center shadow-sm
                 dark:border-slate-700 dark:bg-slate-800">
          <div class="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p class="mt-4 text-slate-500 dark:text-slate-400">Loading your orders…</p>
        </div>

        <div
          v-else-if="visibleOrders.length === 0"
          class="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm
                 dark:border-slate-700 dark:bg-slate-800">
          <div class="mx-auto mb-3 h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/40"></div>
          <p class="text-lg font-semibold text-slate-900 dark:text-white">No orders yet</p>
          <p class="mt-1 text-slate-500 dark:text-slate-400">
            You don’t have any orders in “{{ tabs.find(t => t.key === active)?.label || 'All' }}”.
          </p>
          <RouterLink
            to="/products"
            class="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
            Browse products
          </RouterLink>
        </div>

        <!-- Orders list -->
        <div v-else class="space-y-6">
          <article
            v-for="o in visibleOrders"
            :key="o.orderId"
            class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition
                   dark:border-slate-700 dark:bg-slate-800"
          >
            <!-- Top row: order # • shop • visit • placed • status chip -->
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-2 text-sm">
                <span class="text-slate-500 dark:text-slate-400">Order #:</span>
                <span class="font-medium text-slate-900 dark:text-white">{{ o.orderId }}</span>
                <span class="mx-2 text-slate-300">•</span>
                <span class="text-slate-500 dark:text-slate-400">Shop:</span>
                <RouterLink
                  class="font-semibold text-slate-900 dark:text-white hover:underline"
                  :to="`/${(o.products?.[0]?.sellerUsername || 'shop').toLowerCase()}/?id=${o.products?.[0]?.sellerId || ''}`">
                  {{ o.products?.[0]?.shopName || 'Shop' }}
                </RouterLink>
                <RouterLink
                  class="ml-2 rounded-lg border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-50
                         dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  :to="`/${(o.products?.[0]?.sellerUsername || 'shop').toLowerCase()}/?id=${o.products?.[0]?.sellerId || ''}`">
                  Visit shop
                </RouterLink>
              </div>

              <div class="flex items-center gap-3 text-sm">
                <span class="text-slate-500 dark:text-slate-400">Placed: {{ formatDate(o.createdAt) }}</span>
                <span
                  class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  :class="statusMap[o.status]?.cls">
                  <span class="h-2 w-2 rounded-full" :class="statusMap[o.status]?.dot"></span>
                  {{ statusMap[o.status]?.label || o.status }}
                </span>
              </div>
            </div>

            <!-- Items -->
            <div class="mt-4 space-y-3">
              <div
                v-for="(it, idx) in o.products"
                :key="idx"
                class="grid grid-cols-12 items-center gap-3 rounded-lg border border-slate-100 p-3
                       dark:border-slate-700/60">
                <div class="col-span-12 sm:col-span-10 flex items-center gap-3">
                  <img :src="it.img_url" alt="" class="h-14 w-14 rounded object-cover border border-slate-200 dark:border-slate-700" />
                  <div>
                    <p class="font-semibold text-slate-900 dark:text-white leading-tight">{{ it.item_name }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      Qty: {{ it.quantity }} <span v-if="it.size"> • Size: {{ it.size }}</span>
                    </p>
                  </div>
                </div>
                <div class="col-span-12 sm:col-span-2 text-right">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Item total</p>
                  <p class="font-semibold text-slate-900 dark:text-white">
                    S${{ (it.totalPrice ?? (it.price * it.quantity) ?? 0).toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Bottom row: total + actions -->
            <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-700/60">
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Order Total</p>
                <p class="text-xl font-bold text-slate-900 dark:text-white">
                  S${{ (o.totals?.grandTotal ?? o.totalPrice ?? sumItems(o.products)).toFixed(2) }}
                </p>
              </div>

              <div class="flex flex-wrap items-center justify-end gap-2">
                <!-- To Pay -->
                <template v-if="o.status === 'to_pay'">
                  <button @click="payNow(o)" class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Pay Now</button>
                  <button @click="changePayment(o)" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Change Payment</button>
                  <button @click="cancelOrder(o)" class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Cancel Order</button>
                </template>

                <!-- To Ship -->
                <template v-else-if="o.status === 'to_ship'">
                  <button @click="cancelOrder(o)" class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Cancel Order</button>
                </template>

                <!-- To Receive -->
                <template v-else-if="o.status === 'to_receive'">
                  <button @click="markReceived(o)" class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Order Received</button>
                </template>

                <!-- Completed -->
                <template v-else-if="o.status === 'completed'">
                  <button @click="rateOrder(o)" class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Order Received</button>
                  <button @click="requestReturn(o)" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Request Return/Refund</button>
                </template>

                <!-- Cancelled / ReturnRefund -->
                <template v-else-if="o.status === 'cancelled' || o.status === 'return_refund'">
                  <button @click="viewRefund(o)" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
                    View Refund Details
                  </button>
                </template>

                <!-- Contact Seller (rightmost) -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue'
import { auth, db } from '@/firebase/firebase_config'
import {
  collection, query as fsQuery, where, orderBy, getDocs
} from 'firebase/firestore'

/* Sidebar collapsed state */
const isSidebarCollapsed = ref(false)
function handleSidebarToggle(c) { isSidebarCollapsed.value = c }

/* Tabs */
const tabs = [
  { key: 'all',           label: 'All' },
  { key: 'to_pay',        label: 'To Pay' },
  { key: 'to_ship',       label: 'To Ship' },
  { key: 'to_receive',    label: 'To Receive' },
  { key: 'completed',     label: 'Completed' },
  { key: 'cancelled',     label: 'Cancelled' },
  { key: 'return_refund', label: 'Return/Refund' },
]

const active = ref('all')
const query = ref('')

/* Status chip map (distinct colors) */
const statusMap = {
  to_pay:        { label: 'To Pay',        cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',         dot: 'bg-blue-600' },
  to_ship:       { label: 'To Ship',       cls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200', dot: 'bg-indigo-600' },
  to_receive:    { label: 'To Receive',    cls: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200',             dot: 'bg-sky-600' },
  completed:     { label: 'Delivered',     cls: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200',     dot: 'bg-green-600' },
  cancelled:     { label: 'Cancelled',     cls: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',       dot: 'bg-slate-500' },
  return_refund: { label: 'Return/Refund', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',     dot: 'bg-amber-600' },
}

/* Data */
const orders = ref([])
const loading = ref(true)

/* Fetch orders for the current user */
async function loadOrders() {
  try {
    loading.value = true
    orders.value = []

    const u = auth.currentUser
    if (!u) {
      loading.value = false
      return
    }

    // requires composite index (uid ASC, createdAt DESC)
    const q = fsQuery(
      collection(db, 'orders'),
      where('uid', '==', u.uid),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)

    orders.value = snap.docs.map(d => {
      const data = d.data()
      return {
        orderId: data.orderId || d.id,
        status: data.status || lastStatus(data.statusLog) || 'to_pay',
        createdAt: toISO(data.createdAt),
        products: (data.products || []).map(p => ({
          img_url: p.img_url, item_name: p.item_name, price: p.price,
          quantity: p.quantity, size: p.size, totalPrice: p.totalPrice,
          shopName: p.shopName, sellerUsername: p.sellerUsername,
          sellerId: p.sellerId
        })),
        totals: data.totals,
        totalPrice: data.totals?.grandTotal ?? data.totalPrice
      }
    })
  } finally {
    loading.value = false
  }
}

function lastStatus(log = []) {
  if (!Array.isArray(log) || log.length === 0) return null
  const sorted = [...log].sort((a, b) => +new Date(a.time?.toDate?.() || a.time || 0) - +new Date(b.time?.toDate?.() || b.time || 0))
  return sorted[sorted.length - 1]?.status || null
}

function toISO(v) {
  if (!v) return ''
  if (typeof v?.toDate === 'function') return v.toDate().toISOString()
  return new Date(v).toISOString()
}

/* Counts */
const tabCounts = computed(() => {
  const c = { all: orders.value.length, to_pay: 0, to_ship: 0, to_receive: 0, completed: 0, cancelled: 0, return_refund: 0 }
  for (const o of orders.value) if (c[o.status] !== undefined) c[o.status]++
  return c
})

/* Visible (filter + search + sort) */
const visibleOrders = computed(() => {
  const q = query.value.trim().toLowerCase()
  const filtered = orders.value.filter(o => {
    const inTab = active.value === 'all' ? true : o.status === active.value
    if (!inTab) return false
    if (!q) return true
    const hay = [o.orderId, ...(o.products || []).map(i => [i.item_name, i.shopName]).flat()].join(' ').toLowerCase()
    return hay.includes(q)
  })
  return filtered.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
})

/* Utils */
function sumItems(items = []) {
  return items.reduce((acc, it) => acc + ((it.totalPrice != null) ? it.totalPrice : (Number(it.price || 0) * Number(it.quantity || 0))), 0)
}
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('en-SG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch { return iso }
}

/* Button handlers (UI only – wire to backend later if you want) */
function payNow(o)        { /* TODO integrate payment */ }
function changePayment(o) { /* TODO open payment method modal */ }
function cancelOrder(o)   { /* TODO write status -> 'cancelled' */ }
function markReceived(o)  { /* TODO write status -> 'completed' */ }
function rateOrder(o)     { /* TODO open rating modal */ }
function requestReturn(o) { /* TODO write status -> 'return_refund' */ }
function viewRefund(o)    { /* TODO open refund details */ }

onMounted(loadOrders)
</script>

<style scoped>
/* scrollbar cosmetics */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background-color: rgba(100,116,139,.3); border-radius: 8px; }
::-webkit-scrollbar-thumb:hover { background-color: rgba(100,116,139,.5); }
</style>
