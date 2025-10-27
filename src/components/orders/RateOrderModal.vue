<template>
  <teleport to="body">
    <div
      v-show="visible"
      class="fixed inset-0 z-[120] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />

      <!-- Card -->
      <div
        class="relative z-[121] w-[min(980px,95vw)] max-h-[92vh] overflow-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
        @click.stop
      >
        <!-- Header -->
        <div class="mb-4 flex items-start justify-between gap-4">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
            {{ isEdit ? 'Update Your Review' : 'Rate Your Order' }}
          </h2>
          <button
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200"
            @click="$emit('close')"
          >
            Close
          </button>
        </div>

        <!-- Warning -->
        <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ Once you submit your review, you will no longer be able to request a return or refund for this order.
        </div>

        <p class="mb-5 text-sm text-slate-600 dark:text-slate-300">
          Order <span class="font-medium">#{{ order?.orderId }}</span> · {{ order?.products?.[0]?.shopName || 'Shop' }}
        </p>

        <!-- ===== Product Review Cards ===== -->
        <div
          v-for="(it, idx) in form.items"
          :key="it.key"
          class="mb-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
        >
          <div class="flex items-start gap-3">
            <img :src="it.img_url" class="h-16 w-16 rounded object-cover" />
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <p class="font-semibold text-slate-900 dark:text-white">{{ it.item_name }}</p>
                <span v-if="it.size" class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  Size: {{ it.size }}
                </span>

                <!-- Anonymous toggle (per product) -->
                <label class="ml-auto inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    v-model="it._anonymousBool"
                    class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Review anonymously
                </label>
              </div>

              <!-- Stars -->
              <div class="mt-2 flex items-center gap-1">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  @click="it.rating = n"
                  class="transition"
                  :class="n <= it.rating ? 'text-blue-500' : 'text-slate-300'"
                >
                  <svg class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.802-2.036a1 1 0 00-1.175 0L6.616 16.28c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"
                    />
                  </svg>
                </button>
                <span class="ml-2 text-sm text-slate-500">{{ it.rating ? it.rating + '/5' : 'Tap to rate' }}</span>
              </div>

              <!-- Review text -->
              <textarea
                v-model.trim="it.text"
                class="mt-3 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                placeholder="Share more about the item: quality, fit/sizing, material, value for money…"
                rows="3"
              />

              <!-- Image upload -->
              <div class="mt-4">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Photos (optional)
                </label>
                <div class="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-600">
                  <div
                    v-for="(url, pidx) in it.photoUrls"
                    :key="pidx"
                    class="relative h-20 w-20 overflow-hidden rounded-lg"
                  >
                    <img :src="url" class="h-full w-full object-cover" />
                    <button
                      type="button"
                      class="absolute right-1 top-1 rounded bg-black/60 p-1 text-white"
                      @click="removePhoto(idx, pidx)"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>

                  <label
                    class="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
                  >
                    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M4 5a2 2 0 012-2h2l1-1h6l1 1h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2 0v14h12V5H6zm6 12a4 4 0 100-8 4 4 0 000 8z"
                      />
                    </svg>
                    <span class="text-xs">Add photos</span>
                    <input type="file" accept="image/*" class="hidden" multiple @change="onPickImages($event, idx)" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== Shop Review (Seller/Delivery) ===== -->
        <div class="mb-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 class="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Shop Review</h3>

          <div class="flex flex-col gap-6 sm:flex-row sm:justify-between">
            <!-- Seller service -->
            <div class="flex-1">
              <p class="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Seller Service</p>
              <div class="flex items-center gap-1">
                <button
                  v-for="n in 5"
                  :key="'seller-'+n"
                  type="button"
                  @click="form.sellerService = n"
                  class="transition focus:outline-none"
                  :class="n <= form.sellerService ? 'text-blue-500' : 'text-slate-300'"
                  aria-label="Seller service star"
                >
                  <svg class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.802-2.036a1 1 0 00-1.175 0L6.616 16.28c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Delivery service -->
            <div class="flex-1">
              <p class="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Delivery Service</p>
              <div class="flex items-center gap-1">
                <button
                  v-for="n in 5"
                  :key="'delivery-'+n"
                  type="button"
                  @click="form.delivery = n"
                  class="transition focus:outline-none"
                  :class="n <= form.delivery ? 'text-blue-500' : 'text-slate-300'"
                  aria-label="Delivery service star"
                >
                  <svg class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.802-2.036a1 1 0 00-1.175 0L6.616 16.28c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 flex items-center justify-end gap-2">
          <button
            class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200"
            @click="$emit('close')"
            :disabled="submitting"
          >
            Cancel
          </button>
          <button
            class="rounded-lg px-4 py-2 text-white"
            :class="isFormValid && !submitting ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'"
            :disabled="!isFormValid || submitting"
            @click="submit"
          >
            {{ submitting ? (isEdit ? 'Updating…' : 'Submitting…') : (isEdit ? 'Update Review' : 'Submit Review') }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { reactive, computed, watch, ref } from 'vue'
import { auth, db, storage } from '@/firebase/firebase_config'
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'

// Props / emits
const props = defineProps({
  visible: { type: Boolean, default: false },
  order:   { type: Object,  default: null },
  // pass 'edit' to update; otherwise create
  mode:    { type: String,  default: 'create' },
  // when editing, pass the existing review doc(s); we use the first one
  existingReviews: { type: Array, default: () => [] }
})
const emit = defineEmits(['close','submitted'])

// Local state
const isEdit = computed(() => props.mode === 'edit')
const existing = computed(() => (props.existingReviews?.[0] ?? null))

const form = reactive({
  items: [],            // [{ key, productId, size, item_name, img_url, rating, text, photoUrls, _anonymousBool }]
  sellerService: 0,
  delivery: 0
})

// Prefill for create / edit
watch(
  () => [props.order, isEdit.value, existing.value],
  () => {
    const o = props.order
    if (!o) return

    if (isEdit.value && existing.value) {
      // EDIT: map existing review into the form
      const ex = existing.value
      form.items = (ex.items || []).map((it, i) => {
        const p = (o.products || []).find(pp => pp.productId === it.productId) || {}
        return {
          key: `${it.productId}-${i}`,
          productId: it.productId,
          size: it.size || p.size || null,
          item_name: p.item_name || '—',
          img_url: p.img_url || '',
          rating: Number(it.rating || 0),
          text: it.text || '',
          photoUrls: Array.isArray(it.images) ? [...it.images] : [],
          _anonymousBool: (Number(it.anonymous ?? 0) === 1)
        }
      })
      form.sellerService = Number(ex.sellerService || 0)
      form.delivery      = Number(ex.delivery || 0)
    } else {
      // CREATE: build items from order products
      form.items = (o.products || []).map((p, i) => ({
        key: `${p.productId}-${i}`,
        productId: p.productId,
        size: p.size || null,
        item_name: p.item_name,
        img_url: p.img_url,
        rating: 0,
        text: '',
        photoUrls: [],
        _anonymousBool: false
      }))
      form.sellerService = 0
      form.delivery      = 0
    }
  },
  { immediate: true }
)

// Validation: require rating + text for every item + shop scores
const isFormValid = computed(() =>
  form.items.length > 0 &&
  form.items.every(i => i.rating > 0 && i.text.trim()) &&
  form.sellerService > 0 &&
  form.delivery > 0
)

// Upload images
async function onPickImages(e, itemIdx) {
  try {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const uid = auth.currentUser?.uid
    const orderId = props.order?.id || props.order?.orderId
    for (const f of files) {
      const path = `reviews/${uid}/${orderId}/${Date.now()}_${f.name}`
      const refFile = sRef(storage, path)
      await uploadBytes(refFile, f)
      const url = await getDownloadURL(refFile)
      form.items[itemIdx].photoUrls.push(url)
    }
  } catch (err) {
    console.error('📸 Upload error:', err)
  } finally {
    if (e?.target) e.target.value = ''
  }
}
function removePhoto(itemIdx, pidx) {
  form.items[itemIdx].photoUrls.splice(pidx, 1)
}

// Submit (create or edit)
const submitting = ref(false)
async function submit() {
  if (!isFormValid.value || submitting.value) return
  submitting.value = true
  try {
    const uid = auth.currentUser?.uid
    const orderId = props.order?.orderId
    const sellerId = props.order?.products?.[0]?.sellerId

    const payload = {
      orderId,
      buyerId: uid,
      sellerId,
      // If you also want a top-level anonymous for the whole review, add it here.
      items: form.items.map(i => ({
        productId: i.productId,
        size: i.size,
        rating: i.rating,
        text: i.text,
        images: i.photoUrls,
        // NEW: 0|1 flag per item
        anonymous: i._anonymousBool ? 1 : 0
      })),
      sellerService: form.sellerService,
      delivery: form.delivery
    }

    if (isEdit.value && existing.value?.id) {
      // Update existing review doc
      await updateDoc(doc(db, 'reviews', existing.value.id), {
        ...payload,
        updatedAt: serverTimestamp()
      })
    } else {
      // Create a new review doc
      await addDoc(collection(db, 'reviews'), {
        ...payload,
        createdAt: serverTimestamp()
      })
    }

    emit('submitted')
  } catch (err) {
    console.error('⭐ Review submit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>
