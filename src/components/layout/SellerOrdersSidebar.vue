<!-- src/components/layout/SellerOrdersSidebar.vue -->
<template>
  <aside
    class="shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900
          transition-all duration-300 overflow-hidden"
    :class="[
      isCollapsed ? 'w-14 sm:w-16 min-w-[3.5rem] sm:min-w-[4rem]' : 'w-52 sm:w-60 min-w-[13rem] sm:min-w-[15rem]'
    ]"
  >
    <div class="h-full overflow-hidden">
      <div class="flex items-center justify-between gap-2 px-1.5 sm:px-2 pt-3 pb-2">
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

      <nav class="px-1.5 sm:px-2 pb-4 space-y-1 overflow-hidden">
        <RouterLink
          v-for="i in items"
          :key="i.to.name"
          :to="i.to"
          class="group flex items-center rounded-lg px-2 py-2 text-sm transition-colors"
          :class="route.name === i.to.name
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200 font-semibold'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'">

          <div
            class="mr-1.5 sm:mr-2 inline-flex h-7 w-7 sm:h-8 sm:w-8 flex-none items-center justify-center rounded-md transition-colors"
            :class="route.name === i.to.name 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
            :title="isCollapsed ? i.label : ''"
          >
            <!-- Package Icon (To Ship) -->
            <svg v-if="i.iconType === 'package'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            
            <!-- Truck Icon (Shipping) -->
            <svg v-else-if="i.iconType === 'truck'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            
            <!-- Check Circle Icon (Completed) -->
            <svg v-else-if="i.iconType === 'check'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            
            <!-- X Circle Icon (Cancellation) -->
            <svg v-else-if="i.iconType === 'cancel'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            
            <!-- Refresh Icon (Return/Refund) -->
            <svg v-else-if="i.iconType === 'refresh'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            
            <!-- Cube/Inventory Icon (Inventory) -->
            <svg v-else-if="i.iconType === 'inventory'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>

          <span class="truncate" v-show="!isCollapsed">{{ i.label }}</span>
          <span
            v-show="!isCollapsed"
            class="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
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
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  counts: { type: Object, default: () => ({}) },
  collapsed: { type: Boolean, default: undefined }
})
const emit = defineEmits(['update:collapsed'])
const route = useRoute()

const LS_KEY = 'seller:orders:sidebarCollapsed'
const hasExternal = computed(() => props.collapsed !== undefined)
const localCollapsed = ref(loadLS())

function loadLS() {
  // Check if screen is mobile-sized
  const isMobile = window.innerWidth < 768
  try { 
    const saved = localStorage.getItem(LS_KEY)
    // If mobile and no saved preference, default to collapsed
    if (isMobile && !saved) return true
    return JSON.parse(saved || 'false') 
  } catch { 
    return isMobile // Default to collapsed on mobile
  }
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

watch(() => props.collapsed, v => {
  if (hasExternal.value) localCollapsed.value = !!v
})

// Auto-collapse on mobile, auto-expand on desktop
onMounted(() => {
  const handleResize = () => {
    const isMobile = window.innerWidth < 768
    
    if (!hasExternal.value) {
      if (isMobile && !localCollapsed.value) {
        // Auto-collapse on mobile when currently expanded
        localCollapsed.value = true
      } else if (!isMobile && localCollapsed.value) {
        // Auto-expand on desktop when currently collapsed
        localCollapsed.value = false
      }
    }
  }
  
  // Check on mount
  handleResize()
  
  // Listen for window resize
  window.addEventListener('resize', handleResize)
  
  // Cleanup
  return () => window.removeEventListener('resize', handleResize)
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
    rr:        pick('rr',        ['return_refund', 'returnRefund', 'refunds']),
    inventory: pick('inventory', ['products', 'stock'])
  }
})

const items = computed(() => ([
  { 
    label: 'To Ship', 
    to: { name: 'SellerOrdersToShip' }, 
    count: norm.value.toShip,
    iconType: 'package'
  },
  { 
    label: 'Shipping', 
    to: { name: 'SellerOrdersShipping' }, 
    count: norm.value.shipping,
    iconType: 'truck'
  },
  { 
    label: 'Completed', 
    to: { name: 'SellerOrdersCompleted' }, 
    count: norm.value.completed,
    iconType: 'check'
  },
  { 
    label: 'Cancellation', 
    to: { name: 'SellerOrdersCancellation' }, 
    count: norm.value.cancelled,
    iconType: 'cancel'
  },
  { 
    label: 'Return/Refund', 
    to: { name: 'SellerOrdersReturnRefund' }, 
    count: norm.value.rr,
    iconType: 'refresh'
  },
  { 
    label: 'Inventory', 
    to: { name: 'SellerOrdersInventory' }, 
    count: norm.value.inventory,
    iconType: 'inventory'
  },
]))
</script>