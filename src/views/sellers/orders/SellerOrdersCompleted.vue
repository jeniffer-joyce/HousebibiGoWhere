<!-- src/views/sellers/orders/SellerOrdersCompleted.vue -->
<template>
  <section class="space-y-4">
    <!-- Header -->
    <header class="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Completed Orders</h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          View all orders successfully delivered and completed. You can download an invoice for your records.
        </p>
      </div>

      <!-- Search -->
      <div class="relative">
        <input
          v-model="query"
          type="text"
          class="w-full sm:w-64 md:w-72 rounded-md border border-slate-300 px-3 py-2 text-sm
                 bg-white text-slate-800 placeholder:text-slate-400
                 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
          placeholder="Search order, buyer, product…"
        />
        <svg class="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
        </svg>
      </div>
    </header>

    <!-- Table - Desktop View (hidden on mobile) -->
    <div class="hidden lg:block rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <!-- Header row (grid = 5 / 1 / 1 / 2 / 2 / 1) -->
      <div
        class="grid grid-cols-12 gap-3 border-b px-4 py-3 text-sm font-semibold
               text-slate-700 dark:text-slate-200
               bg-slate-50 dark:bg-slate-800/60
               border-slate-200 dark:border-slate-700
               rounded-t-2xl">
        <div class="col-span-5">Product(s)</div>
        <div class="col-span-1">Total</div>
        <div class="col-span-1">Status</div>
        <div class="col-span-2">Completed</div>
        <div class="col-span-2">Channel</div>
        <div class="col-span-1">Actions</div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredRows.length===0" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
        No completed orders yet
      </div>

      <!-- Rows -->
      <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
        <div v-for="o in paged" :key="o.id"
          class="grid grid-cols-12 gap-3 px-4 py-4"
        >
          <!-- Product(s) -->
          <div class="col-span-5">
            <div class="flex gap-3">
              <img :src="o.products?.[0]?.img_url || 'https://via.placeholder.com/48x48?text=%20'" alt="" class="h-12 w-12 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
              <div class="min-w-0">
                <div class="font-medium whitespace-normal break-words leading-tight text-slate-900 dark:text-white">
                  {{ o.products?.[0]?.item_name || '—' }}
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
              </div>
            </div>
          </div>

          <!-- Total -->
          <div class="col-span-1 text-sm font-semibold text-slate-900 dark:text-white">
            {{ fmtCurrency(grandTotal(o)) }}
          </div>

          <!-- Status -->
          <div class="col-span-1 self-start">
            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold
                     bg-emerald-100 text-emerald-700
                     dark:bg-emerald-900/40 dark:text-emerald-300"
            >
              <span class="h-2 w-2 rounded-full bg-emerald-600"></span>
              Completed
            </span>
          </div>

          <!-- Completed -->
          <div class="col-span-2 self-start">
            <span
              class="inline-block max-w-[220px] rounded-full px-2 py-1 text-xs font-semibold leading-tight text-left
                     break-words whitespace-normal
                     bg-sky-50 text-sky-700
                     dark:bg-sky-900/40 dark:text-sky-300"
              :title="formatDateTime(o.completedAt || o.updatedAt)"
            >
              {{ compactDateTime(o.completedAt || o.updatedAt) }}
            </span>
          </div>

          <!-- Channel -->
          <div class="col-span-2 self-start">
            <span class="inline-flex items-center whitespace-nowrap rounded-full
                         bg-blue-50 text-blue-700
                         dark:bg-blue-950/40 dark:text-blue-300
                         px-2 py-0.5 text-xs font-medium">
              {{ o?.shipping?.channelName || o?.logistics?.channel || 'HouseBiBi Express' }}
            </span>
          </div>

          <!-- Actions -->
          <div class="col-span-1 self-start">
            <div class="flex flex-col items-start gap-2">
              <button
                class="rounded-md border px-3 py-1.5 text-sm transition
                       border-slate-300 text-slate-700 hover:bg-slate-50
                       dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                @click="viewDetails(o)"
              >
                Order Details
              </button>

              <button
                class="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                @click="openInvoice(o)"
              >
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card View - Mobile (visible on mobile and tablet) -->
    <div class="lg:hidden space-y-3">
      <!-- Empty state -->
      <div v-if="filteredRows.length===0" class="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-6 py-12 text-center text-slate-500 dark:text-slate-400">
        No completed orders yet
      </div>

      <!-- Order Cards -->
      <div v-else v-for="o in paged" :key="o.id" class="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4">
        <!-- Product Info -->
        <div class="flex gap-3 mb-3">
          <img :src="o.products?.[0]?.img_url || 'https://via.placeholder.com/48x48?text=%20'" alt="" class="h-16 w-16 sm:h-20 sm:w-20 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0" />
          <div class="min-w-0 flex-1">
            <div class="font-medium text-sm sm:text-base leading-tight text-slate-900 dark:text-white mb-1">
              {{ o.products?.[0]?.item_name || '—' }}
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
              <div>Order #{{ o.orderId || o.id }}</div>
              <div>Buyer: {{ o.buyer?.name || o.shippingAddress?.fullName || '—' }}</div>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">Total</div>
            <div class="font-semibold text-slate-900 dark:text-white">{{ fmtCurrency(grandTotal(o)) }}</div>
          </div>
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">Products</div>
            <div class="font-semibold text-slate-900 dark:text-white">{{ (o.products || []).length }}</div>
          </div>
        </div>

        <!-- Status, Completion & Channel -->
        <div class="space-y-2 mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 dark:text-slate-400">Status:</span>
            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold
                     bg-emerald-100 text-emerald-700
                     dark:bg-emerald-900/40 dark:text-emerald-300"
            >
              <span class="h-2 w-2 rounded-full bg-emerald-600"></span>
              Completed
            </span>
          </div>

          <div class="flex items-start gap-2">
            <span class="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 mt-1">Completed:</span>
            <span
              class="inline-block rounded-full px-2 py-1 text-xs font-semibold leading-tight
                     bg-sky-50 text-sky-700
                     dark:bg-sky-900/40 dark:text-sky-300"
              :title="formatDateTime(o.completedAt || o.updatedAt)"
            >
              {{ compactDateTime(o.completedAt || o.updatedAt) }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 dark:text-slate-400">Channel:</span>
            <span class="inline-flex items-center whitespace-nowrap rounded-full
                         bg-blue-50 text-blue-700
                         dark:bg-blue-950/40 dark:text-blue-300
                         px-2 py-0.5 text-xs font-medium">
              {{ o?.shipping?.channelName || o?.logistics?.channel || 'HouseBiBi Express' }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-2">
          <button
            class="flex-1 rounded-md border px-3 py-2.5 text-sm transition touch-manipulation
                   border-slate-300 text-slate-700 hover:bg-slate-50
                   dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
            @click="viewDetails(o)"
          >
            Order Details
          </button>

          <button
            class="flex-1 rounded-md bg-blue-600 px-3 py-2.5 text-sm text-white hover:bg-blue-700 touch-manipulation"
            @click="openInvoice(o)"
          >
            Download Invoice
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="filteredRows.length > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400"
    >
      <p class="text-center sm:text-left">
        Showing {{ page }} of {{ totalPages || 1 }} — 
        <span class="font-medium">{{ pageEnd }}</span> of
        <span class="font-medium">{{ filteredRows.length }}</span> results
      </p>
      <div class="flex gap-2 w-full sm:w-auto">
        <button
          :disabled="page === 1"
          @click="page--; scrollToTop()"
          class="flex-1 sm:flex-initial rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700
                disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 touch-manipulation"
        >
          Previous
        </button>
        <button
          :disabled="page === totalPages || totalPages === 0"
          @click="page++; scrollToTop()"
          class="flex-1 sm:flex-initial rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700
                disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 touch-manipulation"
        >
          Next
        </button>
      </div>
    </div>
    
    <!-- Order Details Modal -->
    <teleport to="body">
      <div
        v-if="detailsOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeDetails"
      >
        <div class="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 flex flex-col">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row items-start justify-between border-b border-slate-200 px-4 sm:px-5 py-4 dark:border-slate-800 flex-shrink-0 gap-3">
            <div>
              <h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Order Details</h3>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Order <span class="font-medium">#{{ dId }}</span>
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                class="flex-1 sm:flex-initial rounded-md border px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60 touch-manipulation"
                @click="openInvoice(detailsOrder)"
              >
                Reprint Invoice
              </button>
              <button
                class="flex-1 sm:flex-initial rounded-md border px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60 touch-manipulation"
                @click="copyOrderId(dId)"
                title="Copy Order ID"
              >
                Copy ID
              </button>
              <button class="flex-1 sm:flex-initial rounded-md bg-blue-600 px-3 py-2 text-sm text-white touch-manipulation" @click="closeDetails">
                Back
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="overflow-auto flex-1">
            <div class="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-3">
              <!-- Left column: buyer + shipping -->
              <div class="space-y-4 lg:col-span-1">
                <!-- Status card -->
                <div class="rounded-xl border p-4 dark:border-slate-800">
                  <div class="text-sm text-slate-500 dark:text-slate-400">Status</div>
                  <div class="mt-1">
                    <span
                      class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold
                          bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200
                          dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-900/40"
                      v-if="dStatus==='completed'"
                    >Completed</span>
                    <span
                      v-else
                      class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800/50 dark:text-slate-300"
                    >{{ titleCase(dStatus) }}</span>
                  </div>
                  <div class="mt-3 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    <div><span class="font-medium">Completed:</span> {{ dCompletedAt }}</div>
                    <div><span class="font-medium">Channel:</span>
                      <span class="ml-1 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-900/30">{{ dChannel }}</span>
                    </div>
                  </div>
                </div>

                <!-- Buyer card -->
                <div class="rounded-xl border p-4 dark:border-slate-800">
                  <div class="mb-1 text-sm font-medium text-slate-900 dark:text-white">Buyer</div>
                  <div class="text-sm text-slate-700 dark:text-slate-200">{{ dBuyer.name }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">{{ dBuyer.addr1 }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">{{ dBuyer.addr2 }}</div>
                  <div v-if="dBuyer.phone" class="text-sm text-slate-500 dark:text-slate-400">☎ {{ dBuyer.phone }}</div>
                </div>

                <!-- Payment summary -->
                <div class="rounded-xl border p-4 dark:border-slate-800">
                  <div class="mb-2 text-sm font-medium text-slate-900 dark:text-white">Payment Summary</div>
                  <div class="space-y-1 text-sm">
                    <div class="flex items-center justify-between">
                      <span class="text-slate-600 dark:text-slate-300">Products Subtotal</span>
                      <span class="text-slate-900 dark:text-white">{{ fmtCurrency(dSubtotal) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-600 dark:text-slate-300">Shipping</span>
                      <span class="text-slate-900 dark:text-white">{{ fmtCurrency(dShipping) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-600 dark:text-slate-300">Discount</span>
                      <span class="text-slate-900 dark:text-white">- {{ fmtCurrency(dDiscount) }}</span>
                    </div>
                    <div class="mt-1 flex items-center justify-between border-t pt-2 dark:border-slate-700">
                      <span class="font-semibold text-slate-900 dark:text-white">Grand Total</span>
                      <span class="font-semibold text-slate-900 dark:text-white">{{ fmtCurrency(dGrand) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right column: items + timeline -->
              <div class="space-y-4 lg:col-span-2">
                <!-- Items table (with Variant column) -->
                <div class="overflow-hidden rounded-xl border dark:border-slate-800">
                  <div class="border-b px-4 py-3 text-sm font-medium text-slate-900 dark:border-slate-800 dark:text-white">Items</div>
                  <div class="max-h-[45vh] overflow-auto">
                    <table class="w-full border-collapse text-xs sm:text-sm min-w-[500px]">
                      <thead class="bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th class="px-2 sm:px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Product</th>
                          <th class="px-2 sm:px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Variant</th>
                          <th class="px-2 sm:px-3 py-2 text-center font-semibold text-slate-700 dark:text-slate-200">Qty</th>
                          <th class="px-2 sm:px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Unit</th>
                          <th class="px-2 sm:px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="(dProducts || []).length === 0">
                          <td colspan="5" class="px-3 py-3 text-center text-slate-500 dark:text-slate-400">No items</td>
                        </tr>
                        <tr v-for="(p,i) in dProducts" :key="i" class="border-t border-slate-100 dark:border-slate-800">
                          <td class="px-2 sm:px-3 py-2 text-slate-800 dark:text-slate-200">{{ p.item_name || p.name || '—' }}</td>
                          <td class="px-2 sm:px-3 py-2 text-slate-700 dark:text-slate-300">{{ p.size || p.variant || '-' }}</td>
                          <td class="px-2 sm:px-3 py-2 text-center text-slate-700 dark:text-slate-300">{{ Number(p?.quantity ?? 1) }}</td>
                          <td class="px-2 sm:px-3 py-2 text-right text-slate-900 dark:text-white">{{ fmtCurrency(unitPrice(p)) }}</td>
                          <td class="px-2 sm:px-3 py-2 text-right text-slate-900 dark:text-white">{{ fmtCurrency(lineTotal(p)) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Timeline (if available) -->
                <div class="overflow-hidden rounded-xl border dark:border-slate-800">
                  <div class="border-b px-4 py-3 text-sm font-medium text-slate-900 dark:border-slate-800 dark:text-white">Order Timeline</div>
                  <div class="max-h-[30vh] overflow-auto p-4">
                    <template v-if="Array.isArray(detailsOrder?.statusLog) && detailsOrder.statusLog.length">
                      <ol class="space-y-3">
                        <li v-for="(e, idx) in detailsOrder.statusLog" :key="idx" class="flex items-start gap-3">
                          <span class="mt-1 inline-block h-2 w-2 rounded-full bg-slate-400 flex-shrink-0"></span>
                          <div class="min-w-0">
                            <div class="text-sm text-slate-800 dark:text-slate-200">
                              <span class="font-medium">{{ titleCase(e.status) }}</span>
                              <span v-if="e.by" class="text-slate-500">• {{ e.by }}</span>
                            </div>
                            <div class="text-xs text-slate-500 dark:text-slate-400">{{ e.message || '' }}</div>
                            <div class="text-xs text-slate-400">{{ e.time?.toDate ? e.time.toDate().toLocaleString('en-SG') : (e.time ? new Date(e.time).toLocaleString('en-SG') : '') }}</div>
                          </div>
                        </li>
                      </ol>
                    </template>
                    <template v-else-if="Array.isArray(detailsOrder?.shipping?.timeline) && detailsOrder.shipping.timeline.length">
                      <ol class="space-y-3">
                        <li v-for="(e, idx) in detailsOrder.shipping.timeline" :key="idx" class="flex items-start gap-3">
                          <span class="mt-1 inline-block h-2 w-2 rounded-full bg-slate-400 flex-shrink-0"></span>
                          <div class="min-w-0">
                            <div class="text-sm text-slate-800 dark:text-slate-200">
                              <span class="font-medium">{{ e.label || titleCase(e.key) }}</span>
                            </div>
                            <div class="text-xs text-slate-500 dark:text-slate-400">{{ e.text || '' }}</div>
                            <div class="text-xs text-slate-400">{{ e.time?.toDate ? e.time.toDate().toLocaleString('en-SG') : (e.time ? new Date(e.time).toLocaleString('en-SG') : '') }}</div>
                          </div>
                        </li>
                      </ol>
                    </template>
                    <template v-else>
                      <div class="text-sm text-slate-500 dark:text-slate-400">No timeline available.</div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- /Body -->
        </div>
      </div>
    </teleport>

    <!-- Invoice Modal -->
    <teleport to="body">
      <div
        v-if="invoiceOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeInvoice"
      >
        <div class="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-200 px-4 sm:px-5 py-4 dark:border-slate-800 flex-shrink-0">
            <div>
              <h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Invoice</h3>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Order <span class="font-medium">#{{ activeId }}</span>
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button class="rounded-md border px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60 touch-manipulation" @click="printInvoice">
                Print
              </button>
              <button class="rounded-md bg-blue-600 px-3 py-2 text-sm text-white touch-manipulation" @click="closeInvoice">
                Back
              </button>
            </div>
          </div>

          <!-- Printable area -->
          <div id="invoice-print-area" class="overflow-auto p-4 sm:p-6 flex-1">
            <div class="mx-auto max-w-3xl">
              <div class="rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm dark:border-slate-700">
                <div class="mb-4">
                  <h1 class="m-0 text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">Invoice</h1>
                  <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Order #{{ activeId }}</div>
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs sm:text-sm">
                  <div>
                    <div><span class="font-medium">Completed:</span> {{ activeCompleted }}</div>
                    <div><span class="font-medium">Payment:</span> {{ activePayment }}</div>
                  </div>
                  <div>
                    <div class="font-medium text-slate-900 dark:text-white">Bill To</div>
                    <div class="text-slate-700 dark:text-slate-200">{{ activeBuyer.name }}</div>
                    <div class="text-slate-500 dark:text-slate-400">{{ activeBuyer.addr1 }}</div>
                    <div class="text-slate-500 dark:text-slate-400">{{ activeBuyer.addr2 }}</div>
                    <div v-if="activeBuyer.phone" class="text-slate-500 dark:text-slate-400">{{ activeBuyer.phone }}</div>
                  </div>
                </div>

                <!-- Items -->
                <div class="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <div class="overflow-x-auto">
                    <table class="w-full border-collapse text-xs sm:text-sm min-w-[500px]">
                      <thead class="bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th class="px-2 sm:px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Product</th>
                          <th class="px-2 sm:px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Variant</th>
                          <th class="px-2 sm:px-3 py-2 text-center font-semibold text-slate-700 dark:text-slate-200">Qty</th>
                          <th class="px-2 sm:px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Unit Price</th>
                          <th class="px-2 sm:px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="(activeProducts || []).length === 0">
                          <td colspan="5" class="px-3 py-3 text-center text-slate-500 dark:text-slate-400">No items</td>
                        </tr>

                        <tr
                          v-for="(p, i) in activeProducts"
                          :key="i"
                          class="border-t border-slate-100 dark:border-slate-800"
                        >
                          <td class="px-2 sm:px-3 py-2 text-slate-800 dark:text-slate-200">
                            {{ p.item_name || '—' }}
                          </td>

                          <!-- Variant / Size column -->
                          <td class="px-2 sm:px-3 py-2 text-slate-700 dark:text-slate-300">
                            {{ p.size || p.variant || '-' }}
                          </td>

                          <td class="px-2 sm:px-3 py-2 text-center text-slate-700 dark:text-slate-300">
                            {{ Number(p?.quantity ?? 1) }}
                          </td>
                          <td class="px-2 sm:px-3 py-2 text-right text-slate-900 dark:text-white">
                            {{ fmtCurrency(unitPrice(p)) }}
                          </td>
                          <td class="px-2 sm:px-3 py-2 text-right text-slate-900 dark:text-white">
                            {{ fmtCurrency(lineTotal(p)) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Totals -->
                <div class="mt-4 grid grid-cols-1 justify-end sm:grid-cols-2">
                  <div></div>
                  <div class="space-y-1 text-xs sm:text-sm">
                    <div class="flex items-center justify-between">
                      <div class="text-slate-600 dark:text-slate-300">Products Subtotal:</div>
                      <div class="text-slate-900 dark:text-white">{{ fmtCurrency(activeSubtotal) }}</div>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="text-slate-600 dark:text-slate-300">Shipping:</div>
                      <div class="text-slate-900 dark:text-white">{{ fmtCurrency(activeShipping) }}</div>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="text-slate-600 dark:text-slate-300">Discount:</div>
                      <div class="text-slate-900 dark:text-white">- {{ fmtCurrency(activeDiscount) }}</div>
                    </div>
                    <div class="mt-1 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                      <div class="font-semibold text-slate-900 dark:text-white">Grand Total:</div>
                      <div class="font-semibold text-slate-900 dark:text-white">{{ fmtCurrency(activeGrand) }}</div>
                    </div>
                  </div>
                </div>

                <p class="mt-6 text-xs text-slate-500 dark:text-slate-400">
                  Thank you for your business. Generated on {{ generatedAt }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSellerOrders } from '@/composables/useSellerOrders'
import { useToast } from '@/composables/useToast'

const { orders, statusOf } = useSellerOrders()
const { success, error: toastError } = useToast()
const query = ref('')
const detailsOpen = ref(false)
const detailsOrder = ref(null)

/* Only completed orders */
const rows = computed(() => orders.value.filter(o => statusOf(o) === 'completed'))

/* Search */
const filteredRows = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return rows.value
  return rows.value.filter(o => {
    const id = (o.orderId || o.id || '').toLowerCase()
    const buyer = (o.buyer?.name || o.shippingAddress?.fullName || '').toLowerCase()
    const hasProduct = (o.products || []).some(p => (p.item_name || '').toLowerCase().includes(q))
    return id.includes(q) || buyer.includes(q) || hasProduct
  })
})

const pageSize = 10
const page = ref(1)
const totalPages = computed(() => Math.ceil(filteredRows.value.length / pageSize))
const paged = computed(() => filteredRows.value.slice((page.value-1)*pageSize, page.value*pageSize))
const pageStart = computed(() => filteredRows.value.length ? (page.value-1)*pageSize+1 : 0)
const pageEnd = computed(() => Math.min(page.value*pageSize, filteredRows.value.length))

watch(query, () => {
  page.value = 1
})
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Use 'auto' for instant scroll, 'smooth' for animated
  })
}

/* Helpers */
function formatDateTime(ts) {
  if (!ts) return '—'
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('en-SG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '—' }
}
function compactDateTime(ts) {
  if (!ts) return '—'
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('en-SG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '—' }
}
function fmtCurrency(n) {
  const v = Number(n || 0)
  return `S${v.toFixed(2)}`
}
function lineTotal(p) {
  const qty = Number(p?.quantity ?? 1)
  const price = Number(p?.price ?? 0)
  const totalPrice = p?.totalPrice
  return Number(totalPrice != null ? totalPrice : price * qty)
}
function unitPrice(p) {
  const qty = Number(p?.quantity ?? 1)
  const price = Number(p?.price ?? 0)
  const totalPrice = p?.totalPrice
  if (totalPrice != null && qty > 0) return Number(totalPrice) / qty
  return price
}
function grandTotal(order) {
  const t = order?.totals?.grandTotal
  if (t != null) return Number(t)
  const items = Array.isArray(order?.products) ? order.products : []
  const sum = items.reduce((a, p) => a + (isNaN(lineTotal(p)) ? 0 : lineTotal(p)), 0)
  const ship = Number(order?.totals?.shippingFee != null ? order.totals.shippingFee : 0)
  const disc = Number(order?.totals?.discount != null ? order.totals.discount : 0)
  return Number((sum + ship - disc).toFixed(2))
}

/* Actions */
function viewDetails(order) {
  detailsOrder.value = order || null
  if (!detailsOrder.value) return
  detailsOpen.value = true
}
// Helpers for details modal
const dId = computed(() => detailsOrder.value?.orderId || detailsOrder.value?.id || '—')
const dStatus = computed(() => detailsOrder.value?.status || 'completed')
const dCompletedAt = computed(() => formatDateTime(detailsOrder.value?.completedAt || detailsOrder.value?.updatedAt))
const dChannel = computed(() =>
  detailsOrder.value?.shipping?.channelName ||
  detailsOrder.value?.logistics?.channel ||
  detailsOrder.value?.shipping?.channel ||
  'HouseBiBi Express'
)
const dBuyer = computed(() => {
  const o = detailsOrder.value || {}
  const name = o?.buyer?.name || o?.shippingAddress?.fullName || '—'
  const phone = o?.shippingAddress?.phoneNumber || ''
  const addr1 = o?.shippingAddress?.streetName || ''
  const addr2 = [
    o?.shippingAddress?.unitNumber ? `#${o.shippingAddress.unitNumber}` : '',
    o?.shippingAddress?.postalCode ? `Singapore ${o.shippingAddress.postalCode}` : ''
  ].filter(Boolean).join(' ')
  return { name, phone, addr1, addr2 }
})
const dProducts = computed(() => Array.isArray(detailsOrder.value?.products) ? detailsOrder.value.products : [])
const dSubtotal = computed(() => dProducts.value.reduce((a,p)=> a + lineTotal(p), 0))
const dShipping = computed(() => Number(detailsOrder.value?.totals?.shippingFee ?? 0))
const dDiscount = computed(() => Number(detailsOrder.value?.totals?.discount ?? 0))
const dGrand    = computed(() => Number((dSubtotal.value + dShipping.value - dDiscount.value).toFixed(2)))

function closeDetails(){ detailsOpen.value = false }

// tiny helper for titles
function titleCase(s) {
  return String(s||'').replace(/\b\w/g, m => m.toUpperCase())
}

/* ========= Invoice modal state ========= */
const invoiceOpen = ref(false)
const invoiceOrder = ref(null)

const openInvoice = (order) => {
  invoiceOrder.value = order
  invoiceOpen.value = true
}
const closeInvoice = () => { invoiceOpen.value = false }
const printInvoice = () => { window.print() }

/* Derived invoice fields */
const activeId = computed(() => invoiceOrder.value?.orderId || invoiceOrder.value?.id || '—')
const activeCompleted = computed(() => formatDateTime(invoiceOrder.value?.completedAt || invoiceOrder.value?.updatedAt))
const activePayment = computed(() => invoiceOrder.value?.payment?.method || 'Card')

const activeBuyer = computed(() => {
  const name = invoiceOrder.value?.buyer?.name || invoiceOrder.value?.shippingAddress?.fullName || '—'
  const addr1 = invoiceOrder.value?.shippingAddress?.streetName || ''
  const addr2 = [
    invoiceOrder.value?.shippingAddress?.unitNumber ? `#${invoiceOrder.value.shippingAddress.unitNumber}` : '',
    invoiceOrder.value?.shippingAddress?.postalCode ? `Singapore ${invoiceOrder.value.shippingAddress.postalCode}` : ''
  ].filter(Boolean).join(' ')
  const phone = invoiceOrder.value?.shippingAddress?.phoneNumber || ''
  return { name, addr1, addr2, phone }
})

const activeProducts = computed(() => Array.isArray(invoiceOrder.value?.products) ? invoiceOrder.value.products : [])
const activeSubtotal = computed(() => activeProducts.value.reduce((a,p) => a + lineTotal(p), 0))
const activeShipping = computed(() => Number(invoiceOrder.value?.totals?.shippingFee ?? 0))
const activeDiscount = computed(() => Number(invoiceOrder.value?.totals?.discount ?? 0))
const activeGrand = computed(() => Number((activeSubtotal.value + activeShipping.value - activeDiscount.value).toFixed(2)))
const generatedAt = computed(() => new Date().toLocaleString('en-SG'))

async function copyOrderId(idLike) {
  const id = String(idLike ?? '').trim()
  if (!id) {
    toastError('No order ID to copy')
    return
  }

  try {
    if (navigator.clipboard && window.isSecureContext !== false) {
      await navigator.clipboard.writeText(id)
    } else {
      // Fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = id
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    success(`Order ID "${id}" copied to clipboard`)
  } catch (e) {
    console.error(e)
    toastError('Failed to copy Order ID')
  }
}

</script>

<style>
/* Hide chat FABs when printing modal pages (if any) */
.intercom-lightweight-app-launcher,
.tawk-button,
.tidio-chat-root,
.chatbot-fab,
button[aria-label="Chat"],
iframe[src*="tawk.to"],
iframe[src*="intercom"] { display: none !important; }

/* Print only the invoice area */
@media print {
  body * { visibility: hidden !important; }
  #invoice-print-area, #invoice-print-area * { visibility: visible !important; }
  #invoice-print-area { position: absolute; inset: 0; margin: 0; padding: 0.5in; background: white; }
}
</style>