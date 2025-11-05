<template>
    <section class="space-y-4 px-2 sm:px-0">
      <!-- Header -->
      <header class="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Return / Refund Requests</h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review and respond to buyers' refund or return requests.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <!-- Search -->
          <div class="relative">
            <input
              v-model.trim="queryStr"
              type="text"
              class="w-full sm:w-72 rounded-md border border-slate-300 px-3 py-2 text-sm
                     bg-white text-slate-800 placeholder:text-slate-400
                     dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
              placeholder="Search by product name or order #"
            />
            <svg class="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
            </svg>
          </div>

          <!-- Status Filter -->
          <select
            v-model="stateFilter"
            class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm
                  text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            title="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="return_dropped_off">Return Dropped Off</option>
            <option value="return_received">Return Received</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </header>

      <!-- Desktop Table (hidden on mobile) -->
     <div class="hidden lg:block rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <!-- Header row -->
        <div
        class="grid grid-cols-12 gap-3 border-b px-4 py-3 text-sm font-semibold
               text-slate-700 dark:text-slate-200
               bg-slate-50 dark:bg-slate-800/60
               border-slate-200 dark:border-slate-700
               rounded-t-2xl">
          <div class="col-span-5">Product(s)</div>
          <div class="col-span-1">Amount</div>
          <div class="col-span-1">Status</div>
          <div class="col-span-2">Requested On</div>
          <div class="col-span-1">Solution</div>
          <div class="col-span-2">Actions</div>
        </div>

        <!-- Empty / Loading -->
        <div v-if="loading" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading requests…</div>
        <div v-else-if="paged.length === 0" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No requests found</div>

        <!-- Rows -->
        <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
          <div
            v-for="r in paged" 
            :key="r.id"
            class="grid grid-cols-12 gap-3 px-4 py-4"
          >
            <!-- Product(s) -->
            <div class="col-span-5">
              <div class="flex gap-3">
                <img 
                  :src="findProductImg(r)"
                  alt=""
                  class="h-12 w-12 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" 
                />
                <div class="min-w-0">
                  <div class="font-medium whitespace-normal break-words leading-tight text-slate-900 dark:text-white">
                    {{ findProductName(r) }}
                    <span class="ml-2 inline-flex items-center whitespace-nowrap rounded-full
                                 bg-blue-50 text-blue-700
                                 dark:bg-blue-950/40 dark:text-blue-300
                                 px-2 py-0.5 text-xs font-medium">
                      No. of products: {{ (r.products || []).length }}
                    </span>
                  </div>

                  <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Order #{{ r.orderId }}
                  </div>

                  <!-- View items -->
                  <button 
                    class="mt-1 text-xs text-blue-700 dark:text-blue-300 hover:underline"
                    @click="toggleExpand(r.id)"
                  >
                    {{ expanded[r.id] ? 'Hide items' : `View items (${(r.products||[]).length})` }}
                  </button>

                  <!-- Expanded items table -->
                  <div
                    v-if="expanded[r.id]"
                    class="mt-2 w-[640px] max-w-full rounded-lg
                           border border-slate-200 bg-slate-50
                           dark:border-slate-700 dark:bg-slate-800/40
                           p-2"
                  >
                    <table class="w-full table-fixed text-xs">
                      <colgroup>
                        <col class="w-[55%]" />
                        <col class="w-[20%]" />
                        <col class="w-[10%]" />
                        <col class="w-[15%]" />
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
                        <tr v-for="(p, i) in (r.products||[])" :key="i">
                          <td class="py-1 whitespace-normal break-words text-slate-800 dark:text-slate-200">
                            {{ p.item_name || p.name }}
                          </td>
                          <td class="py-1 whitespace-nowrap text-slate-700 dark:text-slate-300">
                            {{ p.size || p.variant || '-' }}
                          </td>
                          <td class="py-1 text-right text-slate-700 dark:text-slate-300">
                            {{ p.quantity ?? p.qty ?? 1 }}
                          </td>
                          <td class="py-1 text-right whitespace-nowrap tabular-nums text-slate-900 dark:text-white">
                            S${{ Number(p.price || 0).toFixed(2) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Amount -->
            <div class="col-span-1 text-sm font-semibold text-slate-900 dark:text-white">
              S${{ Number(r.returnRequestSummary?.amount ?? 0).toFixed(2) }}
            </div>

            <!-- Status -->
            <div class="col-span-1 self-start">
              <span 
                class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusClass(r.returnRequestSummary?.state)"
              >
                {{ capitalizeStatus(r.returnRequestSummary?.state || 'pending') }}
              </span>
            </div>

            <!-- Requested On -->
            <div class="col-span-2 self-start">
              <span class="inline-block rounded-full px-2 py-1 text-xs font-semibold leading-tight
                           bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {{ formatDate(r.returnRequestSummary?.requestedAt) }}
              </span>
            </div>

            <!-- Solution -->
            <div class="col-span-1 self-start">
              <span class="inline-flex items-center whitespace-nowrap rounded-full
                           bg-blue-50 text-blue-700
                           dark:bg-blue-950/40 dark:text-blue-300
                           px-2 py-0.5 text-xs font-medium">
                {{ solutionLabel(r.returnRequestSummary?.solution) }}
              </span>
            </div>

            <!-- Actions -->
            <div class="col-span-2 self-start">
              <div class="flex flex-col items-start gap-2">
                <!-- Pending -->
                <template v-if="r.returnRequestSummary?.state === 'pending'">
                  <button 
                    @click="openConfirm(r,'approved')"
                    class="w-full rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button 
                    @click="openConfirm(r,'declined')"
                    class="w-full rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                  >
                    Decline
                  </button>
                </template>

                <!-- Return Dropped Off - waiting for seller to receive -->
                <template v-else-if="r.returnRequestSummary?.state === 'return_dropped_off'">
                  <button 
                    @click="openReceiveReturn(r)"
                    class="w-full rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
                  >
                    Confirm Received Return
                  </button>
                  <button 
                    @click="openDecisionDetails(r)"
                    class="w-full rounded-md border px-3 py-1.5 text-sm
                          border-slate-300 text-slate-700 hover:bg-slate-50
                          dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  >
                    View Details
                  </button>
                </template>

                <!-- Approved / Return Received / Declined -->
                <template v-else>
                  <button 
                    @click="openDecisionDetails(r)"
                    class="w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                  >
                    View Details
                  </button>

                  <button 
                    @click="openBuyerDetails(r)"
                    class="w-full rounded-md border px-3 py-1.5 text-sm
                          border-slate-300 text-slate-700 hover:bg-slate-50
                          dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  >
                    View Buyer Info
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Card Layout (visible on mobile only) -->
      <div class="lg:hidden space-y-3">
        <!-- Empty / Loading -->
        <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-6 py-12 text-center text-slate-500 dark:text-slate-400">
          Loading requests…
        </div>
        <div v-else-if="paged.length === 0" class="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-6 py-12 text-center text-slate-500 dark:text-slate-400">
          No requests found
        </div>

        <!-- Card per request -->
        <div
          v-else
          v-for="r in paged"
          :key="r.id"
          class="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 space-y-3"
        >
          <!-- Product Info -->
          <div class="flex gap-3">
            <img 
              :src="findProductImg(r)"
              alt=""
              class="h-16 w-16 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0" 
            />
            <div class="min-w-0 flex-1">
              <div class="font-medium text-sm leading-tight text-slate-900 dark:text-white break-words">
                {{ findProductName(r) }}
              </div>
              <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Order #{{ r.orderId }}
              </div>
              <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Products: {{ (r.products || []).length }}
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-slate-500 dark:text-slate-400">Amount:</span>
              <span class="ml-1 font-semibold text-slate-900 dark:text-white">
                S${{ Number(r.returnRequestSummary?.amount ?? 0).toFixed(2) }}
              </span>
            </div>
            <div>
              <span class="text-slate-500 dark:text-slate-400">Solution:</span>
              <span class="ml-1 font-medium text-slate-900 dark:text-white">
                {{ solutionLabel(r.returnRequestSummary?.solution) }}
              </span>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="flex flex-wrap items-center gap-2">
            <span 
              class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="statusClass(r.returnRequestSummary?.state)"
            >
              {{ capitalizeStatus(r.returnRequestSummary?.state || 'pending') }}
            </span>
            
            <span class="inline-block rounded-full px-2 py-1 text-xs font-semibold
                         bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {{ formatDate(r.returnRequestSummary?.requestedAt) }}
            </span>
          </div>

          <!-- View Items Toggle -->
          <button 
            class="text-xs text-blue-700 dark:text-blue-300 hover:underline font-medium"
            @click="toggleExpand(r.id)"
          >
            {{ expanded[r.id] ? 'Hide items' : `View items (${(r.products||[]).length})` }}
          </button>

          <!-- Expanded items -->
          <div
            v-if="expanded[r.id]"
            class="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40 p-3 space-y-2"
          >
            <div
              v-for="(p, i) in (r.products||[])"
              :key="i"
              class="text-xs space-y-1 pb-2 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0"
            >
              <div class="font-medium text-slate-800 dark:text-slate-200">{{ p.item_name || p.name }}</div>
              <div class="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Variant: {{ p.size || p.variant || '-' }}</span>
                <span>Qty: {{ p.quantity ?? p.qty ?? 1 }}</span>
              </div>
              <div class="text-right font-semibold text-slate-900 dark:text-white">
                S${{ Number(p.price || 0).toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <!-- Pending -->
            <template v-if="r.returnRequestSummary?.state === 'pending'">
              <button 
                @click="openConfirm(r,'approved')"
                class="w-full rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
              >
                Approve
              </button>
              <button 
                @click="openConfirm(r,'declined')"
                class="w-full rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
              >
                Decline
              </button>
            </template>

            <!-- Return Dropped Off -->
            <template v-else-if="r.returnRequestSummary?.state === 'return_dropped_off'">
              <button 
                @click="openReceiveReturn(r)"
                class="w-full rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
              >
                Confirm Received Return
              </button>
              <button 
                @click="openDecisionDetails(r)"
                class="w-full rounded-md border px-3 py-2 text-sm
                      border-slate-300 text-slate-700 hover:bg-slate-50
                      dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
              >
                View Details
              </button>
            </template>

            <!-- Approved / Return Received / Declined -->
            <template v-else>
              <button 
                @click="openDecisionDetails(r)"
                class="w-full rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                View Details
              </button>

              <button 
                @click="openBuyerDetails(r)"
                class="w-full rounded-md border px-3 py-2 text-sm
                      border-slate-300 text-slate-700 hover:bg-slate-50
                      dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
              >
                View Buyer Info
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="!loading && filtered.length > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400"
      >
        <p class="text-center sm:text-left">
          Showing {{ page }} of {{ totalPages || 1 }} – 
          <span class="font-medium">{{ pageEnd }}</span> of
          <span class="font-medium">{{ filtered.length }}</span> results
        </p>
        <div class="flex gap-2">
          <button
            :disabled="page === 1"
            @click="page--;scrollToTop()"
            class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700
                  disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            Previous
          </button>
          <button
            :disabled="page === totalPages || totalPages === 0"
            @click="page++;scrollToTop()"
            class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700
                  disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            Next
          </button>
        </div>
      </div>
    </section>

    <!-- Decision Details Modal -->
    <div
      v-if="showDecisionDetails"
      class="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <!-- Dim overlay -->
      <div class="absolute inset-0 bg-slate-900/50" @click="showDecisionDetails = false"></div>

      <!-- Sheet card -->
      <div
        class="relative z-[71] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-2xl dark:bg-slate-800"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700
                      ring-1 ring-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-900/40 flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3a9 9 0 1 0 9 9A9.01 9.01 0 0 0 12 3Zm1 13h-2v-2h2Zm0-4h-2V7h2Z"/>
              </svg>
            </div>

            <div class="min-w-0">
              <h3 class="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                {{ decisionTitle(selectedDecision) }}
              </h3>

              <!-- Subheader pills -->
              <div class="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span class="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-700
                              dark:bg-slate-700/60 dark:text-slate-200 truncate">
                  Order: {{ selectedDecision?.orderId }}
                </span>
              </div>
            </div>
          </div>

          <!-- Close button -->
          <button
            @click="showDecisionDetails = false"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50
                  dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 flex-shrink-0"
          >
            Close
          </button>
        </div>

        <!-- Summary grid -->
        <div class="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Requested On</p>
            <p class="mt-1 text-sm font-medium text-slate-900 dark:text-white break-words">
              {{ formatDate(selectedDecision?.returnRequestSummary?.requestedAt) }}
            </p>
          </div>

          <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Solution</p>
            <p class="mt-1 text-sm font-medium text-slate-900 dark:text-white">
              {{ solutionLabel(selectedDecision?.returnRequestSummary?.solution) }}
            </p>
          </div>

          <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:col-span-2 md:col-span-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</p>

            <!-- Status pill -->
            <div class="mt-2">
              <div
                class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                :class="detailStatusPillClass"
              >
                <span class="h-2 w-2 rounded-full flex-shrink-0" :class="detailStatusDotClass"></span>
                <span>{{ detailStatusLabel }}</span>
              </div>
              <p class="mt-2 text-sm font-medium text-slate-900 dark:text-white ">
                {{ detailStatusTime }}
              </p>
            </div>
          </div>
        </div>

        <!-- Products -->
        <div class="mt-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-semibold
                      text-slate-900 dark:border-slate-700 dark:text-white">
            <span>Product</span>
            <span class="text-slate-500 dark:text-slate-400">Amount</span>
          </div>
          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <div class="flex min-w-0 items-center gap-3">
              <img
                :src="findProductImg(selectedDecision)"
                class="h-12 w-12 sm:h-14 sm:w-14 flex-none rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-slate-900 dark:text-white">
                  {{ findProductName(selectedDecision) }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Order: {{ selectedDecision?.orderId }}</p>
              </div>
            </div>
            <div class="text-sm font-semibold text-slate-900 dark:text-white flex-shrink-0">
              S${{ Number(selectedDecision?.returnRequestSummary?.amount ?? 0).toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Decision-specific details -->
        <div v-if="selectedDecision?.returnRequestSummary?.state === 'approved' || selectedDecision?.returnRequestSummary?.state === 'return_received'" class="mt-6">
          <div class="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
            <b>{{ selectedDecision?.returnRequestSummary?.solution === 'return_and_refund' ? 'Return & Refund' : 'Refund' }} Approved</b> — 
            {{ selectedDecision?.returnRequestSummary?.state === 'return_received' ? 'Return received. Buyer has been refunded.' : 'Buyer will be refunded.' }}
          </div>
        </div>

        <div v-else-if="selectedDecision?.returnRequestSummary?.state === 'declined'" class="mt-6">
          <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-900/20">
            <p class="text-sm font-semibold text-rose-700 dark:text-rose-200">Decline Reason (Seller)</p>
            <p class="mt-1 text-sm text-rose-800 dark:text-rose-100 break-words">
              {{ selectedDecision?.returnRequestSummary?.declineReason }}
            </p>
            <div class="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
              <img
                v-for="(img, idx) in selectedDecision?.returnRequestSummary?.declineEvidenceUrls || []"
                :key="idx"
                :src="img"
                @click="openImageModal(img)"
                class="aspect-square cursor-pointer rounded-md object-cover ring-1 ring-rose-200 transition hover:scale-[1.05] hover:ring-rose-400 dark:ring-rose-900/40"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Buyer Details Modal -->
    <div
      v-if="showBuyerDetails"
      class="fixed inset-0 z-[80] p-4"
      @keydown.esc="showBuyerDetails = false"
    >
      <!-- Modal -->
      <div
        class="details-zoom mx-auto mt-8 sm:mt-16 w-full max-w-[980px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-0 shadow-2xl ring-1 ring-black/5 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="flex items-center justify-between gap-4 border-b border-slate-200/80 px-4 sm:px-6 py-4 dark:border-slate-700/60">
          <div class="flex min-w-0 items-center gap-4">
            <div class="min-w-0">
              <h3 class="truncate text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                Buyer Details
              </h3>
              <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span class="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Order: {{ selectedBuyer?.orderId }}
                </span>
                <span
                  class="rounded-full px-2 py-0.5 font-medium"
                  :class="{
                    'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200': (selectedBuyer?.returnRequestSummary?.state || 'pending') === 'pending',
                    'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200': selectedBuyer?.returnRequestSummary?.state === 'approved',
                    'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200': selectedBuyer?.returnRequestSummary?.state === 'declined'
                  }"
                >
                  {{ (selectedBuyer?.returnRequestSummary?.state || 'Pending')[0].toUpperCase() + (selectedBuyer?.returnRequestSummary?.state || 'Pending').slice(1) }}
                </span>
              </div>
            </div>
          </div>

          <button
            @click="showBuyerDetails = false"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50
                   dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 flex-shrink-0"
          >
            Close
          </button>
        </div>

        <!-- Body -->
        <div class="px-4 sm:px-6 pb-6 pt-5">
          <!-- Info cards -->
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p class="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Requested On</p>
              <p class="mt-1 font-semibold text-slate-900 dark:text-white">
                {{ formatDate(selectedBuyer?.returnRequestSummary?.requestedAt) }}
              </p>
            </div>
            <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p class="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Buyer Email</p>
              <p class="mt-1 truncate font-semibold text-slate-900 dark:text-white">
                {{ selectedBuyer?.returnRequestSummary?.email || '—' }}
              </p>
            </div>
            <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p class="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Solution</p>
              <p class="mt-1 font-semibold text-slate-900 capitalize dark:text-white">
                {{ (selectedBuyer?.returnRequestSummary?.solution || 'refund').includes('return') ? 'Return' : 'Refund' }}
              </p>
            </div>
          </div>

          <!-- Reason / Description -->
          <div class="mt-5 grid gap-5 lg:grid-cols-2">
            <div class="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
              <h4 class="text-sm font-semibold text-slate-900 dark:text-white">Reason</h4>
              <p class="mt-1 text-sm text-slate-700 dark:text-slate-200">
                {{ selectedBuyer?.returnRequestSummary?.reasonLabel || '—' }}
              </p>
            </div>
            <div class="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
              <h4 class="text-sm font-semibold text-slate-900 dark:text-white">Buyer Description</h4>
              <p class="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                {{ selectedBuyer?.returnRequestSummary?.reasonDescription || '—' }}
              </p>
            </div>
          </div>

          <!-- Products -->
          <div class="mt-5">
            <h4 class="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Products</h4>
            <div class="space-y-3">
              <template v-if="(selectedBuyer?.returnRequestSummary?.items || []).length">
                <div
                  v-for="(it, idx) in selectedBuyer.returnRequestSummary.items"
                  :key="idx"
                  class="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div class="flex min-w-0 items-center gap-3">
                    <img
                      :src="findProductImg(selectedBuyer, it.productId)"
                      class="h-12 w-12 rounded object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div class="min-w-0">
                      <p class="truncate font-medium text-slate-900 dark:text-white">
                        {{ findProductName(selectedBuyer, it.productId) }}
                      </p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">Qty: {{ it.quantity ?? 1 }}</p>
                    </div>
                  </div>
                  <div class="text-right font-semibold text-slate-900 dark:text-white">
                    S${{ Number(it.itemTotal ?? 0).toFixed(2) }}
                  </div>
                </div>
              </template>
              <p v-else class="text-sm text-slate-500 dark:text-slate-400">(No specific items listed)</p>
            </div>
          </div>

          <!-- Evidence -->
          <div class="mt-5">
            <h4 class="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Buyer Evidence</h4>
            <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              <template v-if="(selectedBuyer?.returnRequestSummary?.photoUrls || []).length">
                <a
                  v-for="(u,i) in selectedBuyer.returnRequestSummary.photoUrls"
                  :key="i"
                  :href="u"
                  target="_blank"
                  rel="noopener"
                  class="group block rounded-lg ring-1 ring-slate-200 transition hover:ring-blue-300 dark:ring-slate-700"
                >
                  <img :src="u" class="h-24 w-full rounded-lg object-cover group-hover:scale-[1.02]" />
                </a>
              </template>
              <p v-else class="text-sm text-slate-500 dark:text-slate-400">(No evidence uploaded)</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Approval Modal (Enhanced for Return vs Refund) -->
    <div
      v-if="confirm.visible && confirm.action === 'approved'"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
      @click="confirm.visible = false"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:mx-4 dark:bg-slate-800"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
          {{ isReturnRequest(confirm.target) ? 'Approve Return Request' : 'Confirm Full Refund' }}
        </h3>
        
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          <template v-if="isReturnRequest(confirm.target)">
            Once you approve, the buyer will have <b>3 days</b> to drop off the return at a HouseBiBi Hub. 
            After you receive and confirm the return, the refund will be processed automatically.
          </template>
          <template v-else>
            Once you confirm, the full payment will be refunded to the buyer.
            <b>You will no longer be able to raise a dispute afterwards.</b>
          </template>
        </p>
        
        <p class="mt-4 text-sm font-medium text-slate-700 dark:text-slate-200">
          Refund to Buyer:
          <span class="font-bold text-blue-600">
            S${{ confirm.target?.returnRequestSummary?.amount?.toFixed(2) }}
          </span>
        </p>
        
        <div class="mt-5 flex justify-end gap-2">
          <button
            @click="confirm.visible=false"
            class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            @click="applyDecision"
            class="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            {{ isReturnRequest(confirm.target) ? 'Approve Return' : 'Confirm Refund' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Decline Refund Modal (Evidence Required) -->
    <div
      v-if="confirm.visible && confirm.action === 'declined'"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
      @click="confirm.visible = false"
    >
      <div
        class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:mx-4 dark:bg-slate-800"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Upload Evidence</h3>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Please upload evidence before proceeding.
          Photo(s) showing the correct product packaged in fulfilling this order (CCTV / packing photos).
        </p>

        <!-- Photo(s) — required, same UX as shipping -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Photo(s) <span class="text-rose-600">*</span>
          </label>

          <div
            class="rounded-xl border-2 border-dashed px-4 py-6 text-center
                  border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500
                  bg-white dark:bg-slate-800"
            @dragover.prevent
            @drop.prevent="onDeclineDrop"
          >
            <input
              ref="declineInputEl"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="onDeclineFilesChange"
            />
            <p class="text-sm text-slate-600 dark:text-slate-300">
              Drag & drop photos here, or
              <button type="button" class="font-semibold text-blue-600 hover:underline" @click="triggerDeclinePicker">
                choose files
              </button>
            </p>
            <p class="mt-1 text-xs text-slate-400">PNG/JPG/WebP · Max 10 MB each</p>

            <!-- Previews -->
            <div v-if="declinePreviews.length" class="mt-4 flex flex-wrap justify-center gap-2">
              <div
                v-for="(url, i) in declinePreviews"
                :key="i"
                class="relative"
              >
                <img :src="url" class="h-16 w-16 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                <button
                  type="button"
                  class="absolute -right-2 -top-2 rounded-full bg-white px-1 text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50
                        dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700"
                  @click="removeDeclinePreview(i)"
                  aria-label="Remove"
                >✕</button>
              </div>
            </div>

            <!-- Inline error -->
            <p v-if="declineError" class="mt-3 text-xs text-rose-600">{{ declineError }}</p>
          </div>
        </div>

        <!-- Reason -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Description <span class="text-rose-600">*</span>
          </label>
          <textarea
            v-model="declineReason"
            rows="3"
            placeholder="Explain why the request is declined (required)"
            maxlength="256"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900
                  placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                  dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          ></textarea>
          <p class="mt-1 text-xs text-slate-400">{{ declineReason.length }}/256</p>
        </div>

        <!-- Footer -->
        <div class="mt-6 flex justify-end gap-2">
          <button
            @click="confirm.visible=false"
            class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            :disabled="!declineReason.trim() || declineFiles.length === 0 || !!declineError"
            @click="submitDecline"
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
    <!-- Confirm Received Return Modal -->
    <div
      v-if="showReceiveReturnModal"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
      @click="showReceiveReturnModal = false"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:mx-4 dark:bg-slate-800"
        @click.stop
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            Confirm Return Received
          </h3>
        </div>
        
        <p class="text-sm text-slate-600 dark:text-slate-300">
          Please confirm that you have physically received the return parcel from the buyer. 
          Once confirmed, the refund of <b class="text-slate-900 dark:text-white">S${{ selectedReceiveReturn?.returnRequestSummary?.amount?.toFixed(2) }}</b> will be processed immediately.
        </p>
        
        <div class="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
          <p class="text-xs text-blue-800 dark:text-blue-200">
            <b>Note:</b> Only confirm after you've inspected the returned items. This action cannot be undone.
          </p>
        </div>
        
        <div class="mt-6 flex justify-end gap-2">
          <button
            @click="showReceiveReturnModal = false"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            @click="confirmReceiveReturn"
            class="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
          >
            Confirm Received
          </button>
        </div>
      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <div
      v-if="imageModal.show"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click="closeImageModal"
    >
      <img
        :src="imageModal.url"
        class="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl ring-2 ring-white"
        @click.stop
      />
      <button
        class="absolute top-6 right-6 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-700 shadow hover:bg-white"
        @click="closeImageModal"
      >
        ✕ Close
      </button>
    </div>

    <ToastNotification
      v-if="toast.show"
      :show="toast.show"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      @close="toast.show = false"
    />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, reactive, watch } from 'vue'
import { auth, db, storage } from '@/firebase/firebase_config'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
  collection, query as fsQuery, where, orderBy, onSnapshot,
  doc, updateDoc, Timestamp, getDoc
} from 'firebase/firestore'
import ToastNotification from '@/components/ToastNotification.vue'


/* ------------ UI state ------------ */
const loading = ref(true)
const queryStr = ref('')
const stateFilter = ref('') // '', 'pending', 'approved', 'declined'
const toast = ref({ show:false, type:'success', title:'', message:'', duration:3000 })
const showDecisionDetails = ref(false)
const selectedDecision = ref(null)
const showBuyerDetails = ref(false)
const selectedBuyer = ref(null)

// Computed for detail modal status display
const detailStatusLabel = computed(() => {
  const state = selectedDecision.value?.returnRequestSummary?.state
  if (state === 'return_received') return 'Return Received'
  if (state === 'approved') return 'Approved'
  if (state === 'declined') return 'Declined'
  if (state === 'return_dropped_off') return 'Dropped Off'
  return 'Pending'
})

const detailStatusTime = computed(() => {
  const rr = selectedDecision.value?.returnRequestSummary || {}
  const state = rr.state
  
  // For return_received, use returnReceivedAt
  if (state === 'return_received') {
    const ts = rr.returnReceivedAt || rr.reviewedAt
    if (!ts) return '—'
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts)
      return d.toLocaleString('en-SG', { 
        year:'numeric', month:'short', day:'numeric', 
        hour:'2-digit', minute:'2-digit' 
      })
    } catch { return '—' }
  }
  
  // For other states, use reviewedAt or statusLog
  let ts = rr.reviewedAt
  if (!ts && Array.isArray(selectedDecision.value?.statusLog)) {
    let target = null
    if (state === 'approved') target = 'return_approved'
    else if (state === 'declined') target = 'return_declined'
    else if (state === 'return_dropped_off') target = 'return_dropped_off'
    
    if (target) {
      const entry = [...selectedDecision.value.statusLog].reverse().find(e => e?.status === target)
      ts = entry?.time || null
    }
  }
  
  if (!ts) return '—'
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('en-SG', { 
      year:'numeric', month:'short', day:'numeric', 
      hour:'2-digit', minute:'2-digit' 
    })
  } catch { return '—' }
})

const detailStatusPillClass = computed(() => {
  const state = selectedDecision.value?.returnRequestSummary?.state
  if (state === 'return_received' || state === 'approved') 
    return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200'
  if (state === 'declined') 
    return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
  if (state === 'return_dropped_off')
    return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
  return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
})

const detailStatusDotClass = computed(() => {
  const state = selectedDecision.value?.returnRequestSummary?.state
  if (state === 'return_received' || state === 'approved') return 'bg-green-600'
  if (state === 'declined') return 'bg-rose-600'
  if (state === 'return_dropped_off') return 'bg-blue-600'
  return 'bg-amber-600'
})

/* ------------ Data ------------ */
const requests = ref([])
let stopAuth = null
let stopOrders = null

function showToast(o){
  toast.value = {
    show:true,
    type:o.type||'success',
    title:o.title||'',
    message:o.message||'',
    duration:o.duration||3000
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Use 'auto' for instant scroll, 'smooth' for animated
  })
}

