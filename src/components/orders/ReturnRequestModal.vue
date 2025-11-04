<!-- src/components/orders/ReturnRequestModal.vue -->
<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      @click="$emit('close')"
    >
      <!-- Dialog card -->
      <div
        class="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-800 shadow-xl sm:mx-4
               max-h-[85vh] overflow-y-auto"
        @click.stop
      >
        <!-- Header -->
        <div
          class="sticky top-0 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur
                 border-b border-slate-200 dark:border-slate-700 p-4 rounded-t-2xl"
        >
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            Request Return/Refund
          </h3>
        </div>
        <!-- Warning banner -->
        <div class="mx-4 mb-1 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ Once you submit this request, you will no longer be able to leave a review for this order.
        </div>

        <!-- Items from this seller -->
        <div class="p-4 space-y-3">
          <div
            v-for="(p, idx) in sellerItems"
            :key="idx"
            class="rounded-xl border border-slate-200 dark:border-slate-700 p-3"
          >
            <div class="flex items-start justify-between gap-3">
              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  class="mt-2 h-5 w-5"
                  :checked="isSelected(idxInOrder(idx))"
                  @change="toggleItem(idxInOrder(idx))"
                />
                <div class="flex items-start gap-3">
                  <img :src="p.img_url" class="h-14 w-14 rounded object-cover" />
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">
                      {{ p.item_name }}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      Unit: S${{ unitPrice(p).toFixed(2) }}
                    </p>
                  </div>
                </div>
              </label>

              <div class="text-right">
                <p class="text-xs text-slate-500 dark:text-slate-400">Max item total</p>
                <p class="text-lg font-semibold text-slate-900 dark:text-white">
                  S${{ (p.totalPrice ?? p.price * (p.quantity ?? 1)).toFixed(2) }}
                </p>
              </div>
            </div>

            <!-- Qty selector (only when selected and quantity > 1) -->
            <div
              v-if="isSelected(idxInOrder(idx)) && (p.quantity ?? 1) > 1"
              class="mt-3 pl-8 flex items-center gap-3"
            >
              <span class="text-slate-600 dark:text-slate-300 text-sm">Qty to refund:</span>
              <input
                type="number"
                class="w-24 rounded-lg border border-slate-300 dark:border-slate-600 px-2 py-1"
                :min="1"
                :max="p.quantity || 1"
                v-model.number="quantityByIndex[idxInOrder(idx)]"
              />
              <span class="text-slate-400 text-sm">(of {{ p.quantity || 1 }})</span>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="px-4 pb-4 space-y-4">
          <!-- Reason -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Reason <span class="text-red-500">*</span>
            </label>
            <button
              type="button"
              class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-left
                     text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              @click="showReasonSheet = true"
            >
              <span v-if="reasonKey">{{ reasonsMap[reasonKey].title }}</span>
              <span v-else class="text-slate-400">Select Reason</span>
            </button>
            <p v-if="showErrors && !reasonKey" class="mt-1 text-xs text-red-600">
              Please select a reason.
            </p>
          </div>

          <!-- Solution -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Solution <span class="text-red-500">*</span>
            </label>
            <select
              v-model="solution"
              class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800
                     px-3 py-2 text-slate-700 dark:text-slate-200"
            >
              <option disabled value="">— Select —</option>
              <option value="refund">Refund</option>
              <option value="return_and_refund">Return & Refund</option>
              <option value="replacement">Replacement</option>
            </select>
            <p v-if="showErrors && !solution" class="mt-1 text-xs text-red-600">
              Please choose a solution.
            </p>
          </div>

          <!-- Refund to -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Refund To
            </label>
            <div
              class="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-200"
            >
              {{ refundTo }}
            </div>
          </div>

          <!-- Total refund (dynamic) -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Total Refund
            </label>
            <div
              class="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 font-semibold text-slate-900 dark:text-white"
            >
              S${{ totalSelectedAmount.toFixed(2) }}
            </div>
            <p v-if="showErrors && totalSelectedAmount <= 0" class="mt-1 text-xs text-red-600">
              Please select at least one item (and quantity).
            </p>
          </div>

          <!-- Description (required) -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Description <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model.trim="description"
              rows="5"
              maxlength="2000"
              placeholder="Describe the issue in detail (required)"
              class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800
                     px-3 py-2 text-slate-700 dark:text-slate-200"
            />
            <div class="mt-1 flex justify-between text-xs">
              <span v-if="showErrors && !description" class="text-red-600">Description is required.</span>
              <span class="text-slate-400">{{ description.length }}/2000</span>
            </div>
          </div>

          <!-- Evidence -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Evidence (photos/videos)
            </label>

            <!-- Drag-drop zone -->
            <div
              class="rounded-xl border-2 border-dashed px-4 py-6 text-center
                    border-slate-300 hover:border-slate-400
                    dark:border-slate-600 dark:hover:border-slate-500
                    bg-white dark:bg-slate-800 transition"
              @dragover.prevent
              @drop.prevent="onDrop"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*,video/*"
                class="hidden"
                @change="onFilesChange"
              />
              <p class="text-sm text-slate-600 dark:text-slate-300">
                Drag & drop photos here, or
                <button
                  type="button"
                  class="font-semibold text-blue-600 hover:underline"
                  @click="triggerPicker"
                >
                  choose files
                </button>
              </p>
              <p class="mt-1 text-xs text-slate-400">PNG/JPG/WebP/MP4 · Max 10 MB each</p>

              <!-- Previews -->
              <div v-if="previews.length" class="mt-4 flex flex-wrap justify-center gap-2">
                <div
                  v-for="(p, i) in previews"
                  :key="i"
                  class="relative group"
                >
                  <img
                    :src="p"
                    class="h-20 w-20 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <button
                    type="button"
                    class="absolute -right-2 -top-2 rounded-full bg-white/90 px-1 text-slate-600 ring-1 ring-slate-300
                          hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700"
                    @click="removePreview(i)"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <!-- Inline error -->
              <p v-if="fileError" class="mt-3 text-xs text-rose-600">{{ fileError }}</p>
            </div>
          </div>

          <!-- Email (auto-filled) -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input
              v-model.trim="email"
              type="email"
              class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800
                     px-3 py-2 text-slate-700 dark:text-slate-200"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <!-- Footer -->
        <div
          class="sticky bottom-0 z-10 border-t border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-4 flex items-center justify-between"
        >
          <button
            @click="$emit('close')"
            class="rounded-lg bg-white px-4 py-2 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50
                   dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            :disabled="!canSubmit || submitting"
            @click="submit"
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Submitting…' : 'Submit' }}
          </button>
        </div>
      </div>

      <!-- Reason chooser (sheet) -->
      <div
        v-if="showReasonSheet"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
        @click="showReasonSheet = false"
      >
        <div
          class="w-full max-w-3xl max-h-[70vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 p-4 sm:mx-4"
          @click.stop
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-base font-semibold text-slate-900 dark:text-white">Select Reason</h4>
            <button
              class="rounded-md px-3 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
              @click="showReasonSheet = false"
            >
              Close
            </button>
          </div>
          <ul>
            <li
              v-for="r in reasons"
              :key="r.key"
              class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 py-3"
            >
              <label class="flex items-center gap-3 text-slate-800 dark:text-slate-100 cursor-pointer">
                <input type="radio" class="h-4 w-4" :value="r.key" v-model="reasonKey" />
                <span class="font-medium">{{ r.title }}</span>
              </label>
            </li>
          </ul>
          <div class="mt-3 flex justify-end">
            <button
              :disabled="!reasonKey"
              @click="showReasonSheet = false"
              class="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { auth, db, storage } from '@/firebase/firebase_config'
import { doc, updateDoc, arrayUnion, Timestamp, collection, addDoc } from 'firebase/firestore'
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'

/* Props */
const props = defineProps({
  visible: { type: Boolean, default: false },
  order:   { type: Object,  default: null }
})
const emit = defineEmits(['submitted','close'])

