<template>
  <div class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 overflow-y-auto">
    <div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
      <!-- Banner -->
      <div class="rounded-xl bg-emerald-600 p-4 text-white">
        <p class="text-lg font-semibold">
          Order Cancelled on {{ cancelledDate }}
        </p>
        <p class="text-sm opacity-90">Cancelled by you</p>
      </div>

      <!-- Shipping Information -->
      <section class="mt-6">
        <h3 class="mb-2 text-base font-semibold text-slate-900 dark:text-white">Shipping Information</h3>
        <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <p class="font-medium text-slate-800 dark:text-slate-100">
            {{ order.shippingAddress?.fullName }}
            <span class="text-slate-500 dark:text-slate-400 ml-2">
              {{ order.shippingAddress?.phoneNumber }}
            </span>
          </p>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {{ order.shippingAddress?.streetName }},
            <span v-if="order.shippingAddress?.unitNumber">#{{ order.shippingAddress.unitNumber }}, </span>
            {{ order.shippingAddress?.postalCode }}
          </p>
        </div>
      </section>

      <!-- Items -->
      <section class="mt-6">
        <div class="mb-2 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">
            {{ order.products?.[0]?.shopName || 'Shop' }}
          </h3>
        </div>

        <div class="rounded-xl border border-slate-200 dark:border-slate-700">
          <div v-for="(p, i) in order.products" :key="i"
               class="flex items-center gap-3 p-4"
               :class="i < order.products.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''">
            <img :src="p.img_url" class="h-16 w-16 rounded-lg object-cover"/>
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-slate-900 dark:text-white">{{ p.item_name }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                Qty: {{ p.quantity }} <span v-if="p.size"> • Size: {{ p.size }}</span>
              </p>
            </div>
            <p class="font-semibold text-slate-900 dark:text-white">
              S${{ (p.totalPrice ?? p.price * p.quantity).toFixed(2) }}
            </p>
          </div>

          <div class="flex items-center justify-between p-4">
            <span class="font-medium text-slate-700 dark:text-slate-200">Order Total:</span>
            <span class="text-lg font-bold text-slate-900 dark:text-white">
              S${{ (order.totals?.grandTotal ?? 0).toFixed(2) }}
            </span>
          </div>
        </div>
      </section>

      <!-- Support / footer -->
      <section class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RouterLink
          :to="`/${(order.products?.[0]?.sellerUsername || 'shop').toLowerCase()}/?id=${order.products?.[0]?.sellerId || ''}`"
          class="rounded-xl border border-slate-200 p-3 text-center font-medium text-slate-700
                 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700">
          Contact Seller
        </RouterLink>

        <button
          class="rounded-xl border border-slate-200 p-3 text-center font-medium text-slate-700
                 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700">
          Help Center
        </button>
      </section>

      <section class="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Order ID</p>
            <p class="font-mono text-slate-900 dark:text-white">{{ order.orderId }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Paid by</p>
            <p class="text-slate-900 dark:text-white">{{ order.payment?.method || '-' }}</p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Order Time</p>
            <p class="text-slate-900 dark:text-white">{{ formatDate(order.createdAt) }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Payment Time</p>
            <p class="text-slate-900 dark:text-white">
              {{ order.payment?.paidAt ? formatDate(order.payment.paidAt) : '—' }}
            </p>
          </div>
        </div>
      </section>

      <div class="mt-6 flex items-center justify-between">
        <button @click="$emit('close')"
                class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50
                       dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
          Close
        </button>
        <div class="flex gap-2">
          <button class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50
                         dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
            Refund Details
          </button>
          <button class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Buy Again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({ order: { type: Object, required: true } })

function formatDate(ts) {
  if (!ts) return '—'
  if (ts.toDate) return ts.toDate().toLocaleString('en-SG')
  try { return new Date(ts).toLocaleString('en-SG') } catch { return '—' }
}

const cancelledDate = computed(() => {
  const log = props.order?.statusLog || []
  const rec = log.find(l => l.status === 'cancelled')
  return rec?.time?.toDate ? rec.time.toDate().toLocaleDateString('en-SG', { day: '2-digit', month: 'short' }) : '—'
})
</script>
