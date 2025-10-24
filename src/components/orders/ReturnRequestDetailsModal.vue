<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" @click="$emit('close')">
      <div class="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-800 shadow-xl sm:mx-4 max-h-[85vh] overflow-y-auto" @click.stop>
        <div class="sticky top-0 p-4 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-t-2xl">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Return/Refund Details</h3>
        </div>

        <div class="p-4 space-y-4" v-if="summary">
          <div class="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <p class="text-sm text-slate-500">Status</p>
            <p class="font-medium text-slate-900 dark:text-white capitalize">{{ summary.state }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <p class="text-sm text-slate-500">Reason</p>
              <p class="font-medium text-slate-900 dark:text-white">{{ summary.reasonTitle }}</p>
            </div>
            <div class="rounded-lg border p-3 border-slate-200 dark:border-slate-700">
              <p class="text-sm text-slate-500">Requested At</p>
              <p class="font-medium text-slate-900 dark:text-white">{{ fmt(summary.requestedAt) }}</p>
            </div>
            <div class="rounded-lg border p-3 border-slate-200 dark:border-slate-700">
              <p class="text-sm text-slate-500">Solution</p>
              <p class="font-medium text-slate-900 dark:text-white capitalize">{{ summary.solution }}</p>
            </div>
            <div class="rounded-lg border p-3 border-slate-200 dark:border-slate-700">
              <p class="text-sm text-slate-500">Amount</p>
              <p class="font-semibold text-slate-900 dark:text-white">S${{ (summary.amount || 0).toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-b-2xl">
          <div class="flex justify-end">
            <button class="rounded-lg bg-white px-4 py-2 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50
                           dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-700"
                    @click="$emit('close')">Close</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ visible: Boolean, order: Object })
const summary = computed(() => props.order?.returnRequestSummary || null)
function fmt(ts) {
  if (!ts) return '—'
  if (ts.toDate) return ts.toDate().toLocaleString('en-SG')
  try { return new Date(ts).toLocaleString('en-SG') } catch { return '—' }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
