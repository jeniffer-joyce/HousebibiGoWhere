<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <BuyerSideBar @sidebar-toggle="handleSidebarToggle" />

    <main
      class="flex-1 transition-all duration-300"
      :class="isSidebarCollapsed ? 'ml-20' : 'ml-64'"
    >
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            My Orders
          </h1>

          <!-- Search -->
          <div class="relative w-full sm:w-[380px]">
            <input
              v-model.trim="query"
              type="text"
              placeholder="Search orders, products, or shops…"
              class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pl-11 text-slate-800 placeholder-slate-500 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-400"
            />
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
              </svg>
            </span>
          </div>
        </div>

        <!-- Full-width, equally spaced tabs -->
        <div class="mb-6">
          <div class="flex w-full gap-2 rounded-xl bg-white p-2 shadow-sm dark:bg-slate-800">
            <button
              v-for="t in tabs"
              :key="t.key"
              @click="active = t.key"
              class="relative inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors flex-1 basis-0"
              :class="active === t.key
                ? 'bg-primary text-white'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'"
            >
              {{ t.label }}
              <span
                v-if="tabCounts[t.key] > 0"
                class="inline-flex items-center justify-center rounded-full bg-white/90 text-primary text-xs font-bold px-2 py-0.5"
              >
                {{ tabCounts[t.key] }}
              </span>
            </button>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-if="visibleOrders.length === 0"
          class="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700 bg-white dark:bg-slate-800"
        >
          <div class="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5 6m2 7l-2 7m0 0h12m-12 0a2 2 0 104 0m8 0a2 2 0 104 0" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">No orders here yet</h3>
          <p class="mt-1 text-slate-600 dark:text-slate-400">Explore our categories and place your first order.</p>
          <RouterLink
            to="/categories/"
            class="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary/90"
          >
            Browse Categories
          </RouterLink>
        </div>

        <!-- Orders -->
        <div v-else class="space-y-6">
          <div
            v-for="o in visibleOrders"
            :key="o.orderId"
            class="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-800"
          >
            <!-- Header -->
            <div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
              <div class="flex flex-wrap items-center gap-3">
                <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Order #</span>
                <span class="rounded-md bg-slate-100 px-2 py-1 text-sm font-mono text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                  {{ o.orderId }}
                </span>

                <span class="hidden sm:inline h-5 w-px bg-slate-200 dark:bg-slate-700"></span>

                <span class="text-sm text-slate-500 dark:text-slate-400">Placed on</span>
                <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ formatDate(o.purchaseDate) }}</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Status:</span>
                <span
                  class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs sm:text-sm font-semibold"
                  :class="statusMap[o.status].cls"
                  :title="statusMap[o.status].hint"
                >
                  <span class="h-2 w-2 rounded-full" :class="statusMap[o.status].dot"></span>
                  {{ statusMap[o.status].label }}
                </span>
              </div>
            </div>

            <!-- Shop -->
            <div class="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/60">
              <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <svg class="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 21v-8a2 2 0 012-2h2m12 10v-8a2 2 0 00-2-2h-2M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <span class="font-semibold">Shop:</span>
                <span class="font-medium">{{ o.shopName }}</span>
              </div>

              <RouterLink
                :to="`/seller-profile/?id=${o.items[0]?.businessId || ''}`"
                class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Visit Shop
              </RouterLink>
            </div>

            <!-- Items -->
            <div class="divide-y divide-slate-100 dark:divide-slate-700/60">
              <div
                v-for="(it, idx) in o.items"
                :key="idx"
                class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="flex min-w-0 items-center gap-4">
                  <img
                    :src="it.img_url"
                    :alt="it.item_name"
                    class="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {{ it.item_name }}
                    </p>
                    <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Qty: {{ it.quantity }}
                      <span v-if="it.size" class="mx-2">•</span>
                      <span v-if="it.size">Size: {{ it.size }}</span>
                    </p>
                    <p class="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                      ${{ it.price.toFixed(2) }}
                    </p>
                  </div>
                </div>
                <!-- (Removed per-item Contact Seller) -->
              </div>
            </div>

            <!-- Footer -->
            <div class="flex flex-col gap-4 border-top border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/60">
              <div class="text-right sm:text-left">
                <p class="text-sm text-slate-500 dark:text-slate-400">Total</p>
                <p class="text-xl font-bold text-slate-900 dark:text-white">
                  ${{ o.totalPrice.toFixed(2) }}
                </p>
              </div>

              <!-- Single actions row (Contact Seller lives here at the end) -->
              <div class="flex flex-wrap items-center justify-end gap-2">
                <!-- To Pay -->
                <template v-if="o.status === 'to_pay'">
                  <button class="btn-blue" @click="payNow(o)">Pay Now</button>
                  <button class="btn-blue-outline" @click="cancelOrder(o)">Cancel Order</button>
                </template>

                <!-- To Ship -->
                <template v-else-if="o.status === 'to_ship'">
                  <button class="btn-blue-outline" @click="cancelOrder(o)">Cancel Order</button>
                </template>

                <!-- To Receive -->
                <template v-else-if="o.status === 'to_receive'">
                  <button class="btn-blue" @click="markReceived(o)">Order Received</button>
                </template>

                <!-- Completed -->
                <template v-else-if="o.status === 'completed'">
                  <button class="btn-blue" @click="rateOrder(o)">Rate</button>
                  <button class="btn-slate" @click="requestReturn(o)">Request Return/Refund</button>
                </template>

                <!-- Cancelled -->
                <template v-else-if="o.status === 'cancelled'">
                  <button class="btn-slate" @click="viewRefund(o)">View Refund Details</button>
                </template>

                <!-- Return / Refund -->
                <template v-else-if="o.status === 'return_refund'">
                  <button class="btn-slate" @click="viewRefund(o)">View Refund Details</button>
                </template>

                <!-- Always show one Contact Seller at the very end -->
                <button class="btn-slate">Contact Seller</button>
              </div>
            </div>
          </div>
        </div>
        <!-- /Orders -->
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue'

