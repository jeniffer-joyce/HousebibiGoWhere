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
            placeholder="Search Product Name, Parent SKU, SKU, Item ID"
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
        <div class="col-span-1">L30d Sales</div>
        <div class="col-span-1">L30d Sales Trend</div>
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
              <img :src="p.img_url || 'https://via.placeholder.com/48x48?text=%20'" alt="" class="h-12 w-12 flex-shrink-0 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
              <div class="min-w-0 flex-1">
                <div class="font-medium whitespace-normal break-words leading-tight text-slate-900 dark:text-white">
                  {{ p.item_name || p.name || '—' }}
                </div>
                <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Parent SKU: {{ p.parentSKU || '—' }}
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  Item ID: {{ p.itemId || p.id }}
                </div>
              </div>
            </div>

            <!-- Stats Grid (Mobile) -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">L30d Sales</div>
                <div class="text-sm font-semibold text-slate-900 dark:text-white">{{ p.l30dSales || 0 }}</div>
              </div>
              <div>
                <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">Trend</div>
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="trendPill(p).cls"
                >
                  {{ trendPill(p).label }}
                </span>
              </div>
              <div>
                <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">Price</div>
                <div class="text-sm font-semibold text-slate-900 dark:text-white">{{ money(p.price) }}</div>
              </div>
              <div>
                <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">Stock</div>
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="stockPill(p).cls"
                  :title="stockPill(p).title"
                >
                  <span class="h-2 w-2 rounded-full" :class="stockPill(p).dot"></span>
                  {{ stockPill(p).label }}
                </span>
              </div>
            </div>

            <!-- Actions (Mobile) -->
            <div class="flex gap-2">
              <button
                class="flex-1 rounded-md border px-3 py-1.5 text-sm transition
                       border-slate-300 text-slate-700 hover:bg-slate-50
                       dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                @click="editProduct(p)"
              >
                Edit
              </button>
              <button
                class="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                @click="boostProduct(p)"
              >
                Boosting
              </button>
              <button
                class="flex-1 rounded-md border px-3 py-1.5 text-sm transition
                       border-slate-300 text-slate-700 hover:bg-slate-50
                       dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                @click="moreActions(p)"
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
                <img :src="p.img_url || 'https://via.placeholder.com/48x48?text=%20'" alt="" class="h-12 w-12 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                <div class="min-w-0">
                  <div class="font-medium whitespace-normal break-words leading-tight text-slate-900 dark:text-white">
                    {{ p.item_name || p.name || '—' }}
                  </div>

                  <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Parent SKU: {{ p.parentSKU || '—' }}
                  </div>
                  <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Item ID: {{ p.itemId || p.id }}
                  </div>
                </div>
              </div>
            </div>

            <!-- L30d Sales -->
            <div class="col-span-1 text-sm font-semibold text-slate-900 dark:text-white">
              {{ p.l30dSales || 0 }}
            </div>

            <!-- L30d Sales Trend -->
            <div class="col-span-1 self-start">
              <span
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="trendPill(p).cls"
              >
                {{ trendPill(p).label }}
              </span>
            </div>

            <!-- Price -->
            <div class="col-span-2 self-start">
              <span class="inline-block text-sm font-semibold text-slate-900 dark:text-white">
                {{ money(p.price) }}
              </span>
            </div>

            <!-- Stock -->
            <div class="col-span-2 self-start">
              <span
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="stockPill(p).cls"
                :title="stockPill(p).title"
              >
                <span class="h-2 w-2 rounded-full" :class="stockPill(p).dot"></span>
                {{ stockPill(p).label }}
              </span>
            </div>

            <!-- Actions -->
            <div class="col-span-1 self-start">
              <div class="flex flex-col items-stretch gap-2 w-full">
                <button
                  class="w-full rounded-md border px-3 py-1.5 text-sm transition
                         border-slate-300 text-slate-700 hover:bg-slate-50
                         dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  @click="editProduct(p)"
                >
                  Edit
                </button>

                <button
                  class="w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                  @click="boostProduct(p)"
                >
                  Boosting
                </button>

                <button
                  class="w-full rounded-md border px-3 py-1.5 text-sm transition
                         border-slate-300 text-slate-700 hover:bg-slate-50
                         dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  @click="moreActions(p)"
                >
                  More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'

