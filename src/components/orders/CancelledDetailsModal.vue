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
        <!-- Title -->
        <h2 class="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          Refund Details
        </h2>

        <!-- Context banner -->
        <div
          v-if="order?.status === 'cancelled'"
          class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-100"
        >
          <p class="font-medium">
            Order was cancelled
            <span v-if="order?.cancelledAt">on {{ fmt(order.cancelledAt) }}</span>.
          </p>
          <p v-if="cancelReasonText" class="mt-1 text-sm opacity-90">
            <span class="font-semibold">Cancel reason:</span> {{ cancelReasonText }}
          </p>
        </div>

        <!-- Refund line -->
        <p class="mb-6 text-slate-600 dark:text-slate-300">
          Refund
          <span v-if="grandTotal >= 0">of S${{ grandTotal.toFixed(2) }}</span>
          will be returned to {{ paymentMethod }}.
        </p>

        <!-- Items (scrollable list) -->
        <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <!-- Header -->
          <div
            class="grid grid-cols-12 items-center gap-3 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <div class="col-span-7">Product(s)</div>
            <div class="col-span-2 text-right">Qty</div>
            <div class="col-span-3 text-right">Amount</div>
          </div>

          <!-- Rows -->
          <div class="max-h-72 overflow-auto divide-y divide-slate-200 dark:divide-slate-700">
            <div
              v-for="(it, idx) in order?.products || []"
              :key="idx"
              class="grid grid-cols-12 items-center gap-3 px-4 py-3"
            >
              <!-- Product -->
              <div class="col-span-7 flex min-w-0 items-center gap-3">
                <img :src="it.img_url" class="h-12 w-12 flex-none rounded object-cover ring-1 ring-slate-200 dark:ring-slate-700" alt="">
                <div class="min-w-0">
                  <p class="truncate font-medium text-slate-900 dark:text-white">{{ it.item_name }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    <span v-if="it.size">Size: {{ it.size }}</span>
                  </p>
                </div>
              </div>

              <!-- Qty -->
              <div class="col-span-2 text-right tabular-nums text-slate-900 dark:text-white">
                {{ it.quantity ?? 1 }}
              </div>

              <!-- Amount -->
              <div class="col-span-3 text-right font-semibold tabular-nums text-slate-900 dark:text-white">
                S${{ ((it.totalPrice ?? (it.price * (it.quantity ?? 1))) || 0).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-600 dark:text-slate-300">Products Total</span>
            <span class="font-medium text-slate-900 dark:text-white">S${{ productsTotal.toFixed(2) }}</span>
          </div>
          <div class="mt-2 flex items-center justify-between text-sm">
            <span class="text-slate-600 dark:text-slate-300">Shipping</span>
            <span class="font-medium text-slate-900 dark:text-white">S${{ shippingFee.toFixed(2) }}</span>
          </div>
          <div class="mt-2 flex items-center justify-between text-sm">
            <span class="text-slate-600 dark:text-slate-300">Discount</span>
            <span class="font-medium text-slate-900 dark:text-white">- S${{ discount.toFixed(2) }}</span>
          </div>
          <div class="mt-3 border-t border-slate-200 dark:border-slate-700"></div>
          <div class="mt-3 flex items-center justify-between">
            <span class="font-semibold text-slate-900 dark:text-white">Grand Total</span>
            <span class="text-lg font-bold text-slate-900 dark:text-white">S${{ grandTotal.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Footer -->
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

/* Format helper for Firestore Timestamp/ISO */
function fmt(ts) {
  if (!ts) return '—'
  if (ts.toDate) {
    return ts.toDate().toLocaleString('en-SG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }
  try { return new Date(ts).toLocaleString('en-SG') } catch { return '—' }
}

/* Cancel reason (from order.cancelReason or latest statusLog message) */
const cancelReasonText = computed(() => {
  const o = props.order || {}
  if (o.cancelReason) return o.cancelReason
  const log = Array.isArray(o.statusLog) ? o.statusLog : []
  const last = log.length ? log[log.length - 1] : null
  return last?.status === 'cancelled' ? (last?.message || '') : ''
})

/* Payment method label */
const paymentMethod = computed(() => props.order?.payment?.method || 'card')

/* Totals pulled from DB with safe fallbacks */
const productsTotal = computed(() => {
  const t = props.order?.totals?.productsTotalPrice
  if (t != null) return Number(t)
  const items = props.order?.products || []
  const sum = items.reduce(
    (a, p) => a + ((p.totalPrice ?? (p.price * (p.quantity ?? 1))) || 0),
    0
  )
  return Number(sum.toFixed(2))
})

/* ✅ Shipping fee from DB (primary), with common fallbacks */
const shippingFee = computed(() => {
  const t = props.order?.totals?.shippingFee
  if (t != null) return Number(t)
  const legacy = props.order?.shippingFee
  return Number(legacy ?? 0)
})

const discount = computed(() => Number(props.order?.totals?.discount ?? 0))

const grandTotal = computed(() => {
  const g = props.order?.totals?.grandTotal
  if (g != null) return Number(g)
  return Number((productsTotal.value + shippingFee.value - discount.value).toFixed(2))
})
</script>