/* Reasons */
const reasons = [
  { key: 'missing_part',          title: 'Missing part of the order' },
  { key: 'wrong_item',            title: 'Seller sent wrong item (e.g. wrong size, model)' },
  { key: 'damaged_item',          title: 'Damaged item' },
  { key: 'defective_not_working', title: 'Product is defective or does not work' },
  { key: 'expired',               title: 'Expired product(s)' },
  { key: 'significantly_diff',    title: 'Product is significantly different from description' },
  { key: 'counterfeit',           title: 'Counterfeit product' }
]
const reasonsMap = reasons.reduce((m, r) => (m[r.key] = r, m), {})

/* Form state */
const reasonKey   = ref('')
const solution    = ref('')
const description = ref('')
const email       = ref('')
const files       = ref([])
const previews    = ref([])
const showReasonSheet = ref(false)
const submitting  = ref(false)
const showErrors  = ref(false)

/* Selection state (indices are relative to the *order.products* array) */
const selectedIndices   = ref([])            // number[]
const quantityByIndex   = ref({})            // { [orderIdx: number]: number }

/* Helpers */
const unitPrice = (p) => Number(p.price ?? (p.totalPrice ?? 0) / Math.max(p.quantity ?? 1, 1))

// Only items from this order's seller are shown
const sellerId = computed(() => props.order?.sellerId || props.order?.products?.[0]?.sellerId)
const sellerItems = computed(() =>
  (props.order?.products || [])
    .map((p, idx) => ({ ...p, __orderIdx: idx }))   // ← keep source index
    .filter(p => (p.sellerId || null) === sellerId.value)
)
// Map sellerItems local index to **order.products** index
function idxInOrder(localIdx) {
  return sellerItems.value[localIdx]?.__orderIdx ?? -1
}

