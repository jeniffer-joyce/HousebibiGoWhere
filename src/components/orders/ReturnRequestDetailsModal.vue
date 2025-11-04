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
              class="h-2 rounded-full transition-all"
              :class="barClass"
              :style="{ width: barWidth }"
            />
          </div>

          <div
            class="mt-4 flex items-start justify-between"
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
          <p class="font-medium">
            {{ stateBanner }}
          </p>

          <!-- ⬇️ Declined details -->
          <div v-if="state === 'declined'">
            <p v-if="declineReason" class="mt-2">
              <span class="font-semibold">Decline reason:</span>
              {{ declineReason }}
            </p>

            <div
              v-if="declineEvidenceUrls.length"
              class="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6"
            >
              <img
                v-for="(u,i) in declineEvidenceUrls"
                :key="i"
                :src="u"
                @click="openPreview(u)"
                class="h-20 w-full cursor-zoom-in rounded-md object-cover ring-1
                       transition hover:scale-[1.03] hover:ring-rose-400
                       dark:ring-rose-900/40"
                alt="Evidence photo"
              />
            </div>
          </div>
        </div>

        <!-- Scrollable product table -->
        <div v-if="selectedItems.length" class="mt-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <!-- Header -->
          <div
            class="grid grid-cols-12 items-center gap-3 bg-slate-50 px-4 py-2 text-xs font-semibold
                   text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <div class="col-span-6">Product(s)</div>
            <div class="col-span-2 text-right">Unit</div>
            <div class="col-span-2 text-right">Qty</div>
            <div class="col-span-2 text-right">Refund</div>
          </div>

          <!-- Rows -->
          <div class="max-h-72 overflow-auto divide-y divide-slate-200 dark:divide-slate-700">
            <div
              v-for="si in selectedItems"
              :key="si.productId"
              class="grid grid-cols-12 items-center gap-3 px-4 py-3"
            >
              <!-- Product -->
              <div class="col-span-6 flex min-w-0 items-center gap-3">
                <img
                  :src="si.img_url"
                  class="h-12 w-12 flex-none rounded object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  alt="Product image"
                />
                <div class="min-w-0">
                  <p class="truncate font-medium text-slate-900 dark:text-white">{{ si.item_name }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">#{{ si.productId }}</p>
                </div>
              </div>

              <!-- Unit -->
              <div class="col-span-2 text-right tabular-nums text-slate-900 dark:text-white">
                S${{ si.unit.toFixed(2) }}
              </div>

              <!-- Qty -->
              <div class="col-span-2 text-right tabular-nums text-slate-900 dark:text-white">
                {{ si.quantity }}
              </div>

              <!-- Refund -->
              <div class="col-span-2 text-right font-semibold tabular-nums text-slate-900 dark:text-white">
                S${{ si.itemTotal.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="mt-6 flex items-center justify-between border-t pt-4">
          <div class="text-sm text-slate-500 dark:text-slate-400">Total refund amount</div>
          <div class="text-xl font-bold text-slate-900 dark:text-white">
            S${{ totalAmount.toFixed(2) }}
          </div>
        </div>

        <!-- Footer Buttons -->
        <div class="mt-8 flex items-center justify-between">
          <button
            @click="$emit('close')"
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50
                   dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </button>

          <button
            @click="$emit('open-order', order)"
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Order Details
          </button>
        </div>
      </div>
    </div>

    <!-- Image lightbox -->
    <div
      v-if="previewUrl"
      class="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click="closePreview"
    >
      <img
        :src="previewUrl"
        class="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl ring-2 ring-white"
        alt="Preview"
      />
      <button
        class="absolute top-6 right-6 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-700 shadow hover:bg-white"
        @click="closePreview"
      >
        ✕ Close
      </button>
    </div>
  </teleport>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  order:   { type: Object,  default: null }
})
defineEmits(['close','open-order'])

/* ======= Core Data ======= */
const summary = computed(() => props.order?.returnRequestSummary ?? null)
const state   = computed(() => summary.value?.state ?? 'pending')
const isRefund = computed(() => (summary.value?.solution ?? 'refund') === 'refund')

/* ======= Text & UI ======= */
const stateLabel = computed(() =>
  state.value === 'approved' ? 'Approved' :
  state.value === 'declined' ? 'Declined' : 'Pending'
)

const headerLine = computed(() => {
  const amt = Number(summary.value?.amount ?? 0).toFixed(2)
  if (state.value === 'approved')
    return `${isRefund.value ? 'Refund' : 'Return / refund'} approved. S$${amt} will be refunded to the original payment method.`
  if (state.value === 'declined')
    return `${isRefund.value ? 'Refund' : 'Return / refund'} request was declined.`
  return `${isRefund.value ? 'Refund' : 'Return / refund'} requested. S$${amt} will be processed once approved.`
})

/* ======= Progress bar ======= */
const barWidth = computed(() => state.value === 'pending' ? '50%' : '100%')
const barClass = computed(() =>
  state.value === 'pending'
    ? 'bg-amber-400'
    : state.value === 'approved'
      ? 'bg-green-500'
      : 'bg-rose-500'
)
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
  if (state.value === 'pending')
    return `${isRefund.value ? 'Refund' : 'Return / refund'} request is currently under review and being processed.`
  if (state.value === 'approved')
    return `${isRefund.value ? 'Refund' : 'Return / refund'} has been approved.`
  if (state.value === 'declined')
    return `${isRefund.value ? 'Refund' : 'Return / refund'} has been declined.`
  return ''
})
const bannerClass = computed(() =>
  state.value === 'pending'
    ? 'border-amber-200 bg-amber-50 text-amber-800'
    : state.value === 'approved'
      ? 'border-green-200 bg-green-50 text-green-800'
      : 'border-rose-200 bg-rose-50 text-rose-800'
)

/* ======= Decline details ======= */
const declineReason = computed(() => summary.value?.declineReason || '')
const declineEvidenceUrls = computed(() =>
  Array.isArray(summary.value?.declineEvidenceUrls)
    ? summary.value.declineEvidenceUrls
    : []
)

/* ======= Lightbox ======= */
const previewUrl = ref('')
function openPreview(u){ previewUrl.value = u }
function closePreview(){ previewUrl.value = '' }

/* ======= Selected items table ======= */
const selectedItems = computed(() => {
  const items = summary.value?.items
  const products = props.order?.products || []
  if (!Array.isArray(items) || !items.length) return []

  return items.map(it => {
    const p = products.find(x => x.productId === it.productId) || {}
    const qty = Number(it.quantity ?? 0) || 0
    const price = Number(p.price ?? 0)
    const itemTotal = Number(it.itemTotal ?? price * qty) || 0
    const unit = qty > 0 ? itemTotal / qty : (price || 0)
    return {
      productId: it.productId,
      quantity: qty,
      itemTotal,
      unit,
      item_name: p.item_name ?? '—',
      img_url: p.img_url ?? ''
    }
  })
})

const totalAmount = computed(() => {
  const sAmt = Number(summary.value?.amount ?? 0)
  return sAmt > 0 ? sAmt : selectedItems.value.reduce((a, it) => a + (it.itemTotal || 0), 0)
})
</script>