/** Make sure the signed-in seller actually owns the order before uploading evidence */
async function verifySellerBeforeUpload(row) {
  
  const sellerUid = auth.currentUser?.uid || ''
  if (!sellerUid) throw new Error('Not signed in.')

  const snap = await getDoc(doc(db, 'orders', row.id))
  if (!snap.exists()) throw new Error(`Order ${row.id} not found.`)

  const o = snap.data() || {}
  const rootSeller = o.sellerId || null
  const prodSellers = (o.products || []).map(p => p?.sellerId).filter(Boolean)
  const match = sellerUid && (sellerUid === rootSeller || prodSellers.includes(sellerUid))

  if (!match) {
    const detail = JSON.stringify({ sellerUid, rootSeller, prodSellers })
    throw new Error(`Seller mismatch: ${detail}`)
  }
}

/* ------------ Live query with fallback ------------ */
onMounted(() => {
  stopAuth = auth.onAuthStateChanged(async (u) => {
    if (stopOrders) { stopOrders(); stopOrders = null }
    if (!u) { loading.value = false; requests.value = []; return }

    // Primary: orders where root sellerId == me
    const qPrimary = fsQuery(
      collection(db, 'orders'),
      where('sellerId', '==', u.uid),
      where('status', '==', 'return_refund'),
      orderBy('createdAt','desc')
    )

    stopOrders = onSnapshot(qPrimary, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      if (docs.length) {
        requests.value = docs
        loading.value = false
      } else {
        // Fallback: filter client-side by products[0].sellerId == me
        const qFallback = fsQuery(
          collection(db, 'orders'),
          where('status','==','return_refund'),
          orderBy('createdAt','desc')
        )
        // Replace listener with fallback
        stopOrders = onSnapshot(qFallback, (snap2) => {
          const all = snap2.docs.map(d => ({ id: d.id, ...d.data() }))
          requests.value = all.filter(o => (o.products?.[0]?.sellerId || o.sellerId) === u.uid)
          loading.value = false
        }, () => loading.value = false)
      }
    }, () => loading.value = false)
  })
})