/* Autofill email & default select all visible items on open */
watch(() => props.visible, (v) => {
  if (!v) return
  email.value = auth.currentUser?.email || ''
  // preselect all seller items once
  selectedIndices.value = sellerItems.value
    .map((p, i) => idxInOrder(i))
    .filter(i => i >= 0)
  // default quantities: full quantity of each selected item
  const qb = {}
  for (const i of selectedIndices.value) {
    const ip = props.order?.products?.[i]
    qb[i] = Math.max(1, ip?.quantity ?? 1)
  }
  quantityByIndex.value = qb
})

/* Selection toggles */
function isSelected(orderIdx) {
  return selectedIndices.value.includes(orderIdx)
}
function toggleItem(orderIdx) {
  const i = selectedIndices.value.indexOf(orderIdx)
  if (i === -1) {
    selectedIndices.value.push(orderIdx)
    const p = props.order?.products?.[orderIdx]
    quantityByIndex.value = { ...quantityByIndex.value, [orderIdx]: Math.max(1, p?.quantity ?? 1) }
  } else {
    selectedIndices.value.splice(i, 1)
    const qb = { ...quantityByIndex.value }
    delete qb[orderIdx]
    quantityByIndex.value = qb
  }
}

/* Derived */
const refundTo = computed(() =>
  props.order?.payment?.method === 'card'
    ? 'Credit/Debit Card'
    : (props.order?.payment?.method || 'Original payment method')
)

const totalSelectedAmount = computed(() => {
  let sum = 0
  for (const orderIdx of selectedIndices.value) {
    const p = props.order?.products?.[orderIdx]
    if (!p) continue
    const maxQ = Math.max(1, p.quantity ?? 1)
    const q    = Math.max(0, Math.min(Number(quantityByIndex.value[orderIdx] || 0), maxQ))
    sum += unitPrice(p) * q
  }
  return Number(sum.toFixed(2))
})

const canSubmit = computed(() =>
  !!reasonKey.value && !!solution.value && !!description.value && totalSelectedAmount.value > 0
)

/* Files */
const fileInput  = ref(null)
const fileError  = ref('')

function triggerPicker() {
  fileInput.value?.click()
}

