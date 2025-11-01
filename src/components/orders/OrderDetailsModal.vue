<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[120] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      @keydown.esc="$emit('close')"
    >
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
      <div
        class="relative z-[121] w-[min(900px,95vw)] max-h-[90vh] overflow-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
        @click.stop
      >
        <h2 class="mb-1 text-xl font-semibold text-slate-900 dark:text-white">Order Details</h2>
        <p class="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Order #{{ order?.orderId }} • Placed {{ fmt(order?.createdAt) }}
        </p>

        <!-- Cancellation banner (if cancelled) -->
        <div
          v-if="lastStatus === 'cancelled'"
          class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-200"
        >
          <p class="text-sm font-medium">
            Order cancelled on {{ fmt(lastStatusTime) }}
          </p>
          <p class="text-xs opacity-80">Cancelled by {{ cancelledBy }}</p>
        </div>

        <!-- Items -->
        <div
          v-for="(it, idx) in order?.products || []"
          :key="idx"
          class="mb-3 flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700"
        >
          <div class="flex items-center gap-3">
            <img :src="it.img_url" class="h-12 w-12 rounded object-cover" alt="">
            <div>
              <p class="font-medium text-slate-900 dark:text-white">{{ it.item_name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                <span v-if="it.size">Size: {{ it.size }}</span>
                <span v-if="it.size && it.quantity"> • </span>
                Qty: {{ it.quantity ?? 1 }}
              </p>
              <!-- ✅ NEW: show refunded quantity (blue) when refund approved for this product -->
              <p
                v-if="refundQtyByProduct[it.productId]"
                class="mt-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400"
              >
                Refunded for {{ refundQtyByProduct[it.productId] }} Qty
              </p>
            </div>
          </div>
          <div class="text-right font-semibold text-slate-900 dark:text-white">
            S${{ ((it.totalPrice ?? it.price * (it.quantity ?? 1)) || 0).toFixed(2) }}
          </div>
        </div>

        <!-- Shipping info -->
        <div class="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <p class="mb-2 font-semibold text-slate-900 dark:text-white">Shipping Information</p>
          <div class="text-sm text-slate-700 dark:text-slate-200">
            <p>{{ order?.shippingAddress?.fullName }}</p>
            <p>{{ order?.shippingAddress?.streetName }} #{{ order?.shippingAddress?.unitNumber }}</p>
            <p>Singapore {{ order?.shippingAddress?.postalCode }}</p>
            <p class="mt-1 text-slate-500 dark:text-slate-400">Tel: {{ order?.shippingAddress?.phoneNumber }}</p>

            <template v-if="order?.status !== 'to_pay' && order?.logistics?.shippedAt">
              <p class="mt-3 text-slate-500 dark:text-slate-400">Carrier: {{ order?.logistics?.shipper || '—' }}</p>
              <p class="text-slate-500 dark:text-slate-400">Tracking: {{ order?.logistics?.trackingNumber || '—' }}</p>
            </template>
          </div>
        </div>

        <!-- Totals -->
        <div class="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-600 dark:text-slate-300">Products Total</span>
            <span class="font-medium text-slate-900 dark:text-white">S${{ (order?.totals?.productsTotalPrice ?? 0).toFixed(2) }}</span>
          </div>
          <div class="mt-1 flex items-center justify-between text-sm">
            <span class="text-slate-600 dark:text-slate-300">Shipping</span>
            <span class="font-medium text-slate-900 dark:text-white">S${{ (order?.totals?.shippingFee ?? 0).toFixed(2) }}</span>
          </div>
          <div class="mt-1 flex items-center justify-between text-sm">
            <span class="text-slate-600 dark:text-slate-300">Discount</span>
            <span class="font-medium text-slate-900 dark:text-white">- S${{ (order?.totals?.discount ?? 0).toFixed(2) }}</span>
          </div>
          <div class="mt-2 border-t border-slate-200 pt-2 dark:border-slate-700" />
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900 dark:text-white">Grand Total</span>
            <span class="text-lg font-bold text-slate-900 dark:text-white">S${{ grand.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Footer buttons -->
        <div class="mt-6 flex items-center justify-between">
          <button
            class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="$emit('buy-again', order)"
          >
            Buy Again
          </button>

          <div class="flex items-center gap-2">
            <button
              v-if="lastStatus !== 'cancelled'"
              class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              @click="$emit('open-refund', order)"
            >
              Refund Details
            </button>

            <button
              class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              @click="$emit('close')"
            >
              Close
            </button>
          </div>
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
defineEmits(['close','open-refund','buy-again'])

function fmt(ts) {
  if (!ts) return '—'
  if (ts.toDate) return ts.toDate().toLocaleString('en-SG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
  try { return new Date(ts).toLocaleString('en-SG') } catch { return '—' }
}

const grand = computed(() => {
  const t = props.order?.totals?.grandTotal
  if (t != null) return Number(t)
  const s = (props.order?.products || []).reduce(
    (a, p) => a + (p.totalPrice ?? (p.price * (p.quantity ?? 1))), 0
  )
  return Number(s.toFixed(2))
})

/* cancellation banner helpers */
const lastEntry = computed(() => {
  const log = props.order?.statusLog || []
  return log.length ? log[log.length - 1] : null
})
const lastStatus = computed(() => lastEntry.value?.status || props.order?.status)
const lastStatusTime = computed(() => lastEntry.value?.time || props.order?.updatedAt || props.order?.createdAt)
const cancelledBy = computed(() => {
  if (lastStatus.value !== 'cancelled') return '—'
  return lastEntry.value?.by === 'seller' ? 'seller' : 'you'
})

/* ✅ NEW: map of refunded quantities per product when refund is approved */
const refundQtyByProduct = computed(() => {
  const s = props.order?.returnRequestSummary
  if (!s || s.state !== 'approved') return {}
  const map = {}
  for (const it of s.items || []) {
    const pid = it?.productId
    const q = Number(it?.quantity ?? 0)
    if (pid && q > 0) map[pid] = (map[pid] || 0) + q
  }
  return map
})
</script>
