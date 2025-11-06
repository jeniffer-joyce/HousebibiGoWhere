<template>
<Teleport to="body">
  <div
    v-if="visible"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
    @click="$emit('close')"
  >
    <!-- Scrollable dialog -->
    <div
      class="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl sm:mx-4
             max-h-[85vh] overflow-y-auto"
      @click.stop
    >
      <!-- Sticky header -->
      <div
        class="sticky top-0 z-10 flex items-start justify-between
               px-6 py-4 border-b
               bg-white/90 dark:bg-slate-900/90 backdrop-blur 
               border-slate-200 dark:border-slate-700"
      >
        <div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Shipping Details</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Order <span class="font-medium text-slate-900 dark:text-white">#{{ order?.orderId || order?.id }}</span>
          </p>
        </div>
        <button class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl" @click="$emit('close')">✕</button>
      </div>

      <!-- Content -->
      <div class="px-6 py-6">
        <!-- Stepper -->
        <ShippingStepper :order="order" :shipping="order?.shipping" :logistics="order?.logistics" />

        <!-- Two-column: address + timeline -->
        <div class="mt-6 grid gap-6 sm:grid-cols-2">
          <!-- Address -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800/40">
            <div class="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Delivery Address</div>
            <div class="text-sm text-slate-700 dark:text-slate-200 space-y-1.5">
              <div class="font-medium text-slate-900 dark:text-white">{{ order?.shippingAddress?.fullName || order?.buyer?.name || '—' }}</div>
              <div>
                {{ order?.shippingAddress?.streetName }}
                <span v-if="order?.shippingAddress?.unitNumber">
                  #{{ order?.shippingAddress?.unitNumber }}
                </span>
              </div>
              <div v-if="order?.shippingAddress?.postalCode">Singapore {{ order?.shippingAddress?.postalCode }}</div>
              <div v-if="order?.shippingAddress?.phone">Tel: {{ order?.shippingAddress?.phone }}</div>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div class="text-sm font-semibold text-slate-900 dark:text-white mb-2">Tracking No.</div>
              <div class="text-sm text-slate-700 dark:text-slate-200 font-mono bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded border border-slate-200 dark:border-slate-600">
                {{ order?.logistics?.trackingNumber || 'A tracking order number will be given soon' }}
              </div>
            </div>

            <div
              class="mt-4 rounded-lg bg-blue-50 dark:bg-blue-950/40 p-3 text-xs text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800/50"
              v-if="order?.shipping?.arranged !== true"
            >
              Seller hasn't arranged shipment yet. You can still cancel this order.
            </div>
            <div
              class="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50"
              v-else
            >
              Shipment has started with <b class="font-semibold text-amber-900 dark:text-amber-100">HouseBiBi Express</b>. As the parcel is already in motion,
              cancellation isn't available at this stage.
            </div>
          </div>

          <!-- Timeline -->
          <div>
            <ShippingTimeline
              :shipping="order?.shipping"
              :logistics="order?.logistics"
              :delivery="order?.delivery"
              :meta="{ createdAt: order?.createdAt, statusLog: order?.statusLog }"
            />
          </div>
        </div>
      </div>

      <!-- Sticky footer -->
      <div
        class="sticky bottom-0 z-10 flex items-center justify-end gap-2
               px-6 py-4 border-t 
               bg-white/90 dark:bg-slate-900/90 backdrop-blur 
               border-slate-200 dark:border-slate-700"
      >
        <button
          class="rounded-lg border border-slate-300 dark:border-slate-600 
                 px-4 py-2 text-slate-700 dark:text-slate-200 
                 hover:bg-slate-50 dark:hover:bg-slate-800/60
                 transition"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</Teleport>
</template>

<script setup>
import ShippingTimeline from './ShippingTimeline.vue'
import ShippingStepper from './ShippingStepper.vue'

defineProps({
  visible: Boolean,
  order: { type: Object, default: null }
})
</script>