function validateFile(f) {
  fileError.value = ''
  if (!f) return false
  const type = f.type || ''
  const sizeMB = f.size / 1048576
  if (!type.startsWith('image/') && !type.startsWith('video/')) {
    fileError.value = 'Only image or video files are allowed.'
    return false
  }
  if (sizeMB > 10) {
    fileError.value = `File too large: ${sizeMB.toFixed(1)} MB (max 10 MB).`
    return false
  }
  return true
}

function onFilesChange(e) {
  const filesList = Array.from(e.target.files || [])
  const valid = []
  const newPreviews = []
  for (const f of filesList) {
    if (validateFile(f)) {
      valid.push(f)
      newPreviews.push(URL.createObjectURL(f))
    }
  }
  files.value = valid
  previews.value = newPreviews
}

function onDrop(e) {
  const dropped = Array.from(e.dataTransfer?.files || [])
  const valid = []
  const newPreviews = []
  for (const f of dropped) {
    if (validateFile(f)) {
      valid.push(f)
      newPreviews.push(URL.createObjectURL(f))
    }
  }
  files.value = valid
  previews.value = newPreviews
}

function removePreview(i) {
  files.value.splice(i, 1)
  previews.value.splice(i, 1)
  if (!files.value.length) fileError.value = ''
}

/* Submit with pinpointed logs */
async function submit() {
  showErrors.value = true
  if (!canSubmit.value || !props.order?.id) return
  submitting.value = true
  try {
    const user = auth.currentUser
    const uid  = user?.uid || 'anon'

    // 1) Upload evidence
    const evidenceUrls = []
    for (const f of files.value) {
      const path = `request_refund/${uid}/${props.order.id}/${Date.now()}_${f.name}`
      const sr = sRef(storage, path)
      await uploadBytes(sr, f)
      evidenceUrls.push(await getDownloadURL(sr))
    }

    // 2) Build items payload from selections
    const itemsPayload = selectedIndices.value.map(orderIdx => {
      const p   = props.order?.products?.[orderIdx]
      const qty = Number(quantityByIndex.value[orderIdx] ?? 0)
      return {
        index: orderIdx,
        productId: p?.productId || null,
        quantity: qty,
        itemTotal: Number((unitPrice(p) * qty).toFixed(2))
      }
    })

    // 3) CREATE sub-doc under /orders/{id}/return_requests
    const subcol = collection(doc(db, 'orders', props.order.id), 'return_requests')
    let requestDoc
    try {
      requestDoc = await addDoc(subcol, {
        orderId: props.order.orderId,
        reasonKey: reasonKey.value,
        reasonLabel: reasonsMap[reasonKey.value]?.title || '',
        reasonDescription: description.value, // buyer's typed text
        solution: solution.value,
        description: description.value,
        email: email.value || null,
        evidenceUrls,
        items: itemsPayload,
        amount: totalSelectedAmount.value,
        requestedBy: 'buyer',
        requestedAt: Timestamp.now(),
        status: 'pending'
      })
    } catch (e) {
      console.error('❌ Firestore DENIED creating /return_requests sub-doc:', e)
      throw e
    }

    // 4) UPDATE parent /orders doc summary + status
    try {
      await updateDoc(doc(db, 'orders', props.order.id), {
      sellerId: props.order?.sellerId || props.order?.products?.[0]?.sellerId || null,
      status: 'return_refund',
      statusLog: arrayUnion({ status:'return_refund', by:'buyer', time: Timestamp.now() }),
        returnRequestSummary: {
          id: requestDoc.id,
          reasonKey: reasonKey.value,
          reasonLabel: reasonsMap[reasonKey.value]?.title || '',
          reasonDescription: description.value,
          solution: solution.value,
          amount: totalSelectedAmount.value,
          requestedAt: Timestamp.now(),
          email: email.value || null,
          photoUrls: evidenceUrls,
          items: itemsPayload,
          state: 'pending'
        }
      })
    } catch (e) {
      console.error('❌ Firestore DENIED updating parent /orders doc:', e)
      throw e
    }

    // Success -> tell parent to close + toast
    emit('submitted')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
