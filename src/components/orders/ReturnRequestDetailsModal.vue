<template>
  <teleport to="body">
    <div
      v-show="visible"
      class="fixed inset-0 z-[120] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />

      <!-- Card -->
      <div
        class="relative z-[121] w-[min(980px,95vw)] max-h-[92vh] overflow-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
        @click.stop
      >
        <!-- Heading -->
        <h2 class="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          {{ isRefund ? 'Refund' : 'Return / Refund' }} Details
        </h2>
        <p class="mb-6 text-slate-600 dark:text-slate-300">
          {{ headerLine }}
        </p>

        <!-- 2-step progress bar -->
        <div class="mb-6">
          <div class="h-2 w-full rounded-full bg-slate-200">
            <div
              class="h-2 rounded-full bg-amber-400 transition-all"
              :style="{ width: barWidth }"
            />
          </div>

          <div
            class="mt-4 flex items-start"
            :class="isRefund ? 'justify-between' : 'justify-between'"
          >
            <!-- Step 1 -->
            <div class="flex w-40 flex-col items-start gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full border-2"
                :class="step1Class"
              >
                1
              </div>
              <div class="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Under review & processing
              </div>
            </div>

            <!-- Step 2 -->
            <div class="flex w-40 flex-col items-end gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full border-2"
                :class="step2Class"
              >
                2
              </div>
              <div class="text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
                {{ state === 'pending' ? 'Awaiting decision' : stateLabel }}
              </div>
            </div>
          </div>
        </div>

        <!-- State banner -->
        <div
          v-if="stateBanner"
          class="mb-6 rounded-xl border px-4 py-3 text-sm"
          :class="bannerClass"
        >
          {{ stateBanner }}
        </div>

        <!-- Selected items (ONLY what buyer picked) -->
        <div
          v-for="si in selectedItems"
          :key="si.productId"
          class="mb-3 flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700"
        >
          <div class="flex items-center gap-3">
            <img :src="si.img_url" class="h-14 w-14 rounded object-cover" alt="" />
            <div>
              <p class="font-semibold text-slate-900 dark:text-white">{{ si.item_name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">x{{ si.quantity }}</p>
            </div>
          </div>
          <div class="text-right font-semibold text-slate-900 dark:text-white">
            S${{ si.itemTotal.toFixed(2) }}
          </div>
        </div>

        <!-- Totals row -->
        <div class="mt-6 flex items-center justify-between border-t pt-4">
          <div class="text-sm text-slate-500 dark:text-slate-400">Total refund amount</div>
          <div class="text-xl font-bold text-slate-900 dark:text-white">
            S${{ totalAmount.toFixed(2) }}
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

/* ======= Safe getters ======= */
const summary = computed(() => props.order?.returnRequestSummary ?? null)
const state   = computed(() => summary.value?.state ?? 'pending')
const isRefund = computed(() => (summary.value?.solution ?? 'refund') === 'refund')

/* Texts */
const stateLabel = computed(() =>
  state.value === 'approved' ? 'Approved' :
  state.value === 'declined' ? 'Declined' : 'Pending'
)

const headerLine = computed(() => {
  const amt = Number(summary.value?.amount ?? 0).toFixed(2)
  if (state.value === 'approved') {
    return `${isRefund.value ? 'Refund' : 'Return / refund'} approved. S$${amt} will be refunded to the original payment method.`
  }
  if (state.value === 'declined') {
    return `${isRefund.value ? 'Refund' : 'Return / refund'} request was declined.`
  }
  return `${isRefund.value ? 'Refund' : 'Return / refund'} requested. S$${amt} ${isRefund.value ? 'will be refunded to card if approved.' : 'will be processed if approved.'}`
})

/* Progress bar logic (2 steps; step 2 anchored to the end for refunds) */
const barWidth = computed(() => {
  if (state.value === 'pending') return '50%'
  return '100%'
})
const step1Class = computed(() =>
  state.value === 'pending'
    ? 'border-amber-400 text-amber-600'
    : 'border-green-500 bg-green-500 text-white'
)
const step2Class = computed(() =>
  state.value === 'pending'
    ? 'border-slate-300 text-slate-400'
    : (state.value === 'approved'
        ? 'border-green-500 bg-green-500 text-white'
        : 'border-rose-500 bg-rose-500 text-white')
)

const stateBanner = computed(() => {
  if (state.value === 'pending') {
    return `${isRefund.value ? 'Refund' : 'Return / refund'} request is currently under review and being processed.`
  }
  if (state.value === 'approved') {
    return `${isRefund.value ? 'Refund' : 'Return / refund'} has been approved.`
  }
  if (state.value === 'declined') {
    return `${isRefund.value ? 'Refund' : 'Return / refund'} has been declined.`
  }
  return ''
})
const bannerClass = computed(() =>
  state.value === 'pending'
    ? 'border-amber-200 bg-amber-50 text-amber-800'
    : state.value === 'approved'
      ? 'border-green-200 bg-green-50 text-green-800'
      : 'border-rose-200 bg-rose-50 text-rose-800'
)

/* ======= Map the buyer-selected items to actual order products ======= */
const selectedItems = computed(() => {
  const items = summary.value?.items
  const products = props.order?.products || []
  if (Array.isArray(items) && items.length) {
    // map each chosen item to the product snapshot
    return items.map(it => {
      const p = products.find(x => x.productId === it.productId) || {}
      return {
        productId: it.productId,
        quantity:  Number(it.quantity ?? 0),
        itemTotal: Number(it.itemTotal ?? (p.price * (it.quantity ?? 0))) || 0,
        item_name: p.item_name ?? '—',
        img_url:   p.img_url ?? '',
      }
    })
  }
  // Fallback: show nothing (user didn’t pick any – unlikely) or show first item
  return []
})

const totalAmount = computed(() => {
  const sAmt = Number(summary.value?.amount ?? 0)
  if (sAmt > 0) return sAmt
  // in case amount not provided, sum selected items
  return selectedItems.value.reduce((a, it) => a + Number(it.itemTotal || 0), 0)
})
</script>
