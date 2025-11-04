<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[80] flex items-center justify-center bg-black/40"
    @click="$emit('close')"
  >
    <!-- Scrollable dialog -->
    <div
      class="w-full max-w-4xl rounded-2xl bg-white shadow-2xl sm:mx-4
             max-h-[85vh] overflow-y-auto"
      @click.stop
    >
      <!-- Sticky header -->
      <div
        class="sticky top-0 z-10 flex items-start justify-between
               px-6 py-4 border-b
               bg-white/90 backdrop-blur border-slate-200"
      >
        <div>
          <h3 class="text-lg font-semibold text-slate-900">Shipping Details</h3>
          <p class="text-sm text-slate-500">
            Order <span class="font-medium">#{{ order?.orderId || order?.id }}</span>
          </p>
        </div>
        <button class="text-slate-500 hover:text-slate-700" @click="$emit('close')">✕</button>
      </div>

      <!-- Content -->
      <div class="px-6 py-6">
        <!-- Stepper -->
        <ShippingStepper :order="order" :shipping="order?.shipping" :logistics="order?.logistics" />

        <!-- Two-column: address + timeline -->
        <div class="mt-6 grid gap-6 sm:grid-cols-2">
          <!-- Address -->
          <div class="rounded-xl border border-slate-200 p-4">
            <div class="mb-2 text-sm font-semibold">Delivery Address</div>
            <div class="text-sm text-slate-700">
              <div>{{ order?.shippingAddress?.fullName || order?.buyer?.name || '—' }}</div>
              <div>
                {{ order?.shippingAddress?.streetName }}
                <span v-if="order?.shippingAddress?.unitNumber">
                  #{{ order?.shippingAddress?.unitNumber }}
                </span>
              </div>
              <div v-if="order?.shippingAddress?.postalCode">Singapore {{ order?.shippingAddress?.postalCode }}</div>
              <div v-if="order?.shippingAddress?.phone">Tel: {{ order?.shippingAddress?.phone }}</div>
            </div>

            <div class="mt-4 text-sm">
              <div class="text-sm font-semibold">Tracking No.</div>
              <div class="text-sm text-slate-700">
                {{ order?.logistics?.trackingNumber || 'A tracking order number will be given soon' }}
              </div>
            </div>

            <div
              class="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800"
              v-if="order?.shipping?.arranged !== true"
            >
              Seller hasn’t arranged shipment yet. You can still cancel this order.
            </div>
            <div
              class="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800"
              v-else
            >
              Shipment has started with <b>HouseBiBi Express</b>. As the parcel is already in motion,
              cancellation isn’t available at this stage.
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
               px-6 py-4 border-t bg-white/90 backdrop-blur border-slate-200"
      >
        <button
          class="rounded-lg border px-4 py-2 text-slate-700 hover:bg-slate-50"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import ShippingTimeline from './ShippingTimeline.vue'
import ShippingStepper from './ShippingStepper.vue'

defineProps({
  visible: Boolean,
  order: { type: Object, default: null }
})
</script>
