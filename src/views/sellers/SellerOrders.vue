<!-- Orders.vue -->
<template>
  <main class="flex-1 overflow-y-auto">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- =========================
           HEADER
           ========================= -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 class="text-3xl font-extrabold tracking-tight text-foreground-light dark:text-foreground-dark">
            Orders
          </h2>
          <p class="text-muted-light dark:text-muted-dark mt-1">
            Manage your incoming and pending orders.
          </p>
        </div>

        <!-- Sort/Filter -->
        <div class="flex items-center gap-3 relative w-full md:w-auto">
          <span class="text-sm font-medium text-muted-light dark:text-muted-dark">
            Filter by:
          </span>

          <!-- Sort trigger -->
          <button
            data-sort-button
            @click="toggleSortMenu"
            @keydown.escape="showSort = false"
            class="flex items-center gap-2 rounded-lg bg-accent-light dark:bg-accent-dark px-4 py-2 text-sm font-medium text-muted-light dark:text-muted-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            <span class="material-symbols-outlined text-base">filter_list</span>
            {{ sortLabel }}
          </button>

          <!-- Sort dropdown -->
          <div
            v-show="showSort"
            data-sort-menu
            class="absolute right-0 top-[110%] w-64 rounded-lg border border-accent-light dark:border-accent-dark bg-background-light dark:bg-background-dark shadow-lg overflow-hidden z-10">
            <div class="px-3 py-2 text-xs font-semibold text-muted-light dark:text-muted-dark">Sort by</div>

            <button
              :class="['w-full text-left px-3 py-2 text-sm transition-colors',
                       isActiveSort('date','asc') ? 'bg-accent-light/60 dark:bg-white/10 text-foreground-light dark:text-foreground-dark' : 'text-muted-light dark:text-muted-dark']"
              @click="applySort('date','asc')">
              Date — Ascending
            </button>
            <button
              :class="['w-full text-left px-3 py-2 text-sm transition-colors',
                       isActiveSort('date','desc') ? 'bg-accent-light/60 dark:bg-white/10 text-foreground-light dark:text-foreground-dark' : 'text-muted-light dark:text-muted-dark']"
              @click="applySort('date','desc')">
              Date — Descending
            </button>
            <button
              :class="['w-full text-left px-3 py-2 text-sm transition-colors',
                       isActiveSort('buyer','asc') ? 'bg-accent-light/60 dark:bg-white/10 text-foreground-light dark:text-foreground-dark' : 'text-muted-light dark:text-muted-dark']"
              @click="applySort('buyer','asc')">
              Buyer — A → Z
            </button>
            <button
              :class="['w-full text-left px-3 py-2 text-sm transition-colors',
                       isActiveSort('buyer','desc') ? 'bg-accent-light/60 dark:bg-white/10 text-foreground-light dark:text-foreground-dark' : 'text-muted-light dark:text-muted-dark']"
              @click="applySort('buyer','desc')">
              Buyer — Z → A
            </button>
          </div>
        </div>
      </div>

      <!-- =========================
           SEARCH + STATUS TABS
           ========================= -->
      <div class="flex flex-col gap-6">
        <!-- Search -->
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark">search</span>
          <input
            v-model.trim="search"
            type="search"
            placeholder="Search orders by ID or buyer name"
            class="form-input w-full rounded-lg border-accent-light dark:border-accent-dark bg-background-light dark:bg-accent-dark pl-10 pr-10 py-2.5 text-foreground-light dark:text-foreground-dark focus:border-primary focus:ring-primary placeholder:text-muted-light dark:placeholder:text-muted-dark"
          />
          <button
            v-if="search"
            @click="search = ''"
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-accent-light dark:hover:bg-accent-dark"
            title="Clear">
            <span class="material-symbols-outlined text-base text-muted-light dark:text-muted-dark">close</span>
          </button>
        </div>

        <!-- Tabs (wrap on small; no horizontal scroll) -->
        <div class="border-b border-accent-light dark:border-accent-dark">
          <nav class="-mb-px flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              v-for="t in tabs"
              :key="t"
              @click="activeTab = t; currentPage = 1"
              class="whitespace-nowrap py-2 sm:py-3 px-1 border-b-2 text-sm transition-colors"
              :class="activeTab === t
                ? 'font-semibold text-primary border-primary'
                : 'font-medium text-muted-light dark:text-muted-dark border-transparent hover:text-primary hover:border-primary/50 dark:hover:text-primary dark:hover:border-primary/50'">
              {{ t }}
            </button>
          </nav>
        </div>

        <!-- =========================
             TABLE (md and up)
             ========================= -->
        <div class="overflow-x-auto rounded-lg border border-accent-light dark:border-accent-dark hidden md:block">
          <table class="table-hover min-w-full divide-y divide-accent-light dark:divide-accent-dark text-center">
            <thead class="bg-accent-light/50 dark:bg-accent-dark/50">
              <tr>
                <th class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-center align-middle">Order ID</th>
                <th class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-center align-middle">Buyer</th>
                <th class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-center align-middle">Product(s)</th>
                <th class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-center align-middle">Quantity</th>
                <th class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-center align-middle">Total</th>
                <th class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-center align-middle">Date</th>
                <th class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-center align-middle">Status</th>
                <th class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-center align-middle">Actions</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-accent-light dark:divide-accent-dark bg-background-light dark:bg-background-dark">
              <tr v-for="o in pagedOrders" :key="o.id" class="transition-colors">
                <td class="px-6 py-3 text-sm text-center align-middle text-primary">{{ o.id }}</td>
                <td class="px-6 py-3 text-sm text-center align-middle">{{ o.buyer }}</td>
                <td class="px-6 py-3 text-sm text-center align-middle">{{ o.products }}</td>
                <td class="px-6 py-3 text-sm text-center align-middle">{{ o.qty }}</td>
                <td class="px-6 py-3 text-sm text-center align-middle">{{ o.total }}</td>
                <td class="px-6 py-3 text-sm text-center align-middle">{{ o.date }}</td>
                <td class="px-6 py-3 text-sm text-center align-middle">
                  <span
                    class="status-badge"
                    :class="{
                      'status-pending': o.status === 'Pending',
                      'status-processing': o.status === 'Processing',
                      'status-shipped': o.status === 'Shipped',
                      'status-delivered': o.status === 'Delivered'
                    }">
                    {{ o.status }}
                  </span>
                </td>
                <td class="px-6 py-3 text-sm text-center align-middle">
                  <a href="#" class="text-primary hover:text-primary/80 transition-colors">View Details</a>
                </td>
              </tr>

              <tr v-if="!pagedOrders.length">
                <td colspan="8" class="px-6 py-10 text-center text-sm text-muted-light dark:text-muted-dark">
                  No orders match your filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- =========================
             MOBILE CARDS (below md)
             ========================= -->
        <div class="space-y-3 md:hidden">
          <div
            v-for="o in pagedOrders"
            :key="o.id"
            class="rounded-lg border border-accent-light dark:border-accent-dark bg-background-light dark:bg-background-dark p-4 transition-colors hover:bg-accent-light/60 dark:hover:bg-white/5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-primary font-semibold">{{ o.id }}</span>
              <span
                class="status-badge"
                :class="{
                  'status-pending': o.status === 'Pending',
                  'status-processing': o.status === 'Processing',
                  'status-shipped': o.status === 'Shipped',
                  'status-delivered': o.status === 'Delivered'
                }">
                {{ o.status }}
              </span>
            </div>

            <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div class="text-muted-light dark:text-muted-dark">Buyer</div>
              <div class="text-right">{{ o.buyer }}</div>

              <div class="text-muted-light dark:text-muted-dark">Product(s)</div>
              <div class="text-right">{{ o.products }}</div>

              <div class="text-muted-light dark:text-muted-dark">Quantity</div>
              <div class="text-right">{{ o.qty }}</div>

              <div class="text-muted-light dark:text-muted-dark">Total</div>
              <div class="text-right">{{ o.total }}</div>

              <div class="text-muted-light dark:text-muted-dark">Date</div>
              <div class="text-right">{{ o.date }}</div>
            </div>

            <div class="mt-3 flex justify-end">
              <a href="#" class="text-primary hover:text-primary/80 text-sm font-medium">View Details</a>
            </div>
          </div>

          <div v-if="!pagedOrders.length" class="rounded-lg border border-accent-light dark:border-accent-dark p-6 text-center text-sm text-muted-light dark:text-muted-dark">
            No orders match your filters.
          </div>
        </div>

        <!-- =========================
             PAGINATION
             ========================= -->
        <nav class="flex items-center justify-between border-t border-accent-light dark:border-accent-dark pt-4">
          <div class="hidden sm:block">
            <p class="text-sm text-muted-light dark:text-muted-dark">
              Showing <span class="font-medium">{{ pageStart }}</span>
              to <span class="font-medium">{{ pageEnd }}</span>
              of <span class="font-medium">{{ filteredAndSorted.length }}</span> results
            </p>
          </div>

          <div class="flex flex-1 justify-between sm:justify-end">
            <button
              :disabled="currentPage === 1"
              @click="currentPage--"
              class="inline-flex items-center rounded-md border border-accent-light dark:border-accent-dark px-4 py-2 text-sm font-medium text-muted-light dark:text-muted-dark hover:bg-accent-light dark:hover:bg-accent-dark disabled:opacity-50">
              Previous
            </button>
            <button
              :disabled="currentPage === totalPages || totalPages === 0"
              @click="currentPage++"
              class="inline-flex items-center rounded-md border border-accent-light dark:border-accent-dark px-4 py-2 text-sm font-medium text-muted-light dark:text-muted-dark hover:bg-accent-light dark:hover:bg-accent-dark disabled:opacity-50 ml-3">
              Next
            </button>
          </div>
        </nav>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

