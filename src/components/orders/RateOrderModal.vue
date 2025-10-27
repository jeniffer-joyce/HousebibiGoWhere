<template>
  <teleport to="body">
    <div
      v-show="visible"
      class="fixed inset-0 z-[120] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
      <div
        class="relative z-[121] w-[min(980px,95vw)] max-h-[92vh] overflow-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
        @click.stop
      >
        <!-- Header -->
        <div class="mb-4 flex items-start justify-between gap-4">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
            {{ mode === 'edit' ? 'Update Your Review' : 'Rate Your Order' }}
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

        <!-- Product Cards -->
        <div
          v-for="(it, idx) in form.items"
          :key="it.key"
          class="mb-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
        >
          <div class="flex items-start gap-3">
            <img :src="it.img_url" class="h-16 w-16 rounded object-cover" />
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <p class="font-semibold text-slate-900 dark:text-white">{{ it.item_name }}</p>
                <span v-if="it.size" class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  Size: {{ it.size }}
                </span>
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
                  aria-label="rate product"
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
                    >
                      ✕
                    </button>
                  </div>
                  <label class="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300">
                    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 5a2 2 0 012-2h2l1-1h6l1 1h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2 0v14h12V5H6zm6 12a4 4 0 100-8 4 4 0 000 8z"/>
                    </svg>
                    <span class="text-xs">Add photos</span>
                    <input type="file" accept="image/*" class="hidden" multiple @change="onPickImages($event, idx)" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Seller & Delivery -->
        <div class="mb-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 class="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Shop Review</h3>
          <div class="flex justify-between gap-6">
            <div class="flex-1">
              <p class="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Seller Service</p>
              <div class="flex items-center gap-1">
                <button
                  v-for="n in 5"
                  :key="'seller-'+n"
                  type="button"
                  @click="form.sellerService = n"
                  :class="n <= form.sellerService ? 'text-blue-500' : 'text-slate-300'"
                  aria-label="seller service star"
                >
                  <svg class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.802-2.036a1 1 0 00-1.175 0L6.616 16.28c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex-1">
              <p class="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Delivery Service</p>
              <div class="flex items-center gap-1">
                <button
                  v-for="n in 5"
                  :key="'delivery-'+n"
                  type="button"
                  @click="form.delivery = n"
                  :class="n <= form.delivery ? 'text-blue-500' : 'text-slate-300'"
                  aria-label="delivery service star"
                >
                  <svg class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.802-2.036a1 1 0 00-1.175 0L6.616 16.28c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 flex items-center justify-end gap-2">
          <button
            class="rounded-lg px-4 py-2 text-white"
            :class="isFormValid && !submitting ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'"
            :disabled="!isFormValid || submitting"
            @click="submit"
          >
            {{ submitting ? (mode === 'edit' ? 'Updating…' : 'Submitting…') : (mode === 'edit' ? 'Update Review' : 'Submit Review') }}
          </button>
          <button
            class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200"
            @click="$emit('close')"
            :disabled="submitting"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { reactive, computed, watch, ref } from 'vue'
import { auth, db, storage } from '@/firebase/firebase_config'
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore'
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'

/* Props/emits */
const props = defineProps({
  visible: Boolean,
  order: Object,
  mode: { type: String, default: 'create' },           // 'create' | 'edit'
  existingReviews: { type: Array, default: () => [] }  // from ReviewDetailsModal
})
const emit = defineEmits(['close','submitted'])

/* Local model */
const form = reactive({
  items: [],
  sellerService: 0,
  delivery: 0
})
const reviewDocId = ref(null) // used for edit

/* ---------- Prefill logic ---------- */
function buildBlankItemsFromOrder(o) {
  return (o.products || []).map((p, i) => ({
    key: `${p.productId}-${i}`,
    productId: p.productId,
    size: p.size || null,
    item_name: p.item_name,
    img_url: p.img_url,
    rating: 0,
    text: '',
    photoUrls: []
  }))
}

function hydrateFromExisting(existingDoc) {
  // set stars
  form.sellerService = Number(existingDoc?.sellerService || 0)
  form.delivery      = Number(existingDoc?.delivery || 0)

  // map each order product to existing review item by (productId + size)
  const byKey = new Map(
    (existingDoc?.items || []).map(it => [
      `${it.productId || ''}__${it.size || ''}`,
      it
    ])
  )
  form.items = (props.order?.products || []).map((p, idx) => {
    const key = `${p.productId || ''}__${p.size || ''}`
    const prev = byKey.get(key)
    return {
      key: `${p.productId}-${idx}`,
      productId: p.productId,
      size: p.size || null,
      item_name: p.item_name,
      img_url: p.img_url,
      rating: Number(prev?.rating || 0),
      text: prev?.text || '',
      photoUrls: Array.isArray(prev?.images) ? [...prev.images] : []
    }
  })
}

watch(
  () => [props.order, props.mode, props.existingReviews, props.visible],
  () => {
    if (!props.visible || !props.order) return
    if (props.mode === 'edit' && props.existingReviews?.length) {
      const doc0 = props.existingReviews[0]
      reviewDocId.value = doc0.id
      hydrateFromExisting(doc0)
    } else {
      reviewDocId.value = null
      form.items = buildBlankItemsFromOrder(props.order)
      form.sellerService = 0
      form.delivery = 0
    }
  },
  { immediate: true }
)

/* ---------- Validation ---------- */
const isFormValid = computed(() =>
  form.items.length > 0 &&
  form.items.every(i => i.rating > 0 && i.text.trim()) &&
  form.sellerService > 0 &&
  form.delivery > 0
)

/* ---------- Image upload ---------- */
async function onPickImages(e, itemIdx) {
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
  e.target.value = ''
}
function removePhoto(itemIdx, pidx) {
  form.items[itemIdx].photoUrls.splice(pidx, 1)
}

/* ---------- Submit ---------- */
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
      items: form.items.map(i => ({
        productId: i.productId,
        size: i.size,
        rating: i.rating,
        text: i.text,
        images: i.photoUrls
      })),
      sellerService: form.sellerService,
      delivery: form.delivery
    }

    if (props.mode === 'edit' && reviewDocId.value) {
      await updateDoc(doc(db, 'reviews', reviewDocId.value), {
        ...payload,
        updatedAt: serverTimestamp()
      })
    } else {
      await addDoc(collection(db, 'reviews'), {
        ...payload,
        createdAt: serverTimestamp()
      })
    }

    emit('submitted')
  } finally {
    submitting.value = false
  }
}
</script>
