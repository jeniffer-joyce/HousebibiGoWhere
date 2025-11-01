<!-- src/components/layout/SellerOrdersSidebar.vue -->
<template>
  <aside class="w-60 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
    <h3 class="px-3 pt-4 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      My Orders
    </h3>
    <nav class="px-2 pb-4 space-y-1">
      <RouterLink v-for="i in items" :key="i.to.name" :to="i.to"
        class="group flex items-center justify-between rounded-lg px-3 py-2 text-sm"
        :class="route.name === i.to.name
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200 font-semibold'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'">
        <span>{{ i.label }}</span>
        <span v-if="i.count != null"
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
const props = defineProps({ counts: { type:Object, default:()=>({}) }})
const route = useRoute()
const items = computed(()=>[
  { label:'To Ship',        to:{ name:'SellerOrdersToShip' },       count: props.counts.toShip },
  { label:'Shipping',       to:{ name:'SellerOrdersShipping' },     count: props.counts.shipping },
  { label:'Completed',      to:{ name:'SellerOrdersCompleted' },    count: props.counts.completed },
  { label:'Cancellation',   to:{ name:'SellerOrdersCancellation' }, count: props.counts.cancelled },
  { label:'Return/Refund',  to:{ name:'SellerOrdersReturnRefund' }, count: props.counts.rr },
])
</script>
