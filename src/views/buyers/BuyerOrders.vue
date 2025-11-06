<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <!-- Sidebar (unchanged) -->
    <BuyerSideBar @sidebar-toggle="handleSidebarToggle" />

    <!-- Main content: do not push content on mobile; only push on md+ to match new BuyerSideBar -->
    <main
      class="flex-1 transition-all duration-300 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 min-h-screen"
      :class="isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'"
    >
      <!-- Container with max-width that adjusts based on sidebar state -->
      <div class="w-full mx-auto space-y-8"
           :class="isSidebarCollapsed ? 'md:max-w-[calc(100vw-8rem)]' : 'md:max-w-[calc(100vw-18rem)]'"
      >
        <!-- success banner -->
        <div
          v-if="banner.show"
          class="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
        >
          {{ banner.msg }}
        </div>

        <!-- Title + Search (layout-only tweaks; logic unchanged) -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <!-- Title -->
          <div class="flex flex-col flex-shrink-0">
            <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              My Orders
            </h1>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track, manage and review your purchases
            </p>
          </div>

          <!-- Search -->
          <div class="relative w-full lg:w-96 lg:flex-shrink-0">
            <input
              v-model="queryStr"
              type="text"
              placeholder="Search by product, order #, or shop"
              class="peer w-full rounded-xl border border-slate-300 bg-white px-10 py-2 md:py-2.5 text-sm
                     shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                     dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              aria-label="Search orders"
            />
            <!-- Search icon -->
            <svg
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 peer-focus:text-blue-500 transition-colors"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
            </svg>
            <!-- Loading spinner while typing (optional visual feedback) -->
            <svg
              v-if="loading && queryStr"
              class="absolute right-9 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
            </svg>
            <!-- Clear button -->
            <button
              v-if="queryStr"
              @click="queryStr = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Dropdown for Tabs (new) -->
        <div class="md:hidden">
          <label class="sr-only" for="orders-tab-select">Select order status</label>
          <select
            id="orders-tab-select"
            v-model="active"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700
                   focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none
                   dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e'); background-repeat: no-repeat; background-position: right 0.5rem center; background-size: 1.25em 1.25em; padding-right: 2.25rem;"
          >
            <option
              v-for="t in tabs"
              :key="t.key"
              :value="t.key"
            >
              {{ t.label }}{{ tabCounts[t.key] > 0 ? ` (${tabCounts[t.key]})` : '' }}
            </option>
          </select>
        </div>

        <!-- Tabs (Desktop and Tablet) -->
        <div class="hidden md:block rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
          <div class="grid gap-2"
               :class="isSidebarCollapsed 
                 ? 'md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7' 
                 : 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7'"
          >
            <button
              v-for="t in tabs"
              :key="t.key"
              @click="active = t.key"
              class="flex h-11 items-center justify-center gap-1.5 rounded-xl border transition dark:border-slate-700 min-w-[100px]"
              :class="active === t.key
                       ? 'border-transparent bg-blue-600 text-white'
                       : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200'"
            >
              <span class="text-xs lg:text-sm font-medium truncate px-0.5">{{ t.label }}</span>
              <span
                v-if="tabCounts[t.key] > 0"
                class="rounded-full px-1.5 py-0.5 text-xs font-bold flex-shrink-0"
                :class="active === t.key ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'"
              >
                {{ tabCounts[t.key] }}
              </span>
            </button>
          </div>
        </div>

        <!-- Filter Row (unchanged logic; layout stays responsive) -->
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 md:p-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 flex-shrink-0">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span class="font-medium">Filters:</span>
          </div>

          <div class="flex flex-col md:flex-row items-stretch md:items-center gap-2 flex-wrap">
            <!-- Sort By -->
            <select
              v-model="sortBy"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs lg:text-sm text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto md:min-w-[160px] lg:min-w-[180px]
                     dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="date_desc">Date (Newest First)</option>
              <option value="date_asc">Date (Oldest First)</option>
              <option value="total_desc">Total (Highest First)</option>
              <option value="total_asc">Total (Lowest First)</option>
            </select>

            <!-- Price Range -->
            <select
              v-if="['all', 'to_pay', 'completed'].includes(active)"
              v-model="priceRange"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs lg:text-sm text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto md:min-w-[120px] lg:min-w-[140px]
                     dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Prices</option>
              <option value="0-50">S$0 - S$50</option>
              <option value="50-100">S$50 - S$100</option>
              <option value="100-200">S$100 - S$200</option>
              <option value="200-500">S$200 - S$500</option>
              <option value="500+">S$500+</option>
            </select>

            <!-- Date Range -->
            <select
              v-if="['all', 'completed', 'cancelled', 'return_refund'].includes(active)"
              v-model="dateRange"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs lg:text-sm text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto md:min-w-[110px] lg:min-w-[130px]
                     dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>

            <!-- Shipping Method -->
            <select
              v-if="['all', 'to_ship', 'to_receive', 'completed'].includes(active)"
              v-model="shippingMethod"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs lg:text-sm text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto md:min-w-[120px] lg:min-w-[140px]
                     dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Shipping</option>
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="pickup">Pickup</option>
            </select>

            <!-- Clear Filters Button -->
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs lg:text-sm text-slate-700 hover:bg-slate-50
                     dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700
                     flex items-center justify-center gap-1 whitespace-nowrap w-full md:w-auto"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          </div>
        </div>

        <!-- Loading / Empty -->
        <div v-if="loading" class="flex h-48 items-center justify-center text-slate-500 dark:text-slate-400">
          <svg class="mr-2 h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
          </svg>
          Loading orders…
        </div>

        <div
          v-else-if="visibleOrders.length === 0"
          class="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-800"
        >
          <p class="text-lg font-semibold text-slate-900 dark:text-white">No orders yet</p>
          <p class="mt-1 text-slate-500 dark:text-slate-400">You don't have any orders here.</p>
        </div>

        <!-- Orders List -->
        <div v-else class="space-y-6">
          <article
            v-for="o in pagedOrders"
            :key="o.id"
            class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <!-- Header -->
                        <div
              class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-100 p-4 dark:border-slate-700"
            >
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <span class="text-slate-700 dark:text-slate-200">
                  <span class="font-medium">Order #:</span> {{ o.orderId }}
                </span>
                <span class="hidden md:inline text-slate-300">•</span>
                <span class="text-slate-700 dark:text-slate-200">
                  <span class="font-medium">Shop:</span>
                  <span class="font-semibold">{{ o.products?.[0]?.shopName || '—' }}</span>
                </span>
                <RouterLink
                  class="rounded-lg border border-slate-300 px-2 md:px-3 py-1 text-xs md:text-sm text-slate-700 hover:bg-slate-50
                        dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  :to="`/shop-details/${o.products?.[0]?.sellerId || ''}`"
                >
                  Visit Shop
                </RouterLink>
                <button
                  @click="contactSeller(o)"
                  class="rounded-lg border border-slate-300 bg-white px-3 py-1 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                >
                  Contact Seller
                </button>
              </div>

              <div class="flex items-center gap-3 text-sm">
                <span class="text-slate-500 dark:text-slate-400">Placed: {{ formatDate(o.createdAt) }}</span>
                <span
                  class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                  :class="statusMap[statusOf(o)]?.cls"
                >
                  <span class="h-2 w-2 rounded-full" :class="statusMap[statusOf(o)]?.dot"></span>
                  {{ statusMap[statusOf(o)]?.label || statusOf(o) }}
                </span>
              </div>
            </div>

            <!-- Items -->
            <div class="divide-y divide-slate-100 dark:divide-slate-700">
              <div
                v-for="(it, idx) in o.products || []"
                :key="idx"
                class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 p-4"
              >
                <div class="flex items-start gap-3">
                  <img :src="it.img_url" class="h-16 w-16 rounded-md object-cover" />
                  <div>
                    <RouterLink
                      :to="`/product-details/${it.productId}`"
                      class="font-medium text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition line-clamp-2"
                    >
                      {{ it.item_name }}
                    </RouterLink>

                    <p class="text-sm text-slate-500 dark:text-slate-400">
                      <span v-if="getItemSize(it)">Variation: {{ getItemSize(it) }}</span>
                      <span v-if="getItemSize(it) && (it.quantity ?? 1)"> • </span>
                      Qty: {{ it.quantity ?? 1 }}
                    </p>
                  </div>
                </div>
                <div class="text-left md:text-right">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Item total</p>
                  <p class="text-lg font-semibold text-slate-900 dark:text-white">
                    S${{ ((it.totalPrice ?? it.price * (it.quantity ?? 1)) || 0).toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer: ensure consistent button sizes on mobile and visible text in dark mode -->
            <div
              class="flex flex-col gap-3 border-t border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-700"
            >
              <div class="flex-shrink-0">
                <p class="text-sm text-slate-500 dark:text-slate-400">Order Total</p>
                <p class="text-xl font-bold text-slate-900 dark:text-white">
                  S${{ orderGrand(o).toFixed(2) }}
                </p>
              </div>

              <div class="flex flex-wrap items-stretch gap-2 w-full lg:w-auto lg:justify-end">
                <!-- View Order -->
                <button
                  v-if="['to_pay','to_ship','to_receive','completed'].includes(statusOf(o))"
                  @click="viewOrderDetails(o)"
                  class="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700 whitespace-nowrap shadow-sm"
                >
                  View Order
                </button>

                <!-- View Shipping Details -->
                <button
                  v-if="['to_ship','to_receive','completed'].includes(statusOf(o))"
                  @click="openShippingDetails(o)"
                  class="w-full sm:w-auto rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900 whitespace-nowrap"
                >
                  View Shipping Details
                </button>

                <!-- To Receive -->
                <template v-if="statusOf(o) === 'to_receive'">
                  <button
                    @click="openReceivedConfirm(o)"
                    class="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700 whitespace-nowrap shadow-sm"
                  >
                    Order Received
                  </button>
                </template>

                <!-- Completed -->
                <template v-else-if="statusOf(o) === 'completed'">
                  <button
                    v-if="!hasReview(o)"
                    @click="rateOrder(o)"
                    class="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700 whitespace-nowrap shadow-sm"
                  >
                    Rate
                  </button>
                  <button
                    v-else
                    @click="viewRatings(o)"
                    class="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                  >
                    View Rating
                  </button>
                  <button
                    v-if="!hasReview(o)"
                    @click="openReturnModal(o)"
                    class="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700 whitespace-nowrap shadow-sm"
                  >
                    Request Return/Refund
                  </button>
                </template>

                <!-- To Pay -->
                <template v-else-if="statusOf(o) === 'to_pay'">
                  <button
                    @click="payNow(o)"
                    class="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700 whitespace-nowrap shadow-sm"
                  >
                    Pay Now
                  </button>
                  <button
                    @click="changePayment(o)"
                    class="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                  >
                    Change Payment
                  </button>
                  <button
                    @click="openCancelConfirm(o)"
                    class="w-full sm:w-auto rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950 whitespace-nowrap"
                  >
                    Cancel Order
                  </button>
                </template>

                <!-- To Ship -->
                <template v-else-if="statusOf(o) === 'to_ship'">
                  <button
                    @click="openCancelConfirm(o)"
                    class="w-full sm:w-auto rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950 whitespace-nowrap"
                  >
                    Cancel Order
                  </button>
                </template>

                <!-- Cancelled -->
                <template v-else-if="statusOf(o) === 'cancelled'">
                  <button
                    @click="viewCancelledDetails(o)"
                    class="w-full sm:w-auto rounded-lg bg-slate-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 whitespace-nowrap shadow-sm"
                  >
                    Cancelled Details
                  </button>
                </template>

                <!-- Return/Refund -->
                <template v-else-if="statusOf(o) === 'return_refund'">
                  <button
                    @click="viewReturnDetails(o)"
                    class="w-full sm:w-auto rounded-lg bg-slate-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 whitespace-nowrap shadow-sm"
                  >
                    View Return/Refund Details
                  </button>
                </template>
              </div>
            </div>
          </article>
        </div>

        <!-- Pagination -->
        <div
          v-if="!loading && visibleOrders.length > 0"
          class="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm text-slate-500 dark:text-slate-400"
        >
          <p class="text-center sm:text-left">
            Showing {{ page }} of {{ totalPages || 1 }} –
            <span class="font-medium">{{ pageEnd }}</span> of
            <span class="font-medium">{{ visibleOrders.length }}</span> results
          </p>
          <div class="flex gap-2 w-full sm:w-auto">
            <button
              :disabled="page === 1"
              @click="page--;scrollToTop()"
              class="flex-1 sm:flex-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs md:text-sm text-slate-700
                     disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              Previous
            </button>
            <button
              :disabled="page === totalPages || totalPages === 0"
              @click="page++; scrollToTop()"
              class="flex-1 sm:flex-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs md:text-sm text-slate-700
                     disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- All modals remain the same... -->
      <!-- Cancel Confirm Modal - Fixed Dark Mode -->
  <div
    v-if="showCancelConfirm"
    class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
    @click="showCancelConfirm=false"
  >
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:mx-4 dark:bg-slate-800" @click.stop>
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Cancel this order?</h3>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Are you sure you want to cancel order <span class="font-medium">{{ orderToCancel?.orderId }}</span>?
      </p>
      <div class="mt-5 flex justify-end gap-2">
        <button 
          @click="showCancelConfirm=false" 
          class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          No, keep order
        </button>
        <button 
          @click="confirmCancel" 
          class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Yes, cancel
        </button>
      </div>
    </div>
  </div>


    <!-- Order Received Confirm Modal -->
    <div
      v-if="showReceivedConfirm"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
      @click="showReceivedConfirm=false"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:mx-4 dark:bg-slate-800" @click.stop>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
          Confirm Order Received?
        </h3>

        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          By confirming, you acknowledge the items were received. We'll release payment to the seller now.
          If there's an issue, you can still request a return/refund for your order under the 'Completed' tab.
        </p>

        <div class="mt-4 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
          <div class="flex items-center justify-between">
            <span class="text-slate-600 dark:text-slate-300">Order #</span>
            <span class="font-semibold text-slate-900 dark:text-white">{{ orderToReceive?.orderId }}</span>
          </div>
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button
            @click="showReceivedConfirm=false"
            class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            :disabled="receiveProcessing"
            @click="confirmReceived"
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ receiveProcessing ? 'Confirming…' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Existing modals -->
    <CancelledDetailsModal
      v-if="!!selectedCancelled"
      :visible="true"
      :order="selectedCancelled"
      @close="selectedCancelled = null"
      @open-order="(o)=>{ selectedCancelled=null; selectedOrder=o }"
    />

    <OrderDetailsModal
      v-if="!!selectedOrder"
      :visible="true"
      :order="selectedOrder"
      @close="selectedOrder = null"
      @open-refund="(o)=>{ selectedOrder=null; orderForReturnDetails=o; showReturnDetails=true }"
    />

    <ReturnRequestModal
      v-if="showReturnModal"
      :visible="true"
      :order="orderForReturn"
      @submitted="handleReturnSubmitted"
      @close="showReturnModal=false; orderForReturn=null"
    />

    <ReturnRequestDetailsModal
      v-if="showReturnDetails"
      :visible="true"
      :order="orderForReturnDetails"
      @close="showReturnDetails=false; orderForReturnDetails=null"
      @open-order="openOrderFromRefund"
    />

    <RateOrderModal
      v-if="showRateModal"
      :visible="true"
      :order="orderForRating"
      :mode="editMode"
      :existing-reviews="editExistingReviews"
      @submitted="handleReviewSubmitted"
      @close="closeRateModal"
    />

    <ReviewDetailsModal
      v-if="showReviewDetails"
      :visible="true"
      :order="orderForReviewDetails"
      @close="showReviewDetails=false; orderForReviewDetails=null"
      @edit="editReviewsForOrder"
    />

    <ShippingDetailsModal
      v-if="showShippingDetails"
      :visible="showShippingDetails"
      :order="orderForShipping"
      @close="showShippingDetails = false; orderForShipping = null"
    />

    <!-- Shipping Details Modal -->
    <div
      v-if="shippingModal.show"
      class="fixed inset-0 z-[75] flex items-center justify-center bg-black/40"
      @click="closeShipping"
    >
      <div
        class="w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl sm:mx-4 dark:bg-slate-800"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-xl font-semibold text-slate-900 dark:text-white">Shipping Details</h3>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Order <span class="font-medium">#{{ shippingOrder?.orderId }}</span>
              · Placed {{ formatDate(shippingOrder?.createdAt) }}
            </p>
          </div>
          <button class="rounded-lg border px-3 py-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200" @click="closeShipping">Close</button>
        </div>

        <!-- Progress -->
        <div class="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div v-for="(s, i) in shippingSteps" :key="s.key" class="flex items-center gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                :class="s.done ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'"
                :title="s.timeStr"
              >
                {{ i+1 }}
              </div>
              <div class="min-w-0">
                <div class="text-sm font-medium truncate" :class="s.done ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'">
                  {{ s.label }}
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400">{{ s.timeStr || '—' }}</div>
              </div>
            </div>
          </div>
          <div class="relative mt-4 h-1 rounded bg-slate-200">
            <div class="absolute inset-y-0 left-0 rounded bg-green-600" :style="{ width: progressPct + '%' }"></div>
          </div>
        </div>

        <!-- Body -->
        <div class="mt-6 grid gap-6 md:grid-cols-12">
          <section class="md:col-span-5 space-y-3">
            <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div class="text-sm text-slate-600 dark:text-slate-300">Channel</div>
              <div class="mt-1">
                <span class="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  {{ channel(shippingOrder) }}
                </span>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div class="text-slate-500 dark:text-slate-400">Method</div>
                  <div class="font-medium">{{ (shippingOrder?.shipping?.method || '—').toUpperCase() }}</div>
                </div>
                <div>
                  <div class="text-slate-500 dark:text-slate-400">Tracking No.</div>
                  <div class="font-medium break-all">{{ trackingNo(shippingOrder) || '—' }}</div>
                </div>
              </div>
            </div>

            <div
              v-if="shippingOrder?.shipping?.arranged && statusOf(shippingOrder) === 'to_ship'"
              class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
            >
              The seller has started shipping preparations. For operational reasons,
              cancellations are no longer available at this stage.
              Please contact the seller if you need assistance.
            </div>
          </section>

          <section class="md:col-span-7">
            <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div class="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Tracking Updates</div>
              <ol class="space-y-3 max-h-80 overflow-auto pr-2">
                <li
                  v-for="(e,i) in shippingEvents"
                  :key="i"
                  class="flex items-start gap-3"
                >
                  <div class="mt-1 h-2 w-2 shrink-0 rounded-full" :class="i===0 ? 'bg-green-600' : 'bg-slate-300'"></div>
                  <div class="min-w-0">
                    <div class="text-sm text-slate-900 dark:text-white break-words">
                      {{ e.text }}
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">
                      {{ e.timeStr }}
                    </div>
                  </div>
                </li>
                <li v-if="shippingEvents.length===0" class="text-sm text-slate-500">No carrier events yet.</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <ToastNotification
      v-if="toast.show"
      :show="toast.show"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue'
import ToastNotification from '@/components/ToastNotification.vue'

import { auth, db } from '@/firebase/firebase_config'
import {
  collection, query as fsQuery, where, orderBy, onSnapshot,
  doc, updateDoc, arrayUnion, Timestamp,
  getDocs, getDoc, addDoc, serverTimestamp, limit
} from 'firebase/firestore'

import CancelledDetailsModal from '@/components/orders/CancelledDetailsModal.vue'
import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue'
import ReturnRequestModal from '@/components/orders/ReturnRequestModal.vue'
import ReturnRequestDetailsModal from '@/components/orders/ReturnRequestDetailsModal.vue'
import RateOrderModal from '@/components/orders/RateOrderModal.vue'
import ReviewDetailsModal from '@/components/orders/ReviewDetailsModal.vue'
import ShippingDetailsModal from '@/components/orders/ShippingDetailsModal.vue'

/* UI states */
const banner = ref({ show:false, msg:'' })
const isSidebarCollapsed = ref(false)

function handleSidebarToggle(collapsed) {
  isSidebarCollapsed.value = collapsed
}

const loading = ref(true)
const active = ref('all')
const queryStr = ref('')
const showCancelConfirm = ref(false)
const orderToCancel = ref(null)
const selectedCancelled = ref(null)
const selectedOrder = ref(null)
const showReturnModal = ref(false)
const orderForReturn = ref(null)
const showReturnDetails = ref(false)
const orderForReturnDetails = ref(null)
const orders = ref([])
const productSizesCache = ref({}) // Cache for product sizes: { productId: { sizes: [...], fetched: true } }
const showRateModal = ref(false)
const orderForRating = ref(null)
const reviewedOrders = ref(new Set())
const showReviewDetails = ref(false)
const orderForReviewDetails = ref(null)
const editExistingReviews = ref([])
const editMode = ref('create')
const showShippingDetails = ref(false)
const orderForShipping = ref(null)

/* Toast */
const toast = ref({
  show: false,
  type: 'success',
  title: '',
  message: '',
  duration: 3000
})
function showToast({ type='success', title='', message='', duration=3000 }) {
  toast.value = { show: true, type, title, message, duration }
}

/* Tabs */
const tabs = [
  { key: 'all', label: 'All' },
  { key: 'to_pay', label: 'To Pay' },
  { key: 'to_ship', label: 'To Ship' },
  { key: 'to_receive', label: 'To Receive' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'return_refund', label: 'Return/Refund' }
]

/* Status map */
const statusMap = {
  to_pay:        { label: 'To Pay',        cls: 'bg-blue-50 text-blue-700',   dot: 'bg-blue-600' },
  to_ship:       { label: 'To Ship',       cls: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-600' },
  to_receive:    { label: 'To Receive',    cls: 'bg-sky-50 text-sky-700',     dot: 'bg-sky-600' },
  completed:     { label: 'Delivered',     cls: 'bg-green-50 text-green-700', dot: 'bg-green-600' },
  cancelled:     { label: 'Cancelled',     cls: 'bg-red-50 text-red-700',     dot: 'bg-red-600' },
  return_refund: { label: 'Return/Refund', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-600' }
}

/* Status helpers */
function lastStatusFromLog(o) {
  const log = o?.statusLog || []
  if (!log.length) return null
  return log[log.length - 1]?.status || null
}
function statusOf(o) {
  return o?.status || lastStatusFromLog(o) || 'to_pay'
}

/* Counts */
const tabCounts = computed(() => {
  const c = { all: orders.value.length, to_pay: 0, to_ship: 0, to_receive: 0, completed: 0, cancelled: 0, return_refund: 0 }
  for (const o of orders.value) {
    const s = statusOf(o)
    if (c[s] !== undefined) c[s]++
  }
  return c
})

function openShippingDetails(o) {
  orderForShipping.value = o
  showShippingDetails.value = true
}

/* Filter states */
const sortBy = ref('date_desc')
const priceRange = ref('all')
const dateRange = ref('all')
const shippingMethod = ref('all')

/* Check if any filters are active */
const hasActiveFilters = computed(() => {
  return sortBy.value !== 'date_desc' || 
         priceRange.value !== 'all' || 
         dateRange.value !== 'all' || 
         shippingMethod.value !== 'all'
})

/* Clear all filters */
function clearFilters() {
  sortBy.value = 'date_desc'
  priceRange.value = 'all'
  dateRange.value = 'all'
  shippingMethod.value = 'all'
}

/* Reset filters when tab changes */
watch(active, () => {
  clearFilters()
})

/* Helper to check if order is within date range */
function isWithinDateRange(order) {
  if (dateRange.value === 'all') return true
  
  const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
  const now = new Date()
  const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24))
  
  switch (dateRange.value) {
    case '7days': return diffDays <= 7
    case '30days': return diffDays <= 30
    case '90days': return diffDays <= 90
    case '6months': return diffDays <= 180
    case '1year': return diffDays <= 365
    default: return true
  }
}

/* Helper to check if order is within price range */
function isWithinPriceRange(order) {
  if (priceRange.value === 'all') return true
  
  const total = orderGrand(order)
  
  switch (priceRange.value) {
    case '0-50': return total >= 0 && total <= 50
    case '50-100': return total > 50 && total <= 100
    case '100-200': return total > 100 && total <= 200
    case '200-500': return total > 200 && total <= 500
    case '500+': return total > 500
    default: return true
  }
}

/* Helper to check shipping method */
function matchesShippingMethod(order) {
  if (shippingMethod.value === 'all') return true
  
  const method = (order?.shipping?.method || '').toLowerCase()
  return method === shippingMethod.value.toLowerCase()
}

/* Update visibleOrders to include filtering and sorting */
const visibleOrders = computed(() => {
  const q = queryStr.value.trim().toLowerCase()
  
  // Base filter by tab
  let base = active.value === 'all'
    ? orders.value
    : orders.value.filter(o => statusOf(o) === active.value)
  
  // Apply search filter
  if (q) {
    base = base.filter(o => {
      const hay = [o.orderId, o.products?.[0]?.shopName, ...(o.products || []).map(p => p.item_name)].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }
  
  // Apply price range filter
  base = base.filter(o => isWithinPriceRange(o))
  
  // Apply date range filter
  base = base.filter(o => isWithinDateRange(o))
  
  // Apply shipping method filter
  base = base.filter(o => matchesShippingMethod(o))
  
  // Apply sorting
  const sorted = [...base]
  
  switch (sortBy.value) {
    case 'date_desc':
      sorted.sort((a, b) => {
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : +new Date(a.createdAt || 0)
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : +new Date(b.createdAt || 0)
        return tb - ta
      })
      break
    case 'date_asc':
      sorted.sort((a, b) => {
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : +new Date(a.createdAt || 0)
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : +new Date(b.createdAt || 0)
        return ta - tb
      })
      break
    case 'total_desc':
      sorted.sort((a, b) => orderGrand(b) - orderGrand(a))
      break
    case 'total_asc':
      sorted.sort((a, b) => orderGrand(a) - orderGrand(b))
      break
  }
  
  return sorted
})

/* Reset page when filters change */
watch([sortBy, priceRange, dateRange, shippingMethod], () => {
  page.value = 1
})

const pageSize = 10
const page = ref(1)
const totalPages = computed(() => Math.ceil(visibleOrders.value.length / pageSize))
const pagedOrders = computed(() => visibleOrders.value.slice((page.value-1)*pageSize, page.value*pageSize))
const pageStart = computed(() => visibleOrders.value.length ? (page.value-1)*pageSize+1 : 0)
const pageEnd = computed(() => Math.min(page.value*pageSize, visibleOrders.value.length))

watch([queryStr, active], () => {
  page.value = 1
})

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Use 'auto' for instant scroll, 'smooth' for animated
  })
}

/* subtotal helper if totals missing */
function orderGrand(o) {
  if (o?.totals?.grandTotal != null) return Number(o.totals.grandTotal)
  const sum = (o.products || []).reduce(
    (acc, p) => acc + (p.totalPrice ?? (p.price * (p.quantity ?? 1))),
    0
  )
  return Number(sum.toFixed(2))
}

/* Fetch product sizes from Firestore if not cached */
async function fetchProductSizes(productId) {
  if (productSizesCache.value[productId]?.fetched) {
    return productSizesCache.value[productId].sizes
  }
  
  try {
    const productDoc = await getDoc(doc(db, 'products', productId))
    if (productDoc.exists()) {
      const productData = productDoc.data()
      const sizes = productData.sizes || productData.availableSizes || []
      productSizesCache.value[productId] = { sizes, fetched: true }
      return sizes
    }
  } catch (error) {
    console.error('Error fetching product sizes:', error)
  }
  
  productSizesCache.value[productId] = { sizes: [], fetched: true }
  return []
}

/* Helper to get size/variation from item */
function getItemSize(item) {
  // First try the direct size field
  if (item.size) return item.size
  
  // If size is null but sizeIndex exists, look it up from cache
  if (item.sizeIndex !== null && item.sizeIndex !== undefined && item.productId) {
    const cached = productSizesCache.value[item.productId]
    if (cached?.fetched && cached.sizes?.length > 0) {
      return cached.sizes[item.sizeIndex] || null
    }
    
    // Trigger async fetch (this will update cache and cause re-render)
    fetchProductSizes(item.productId)
    return '...' // Loading indicator
  }
  
  // Fallback to other possible property names
  return item.selectedSize || item.variation || item.variant || null
}

/* Firestore live query (unchanged) */
let unsub = null
onMounted(() => {
  const stop = auth.onAuthStateChanged(async (u) => {
    if (!u) { loading.value = false; return }

    const q = fsQuery(collection(db, 'orders'), where('uid', '==', u.uid), orderBy('createdAt', 'desc'))
    unsub?.()
    unsub = onSnapshot(q, (snap) => {
      orders.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    }, (err) => { console.error('orders onSnapshot error:', err); loading.value = false })

    onSnapshot(
      fsQuery(collection(db, 'reviews'), where('buyerId', '==', u.uid)),
      (snap) => {
        const s = new Set()
        snap.forEach(d => {
          const orderId = d.data().orderId
          if (orderId) s.add(orderId)
        })
        reviewedOrders.value = s
      },
      (err) => console.error('reviews onSnapshot error:', err)
    )
  })
  onBeforeUnmount(() => { stop(); unsub?.() })
})

const hasReview = (o) => reviewedOrders.value.has(o.orderId)
function viewRatings(o) {
  orderForReviewDetails.value = o
  showReviewDetails.value = true
}
async function editReviewsForOrder(order, existing) {
  showReviewDetails.value = false
  orderForRating.value = order
  editExistingReviews.value = existing || []
  editMode.value = 'edit'
  showRateModal.value = true
}

/* Utils */
function formatDate(ts) {
  if (!ts) return '—'
  if (ts.toDate) {
    return ts.toDate().toLocaleString('en-SG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }
  try { return new Date(ts).toLocaleString('en-SG') } catch { return '—' }
}

/* Actions */
function payNow(o) { /* integrate your gateway */ }
function changePayment(o) { /* open change payment UI */ }

function openCancelConfirm(o) {
  // If seller already arranged shipment, do not allow cancel; show info
  if (statusOf(o) === 'to_ship' && o?.shipping?.arranged) {
    showToast({
      type: 'info',
      title: 'Cancellation unavailable',
      message: 'The seller has started shipping with HouseBiBi Express. Once handover begins, cancellation is no longer possible. If there’s an issue, wait for delivery and request a return/refund.',
      duration: 5000
    })
    // (optional) also open shipping details so buyer sees progress:
    orderForShipping.value = o
    showShippingDetails.value = true
    return
  }
  orderToCancel.value = o
  showCancelConfirm.value = true
}

function openReturnModal(o) {
  if (hasReview(o) || statusOf(o) !== 'completed') return
  orderForReturn.value = o
  showReturnModal.value = true
}

async function confirmCancel() {
  if (!orderToCancel.value) return
  const o = orderToCancel.value

  // Double guard
  if (o?.shipping?.arranged) {
    showCancelConfirm.value = false
    showToast({
      type: 'warning',
      title: 'Cannot cancel now',
      message: 'The seller has begun fulfilment and the parcel is queued for dispatch.',
      duration: 3500
    })
    return
  }

  showCancelConfirm.value = false
  await updateDoc(doc(db, 'orders', o.id), {
    status: 'cancelled',
    statusLog: arrayUnion({ status: 'cancelled', by: 'buyer', time: Timestamp.now() })
  })
  orderToCancel.value = null
}

async function markReceived(o) {
  try {
    await updateDoc(doc(db, 'orders', o.id), {
      status: 'completed',
      statusLog: arrayUnion({ status: 'completed', by: 'buyer', time: Timestamp.now() })
    })
  } catch (err) {
    console.error('markReceived failed:', err)
    throw err
  }
}

function rateOrder(o) {
  orderForRating.value = o
  showRateModal.value = true
}

function closeRateModal() {
  showRateModal.value = false
  orderForRating.value = null
  editExistingReviews.value = []
  editMode.value = 'create'
}
function handleReviewSubmitted() {
  showToast({
    type: 'success',
    title: 'Review submitted',
    message: 'Thanks for rating your order!',
    duration: 2500
  })
}
function handleReturnSubmitted(evt) {
  showReturnModal.value = false
  orderForReturn.value = null
  if (evt?.orderId) {
    const idx = orders.value.findIndex(o => o.orderId === evt.orderId)
    if (idx !== -1) orders.value[idx].status = 'return_refund'
  }
  showToast({
    type: 'success',
    title: 'Return/Refund submitted',
    message: 'Your request has been sent.',
    duration: 3000
  })
}

function viewCancelledDetails(o) { selectedCancelled.value = o }
function viewOrderDetails(o)      { selectedOrder.value = o }
function viewReturnDetails(o) {
  orderForReturnDetails.value = o
  showReturnDetails.value = true
}

function openOrderFromRefund(o) {
  showReturnDetails.value = false
  orderForReturnDetails.value = null
  selectedOrder.value = o
}

async function contactSeller(o) {
  try {
    const buyerUid  = auth.currentUser?.uid
    const sellerUid = o?.products?.[0]?.sellerId
    if (!buyerUid || !sellerUid) return

    const snap = await getDocs(
      fsQuery(collection(db, 'conversations'), where('participants', 'array-contains', buyerUid), limit(50))
    )
    let conversationId = null
    snap.forEach(d => {
      const parts = d.data()?.participants || []
      if (parts.includes(sellerUid)) conversationId = d.id
    })

    if (!conversationId) {
      const ref = await addDoc(collection(db, 'conversations'), {
        participants: [buyerUid, sellerUid],
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageSenderId: '',
        lastMessageTime: serverTimestamp(),
        [`unreadCount_${buyerUid}`]: 0,
        [`unreadCount_${sellerUid}`]: 0
      })
      conversationId = ref.id
    }

    window.location.href = `/buyer-messages?conversation=${conversationId}`
  } catch (err) {
    console.error('contactSeller failed:', err)
  }
}

/* Received flow */
const showReceivedConfirm = ref(false)
const orderToReceive = ref(null)
const receiveProcessing = ref(false)
function openReceivedConfirm(o) {
  orderToReceive.value = o
  showReceivedConfirm.value = true
}
async function confirmReceived() {
  if (!orderToReceive.value) return
  receiveProcessing.value = true
  try {
    await markReceived(orderToReceive.value)
    showToast({
      type: 'success',
      title: 'Marked as received',
      message: 'Thanks! The order has been marked as received.',
      duration: 2500
    })
    showReceivedConfirm.value = false
    orderToReceive.value = null
  } catch (err) {
    showToast({
      type: 'error',
      title: 'Action failed',
      message: err?.message || 'We could not mark this order as received.',
      duration: 4000
    })
    console.error('confirmReceived failed:', err)
  } finally {
    receiveProcessing.value = false
  }
}

/* -------------------- Shipping modal builders -------------------- */
const shippingModal = ref({ show: false })
const shippingOrder = ref(null)
const shippingSteps = ref([])
const shippingEvents = ref([])
const progressPct = ref(0)

function channel(o) {
  return o?.shipping?.channel || o?.logistics?.shipper || 'HouseBiBi Express'
}
function trackingNo(o) {
  return o?.totals?.trackingNumber || o?.logistics?.trackingNumber || o?.trackingNumber || ''
}
function tsToDate(ts) {
  if (!ts) return null
  if (typeof ts?.toDate === 'function') return ts.toDate()
  try { return new Date(ts) } catch { return null }
}
function fmt(ts) {
  const d = tsToDate(ts)
  return d ? d.toLocaleString('en-SG', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : ''
}

function buildShippingView(o) {
  const placedAt    = o?.createdAt || null
  const preparingAt =
    o?.shipping?.arrangedAt ||
    (o?.statusLog || []).find(x => x.status === 'to_ship')?.time ||
    null
  const inTransitAt =
    o?.shippedAt ||
    o?.shipping?.dropoff?.completedAt ||
    o?.shipping?.pickup?.completedAt ||
    (o?.statusLog || []).find(x => x.status === 'to_receive')?.time ||
    null
  const deliveredAt =
    (o?.statusLog || []).find(x => x.status === 'completed')?.time || null

  const stepList = [
    { key: 'placed',    label: 'Order Placed',       time: placedAt },
    { key: 'preparing', label: 'Preparing to Ship',  time: preparingAt },
    { key: 'transit',   label: 'In Transit',         time: inTransitAt },
    { key: 'delivered', label: 'Delivered',          time: deliveredAt }
  ]

  shippingSteps.value = stepList.map(s => ({
    ...s,
    done: !!s.time,
    timeStr: fmt(s.time)
  }))

  const doneCount = shippingSteps.value.filter(s => s.done).length
  progressPct.value = Math.min(
    100,
    Math.max(0, (doneCount - 1) / (shippingSteps.value.length - 1) * 100)
  )

  const ev = []

  if (Array.isArray(o?.shipping?.timeline) && o.shipping.timeline.length) {
    for (const t of [...o.shipping.timeline]
      .sort((a, b) => tsToDate(b.time) - tsToDate(a.time))) {
      ev.push({
        time: t.time,
        timeStr: fmt(t.time),
        title: t.label || t.key || 'Shipment update',
        text:  t.text  || t.label  || t.key,
        subtitle: t.text && t.label ? t.text : ''
      })
    }
  }

  if (Array.isArray(o?.logistics?.trackingHistory) && o.logistics.trackingHistory.length) {
    for (const h of [...o.logistics.trackingHistory]
      .sort((a, b) => tsToDate(b.time) - tsToDate(a.time))) {
      ev.push({
        time: h.time,
        timeStr: fmt(h.time),
        title: h.title || h.text || 'Tracking update',
        text:  h.text  || '',
        subtitle: h.subtitle || ''
      })
    }
  }

  if (placedAt) {
    ev.push({
      time: placedAt,
      timeStr: fmt(placedAt),
      title: 'Order placed',
      text:  'Order placed'
    })
  }
  if (preparingAt) {
    ev.push({
      time: preparingAt,
      timeStr: fmt(preparingAt),
      title: 'Seller is preparing to ship',
      text:  'Seller is preparing to pack your order'
    })
  }

  if (ev.length === 0 && Array.isArray(o?.statusLog)) {
    for (const s of [...o.statusLog].reverse()) {
      const label =
        s.status === 'to_ship'    ? 'Seller is preparing to ship'
      : s.status === 'to_receive' ? 'Parcel handed to courier'
      : s.status === 'completed'  ? 'Delivered to buyer'
      : s.status === 'cancelled'  ? 'Order cancelled'
      : `Status: ${s.status}`

      ev.push({
        time: s.time,
        timeStr: fmt(s.time),
        title: label,
        text:  ''
      })
    }
  }

  const seen = new Set();
  const rank = (title = '') => {
    const t = title.toLowerCase();
    if (t.startsWith('order placed')) return 1;
    if (t.startsWith('seller is preparing')) return 2;
    return 3;
  };

  shippingEvents.value = ev
    .filter(e => e.time)
    .sort((a, b) => {
      const da = tsToDate(a.time)?.getTime() ?? 0;
      const db = tsToDate(b.time)?.getTime() ?? 0;
      if (da !== db) return da - db;      // ASC
      return rank(a.title) - rank(b.title); // tie-breaker
    })
    .filter(e => {
      const key = `${e.title}|${fmt(e.time)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function openShipping(o) {
  shippingOrder.value = o
  buildShippingView(o)
  shippingModal.value.show = true
}
function closeShipping() {
  shippingModal.value.show = false
  shippingOrder.value = null
}
</script>

<style scoped>
article:hover {
  transform: translateY(-1px);
  transition: box-shadow .2s, transform .2s;
}
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb {
  background-color: rgba(100,116,139,0.3);
  border-radius: 8px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100,116,139,0.5);
}
</style>