/* Sidebar collapsed state */
const isSidebarCollapsed = ref(false)
function handleSidebarToggle(collapsed) {
  isSidebarCollapsed.value = collapsed
}

/* Demo orders (multi-item) */
const orders = ref([
  {
    orderId: 'ORD-20241001-001',
    uid: 'user_abc',
    purchaseDate: '2024-10-01T15:42:00+08:00',
    shopName: 'The Cozy Kitchen',
    status: 'to_pay',
    items: [
      { img_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', item_name: 'Delicious Homemade Meals (Family Set)', price: 18.0, quantity: 1, size: 'Family', businessId: 'biz_kitchen_01' },
      { img_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', item_name: 'Fresh Baked Croissants', price: 4.5, quantity: 2, size: null, businessId: 'biz_kitchen_01' }
    ],
    totalPrice: 27.0
  },
  {
    orderId: 'ORD-20240929-007',
    uid: 'user_abc',
    purchaseDate: '2024-09-29T13:05:00+08:00',
    shopName: 'Urban Threads',
    status: 'to_ship',
    items: [
      { img_url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=300&fit=crop', item_name: 'Denim Jacket', price: 59.9, quantity: 1, size: 'L', businessId: 'biz_urban_22' },
      { img_url: 'https://images.unsplash.com/photo-1520975930846-151f37f0b1b0?w=400&h=300&fit=crop', item_name: 'Basic Tee (2-Pack)', price: 22.0, quantity: 1, size: 'M', businessId: 'biz_urban_22' }
    ],
    totalPrice: 81.9
  },
  {
    orderId: 'ORD-20240928-002',
    uid: 'user_abc',
    purchaseDate: '2024-09-28T12:05:00+08:00',
    shopName: 'Fashion Finds',
    status: 'to_ship',
    items: [
      { img_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop', item_name: 'Handcrafted Linen Shirt', price: 39.9, quantity: 1, size: 'M', businessId: 'biz_fashion_88' }
    ],
    totalPrice: 39.9
  },
  {
    orderId: 'ORD-20240925-003',
    uid: 'user_abc',
    purchaseDate: '2024-09-25T10:22:00+08:00',
    shopName: 'Crafty Corner',
    status: 'to_receive',
    items: [
      { img_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=300&fit=crop', item_name: 'Macrame Wall Hanging', price: 22.0, quantity: 1, size: '45x45', businessId: 'biz_craft_12' },
      { img_url: 'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?w=400&h=300&fit=crop', item_name: 'Handmade Ceramic Mug', price: 14.0, quantity: 2, size: null, businessId: 'biz_craft_12' }
    ],
    totalPrice: 50.0
  },
  {
    orderId: 'ORD-20240920-004',
    uid: 'user_abc',
    purchaseDate: '2024-09-20T18:10:00+08:00',
    shopName: 'The Cozy Kitchen',
    status: 'completed',
    items: [
      { img_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', item_name: 'Chocolate Cake', price: 28.0, quantity: 1, size: null, businessId: 'biz_kitchen_01' }
    ],
    totalPrice: 28.0
  },
  {
    orderId: 'ORD-20240918-005',
    uid: 'user_abc',
    purchaseDate: '2024-09-18T09:30:00+08:00',
    shopName: 'Zen Home Spa',
    status: 'cancelled',
    items: [
      { img_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop', item_name: 'Aromatherapy Candle Set', price: 19.9, quantity: 1, size: null, businessId: 'biz_zen_07' }
    ],
    totalPrice: 19.9
  },
  {
    orderId: 'ORD-20240916-006',
    uid: 'user_abc',
    purchaseDate: '2024-09-16T14:45:00+08:00',
    shopName: 'Crafty Corner',
    status: 'return_refund',
    items: [
      { img_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=300&fit=crop', item_name: 'Knitted Throw Blanket', price: 36.0, quantity: 1, size: '130x170', businessId: 'biz_craft_12' }
    ],
    totalPrice: 36.0
  }
])

/* Tabs */
const tabs = [
  { key: 'all',           label: 'All' },
  { key: 'to_pay',        label: 'To Pay' },
  { key: 'to_ship',       label: 'To Ship' },
  { key: 'to_receive',    label: 'To Receive' },
  { key: 'completed',     label: 'Completed' },
  { key: 'cancelled',     label: 'Cancelled' },
  { key: 'return_refund', label: 'Return/Refund' }
]
const active = ref('all')
const query  = ref('')

/* Distinct status colors */
const statusMap = {
  to_pay:        { label: 'To Pay',        cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',       dot: 'bg-blue-600',   hint: 'Awaiting payment' },
  to_ship:       { label: 'To Ship',       cls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200', dot: 'bg-indigo-600', hint: 'Seller preparing shipment' },
  to_receive:    { label: 'To Receive',    cls: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200',           dot: 'bg-sky-600',    hint: 'On the way' },
  completed:     { label: 'Delivered',     cls: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200',   dot: 'bg-green-600',  hint: 'Order completed' },
  cancelled:     { label: 'Cancelled',     cls: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',     dot: 'bg-slate-500',  hint: 'Order cancelled' },
  return_refund: { label: 'Return/Refund', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',   dot: 'bg-amber-600',  hint: 'Return/refund in progress' }
}

/* Counts per tab */
const tabCounts = computed(() => {
  const c = { all: orders.value.length, to_pay: 0, to_ship: 0, to_receive: 0, completed: 0, cancelled: 0, return_refund: 0 }
  for (const o of orders.value) if (c[o.status] !== undefined) c[o.status]++
  return c
})

/* Visible orders (search/filter/sort) */
const visibleOrders = computed(() => {
  const q = query.value.toLowerCase()
  const filtered = orders.value.filter(o => {
    const inTab = active.value === 'all' ? true : o.status === active.value
    if (!inTab) return false
    if (!q) return true
    const hay = [o.orderId, o.shopName, ...o.items.map(i => i.item_name)].join(' ').toLowerCase()
    return hay.includes(q)
  })
  return filtered.sort((a, b) => +new Date(b.purchaseDate) - +new Date(a.purchaseDate))
})

/* Utils */
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('en-SG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch { return iso }
}

/* Demo/no-op handlers that mutate local state */
function payNow(o)       { o.status = 'to_ship' }
function cancelOrder(o)  { o.status = 'cancelled' }
function markReceived(o) { o.status = 'completed' }
function rateOrder(o)    { alert(`Rate order ${o.orderId}`) }
function requestReturn(o){ o.status = 'return_refund' }
function viewRefund(o)   { alert(`Refund details for ${o.orderId}`) }
</script>

<style scoped>
/* Hide horizontal scrollbar if present on small screens */
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Buttons */
.btn-blue {
  @apply inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700;
}
.btn-blue-outline {
  @apply inline-flex items-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20;
}
.btn-slate {
  @apply inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700;
}
</style>
