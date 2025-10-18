<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <!-- Left sidebar (unchanged) -->
    <BuyerSideBar @sidebar-toggle="handleSidebarToggle" />

    <!-- Page -->
    <main
      class="flex-1 transition-all duration-300"
      :class="isSidebarCollapsed ? 'ml-20' : 'ml-64'"
    >
      <div class="mx-auto w-full max-w-7xl px-6 sm:px-8 py-8 space-y-6">
        <!-- Header row -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">My Orders</h1>

          <!-- Search -->
          <div class="w-full sm:w-[420px]">
            <div
              class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5
                     dark:border-slate-700 dark:bg-slate-800"
            >
              <svg class="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
              </svg>
              <input
                v-model.trim="q"
                type="text"
                placeholder="Search product, order # or shop"
                class="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none
                       dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <div class="grid grid-cols-7 gap-2">
            <button
              v-for="t in tabDefs"
              :key="t.key"
              @click="activeFilter = t.key"
              class="relative w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors"
              :class="
                activeFilter === t.key
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              "
            >
              <span>{{ t.label }}</span>
              <span
                v-if="t.count > 0 && t.key !== 'all'"
                class="ml-2 inline-flex items-center justify-center rounded-full bg-primary/15 px-2 text-xs font-semibold text-primary"
              >
                {{ t.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="filteredOrders.length === 0"
          class="rounded-2xl border border-slate-200 bg-white p-16 text-center dark:border-slate-700 dark:bg-slate-800"
        >
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <svg viewBox="0 0 24 24" class="h-7 w-7 text-primary">
              <path
                fill="currentColor"
                d="M10 2H6a2 2 0 0 0-2 2v2h6V2m10 8V6a2 2 0 0 0-2-2h-4v4h6m0 2H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2Z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">No orders yet</h3>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            You don’t have any orders in “{{ tabLabel(activeFilter) }}”.
          </p>
          <RouterLink
            to="/categories/"
            class="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Browse products
          </RouterLink>
        </div>

        <!-- Orders list -->
        <div v-else class="space-y-5">
          <article
            v-for="o in filteredOrders"
            :key="o.id"
            class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <!-- Header -->
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-3">
                <span
                  class="inline-flex items-center rounded bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-900 dark:text-sky-200"
                >
                  Store
                </span>
                <h3 class="text-sm font-semibold text-slate-900 dark:text-white">
                  {{ o.storeName }}
                </h3>

                <!-- View Shop -->
                <RouterLink
                  :to="o.shopUrl || '#'"
                  class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 12l2-2 7-7 7 7 2 2M5 10v10a1 1 0 0 0 1 1h3m10-11v10a1 1 0 0 1-1 1h-3m-6 0h6"/>
                  </svg>
                  View Shop
                </RouterLink>

                <!-- Order number -->
                <span class="text-xs text-slate-500 dark:text-slate-400">
                  • Order #:
                  <span class="font-medium text-slate-700 dark:text-slate-200">{{ o.orderNumber }}</span>
                </span>
              </div>

              <!-- Status chip (top-right) -->
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold uppercase"
                :class="statusChipClass(o.status)"
              >
                {{ tabLabel(o.status) }}
              </span>
            </div>

            <!-- Body -->
            <div class="mt-5 grid grid-cols-[110px_1fr_auto] gap-5">
              <!-- Image -->
              <img :src="o.image" :alt="o.title" class="h-28 w-28 rounded-lg object-cover" />

              <!-- Info -->
              <div class="min-w-0">
                <RouterLink
                  :to="o.productUrl || '#'"
                  class="line-clamp-2 text-sm font-semibold text-slate-900 hover:underline dark:text-white"
                >
                  {{ o.title }}
                </RouterLink>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Qty: {{ o.quantity }} • Placed: {{ o.date }}
                </p>
                <p v-if="o.status === 'to_receive'" class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Your parcel has been shipped. Confirm after you’ve received and checked the items.
                </p>
                <p v-else-if="o.status === 'completed'" class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Delivered • Thanks for shopping with {{ o.storeName }}!
                </p>
              </div>

              <!-- Totals + actions -->
              <div class="flex flex-col items-end justify-between">
                <div class="text-right">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Order Total</p>
                  <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ o.total }}</p>
                </div>

                <!-- Actions (status-based) -->
                <div class="flex flex-wrap items-center gap-2">
                  <!-- To Receive: confirm + refund -->
                  <template v-if="o.status === 'to_receive'">
                    <button
                      type="button"
                      class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                    >
                      Order Received
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Request Refund
                    </button>
                  </template>

                  <!-- Completed: return/refund -->
                  <template v-else-if="o.status === 'completed'">
                    <button
                      type="button"
                      class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Request Return/Refund
                    </button>
                  </template>

                  <!-- To Ship / To Pay: cancel -->
                  <template v-else-if="o.status === 'to_ship' || o.status === 'to_pay'">
                    <button
                      type="button"
                      class="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/20"
                    >
                      Cancel Order
                    </button>
                  </template>

                  <!-- Cancelled: show 'View Refund Details' -->
                  <template v-else-if="o.status === 'cancelled'">
                    <button
                      type="button"
                      class="rounded-lg border border-violet-300 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/20"
                    >
                      View Refund Details
                    </button>
                  </template>

                  <!-- Contact seller always -->
                  <button
                    type="button"
                    class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Contact Seller
                  </button>
                </div>
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
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue'

