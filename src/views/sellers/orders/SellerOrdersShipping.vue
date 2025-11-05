<!-- src/views/sellers/orders/SellerOrdersShipping.vue -->
<template>
  <section class="space-y-4 px-2 sm:px-0">
    <!-- Header -->
    <header class="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Shipping</h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Orders handed to courier. Manage same-day delivery ops, proof of delivery, and re-attempts.
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
            placeholder="Search order, buyer, product, tracking…"
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
          title="Sort shipments"
        >
          <option value="shipped_desc">Shipped (Newest)</option>
          <option value="shipped_asc">Shipped (Oldest)</option>
          <option value="due_asc">Complete by (Soonest)</option>
          <option value="due_desc">Complete by (Latest)</option>
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
        <div class="col-span-1">Total</div>
        <div class="col-span-1">Status</div>
        <div class="col-span-2">Complete By</div>
        <div class="col-span-2">Channel</div>
        <div class="col-span-1">Actions</div>
      </div>

      <!-- Empty / Loading -->
      <div v-if="loading" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading orders…</div>
      <div v-else-if="sortedRows.length===0" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No shipments here yet</div>

      <!-- Rows -->
      <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
        <div
         v-for="o in paged" :key="o.id"
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

                <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Tracking: <span class="font-medium">{{ tracking(o) || '—' }}</span>
                </div>
                <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Shipped: {{ fmt(getShippedDate(o)) }}
                </div>

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
            {{ money(total(o)) }}
          </div>

          <!-- Status -->
          <div class="col-span-1 self-start">
            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="deliveryPill(o).cls"
              :title="deliveryPill(o).title"
            >
              <span class="h-2 w-2 rounded-full" :class="deliveryPill(o).dot"></span>
              {{ deliveryPill(o).label }}
            </span>
          </div>

          <!-- Complete By -->
          <div class="col-span-2 self-start">
            <span
              class="inline-block max-w-[220px] rounded-full px-2 py-1 text-xs font-semibold leading-tight text-left
                     break-words whitespace-normal"
              :class="completeByInfo(o).cls"
              :title="completeByInfo(o).title">
              {{ completeByInfo(o).text }}
            </span>
          </div>

          <!-- Channel -->
          <div class="col-span-2 self-start">
            <span class="inline-flex items-center whitespace-nowrap rounded-full
                         bg-blue-50 text-blue-700
                         dark:bg-blue-950/40 dark:text-blue-300
                         px-2 py-0.5 text-xs font-medium">
              HouseBiBi Express
            </span>
          </div>

          <!-- Actions -->
          <div class="col-span-1 self-start">
            <div class="flex flex-col items-start gap-2">
              <button
                class="rounded-md border px-3 py-1.5 text-sm transition
                       border-slate-300 text-slate-700 hover:bg-slate-50
                       dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                @click="openShipping(o)"
              >
                Check Shipping Details
              </button>

              <!-- Start Delivery -->
              <button
                v-if="canStartDelivery(o)"
                class="rounded-md bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700 disabled:opacity-60"
                :disabled="busyId===o.id"
                @click="openStartModal(o)"
              >
                Start Delivery
              </button>

              <!-- Mark Delivered -->
              <button
                v-if="canMarkDelivered(o)"
                class="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
                @click="openProofModal(o)"
              >
                Mark Delivered
              </button>

              <!-- Auto-cancel -->
              <button
                v-if="o?.status==='to_receive' && isOverdueComplete(o) && o?.delivery?.status !== 'out_for_delivery'"
                class="rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700 disabled:opacity-60"
                :disabled="busyId===o.id"
                @click="autoCancel(o)"
              >
                Cancel (Overdue)
              </button>

              <!-- Resend Delivery -->
              <button
                v-if="canResendDelivery(o)"
                class="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                :disabled="busyId===o.id"
                @click="resendDelivery(o)"
              >
                {{ busyId===o.id ? 'Queueing…' : 'Resend Delivery' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Card Layout (visible on mobile only) -->
    <div class="lg:hidden space-y-3">
      <!-- Empty / Loading -->
      <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-6 py-12 text-center text-slate-500 dark:text-slate-400">
        Loading orders…
      </div>
      <div v-else-if="sortedRows.length===0" class="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-6 py-12 text-center text-slate-500 dark:text-slate-400">
        No shipments here yet
      </div>

      <!-- Card per order -->
      <div
        v-else
        v-for="o in paged"
        :key="o.id"
        class="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 space-y-3"
      >
        <!-- Product Info -->
        <div class="flex gap-3">
          <img :src="thumbnail(o)" alt="" class="h-16 w-16 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0" />
          <div class="min-w-0 flex-1">
            <div class="font-medium text-sm leading-tight text-slate-900 dark:text-white break-words">
              {{ titleLine(o) }}
            </div>
            <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Order #{{ o.orderId || o.id }}
            </div>
            <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Buyer: {{ o.buyer?.name || o.shippingAddress?.fullName || '—' }}
            </div>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-slate-500 dark:text-slate-400">Total:</span>
            <span class="ml-1 font-semibold text-slate-900 dark:text-white">{{ money(total(o)) }}</span>
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400">Products:</span>
            <span class="ml-1 font-semibold text-slate-900 dark:text-white">{{ (o.products || []).length }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-slate-500 dark:text-slate-400">Tracking:</span>
            <span class="ml-1 font-medium text-slate-900 dark:text-white">{{ tracking(o) || '—' }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-slate-500 dark:text-slate-400">Shipped:</span>
            <span class="ml-1 text-slate-900 dark:text-white">{{ fmt(getShippedDate(o)) }}</span>
          </div>
        </div>

        <!-- Status Badges -->
        <div class="flex flex-wrap gap-2">
          <span
            class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="deliveryPill(o).cls"
            :title="deliveryPill(o).title"
          >
            <span class="h-2 w-2 rounded-full" :class="deliveryPill(o).dot"></span>
            {{ deliveryPill(o).label }}
          </span>
          
          <span class="inline-flex items-center whitespace-nowrap rounded-full
                       bg-blue-50 text-blue-700
                       dark:bg-blue-950/40 dark:text-blue-300
                       px-2 py-0.5 text-xs font-medium">
            HouseBiBi Express
          </span>
        </div>

        <!-- Complete By -->
        <div>
          <span
            class="inline-block rounded-full px-2 py-1 text-xs font-semibold leading-tight
                   break-words"
            :class="completeByInfo(o).cls"
            :title="completeByInfo(o).title">
            {{ completeByInfo(o).text }}
          </span>
        </div>

        <!-- View Items Toggle -->
        <button class="text-xs text-blue-700 dark:text-blue-300 hover:underline font-medium" @click="toggleExpand(o.id)">
          {{ expanded[o.id] ? 'Hide items' : `View items (${(o.products||[]).length})` }}
        </button>

        <!-- Expanded items -->
        <div
          v-if="expanded[o.id]"
          class="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40 p-3 space-y-2"
        >
          <div
            v-for="(p, i) in (o.products||[])"
            :key="i"
            class="text-xs space-y-1 pb-2 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0"
          >
            <div class="font-medium text-slate-800 dark:text-slate-200">{{ p.item_name || p.name }}</div>
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Variant: {{ p.size || p.variant || '-' }}</span>
              <span>Qty: {{ p.quantity ?? p.qty ?? 1 }}</span>
            </div>
            <div class="text-right font-semibold text-slate-900 dark:text-white">{{ money(p.price || 0) }}</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            class="w-full rounded-md border px-3 py-2 text-sm transition
                   border-slate-300 text-slate-700 hover:bg-slate-50
                   dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
            @click="openShipping(o)"
          >
            Check Shipping Details
          </button>

          <button
            v-if="canStartDelivery(o)"
            class="w-full rounded-md bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700 disabled:opacity-60"
            :disabled="busyId===o.id"
            @click="openStartModal(o)"
          >
            Start Delivery
          </button>

          <button
            v-if="canMarkDelivered(o)"
            class="w-full rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
            @click="openProofModal(o)"
          >
            Mark Delivered
          </button>

          <button
            v-if="o?.status==='to_receive' && isOverdueComplete(o) && o?.delivery?.status !== 'out_for_delivery'"
            class="w-full rounded-md bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700 disabled:opacity-60"
            :disabled="busyId===o.id"
            @click="autoCancel(o)"
          >
            Auto-cancel (Overdue)
          </button>

          <button
            v-if="canResendDelivery(o)"
            class="w-full rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
            :disabled="busyId===o.id"
            @click="resendDelivery(o)"
          >
            {{ busyId===o.id ? 'Queueing…' : 'Resend Delivery' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="sortedRows.length > 0"
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

    <!-- Shipping details modal -->
    <ShippingDetailsModal
      v-if="showShippingDetails"
      :visible="showShippingDetails"
      :order="selected"
      @close="showShippingDetails=false; selected=null"
    />

    <!-- Start Delivery Confirmation Modal -->
    <teleport to="body">
      <div
        v-if="startOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeStartModal"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
          <div class="mb-3">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Start Delivery</h3>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Send <span class="font-medium">Order #{{ selected?.orderId || selected?.id }}</span> out for delivery now?
              <br/>Same-day Service Level Agreement: must be delivered by <span class="font-medium">11:59 PM today</span>, otherwise it will be marked as <span class="font-medium text-rose-600">Failed</span> and you can re-attempt tomorrow.
            </p>
          </div>
          <ul class="mb-4 list-disc pl-5 text-xs text-slate-500 dark:text-slate-400">
            <li>Courier has parcel in hand</li>
            <li>Recipient contact is reachable</li>
            <li>Proof of delivery will be required on completion</li>
          </ul>
          <div class="flex justify-end gap-2">
            <button class="rounded-md border px-3 py-2 text-sm dark:border-slate-600 dark:text-slate-200" @click="closeStartModal">Back</button>
            <button
              class="rounded-md bg-amber-600 px-3 py-2 text-sm text-white disabled:opacity-60"
              :disabled="busyId===selected?.id"
              @click="confirmStartDelivery"
            >
              {{ busyId===selected?.id ? 'Starting…' : 'Yes, Start Delivery' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Proof of Delivery Modal -->
    <teleport to="body">
      <div
        v-if="proofOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeProofModal"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <!-- Header -->
          <div class="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Mark Delivered</h3>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Order <span class="font-medium">#{{ selected?.orderId || selected?.id }}</span>
              </p>
            </div>
            <button class="rounded p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" @click="closeProofModal">✕</button>
          </div>

          <!-- Body -->
          <div class="space-y-4 px-5 py-5">
            <!-- Dropzone -->
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-200">
                Proof Photo <span class="text-rose-600">*</span>
              </label>

              <div
                class="group relative rounded-xl border-2 border-dashed p-4 transition
                      border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600
                      bg-slate-50/60 dark:bg-slate-800/40"
                @dragover.prevent
                @drop.prevent="onProofFileDrop"
              >
                <!-- Empty -->
                <div v-if="!proofPreview" class="flex flex-col items-center justify-center text-center">
                  <div class="mb-2 rounded-full bg-slate-100 p-3 dark:bg-slate-700">
                    <svg class="h-6 w-6 text-slate-500 dark:text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 7h18M3 7l3-3m-3 3l3 3M21 17H3m18 0l-3 3m3-3l-3-3M8 12h8"/>
                    </svg>
                  </div>
                  <p class="text-sm text-slate-600 dark:text-slate-300">
                    Drag & drop an image here, or
                    <button type="button" class="font-medium text-blue-600 hover:underline dark:text-blue-400" @click="triggerProofPicker">browse</button>
                  </p>
                  <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">PNG/JPG, up to 8 MB</p>
                </div>

                <!-- Preview -->
                <div v-else class="flex flex-col sm:flex-row items-center gap-4">
                  <img :src="proofPreview" alt="Proof Preview"
                      class="max-h-40 rounded-md ring-1 ring-slate-200 dark:ring-slate-700"/>
                  <div class="flex flex-col gap-2 w-full sm:w-auto">
                    <button type="button"
                            class="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50
                                  border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                            @click="triggerProofPicker">
                      Replace Photo
                    </button>
                    <button type="button"
                            class="rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700"
                            @click="clearProof">
                      Remove
                    </button>
                  </div>
                </div>

                <input
                  ref="proofInputEl"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onProofFileChange"
                />
              </div>

              <!-- Inline error -->
              <p v-if="proofError" class="mt-2 text-sm font-medium text-rose-600">{{ proofError }}</p>
            </div>

            <!-- Note (optional) -->
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-200">
                Note to timeline (optional)
              </label>
              <input
                v-model="proofNote"
                class="w-full rounded-lg border px-3 py-2 text-sm transition
                      border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200/60
                      dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                placeholder="e.g., Left at reception with guard"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
            <button class="rounded-md border px-3 py-2 text-sm dark:border-slate-600 dark:text-slate-200" @click="closeProofModal">
              Back
            </button>
            <button
              class="rounded-md px-3 py-2 text-sm text-white transition
                    disabled:opacity-50 disabled:cursor-not-allowed
                    bg-green-600 hover:bg-green-700"
              :disabled="!canConfirmDelivered"
              @click="submitDelivered()"
            >
              {{ completing ? 'Completing…' : 'Confirm Delivered' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import ShippingDetailsModal from '@/components/orders/ShippingDetailsModal.vue'

/* ✅ Toasts: minimal add */
import { useToast } from '@/composables/useToast'
const { success, error: toastError, info } = useToast()

import { auth, db, storage } from '@/firebase/firebase_config'
import {
  collection, query as fsQuery, where, orderBy, onSnapshot,
  doc, updateDoc, serverTimestamp, arrayUnion, Timestamp
} from 'firebase/firestore'
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'

/* ---------------- state ---------------- */
const loading = ref(true)
const allOrders = ref([])
const searchStr = ref('')
const sortMode = ref('shipped_desc') // shipped_desc | shipped_asc | due_asc | due_desc
const expanded = reactive({})
const busyId = ref(null)

/* details modal */
const showShippingDetails = ref(false)
const selected = ref(null)

/* start delivery confirm modal */
const startOpen = ref(false)

/* proof modal state */
const proofOpen = ref(false)
const proofFile = ref(null)
const proofPreview = ref('')
const proofNote = ref('')
const completing = ref(false)

const proofInputEl = ref(null);
const proofError = ref('');
const canConfirmDelivered = computed(() =>
  !!proofFile.value && !completing.value && !proofError.value
);

/* ---------------- live query: only to_receive ---------------- */
let unsub = null
let stopAuth = null

onMounted(() => {
  stopAuth = auth.onAuthStateChanged(async (u) => {
    if (!u) { loading.value = false; return }
    const q = fsQuery(
      collection(db, 'orders'),
      where('sellerId', '==', u.uid),
      where('status', '==', 'to_receive'),
      orderBy('createdAt', 'desc')
    )
    unsub?.()
    unsub = onSnapshot(q, (snap) => {
      allOrders.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    }, () => (loading.value = false))
  })
})

onBeforeUnmount(() => { unsub?.(); stopAuth?.() })

/* ---------------- helpers (display) ---------------- */
const money = n => 'S$' + (Math.round((n||0)*100)/100).toFixed(2)
const total = o => (o?.products||[]).reduce((s,p)=>s + (p.price||0) * (p.quantity ?? p.qty ?? 1), 0)
const titleLine = o => (o.products?.[0]?.item_name || o.products?.[0]?.name || '—')
const thumbnail = o => o.products?.[0]?.img_url || o.products?.[0]?.image || 'https://via.placeholder.com/48x48?text=%20'
const tracking = (o) => o?.logistics?.trackingNumber || o?.shipping?.trackingNumber || ''

const pageSize = 10
const page = ref(1)
const totalPages = computed(() => Math.ceil(sortedRows.value.length / pageSize))  
const paged = computed(() => sortedRows.value.slice((page.value-1)*pageSize, page.value*pageSize)) 
const pageStart = computed(() => sortedRows.value.length ? (page.value-1)*pageSize+1 : 0)  
const pageEnd = computed(() => Math.min(page.value*pageSize, sortedRows.value.length))  
watch([searchStr, sortMode], () => {  // Also watch searchStr instead of just sortMode
  page.value = 1
})
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Use 'auto' for instant scroll, 'smooth' for animated
  })
}

// --- SLA helpers: end of day in SGT + overdue check ---
function endOfDayMs(dateLike) {
  const d = (dateLike instanceof Date) ? new Date(dateLike) : new Date(dateLike || Date.now());
  // Start of that day in local (SGT), then add one day - 1ms
  const startLocal = new Date(d.toLocaleDateString('en-SG'));
  return startLocal.getTime() + 24*60*60*1000 - 1;
}

const msOf = (ts) => {
  if (!ts) return undefined
  if (typeof ts === 'number') return ts
  if (typeof ts === 'string') return new Date(ts).getTime()
  if (ts?.toDate) return ts.toDate().getTime()
  try { return new Date(ts).getTime() } catch { return undefined }
}

const getShippedMs = (o) =>
  msOf(o?.shippedAt) ??
  msOf(o?.shipping?.pickup?.completedAt) ??
  msOf(o?.shipping?.dropoff?.completedAt)
const getShippedDate = (o) => {
  const ms = getShippedMs(o)
  return ms ? new Date(ms) : null
}
const fmt = (d) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleString('en-SG',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) } catch { return '—' }
}
const getDueMs = (o) => {
  const shipped = getShippedMs(o) ?? Date.now()
  const autoCompleteDays = o?.shipping?.autoCompleteDays ?? 7
  return shipped + autoCompleteDays*24*60*60*1000
}

// Show overdue only by "Complete by" SLA (used to gate Auto-cancel)
const isOverdueComplete = (o) => {
  const due = getDueMs(o);
  return !!due && Date.now() > due;
};

/* Delivery pill */
const deliveryPill = (o) => {
  const status = o?.delivery?.status || 'in_transit'
  if (status === 'out_for_delivery') return {
    label: 'Out for Delivery',
    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-600',
    title: 'Courier is delivering today'
  }
  if (status === 'delivered') return {
    label: 'Delivered',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    dot: 'bg-emerald-600',
    title: 'Delivered with proof'
  }
  if (status === 'failed') return {
    label: 'Delivery Failed',
    cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    dot: 'bg-rose-600',
    title: 'Not delivered by midnight'
  }
  if (status === 'pending_resend') return {
    label: 'Pending Re-attempt',
    cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    dot: 'bg-sky-600',
    title: 'Queued for next delivery attempt'
  }
  return {
    label: 'In Transit',
    cls: 'bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    dot: 'bg-sky-600',
    title: 'In transit with courier'
  }
}

/* Complete-by pill */
const completeByInfo = (o) => {
  const now = Date.now()
  const due = getDueMs(o)
  const diff = due - now
  const within24h = diff > 0 && diff <= 86400000
  const overdue = diff < 0

  const cls = overdue
    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
    : within24h
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'

  const text = `Complete by ${new Date(due).toLocaleString('en-SG', {
    year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'
  })}`

  return { text, cls, title: `Due ${new Date(due).toLocaleString('en-SG')}` }
}

/* expand/collapse */
function toggleExpand(id){ expanded[id] = !expanded[id] }

/* ---------------- search + sort ---------------- */
const filteredRows = computed(() => {
  const q = searchStr.value.trim().toLowerCase()
  if (!q) return allOrders.value
  return allOrders.value.filter(o => {
    const hay = [
      o.orderId || o.id,
      o.shippingAddress?.fullName,
      ...(o.products || []).map(p => p.item_name || p.name),
      tracking(o),
    ].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

const sortedRows = computed(() => {
  const rows = [...filteredRows.value]
  const mode = sortMode.value
  if (mode === 'shipped_desc') {
    rows.sort((a,b) => (getShippedMs(b) ?? 0) - (getShippedMs(a) ?? 0))
  } else if (mode === 'shipped_asc') {
    rows.sort((a,b) => (getShippedMs(a) ?? 0) - (getShippedMs(b) ?? 0))
  } else if (mode === 'due_asc') {
    rows.sort((a,b) => (getDueMs(a) ?? 0) - (getDueMs(b) ?? 0))
  } else if (mode === 'due_desc') {
    rows.sort((a,b) => (getDueMs(b) ?? 0) - (getDueMs(a) ?? 0))
  }
  return rows
})

/* ---------------- actions & modals ---------------- */
function openShipping(o){ selected.value = o; showShippingDetails.value = true }

/* Start Delivery confirm modal */
function openStartModal(o){
  selected.value = o
  startOpen.value = true
  info?.('Same-day SLA: deliver by 11:59 PM today.')
}
function closeStartModal(){ startOpen.value = false }
async function confirmStartDelivery(){
  if (!selected.value?.id) return
  try {
    await startDelivery(selected.value)
    success('Delivery started. SLA ends 11:59 PM today.')
  } catch (e) {
    console.error(e)
    toastError('Failed to start delivery.')
  } finally {
    startOpen.value = false
  }
}

const canStartDelivery = (o) =>
  (o?.status === 'to_receive') &&
  (!o?.delivery || !['out_for_delivery','delivered'].includes(o.delivery.status)) &&
  !isOverdueComplete(o);

const canMarkDelivered = (o) =>
  (o?.status === 'to_receive') && (o?.delivery?.status === 'out_for_delivery')

/* Only allow resend if:
   - there was a prior start (attempts >= 1), AND
   - current state is failed (missed the midnight SLA) */
const canResendDelivery = (o) =>
  (o?.status === 'to_receive') &&
  (o?.delivery?.status === 'failed') &&
  ((o?.delivery?.attempts || 0) >= 1)

async function startDelivery(o){
  try {
    busyId.value = o.id
    const refDoc = doc(db,"orders",o.id)
    await updateDoc(refDoc,{
      "delivery.status":"out_for_delivery",
      "delivery.startedAt":serverTimestamp(),
      "delivery.failedAt": null,
      "delivery.deliveredAt": null,
      "delivery.attempts": (o.delivery?.attempts || 0) + 1,
      updatedAt:serverTimestamp(),
      "shipping.timeline":arrayUnion({
        key:"out_for_delivery",
        label:"Out for Delivery",
        text:"Parcel sent out for delivery",
        time:Timestamp.now()
      })
    })
  } catch (e) {
    console.error(e)
    throw e
  } finally {
    busyId.value = null
  }
}

/* Proof of delivery flow */
function openProofModal(o){
  selected.value = o
  proofFile.value = null
  proofPreview.value = ''
  proofNote.value = ''
  proofOpen.value = true
}
function closeProofModal(){ proofOpen.value = false }
function triggerProofPicker() {
  proofInputEl.value?.click();
}

function validateProofFile(f) {
  proofError.value = '';
  if (!f) { proofError.value = 'A proof photo is required.'; return false; }
  if (!f.type?.startsWith('image/')) {
    proofError.value = 'Please upload an image file (PNG/JPG).';
    return false;
  }
  const MAX = 8 * 1024 * 1024; // 8MB
  if (f.size > MAX) {
    proofError.value = 'File is too large. Maximum size is 8 MB.';
    return false;
  }
  return true;
}

function onProofFileChange(e) {
  const f = e.target.files?.[0];
  if (!validateProofFile(f)) { proofFile.value = null; proofPreview.value = ''; return; }
  proofFile.value = f;
  proofPreview.value = URL.createObjectURL(f);
}

function onProofFileDrop(e) {
  const f = e.dataTransfer?.files?.[0];
  if (!validateProofFile(f)) { proofFile.value = null; proofPreview.value = ''; return; }
  proofFile.value = f;
  proofPreview.value = URL.createObjectURL(f);
}

function clearProof() {
  proofFile.value = null;
  proofPreview.value = '';
  proofError.value = '';
  if (proofInputEl.value) proofInputEl.value.value = '';
}

async function uploadProofIfAny(orderDocId) {
  if (!proofFile.value) return '';

  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Not authenticated');
  }
  if (!orderDocId) {
    throw new Error('Order ID is required');
  }

  const file = proofFile.value;

  // Path must be proofs/<sellerUid>/<orderId>/<timestamp>.<ext>
  const ext = (file.type?.split('/')?.[1] || 'jpeg').toLowerCase();
  const path = `proofs/${uid}/${orderDocId}/${Date.now()}.${ext}`;

  console.log('Uploading proof:', { uid, orderDocId, path });

  const fileRef = sRef(storage, path);
  const metadata = {
    contentType: file.type && file.type.startsWith('image/')
      ? file.type
      : 'image/jpeg',
    cacheControl: 'public,max-age=31536000'
  };

  // This write is what the rule must allow
  await uploadBytes(fileRef, file, metadata);
  const url = await getDownloadURL(fileRef);
  
  success('✅ Proof photo uploaded successfully');
  return url;
}

async function autoCancel(o) {
  if (!o?.id) {
    toastError?.('Missing order ID.');
    return;
  }

  try {
    busyId.value = o.id;

    const uid = auth.currentUser?.uid || '';
    if (!uid) {
      toastError?.('Not authenticated.');
      return;
    }

    // ✅ ADD THIS: Log the full order object
    console.log('🔍 Full order object:', {
      id: o.id,
      status: o.status,
      sellerId: o.sellerId,
      uid: o.uid,
      products: o.products?.map(p => ({
        sellerId: p.sellerId,
        name: p.item_name || p.name
      })),
      delivery: o.delivery,
      hasShipping: !!o.shipping,
      shippingKeys: o.shipping ? Object.keys(o.shipping) : []
    });

    const refDoc = doc(db, 'orders', o.id);

    const updatePayload = {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancelledBy: uid,
      cancelReason: 'overdue_no_start',
      updatedAt: serverTimestamp(),
      statusLog: arrayUnion({
        status: 'cancelled',
        by: 'seller',
        time: Timestamp.now(),
        message: 'Auto-cancelled due to overdue completion'
      })
    };

    console.log('📤 Sending update payload:', JSON.stringify(updatePayload, null, 2));

    await updateDoc(refDoc, updatePayload);

    success('Order auto-cancelled.');
  } catch (e) {
    console.error('❌ Auto-cancel error:', e);
    console.error('Full error details:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    toastError(e.message || 'Failed to auto-cancel.');
  } finally {
    busyId.value = null;
  }
}

async function submitDelivered() {
  if (!selected.value?.id) return
  try {
    completing.value = true

    // ✅ Paste this inside here — before uploadProofIfAny
    const currentUid = auth.currentUser?.uid
    const orderSeller =
      selected.value?.sellerId ||
      selected.value?.seller?.uid ||
      selected.value?.products?.[0]?.sellerId ||
      selected.value?.products?.[0]?.seller?.uid

    if (currentUid !== orderSeller) {
      toastError?.(
        `🚫 Upload blocked — you are not the seller of this order.
         Your UID: ${currentUid || 'unknown'}
         Seller UID: ${orderSeller || 'unknown'}`
      )
      completing.value = false
      return // ✅ valid here (inside the function)
    }

    const proofUrl = await uploadProofIfAny(selected.value.id)
    const refDoc = doc(db, "orders", selected.value.id)

    const timelineText = proofNote.value?.trim()
      ? `Delivered — ${proofNote.value.trim()}`
      : 'Delivered with proof'

    await updateDoc(refDoc, {
      "delivery.status": "delivered",
      "delivery.deliveredAt": serverTimestamp(),
      "delivery.proofUrl": proofUrl,
      status: "completed",
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      statusLog: arrayUnion({
        status: "completed",
        by: "courier",
        message: "Delivered successfully",
        time: Timestamp.now()
      }),
      "shipping.timeline": arrayUnion({
        key: "delivered",
        label: "Delivered",
        text: timelineText,
        time: Timestamp.now()
      })
    })

    success?.("✅ Proof uploaded and order marked as delivered!")
    proofOpen.value = false
  } catch (e) {
    console.error(e)
    toastError?.("❌ Upload failed — check permissions or try again.")
  } finally {
    completing.value = false
  }
}


async function resendDelivery(o){
  try {
    busyId.value = o.id
    const refDoc = doc(db,"orders",o.id)
    await updateDoc(refDoc,{
      "delivery.status":"pending_resend",
      updatedAt:serverTimestamp(),
      "shipping.timeline":arrayUnion({
        key:"resend",
        label:"Delivery Rescheduled",
        text:"New delivery attempt scheduled",
        time:Timestamp.now()
      })
    })
    success('Re-attempt queued. Press “Start Delivery” when ready.')
  } catch (e) {
    console.error(e)
    toastError('Failed to queue re-attempt.')
  } finally {
    busyId.value = null
  }
}

async function markDeliveryFailed(o) {
  if (!o?.id) return;
  try {
    busyId.value = o.id;
    const refDoc = doc(db, 'orders', o.id);
    await updateDoc(refDoc, {
      'delivery.status': 'failed',
      'delivery.failedAt': serverTimestamp(),
      updatedAt: serverTimestamp(),
      'shipping.timeline': arrayUnion({
        key: 'failed_delivery',
        label: 'Delivery Failed',
        text: 'Not delivered by midnight; requires re-attempt',
        time: Timestamp.now(),
      }),
    });
    success?.('Marked as failed. You can now “Resend Delivery”.');
  } catch (e) {
    console.error(e);
    toastError?.('Failed to mark as failed.');
  } finally {
    busyId.value = null;
  }
}
</script>

<style>
/* Optional: crisp preview */
img { image-rendering: auto; }
</style>