const expanded = reactive({})
function toggleExpand(id){ expanded[id] = !expanded[id] }
onBeforeUnmount(() => { stopOrders?.(); stopAuth?.() })

/* ------------ Helpers ------------ */
const statusOf = (r) => r?.returnRequestSummary?.state || 'pending'

function formatDate(ts){
  if(!ts) return '—'
  if (ts?.toDate) {
    return ts.toDate().toLocaleString('en-SG', {
      year:'numeric', month:'short', day:'numeric',
      hour:'2-digit', minute:'2-digit'
    })
  }
  try { return new Date(ts).toLocaleString('en-SG') } catch { return '—' }
}
function capitalizeStatus(s){ 
  if (s === 'return_dropped_off') return 'Returned'
  if (s === 'return_received') return 'Completed'
  return (s||'pending').replace(/^\w/, c => c.toUpperCase()) 
}

// Add these new refs after the existing ones (around line 31)
const showReceiveReturnModal = ref(false)
const selectedReceiveReturn = ref(null)

// Add this helper function after the formatDate function (around line 115)
function isReturnRequest(row) {
  const solution = row?.returnRequestSummary?.solution || ''
  return String(solution).toLowerCase().includes('return')
}

// Add this function to open the receive return modal
function openReceiveReturn(row) {
  selectedReceiveReturn.value = row
  showReceiveReturnModal.value = true
}

