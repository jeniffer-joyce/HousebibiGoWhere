<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <!-- Panel -->
      <div
        class="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1
               ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
      >
        <!-- Title (no close button) -->
        <div class="sticky top-0 z-10 bg-green-600 px-5 py-3 text-white">
          <h2 class="text-base font-semibold">Order Details</h2>
        </div>

        <!-- Content -->
        <div class="max-h-[85vh] overflow-y-auto px-5 py-6">
          <!-- Cancelled banner -->
          <div v-if="isCancelled" class="mb-5 rounded-xl bg-emerald-600/90 px-4 py-3 text-white">
            <div class="text-sm font-semibold">
              Order cancelled on {{ formatDate(cancelledTime) }}
            </div>
            <div class="text-sm opacity-90">
              Cancelled by {{ cancelledBy }}
            </div>
          </div>

          <!-- Shipping information -->
          <section class="mb-4 space-y-2">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Shipping Information</h3>
            <div class="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700">
              <div class="font-medium text-slate-900 dark:text-white">
                {{ shippingMethod }}
              </div>

              <!-- Only show logistics when paid OR moved to ship/receive/completed -->
              <div v-if="showLogistics" class="mt-1 text-slate-500">
                Shipper:
                <span class="font-medium text-slate-700 dark:text-slate-200">
                  {{ order?.logistics?.shipper || '—' }}
                </span>
                <span v-if="order?.logistics?.trackingNumber" class="ml-2">
                  • Tracking #: {{ order.logistics.trackingNumber }}
                </span>
              </div>
            </div>
          </section>

          <!-- Delivery information (address) -->
          <section class="mb-4 space-y-2">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Delivery Information</h3>
            <div class="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700">
              <div class="font-medium text-slate-900 dark:text-white">
                {{ order?.shippingAddress?.fullName }}
                <span class="ml-2 text-slate-500">{{ order?.shippingAddress?.phoneNumber }}</span>
              </div>
              <div class="mt-1 text-slate-600 dark:text-slate-300">
                {{ addressLine }}
              </div>
            </div>
          </section>

          <!-- Shop & items -->
          <section class="mb-4">
            <div class="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
              {{ order?.products?.[0]?.shopName || 'Shop' }}
            </div>

            <div
              v-for="(p, i) in order?.products || []"
              :key="i"
              class="mb-3 flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700"
            >
              <div class="flex items-center gap-3">
                <img :src="p.img_url" class="h-14 w-14 rounded-md object-cover" />
                <div>
                  <p class="font-medium text-slate-900 dark:text-white">{{ p.item_name }}</p>
                  <p class="text-xs text-slate-500">
                    Qty: {{ p.quantity }} <span v-if="p.size"> • Size: {{ p.size }}</span>
                  </p>
                </div>
              </div>
              <div class="text-right font-semibold text-slate-900 dark:text-white">
                S${{ (p.totalPrice ?? (p.price * p.quantity)).toFixed(2) }}
              </div>
            </div>

            <div class="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <span class="text-sm text-slate-600 dark:text-slate-300">Order Total:</span>
              <span class="text-lg font-bold text-slate-900 dark:text-white">
                S${{ orderTotal.toFixed(2) }}
              </span>
            </div>
          </section>

          <!-- Support -->
          <section class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <RouterLink
              :to="`/${(order?.products?.[0]?.sellerUsername || 'shop').toLowerCase()}/?id=${order?.products?.[0]?.sellerId || ''}`"
              class="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700">
              Contact Seller
            </RouterLink>
            <a
              href="#"
              class="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700">
              Help Center
            </a>
          </section>

          <!-- Meta -->
          <section class="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div class="text-slate-500">Order ID</div>
                <div class="break-all font-medium text-slate-900 dark:text-white">{{ order?.orderId }}</div>
              </div>
              <div>
                <div class="text-slate-500">Paid by</div>
                <div class="font-medium text-slate-900 dark:text-white">{{ order?.payment?.method || '—' }}</div>
              </div>
              <div>
                <div class="text-slate-500">Order Time</div>
                <div class="font-medium text-slate-900 dark:text-white">{{ formatDate(order?.createdAt) }}</div>
              </div>
              <div>
                <div class="text-slate-500">Payment Time</div>
                <div class="font-medium text-slate-900 dark:text-white">{{ formatDate(order?.payment?.paidAt) }}</div>
              </div>
            </div>
          </section>

          <!-- Footer actions (Buy Again LEFT, Close/Refund RIGHT) -->
          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              class="rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700">
              Buy Again
            </button>

            <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                @click="closeAll"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-700 hover:bg-slate-50 sm:w-auto dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
                Close
              </button>
              <button
                @click="$emit('showRefund')"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-700 hover:bg-slate-50 sm:w-auto dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
                Refund Details
              </button>
            </div>
          </div>
        </div>
        <!-- /content -->
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  visible: { type: Boolean, default: false },
  order:   { type: Object,  default: null  }
})
const emit = defineEmits(['closeAll', 'showRefund'])

/* Totals */
const orderTotal = computed(() => {
  if (props.order?.totals?.grandTotal != null) return Number(props.order.totals.grandTotal)
  const items = props.order?.products || []
  return items.reduce((s, p) => s + (p.totalPrice ?? (p.price * p.quantity)), 0)
})

/* Address line */
const addressLine = computed(() => {
  const a = props.order?.shippingAddress || {}
  const unit = a.unitNumber ? `#${a.unitNumber}` : ''
  return [a.streetName, unit, a.postalCode].filter(Boolean).join(', ')
})

/* Shipping method */
const shippingMethod = computed(() =>
  props.order?.shipping?.method ||
  props.order?.logistics?.deliveryMethod ||
  'Doorstep Delivery'
)

/* Show logistics only when paid or after shipping stage */
const showLogistics = computed(() => {
  const paid = !!props.order?.payment?.paidAt
  const progressed = (props.order?.statusLog || []).some(e =>
    ['to_ship', 'to_receive', 'completed'].includes(e.status)
  )
  return paid || progressed
})

/* Cancelled helpers */
const isCancelled = computed(() => {
  if (props.order?.status === 'cancelled') return true
  return (props.order?.statusLog || []).some(e => e.status === 'cancelled')
})
const cancelledEntry = computed(() => {
  const log = (props.order?.statusLog || []).filter(e => e.status === 'cancelled')
  return log.length ? log[log.length - 1] : null
})
const cancelledTime = computed(() => cancelledEntry.value?.time || props.order?.updatedAt || null)
const cancelledBy = computed(() => {
  const by = cancelledEntry.value?.by
  if (by === 'buyer') return 'you'
  if (by === 'seller') return 'seller'
  return by || 'system'
})

/* Utils */
function formatDate(ts) {
  if (!ts) return '—'
  if (ts.toDate) {
    return ts.toDate().toLocaleString('en-SG', {
      year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'
    })
  }
  try { return new Date(ts).toLocaleString('en-SG') } catch { return '—' }
}

/* Close all */
function closeAll(){ emit('closeAll') }

/* Lock background scroll while open */
function lockBody(){ document.documentElement.style.overflow = 'hidden' }
function unlockBody(){ document.documentElement.style.overflow = '' }
onMounted(() => { if (props.visible) lockBody() })
onBeforeUnmount(() => unlockBody())
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
