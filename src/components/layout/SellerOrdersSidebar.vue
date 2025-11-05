<!-- src/components/layout/SellerOrdersSidebar.vue -->
<template>
  <aside class="w-60 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
    <h3 class="px-3 pt-4 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      My Orders
    </h3>
    <nav class="px-2 pb-4 space-y-1">
      <RouterLink
        v-for="i in items"
        :key="i.to.name"
        :to="i.to"
        class="group flex items-center justify-between rounded-lg px-3 py-2 text-sm"
        :class="route.name === i.to.name
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200 font-semibold'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'">
        <span>{{ i.label }}</span>
        <span
          class="ml-2 rounded-full px-2 py-0.5 text-xs"
          :class="route.name === i.to.name ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 dark:text-slate-200'">
          {{ i.count }}
        </span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  counts: { type: Object, default: () => ({}) }
})

const route = useRoute()

/** Normalize possible keys coming from parent */
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
  { label: 'Inventory',     to: { name: 'SellerOrdersInventory' },    count: 0 },
]))
</script>