// Update the applyDecision function (around line 385)
async function applyDecision(){
  const row = confirm.value.target
  if(!row) return
  const state = 'approved'
  confirm.value.visible = false
  
  try{
    const isReturn = isReturnRequest(row)
    const now = Timestamp.now()
    
    // Calculate deadline (3 days from now)
    const deadline = isReturn 
      ? Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
      : null
    
    await updateDoc(doc(db,'orders',row.id),{
      returnRequestSummary:{
        ...row.returnRequestSummary,
        state,
        reviewedAt: now,
        reviewedBy: auth.currentUser?.uid || null,
        ...(isReturn && { dropoffDeadline: deadline })
      },
      statusLog:[
        ...(row.statusLog||[]),
        { status:'return_approved', by:'seller', time: now }
      ]
    })
    
    const message = isReturn 
      ? 'Return approved. Buyer has 3 days to drop off at a HouseBiBi Hub.'
      : 'Refund approved successfully.'
    
    showToast({ type:'success', title:'Approved', message })
  }catch(e){
    console.error(e)
    showToast({ type:'error', title:'Failed', message:'Could not approve request.' })
  }
}

// Add new function to confirm received return
async function confirmReceiveReturn() {
  const row = selectedReceiveReturn.value
  if (!row) return
  
  showReceiveReturnModal.value = false
  
  try {
    const now = Timestamp.now()
    
    await updateDoc(doc(db, 'orders', row.id), {
      returnRequestSummary: {
        ...row.returnRequestSummary,
        state: 'return_received',
        returnReceivedAt: now,
        returnReceivedBy: auth.currentUser?.uid || null
      },
      statusLog: [
        ...(row.statusLog || []),
        { status: 'return_received', by: 'seller', time: now }
      ]
    })
    
    showToast({ 
      type: 'success', 
      title: 'Return Confirmed', 
      message: 'Return received. Refund will be processed automatically.' 
    })
  } catch (e) {
    console.error(e)
    showToast({ 
      type: 'error', 
      title: 'Failed', 
      message: 'Could not confirm return receipt.' 
    })
  }
}

