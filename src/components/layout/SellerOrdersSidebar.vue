<!-- src/components/layout/SellerOrdersSidebar.vue -->
<template>
  <!-- AFTER -->
    <aside
      class="shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900
            transition-all duration-300"
      :class="isCollapsed ? 'w-16' : 'w-60'"
    >
    <!-- inner rail visually collapses -->
    <div class="h-full">
      <div class="flex items-center justify-between gap-2 px-2 pt-3 pb-2">
        <h3 v-show="!isCollapsed" class="px-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          My Orders
        </h3>
        <button
          class="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          :title="isCollapsed ? 'Expand' : 'Collapse'"
          @click="toggle()"
        >
          <svg v-if="!isCollapsed" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5-7 7 7 7M22 5l-7 7 7 7"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5-7 7 7 7M22 5l-7 7 7 7"/>
          </svg>
        </button>
      </div>

      <nav class="px-2 pb-4 space-y-1">
        <RouterLink
          v-for="i in items"
          :key="i.to.name"
          :to="i.to"
          class="group flex items-center rounded-lg px-2 py-2 text-sm transition-colors"
          :class="route.name === i.to.name
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200 font-semibold'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'">

          <div
            class="mr-2 inline-flex h-8 w-8 flex-none items-center justify-center rounded-md
                   bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            :title="isCollapsed ? i.label : ''"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="6" cy="6" r="1.5"/><circle cx="12" cy="6" r="1.5"/><circle cx="18" cy="6" r="1.5"/>
              <circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>
              <circle cx="6" cy="18" r="1.5"/><circle cx="12" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/>
            </svg>
          </div>

          <span class="truncate" v-show="!isCollapsed">{{ i.label }}</span>
          <span
            v-show="!isCollapsed"
            class="ml-auto rounded-full px-2 py-0.5 text-xs"
            :class="route.name === i.to.name
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 dark:text-slate-200'">
            {{ i.count }}
          </span>
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  counts: { type: Object, default: () => ({}) },
  // optional v-model:collapsed; if omitted, component is self-controlled
  collapsed: { type: Boolean, default: undefined }
})
const emit = defineEmits(['update:collapsed'])
const route = useRoute()

const LS_KEY = 'seller:orders:sidebarCollapsed'
const hasExternal = computed(() => props.collapsed !== undefined)
const localCollapsed = ref(loadLS())

function loadLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'false') } catch { return false }
}
function saveLS(v) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(!!v)) } catch {}
}

const isCollapsed = computed({
  get() { return hasExternal.value ? !!props.collapsed : localCollapsed.value },
  set(v) {
    if (hasExternal.value) emit('update:collapsed', !!v)
    else { localCollapsed.value = !!v; saveLS(v) }
  }
})
function toggle(){ isCollapsed.value = !isCollapsed.value }

// keep internal in sync if parent controls it
watch(() => props.collapsed, v => {
  if (hasExternal.value) localCollapsed.value = !!v
})

/** counts normalizer */
const norm = computed(() => {
  const c = props.counts || {}
  const pick = (primary, alts = []) => {
    for (const k of [primary, ...alts]) {
      const v = c[k]
      if (typeof v === 'number' && !Number.isNaN(v)) return v
    }
    return 0
  }
  return {
    toShip:    pick('toShip',    ['to_ship']),
    shipping:  pick('shipping',  ['toReceive', 'to_receive', 'inTransit', 'in_transit']),
    completed: pick('completed', ['complete', 'done']),
    cancelled: pick('cancelled', ['canceled', 'cancellation', 'cancellations']),
    rr:        pick('rr',        ['return_refund', 'returnRefund', 'refunds'])
  }
})

const items = computed(() => ([
  { label: 'To Ship',       to: { name: 'SellerOrdersToShip' },        count: norm.value.toShip },
  { label: 'Shipping',      to: { name: 'SellerOrdersShipping' },      count: norm.value.shipping },
  { label: 'Completed',     to: { name: 'SellerOrdersCompleted' },     count: norm.value.completed },
  { label: 'Cancellation',  to: { name: 'SellerOrdersCancellation' },  count: norm.value.cancelled },
  { label: 'Return/Refund', to: { name: 'SellerOrdersReturnRefund' },  count: norm.value.rr },
  { label: 'Inventory',     to: { name: 'SellerOrdersInventory' },     count: 0 },
]))
</script>
