<template>
  <section class="space-y-4">
    <!-- Header -->
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Cancellations</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          View orders that were cancelled. See reason, initiator, refund status, and timestamps.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <!-- Search -->
        <div class="relative">
          <input
            v-model="searchStr"
            type="text"
            class="w-full sm:w-72 rounded-md border border-slate-300 px-3 py-2 text-sm
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
          <option value="cancelled_desc">Cancelled (Newest)</option>
          <option value="cancelled_asc">Cancelled (Oldest)</option>
          <option value="total_desc">Total (Highest)</option>
          <option value="total_asc">Total (Lowest)</option>
        </select>
      </div>
    </header>

    <!-- Desktop Table View -->
    <div class="hidden lg:block rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
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
        <div class="col-span-2">Cancelled</div>
        <div class="col-span-2">Actions</div>
      </div>

      <!-- Loading / Empty -->
      <div v-if="isLoading" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading orders…</div>
      <div v-else-if="sortedRows.length===0" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No cancellations</div>

      <!-- Rows -->
      <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
        <div v-for="o in paged" :key="o.id" class="grid grid-cols-12 gap-3 px-4 py-4">
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

                <!-- Reason / By -->
                <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Reason: <span class="font-medium text-slate-700 dark:text-slate-200">{{ cancelReason(o) }}</span>
                  <span class="mx-1">•</span>
                  By: <span class="font-medium text-slate-700 dark:text-slate-200">{{ cancelBy(o) }}</span>
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
            <div>
              <span
                class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold
                       bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                Cancelled
              </span>
            </div>
            <div v-if="refundState(o)" class="mt-1">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                :class="refundState(o).cls"
                :title="refundState(o).title"
              >
                {{ refundState(o).label }}
              </span>
            </div>
          </div>

          <!-- Cancelled at -->
          <div class="col-span-2 self-start">
            <span class="inline-block rounded-full px-2 py-1 text-xs font-semibold leading-tight
                         bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {{ fmt(cancelledAtOf(o)) }}
            </span>
          </div>

          <!-- Actions -->
          <div class="col-span-2 self-start">
            <div class="flex flex-col items-start gap-2">
              <button
                class="w-full rounded-md border px-3 py-1.5 text-sm transition
                       border-slate-300 text-slate-700 hover:bg-slate-50
                       dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                @click="openDetails(o)"
              >
                View Details
              </button>
              <button
                class="w-full rounded-md border px-3 py-1.5 text-sm transition
                       border-slate-300 text-slate-700 hover:bg-slate-50
                       dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                @click="copyOrderId(o.orderId || o.id)"
              >
                Copy Order ID
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Card View -->
    <div class="lg:hidden space-y-3">
      <div v-if="isLoading" class="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-6 py-12 text-center text-slate-500 dark:text-slate-400">
        Loading orders…
      </div>
      <div v-else-if="sortedRows.length===0" class="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-6 py-12 text-center text-slate-500 dark:text-slate-400">
        No cancellations
      </div>

      <div v-else v-for="o in paged" :key="o.id" class="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4">
        <div class="flex gap-3 mb-3">
          <img :src="thumbnail(o)" alt="" class="h-16 w-16 flex-shrink-0 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
          <div class="min-w-0 flex-1 overflow-hidden">
            <div class="font-medium text-slate-900 dark:text-white leading-tight break-words">
              {{ titleLine(o) }}
            </div>
            <div class="mt-1 inline-flex items-center rounded-full
                      bg-blue-50 text-blue-700
                      dark:bg-blue-950/40 dark:text-blue-300
                      px-2 py-0.5 text-xs font-medium">
              {{ (o.products || []).length }} product{{ (o.products || []).length !== 1 ? 's' : '' }}
            </div>
          </div>
        </div>

        <div class="space-y-2 text-sm mb-3">
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400">Order #</span>
            <span class="font-medium text-slate-900 dark:text-white">{{ o.orderId || o.id }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400">Buyer</span>
            <span class="font-medium text-slate-900 dark:text-white">{{ o.buyer?.name || o.shippingAddress?.fullName || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400">Total</span>
            <span class="font-semibold text-slate-900 dark:text-white">{{ money(orderGrand(o)) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400">Reason</span>
            <span class="font-medium text-slate-900 dark:text-white text-right">{{ cancelReason(o) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400">Cancelled By</span>
            <span class="font-medium text-slate-900 dark:text-white">{{ cancelBy(o) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400">Cancelled</span>
            <span class="font-medium text-slate-900 dark:text-white text-right text-xs">{{ fmt(cancelledAtOf(o)) }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-3">
          <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold
                       bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            Cancelled
          </span>
          <span
            v-if="refundState(o)"
            class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="refundState(o).cls"
            :title="refundState(o).title"
          >
            {{ refundState(o).label }}
          </span>
        </div>

        <button class="text-xs text-blue-700 dark:text-blue-300 hover:underline mb-3" @click="toggleExpand(o.id)">
          {{ expanded[o.id] ? 'Hide items' : `View items (${(o.products||[]).length})` }}
        </button>

        <div
          v-if="expanded[o.id]"
          class="mb-3 rounded-lg border border-slate-200 bg-slate-50
                 dark:border-slate-700 dark:bg-slate-800/40 p-3"
        >
          <div class="space-y-2">
            <div v-for="(p, i) in (o.products||[])" :key="i" class="pb-2 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
              <div class="text-xs font-medium text-slate-900 dark:text-white">{{ p.item_name || p.name }}</div>
              <div class="flex justify-between mt-1 text-xs text-slate-600 dark:text-slate-300">
                <span>{{ p.size || p.variant || '-' }}</span>
                <span>Qty: {{ p.quantity ?? p.qty ?? 1 }}</span>
                <span class="font-medium">{{ money(p.price || 0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <button
            class="w-full rounded-md border px-3 py-2 text-sm font-medium transition
                   border-slate-300 text-slate-700 hover:bg-slate-50
                   dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
            @click="openDetails(o)"
          >
            View Details
          </button>
          <button
            class="w-full rounded-md border px-3 py-2 text-sm font-medium transition
                   border-slate-300 text-slate-700 hover:bg-slate-50
                   dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
            @click="copyOrderId(o.orderId || o.id)"
          >
            Copy Order ID
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="!isLoading && sortedRows.length > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400"
    >
      <p class="text-center sm:text-left">
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

    <!-- Details Modal -->
    <teleport to="body">
      <div
        v-if="detailsOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeDetails"
      >
        <div class="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 px-4 sm:px-5 py-4 dark:border-slate-800">
            <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Cancellation Details</h3>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400 break-all">
                Order <span class="font-medium">#{{ selId }}</span>
              </p>
            </div>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button
                class="flex-1 sm:flex-none rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                @click="copyOrderId(selId)"
              >
                Copy ID
              </button>
              <button class="flex-1 sm:flex-none rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white" @click="closeDetails">
                Back
              </button>
            </div>
          </div>

          <div id="cancel-details-area" class="max-h-[calc(90vh-80px)] overflow-auto p-4 sm:p-6">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="text-sm">
                <div class="font-medium text-slate-900 dark:text-white">Buyer</div>
                <div class="text-slate-700 dark:text-slate-200">{{ selBuyer.name }}</div>
                <div class="text-slate-500 dark:text-slate-400">{{ selBuyer.addr1 }}</div>
                <div class="text-slate-500 dark:text-slate-400">{{ selBuyer.addr2 }}</div>
                <div v-if="selBuyer.phone" class="text-slate-500 dark:text-slate-400">{{ selBuyer.phone }}</div>
              </div>
              <div class="text-sm space-y-1">
                <div><span class="font-medium">Cancelled:</span> {{ selCancelled }}</div>
                <div><span class="font-medium">By:</span> {{ cancelBy(selected) }}</div>
                <div><span class="font-medium">Reason:</span> {{ cancelReason(selected) }}</div>
                <div v-if="refundState(selected)"><span class="font-medium">Refund:</span> {{ refundState(selected).label }}</div>

                <!-- Logistics (optional) -->
                <div v-if="hasLogistics(selected)" class="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div class="font-medium text-slate-900 dark:text-white">Logistics</div>
                  <div class="text-slate-700 dark:text-slate-200">
                    <span>{{ selected?.logistics?.shipper || selected?.shipper || '—' }}</span>
                    <span v-if="(selected?.logistics?.trackingNumber || selected?.trackingNumber)"> • </span>
                    <span v-if="(selected?.logistics?.trackingNumber || selected?.trackingNumber)">
                      {{ selected?.logistics?.trackingNumber || selected?.trackingNumber }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 overflow-x-auto -mx-4 sm:mx-0">
              <div class="inline-block min-w-full align-middle px-4 sm:px-0">
                <div class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <table class="w-full border-collapse text-sm">
                    <thead class="bg-slate-50 dark:bg-slate-800/60">
                      <tr>
                        <th class="px-2 sm:px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Product</th>
                        <th class="px-2 sm:px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Variant</th>
                        <th class="px-2 sm:px-3 py-2 text-center font-semibold text-slate-700 dark:text-slate-200">Qty</th>
                        <th class="px-2 sm:px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">Unit Price</th>
                        <th class="px-2 sm:px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="(selProducts || []).length===0">
                        <td colspan="5" class="px-3 py-3 text-center text-slate-500 dark:text-slate-400">No items</td>
                      </tr>
                      <tr v-for="(p,i) in selProducts" :key="i" class="border-t border-slate-100 dark:border-slate-800">
                        <td class="px-2 sm:px-3 py-2 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{{ p.item_name || p.name || '—' }}</td>
                        <td class="px-2 sm:px-3 py-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{{ p.size || p.variant || '-' }}</td>
                        <td class="px-2 sm:px-3 py-2 text-center text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{{ Number(p?.quantity ?? 1) }}</td>
                        <td class="px-2 sm:px-3 py-2 text-right text-slate-900 dark:text-white text-xs sm:text-sm whitespace-nowrap">{{ money(unitPrice(p)) }}</td>
                        <td class="px-2 sm:px-3 py-2 text-right text-slate-900 dark:text-white text-xs sm:text-sm whitespace-nowrap">{{ money(lineTotal(p)) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-1 justify-end sm:grid-cols-2">
              <div></div>
              <div class="space-y-1 text-sm">
                <div class="flex items-center justify-between">
                  <div class="text-slate-600 dark:text-slate-300">Products Subtotal:</div>
                  <div class="text-slate-900 dark:text-white">{{ money(selSubtotal) }}</div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="text-slate-600 dark:text-slate-300">Shipping (if charged):</div>
                  <div class="text-slate-900 dark:text-white">{{ money(selShipping) }}</div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="text-slate-600 dark:text-slate-300">Discount:</div>
                  <div class="text-slate-900 dark:text-white">- {{ money(selDiscount) }}</div>
                </div>
                <div class="mt-1 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                  <div class="font-semibold text-slate-900 dark:text-white">Grand Total:</div>
                  <div class="font-semibold text-slate-900 dark:text-white">{{ money(selGrand) }}</div>
                </div>
              </div>
            </div>

            <p class="mt-6 text-xs text-slate-500 dark:text-slate-400">
              Tip: If stock was allocated, remember to restock the cancelled items in your inventory.
            </p>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useSellerOrders } from '@/composables/useSellerOrders'
import { useToast } from '@/composables/useToast'

const { orders, ready } = useSellerOrders()
const { success, error: toastError } = useToast()

/* ---------------- state ---------------- */
const searchStr = ref('')
const sortMode = ref('cancelled_desc')
const expanded = reactive({})

const pageSize = 10
const page = ref(1)
const totalPages = computed(() => Math.ceil(sortedRows.value.length / pageSize))
const paged = computed(() => sortedRows.value.slice((page.value-1)*pageSize, page.value*pageSize))
const pageStart = computed(() => sortedRows.value.length ? (page.value-1)*pageSize+1 : 0)
const pageEnd = computed(() => Math.min(page.value*pageSize, sortedRows.value.length))

watch([searchStr, sortMode], () => { page.value = 1 })

/* FIX: use ready.value to determine loading */
const isLoading = computed(() =>
  (ready?.value === false) && ((orders?.value?.length ?? 0) === 0)
)

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* ---------------- helpers ---------------- */
const money = n => 'S$' + (Math.round((Number(n)||0)*100)/100).toFixed(2)
const orderGrand = (o) =>
  o?.totals?.grandTotal ??
  (o.products||[]).reduce((a,p)=>a + (p.totalPrice ?? (Number(p.price||0)*(p.quantity??p.qty??1))),0)

const unitPrice = (p) => {
  const qty = Number(p?.quantity ?? p?.qty ?? 1)
  const total = p?.totalPrice
  if (total != null && qty > 0) return Number(total)/qty
  return Number(p?.price || 0)
}
const lineTotal = (p) => {
  const qty = Number(p?.quantity ?? p?.qty ?? 1)
  const total = p?.totalPrice
  if (total != null) return Number(total)
  return Number(p?.price || 0) * qty
}

const titleLine = o => (o.products?.[0]?.item_name || o.products?.[0]?.name || '—')
const thumbnail = o => o.products?.[0]?.img_url || o.products?.[0]?.image || 'https://via.placeholder.com/48x48?text=%20'

const msOf = (ts) => {
  if (!ts) return undefined
  if (typeof ts === 'number') return ts
  if (typeof ts === 'string') return new Date(ts).getTime()
  if (ts?.toDate) return ts.toDate().getTime()
  try { return new Date(ts).getTime() } catch { return undefined }
}
const fmt = (d) => {
  if (!d) return '—'
  try {
    const date = d?.toDate ? d.toDate() : new Date(d)
    return date.toLocaleString('en-SG',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})
  } catch { return '—' }
}

function toggleExpand(id){ expanded[id] = !expanded[id] }

/* Human-friendly reason mapping */
const REASON_MAP = {
  overdue_no_start: 'Missed delivery window',
  buyer_changed_mind: 'Buyer changed mind',
  address_issue: 'Address issue',
  payment_timeout: 'Payment timeout',
  stock_out: 'Out of stock',
}

function lastCancelledLog(o) {
  if (!Array.isArray(o?.statusLog)) return null
  return [...o.statusLog].reverse().find(e =>
    String(e?.status || '').toLowerCase().includes('cancel')
  ) || null
}

function reasonFrom(o) {
  const raw = o?.cancelReason || o?.cancellation?.reason || lastCancelledLog(o)?.message || ''
  if (!raw) return 'Not specified'
  return REASON_MAP[raw] || raw
}

const cancelReason = (o) => reasonFrom(o)

const cancelBy = (o) => {
  // 1) Explicit fields
  let who = o?.cancelledBy || o?.cancellation?.by || lastCancelledLog(o)?.by || ''
  const w = String(who || '').toLowerCase().trim()

  // 2) Friendly inference
  if (w === 'buyer' || who === (o?.uid || '')) return 'Buyer'
  if (w === 'seller' || (who && (o?.products || []).some(p => p?.sellerId && p.sellerId === who))) return 'Seller'
  if (w.includes('system') || w === 'auto' || w === 'automated') return 'System (auto)'

  // 3) Nothing usable
  return 'Not specified'
}


/* Refund pill (optional) */
function refundState(o){
  const st = o?.refund?.status
  if (!st) return null
  const s = String(st).toLowerCase()
  if (s === 'pending') return { label:'Refund Pending', cls:'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', title:'Awaiting processing' }
  if (s === 'processed' || s === 'completed') return { label:'Refund Completed', cls:'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', title:'Refund issued' }
  if (s === 'rejected') return { label:'Refund Rejected', cls:'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', title:'Refund request rejected' }
  return { label:`Refund: ${st}`, cls:'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', title:'Refund status' }
}

/* -------- search + sort: ONLY cancelled -------- */
const filteredRows = computed(() => {
  const pool = (orders.value || []).filter(isCancelled)

  const q = searchStr.value.trim().toLowerCase()
  if (!q) return pool

  return pool.filter(o => {
    const hay = [
      o.orderId || o.id,
      o.buyer?.name || o.shippingAddress?.fullName,
      cancelReason(o),
      o?.logistics?.trackingNumber || o?.trackingNumber || '',
      o?.payment?.transactionId || '',
      ...(o.products || []).map(p => p.item_name || p.name),
    ].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

const sortedRows = computed(() => {
  const rows = [...filteredRows.value]
  if (sortMode.value === 'cancelled_desc') {
    rows.sort((a,b) => (msOf(cancelledAtOf(b)) ?? 0) - (msOf(cancelledAtOf(a)) ?? 0))
  } else if (sortMode.value === 'cancelled_asc') {
    rows.sort((a,b) => (msOf(cancelledAtOf(a)) ?? 0) - (msOf(cancelledAtOf(b)) ?? 0))
  } else if (sortMode.value === 'total_desc') {
    rows.sort((a,b) => orderGrand(b) - orderGrand(a))
  } else if (sortMode.value === 'total_asc') {
    rows.sort((a,b) => orderGrand(a) - orderGrand(b))
  }
  return rows
})

/* ---------------- actions ---------------- */
const detailsOpen = ref(false)
const selected = ref(null)

function openDetails(o){ selected.value = o; detailsOpen.value = true }
function closeDetails(){ detailsOpen.value = false }

async function copyOrderId(idLike){
  const id = String(idLike ?? '').trim()
  if (!id) { toastError('No order ID to copy'); return }
  try {
    if (navigator.clipboard && window.isSecureContext !== false) {
      await navigator.clipboard.writeText(id)
    } else {
      const ta = document.createElement('textarea')
      ta.value = id
      ta.setAttribute('readonly','')
      ta.style.position='fixed'; ta.style.opacity='0'
      document.body.appendChild(ta); ta.select()
      document.execCommand('copy'); document.body.removeChild(ta)
    }
    success(`Order ID "${id}" copied to clipboard`)
  } catch (e) {
    console.error(e); toastError('Failed to copy Order ID')
  }
}

/* Derived fields for details modal */
const selId = computed(() => selected.value?.orderId || selected.value?.id || '—')
const selBuyer = computed(() => {
  const addr = selected.value?.shippingAddress || {}
  const name = selected.value?.buyer?.name || addr.fullName || '—'
  const addr1 = addr.streetName || ''
  const addr2 = [addr.unitNumber ? `#${addr.unitNumber}` : '', addr.postalCode ? `Singapore ${addr.postalCode}` : ''].filter(Boolean).join(' ')
  const phone = addr.phoneNumber || ''
  return { name, addr1, addr2, phone }
})
const selProducts = computed(() => Array.isArray(selected.value?.products) ? selected.value.products : [])
const selSubtotal = computed(() => selProducts.value.reduce((a,p)=>a+lineTotal(p),0))
const selShipping = computed(() => Number(selected.value?.totals?.shippingFee ?? 0))
const selDiscount = computed(() => Number(selected.value?.totals?.discount ?? 0))
const selGrand = computed(() => Number((selSubtotal.value + selShipping.value - selDiscount.value).toFixed(2)))
const selCancelled = computed(() => fmt(cancelledAtOf(selected.value)))
const hasLogistics = (o) => !!(o?.logistics?.shipper || o?.shipper || o?.logistics?.trackingNumber || o?.trackingNumber)

/* Status helpers */
function statusNow(o) {
  const direct = (o?.status ?? '').toString().toLowerCase().trim()
  if (direct) return direct
  if (Array.isArray(o?.statusLog) && o.statusLog.length) {
    const last = o.statusLog[o.statusLog.length - 1]
    return (last?.status ?? '').toString().toLowerCase().trim()
  }
  return ''
}

/** Decide if an order should appear in Cancellations */
function isCancelled(o) {
  const s = statusNow(o)
  if (['cancelled', 'canceled', 'cancel'].includes(s)) return true
  if (Array.isArray(o?.statusLog) && o.statusLog.some(
    e => ['cancelled', 'canceled'].includes(String(e?.status || '').toLowerCase())
  )) return true
  if (o?.cancellation?.by || o?.cancellation?.active) return true
  return false
}

/** Try to derive the cancelled timestamp (field or from statusLog) */
function cancelledAtOf(o) {
  if (o?.cancelledAt) return o.cancelledAt
  if (Array.isArray(o?.statusLog)) {
    const hit = [...o.statusLog].reverse().find(
      e => ['cancelled','canceled'].includes(String(e?.status || '').toLowerCase())
    )
    if (hit?.time) return hit.time
  }
  return o?.updatedAt ?? o?.createdAt
}
</script>