function statusClass(state){
  switch(state){
    case 'approved': 
    case 'return_received':
      return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200'
    case 'declined': 
      return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
    case 'return_dropped_off':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
    default: 
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
  }
}
function solutionLabel(sol){
  if(!sol) return 'Refund'
  const s = String(sol).toLowerCase()
  if (s.includes('return')) return 'Return'
  return 'Refund'
}
/** Support:
 *  - top table: pass only the order row → pick first product
 *  - buyer details list: pass (row, productId) → find the specific product
 */
function findProduct(row, productId) {
  const products = row?.products || []
  if (!products.length) return null
  if (!productId) return products[0]
  return products.find(p => p.productId === productId || p.id === productId) || products[0]
}
function findProductImg(row, productId) {
  const p = findProduct(row, productId)
  return p?.img_url || p?.imageUrl || ''
}
function findProductName(row, productId) {
  const p = findProduct(row, productId)
  return p?.item_name || p?.name || '(Unknown item)'
}

const decisionTitle = (row) => {
  const sol = row?.returnRequestSummary?.solution || ''
  const isReturn = String(sol).toLowerCase().includes('return')
  return isReturn ? 'Return Details' : 'Refund Details'
}

watch([queryStr, stateFilter], () => {
  page.value = 1
})


/* ------------ Filter + search + paginate ------------ */
const filtered = computed(() => {
  let list = requests.value

  // status filter
  if (stateFilter.value)
    list = list.filter(r => statusOf(r) === stateFilter.value)

  // search by orderId or product names
  const q = queryStr.value.trim().toLowerCase()
  if (q) {
    list = list.filter(r => {
      const names = (r.products || []).map(p => p.item_name || p.name || '').join(' ').toLowerCase()
      return (r.orderId || '').toLowerCase().includes(q) || names.includes(q)
    })
  }

  return list.sort((a,b) => {
    const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : +new Date(a.createdAt || 0)
    const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : +new Date(b.createdAt || 0)
    return tb - ta
  })
})

