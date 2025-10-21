<template>
  <div class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
    <div class="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-1">Refund Details</h2>

      <!-- Progress line (Requested → Accepted → Refunded) -->
      <div class="mt-3 flex items-center justify-between">
        <div class="flex-1 h-1 rounded-full"
             :class="stageIdx >= 0 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'"></div>
        <div class="mx-2 text-xs text-slate-600 dark:text-slate-300">Cancellation Requested</div>
        <div class="flex-1 h-1 rounded-full"
             :class="stageIdx >= 1 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'"></div>
        <div class="mx-2 text-xs text-slate-600 dark:text-slate-300">Cancellation Accepted</div>
        <div class="flex-1 h-1 rounded-full"
             :class="stageIdx >= 2 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'"></div>
        <div class="ml-2 text-xs text-slate-600 dark:text-slate-300">Refunded</div>
      </div>

      <div class="mt-6 rounded-lg bg-blue-50 p-4 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100">
        <p class="text-lg font-semibold">Refund
          <span v-if="isRefunded">Completed</span>
          <span v-else>In Progress</span>
        </p>
        <p class="mt-1">
          <span class="font-medium">S${{ (order.totals?.grandTotal ?? 0).toFixed(2) }}</span>
          will be refunded to your <span class="font-medium">{{ order.payment?.method || 'payment method' }}</span>.
        </p>
      </div>

      <!-- Items -->
      <div class="mt-6 space-y-3">
        <div v-for="(p, i) in order.products" :key="i" class="flex items-center gap-3">
          <img :src="p.img_url" class="h-14 w-14 rounded-lg object-cover" />
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium text-slate-900 dark:text-white">{{ p.item_name }}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Qty: {{ p.quantity }} <span v-if="p.size"> • Size: {{ p.size }}</span>
            </p>
          </div>
          <p class="font-semibold text-slate-900 dark:text-white">
            S${{ (p.totalPrice ?? p.price * p.quantity).toFixed(2) }}
          </p>
        </div>
      </div>

      <div class="mt-8 flex items-center justify-between">
        <button @click="$emit('open-order', order)"
                class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50
                       dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
          Order Detail
        </button>
        <div class="flex gap-2">
          <button @click="$emit('close')"
                  class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50
                         dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
            Close
          </button>
          <button class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Buy Again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
const props = defineProps({ order: { type: Object, required: true } })

// Try to infer refund stage from statusLog (simple heuristic)
const stageIdx = computed(() => {
  const log = props.order?.statusLog || []
  // 0=requested(cancelled), 1=accepted (optional), 2=refunded (optional)
  let idx = -1
  if (log.find(l => l.status === 'cancelled')) idx = 0
  if (log.find(l => l.status === 'return_refund')) idx = Math.max(idx, 1)
  if (log.find(l => l.status === 'refunded' || l.status === 'refund_completed')) idx = 2
  return idx
})
const isRefunded = computed(() => stageIdx.value >= 2)
</script>