/* Tabs & Search */
const tabs = ['All Orders', 'Pending', 'Processing', 'Shipped', 'Delivered']
const activeTab = ref('All Orders')
const search = ref('')

/* Sort dropdown */
const showSort = ref(false)
const sort = reactive({ key: 'date', dir: 'desc' }) // newest first

function toggleSortMenu(e) {
  e?.stopPropagation?.()
  showSort.value = !showSort.value
}
function applySort(key, dir) {
  sort.key = key
  sort.dir = dir
  showSort.value = false
}
const sortLabel = computed(() => {
  if (sort.key === 'date') return sort.dir === 'asc' ? 'Date ↑' : 'Date ↓'
  if (sort.key === 'buyer') return sort.dir === 'asc' ? 'Buyer A–Z' : 'Buyer Z–A'
  return 'Filter'
})
function isActiveSort(key, dir) {
  return sort.key === key && sort.dir === dir
}
watch(showSort, (open) => {
  if (!open) return
  const onClick = (e) => {
    const target = e.target.closest('[data-sort-button]')
    if (!target) showSort.value = false
  }
  window.addEventListener('click', onClick, { once: true })
})

/* Mock data */
const orders = ref([
  { id: '#12345', buyer: 'Sophia Carter', products: 'Handmade Soap', qty: 2, total: '$25.00', date: '2024-07-26', status: 'Pending' },
  { id: '#12346', buyer: 'Ethan Bennett', products: 'Knitted Scarf', qty: 1, total: '$30.00', date: '2024-07-25', status: 'Processing' },
  { id: '#12347', buyer: 'Olivia Harper', products: 'Baked Cookies', qty: 3, total: '$15.00', date: '2024-07-24', status: 'Shipped' },
  { id: '#12348', buyer: 'Liam Foster', products: 'Custom Mug', qty: 1, total: '$20.00', date: '2024-07-23', status: 'Delivered' },
  { id: '#12349', buyer: 'Ava Morgan', products: 'Jewelry Set', qty: 1, total: '$45.00', date: '2024-07-22', status: 'Pending' },
  { id: '#12350', buyer: 'Noah Lee', products: 'Art Print', qty: 2, total: '$40.00', date: '2024-07-21', status: 'Delivered' },
  { id: '#12351', buyer: 'Mia Chen', products: 'Ceramic Bowl', qty: 1, total: '$28.00', date: '2024-07-20', status: 'Processing' },
  { id: '#12352', buyer: 'Lucas Park', products: 'Candle Set', qty: 4, total: '$52.00', date: '2024-07-19', status: 'Shipped' }
])

