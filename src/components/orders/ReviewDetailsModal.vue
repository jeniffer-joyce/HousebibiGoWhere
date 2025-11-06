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
        <!-- Header -->
        <div class="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Your Rating</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Order <span class="font-medium">#{{ order?.orderId }}</span>
              · {{ order?.products?.[0]?.shopName || 'Shop' }}
            </p>
             <!-- Review timestamps -->
            <div v-if="reviews.length" class="mt-2 flex flex-wrap items-center gap-2">
              <!-- Original -->
              <span
              class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5
                      text-[10px] sm:text-xs font-medium text-slate-700
                      dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <span class="material-symbols-outlined text-sm">history</span>
                Reviewed at: {{ _formatTime(reviews[0].createdAt) }}
              </span>

              <!-- Updated -->
              <span
                v-if="_isUpdated(reviews[0])"
                class="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5
                      text-[10px] sm:text-xs font-semibold text-blue-700
                      dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
                <span class="material-symbols-outlined text-sm">update</span>
                Updated review at: {{ _formatTime(reviews[0].updatedAt) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-if="loading || (!reviews.length)"
          class="flex h-40 items-center justify-center text-slate-500 dark:text-slate-400"
        >
          <span v-if="loading">Loading…</span>
          <span v-else>No ratings found for this order.</span>
        </div>

        <template v-else>
          <!-- Shop ratings -->
          <div class="mb-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div class="flex flex-wrap items-center justify-between gap-6">
              <!-- Seller -->
              <div class="flex items-center gap-3">
                <span class="font-semibold text-slate-900 dark:text-white">Seller Service</span>
                <div class="flex items-center gap-1">
                  <svg
                    v-for="n in 5" :key="'seller-'+n"
                    class="h-5 w-5"
                    :class="n <= (reviews[0]?.sellerService || 0) ? 'text-blue-500' : 'text-slate-300'"
                    viewBox="0 0 20 20" fill="currentColor"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.802-2.036a1 1 0 00-1.175 0L6.616 16.28c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"
                    />
                  </svg>
                </div>
                <span class="text-sm text-slate-500">
                  {{ (reviews[0]?.sellerService || 0) }}/5
                </span>
              </div>

              <!-- Delivery -->
              <div class="flex items-center gap-3">
                <span class="font-semibold text-slate-900 dark:text-white">Delivery</span>
                <div class="flex items-center gap-1">
                  <svg
                    v-for="n in 5" :key="'delivery-'+n"
                    class="h-5 w-5"
                    :class="n <= (reviews[0]?.delivery || 0) ? 'text-blue-500' : 'text-slate-300'"
                    viewBox="0 0 20 20" fill="currentColor"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.802-2.036a1 1 0 00-1.175 0L6.616 16.28c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"
                    />
                  </svg>
                </div>
                <span class="text-sm text-slate-500">
                  {{ (reviews[0]?.delivery || 0) }}/5
                </span>
              </div>
            </div>
          </div>

          <!-- Product review cards -->
          <div
            v-for="(it, idx) in reviews[0].items"
            :key="idx"
            class="mb-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <div class="flex items-start gap-4">
              <img
                :src="productImg(it)"
                class="h-16 w-16 rounded object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                alt=""
              />
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <p class="text-lg font-semibold text-slate-900 dark:text-white">
                    {{ productName(it) }}
                  </p>
                  <span
                    v-if="it.size"
                    class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700"
                  >
                    Size: {{ it.size }}
                  </span>
                </div>

                <div class="mt-1 flex items-center gap-2">
                  <div class="flex items-center gap-1">
                    <svg
                      v-for="n in 5" :key="n"
                      class="h-4 w-4"
                      :class="n <= (it.rating || 0) ? 'text-blue-500' : 'text-slate-300'"
                      viewBox="0 0 20 20" fill="currentColor"
                    >
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.802-2.036a1 1 0 00-1.175 0L6.616 16.28c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"
                      />
                    </svg>
                  </div>
                  <span class="text-sm text-slate-500">{{ (it.rating || 0) }}/5</span>
                </div>

                <!-- Original comment -->
                <p v-if="it.text" class="mt-2 text-slate-700 dark:text-slate-300">
                  {{ it.text }}
                </p>
                <!-- Updated comment (only if edited) -->
                <div v-if="it.updatedText" class="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2
                                                text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
                  <span class="font-semibold">Updated Comment: </span>
                  <span class="whitespace-pre-line">{{ it.updatedText }}</span>
                </div>

                <!-- Photos -->
                <div v-if="(it.images || []).length" class="mt-3 flex flex-wrap gap-3">
                  <img
                    v-for="(url, pidx) in it.images"
                    :key="pidx"
                    :src="url"
                    class="h-28 w-28 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Footer -->
        <div class="mt-6 flex items-center justify-end gap-2">
          <button
            v-if="reviews.length"
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            @click="$emit('edit', order, reviews)"
          >
            Update Review
          </button>
          <button
            class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200"
            @click="$emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { auth, db } from '@/firebase/firebase_config'
import { collection, query as fsQuery, where, getDocs, orderBy, limit } from 'firebase/firestore'

/* Props / emits */
const props = defineProps({
  visible: { type: Boolean, default: false },
  order: { type: Object, default: null }
})
defineEmits(['close', 'edit'])

/* ---------- Timestamp helpers ---------- */
function _tsToSeconds(ts) {
  if (!ts) return 0
  if (typeof ts.seconds === 'number') return ts.seconds // Firestore Timestamp
  const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts)
  return Math.floor(d.getTime() / 1000)
}

function _isUpdated(doc) {
  const c = _tsToSeconds(doc?.createdAt)
  const u = _tsToSeconds(doc?.updatedAt)
  return u > c
}

function _formatTime(ts) {
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/* Local state */
const loading = ref(false)
const reviews = ref([])

/* Load reviews for this order (by current buyer) */
async function load() {
  if (!props.order?.orderId) { reviews.value = []; return }
  loading.value = true
  try {
    const uid = auth.currentUser?.uid
    // one doc per order (as created by RateOrderModal)
    const q = fsQuery(
      collection(db, 'reviews'),
      where('orderId', '==', props.order.orderId),
      where('buyerId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    )
    const snap = await getDocs(q)
    reviews.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, v => { if (v) load() })
watch(() => props.order?.orderId, () => { if (props.visible) load() })
onMounted(() => { if (props.visible) load() })

/* ---------- Mapping helpers (robust) ---------- */
function matchProduct(item) {
  const products = props.order?.products || []
  if (!products.length || !item) return null

  // strict id matches first
  let matches = products.filter(p =>
    p.productId === item.productId ||
    p.id === item.productId ||
    p.product_id === item.productId ||
    p.skuId === item.productId
  )

  // disambiguate by size if multiple
  if (matches.length > 1 && (item.size ?? null) !== null) {
    const sized = matches.find(p => (p.size ?? null) === (item.size ?? null))
    if (sized) return sized
  }

  // name fallback if id variants didn’t hit
  if (!matches.length) {
    const targetName = (item.productName || item.item_name || '').trim()
    if (targetName) {
      matches = products.filter(p => (p.item_name || '').trim() === targetName)
      if (matches.length > 1 && (item.size ?? null) !== null) {
        const sizedByName = matches.find(p => (p.size ?? null) === (item.size ?? null))
        if (sizedByName) return sizedByName
      }
    }
  }

  return matches[0] || null
}
function productName(item) {
  const p = matchProduct(item)
  return item.productName || p?.item_name || 'Product'
}
function productImg(item) {
  const p = matchProduct(item)
  // ALWAYS use the order product thumbnail here
  return p?.img_url || ''
}
</script>