function guessImageMime(file) {
  if (file?.type && file.type.startsWith('image/')) return file.type
  const name = (file?.name || '').toLowerCase()
  if (name.endsWith('.png'))  return 'image/png'
  if (name.endsWith('.webp')) return 'image/webp'
  if (name.endsWith('.gif'))  return 'image/gif'
  if (name.endsWith('.bmp'))  return 'image/bmp'
  if (name.endsWith('.svg'))  return 'image/svg+xml'
  if (name.endsWith('.jfif')) return 'image/jpeg'  // 👈 add this line
  return 'image/jpeg'
}
const imageModal = ref({ show: false, url: '' })

function openImageModal(url) {
  imageModal.value = { show: true, url }
}

function closeImageModal() {
  imageModal.value = { show: false, url: '' }
}

const pageSize = 10
const page = ref(1)
const totalPages = computed(() => Math.ceil(filtered.value.length / pageSize))
const paged = computed(() => filtered.value.slice((page.value-1)*pageSize, page.value*pageSize))
const pageEnd = computed(() => Math.min(page.value*pageSize, filtered.value.length))

// --- Decline uploader state (JS) ---
const declineInputEl   = ref(null)
const declineError     = ref('')
const declineFiles     = ref([])       // was ref<File[]>
const declinePreviews  = ref([])       // was ref<string[]>

