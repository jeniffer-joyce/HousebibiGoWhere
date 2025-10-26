<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 sm:p-10">
    <div class="mx-auto w-full max-w-6xl space-y-8">
      <!-- Title -->
      <header class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
          Return & Refund Requests
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Review and take action on buyers’ return/refund submissions
        </p>
      </header>

      <!-- Search -->
      <div>
        <input
          v-model="queryStr"
          type="text"
          placeholder="Search by order #, buyer email, reason, product…"
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm
                 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <!-- Tabs -->
      <div class="rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="t in tabs" :key="t.key"
            @click="active = t.key"
            class="flex h-11 items-center justify-center gap-2 rounded-xl border transition dark:border-slate-700"
            :class="active === t.key
                     ? 'border-transparent bg-blue-600 text-white'
                     : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200'"
          >
            <span class="text-sm font-medium">{{ t.label }}</span>
            <span
              class="rounded-full px-2 py-0.5 text-xs font-bold bg-blue-600 text-white"
            >
              {{ tabCounts[t.key] }}
            </span>
          </button>
        </div>
      </div>

      <!-- Loading / Empty -->
      <div v-if="loading" class="flex h-48 items-center justify-center text-slate-500 dark:text-slate-400">
        <svg class="mr-2 h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"/>
        </svg>
        Loading requests…
      </div>

      <div
        v-else-if="visibleRequests.length === 0"
        class="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-800"
      >
        <p class="text-lg font-semibold text-slate-900 dark:text-white">No requests found</p>
        <p class="mt-1 text-slate-500 dark:text-slate-400">All caught up here.</p>
      </div>

      <!-- List -->
      <div v-else class="space-y-6">
        <article
          v-for="r in visibleRequests" :key="r.id"
          class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <!-- Header -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-700">
            <div class="flex flex-wrap items-center gap-3 text-sm">
              <span class="text-slate-700 dark:text-slate-200">
                <span class="font-medium">Order #:</span> {{ r.orderId }}
              </span>
              <span class="text-slate-300">•</span>
              <span class="text-slate-700 dark:text-slate-200">
                <span class="font-medium">Buyer email:</span>
                <span class="font-semibold">{{ r.returnRequestSummary?.email || '—' }}</span>
              </span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <span class="text-slate-500 dark:text-slate-400">Requested: {{ formatDate(r.returnRequestSummary?.requestedAt) }}</span>
              <span
                class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                :class="pillClass(r.returnRequestSummary?.state)"
              >
                <span class="h-2 w-2 rounded-full" :class="dotClass(r.returnRequestSummary?.state)"></span>
                {{ r.returnRequestSummary?.state || 'pending' }}
              </span>
            </div>
          </div>

          <!-- Rows: Reason / Description / Evidence / Solution -->
          <div class="divide-y divide-slate-100 dark:divide-slate-700">
            <!-- Reason -->
            <div class="p-4">
              <div class="text-sm font-semibold text-slate-900 dark:text-white mb-1">Reason</div>
              <div class="text-sm text-slate-700 dark:text-slate-200">
                <span class="font-medium">{{ r.returnRequestSummary?.reasonLabel || '—' }}</span>
              </div>
            </div>

            <!-- Buyer Description -->
            <div class="p-4">
              <div class="text-sm font-semibold text-slate-900 dark:text-white mb-1">Buyer Description</div>
              <p class="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                {{ r.returnRequestSummary?.reasonDescription || '—' }}
              </p>
            </div>

            <!-- Evidence -->
            <div class="p-4">
              <div class="text-sm font-semibold text-slate-900 dark:text-white mb-2">Evidence</div>
              <div class="flex flex-wrap gap-2">
                <template v-if="(r.returnRequestSummary?.photoUrls || []).length">
                  <a
                    v-for="(u,i) in r.returnRequestSummary.photoUrls" :key="i" :href="u" target="_blank" rel="noopener"
                    class="block"
                  >
                    <img :src="u" class="h-20 w-20 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                  </a>
                </template>
                <span v-else class="text-sm text-slate-500 dark:text-slate-400">No evidence provided.</span>
              </div>
            </div>

            <!-- Solution -->
            <div class="p-4">
              <div class="text-sm font-semibold text-slate-900 dark:text-white mb-1">Solution</div>
              <div class="text-sm text-slate-700 dark:text-slate-200 capitalize">
                {{ r.returnRequestSummary?.solution || '—' }}
              </div>
            </div>
          </div>

          <!-- Products Requested -->
          <div class="px-4 pt-2">
            <div class="text-sm font-semibold text-slate-900 dark:text-white mb-2">Products Requested</div>
            <div class="space-y-2">
              <template v-if="(r.returnRequestSummary?.items || []).length">
                <div
                  v-for="(it, idx) in r.returnRequestSummary.items"
                  :key="idx"
                  class="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div class="flex items-center gap-3">
                    <img :src="findProductImg(r, it.productId)" class="h-12 w-12 rounded object-cover" alt="">
                    <div>
                      <p class="font-medium text-slate-900 dark:text-white">
                        {{ findProductName(r, it.productId) }}
                      </p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">
                        Qty: {{ it.quantity ?? 1 }}
                      </p>
                    </div>
                  </div>
                  <div class="text-right font-semibold text-slate-900 dark:text-white">
                    S${{ Number(it.itemTotal ?? 0).toFixed(2) }}
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="text-sm text-slate-500 dark:text-slate-400">
                  (No specific items listed by buyer)
                </div>
              </template>
            </div>
          </div>

          <!-- Footer: amount + actions -->
          <div class="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
            <div>
              <p class="text-sm text-slate-500 dark:text-slate-400">Total Refund</p>
              <p class="text-xl font-bold text-slate-900 dark:text-white">
                S${{ Number(r.returnRequestSummary?.amount ?? 0).toFixed(2) }}
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-end gap-2">
              <!-- Approve / Decline (disabled if not pending or once decided) -->
              <button
                :disabled="actionsDisabled(r) || isRowDisabled(r.id)"
                :class="[
                  'rounded-lg px-4 py-2 text-white transition',
                  (actionsDisabled(r) || isRowDisabled(r.id))
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                ]"
                @click="openConfirm(r, 'approved')"
              >
                {{ isRowDisabled(r.id) ? 'Approved' : (isProcessing ? 'Processing…' : 'Approve') }}
              </button>

              <button
                :disabled="actionsDisabled(r) || isRowDisabled(r.id)"
                :class="[
                  'rounded-lg px-4 py-2 text-white transition',
                  (actionsDisabled(r) || isRowDisabled(r.id))
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                ]"
                @click="openConfirm(r, 'declined')"
              >
                {{ isRowDisabled(r.id) ? 'Declined' : (isProcessing ? 'Processing…' : 'Decline') }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Confirm dialog -->
    <div
      v-if="confirm.visible"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
      @click="confirm.visible=false"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:mx-4 dark:bg-slate-800"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
          {{ confirm.action === 'approved' ? 'Approve request?' : 'Decline request?' }}
        </h3>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to <span class="font-medium">{{ confirm.action }}</span> this return/refund for
          <span class="font-medium">Order {{ confirm.target?.orderId }}</span>?
        </p>
        <div class="mt-5 flex justify-end gap-2">
          <button
            @click="confirm.visible=false"
            class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            No, go back
          </button>
          <button
            @click="applyDecision"
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Yes, confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { auth, db } from '@/firebase/firebase_config'
import {
  collection, query as fsQuery, where, orderBy, onSnapshot,
  doc, updateDoc, Timestamp
} from 'firebase/firestore'

/* ------------ UI state ------------ */
const loading = ref(true)
const queryStr = ref('')
const active = ref('all')

/* Confirm modal + processing */
const confirm = ref({ visible: false, action: null, target: null })
const isProcessing = ref(false)

/* Permanently disable decided rows */
const permanentlyDisabled = ref(new Set())
function isRowDisabled(orderId) {
  return permanentlyDisabled.value.has(orderId)
}

/* ------------ Data ------------ */
const requests = ref([])

// Tabs for return/refund state (we filter on client)
const tabs = [
  { key: 'all',      label: 'All' },
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'declined', label: 'Declined' }
]

