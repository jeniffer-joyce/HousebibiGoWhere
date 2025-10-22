<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div class="px-6 py-5">
          <!-- mini timeline + summary (keep your design here) -->
          <h2 class="mb-3 text-xl font-semibold text-slate-900 dark:text-white">Refund Details</h2>
          <p class="mb-4 text-slate-600 dark:text-slate-300">
            {{ summaryText }}
          </p>

          <!-- one-line item summary -->
          <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div class="flex items-center gap-3">
              <img :src="firstItem?.img_url" class="h-12 w-12 rounded object-cover" />
              <div class="flex-1">
                <p class="font-medium text-slate-900 dark:text-white">{{ firstItem?.item_name }}</p>
                <p class="text-sm text-slate-500">x{{ firstItem?.quantity }}</p>
              </div>
              <p class="font-semibold text-slate-900 dark:text-white">
                S${{ (firstItem?.totalPrice ?? firstItem?.price * firstItem?.quantity).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3 border-t border-slate-200 p-4 dark:border-slate-700">
          <button @click="$emit('closeAll')"
                  class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
            Close
          </button>
          <button @click="$emit('showOrder')"
                  class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
            Order Details
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  order:   { type: Object,  default: () => ({}) }
})
defineEmits(['closeAll','showOrder'])

const firstItem = computed(() => props.order?.products?.[0] || null)

const summaryText = computed(() => {
  const amt = (props.order?.totals?.grandTotal ?? 0).toFixed(2)
  const mask = props.order?.payment?.masked || props.order?.payment?.method || 'your card'
  return `Refund completed. S$${amt} has been refunded to ${mask}.`
})
</script>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .15s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>
