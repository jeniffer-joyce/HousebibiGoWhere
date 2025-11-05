<!-- src/views/sellers/orders/SellerOrdersToShip.vue -->
<template>
  <section class="space-y-4">
    <!-- Header -->
    <header class="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">To Ship</h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage new orders in <span class="font-medium">To Process</span>, or reprint AWB under
          <span class="font-medium">Processed</span>.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <!-- Search -->
        <div class="relative">
          <input
            v-model="searchQuery"
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

        <!-- Sort -->
        <select
          v-model="sortMode"
          class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm
                 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          title="Sort orders"
        >
          <option value="created_desc">Created (Newest)</option>
          <option value="created_asc">Created (Oldest)</option>
          <option value="shipby_asc">Ship-by (Soonest)</option>
          <option value="shipby_desc">Ship-by (Latest)</option>
        </select>
      </div>
    </header>

    <!-- Tabs -->
    <div class="flex flex-wrap gap-2">
      <button
        class="rounded-full px-3 py-1.5 sm:py-1 text-sm transition touch-manipulation"
        :class="tab==='all'
          ? 'bg-blue-600 text-white'
          : 'border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100'"
        @click="tab='all'"
      >
        All {{ base.length ? `(${base.length})` : '' }}
      </button>

      <button
        class="rounded-full px-3 py-1.5 sm:py-1 text-sm transition touch-manipulation"
        :class="tab==='to_process'
          ? 'bg-blue-600 text-white'
          : 'border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100'"
        @click="tab='to_process'"
      >
        To Process {{ counts.to_process ? `(${counts.to_process})` : '' }}
      </button>

      <button
        class="rounded-full px-3 py-1.5 sm:py-1 text-sm transition touch-manipulation"
        :class="tab==='processed'
          ? 'bg-blue-600 text-white'
          : 'border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100'"
        @click="tab='processed'"
      >
        Processed {{ counts.processed ? `(${counts.processed})` : '' }}
      </button>
    </div>

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
        <div class="col-span-2">Ship-by Countdown</div>
        <div class="col-span-2">Channel</div>
        <div class="col-span-1">Actions</div>
      </div>

      <!-- Empty state -->
      <div v-if="!sorted.length" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
        No orders available
      </div>

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
                  Order #{{ o.id }} • Buyer: {{ o.buyer?.name || o.shippingAddress?.fullName || '—' }}
                </div>

                <button class="mt-1 text-xs text-blue-700 dark:text-blue-300 hover:underline" @click="toggleExpand(o.id)">
                  {{ expanded[o.id] ? 'Hide items' : `View items (${(o.products||[]).length})` }}
                </button>

                <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Order placed: {{ fmtDate(o.createdAt) }}
                </div>

                <!-- Expanded items table -->
                <div v-if="expanded[o.id]"
                     class="mt-2 w-[640px] max-w-full rounded-lg
                            border border-slate-200 bg-slate-50
                            dark:border-slate-700 dark:bg-slate-800/40
                            p-2">
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
                        <td class="py-1 whitespace-nowrap text-slate-700 dark:text-slate-300">{{ p.size || '-' }}</td>
                        <td class="py-1 text-right text-slate-700 dark:text-slate-300">{{ p.quantity ?? p.qty ?? 1 }}</td>
                        <td class="py-1 text-right whitespace-nowrap tabular-nums text-slate-900 dark:text-white">{{ money(p.price || 0) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Helper copy under products -->
                <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  <template v-if="o.shipping?.arranged && o.shipping?.method === 'dropoff' && !o.shipping?.dropoff?.completed">
                    Drop off at any HouseBiBi Express counter within {{ o.shipping?.dropoff?.windowDays || 3 }} days.
                  </template>

                  <template v-else-if="o.shipping?.arranged && o.shipping?.method === 'pickup' && !o.shipping?.pickup?.completed">
                    Pick-up scheduled
                    <span v-if="o.shipping?.pickup?.date">on {{ o.shipping.pickup.date }}</span>
                    <span v-if="o.shipping?.pickup?.slot"> • {{ o.shipping.pickup.slot }}</span>.
                    Be ready for the courier.
                  </template>

                  <template v-else>
                    To avoid late shipment, please ship out before {{ deadline(o).deadlineStr }}.
                  </template>
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
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold
                     bg-sky-100 text-sky-700
                     dark:bg-sky-900/40 dark:text-sky-300"
            >
              <span class="h-2 w-2 rounded-full bg-sky-600"></span>
              {{ o.shipping?.dropoff?.completed || o.shipping?.pickup?.completed ? 'Shipping' : 'To ship' }}
            </span>
          </div>

          <!-- Ship-by Countdown -->
          <div class="col-span-2 self-start">
            <span
              class="inline-block max-w-[220px] rounded-full px-2 py-1 text-xs font-semibold leading-tight text-left
                     break-words whitespace-normal"
              :class="toShipCountdownInfo(o).cls"
              :title="toShipCountdownInfo(o).title"
            >
              {{ toShipCountdownInfo(o).text }}
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

          <!-- Actions: 'View Actions' popover -->
          <div class="col-span-1 self-start">
            <div class="relative">
              <button
                :class="[
                  'rounded-md border px-3 py-1.5 text-sm transition',
                  'border-slate-300 text-slate-700 hover:bg-slate-50',
                  'dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60',
                  openActionsFor === o.id ? 'rounded-b-none border-b-0 bg-slate-50 dark:bg-slate-800/60' : ''
                ]"
                @click="toggleActions(o.id)"
              >
                View Actions
              </button>

              <div
                v-if="openActionsFor === o.id"
                class="absolute right-0 top-[calc(100%-1px)] z-20 w-44 rounded-b-xl rounded-t-md
                       border border-slate-200 bg-white shadow-lg
                       dark:border-slate-700 dark:bg-slate-800"
              >
                <ul class="py-1 text-sm text-slate-700 dark:text-slate-200">
                  <!-- Not arranged yet -->
                  <li v-if="!o.shipping?.arranged">
                    <button class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50" @click="openChooser(o)">
                      Arrange Shipment
                    </button>
                  </li>

                  <!-- Arranged: Drop-off path -->
                  <template v-else-if="o.shipping?.method === 'dropoff' && !o.shipping?.dropoff?.completed">
                    <li>
                      <button class="w-full px-3 py-2 text-left text-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-700/50" @click="openConfirmHandover(o)">
                        Drop-off Done
                      </button>
                    </li>
                    <li>
                      <button class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50" @click="reprintWaybill(o)">
                        Reprint Waybill
                      </button>
                    </li>
                    <li>
                      <button class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50" @click="openDropoffLocations()">
                        Locations
                      </button>
                    </li>
                  </template>

                  <!-- Arranged: Pickup path -->
                  <template v-else-if="o.shipping?.method === 'pickup' && !o.shipping?.pickup?.completed">
                    <li>
                      <button class="w-full px-3 py-2 text-left text-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-700/50" @click="openConfirmHandover(o)">
                        Pick-up Done
                      </button>
                    </li>
                    <li>
                      <button class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50" @click="reprintWaybill(o)">
                        Reprint Waybill
                      </button>
                    </li>
                  </template>

                  <!-- Already completed handover -->
                  <template v-else>
                    <li>
                      <button class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50" @click="reprintWaybill(o)">
                        Reprint Waybill
                      </button>
                    </li>
                  </template>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card View - Mobile (visible on mobile and tablet) -->
    <div class="lg:hidden space-y-3">
      <!-- Empty state -->
      <div v-if="!sorted.length" class="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-6 py-12 text-center text-slate-500 dark:text-slate-400">
        No orders available
      </div>

      <!-- Order Cards -->
      <div v-else v-for="o in paged" :key="o.id" class="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4">
        <!-- Product Info -->
        <div class="flex gap-3 mb-3">
          <img :src="thumbnail(o)" alt="" class="h-16 w-16 sm:h-20 sm:w-20 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0" />
          <div class="min-w-0 flex-1">
            <div class="font-medium text-sm sm:text-base leading-tight text-slate-900 dark:text-white mb-1">
              {{ titleLine(o) }}
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
              <div>Order #{{ o.id }}</div>
              <div>Buyer: {{ o.buyer?.name || o.shippingAddress?.fullName || '—' }}</div>
              <div>{{ fmtDate(o.createdAt) }}</div>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">Total</div>
            <div class="font-semibold text-slate-900 dark:text-white">{{ money(total(o)) }}</div>
          </div>
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">Products</div>
            <div class="font-semibold text-slate-900 dark:text-white">{{ (o.products || []).length }}</div>
          </div>
        </div>

        <!-- Status & Countdown -->
        <div class="space-y-2 mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 dark:text-slate-400">Status:</span>
            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold
                     bg-sky-100 text-sky-700
                     dark:bg-sky-900/40 dark:text-sky-300"
            >
              <span class="h-2 w-2 rounded-full bg-sky-600"></span>
              {{ o.shipping?.dropoff?.completed || o.shipping?.pickup?.completed ? 'Shipping' : 'To ship' }}
            </span>
          </div>
          
          <div class="flex items-start gap-2">
            <span class="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 mt-1">Ship-by:</span>
            <span
              class="inline-block rounded-full px-2 py-1 text-xs font-semibold leading-tight
                     break-words"
              :class="toShipCountdownInfo(o).cls"
              :title="toShipCountdownInfo(o).title"
            >
              {{ toShipCountdownInfo(o).text }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 dark:text-slate-400">Channel:</span>
            <span class="inline-flex items-center whitespace-nowrap rounded-full
                         bg-blue-50 text-blue-700
                         dark:bg-blue-950/40 dark:text-blue-300
                         px-2 py-0.5 text-xs font-medium">
              HouseBiBi Express
            </span>
          </div>
        </div>

        <!-- Helper text -->
        <div class="text-xs text-slate-500 dark:text-slate-400 mb-3 p-2 bg-slate-50 dark:bg-slate-800/40 rounded">
          <template v-if="o.shipping?.arranged && o.shipping?.method === 'dropoff' && !o.shipping?.dropoff?.completed">
            Drop off at any HouseBiBi Express counter within {{ o.shipping?.dropoff?.windowDays || 3 }} days.
          </template>

          <template v-else-if="o.shipping?.arranged && o.shipping?.method === 'pickup' && !o.shipping?.pickup?.completed">
            Pick-up scheduled
            <span v-if="o.shipping?.pickup?.date">on {{ o.shipping.pickup.date }}</span>
            <span v-if="o.shipping?.pickup?.slot"> • {{ o.shipping.pickup.slot }}</span>.
            Be ready for the courier.
          </template>

          <template v-else>
            To avoid late shipment, please ship out before {{ deadline(o).deadlineStr }}.
          </template>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-2">
          <button 
            class="flex-1 rounded-md border px-3 py-2.5 text-sm transition touch-manipulation
                   border-slate-300 text-slate-700 hover:bg-slate-50
                   dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
            @click="toggleExpand(o.id)"
          >
            {{ expanded[o.id] ? 'Hide items' : `View items (${(o.products||[]).length})` }}
          </button>

          <button
            class="flex-1 rounded-md border px-3 py-2.5 text-sm transition touch-manipulation
                   border-slate-300 text-slate-700 hover:bg-slate-50
                   dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
            @click="toggleActions(o.id)"
          >
            View Actions
          </button>
        </div>

        <!-- Expanded items table -->
        <div v-if="expanded[o.id]"
             class="mt-3 rounded-lg border border-slate-200 bg-slate-50
                    dark:border-slate-700 dark:bg-slate-800/40 p-2 overflow-x-auto">
          <table class="w-full text-xs min-w-[300px]">
            <thead>
              <tr class="text-slate-500 dark:text-slate-400">
                <th class="text-left font-medium py-1 px-1">Item</th>
                <th class="text-left font-medium py-1 px-1">Variant</th>
                <th class="text-right font-medium py-1 px-1">Qty</th>
                <th class="text-right font-medium py-1 px-1">Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in (o.products||[])" :key="i">
                <td class="py-1 px-1 text-slate-800 dark:text-slate-200">{{ p.item_name || p.name }}</td>
                <td class="py-1 px-1 whitespace-nowrap text-slate-700 dark:text-slate-300">{{ p.size || '-' }}</td>
                <td class="py-1 px-1 text-right text-slate-700 dark:text-slate-300">{{ p.quantity ?? p.qty ?? 1 }}</td>
                <td class="py-1 px-1 text-right whitespace-nowrap tabular-nums text-slate-900 dark:text-white">{{ money(p.price || 0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Actions Dropdown (when open) -->
        <div
          v-if="openActionsFor === o.id"
          class="mt-3 rounded-xl border border-slate-200 bg-white shadow-lg
                 dark:border-slate-700 dark:bg-slate-800"
        >
          <ul class="py-1 text-sm text-slate-700 dark:text-slate-200">
            <!-- Not arranged yet -->
            <li v-if="!o.shipping?.arranged">
              <button class="w-full px-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 touch-manipulation" @click="openChooser(o)">
                Arrange Shipment
              </button>
            </li>

            <!-- Arranged: Drop-off path -->
            <template v-else-if="o.shipping?.method === 'dropoff' && !o.shipping?.dropoff?.completed">
              <li>
                <button class="w-full px-3 py-3 text-left text-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 touch-manipulation" @click="openConfirmHandover(o)">
                  Drop-off Done
                </button>
              </li>
              <li>
                <button class="w-full px-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 touch-manipulation" @click="reprintWaybill(o)">
                  Reprint Waybill
                </button>
              </li>
              <li>
                <button class="w-full px-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 touch-manipulation" @click="openDropoffLocations()">
                  Locations
                </button>
              </li>
            </template>

            <!-- Arranged: Pickup path -->
            <template v-else-if="o.shipping?.method === 'pickup' && !o.shipping?.pickup?.completed">
              <li>
                <button class="w-full px-3 py-3 text-left text-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 touch-manipulation" @click="openConfirmHandover(o)">
                  Pick-up Done
                </button>
              </li>
              <li>
                <button class="w-full px-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 touch-manipulation" @click="reprintWaybill(o)">
                  Reprint Waybill
                </button>
              </li>
            </template>

            <!-- Already completed handover -->
            <template v-else>
              <li>
                <button class="w-full px-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 touch-manipulation" @click="reprintWaybill(o)">
                  Reprint Waybill
                </button>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="sorted.length > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400"
    >
      <p class="text-center sm:text-left">
        Showing {{ page }} of {{ totalPages || 1 }} — 
        <span class="font-medium">{{ pageStart }}</span>–<span class="font-medium">{{ pageEnd }}</span> of
        <span class="font-medium">{{ sorted.length }}</span> results
      </p>
      <div class="flex gap-2 w-full sm:w-auto">
        <button
          :disabled="page === 1"
          @click="page--"
          class="flex-1 sm:flex-initial rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700
                disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 touch-manipulation"
        >
          Previous
        </button>
        <button
          :disabled="page === totalPages || totalPages === 0"
          @click="page++"
          class="flex-1 sm:flex-initial rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700
                disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 touch-manipulation"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Modals (unchanged) -->
    <!-- Shipment chooser -->
    <teleport to="body">
      <div
        v-if="chooserOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeAll"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-900">
          <div class="mb-4 flex items-start justify-between">
            <div>
              <h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Ship Order</h3>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">#{{ current?.id }}</p>
            </div>
            <button class="text-slate-500 dark:text-slate-400 text-xl touch-manipulation" @click="closeAll">✕</button>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button class="rounded-xl border p-4 text-left hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500 touch-manipulation" @click="confirm('dropoff')">
              <div class="mb-1 font-medium text-slate-900 dark:text-white">I Will Dropoff</div>
              <p class="text-sm text-slate-500 dark:text-slate-400">Print waybill and drop off at partner counter.</p>
            </button>

            <button class="rounded-xl border p-4 text-left hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500 touch-manipulation" @click="openPickup(current)">
              <div class="mb-1 font-medium text-slate-900 dark:text-white">I Will Arrange Pickup</div>
              <p class="text-sm text-slate-500 dark:text-slate-400">Courier collects from your address.</p>
            </button>
          </div>
        </div>
      </div>

      <!-- Pickup form -->
      <div
        v-if="pickupOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeAll"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-900">
          <div class="mb-4 flex items-start justify-between">
            <div>
              <h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Arrange Pickup</h3>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">#{{ current?.id }}</p>
            </div>
            <button class="text-slate-500 dark:text-slate-400 text-xl touch-manipulation" @click="closeAll">✕</button>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label class="text-sm text-slate-800 dark:text-slate-200">
              Date
              <input type="date" v-model="pickup.date" :min="minDate" class="mt-1 w-full rounded border px-2 py-2.5 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 touch-manipulation" />
            </label>
            <label class="text-sm text-slate-800 dark:text-slate-200">
              Timeslot
              <select v-model="pickup.slot" class="mt-1 w-full rounded border px-2 py-2.5 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 touch-manipulation">
                <option value="9-12">9AM – 12PM</option>
                <option value="12-15">12PM – 3PM</option>
                <option value="15-18">3PM – 6PM</option>
              </select>
            </label>
            <label class="col-span-full text-sm text-slate-800 dark:text-slate-200">
              Remark
              <input v-model="pickup.remark" placeholder="Optional" class="mt-1 w-full rounded border px-2 py-2.5 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 touch-manipulation" />
            </label>
          </div>

          <div class="mt-4 flex flex-col sm:flex-row justify-end gap-2">
            <button class="rounded-md border px-3 py-2.5 text-sm dark:border-slate-600 dark:text-slate-200 touch-manipulation" @click="closeAll">Back</button>
            <button class="rounded-md bg-blue-600 px-3 py-2.5 text-sm text-white disabled:opacity-60 touch-manipulation" :disabled="confirming" @click="confirm('pickup')">
              {{ confirming ? 'Confirming…' : 'Confirm' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Confirm handover -->
      <div
        v-if="confirmHandoverOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeConfirmHandover"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-900">
          <div class="mb-3">
            <h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              {{ isPickup(current) ? 'Confirm Pick-up' : 'Confirm Drop-off' }}
            </h3>
            <p class="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Confirm that you have {{ isPickup(current) ? 'handed the parcel to the courier for pick-up' : 'dropped off' }}
              <span class="font-medium">Order #{{ current?.id }}</span>
              at a <span class="font-medium">HouseBiBi Express</span> {{ isPickup(current) ? 'pick-up' : 'counter' }}?
            </p>
          </div>

          <ul class="mb-4 list-disc pl-5 text-xs text-slate-500 dark:text-slate-400">
            <li>Waybill attached on parcel</li>
            <li>Packed securely, matches declared items</li>
          </ul>

          <div class="flex flex-col sm:flex-row justify-end gap-2">
            <button class="rounded-md border px-3 py-2.5 text-sm dark:border-slate-600 dark:text-slate-200 touch-manipulation" @click="closeConfirmHandover">Back</button>
            <button
              class="rounded-md bg-green-600 px-3 py-2.5 text-sm text-white disabled:opacity-60 touch-manipulation"
              :disabled="confirming"
              @click="markHandoverDone"
            >
              {{ confirming ? 'Confirming…' : (isPickup(current) ? 'Yes, Pick-up Done' : 'Yes, Drop-off Done') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Drop-off Locations -->
      <div
        v-if="locationsOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeLocations"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">HouseBiBi Express Drop-off</h3>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Drop off within 3 days of arranging shipment.</p>
            </div>
            <button class="text-slate-500 dark:text-slate-400 text-xl touch-manipulation" @click="closeLocations">✕</button>
          </div>

          <div class="space-y-3">
            <div v-for="loc in LOCATIONS" :key="loc.id" class="rounded-lg border p-3 dark:border-slate-700">
              <div class="font-medium text-sm sm:text-base text-slate-900 dark:text-white">{{ loc.name }}</div>
              <div class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{{ loc.address }}</div>
            </div>
          </div>

          <div class="mt-4 text-right">
            <button class="rounded-md border px-3 py-2.5 text-sm dark:border-slate-600 dark:text-slate-200 touch-manipulation" @click="closeLocations">Close</button>
          </div>
        </div>
      </div>

      <!-- Waybill Modal -->
      <div
        v-if="waybillOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeWaybill"
      >
        <div class="w-full max-w-4xl rounded-2xl bg-white p-0 shadow-2xl dark:bg-slate-900 max-h-[90vh] overflow-hidden flex flex-col">
          <div class="flex items-center justify-between border-b px-4 py-3 dark:border-slate-700 flex-shrink-0">
            <div>
              <h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Waybill / Air Waybill</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Order #{{ waybillOrder?.id }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="rounded-md border px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60 touch-manipulation" @click="printCurrentWaybill">Print</button>
              <button class="rounded-md bg-blue-600 px-3 py-2 text-sm text-white touch-manipulation" @click="closeWaybill">Back</button>
            </div>
          </div>

          <!-- Printable area -->
          <div id="waybill-print-area" class="overflow-auto p-4 sm:p-6 flex-1">
            <div class="sheet border border-slate-200 p-4 sm:p-6 dark:border-slate-700">
              <div class="mb-3 flex flex-col sm:flex-row items-start justify-between gap-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300">
                <div><strong class="text-slate-900 dark:text-white">{{ shopName(waybillOrder) }}</strong><br/>Waybill / Air Waybill</div>
                <div class="sm:text-right">
                  <div>Order: <strong>{{ waybillOrder?.id }}</strong></div>
                  <div>AWB: <strong>{{ awb }}</strong></div>
                  <div>Channel: <strong>HouseBiBi Express</strong></div>
                  <div class="mt-1 font-mono border border-black inline-block px-2 py-1">{{ barcode }}</div>
                </div>
              </div>

              <div class="mb-2 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-600">
                <div class="text-sm font-semibold text-slate-900 dark:text-white">Ship To:</div>
                <div class="text-xs sm:text-sm text-slate-800 dark:text-slate-200">{{ shipToName(waybillOrder) }}</div>
                <div class="text-xs sm:text-sm text-slate-800 dark:text-slate-200">{{ shipToAddr(waybillOrder) }}</div>
              </div>

              <div class="mb-2 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-600">
                <div class="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <strong>Shipping Method:</strong> {{ waybillOpts?.method?.toUpperCase?.() || 'DROPOFF' }}
                </div>
                <div v-if="waybillOpts?.method==='pickup'" class="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  Pickup Date: {{ waybillOpts?.pickup?.date || '' }} • Timeslot: {{ waybillOpts?.pickup?.slot || '' }}
                </div>
                <div v-else class="text-xs sm:text-sm text-slate-700 dark:text-slate-300">Drop-off: Please drop within 3 days at partner counter</div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full border-collapse text-xs sm:text-sm min-w-[400px]">
                  <thead>
                    <tr class="bg-slate-50 dark:bg-slate-800/60">
                      <th class="border border-slate-200 px-2 py-1 text-left dark:border-slate-700">#</th>
                      <th class="border border-slate-200 px-2 py-1 text-left dark:border-slate-700">Item</th>
                      <th class="border border-slate-200 px-2 py-1 text-left dark:border-slate-700">Variant</th>
                      <th class="border border-slate-200 px-2 py-1 text-right dark:border-slate-700">Qty</th>
                      <th class="border border-slate-200 px-2 py-1 text-right dark:border-slate-700">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(p,i) in (waybillOrder?.products||[])" :key="i">
                      <td class="border border-slate-200 px-2 py-1 dark:border-slate-700">{{ i+1 }}</td>
                      <td class="border border-slate-200 px-2 py-1 dark:border-slate-700">{{ p.item_name || p.name }}</td>
                      <td class="border border-slate-200 px-2 py-1 dark:border-slate-700">{{ p.size || '-' }}</td>
                      <td class="border border-slate-200 px-2 py-1 text-right dark:border-slate-700">{{ p.quantity ?? p.qty ?? 1 }}</td>
                      <td class="border border-slate-200 px-2 py-1 text-right dark:border-slate-700">{{ money(p.price || 0) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colspan="4" class="border border-slate-200 px-2 py-1 text-right dark:border-slate-700">Total</th>
                      <th class="border border-slate-200 px-2 py-1 text-right dark:border-slate-700">{{ money(total(waybillOrder)) }}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">Generated by HousebibiGoWhere – attach this page to the parcel.</div>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import { auth, db } from '@/firebase/firebase_config'
import {
  collection, query, where, orderBy, onSnapshot,
  doc, updateDoc, serverTimestamp, limit, arrayUnion, Timestamp
} from 'firebase/firestore'

const { success, error: toastError } = useToast()

/* Live orders */
const orders = ref([])
let unsubPrimary = null
let unsubFallback = null

onMounted(() => {
  const stop = auth.onAuthStateChanged(u => {
    unsubPrimary?.(); unsubPrimary = null
    unsubFallback?.(); unsubFallback = null
    orders.value = []
    if (!u) return

    const qPrimary = query(collection(db, 'orders'), where('sellerId', '==', u.uid), orderBy('createdAt','desc'))
    unsubPrimary = onSnapshot(qPrimary, snap => {
      const rows = snap.docs.map(d => ({ id:d.id, ...d.data() }))
      if (rows.length) {
        orders.value = rows
        unsubFallback?.(); unsubFallback = null
      } else {
        if (!unsubFallback) {
          const qFallback = query(collection(db, 'orders'), orderBy('createdAt','desc'), limit(200))
          unsubFallback = onSnapshot(qFallback, s2 => {
            const all = s2.docs.map(d => ({ id:d.id, ...d.data() }))
            orders.value = all.filter(o => Array.isArray(o.products) && o.products.some(p => p?.sellerId === u.uid))
          })
        }
      }
    })

    onBeforeUnmount(() => { unsubPrimary?.(); unsubFallback?.(); stop?.() })
  })
})

/* Status util */
const statusOf = (o) => o?.status || (Array.isArray(o?.statusLog) && o.statusLog.length ? o.statusLog.at(-1).status : 'to_ship')

/* UI state */
const tab = ref('to_process')
const searchQuery = ref('')
const expanded = reactive({})
const openActionsFor = ref(null)

/* NEW: sort mode for To Ship */
const sortMode = ref('created_desc') // created_desc | created_asc | shipby_asc | shipby_desc

const pageSize = 10
const page = ref(1)
const totalPages = computed(() => Math.ceil(sorted.value.length / pageSize))
const paged = computed(() => sorted.value.slice((page.value-1)*pageSize, page.value*pageSize))  
const pageStart = computed(() => sorted.value.length ? (page.value-1)*pageSize+1 : 0) 
const pageEnd = computed(() => Math.min(page.value*pageSize, sorted.value.length)) 
watch([searchQuery, sortMode, tab], () => {  
  page.value = 1
})

/* Rows: base -> filtered (by tab/search) -> sorted (by dropdown) */
const base = computed(() =>
  orders.value
    .filter(o => statusOf(o) === 'to_ship')
    .map(o => ({ ...o, __processed: !!o?.shipping?.arranged }))
)

const counts = computed(() => ({
  to_process: base.value.filter(r => !r.__processed).length,
  processed:  base.value.filter(r =>  r.__processed).length,
}))

const filtered = computed(() => {
  let pool = base.value
  if (tab.value==='to_process') pool = pool.filter(r => !r.__processed)
  if (tab.value==='processed')  pool = pool.filter(r =>  r.__processed)
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return pool
  return pool.filter(r =>
    (r.id || '').toLowerCase().includes(q) ||
    (r.buyer?.name || '').toLowerCase().includes(q) ||
    (r.products?.map(p => p.item_name || p.name).join(' ') || '').toLowerCase().includes(q)
  )
})

/* Helpers for sorting */
const msOf = (ts) => {
  if (!ts) return undefined
  if (typeof ts === 'number') return ts
  if (typeof ts === 'string') return new Date(ts).getTime()
  if (ts?.toDate) return ts.toDate().getTime()
  try { return new Date(ts).getTime() } catch { return undefined }
}

const handlingDaysOf = (o) => o?.shipping?.handlingDays ?? o?.shipping?.dts ?? 2
const createdMs = (o)   => msOf(o?.createdAt) ?? 0
const shipByMs  = (o)   => createdMs(o) + handlingDaysOf(o) * 86400000

const sorted = computed(() => {
  const rows = [...filtered.value]
  switch (sortMode.value) {
    case 'created_asc':
      rows.sort((a,b) => createdMs(a) - createdMs(b)); break
    case 'shipby_asc':
      rows.sort((a,b) => shipByMs(a) - shipByMs(b)); break
    case 'shipby_desc':
      rows.sort((a,b) => shipByMs(b) - shipByMs(a)); break
    case 'created_desc':
    default:
      rows.sort((a,b) => createdMs(b) - createdMs(a)); break
  }
  return rows
})

/* Money & display helpers */
const money = n => '$ ' + (Math.round((n||0)*100)/100).toFixed(2)
const total = o => (o?.products||[]).reduce((s,p)=>s+(p.price||0)*(p.quantity ?? p.qty ?? 1),0)
const titleLine = o => (o.products?.[0]?.item_name || o.products?.[0]?.name || '—')
const thumbnail = o => o.products?.[0]?.img_url || o.products?.[0]?.image || 'https://via.placeholder.com/48x48?text=%20'
function fmtDate(ts) {
  if (!ts) return '—'
  if (typeof ts?.toDate === 'function') {
    return ts.toDate().toLocaleString('en-SG', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
  }
  try {
    return new Date(ts).toLocaleString('en-SG', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
  } catch { return '—' }
}

/* Deadline & countdown (with colors and titles) */
function deadline(o){
  const dts = handlingDaysOf(o)
  const created = o.createdAt?.toDate?.() ?? new Date(o.createdAt || Date.now())
  const deadlineAt = new Date(created.getTime() + dts*86400000)
  const days = Math.ceil((deadlineAt - Date.now())/86400000)
  const overdue = days < 0
  const label = overdue ? `Overdue ${Math.abs(days)}d` : (days===0 ? 'Today' : `To ship in ${days}d`)
  return { label, overdue, deadlineStr: deadlineAt.toLocaleDateString('en-SG') }
}

// Format remaining time as "Xd Yh", "Yh Xm", or "Xm"
function fmtRemain(ms) {
  if (ms <= 0) return 'Overdue';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const toShipCountdownInfo = (o) => {
  const due = shipByMs(o)
  const diff = due - Date.now()
  const overdue = diff < 0
  const within24h = diff > 0 && diff <= 86400000

  const cls = overdue
    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
    : within24h
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'

  const text = overdue ? 'Overdue' : `To ship in ${fmtRemain(diff)}`
  const title = `Ship by ${new Date(due).toLocaleString('en-SG')}`

  return { text, cls, title }
}

/* Expand & actions */
function toggleExpand(id){ expanded[id] = !expanded[id] }
function toggleActions(id){ openActionsFor.value = openActionsFor.value === id ? null : id }

/* Arrange shipment / confirm handover / waybill (unchanged) */
const chooserOpen = ref(false)
const pickupOpen  = ref(false)
const current = ref(null)
const pickup = reactive({ date:'', slot:'9-12', remark:'' })
const minDate = computed(()=>{ const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0] })
const confirmHandoverOpen = ref(false)
const locationsOpen = ref(false)
const confirming = ref(false)
const LOCATIONS = [
  { id: 'hbbx-001', name: 'HouseBiBi Hub @ Ang Mo Kio', address: '71 Ang Mo Kio Rd #01-01, 569971' },
  { id: 'hbbx-002', name: 'HouseBiBi Hub @ Tampines',   address: '9 Tampines Ave 3 #02-12, 529889' },
  { id: 'hbbx-003', name: 'HouseBiBi Hub @ Clementi',   address: '315 Clementi Ave 4 #01-23, 120315' },
]

function openChooser(o){ current.value=o; chooserOpen.value=true; openActionsFor.value=null }
function openPickup(o){ current.value=o; pickupOpen.value=true; openActionsFor.value=null }
function openDropoffLocations(){ locationsOpen.value=true; openActionsFor.value=null }
function closeLocations(){ locationsOpen.value=false }
function openConfirmHandover(o){ current.value=o; confirmHandoverOpen.value = true; openActionsFor.value = null }
function closeConfirmHandover(){ confirmHandoverOpen.value = false; confirming.value = false }
function closeAll(){ chooserOpen.value=false; pickupOpen.value=false; current.value=null; pickup.date=''; pickup.slot='9-12'; pickup.remark='' }

function genTrackingNumber(orderId) {
  const id = (orderId || '').slice(-6).toUpperCase();
  const d  = new Date();
  const y  = d.getFullYear();
  const m  = String(d.getMonth()+1).padStart(2,'0');
  const day= String(d.getDate()).padStart(2,'0');
  const rnd= Math.random().toString(36).slice(-4).toUpperCase();
  return `HBBX-${id}-${y}${m}${day}-${rnd}`;
}
function isPickup(orderLike) {
  const o = orderLike && 'value' in orderLike ? orderLike.value : orderLike
  return (o?.shipping?.method || '') === 'pickup'
}

async function arrangeShipment(order, opts){
  if(!order?.id) throw new Error('Order missing id')
  if(!opts?.method) throw new Error('Missing shipping method')

  const orderRef = doc(db,'orders',order.id)
  const existing  = order.shipping || {}
  const tracking  = order.logistics?.trackingNumber
     || `HBBX-${order.id.slice(-6).toUpperCase()}-${Date.now().toString().slice(-6)}`
  const now = Timestamp.now()
  const timelineSeed = {
    key: 'arranged',
    label: 'Shipment arranged',
    text: opts.method === 'pickup' ? 'Courier pick-up has been requested' : 'Drop-off selected at HouseBiBi Express counter',
    time: now
  }
  const trackingSeed = { time: now, text: opts.method === 'pickup' ? 'Pickup scheduled with HouseBiBi Express' : 'Drop-off method selected' }

  await updateDoc(orderRef, {
    updatedAt: serverTimestamp(),
    shipping: {
      ...existing,
      channel: 'HouseBiBi Express',
      channelCapabilities: ['pickup','dropoff'],
      dts: existing.dts || 2,
      arranged: true,
      method: opts.method,
      pickup:  opts.method === 'pickup' ? { ...(opts.pickup || {}), windowDays: existing.pickup?.windowDays || 1 } : existing.pickup || null,
      dropoff: opts.method === 'dropoff' ? { ...(existing.dropoff || {}), windowDays: existing.dropoff?.windowDays || 3 } : existing.dropoff || null,
      arrangedAt: serverTimestamp(),
      timeline: (order.shipping?.timeline || []).concat([timelineSeed])
    },
    logistics: {
      ...(order.logistics || {}),
      trackingNumber: tracking,
      trackingHistory: (order.logistics?.trackingHistory || []).concat([trackingSeed])
    }
  })

  openWaybillModal(order, opts)
}

async function confirm(method) {
  try {
    if (!current.value) return
    if (method === 'pickup' && !pickup.date) {
      toastError('Please choose a pickup date.')
      return
    }

    await arrangeShipment(current.value, { method, pickup: method === 'pickup' ? { ...pickup } : null })

    success(method === 'pickup' ? 'Pickup scheduled. Waybill prepared…' : 'Drop-off waybill prepared…')
    closeAll()
  } catch (e) {
    console.error(e)
    toastError('Failed to arrange shipment.')
  }
}

async function markHandoverDone(){
  if (!current.value?.id) return
  confirming.value = true
  try {
    const refDoc = doc(db, 'orders', current.value.id)

    const method = current.value?.shipping?.method === 'pickup' ? 'pickup' : 'dropoff'
    const completionField = method === 'pickup'
      ? { 'shipping.pickup.completed': true,  'shipping.pickup.completedAt': serverTimestamp() }
      : { 'shipping.dropoff.completed': true, 'shipping.dropoff.completedAt': serverTimestamp() }

    const existingTrack = current.value?.logistics?.trackingNumber
    const trackNo = existingTrack || genTrackingNumber(current.value.id)
    const handoverText = method === 'pickup' ? 'Parcel picked up by courier' : 'Parcel dropped off at partner counter'
    const handoverLabel = method === 'pickup' ? 'Parcel picked up' : 'Parcel dropped off'

    await updateDoc(refDoc, {
      status: 'to_receive',
      shippedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...completionField,

      statusLog: arrayUnion({ status: 'to_receive', by: 'seller', message: handoverText, time: Timestamp.now() }),
      ['logistics.trackingNumber']: trackNo,
      ['logistics.trackingHistory']: arrayUnion({ time: Timestamp.now(), text: handoverText }),
      ['shipping.timeline']: arrayUnion({ key: 'handover', label: handoverLabel, text: handoverText, time: Timestamp.now() }),
    })

    success(method === 'pickup'
      ? 'Pick-up confirmed. Tracking created. Order moved to To Receive.'
      : 'Drop-off confirmed. Tracking created. Order moved to To Receive.')
    closeConfirmHandover()
  } catch (e) {
    console.error(e)
    toastError('Failed to confirm handover.')
    confirming.value = false
  }
}

function reprintWaybill(order){ openWaybillModal(order || current.value, { method: (order?.shipping?.method || 'dropoff') }) }

/* Waybill modal */
const waybillOpen = ref(false)
const waybillOrder = ref(null)
const waybillOpts = ref(null)
const awb = computed(()=> `HBBX-${(waybillOrder.value?.id||'').slice(-6).toUpperCase()}-${Date.now().toString().slice(-6)}`)
const barcode = computed(()=> awb.value.replace(/./g,'█'))
const shopName = (o)=> o?.seller?.shopName || o?.seller?.name || (o?.products?.[0]?.shopName) || 'Your Shop'
const shipToName = (o)=> o?.shippingAddress?.fullName || o?.buyer?.name || 'Buyer'
const shipToAddr = (o)=> o?.shippingAddress
  ? [o.shippingAddress.streetName, o.shippingAddress.unitNumber?`#${o.shippingAddress.unitNumber}`:'', o.shippingAddress.postalCode].filter(Boolean).join(', ')
  : '—'
function openWaybillModal(order, opts){ waybillOrder.value = order; waybillOpts.value = opts || { method:'dropoff' }; waybillOpen.value = true }
function closeWaybill(){ waybillOpen.value = false }
function printCurrentWaybill(){ window.print() }
</script>

<style>
/* Hide common chat FABs on this page */
.intercom-lightweight-app-launcher,
.tawk-button,
.tidio-chat-root,
.chatbot-fab,
button[aria-label="Chat"],
iframe[src*="tawk.to"],
iframe[src*="intercom"] { display: none !important; }

/* Print only the waybill modal content */
@media print {
  body * { visibility: hidden !important; }
  #waybill-print-area, #waybill-print-area * { visibility: visible !important; }
  #waybill-print-area { position: absolute; inset: 0; margin: 0; padding: 0.5in; background: white; }
}
</style>