const { success, error: toastError } = useToast()

/* ---------------- state ---------------- */
const loading = ref(true)
const allProducts = ref([])
const searchStr = ref('')
const sortMode = ref('name_asc')

/* Mock data - replace with your actual data source */
onMounted(() => {
  setTimeout(() => {
    allProducts.value = [
      {
        id: '24079752465',
        itemId: '24079752465',
        parentSKU: '-',
        name: 'Pencil',
        item_name: 'Pencil',
        img_url: 'https://via.placeholder.com/48x48?text=Pencil',
        price: 11.00,
        stock: 33,
        l30dSales: 11,
        l30dTrend: 0
      },
      {
        id: '25979747528',
        itemId: '25979747528',
        parentSKU: '-',
        name: 'Pen',
        item_name: 'Pen',
        img_url: 'https://via.placeholder.com/48x48?text=Pen',
        price: 31.00,
        stock: 1,
        l30dSales: 14,
        l30dTrend: 0
      },
      {
        id: '24079752466',
        itemId: '24079752466',
        parentSKU: '-',
        name: 'Pencil',
        item_name: 'Pencil',
        img_url: 'https://via.placeholder.com/48x48?text=Pencil',
        price: 0.10,
        stock: 0,
        l30dSales: 11,
        l30dTrend: 0
      }
    ]
    loading.value = false
  }, 500)
})

/* ---------------- helpers (display) ---------------- */
const money = n => 'S$' + (Math.round((n||0)*100)/100).toFixed(2)

/* Trend pill */
const trendPill = (p) => {
  const trend = p.l30dTrend || 0
  if (trend === 0) return {
    label: '0%',
    cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
  if (trend > 0) return {
    label: `+${trend}%`,
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  }
  return {
    label: `${trend}%`,
    cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
  }
}

/* Stock pill */
const stockPill = (p) => {
  const stock = p.stock || 0
  if (stock === 0) return {
    label: 'Sold out',
    cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    dot: 'bg-rose-600',
    title: 'Out of stock'
  }
  if (stock < 10) return {
    label: stock.toString(),
    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-600',
    title: 'Low stock'
  }
  return {
    label: stock.toString(),
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    dot: 'bg-emerald-600',
    title: 'In stock'
  }
}

/* ---------------- search + sort ---------------- */
const filteredRows = computed(() => {
  const q = searchStr.value.trim().toLowerCase()
  if (!q) return allProducts.value
  return allProducts.value.filter(p => {
    const hay = [
      p.name || p.item_name,
      p.parentSKU,
      p.itemId,
      p.id
    ].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

const sortedRows = computed(() => {
  const rows = [...filteredRows.value]
  const mode = sortMode.value
  if (mode === 'name_asc') {
    rows.sort((a,b) => (a.item_name || a.name || '').localeCompare(b.item_name || b.name || ''))
  } else if (mode === 'name_desc') {
    rows.sort((a,b) => (b.item_name || b.name || '').localeCompare(a.item_name || a.name || ''))
  } else if (mode === 'stock_low') {
    rows.sort((a,b) => (a.stock || 0) - (b.stock || 0))
  } else if (mode === 'stock_high') {
    rows.sort((a,b) => (b.stock || 0) - (a.stock || 0))
  } else if (mode === 'price_low') {
    rows.sort((a,b) => (a.price || 0) - (b.price || 0))
  } else if (mode === 'price_high') {
    rows.sort((a,b) => (b.price || 0) - (a.price || 0))
  }
  return rows
})

/* ---------------- actions ---------------- */
function editProduct(p) {
  success(`Opening editor for ${p.item_name || p.name}`)
  // Navigate to edit page or open edit modal
}

function boostProduct(p) {
  success(`Boosting ${p.item_name || p.name}`)
  // Open boosting modal or navigate to boost page
}

function moreActions(p) {
  success(`More actions for ${p.item_name || p.name}`)
  // Show dropdown with additional actions
}
</script>

<style scoped>
/* Optional: crisp preview */
img { image-rendering: auto; }
</style>