/* Filter + Search + Sort */
const filteredAndSorted = computed(() => {
  const q = search.value.toLowerCase().trim()
  let list = orders.value

  if (activeTab.value !== 'All Orders') {
    list = list.filter(o => o.status === activeTab.value)
  }

  if (q) {
    list = list.filter(o =>
      o.id.toLowerCase().includes(q) || o.buyer.toLowerCase().includes(q)
    )
  }

  const dir = sort.dir === 'asc' ? 1 : -1
  if (sort.key === 'date') {
    list = [...list].sort((a, b) => (new Date(a.date) - new Date(b.date)) * dir)
  } else if (sort.key === 'buyer') {
    list = [...list].sort((a, b) => a.buyer.localeCompare(b.buyer) * dir)
  }

  return list
})

/* Pagination */
const pageSize = 5
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(filteredAndSorted.value.length / pageSize))
const pagedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredAndSorted.value.slice(start, start + pageSize)
})
const pageStart = computed(() => filteredAndSorted.value.length ? (currentPage.value - 1) * pageSize + 1 : 0)
const pageEnd = computed(() => Math.min(currentPage.value * pageSize, filteredAndSorted.value.length))
</script>

<style scoped>
/* ========= High-contrast hover for dropdown (light & dark) ========= */
[data-sort-menu] button {
  cursor: pointer;
}
[data-sort-menu] button:hover {
  /* Light mode hover */
  background-color: rgba(15, 23, 42, 0.06); /* ~slate-900 @ 6% */
}
:where(.dark) [data-sort-menu] button:hover {
  /* Dark mode hover */
  background-color: rgba(255, 255, 255, 0.10);
}

/* ========= Table row & cell highlight on hover ========= */
.table-hover tbody tr:hover td {
  /* Light row hover */
  background-color: rgba(15, 23, 42, 0.04); /* subtle slate overlay */
}
:where(.dark) .table-hover tbody tr:hover td {
  /* Dark row hover */
  background-color: rgba(255, 255, 255, 0.06);
}

/* Slightly stronger highlight for the *cell* directly under the pointer */
.table-hover tbody td:hover {
  background-color: rgba(15, 23, 42, 0.08);
}
:where(.dark) .table-hover tbody td:hover {
  background-color: rgba(255, 255, 255, 0.12);
}

/* ========= Status badges (unchanged) ========= */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.status-pending { background-color: #ffedd5; color: #9a3412; }
.dark .status-pending { background-color: #78350f; color: #fed7aa; }
.status-processing { background-color: #dbeafe; color: #1e40af; }
.dark .status-processing { background-color: #1e3a8a; color: #93c5fd; }
.status-shipped { background-color: #cce7ff; color: #007bff; }
.dark .status-shipped { background-color: #004c99; color: #99cfff; }
.status-delivered { background-color: #d1fae5; color: #065f46; }
.dark .status-delivered { background-color: #064e3b; color: #6ee7b7; }
</style>
