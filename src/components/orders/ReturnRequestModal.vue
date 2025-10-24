<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" @click="$emit('close')">
      <!-- Dialog -->
      <div
        class="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-800 shadow-xl sm:mx-4
               max-h-[85vh] overflow-y-auto"
        @click.stop
      >
        <!-- Header (no extra close button) -->
        <div
          class="sticky top-0 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur
                 border-b border-slate-200 dark:border-slate-700 p-4 rounded-t-2xl"
        >
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            Request Return/Refund
          </h3>
        </div>

        <!-- Item preview -->
        <div class="p-4 flex items-start gap-3">
          <img :src="firstItem?.img_url" class="h-14 w-14 rounded-md object-cover" alt="">
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-900 dark:text-white truncate">{{ firstItem?.item_name }}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              <span v-if="firstItem?.size">Size: {{ firstItem.size }} • </span>
              Qty: {{ firstItem?.quantity ?? 1 }}
            </p>
          </div>
          <div class="text-right font-semibold text-slate-900 dark:text-white">
            S${{ itemTotal.toFixed(2) }}
          </div>
        </div>

        <!-- Form -->
        <div class="px-4 pb-4 space-y-4">
          <!-- Reason -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Reason <span class="text-red-500">*</span>
            </label>
            <button type="button"
              class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-left
                     text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              @click="showReasonSheet = true">
              <span v-if="reasonKey">{{ reasonsMap[reasonKey].title }}</span>
              <span v-else class="text-slate-400">Select Reason</span>
            </button>
            <p v-if="showErrors && !reasonKey" class="mt-1 text-xs text-red-600">Please select a reason.</p>
          </div>

          <!-- Solution -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Solution <span class="text-red-500">*</span>
            </label>
            <select v-model="solution"
              class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800
                     px-3 py-2 text-slate-700 dark:text-slate-200">
              <option disabled value="">— Select —</option>
              <option value="refund">Refund</option>
              <option value="return_and_refund">Return & Refund</option>
              <option value="replacement">Replacement</option>
            </select>
            <p v-if="showErrors && !solution" class="mt-1 text-xs text-red-600">Please choose a solution.</p>
          </div>

          <!-- Refund to -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Refund To</label>
            <div class="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-200">
              {{ refundTo }}
            </div>
          </div>

          <!-- Total refund -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Total Refund</label>
            <div class="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 font-semibold text-slate-900 dark:text-white">
              S${{ itemTotal.toFixed(2) }}
            </div>
          </div>

          <!-- Description (required) -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Description <span class="text-red-500">*</span>
            </label>
            <textarea v-model.trim="description" rows="5" maxlength="2000"
              placeholder="Describe the issue in detail (required)"
              class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800
                     px-3 py-2 text-slate-700 dark:text-slate-200"></textarea>
            <div class="mt-1 flex justify-between text-xs">
              <span v-if="showErrors && !description" class="text-red-600">Description is required.</span>
              <span class="text-slate-400">{{ description.length }}/2000</span>
            </div>
          </div>

          <!-- Evidence -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Evidence (photos/videos)</label>
            <input type="file" multiple accept="image/*,video/*" @change="onFiles">
            <div class="mt-2 flex flex-wrap gap-2">
              <img v-for="(p, i) in previews" :key="i" :src="p" class="h-16 w-16 rounded-md object-cover" />
            </div>
          </div>

          <!-- Email (auto-filled) -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input v-model.trim="email" type="email"
              class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800
                     px-3 py-2 text-slate-700 dark:text-slate-200" placeholder="you@example.com" />
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 z-10 border-t border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-4 flex items-center justify-between">
          <button @click="$emit('close')"
                  class="rounded-lg bg-white px-4 py-2 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50
                         dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button :disabled="!canSubmit || submitting"
                  @click="submit"
                  class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {{ submitting ? 'Submitting…' : 'Submit' }}
          </button>
        </div>
      </div>

      <!-- Reason chooser -->
      <div v-if="showReasonSheet" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40" @click="showReasonSheet = false">
        <div class="w-full max-w-3xl max-h-[70vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 p-4 sm:mx-4" @click.stop>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-base font-semibold text-slate-900 dark:text-white">Select Reason</h4>
            <button class="rounded-md px-3 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    @click="showReasonSheet = false">Close</button>
          </div>
          <ul>
            <li v-for="r in reasons" :key="r.key"
                class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 py-3">
              <label class="flex items-center gap-3 text-slate-800 dark:text-slate-100 cursor-pointer">
                <input type="radio" class="h-4 w-4" :value="r.key" v-model="reasonKey" />
                <span class="font-medium">{{ r.title }}</span>
              </label>
            </li>
          </ul>
          <div class="mt-3 flex justify-end">
            <button :disabled="!reasonKey"
                    @click="showReasonSheet = false"
                    class="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
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

const props = defineProps({
  visible: { type: Boolean, default: false },
  order:   { type: Object,  default: null }
})
const emit = defineEmits(['submitted', 'close'])

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

/* Form */
const reasonKey   = ref('')
const solution    = ref('')
const description = ref('')
const email       = ref('')
const files       = ref([])
const previews    = ref([])
const showReasonSheet = ref(false)
const submitting  = ref(false)
const showErrors  = ref(false)

/* Autofill email on open */
watch(() => props.visible, (v) => {
  if (v) {
    email.value = auth.currentUser?.email || ''
  }
})

/* Derived */
const firstItem = computed(() => props.order?.products?.[0] || null)
const itemTotal = computed(() => {
  const p = firstItem.value
  if (!p) return 0
  return Number((p.totalPrice ?? (p.price * (p.quantity ?? 1))).toFixed(2))
})
const refundTo = computed(() =>
  props.order?.payment?.method === 'card'
    ? 'Credit/Debit Card'
    : (props.order?.payment?.method || 'Original payment method')
)
const canSubmit = computed(() => !!reasonKey.value && !!solution.value && !!description.value)

/* Files */
function onFiles(e) {
  files.value = Array.from(e.target.files || [])
  previews.value = files.value.map(f => URL.createObjectURL(f))
}

/* Submit */
async function submit() {
  showErrors.value = true
  if (!canSubmit.value || !props.order?.id) return
  submitting.value = true
  try {
    // upload evidence
    const evidenceUrls = []
    for (const f of files.value) {
      const path = `return_requests/${props.order.id}/${Date.now()}_${f.name}`
      const sr = sRef(storage, path)
      await uploadBytes(sr, f)
      evidenceUrls.push(await getDownloadURL(sr))
    }

    // create sub-doc
    const col = collection(doc(db, 'orders', props.order.id), 'return_requests')
    const requestDoc = await addDoc(col, {
      orderId: props.order.orderId,
      reasonKey: reasonKey.value,
      reasonTitle: reasonsMap[reasonKey.value]?.title || '',
      solution: solution.value,
      description: description.value,
      email: email.value || null,
      evidenceUrls,
      itemSnapshot: firstItem.value || null,
      requestedBy: 'buyer',
      requestedAt: Timestamp.now(),
      status: 'pending',
    })

    // update order summary + status
    await updateDoc(doc(db, 'orders', props.order.id), {
      status: 'return_refund',
      statusLog: arrayUnion({ status: 'return_refund', by: 'buyer', time: Timestamp.now() }),
      returnRequestSummary: {
        id: requestDoc.id,
        reasonKey: reasonKey.value,
        reasonTitle: reasonsMap[reasonKey.value]?.title || '',
        solution: solution.value,
        amount: itemTotal.value,
        requestedAt: Timestamp.now(),
        state: 'pending'
      }
    })

    emit('submitted')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
