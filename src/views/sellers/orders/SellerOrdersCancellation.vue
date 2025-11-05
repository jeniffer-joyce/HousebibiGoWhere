<template>
  <section class="space-y-4">
    <!-- Header -->
    <header class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">All Orders</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Manage your incoming and pending orders.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Search -->
        <div class="relative">
          <input
            v-model="searchStr"
            type="text"
            class="w-72 rounded-md border border-slate-300 px-3 py-2 text-sm
                   bg-white text-slate-800 placeholder:text-slate-400
                   dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
            placeholder="Search order, buyer, product…"
          />
          <svg class="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
          </svg>
        </div>

        <!-- Sort -->
        <select
          v-model="sortMode"
          class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm
                 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          title="Sort orders"
        >
          <option value="created_desc">Created (Newest)</option>
          <option value="created_asc">Created (Oldest)</option>
          <option value="total_desc">Total (Highest)</option>
          <option value="total_asc">Total (Lowest)</option>
        </select>
      </div>
    </header>

    <!-- Table -->
    <div class="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <!-- Header row -->
      <div
        class="grid grid-cols-12 gap-3 border-b px-4 py-3 text-sm font-semibold
               text-slate-700 dark:text-slate-200
               bg-slate-50 dark:bg-slate-800/60
               border-slate-200 dark:border-slate-700
               rounded-t-2xl">
        <div class="col-span-5">Product(s)</div>
        <div class="col-span-1">Total</div>
        <div class="col-span-2">Status</div>
        <div class="col-span-2">Created</div>
        <div class="col-span-2">Actions</div>
      </div>

      <!-- Empty / Loading -->
      <div v-if="!ready" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading orders…</div>
      <div v-else-if="sortedRows.length===0" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No orders here yet</div>

      <!-- Rows -->
      <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
        <div v-for="o in paged" :key="o.id"
          class="grid grid-cols-12 gap-3 px-4 py-4"
        >
          <!-- Product(s) -->
          <div class="col-span-5">
            <div class="flex gap-3">
              <img :src="thumbnail(o)" alt="" class="h-12 w-12 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
              <div class="min-w-0">
                <div class="font-medium whitespace-normal break-words leading-tight text-slate-900 dark:text-white">
                  {{ titleLine(o) }}
                  <span class="ml-2 inline-flex items-center whitespace-nowrap rounded-full
                               bg-blue-50 text-blue-700
                               dark:bg-blue-950/40 dark:text-blue-300
                               px-2 py-0.5 text-xs font-medium">
                    No. of products: {{ (o.products || []).length }}
                  </span>
                </div>

                <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Order #{{ o.orderId || o.id }} • Buyer: {{ o.buyer?.name || o.shippingAddress?.fullName || '—' }}
                </div>

                <!-- View items -->
                <button class="mt-1 text-xs text-blue-700 dark:text-blue-300 hover:underline" @click="toggleExpand(o.id)">
                  {{ expanded[o.id] ? 'Hide items' : `View items (${(o.products||[]).length})` }}
                </button>

                <!-- Expanded items table -->
                <div
                  v-if="expanded[o.id]"
                  class="mt-2 w-[640px] max-w-full rounded-lg
                         border border-slate-200 bg-slate-50
                         dark:border-slate-700 dark:bg-slate-800/40
                         p-2"
                >
                  <table class="w-full table-fixed text-xs">
                    <colgroup>
                      <col class="w-[55%]" /><col class="w-[20%]" /><col class="w-[10%]" /><col class="w-[15%]" />
                    </colgroup>
                    <thead>
                      <tr class="text-slate-500 dark:text-slate-400">
                        <th class="text-left font-medium py-1">Item</th>
                        <th class="text-left font-medium py-1">Variant</th>
                        <th class="text-right font-medium py-1">Qty</th>
                        <th class="text-right font-medium py-1">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(p, i) in (o.products||[])" :key="i">
                        <td class="py-1 whitespace-normal break-words text-slate-800 dark:text-slate-200">{{ p.item_name || p.name }}</td>
                        <td class="py-1 whitespace-nowrap text-slate-700 dark:text-slate-300">{{ p.size || p.variant || '-' }}</td>
                        <td class="py-1 text-right text-slate-700 dark:text-slate-300">{{ p.quantity ?? p.qty ?? 1 }}</td>
                        <td class="py-1 text-right whitespace-nowrap tabular-nums text-slate-900 dark:text-white">{{ money(p.price || 0) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Total -->
          <div class="col-span-1 text-sm font-semibold text-slate-900 dark:text-white">
            {{ money(orderGrand(o)) }}
          </div>

          <!-- Status -->
          <div class="col-span-2 self-start">
            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="statusPill(o.status).cls"
            >
              <span class="h-2 w-2 rounded-full" :class="statusPill(o.status).dot"></span>
              {{ statusPill(o.status).label }}
            </span>
          </div>

          <!-- Created -->
          <div class="col-span-2 self-start">
            <span class="inline-block rounded-full px-2 py-1 text-xs font-semibold leading-tight
                         bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {{ fmt(o.createdAt) }}
            </span>
          </div>

          <!-- Actions -->
          <div class="col-span-2 self-start">
            <div class="flex flex-col items-start gap-2">
              <button
                class="w-full rounded-md border px-3 py-1.5 text-sm transition
                       border-slate-300 text-slate-700 hover:bg-slate-50
                       dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                @click="viewOrder(o)"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Pagination -->
    <div
      v-if="ready && sortedRows.length > 0"
      class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400"
    >
      <p>
        Showing {{ page }} of {{ totalPages || 1 }} – 
        <span class="font-medium">{{ pageEnd }}</span> of
        <span class="font-medium">{{ sortedRows.length }}</span> results
      </p>
      <div class="flex gap-2">
        <button
          :disabled="page === 1"
          @click="page--; scrollToTop()"
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700
                 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          Previous
        </button>
        <button
          :disabled="page === totalPages || totalPages === 0"
          @click="page++; scrollToTop()"
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700
                 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          Next
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useSellerOrders } from '@/composables/useSellerOrders'

const { orders, ready } = useSellerOrders()

/* ---------------- state ---------------- */
const searchStr = ref('')
const sortMode = ref('created_desc')
const expanded = reactive({})

const pageSize = 10
const page = ref(1)
const totalPages = computed(() => Math.ceil(sortedRows.value.length / pageSize))
const paged = computed(() => sortedRows.value.slice((page.value-1)*pageSize, page.value*pageSize))
const pageStart = computed(() => sortedRows.value.length ? (page.value-1)*pageSize+1 : 0)
const pageEnd = computed(() => Math.min(page.value*pageSize, sortedRows.value.length))

watch([searchStr, sortMode], () => {
  page.value = 1
})

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Use 'auto' for instant scroll, 'smooth' for animated
  })
}

