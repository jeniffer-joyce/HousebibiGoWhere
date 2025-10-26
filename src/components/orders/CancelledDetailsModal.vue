<template>
  <teleport to="body">
    <div
      v-show="visible"
      class="fixed inset-0 z-[120] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <!-- Backdrop; click to close -->
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />

      <!-- Card -->
      <div
        class="relative z-[121] w-[min(900px,95vw)] max-h-[90vh] overflow-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
        @click.stop
      >
        <h2 class="mb-1 text-xl font-semibold text-slate-900 dark:text-white">
          Refund Details
        </h2>
        <p class="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Refund completed. S${{ totalRefund.toFixed(2) }} has been refunded to
          {{ order?.payment?.method || 'card' }}.
        </p>

        <div
          v-for="(it, idx) in order?.products || []"
          :key="idx"
          class="mb-3 flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700"
        >
          <div class="flex items-center gap-3">
            <img :src="it.img_url" class="h-12 w-12 rounded object-cover" alt="">
            <div>
              <p class="font-medium text-slate-900 dark:text-white">{{ it.item_name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">x{{ it.quantity ?? 1 }}</p>
            </div>
          </div>
          <div class="text-right font-semibold text-slate-900 dark:text-white">
            S${{ ((it.totalPrice ?? it.price * (it.quantity ?? 1)) || 0).toFixed(2) }}
          </div>
        </div>

        <div class="mt-6 flex items-center justify-between">
          <button
            class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="$emit('close')"
          >
            Close
          </button>

          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            @click="$emit('open-order', order)"
          >
            Order Details
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  order:   { type: Object,  default: null }
})
defineEmits(['close','open-order'])

const totalRefund = computed(() => {
  if (!props.order) return 0
  const t = props.order?.totals?.grandTotal
  if (t != null) return Number(t)
  return (props.order?.products || []).reduce(
    (a, p) => a + (p.totalPrice ?? (p.price * (p.quantity ?? 1))), 0
  )
})
</script>