function triggerDeclinePicker () { declineInputEl.value?.click() }

function validateDeclineFile (f) {
  declineError.value = ''
  if (!f) { declineError.value = 'A photo is required.'; return false }
  const type = f.type || guessImageMime(f)
  if (!String(type).startsWith('image/')) {
    declineError.value = 'Please upload image files only (PNG/JPG).'
    return false
  }
  const MAX = 10 * 1024 * 1024 // 10MB — matches Storage rule
  if (f.size > MAX) {
    declineError.value = `File too large: ${(f.size/1048576).toFixed(1)}MB (max 10MB).`
    return false
  }
  return true
}

function onDeclineFilesChange (e) {
  const input = e?.target
  const files = Array.from((input && input.files) ? input.files : [])
  const ok = []
  const previews = []
  for (const f of files) {
    if (validateDeclineFile(f)) { ok.push(f); previews.push(URL.createObjectURL(f)) }
  }
  declineFiles.value = ok
  declinePreviews.value = previews
}

function onDeclineDrop (e) {
  const files = Array.from(e?.dataTransfer?.files || [])
  const ok = []
  const previews = []
  for (const f of files) {
    if (validateDeclineFile(f)) { ok.push(f); previews.push(URL.createObjectURL(f)) }
  }
  declineFiles.value = ok
  declinePreviews.value = previews
}