/* ------------ Fetch seller's requests ------------ */
let unsub = null
onMounted(() => {
  const stop = auth.onAuthStateChanged(async (u) => {
    if (!u) { loading.value = false; return }

    // Load orders for this seller that are in return_refund status, newest first.
    const q = fsQuery(
      collection(db, 'orders'),
      where('sellerId', '==', u.uid),
      where('status', '==', 'return_refund'),
      orderBy('createdAt', 'desc')
    )

    unsub?.()
    unsub = onSnapshot(q, (snap) => {
      requests.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    }, (err) => {
      console.error('ReturnRefund onSnapshot error:', err)
      loading.value = false
    })
  })
  onBeforeUnmount(() => { stop(); unsub?.() })
})

/* ------------ Helpers ------------ */
function statusOf(r) {
  return r?.returnRequestSummary?.state || 'pending'
}
function formatDate(ts) {
  if (!ts) return '—'
  if (ts.toDate) return ts.toDate().toLocaleString('en-SG', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
  try { return new Date(ts).toLocaleString('en-SG') } catch { return '—' }
}

function pillClass(state) {
  switch (state) {
    case 'approved': return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200'
    case 'declined': return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
    default:         return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
  }
}
function dotClass(state) {
  switch (state) {
    case 'approved': return 'bg-green-600'
    case 'declined': return 'bg-rose-600'
    default:         return 'bg-amber-600'
  }
}

/* Tab counts */
const tabCounts = computed(() => {
  const base = requests.value
  return {
    all: base.length,
    pending:  base.filter(r => statusOf(r) === 'pending').length,
    approved: base.filter(r => statusOf(r) === 'approved').length,
    declined: base.filter(r => statusOf(r) === 'declined').length
  }
})

/* Visible (search + tab filter + sort) */
const visibleRequests = computed(() => {
  const q = queryStr.value.trim().toLowerCase()
  const base = active.value === 'all'
    ? requests.value
    : requests.value.filter(r => statusOf(r) === active.value)

  const filtered = q
    ? base.filter(r => {
        const rr = r.returnRequestSummary || {}
        const namesFromItems = (rr.items || []).map(it => findProductName(r, it.productId)).join(' ')
        const hay = [
          r.orderId,
          rr.email,
          rr.reasonLabel,
          rr.reasonDescription,
          rr.solution,
          namesFromItems
        ].join(' ').toLowerCase()
        return hay.includes(q)
      })
    : base

  return filtered.sort((a, b) => {
    const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : +new Date(a.createdAt || 0)
    const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : +new Date(b.createdAt || 0)
    return tb - ta
  })
})

/* Product helpers (find product info for items) */
function findProduct(r, productId) {
  return (r.products || []).find(p => p.productId === productId) || null
}
function findProductImg(r, productId) {
  return findProduct(r, productId)?.img_url || ''
}
function findProductName(r, productId) {
  return findProduct(r, productId)?.item_name || '(Unknown item)'
}

/* Disable logic: disable if not pending, or while processing */
function actionsDisabled(r) {
  const state = statusOf(r)
  return state !== 'pending' || isProcessing.value
}

/* Confirm -> apply decision */
function openConfirm(row, action) {
  confirm.value = { visible: true, action, target: row }
}
async function applyDecision() {
  const row = confirm.value.target
  if (!row) return
  confirm.value.visible = false
  isProcessing.value = true
  const state = confirm.value.action // 'approved' | 'declined'

  try {
    await updateDoc(doc(db, 'orders', row.id), {
      returnRequestSummary: {
        ...row.returnRequestSummary,
        state,
        reviewedAt: Timestamp.now(),
        reviewedBy: auth.currentUser?.uid || null
      },
      statusLog: [
        ...(row.statusLog || []),
        {
          status: state === 'approved' ? 'return_approved' : 'return_declined',
          by: 'seller',
          time: Timestamp.now()
        }
      ]
    })

    // Permanently disable buttons for this order in the UI
    permanentlyDisabled.value.add(row.id)
  } catch (e) {
    console.error('❌ Seller decision update failed:', e)
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
/* subtle hover */
article:hover { transform: translateY(-1px); transition: box-shadow .2s, transform .2s; }

/* scrollbars */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background-color: rgba(100,116,139,0.3); border-radius: 8px; }
::-webkit-scrollbar-thumb:hover { background-color: rgba(100,116,139,0.5); }
</style>
