<!-- src/views/sellers/orders/SellerOrdersReviews.vue -->
<template>
  <section class="space-y-6">
    <!-- Header -->
    <header class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Reviews</h2>
          <p class="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            See what buyers said about your products and service.
          </p>
        </div>
        
        <!-- Filter Button -->
        <button 
          @click="showFilters = !showFilters"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
                 border-2 border-slate-200 dark:border-slate-700
                 hover:border-blue-500 dark:hover:border-blue-500
                 hover:bg-blue-50 dark:hover:bg-blue-900/20
                 transition-all shadow-sm hover:shadow-md
                 w-full sm:w-auto justify-center sm:justify-start">
          <span class="material-symbols-outlined text-xl">tune</span>
          <span>Filters</span>
          <span class="material-symbols-outlined text-xl transition-transform" :class="{ 'rotate-180': showFilters }">
            expand_more
          </span>
        </button>
      </div>

      <!-- Filter Panel -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2">
        <div v-if="showFilters" 
             class="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-lg">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Rating Filter -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Rating
              </label>
              <select v-model="filters.rating"
                      class="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                             focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20
                             transition-all">
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars & Up</option>
                <option value="3">3 Stars & Up</option>
                <option value="2">2 Stars & Up</option>
                <option value="1">1 Star & Up</option>
              </select>
            </div>

            <!-- Seller Service Filter -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Seller Service
              </label>
              <select v-model="filters.sellerService"
                      class="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                             focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20
                             transition-all">
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars & Up</option>
                <option value="3">3 Stars & Up</option>
              </select>
            </div>

            <!-- Delivery Filter -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Delivery
              </label>
              <select v-model="filters.delivery"
                      class="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                             focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20
                             transition-all">
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars & Up</option>
                <option value="3">3 Stars & Up</option>
              </select>
            </div>

            <!-- With Photos Filter -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type
              </label>
              <select v-model="filters.hasPhotos"
                      class="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                             focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20
                             transition-all">
                <option value="">All Reviews</option>
                <option value="true">With Photos</option>
                <option value="false">Without Photos</option>
              </select>
            </div>
          </div>

          <!-- Clear Filters Button -->
          <div class="mt-4 flex justify-end">
            <button @click="clearFilters"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                           text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white
                           hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
              <span class="material-symbols-outlined text-lg">clear_all</span>
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </transition>

      <!-- Stats Summary -->
      <div v-if="!loading && list.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
            <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">star</span>
          </div>
          <div class="min-w-0">
            <p class="text-xs text-blue-700 dark:text-blue-300 font-medium">Avg Rating</p>
            <p class="text-xl font-bold text-blue-900 dark:text-blue-100 truncate">{{ averageRating }}/5</p>
          </div>
        </div>

        <!-- Total Ratings -->
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border-2 border-cyan-200 dark:border-cyan-800">
          <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
            <span class="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-xl">fact_check</span>
          </div>
          <div class="min-w-0">
            <p class="text-xs text-cyan-700 dark:text-cyan-300 font-medium">Total Ratings</p>
            <p class="text-xl font-bold text-cyan-900 dark:text-cyan-100 truncate">{{ totalRatings }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800">
          <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl">support_agent</span>
          </div>
          <div class="min-w-0">
            <p class="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Service</p>
            <p class="text-xl font-bold text-emerald-900 dark:text-emerald-100 truncate">{{ averageSellerService }}/5</p>
          </div>
        </div>

        <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800">
          <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
            <span class="material-symbols-outlined text-orange-600 dark:text-orange-400 text-xl">local_shipping</span>
          </div>
          <div class="min-w-0">
            <p class="text-xs text-orange-700 dark:text-orange-300 font-medium">Delivery</p>
            <p class="text-xl font-bold text-orange-900 dark:text-orange-100 truncate">{{ averageDelivery }}/5</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div v-for="i in 6" :key="i" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 animate-pulse">
        <div class="flex items-start justify-between mb-4">
          <div class="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div class="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
        <div class="flex gap-3 mb-4">
          <div class="h-16 w-16 bg-slate-200 dark:bg-slate-700 rounded-xl flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div class="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
        <div class="space-y-2">
          <div class="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div class="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredList.length === 0"
         class="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 sm:p-16 text-center">
      <div class="max-w-sm mx-auto">
        <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <span class="material-symbols-outlined text-4xl sm:text-5xl text-slate-400 dark:text-slate-500">rate_review</span>
        </div>
        <h3 class="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {{ list.length === 0 ? 'No reviews yet' : 'No reviews match your filters' }}
        </h3>
        <p class="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          {{ list.length === 0 ? 'Your product reviews will appear here once customers start leaving feedback.' : 'Try adjusting your filter criteria.' }}
        </p>
      </div>
    </div>

    <!-- Reviews grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <article v-for="r in filteredList" :key="r.id"
               class="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        
        <!-- Card Content -->
        <div class="p-4 sm:p-6">
          <!-- Header: Order ID, Date & Overall Rating -->
          <div class="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 font-mono font-medium text-slate-700 dark:text-slate-200">
                  <span class="material-symbols-outlined text-sm">receipt_long</span>
                  #{{ shortOrder(r) }}
                </span>
                <span class="text-slate-400 dark:text-slate-500">•</span>
                <span class="text-slate-500 dark:text-slate-400">{{ formatDate(r.createdAt) }}</span>
              </div>
            </div>

            <!-- Overall Rating Badge (Blue theme) -->
            <div class="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                        bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30
                        border border-blue-200 dark:border-blue-700 shadow-sm">
              <span class="material-symbols-outlined text-lg text-blue-500 dark:text-blue-400">star</span>
              <span class="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-100">
                {{ (r._primaryItem?.rating || r.sellerService || 0) }}<span class="text-sm font-normal text-blue-700 dark:text-blue-300">/5</span>
              </span>
            </div>
          </div>

          <!-- Product Info -->
          <div class="flex items-start gap-3 sm:gap-4 mb-4">
            <div class="relative flex-shrink-0">
              <img
                :src="r._primaryItem?.img_url || defaultProductThumb"
                class="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-500 dark:group-hover:ring-blue-400 transition-all"
                alt="Product"
              />
            </div>
            
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-base sm:text-lg text-slate-900 dark:text-white mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {{ r._primaryItem?.item_name || 'Product' }}
              </h3>
              
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span v-if="r._primaryItem?.size"
                      class="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <span class="material-symbols-outlined text-xs">straighten</span>
                  {{ r._primaryItem.size }}
                </span>
                <span v-if="r._moreCount > 0" 
                      class="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span class="material-symbols-outlined text-xs">add</span>
                  {{ r._moreCount }} more
                </span>
              </div>

              <!-- Item star rating (Blue theme) -->
              <div class="flex items-center gap-0.5">
                <template v-for="n in 5" :key="'it-'+r.id+n">
                  <span class="material-symbols-outlined text-base transition-all"
                        :class="n <= (r._primaryItem?.rating || 0) ? 'text-blue-500 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'">star</span>
                </template>
                <span class="ml-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">{{ r._primaryItem?.rating || 0 }}/5</span>
              </div>
            </div>
          </div>

          <!-- 🆕 All item ratings in this review -->
          <div v-if="r._itemsMerged?.length > 1" class="mb-4">
            <div class="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-100 dark:border-slate-700">
              <div class="mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-500 dark:text-amber-400 text-base">grade</span>
                <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">All Ratings</p>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(it, idx) in r._itemsMerged"
                  :key="'all-'+r.id+'-'+idx"
                  class="flex items-center justify-between gap-2"
                >
                  <div class="min-w-0 flex items-center gap-2">
                    <span class="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{{ it.item_name || 'Item' }}</span>
                    <span v-if="it.size"
                          class="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <span class="material-symbols-outlined text-[14px]">straighten</span>{{ it.size }}
                    </span>
                  </div>
                  <div class="flex items-center gap-0.5 flex-shrink-0">
                    <template v-for="n in 5" :key="'allstar-'+r.id+'-'+idx+'-'+n">
                      <span class="material-symbols-outlined text-sm"
                            :class="n <= (Number(it?.rating)||0) ? 'text-blue-500 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'">star</span>
                    </template>
                    <span class="ml-1 text-xs font-semibold text-slate-700 dark:text-slate-300">{{ Number(it?.rating)||0 }}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Review Comment -->
          <div v-if="(r._text || r.text || r.comment || r.reviewText || r.content || r.message)" class="mb-4">
            <div class="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 sm:p-4 border border-slate-100 dark:border-slate-700">
              <div class="mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-slate-500 dark:text-slate-400 text-base">chat</span>
                <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">Review Comment</p>
              </div>
              <p class="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                {{ r._text || r.text || r.comment || r.reviewText || r.content || r.message }}
              </p>
            </div>
          </div>

          <!-- Updated Comment -->
          <div v-if="(r._updatedText || r.updatedText || r.updated_comment || r.editedText || r.editText || r.commentUpdated)"
               class="mb-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4">
            <div class="flex items-start gap-2">
              <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg flex-shrink-0 mt-0.5">edit_note</span>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span v-if="updatedAtOf(r)"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800
                                text-xs font-medium text-blue-700 dark:text-blue-300">
                    <span class="material-symbols-outlined text-xs">update</span>
                    {{ formatDate(updatedAtOf(r)) }}
                  </span>
                  <span class="font-semibold text-sm text-blue-900 dark:text-blue-100">Updated Comment</span>
                  <span class="text-blue-700/70 dark:text-blue-300/70">:</span>
                  <span class="text-sm leading-relaxed text-blue-800 dark:text-blue-200 break-words flex-1 min-w-[8rem]">
                    {{ r._updatedText || r.updatedText || r.updated_comment || r.editedText || r.editText || r.commentUpdated }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Review Photos -->
          <div v-if="r.images?.length" class="mb-4">
            <div class="flex flex-wrap gap-2 sm:gap-3">
              <img v-for="(img, i) in r.images" :key="i" :src="img"
                   class="h-16 w-16 sm:h-20 sm:w-20 rounded-lg border-2 border-slate-200 dark:border-slate-700 object-cover hover:scale-110 transition-transform cursor-pointer" 
                   @click="() => {}" />
            </div>
          </div>

          <!-- Service Ratings Footer -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-700">
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
              <!-- Seller Service -->
              <div class="flex flex-col gap-1.5">
                <span class="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Seller Service</span>
                <div class="flex items-center gap-0.5">
                  <template v-for="n in 5" :key="'ss-'+r.id+n">
                    <span class="material-symbols-outlined text-sm transition-all"
                          :class="n <= (r.sellerService || 0) ? 'text-blue-500 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'">star</span>
                  </template>
                  <span class="ml-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">{{ r.sellerService || 0 }}/5</span>
                </div>
              </div>

              <!-- Delivery -->
              <div class="flex flex-col gap-1.5">
                <span class="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Delivery</span>
                <div class="flex items-center gap-0.5">
                  <template v-for="n in 5" :key="'dv-'+r.id+n">
                    <span class="material-symbols-outlined text-sm transition-all"
                          :class="n <= (r.delivery || 0) ? 'text-blue-500 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'">star</span>
                  </template>
                  <span class="ml-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">{{ r.delivery || 0 }}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { auth, db } from '@/firebase/firebase_config'
import {
  collection, query, where, orderBy, onSnapshot, getDoc, doc
} from 'firebase/firestore'

/** ---------- state ---------- */
const loading = ref(true)
const reviews = ref([])
const showFilters = ref(false)
const filters = ref({
  rating: '',
  sellerService: '',
  delivery: '',
  hasPhotos: ''
})

let stopAuth = null
let unsub = null

// tiny img fallback
const defaultProductThumb =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
    <rect width="100%" height="100%" fill="#e5e7eb"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          font-family="Arial" font-size="10" fill="#64748b">No Image</text>
  </svg>`)

/** ---------- order cache & hydration ---------- */
const orderCache = new Map()

async function getOrder(orderId) {
  if (!orderId) return null
  if (orderCache.has(orderId)) return orderCache.get(orderId)
  const snap = await getDoc(doc(db, 'orders', orderId)).catch(() => null)
  const val = snap?.exists() ? { id: snap.id, ...snap.data() } : null
  orderCache.set(orderId, val)
  return val
}
function pickFirst(...vals) {
  for (const v of vals) {
    if (v === undefined || v === null) continue
    if (typeof v === 'string' && v.trim() === '') continue
    return v
  }
  return null
}
function asTs(v) {
  return v || null
}
// join review.items with order.products to get item_name/img_url
async function hydrateReview(r) {
  const order = await getOrder(r.orderId)
  const products = Array.isArray(order?.products) ? order.products : []

  const items = Array.isArray(r.items) ? r.items : []
  const mergedItems = items.map((it) => {
    const p = products.find(pr => String(pr?.productId) === String(it?.productId)) || {}
    return {
      ...it,
      item_name: it.item_name || p.item_name || p.name || 'Product',
      img_url:   it.img_url   || p.img_url   || p.imageUrl || ''
    }
  })

  // normalize common comment fields
  const baseText = pickFirst(r.text, r.comment, r.reviewText, r.content, r.message)
  const updText  = pickFirst(r.updatedText, r.updated_comment, r.editedText, r.editText, r.commentUpdated)

  // normalize updatedAt-ish fields
  const updAt = pickFirst(
    r.updatedAt,
    r.updatedTextUpdatedAt,
    r.updatedAtTime,
    r.updatedOn,
    r.lastUpdatedAt,
    r.modifiedAt,
    r.editedAt,
    r.updateTime
  )

  return {
    ...r,
    _orderShort: order?.orderId || order?.id || r.orderId || '',
    _itemsMerged: mergedItems,
    _primaryItem: mergedItems[0] || {},
    _moreCount: Math.max(0, mergedItems.length - 1),

    // normalized fields used in template
    _text: typeof baseText === 'string' ? baseText.trim() : baseText,
    _updatedText: typeof updText === 'string' ? updText.trim() : updText,
    _updatedAt: asTs(updAt)
  }
}

function updatedAtOf(r) {
  return r?._updatedAt
      || r?.updatedAt
      || r?.updatedTextUpdatedAt
      || r?.updatedAtTime
      || r?.updatedOn
      || r?.lastUpdatedAt
      || r?.modifiedAt
      || r?.editedAt
      || r?.updateTime
      || null
}

function getItemRatings(r) {
  const items = Array.isArray(r._itemsMerged) ? r._itemsMerged : []
  return items
    .map(it => Number(it?.rating || 0))
    .filter(n => Number.isFinite(n) && n > 0)
}
const totalRatings = computed(() => {
  return filteredList.value.reduce((acc, r) => {
    const items = Array.isArray(r._itemsMerged) ? r._itemsMerged
      : (Array.isArray(r.items) ? r.items : [])
    const rated = items.filter(it => Number(it?.rating) > 0).length
    return acc + rated
  }, 0)
})

/** ---------- formatting ---------- */
function formatDate(ts) {
  try {
    const d = ts?.toDate ? ts.toDate() :
      (ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts))
    return d.toLocaleString('en-SG', {
      day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
    })
  } catch { return '' }
}
function shortOrder(r) {
  return r._orderShort || r.orderId || r.id
}

/** ---------- filters ---------- */
function clearFilters() {
  filters.value = {
    rating: '',
    sellerService: '',
    delivery: '',
    hasPhotos: ''
  }
}

const filteredList = computed(() => {
  let result = [...reviews.value]

  // Filter by item-level rating (avg of all items in that review)
  if (filters.value.rating) {
    const minRating = parseInt(filters.value.rating, 10)
    result = result.filter(r => {
      const ratings = getItemRatings(r)
      if (ratings.length === 0) return false
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
      return avg >= minRating
    })
  }

  // Filter by seller service (per review)
  if (filters.value.sellerService) {
    const minService = parseInt(filters.value.sellerService, 10)
    result = result.filter(r => (Number(r.sellerService) || 0) >= minService)
  }

  // Filter by delivery (per review)
  if (filters.value.delivery) {
    const minDelivery = parseInt(filters.value.delivery, 10)
    result = result.filter(r => (Number(r.delivery) || 0) >= minDelivery)
  }

  // With/Without photos
  if (filters.value.hasPhotos !== '') {
    const wantPhotos = filters.value.hasPhotos === 'true'
    result = result.filter(r => {
      const has = Array.isArray(r.images) && r.images.length > 0
      return wantPhotos ? has : !has
    })
  }

  return result
})

/** ---------- computed stats ---------- */
const averageRating = computed(() => {
  const all = filteredList.value.flatMap(r =>
    (Array.isArray(r._itemsMerged) ? r._itemsMerged : (r.items || []))
      .map(it => Number(it?.rating) || 0)
      .filter(n => n > 0)
  )
  if (!all.length) return '0.0'
  const sum = all.reduce((a, b) => a + b, 0)
  return (sum / all.length).toFixed(1)
})

// Per-review averages (unchanged logic, but ensure numeric)
const averageSellerService = computed(() => {
  if (filteredList.value.length === 0) return '0.0'
  const sum = filteredList.value.reduce((a, r) => a + (Number(r.sellerService) || 0), 0)
  return (sum / filteredList.value.length).toFixed(1)
})

const averageDelivery = computed(() => {
  if (filteredList.value.length === 0) return '0.0'
  const sum = filteredList.value.reduce((a, r) => a + (Number(r.delivery) || 0), 0)
  return (sum / filteredList.value.length).toFixed(1)
})

/** ---------- live query ---------- */
onMounted(() => {
  stopAuth = auth.onAuthStateChanged(u => {
    unsub?.(); unsub = null
    reviews.value = []
    loading.value = true
    if (!u) { loading.value = false; return }

    const qRef = query(
      collection(db, 'reviews'),
      where('sellerId', '==', u.uid),
      orderBy('createdAt', 'desc')
    )
    unsub = onSnapshot(qRef, async (snap) => {
      const base = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const enriched = await Promise.all(base.map(hydrateReview))
      reviews.value = enriched
      loading.value = false
    }, () => { loading.value = false })
  })
})
onBeforeUnmount(() => { unsub?.(); stopAuth?.() })

/** ---------- expose ---------- */
const list = computed(() => reviews.value)
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, transform, box-shadow, opacity;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Ensure proper word breaking for long text */
.break-words {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}
</style>