function removeDeclinePreview (i) {
  declineFiles.value.splice(i, 1)
  declinePreviews.value.splice(i, 1)
  if (declineFiles.value.length === 0) declineError.value = 'A photo is required.'
}


/* ------------ Actions ------------ */
const confirm = ref({ visible:false, action:null, target:null })

function openConfirm(row, action){
  confirm.value = { visible:true, action, target:row }
}
function openDecisionDetails(row){
  selectedDecision.value = row
  showDecisionDetails.value = true
}
function decisionDetailLabel(row){
  const sol = row?.returnRequestSummary?.solution
  const isReturn = String(sol||'').toLowerCase().includes('return')
  return isReturn ? 'View Return Details' : 'View Refund Details'
}
function openBuyerDetails(row){
  selectedBuyer.value = row
  showBuyerDetails.value = true
}


const declineReason = ref('')

async function submitDecline () {
  const row = confirm.value.target
  if (!row) return
  confirm.value.visible = false

  try {
    await verifySellerBeforeUpload(row)

    const sellerUid = auth.currentUser?.uid
    if (!sellerUid) throw new Error('Not signed in.')

    const uploadedUrls = []
    const MAX_MB = 10 // match Storage rule

    for (const f of declineFiles.value) {
      if (f.size > MAX_MB * 1024 * 1024) {
        throw new Error(`"${f.name}" is ${(f.size/1048576).toFixed(2)} MB. Max allowed is ${MAX_MB} MB.`)
      }

      const safe = `${Date.now()}_${(f.name || 'evidence').replace(/[^\w.\-]/g,'_')}`
      const path = `decline_evidence/${row.id}/${sellerUid}/${safe}`
      const fileRef = storageRef(storage, path)

      const forcedType = guessImageMime(f) // handles .jfif → image/jpeg
      const fileToSend = (f.type && f.type.startsWith('image/'))
        ? f
        : new File([f], f.name || 'evidence.jpg', { type: forcedType })

      const metadata = { contentType: forcedType, cacheControl: 'public,max-age=31536000' }

      await uploadBytes(fileRef, fileToSend, metadata)
      uploadedUrls.push(await getDownloadURL(fileRef))
    }

    await updateDoc(doc(db, 'orders', row.id), {
      returnRequestSummary: {
        ...row.returnRequestSummary,
        state: 'declined',
        declineReason: declineReason.value,
        declineEvidenceUrls: uploadedUrls,
        reviewedAt: Timestamp.now(),
        reviewedBy: sellerUid
      },
      statusLog: [
        ...(row.statusLog || []),
        { status: 'return_declined', by: 'seller', time: Timestamp.now() }
      ]
    })

    showToast({ type:'success', title:'Declined', message:'Buyer will be notified with your reason and evidence.' })
  } catch (err) {
    console.error('Decline failed (Storage/Firestore):', err)
    let msg = err?.message || 'Unexpected error.'
    if (err?.code === 'storage/unauthorized') msg = 'Upload blocked by Storage Rules. Check path & contentType.'
    if (err?.code === 'storage/forbidden')    msg = 'Forbidden by bucket/token. Check rules or authentication.'
    showToast({ type:'error', title:'Decline Failed', message: msg, duration: 7000 })
  } finally {
    declineReason.value = ''
    declineFiles.value = []
    declinePreviews.value = []
    declineError.value = ''
  }
}


</script>

<style scoped>
.details-zoom {
  animation: dz .18s ease-out;
  transform-origin: 50% 40%;
}
@keyframes dz {
  from { opacity: .0; transform: scale(.98); }
  to   { opacity: 1;  transform: scale(1); }
}
</style>