/* sidebar */
const isSidebarCollapsed = ref(false)
function handleSidebarToggle(v) { isSidebarCollapsed.value = v }

/* search */
const q = ref('')

/* tabs */
const activeFilter = ref('all')

/* dummy orders */
const orders = ref([])
onMounted(() => {
  // Prefer a numeric placedAt (ms) for real data; `date` kept for display.
  orders.value = [
    {
      id: 'o-1001',
      orderNumber: 'ORD-1001',
      storeName: 'Grafen Korea Official Store',
      shopUrl: '/store/grafen-korea',
      productUrl: '/product/abc123',
      title: '[GRAFEN] Root Booster Shampoo 500ml | Anti-Hair Loss Shampoo',
      image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b2f3f?q=80&w=600&auto=format&fit=crop',
      quantity: 1,
      date: '18 Oct 2025',
      placedAt: new Date('2025-10-18').getTime(),
      status: 'to_receive',
      total: '$18.03'
    },
    {
      id: 'o-1002',
      orderNumber: 'ORD-1002',
      storeName: 'LYDIMOON SG Store',
      shopUrl: '/store/lydimoon',
      productUrl: '/product/xyz789',
      title: '[LYDIMOON] Niacinamide Body Wash: Whitening & Exfoliating',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop',
      quantity: 2,
      date: '15 Oct 2025',
      placedAt: new Date('2025-10-15').getTime(),
      status: 'to_ship',
      total: '$24.00'
    },
    {
      id: 'o-1003',
      orderNumber: 'ORD-1003',
      storeName: 'Cozy Kitchen',
      shopUrl: '/store/cozy-kitchen',
      productUrl: '/product/meal42',
      title: 'Delicious Homemade Meals • Family Bundle',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
      quantity: 1,
      date: '08 Oct 2025',
      placedAt: new Date('2025-10-08').getTime(),
      status: 'completed',
      total: '$45.00'
    },
    {
      id: 'o-1004',
      orderNumber: 'ORD-1004',
      storeName: 'Crafty Corner',
      shopUrl: '/store/crafty-corner',
      productUrl: '/product/craft55',
      title: 'Unique Handmade Crafts • Gift Set',
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600&auto=format&fit=crop',
      quantity: 1,
      date: '02 Oct 2025',
      placedAt: new Date('2025-10-02').getTime(),
      status: 'cancelled',
      total: '$34.50'
    },
    {
      id: 'o-1005',
      orderNumber: 'ORD-1005',
      storeName: 'Pay Later Mart',
      shopUrl: '/store/pay-later-mart',
      productUrl: '/product/pay001',
      title: 'Premium Tea Sampler Box',
      image: 'https://images.unsplash.com/photo-1529881131844-8037e6daf7ec?q=80&w=600&auto=format&fit=crop',
      quantity: 1,
      date: '01 Oct 2025',
      placedAt: new Date('2025-10-01').getTime(),
      status: 'to_pay',
      total: '$19.90'
    }
  ]
})

/* utilities */
function safePlacedAt(o) {
  if (typeof o.placedAt === 'number') return o.placedAt
  // Fallback: try to parse `date` string
  const dt = new Date(o.date || '').getTime()
  return Number.isFinite(dt) ? dt : 0
}

/* list & sort by purchase date (desc) */
const orderListSorted = computed(() =>
  (Array.isArray(orders.value) ? orders.value : [])
    .slice()
    .sort((a, b) => safePlacedAt(b) - safePlacedAt(a))
)

/* tabs + counts */
const tabDefs = computed(() =>
  [
    { key: 'all', label: 'All' },
    { key: 'to_pay', label: 'To Pay' },
    { key: 'to_ship', label: 'To Ship' },
    { key: 'to_receive', label: 'To Receive' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'return', label: 'Return Refund' }
  ].map(t => ({
    ...t,
    count: t.key === 'all'
      ? orderListSorted.value.length
      : orderListSorted.value.filter(o => o.status === t.key).length
  }))
)

/* filter + search (on sorted list) */
const filteredOrders = computed(() => {
  let arr = activeFilter.value === 'all'
    ? orderListSorted.value
    : orderListSorted.value.filter(o => o.status === activeFilter.value)

  const term = q.value.toLowerCase()
  if (term) {
    arr = arr.filter(o =>
      (o.title || '').toLowerCase().includes(term) ||
      (o.orderNumber || '').toLowerCase().includes(term) ||
      (o.storeName || '').toLowerCase().includes(term)
    )
  }
  return arr
})

/* helpers */
function tabLabel(key) {
  const map = {
    to_pay: 'To Pay', to_ship: 'To Ship', to_receive: 'To Receive',
    completed: 'Completed', cancelled: 'Cancelled', return: 'Return Refund', all: 'All'
  }
  return map[key] || 'All'
}
function statusChipClass(statusKey) {
  const map = {
    to_pay: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    to_ship: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    to_receive: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    return: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200'
  }
  return map[statusKey] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
}
</script>
