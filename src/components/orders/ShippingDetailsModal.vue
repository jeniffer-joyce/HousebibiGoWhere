<template>
  <div v-if="visible" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/40" @click="$emit('close')">
    <div class="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl sm:mx-4" @click.stop>
      <!-- header (unchanged) -->
      <div class="mb-4 flex items-start justify-between">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">Shipping Details</h3>
          <p class="text-sm text-slate-500">Order <span class="font-medium">#{{ order?.orderId || order?.id }}</span></p>
        </div>
        <button class="text-slate-500" @click="$emit('close')">✕</button>
      </div>

      <!-- ✅ NEW green stepper -->
      <ShippingStepper :order="order" :shipping="order?.shipping" :logistics="order?.logistics" />

      <!-- two-column: address + vertical timeline (kept) -->
      <div class="mt-6 grid gap-6 sm:grid-cols-2">
        <!-- address card (unchanged)… -->
        <!-- timeline (unchanged)… -->
        <div class="rounded-xl border p-4">
          <div class="mb-2 text-sm font-semibold">Delivery Address</div>
          <div class="text-sm text-slate-700">
            <div>{{ order?.shippingAddress?.fullName || order?.buyer?.name || '—' }}</div>
            <div>
              {{ order?.shippingAddress?.streetName }}
              <span v-if="order?.shippingAddress?.unitNumber"> #{{ order?.shippingAddress?.unitNumber }}</span>
            </div>
            <div v-if="order?.shippingAddress?.postalCode">Singapore {{ order?.shippingAddress?.postalCode }}</div>
            <div v-if="order?.shippingAddress?.phone">Tel: {{ order?.shippingAddress?.phone }}</div>
          </div>
        <div class="mt-2 text-sm">
            <br></br>
            <div class="text-sm font-semibold">Tracking No.</div>
            <div class="text-sm text-slate-700">
                {{ order?.logistics?.trackingNumber || 'A tracking order number will be given soon' }}
            </div>
        </div>

          <div class="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800" v-if="order?.shipping?.arranged !== true">
            Seller hasn’t arranged shipment yet. You can still cancel this order.
          </div>
          <div class="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800" v-else>
            Shipment has started with <b>HouseBiBi Express</b>. As the parcel is already in motion, cancellation isn’t available at this stage.
          </div>
        </div>

        <div>
        <ShippingTimeline
        :shipping="order?.shipping"
        :logistics="order?.logistics"
        :meta="{ createdAt: order?.createdAt, statusLog: order?.statusLog }"
        />
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button class="rounded-lg border px-4 py-2 text-slate-700 hover:bg-slate-50" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ShippingTimeline from './ShippingTimeline.vue'
import ShippingStepper from './ShippingStepper.vue'

const props = defineProps({
  visible: Boolean,
  order: { type: Object, default: null }
})

const cur = computed(() => props.order ? (props.order.status || props.order?.statusLog?.at?.(-1)?.status || 'to_pay') : 'to_pay')

function chipCls(k) {
  const active = rank(cur.value) >= rank(k)
  return active ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500'
}
function dotCls(k) { return rank(cur.value) >= rank(k) ? 'bg-green-600' : 'bg-slate-400' }
function rank(k) {
  return ({ to_pay: 1, to_ship: 2, to_receive: 3, completed: 4 }[k] ?? 0)
}
</script>
