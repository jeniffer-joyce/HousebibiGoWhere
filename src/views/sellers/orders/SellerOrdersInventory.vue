<!-- src/views/sellers/orders/SellerOrdersInventory.vue -->
<template>
  <section class="space-y-4">
    <!-- Header -->
    <header class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Inventory</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Manage your products, track stock levels, and update pricing.
        </p>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <!-- Search -->
        <div class="relative flex-1 sm:flex-initial">
          <input
            v-model="searchStr"
            type="text"
            class="w-full sm:w-72 rounded-md border border-slate-300 px-3 py-2 text-sm
                   bg-white text-slate-800 placeholder:text-slate-400
                   dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
            placeholder="Search Product Name or Item ID"
          />
          <svg class="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
          </svg>
        </div>

        <!-- Sort -->
        <select
          v-model="sortMode"
          class="w-full sm:w-auto rounded-md border border-slate-300 bg-white px-3 py-2 text-sm
                 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          title="Sort products"
        >
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="stock_low">Stock (Low to High)</option>
          <option value="stock_high">Stock (High to Low)</option>
          <option value="price_low">Price (Low to High)</option>
          <option value="price_high">Price (High to Low)</option>
        </select>
      </div>
    </header>

    <!-- Table -->
    <div class="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <!-- Header row (desktop only) -->
      <div
        class="hidden lg:grid grid-cols-12 gap-3 border-b px-4 py-3 text-sm font-semibold
               text-slate-700 dark:text-slate-200
               bg-slate-50 dark:bg-slate-800/60
               border-slate-200 dark:border-slate-700
               rounded-t-2xl">
        <div class="col-span-5">Product(s)</div>
        <div class="col-span-1">Total Sales</div>
        <div class="col-span-1">Variants</div>
        <div class="col-span-2">Price</div>
        <div class="col-span-2">Stock</div>
        <div class="col-span-1">Action</div>
      </div>

      <!-- Empty / Loading -->
      <div v-if="loading" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading products…</div>
      <div v-else-if="sortedRows.length===0" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No products found</div>

      <!-- Rows -->
      <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
        <div
          v-for="p in sortedRows" :key="p.id"
          class="px-4 py-4"
        >
          <!-- Mobile Layout -->
          <div class="lg:hidden space-y-4">
            <!-- Product Info -->
            <div class="flex gap-3">
              <img :src="p.img_url || p.thumbnail || 'https://via.placeholder.com/48x48?text=%20'" alt="" class="h-12 w-12 flex-shrink-0 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
              <div class="min-w-0 flex-1">
                <div class="font-medium whitespace-normal break-words leading-tight text-slate-900 dark:text-white">
                  {{ p.item_name || '—' }}
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  Item ID: {{ p.id }}
                </div>
              </div>
            </div>

            <!-- Stats Grid (Mobile) -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Sales</div>
                <div class="text-sm font-semibold text-slate-900 dark:text-white">{{ p.totalSales || 0 }}</div>
              </div>
              <div>
                <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">Variants</div>
                <div class="text-sm font-semibold text-slate-900 dark:text-white">{{ p.variantCount }}</div>
              </div>
              <div>
                <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">Price</div>
                <div class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatPrice(p) }}</div>
              </div>
              <div>
                <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">Stock</div>
                <div class="text-sm font-semibold" :class="stockStatusText(p).color">
                  {{ stockStatusText(p).label }}
                </div>
              </div>
            </div>

            <!-- Actions (Mobile) -->
            <div class="flex gap-2">
              <button
                class="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 transition"
                @click="openStockUpModal(p)"
              >
                Stock Up
              </button>
              <button
                class="flex-1 rounded-md border px-3 py-1.5 text-sm transition
                       border-slate-300 text-slate-700 hover:bg-slate-50
                       dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                @click="openMoreMenu(p, $event)"
              >
                More
              </button>
            </div>
          </div>

          <!-- Desktop Layout -->
          <div class="hidden lg:grid grid-cols-12 gap-3">
            <!-- Product(s) -->
            <div class="col-span-5">
              <div class="flex gap-3">
                <img :src="p.img_url || p.thumbnail || 'https://via.placeholder.com/48x48?text=%20'" alt="" class="h-12 w-12 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                <div class="min-w-0">
                  <div class="font-medium whitespace-normal break-words leading-tight text-slate-900 dark:text-white">
                    {{ p.item_name || '—' }}
                  </div>
                  <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Item ID: {{ p.id }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Total Sales -->
            <div class="col-span-1 text-sm font-semibold text-slate-900 dark:text-white">
              {{ p.totalSales || 0 }}
            </div>

            <!-- Variants -->
            <div class="col-span-1 text-sm font-semibold text-slate-900 dark:text-white">
              {{ p.variantCount }}
            </div>

            <!-- Price -->
            <div class="col-span-2 self-start">
              <span class="inline-block text-sm font-semibold text-slate-900 dark:text-white">
                {{ formatPrice(p) }}
              </span>
            </div>

            <!-- Stock -->
            <div class="col-span-2 self-start">
              <span class="text-sm font-semibold" :class="stockStatusText(p).color">
                {{ stockStatusText(p).label }}
              </span>
            </div>

            <!-- Actions -->
            <div class="col-span-1 self-start">
              <div class="flex flex-col items-stretch gap-2 w-full">
                <button
                  class="w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 transition"
                  @click="openStockUpModal(p)"
                >
                  Stock Up
                </button>

                <button
                  class="w-full rounded-md border px-3 py-1.5 text-sm transition
                         border-slate-300 text-slate-700 hover:bg-slate-50
                         dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  @click="openMoreMenu(p, $event)"
                >
                  More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- More Actions Dropdown Menu -->
    <Teleport to="body">
      <div
        v-if="showMoreMenu"
        class="fixed inset-0 z-40"
        @click="closeMoreMenu"
      ></div>
      <div
        v-if="showMoreMenu"
        class="fixed z-50 w-56 rounded-lg border bg-white shadow-lg
               dark:border-slate-700 dark:bg-slate-800"
        :style="{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }"
      >
        <div class="py-1">
          <button
            class="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                   text-slate-700 dark:text-slate-200 flex items-center gap-2"
            @click="openReduceStockModal"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
            Reduce Stock
          </button>
          
          <button
            class="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                   text-slate-700 dark:text-slate-200 flex items-center gap-2"
            @click="openPriceEditModal"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Edit Price
          </button>
          
          <button
            class="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                   text-slate-700 dark:text-slate-200 flex items-center gap-2"
            @click="openVariantModal"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Manage Variants
          </button>
          
          <hr class="my-1 border-slate-200 dark:border-slate-700" />
          
          <button
            class="w-full px-4 py-2 text-left text-sm hover:bg-rose-50 dark:hover:bg-rose-900/20
                   text-rose-700 dark:text-rose-400 flex items-center gap-2"
            @click="confirmDelete"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Product
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Stock Up Modal -->
    <Teleport to="body">
      <div
        v-if="showStockUpModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeStockUpModal"
      >
        <div class="w-full max-w-lg rounded-xl bg-white dark:bg-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Stock Up Inventory</h3>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ selectedProduct?.item_name }}</p>
          </div>

          <div class="px-6 py-4 space-y-4">
            <div v-if="!isMultiVariant" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Stock</label>
                <input type="text" :value="getCurrentStock()" disabled
                  class="w-full rounded-md border border-slate-300 dark:border-slate-600 
                         bg-slate-100 dark:bg-slate-700 px-3 py-2 text-sm text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Add Quantity</label>
                <input v-model.number="stockAdjustment" type="number" min="0"
                  class="w-full rounded-md border border-slate-300 dark:border-slate-600 
                         bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  placeholder="Enter quantity to add" />
              </div>
              <div class="rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
                <p class="text-sm text-blue-700 dark:text-blue-300">
                  New stock will be: <strong>{{ getCurrentStock() + (stockAdjustment || 0) }}</strong>
                </p>
              </div>
            </div>

            <div v-else class="space-y-3">
              <div v-for="(variant, idx) in variantAdjustments" :key="idx" 
                   class="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-slate-900 dark:text-white">
                    {{ variant.size || `Option ${idx + 1}` }}
                  </span>
                  <span class="text-xs text-slate-500 dark:text-slate-400">Current: {{ variant.currentStock }}</span>
                </div>
                <div class="flex gap-2">
                  <input v-model.number="variant.adjustment" type="number" min="0"
                    class="flex-1 rounded-md border border-slate-300 dark:border-slate-600 
                           bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                    placeholder="Add quantity" />
                  <div class="flex items-center px-3 text-sm text-slate-600 dark:text-slate-400">
                    → {{ variant.currentStock + (variant.adjustment || 0) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3">
            <button @click="closeStockUpModal"
              class="flex-1 rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm
                     text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              Cancel
            </button>
            <button @click="saveStockAdjustment" :disabled="saving"
              class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Reduce Stock Modal -->
    <Teleport to="body">
      <div
        v-if="showReduceStockModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeReduceStockModal"
      >
        <div class="w-full max-w-lg rounded-xl bg-white dark:bg-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Reduce Stock</h3>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ selectedProduct?.item_name }}</p>
          </div>

          <div class="px-6 py-4 space-y-4">
            <div v-if="!isMultiVariant" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Stock</label>
                <input type="text" :value="getCurrentStock()" disabled
                  class="w-full rounded-md border border-slate-300 dark:border-slate-600 
                         bg-slate-100 dark:bg-slate-700 px-3 py-2 text-sm text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reduce By</label>
                <input v-model.number="stockReduction" type="number" min="0" :max="getCurrentStock()"
                  class="w-full rounded-md border border-slate-300 dark:border-slate-600 
                         bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  placeholder="Enter quantity to reduce" />
              </div>
              <div class="rounded-lg bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
                <p class="text-sm text-amber-700 dark:text-amber-300">
                  New stock will be: <strong>{{ Math.max(0, getCurrentStock() - (stockReduction || 0)) }}</strong>
                </p>
              </div>
            </div>

            <div v-else class="space-y-3">
              <div v-for="(variant, idx) in variantReductions" :key="idx" 
                   class="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-slate-900 dark:text-white">
                    {{ variant.size || `Option ${idx + 1}` }}
                  </span>
                  <span class="text-xs text-slate-500 dark:text-slate-400">Current: {{ variant.currentStock }}</span>
                </div>
                <div class="flex gap-2">
                  <input v-model.number="variant.reduction" type="number" min="0" :max="variant.currentStock"
                    class="flex-1 rounded-md border border-slate-300 dark:border-slate-600 
                           bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                    placeholder="Reduce by" />
                  <div class="flex items-center px-3 text-sm text-slate-600 dark:text-slate-400">
                    → {{ Math.max(0, variant.currentStock - (variant.reduction || 0)) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3">
            <button @click="closeReduceStockModal"
              class="flex-1 rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm
                     text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              Cancel
            </button>
            <button @click="saveStockReduction" :disabled="saving"
              class="flex-1 rounded-md bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 transition">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Price Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showPriceEditModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closePriceEditModal"
      >
        <div class="w-full max-w-lg rounded-xl bg-white dark:bg-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Edit Price</h3>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ selectedProduct?.item_name }}</p>
          </div>

          <div class="px-6 py-4 space-y-4">
            <div v-if="!isMultiVariant" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Price (S$)
                </label>
                <input v-model.number="priceEdit" type="number" min="0" step="0.01"
                  class="w-full rounded-md border border-slate-300 dark:border-slate-600 
                         bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  placeholder="Enter new price" />
              </div>
            </div>

            <div v-else class="space-y-3">
              <div v-for="(variant, idx) in variantPrices" :key="idx" 
                   class="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div class="mb-2">
                  <label class="text-sm font-medium text-slate-900 dark:text-white">
                    {{ variant.size || `Option ${idx + 1}` }}
                  </label>
                </div>
                <input v-model.number="variant.price" type="number" min="0" step="0.01"
                  class="w-full rounded-md border border-slate-300 dark:border-slate-600 
                         bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  placeholder="Price (S$)" />
              </div>
            </div>
          </div>

          <div class="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3">
            <button @click="closePriceEditModal"
              class="flex-1 rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm
                     text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              Cancel
            </button>
            <button @click="savePriceEdit" :disabled="saving"
              class="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 transition">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Variant Management Modal -->
    <Teleport to="body">
      <div
        v-if="showVariantModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeVariantModal"
      >
        <div class="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Manage Variants</h3>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ selectedProduct?.item_name }}</p>
          </div>

          <div class="px-6 py-4 space-y-4">
            <!-- Existing Variants -->
            <div v-if="variantEdits.length > 0" class="space-y-3">
              <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Existing Variants</h4>
              <div v-for="(variant, idx) in variantEdits" :key="idx" 
                   class="p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex gap-3 items-start">
                <div class="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Name</label>
                    <input v-model="variant.size" type="text"
                      class="w-full rounded-md border border-slate-300 dark:border-slate-600 
                             bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100"
                      placeholder="e.g., Small" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Price (S$)</label>
                    <input v-model.number="variant.price" type="number" min="0" step="0.01"
                      class="w-full rounded-md border border-slate-300 dark:border-slate-600 
                             bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100"
                      placeholder="0.00" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Stock</label>
                    <input v-model.number="variant.quantity" type="number" min="0"
                      class="w-full rounded-md border border-slate-300 dark:border-slate-600 
                             bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100"
                      placeholder="0" />
                  </div>
                </div>
                <button @click="removeVariant(idx)"
                  class="mt-6 p-1.5 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Add New Variant -->
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Add New Variant</h4>
              <div class="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Name</label>
                    <input v-model="newVariant.size" type="text"
                      class="w-full rounded-md border border-slate-300 dark:border-slate-600 
                             bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100"
                      placeholder="e.g., Large" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Price (S$)</label>
                    <input v-model.number="newVariant.price" type="number" min="0" step="0.01"
                      class="w-full rounded-md border border-slate-300 dark:border-slate-600 
                             bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100"
                      placeholder="0.00" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Stock</label>
                    <input v-model.number="newVariant.quantity" type="number" min="0"
                      class="w-full rounded-md border border-slate-300 dark:border-slate-600 
                             bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100"
                      placeholder="0" />
                  </div>
                </div>
                <button @click="addVariant"
                  class="mt-3 w-full rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600 
                         px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:border-blue-400 
                         hover:text-blue-600 dark:hover:text-blue-400 transition">
                  + Add Variant
                </button>
              </div>
            </div>

            <div class="rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
              <p class="text-xs text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Changes to variants will update your product structure. Make sure all variant names, prices, and stock levels are correct before saving.
              </p>
            </div>
          </div>

          <div class="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3">
            <button @click="closeVariantModal"
              class="flex-1 rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm
                     text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              Cancel
            </button>
            <button @click="saveVariants" :disabled="saving"
              class="flex-1 rounded-md bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 transition">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="cancelDelete"
      >
        <div class="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 shadow-xl">
          <div class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
                <svg class="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Delete Product</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">This action cannot be undone</p>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-y border-slate-200 dark:border-slate-700">
            <p class="text-sm text-slate-700 dark:text-slate-300">
              Are you sure you want to delete <strong class="font-semibold">{{ productToDelete?.item_name }}</strong>?
              This will permanently remove the product from your inventory.
            </p>
            
            <div v-if="productToDelete" class="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
              <div class="flex gap-3">
                <img 
                  :src="productToDelete.img_url || productToDelete.thumbnail || 'https://via.placeholder.com/48x48?text=%20'" 
                  alt="" 
                  class="h-12 w-12 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" 
                />
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium text-slate-900 dark:text-white">
                    {{ productToDelete.item_name }}
                  </div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">
                    Stock: {{ productToDelete.totalStock }} | Sales: {{ productToDelete.totalSales || 0 }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 flex gap-3">
            <button @click="cancelDelete" :disabled="deleting"
              class="flex-1 rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm
                     text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              Cancel
            </button>
            <button @click="executeDelete" :disabled="deleting"
              class="flex-1 rounded-md bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700 transition">
              {{ deleting ? 'Deleting...' : 'Delete Product' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { 
  getSellerProducts, 
  updateMyProduct,
  deleteMyProduct,
  initInventoryAuthBridge 
} from '@/firebase/services/sellers/seller_product'

const { success, error: toastError } = useToast()

/* ---------------- State ---------------- */
const loading = ref(true)
const allProducts = ref([])
const searchStr = ref('')
const sortMode = ref('name_asc')

// More Menu State
const showMoreMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const selectedProduct = ref(null)

// Stock Up Modal State
const showStockUpModal = ref(false)
const stockAdjustment = ref(0)
const variantAdjustments = ref([])

// Reduce Stock Modal State
const showReduceStockModal = ref(false)
const stockReduction = ref(0)
const variantReductions = ref([])

// Price Edit Modal State
const showPriceEditModal = ref(false)
const priceEdit = ref(0)
const variantPrices = ref([])

// Variant Management Modal State
const showVariantModal = ref(false)
const variantEdits = ref([])
const newVariant = ref({ size: '', price: 0, quantity: 0 })

// Delete Modal State
const showDeleteModal = ref(false)
const productToDelete = ref(null)

// Saving state
const saving = ref(false)
const deleting = ref(false)

/* ---------------- Inventory Watcher ---------------- */
let inventoryUnsubscribe = null
let refreshInterval = null

onMounted(async () => {
  try {
    // ⭐ Initialize inventory watcher (single instance)
    inventoryUnsubscribe = initInventoryAuthBridge()
    
    // Load initial products
    await loadProducts()
  } catch (err) {
    console.error('Failed to initialize inventory:', err)
    toastError('Failed to load inventory')
  } finally {
    loading.value = false
  }

  // ⭐ Refresh products every 10 seconds to reflect inventory changes
  refreshInterval = setInterval(() => {
    loadProducts()
  }, 10000)
})

onUnmounted(() => {
  // Clean up refresh interval
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
  
  // Clean up inventory watcher
  if (inventoryUnsubscribe) {
    try {
      inventoryUnsubscribe()
    } catch (e) {
      console.warn('Error unsubscribing inventory watcher:', e)
    }
    inventoryUnsubscribe = null
  }
})

/* ---------------- Data Loading ---------------- */
async function loadProducts() {
  try {
    const products = await getSellerProducts()
    
    allProducts.value = products.map(p => {
      const isMulti = Array.isArray(p.size) && p.size.length > 0
      
      return {
        ...p,
        isMultiVariant: isMulti,
        variantCount: isMulti ? p.size.length : 1,
        totalStock: isMulti 
          ? (p.quantity || []).reduce((sum, q) => sum + (Number(q) || 0), 0)
          : (Number(p.quantity) || 0),
        totalSales: Number(p.totalSales) || 0
      }
    })
    
    // Only log during initial load to avoid spam
    if (loading.value) {
      console.log(`[Inventory UI] Loaded ${products.length} products`)
    }
  } catch (err) {
    console.error('Failed to load products:', err)
    if (loading.value) {
      toastError('Failed to load products')
    }
  }
}

/* ---------------- Display Helpers ---------------- */
const formatPrice = (p) => {
  if (!p) return 'S$0.00'
  
  if (Array.isArray(p.price) && p.price.length > 0) {
    const prices = p.price.filter(pr => pr != null).map(pr => Number(pr) || 0)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    
    if (min === max) {
      return `S${min.toFixed(2)}`
    }
    return `S${min.toFixed(2)} - S${max.toFixed(2)}`
  }
  
  const price = Number(p.price) || 0
  return `S${price.toFixed(2)}`
}

const stockStatusText = (p) => {
  const stock = p.totalStock || 0
  
  if (stock === 0) {
    return {
      label: 'No Stock',
      color: 'text-rose-700 dark:text-rose-400'
    }
  }
  
  if (stock < 10) {
    return {
      label: `${stock}`,
      color: 'text-amber-700 dark:text-amber-400'
    }
  }
  
  return {
    label: `${stock}`,
    color: 'text-emerald-700 dark:text-emerald-400'
  }
}

/* ---------------- Search + Sort ---------------- */
const filteredRows = computed(() => {
  const q = searchStr.value.trim().toLowerCase()
  if (!q) return allProducts.value
  
  return allProducts.value.filter(p => {
    const hay = [
      p.item_name,
      p.id
    ].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

const sortedRows = computed(() => {
  const rows = [...filteredRows.value]
  const mode = sortMode.value
  
  if (mode === 'name_asc') {
    rows.sort((a,b) => (a.item_name || '').localeCompare(b.item_name || ''))
  } else if (mode === 'name_desc') {
    rows.sort((a,b) => (b.item_name || '').localeCompare(a.item_name || ''))
  } else if (mode === 'stock_low') {
    rows.sort((a,b) => (a.totalStock || 0) - (b.totalStock || 0))
  } else if (mode === 'stock_high') {
    rows.sort((a,b) => (b.totalStock || 0) - (a.totalStock || 0))
  } else if (mode === 'price_low') {
    const getMinPrice = p => {
      if (Array.isArray(p.price)) return Math.min(...p.price.map(pr => Number(pr) || 0))
      return Number(p.price) || 0
    }
    rows.sort((a,b) => getMinPrice(a) - getMinPrice(b))
  } else if (mode === 'price_high') {
    const getMaxPrice = p => {
      if (Array.isArray(p.price)) return Math.max(...p.price.map(pr => Number(pr) || 0))
      return Number(p.price) || 0
    }
    rows.sort((a,b) => getMaxPrice(b) - getMaxPrice(a))
  }
  
  return rows
})

/* ---------------- More Menu ---------------- */
function openMoreMenu(product, event) {
  selectedProduct.value = product
  
  const rect = event.target.getBoundingClientRect()
  const menuWidth = 224
  const menuHeight = 250
  
  let x = rect.right + 8
  let y = rect.top
  
  if (x + menuWidth > window.innerWidth) {
    x = rect.left - menuWidth - 8
  }
  
  if (y + menuHeight > window.innerHeight) {
    y = window.innerHeight - menuHeight - 16
  }
  
  menuPosition.value = { x, y }
  showMoreMenu.value = true
}

function closeMoreMenu() {
  showMoreMenu.value = false
}

/* ---------------- Stock Up Modal ---------------- */
const isMultiVariant = computed(() => {
  return selectedProduct.value?.isMultiVariant || false
})

function openStockUpModal(product) {
  closeMoreMenu()
  selectedProduct.value = product
  stockAdjustment.value = 0
  
  if (product.isMultiVariant) {
    variantAdjustments.value = (product.size || []).map((size, idx) => ({
      size,
      currentStock: (product.quantity || [])[idx] || 0,
      adjustment: 0
    }))
  }
  
  showStockUpModal.value = true
}

function closeStockUpModal() {
  showStockUpModal.value = false
  selectedProduct.value = null
  stockAdjustment.value = 0
  variantAdjustments.value = []
}

function getCurrentStock() {
  if (!selectedProduct.value) return 0
  return Number(selectedProduct.value.quantity) || 0
}

async function saveStockAdjustment() {
  if (!selectedProduct.value) return
  
  saving.value = true
  
  try {
    const productId = selectedProduct.value.id
    
    if (isMultiVariant.value) {
      const newQuantities = variantAdjustments.value.map(v => 
        v.currentStock + (v.adjustment || 0)
      )
      
      await updateMyProduct(productId, {
        quantity: newQuantities
      })
      
      success('Stock updated successfully!')
    } else {
      const newStock = getCurrentStock() + (stockAdjustment.value || 0)
      
      await updateMyProduct(productId, {
        quantity: newStock
      })
      
      success('Stock updated successfully!')
    }
    
    await loadProducts()
    closeStockUpModal()
    
  } catch (err) {
    console.error('Failed to update stock:', err)
    toastError('Failed to update stock: ' + err.message)
  } finally {
    saving.value = false
  }
}

/* ---------------- Reduce Stock Modal ---------------- */
function openReduceStockModal() {
  closeMoreMenu()
  stockReduction.value = 0
  
  if (selectedProduct.value.isMultiVariant) {
    variantReductions.value = (selectedProduct.value.size || []).map((size, idx) => ({
      size,
      currentStock: (selectedProduct.value.quantity || [])[idx] || 0,
      reduction: 0
    }))
  }
  
  showReduceStockModal.value = true
}

function closeReduceStockModal() {
  showReduceStockModal.value = false
  stockReduction.value = 0
  variantReductions.value = []
}

async function saveStockReduction() {
  if (!selectedProduct.value) return
  
  saving.value = true
  
  try {
    const productId = selectedProduct.value.id
    
    if (isMultiVariant.value) {
      const newQuantities = variantReductions.value.map(v => 
        Math.max(0, v.currentStock - (v.reduction || 0))
      )
      
      await updateMyProduct(productId, {
        quantity: newQuantities
      })
      
      success('Stock reduced successfully!')
    } else {
      const newStock = Math.max(0, getCurrentStock() - (stockReduction.value || 0))
      
      await updateMyProduct(productId, {
        quantity: newStock
      })
      
      success('Stock reduced successfully!')
    }
    
    await loadProducts()
    closeReduceStockModal()
    
  } catch (err) {
    console.error('Failed to reduce stock:', err)
    toastError('Failed to reduce stock: ' + err.message)
  } finally {
    saving.value = false
  }
}

/* ---------------- Price Edit Modal ---------------- */
function openPriceEditModal() {
  closeMoreMenu()
  
  if (selectedProduct.value.isMultiVariant) {
    variantPrices.value = (selectedProduct.value.size || []).map((size, idx) => ({
      size,
      price: (selectedProduct.value.price || [])[idx] || 0
    }))
  } else {
    priceEdit.value = Number(selectedProduct.value.price) || 0
  }
  
  showPriceEditModal.value = true
}

function closePriceEditModal() {
  showPriceEditModal.value = false
  priceEdit.value = 0
  variantPrices.value = []
}

async function savePriceEdit() {
  if (!selectedProduct.value) return
  
  saving.value = true
  
  try {
    const productId = selectedProduct.value.id
    
    if (isMultiVariant.value) {
      const newPrices = variantPrices.value.map(v => Number(v.price) || 0)
      
      await updateMyProduct(productId, {
        price: newPrices
      })
      
      success('Price updated successfully!')
    } else {
      await updateMyProduct(productId, {
        price: Number(priceEdit.value) || 0
      })
      
      success('Price updated successfully!')
    }
    
    await loadProducts()
    closePriceEditModal()
    
  } catch (err) {
    console.error('Failed to update price:', err)
    toastError('Failed to update price: ' + err.message)
  } finally {
    saving.value = false
  }
}

/* ---------------- Variant Management Modal ---------------- */
function openVariantModal() {
  closeMoreMenu()
  
  if (selectedProduct.value.isMultiVariant) {
    variantEdits.value = (selectedProduct.value.size || []).map((size, idx) => ({
      size,
      price: (selectedProduct.value.price || [])[idx] || 0,
      quantity: (selectedProduct.value.quantity || [])[idx] || 0
    }))
  } else {
    // Convert single product to variant format
    variantEdits.value = [{
      size: 'Default',
      price: Number(selectedProduct.value.price) || 0,
      quantity: Number(selectedProduct.value.quantity) || 0
    }]
  }
  
  newVariant.value = { size: '', price: 0, quantity: 0 }
  showVariantModal.value = true
}

function closeVariantModal() {
  showVariantModal.value = false
  variantEdits.value = []
  newVariant.value = { size: '', price: 0, quantity: 0 }
}

function addVariant() {
  if (!newVariant.value.size.trim()) {
    toastError('Please enter a variant name')
    return
  }
  
  variantEdits.value.push({
    size: newVariant.value.size.trim(),
    price: Number(newVariant.value.price) || 0,
    quantity: Number(newVariant.value.quantity) || 0
  })
  
  newVariant.value = { size: '', price: 0, quantity: 0 }
}

function removeVariant(idx) {
  if (variantEdits.value.length <= 1) {
    toastError('Product must have at least one variant')
    return
  }
  
  variantEdits.value.splice(idx, 1)
}

async function saveVariants() {
  if (!selectedProduct.value) return
  
  if (variantEdits.value.length === 0) {
    toastError('Product must have at least one variant')
    return
  }
  
  saving.value = true
  
  try {
    const productId = selectedProduct.value.id
    
    const sizes = variantEdits.value.map(v => v.size)
    const prices = variantEdits.value.map(v => Number(v.price) || 0)
    const quantities = variantEdits.value.map(v => Number(v.quantity) || 0)
    
    await updateMyProduct(productId, {
      size: sizes,
      price: prices,
      quantity: quantities
    })
    
    success('Variants updated successfully!')
    await loadProducts()
    closeVariantModal()
    
  } catch (err) {
    console.error('Failed to update variants:', err)
    toastError('Failed to update variants: ' + err.message)
  } finally {
    saving.value = false
  }
}

/* ---------------- Delete Product ---------------- */
function confirmDelete() {
  closeMoreMenu()
  productToDelete.value = selectedProduct.value
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  productToDelete.value = null
}

async function executeDelete() {
  if (!productToDelete.value) return
  
  deleting.value = true
  
  try {
    await deleteMyProduct(productToDelete.value.id)
    success(`Successfully deleted ${productToDelete.value.item_name}`)
    
    await loadProducts()
    
    showDeleteModal.value = false
    productToDelete.value = null
    
  } catch (err) {
    console.error('Failed to delete product:', err)
    toastError('Failed to delete product: ' + err.message)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
img { 
  image-rendering: auto;
}

.divide-y > div {
  transition: background-color 0.2s ease;
}
</style>