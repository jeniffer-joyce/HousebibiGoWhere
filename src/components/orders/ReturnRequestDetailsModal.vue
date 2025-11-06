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
          {{ isRefund ? 'Refund' : 'Return & Refund' }} Details
        </h2>
        <p class="mb-6 text-slate-600 dark:text-slate-300">
          {{ headerLine }}
        </p>

        <!-- Dynamic progress bar (2-step for refund, 4-step for return) -->
        <div class="mb-6">
          <div class="h-2 w-full rounded-full bg-slate-200">
            <div
              class="h-2 rounded-full transition-all"
              :class="barClass"
              :style="{ width: barWidth }"
            />
          </div>

          <!-- Refund Only: 2 Steps -->
          <div
            v-if="isRefund"
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

          <!-- Return & Refund: 4 Steps -->
          <div
            v-else
            class="mt-4 grid grid-cols-4 gap-2"
          >
            <!-- Step 1: Under Review -->
            <div class="flex flex-col items-center gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full border-2"
                :class="returnStep1Class"
              >
                1
              </div>
              <div class="text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                Under Review
              </div>
            </div>

            <!-- Step 2: Drop-off -->
            <div class="flex flex-col items-center gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full border-2"
                :class="returnStep2Class"
              >
                2
              </div>
              <div class="text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                Drop-off
              </div>
            </div>

            <!-- Step 3: Awaiting Receipt -->
            <div class="flex flex-col items-center gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full border-2"
                :class="returnStep3Class"
              >
                3
              </div>
              <div class="text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                Awaiting Receipt
              </div>
            </div>

            <!-- Step 4: Refund Processed -->
            <div class="flex flex-col items-center gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full border-2"
                :class="returnStep4Class"
              >
                4
              </div>
              <div class="text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                Refund Processed
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

          <!-- Drop-off locations for approved returns -->
          <div v-if="!isRefund && state === 'approved'" class="mt-3">
            <p class="font-semibold mb-2">Drop-off Locations:</p>
            <div class="space-y-2 text-xs">
              <div class="rounded-lg bg-white/50 dark:bg-slate-900/30 p-2">
                <p class="font-semibold">HouseBiBi Hub @ Ang Mo Kio</p>
                <p class="text-slate-600 dark:text-slate-300">71 Ang Mo Kio Rd #01-01, 569971</p>
              </div>
              <div class="rounded-lg bg-white/50 dark:bg-slate-900/30 p-2">
                <p class="font-semibold">HouseBiBi Hub @ Tampines</p>
                <p class="text-slate-600 dark:text-slate-300">9 Tampines Ave 3 #02-12, 529889</p>
              </div>
              <div class="rounded-lg bg-white/50 dark:bg-slate-900/30 p-2">
                <p class="font-semibold">HouseBiBi Hub @ Clementi</p>
                <p class="text-slate-600 dark:text-slate-300">315 Clementi Ave 4 #01-23, 120315</p>
              </div>
            </div>
            
            <p v-if="dropoffDeadline" class="mt-3 font-semibold text-amber-700 dark:text-amber-300">
              ⏰ Deadline: {{ formatDeadline(dropoffDeadline) }}
            </p>

            <!-- Drop-off confirmation button -->
            <button
              @click="showDropoffConfirm = true"
              class="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Confirm Drop-off
            </button>
          </div>

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
                  <p class="truncate font-medium text-slate-900 dark:text-white">
                    {{ si.item_name }}
                  </p>

                  <!-- ⬇️ ID that adapts to width: wraps on tight, truncates on wide -->
                  <span
                    class="mt-0.5 inline-block max-w-full break-all text-[10px] font-mono
                          text-slate-500 dark:text-slate-400
                          sm:break-normal sm:truncate sm:whitespace-nowrap sm:max-w-[18rem]
                          rounded bg-slate-100/70 px-1.5 py-0.5
                          dark:bg-slate-900/40"
                    :title="si.productId"
                  >
                    #{{ si.productId }}
                  </span>
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

    <!-- Drop-off Confirmation Modal -->
    <div
      v-if="showDropoffConfirm"
      class="fixed inset-0 z-[130] flex items-center justify-center bg-black/50"
      @click="showDropoffConfirm = false"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:mx-4 dark:bg-slate-800"
        @click.stop
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            Confirm Drop-off
          </h3>
        </div>
        
        <p class="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Please confirm that you have successfully dropped off your return parcel at a HouseBiBi Hub. 
          The seller will be notified and will process your refund once they receive the package.
        </p>

        <div class="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 mb-4">
          <p class="text-xs text-amber-800 dark:text-amber-200">
            <b>Note:</b> Only confirm after you've physically dropped off the parcel. You'll receive your refund after the seller confirms receipt.
          </p>
        </div>
        
        <div class="flex justify-end gap-2">
          <button
            @click="showDropoffConfirm = false"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            @click="confirmDropoff"
            :disabled="submitting"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {{ submitting ? 'Confirming...' : 'Confirm Drop-off' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Image lightbox -->
    <div
      v-if="previewUrl"
      class="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-sm"
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
    <!-- Toast Notification -->
    <ToastNotification
      :show="showToast"
      :type="toastConfig.type"
      :title="toastConfig.title"
      :message="toastConfig.message"
      @close="closeToast"
    />
  </teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { db, auth } from '@/firebase/firebase_config'
import { doc, updateDoc, Timestamp } from 'firebase/firestore'
import ToastNotification from '@/components/ToastNotification.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  order:   { type: Object,  default: null }
})
const emit = defineEmits(['close','open-order','dropoff-confirmed'])