/* ---------------- helpers ---------------- */
const money = n => 'S$' + (Math.round((n||0)*100)/100).toFixed(2)
const orderGrand = (o) =>
  o?.totals?.grandTotal ?? (o.products||[]).reduce((a,p)=>a + (p.totalPrice ?? p.price*(p.quantity??1)),0)
const titleLine = o => (o.products?.[0]?.item_name || o.products?.[0]?.name || '—')
const thumbnail = o => o.products?.[0]?.img_url || o.products?.[0]?.image || 'https://via.placeholder.com/48x48?text=%20'

const fmt = (d) => {
  if (!d) return '—'
  try { 
    const date = d?.toDate ? d.toDate() : new Date(d)
    return date.toLocaleString('en-SG',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) 
  } catch { return '—' }
}

function toggleExpand(id){ expanded[id] = !expanded[id] }

/* Status pill styling */
function statusPill(status) {
  const s = String(status || '').toLowerCase()
  
  if (s === 'pending' || s === 'to_pay') return {
    label: 'Pending Payment',
    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-600'
  }
  if (s === 'to_ship') return {
    label: 'To Ship',
    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    dot: 'bg-blue-600'
  }
  if (s === 'to_receive' || s === 'shipping') return {
    label: 'Shipping',
    cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    dot: 'bg-sky-600'
  }
  if (s === 'completed') return {
    label: 'Completed',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    dot: 'bg-emerald-600'
  }
  if (s === 'cancelled') return {
    label: 'Cancelled',
    cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    dot: 'bg-rose-600'
  }
  if (s === 'return_refund') return {
    label: 'Return/Refund',
    cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    dot: 'bg-purple-600'
  }
  
  return {
    label: status || 'Unknown',
    cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-600'
  }
}

/* ---------------- search + sort ---------------- */
const filteredRows = computed(() => {
  const q = searchStr.value.trim().toLowerCase()
  if (!q) return orders.value
  return orders.value.filter(o => {
    const hay = [
      o.orderId || o.id,
      o.buyer?.name || o.shippingAddress?.fullName,
      ...(o.products || []).map(p => p.item_name || p.name),
    ].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

const sortedRows = computed(() => {
  const rows = [...filteredRows.value]
  const mode = sortMode.value
  
  if (mode === 'created_desc') {
    rows.sort((a,b) => {
      const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : +new Date(a.createdAt || 0)
      const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : +new Date(b.createdAt || 0)
      return tb - ta
    })
  } else if (mode === 'created_asc') {
    rows.sort((a,b) => {
      const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : +new Date(a.createdAt || 0)
      const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : +new Date(b.createdAt || 0)
      return ta - tb
    })
  } else if (mode === 'total_desc') {
    rows.sort((a,b) => orderGrand(b) - orderGrand(a))
  } else if (mode === 'total_asc') {
    rows.sort((a,b) => orderGrand(a) - orderGrand(b))
  }
  
  return rows
})

/* ---------------- actions ---------------- */
function viewOrder(o) {
  // Navigate to order details page
  console.log('View order:', o.id)
}
</script>