// Add these refs for toast
const showToast = ref(false)
const toastConfig = ref({
  type: 'success',
  title: '',
  message: ''
})

function showToastMessage(type, title, message) {
  toastConfig.value = { type, title, message }
  showToast.value = true
}

function closeToast() {
  showToast.value = false
}

/* ======= Core Data ======= */
const summary = computed(() => props.order?.returnRequestSummary ?? null)
const state   = computed(() => summary.value?.state ?? 'pending')
const isRefund = computed(() => (summary.value?.solution ?? 'refund') === 'refund')
const dropoffDeadline = computed(() => summary.value?.dropoffDeadline || null)

/* ======= Drop-off Modal ======= */
const showDropoffConfirm = ref(false)
const submitting = ref(false)

function formatDeadline(ts) {
  if (!ts) return ''
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}

async function confirmDropoff() {
  if (!props.order?.id) return
  submitting.value = true
  
  try {
    const now = Timestamp.now()
    
    await updateDoc(doc(db, 'orders', props.order.id), {
      'returnRequestSummary.state': 'return_dropped_off',
      'returnRequestSummary.droppedOffAt': now,
      'returnRequestSummary.droppedOffBy': auth.currentUser?.uid || null
    })
    
    showDropoffConfirm.value = false
    
    // ✅ Show success toast
    showToastMessage(
      'success',
      'Drop-off Confirmed',
      'The seller has been notified and will process your refund once they receive the package.'
    )
    
    emit('dropoff-confirmed')
    emit('close')
  } catch (e) {
    console.error('Failed to confirm drop-off:', e)
    
    // ✅ Show error toast
    showToastMessage(
      'error',
      'Drop-off Failed',
      'Failed to confirm drop-off. Please try again.'
    )
  } finally {
    submitting.value = false
  }
}

/* ======= Text & UI ======= */
const stateLabel = computed(() =>
  state.value === 'approved' ? 'Approved' :
  state.value === 'declined' ? 'Declined' :
  state.value === 'return_dropped_off' ? 'Dropped Off' :
  state.value === 'return_received' ? 'Refund Processed' : 'Pending'
)

const headerLine = computed(() => {
  const amt = Number(summary.value?.amount ?? 0).toFixed(2)
  
  if (state.value === 'return_received')
    return `Return received. Your refund of S$${amt} has been processed.`
  if (state.value === 'return_dropped_off')
    return `Drop-off confirmed. Waiting for seller to receive your return.`
  if (state.value === 'approved')
    return isRefund.value 
      ? `Refund approved. S$${amt} will be refunded to the original payment method.`
      : `Return approved. Please drop off your return within 3 days.`
  if (state.value === 'declined')
    return `${isRefund.value ? 'Refund' : 'Return & Refund'} request was declined.`
  return `${isRefund.value ? 'Refund' : 'Return & Refund'} requested. S$${amt} will be processed once approved.`
})

/* ======= Progress bar (2-step for refund) ======= */
const barWidth = computed(() => {
  if (isRefund.value) {
    return state.value === 'pending' ? '50%' : '100%'
  } else {
    // 4-step for returns
    if (state.value === 'pending') return '25%'
    if (state.value === 'approved') return '50%'
    if (state.value === 'return_dropped_off') return '75%'
    return '100%' // return_received
  }
})

const barClass = computed(() => {
  if (state.value === 'declined') return 'bg-rose-500'
  if (state.value === 'return_received') return 'bg-green-500'
  if (state.value === 'return_dropped_off') return 'bg-blue-500'
  if (state.value === 'approved') return 'bg-green-500'
  return 'bg-amber-400'
})

// Refund-only steps
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

// Return 4-step classes
const returnStep1Class = computed(() => 
  state.value === 'pending'
    ? 'border-amber-400 bg-amber-400 text-white'
    : 'border-green-500 bg-green-500 text-white'
)

const returnStep2Class = computed(() => {
  if (state.value === 'pending') return 'border-slate-300 text-slate-400'
  if (state.value === 'approved') return 'border-blue-500 bg-blue-500 text-white'
  return 'border-green-500 bg-green-500 text-white'
})

const returnStep3Class = computed(() => {
  if (state.value === 'pending' || state.value === 'approved') 
    return 'border-slate-300 text-slate-400'
  if (state.value === 'return_dropped_off') 
    return 'border-blue-500 bg-blue-500 text-white'
  return 'border-green-500 bg-green-500 text-white'
})

const returnStep4Class = computed(() => {
  if (state.value === 'return_received') 
    return 'border-green-500 bg-green-500 text-white'
  return 'border-slate-300 text-slate-400'
})

const stateBanner = computed(() => {
  if (state.value === 'return_received')
    return 'Return received! Your full refund has been processed and will be refunded back to your original payment soon.'
  
  if (state.value === 'return_dropped_off')
    return 'Drop-off completed. Waiting for the seller to confirm they have received your return.'
  
  if (state.value === 'pending')
    return `${isRefund.value ? 'Refund' : 'Return & Refund'} request is currently under review and being processed.`
  
  if (state.value === 'approved') {
    return isRefund.value
      ? 'Refund has been approved.'
      : 'Return has been accepted! Please drop off your return at a HouseBiBi Hub within 3 days.'
  }
  
  if (state.value === 'declined')
    return `${isRefund.value ? 'Refund' : 'Return & refund'} has been declined.`
  
  return ''
})

const bannerClass = computed(() => {
  if (state.value === 'return_received' || state.value === 'approved')
    return 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200'
  
  if (state.value === 'return_dropped_off')
    return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200'
  
  if (state.value === 'pending')
    return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200'
  
  return 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200'
})

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