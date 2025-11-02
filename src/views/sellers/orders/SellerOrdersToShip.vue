<template>
  <section class="space-y-4">
    <!-- Header -->
    <header class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">To Ship</h2>
        <p class="text-sm text-slate-500">
          Manage new orders in <span class="font-medium">To Process</span>, or reprint AWB under
          <span class="font-medium">Processed</span>.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <input
          v-model="searchQuery"
          type="text"
          class="w-72 rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Search order, buyer, product…"
        />
      </div>
    </header>

    <!-- Tabs -->
    <div class="flex gap-2">
      <button
        class="rounded-full px-3 py-1 text-sm transition"
        :class="tab==='all'
          ? 'bg-blue-600 text-white'
          : 'border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100'"
        @click="tab='all'"
      >All {{ base.length ? `(${base.length})` : '' }}</button>

      <button
        class="rounded-full px-3 py-1 text-sm transition"
        :class="tab==='to_process'
          ? 'bg-blue-600 text-white'
          : 'border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100'"
        @click="tab='to_process'"
      >To Process {{ counts.to_process ? `(${counts.to_process})` : '' }}</button>

      <button
        class="rounded-full px-3 py-1 text-sm transition"
        :class="tab==='processed'
          ? 'bg-blue-600 text-white'
          : 'border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100'"
        @click="tab='processed'"
      >Processed {{ counts.processed ? `(${counts.processed})` : '' }}</button>
    </div>

    <!-- Table -->
    <div class="rounded-2xl border border-slate-200 bg-white">
      <div class="grid grid-cols-12 gap-3 border-b px-4 py-3 text-sm font-semibold text-slate-700">
        <div class="col-span-5">Product(s)</div>
        <div class="col-span-2">Total Price</div>
        <div class="col-span-1">Status</div>
        <div class="col-span-1">Countdown</div>
        <div class="col-span-2">Channel</div>
        <div class="col-span-1 flex items-center justify-end">Actions</div>
      </div>

      <div v-if="!filtered.length" class="px-6 py-12 text-center text-slate-500">No orders available</div>

      <div v-else class="divide-y">
        <div v-for="o in filtered" :key="o.id" class="grid grid-cols-12 gap-3 px-4 py-4">
          <!-- Product(s) -->
          <div class="col-span-5">
            <div class="flex gap-3">
              <img :src="thumbnail(o)" alt="" class="h-12 w-12 rounded-md object-cover ring-1 ring-slate-200" />
              <div class="min-w-0">
                <div class="font-medium whitespace-normal break-words leading-tight">
                  {{ titleLine(o) }}
                  <span class="ml-2 inline-flex items-center whitespace-nowrap rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    No. of products: {{ (o.products || []).length }}
                  </span>
                </div>
                <div class="mt-0.5 text-xs text-slate-500">
                  Order #{{ o.id }} • Buyer: {{ o.buyer?.name || o.shippingAddress?.fullName || '—' }}
                </div>

                <button class="mt-1 text-xs text-blue-700 hover:underline" @click="toggleExpand(o.id)">
                  {{ expanded[o.id] ? 'Hide items' : `View items (${(o.products||[]).length})` }}
                </button>

                <div v-if="expanded[o.id]" class="mt-2 w-[640px] max-w-full rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <table class="w-full table-fixed text-xs">
                    <colgroup>
                      <col class="w-[55%]" /><col class="w-[20%]" /><col class="w-[10%]" /><col class="w-[15%]" />
                    </colgroup>
                    <thead>
                      <tr class="text-slate-500">
                        <th class="text-left font-medium py-1">Item</th>
                        <th class="text-left font-medium py-1">Variant</th>
                        <th class="text-right font-medium py-1">Qty</th>
                        <th class="text-right font-medium py-1">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(p, i) in (o.products||[])" :key="i">
                        <td class="py-1 whitespace-normal break-words">{{ p.item_name || p.name }}</td>
                        <td class="py-1 whitespace-nowrap">{{ p.size || '-' }}</td>
                        <td class="py-1 text-right">{{ p.quantity ?? p.qty ?? 1 }}</td>
                        <td class="py-1 text-right whitespace-nowrap tabular-nums">{{ money(p.price || 0) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="pt-2 text-xs text-slate-500">
                  <template v-if="o.shipping?.arranged && o.shipping?.method === 'dropoff' && !o.shipping?.dropoff?.completed">
                    Drop off at any HouseBiBi Express counter within {{ o.shipping?.dropoff?.windowDays || 3 }} days.
                  </template>

                  <template v-else-if="o.shipping?.arranged && o.shipping?.method === 'pickup' && !o.shipping?.pickup?.completed">
                    Pick-up scheduled
                    <span v-if="o.shipping?.pickup?.date">on {{ o.shipping.pickup.date }}</span>
                    <span v-if="o.shipping?.pickup?.slot"> • {{ o.shipping.pickup.slot }}</span>.
                    Be ready for the courier.
                  </template>

                  <template v-else>
                    To avoid late shipment, please ship out before {{ deadline(o).deadlineStr }}.
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Total (left aligned) -->
          <div class="col-span-2 font-medium">{{ money(total(o)) }}</div>

          <!-- Status -->
          <div class="col-span-1">
            <div class="text-sm font-medium">{{ o.shipping?.dropoff?.completed ? 'Shipping' : 'To ship' }}</div>
          </div>

          <!-- Countdown -->
          <div class="col-span-1">
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs whitespace-nowrap"
              :class="deadline(o).overdue ? 'bg-red-100 text-white-700' : 'bg-yellow-100 text-yellow-800'"
            >
              {{ o.shipping?.dropoff?.completed ? 'In transit' : deadline(o).label }}
            </span>
          </div>

          <!-- Channel -->
          <div class="col-span-2">
            <span class="inline-flex items-center whitespace-nowrap rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              HouseBiBi Express
            </span>
          </div>

          <!-- Actions: 'View Actions' popover -->
          <div class="col-span-1 relative flex items-center justify-end">
          <button
            :class="[
              'rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50 transition',
              openActionsFor === o.id ? 'rounded-b-none border-b-0 bg-slate-50' : ''
            ]"
            @click="toggleActions(o.id)"
          >
            View Actions
          </button>

          <div
            v-if="openActionsFor === o.id"
            class="absolute right-0 top-[calc(100%-1px)] z-20 w-44 rounded-b-xl rounded-t-md
                  border border-slate-200 bg-white shadow-lg"
          >
            <ul class="py-1 text-sm">
              <!-- Not arranged yet -->
              <li v-if="!o.shipping?.arranged">
                <button class="w-full px-3 py-2 text-left hover:bg-slate-50" @click="openChooser(o)">
                  Arrange Shipment
                </button>
              </li>

              <!-- Arranged: Drop-off path (not completed) -->
              <template v-else-if="o.shipping?.method === 'dropoff' && !o.shipping?.dropoff?.completed">
                <li>
                  <button class="w-full px-3 py-2 text-left text-emerald-700 hover:bg-slate-50" @click="openConfirmHandover(o)">
                    Drop-off Done
                  </button>
                </li>
                <li>
                  <button class="w-full px-3 py-2 text-left hover:bg-slate-50" @click="reprintWaybill(o)">
                    Reprint Waybill
                  </button>
                </li>
                <li>
                  <button class="w-full px-3 py-2 text-left hover:bg-slate-50" @click="openDropoffLocations()">
                    Locations
                  </button>
                </li>
              </template>

              <!-- Arranged: Pickup path (not completed) -->
              <template v-else-if="o.shipping?.method === 'pickup' && !o.shipping?.pickup?.completed">
                <li>
                  <button class="w-full px-3 py-2 text-left text-emerald-700 hover:bg-slate-50" @click="openConfirmHandover(o)">
                    Pick-up Done
                  </button>
                </li>
                <li>
                  <button class="w-full px-3 py-2 text-left hover:bg-slate-50" @click="reprintWaybill(o)">
                    Reprint Waybill
                  </button>
                </li>
              </template>

              <!-- Already completed handover -->
              <template v-else>
                <li>
                  <button class="w-full px-3 py-2 text-left hover:bg-slate-50" @click="reprintWaybill(o)">
                    Reprint Waybill
                  </button>
                </li>
              </template>
            </ul>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <teleport to="body">
      <!-- Shipment chooser -->
      <div
        v-if="chooserOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeAll"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <div class="mb-4 flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold">Ship Order</h3>
              <p class="text-sm text-slate-500">#{{ current?.id }}</p>
            </div>
            <button class="text-slate-500" @click="closeAll">✕</button>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button class="rounded-xl border p-4 text-left hover:border-slate-400" @click="confirm('dropoff')">
              <div class="mb-1 font-medium">I Will Dropoff</div>
              <p class="text-sm text-slate-500">Print waybill and drop off at partner counter.</p>
            </button>

            <button class="rounded-xl border p-4 text-left hover:border-slate-400" @click="openPickup(current)">
              <div class="mb-1 font-medium">I Will Arrange Pickup</div>
              <p class="text-sm text-slate-500">Courier collects from your address.</p>
            </button>
          </div>
        </div>
      </div>

      <!-- Pickup form -->
      <div
        v-if="pickupOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeAll"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <div class="mb-4 flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold">Arrange Pickup</h3>
              <p class="text-sm text-slate-500">#{{ current?.id }}</p>
            </div>
            <button class="text-slate-500" @click="closeAll">✕</button>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label class="text-sm">
              Date
              <input type="date" v-model="pickup.date" :min="minDate" class="mt-1 w-full rounded border px-2 py-1" />
            </label>
            <label class="text-sm">
              Timeslot
              <select v-model="pickup.slot" class="mt-1 w-full rounded border px-2 py-1">
                <option value="9-12">9AM – 12PM</option>
                <option value="12-15">12PM – 3PM</option>
                <option value="15-18">3PM – 6PM</option>
              </select>
            </label>
            <label class="col-span-full text-sm">
              Remark
              <input v-model="pickup.remark" placeholder="Optional" class="mt-1 w-full rounded border px-2 py-1" />
            </label>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button class="rounded-md border px-3 py-2 text-sm" @click="closeAll">Back</button>
            <button class="rounded-md bg-blue-600 px-3 py-2 text-sm text-white" @click="confirm('pickup')">Confirm</button>
          </div>
        </div>
      </div>

      <!-- Confirm Drop-off -->
      <!-- Confirm Handover (drop-off or pickup) -->
      <div
        v-if="confirmHandoverOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeConfirmHandover"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <div class="mb-3">
            <h3 class="text-lg font-semibold">
              {{ isPickup(current) ? 'Confirm Pick-up' : 'Confirm Drop-off' }}
            </h3>
            <p class="mt-1 text-sm text-slate-600">
              Confirm that you have {{ isPickup(current) ? 'handed the parcel to the courier for pick-up' : 'dropped off' }}
              <span class="font-medium">Order #{{ current?.id }}</span>
              at a <span class="font-medium">HouseBiBi Express</span> {{ isPickup(current) ? 'pick-up' : 'counter' }}?
            </p>
          </div>

          <ul class="mb-4 list-disc pl-5 text-xs text-slate-500">
            <li>Waybill attached on parcel</li>
            <li>Packed securely, matches declared items</li>
          </ul>

          <div class="flex justify-end gap-2">
            <button class="rounded-md border px-3 py-2 text-sm" @click="closeConfirmHandover">Back</button>
            <button
              class="rounded-md bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-60"
              :disabled="confirming"
              @click="markHandoverDone"
            >
              {{ confirming ? 'Confirming…' : (isPickup(current) ? 'Yes, Pick-up Done' : 'Yes, Drop-off Done') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Drop-off Locations -->
      <div
        v-if="locationsOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeLocations"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold">HouseBiBi Express Drop-off</h3>
              <p class="text-sm text-slate-500">Drop off within 3 days of arranging shipment.</p>
            </div>
            <button class="text-slate-500" @click="closeLocations">✕</button>
          </div>

        <div class="space-y-3">
            <div v-for="loc in LOCATIONS" :key="loc.id" class="rounded-lg border p-3">
              <div class="font-medium">{{ loc.name }}</div>
              <div class="text-sm text-slate-600">{{ loc.address }}</div>
            </div>
          </div>

          <div class="mt-4 text-right">
            <button class="rounded-md border px-3 py-2 text-sm" @click="closeLocations">Close</button>
          </div>
        </div>
      </div>

      <!-- Waybill Modal (instead of new tab) -->
      <div
        v-if="waybillOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeWaybill"
      >
        <div class="w-full max-w-4xl rounded-2xl bg-white p-0 shadow-2xl">
          <div class="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h3 class="text-lg font-semibold">Waybill / Air Waybill</h3>
              <p class="text-xs text-slate-500">Order #{{ waybillOrder?.id }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50" @click="printCurrentWaybill">Print</button>
              <button class="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white" @click="closeWaybill">Back</button>
            </div>
          </div>

          <!-- Printable area -->
          <div id="waybill-print-area" class="max-h-[70vh] overflow-auto p-6">
            <div class="sheet border border-slate-200 p-6">
              <div class="mb-3 flex items-start justify-between text-[13px] text-slate-600">
                <div><strong class="text-slate-900">{{ shopName(waybillOrder) }}</strong><br/>Waybill / Air Waybill</div>
                <div class="text-right">
                  <div>Order: <strong>{{ waybillOrder?.id }}</strong></div>
                  <div>AWB: <strong>{{ awb }}</strong></div>
                  <div>Channel: <strong>HouseBiBi Express</strong></div>
                  <div class="mt-1 font-mono border border-black inline-block px-2 py-1">{{ barcode }}</div>
                </div>
              </div>

              <div class="mb-2 rounded-lg border border-dashed border-slate-300 p-3">
                <div class="text-sm font-semibold">Ship To:</div>
                <div class="text-sm">{{ shipToName(waybillOrder) }}</div>
                <div class="text-sm">{{ shipToAddr(waybillOrder) }}</div>
              </div>

              <div class="mb-2 rounded-lg border border-dashed border-slate-300 p-3">
                <div class="text-sm">
                  <strong>Shipping Method:</strong> {{ waybillOpts?.method?.toUpperCase?.() || 'DROPOFF' }}
                </div>
                <div v-if="waybillOpts?.method==='pickup'" class="text-sm">
                  Pickup Date: {{ waybillOpts?.pickup?.date || '' }} • Timeslot: {{ waybillOpts?.pickup?.slot || '' }}
                </div>
                <div v-else class="text-sm">Drop-off: Please drop within 3 days at partner counter</div>
              </div>

              <table class="w-full border-collapse text-sm">
                <thead>
                  <tr class="bg-slate-50">
                    <th class="border border-slate-200 px-2 py-1 text-left">#</th>
                    <th class="border border-slate-200 px-2 py-1 text-left">Item</th>
                    <th class="border border-slate-200 px-2 py-1 text-left">Variant</th>
                    <th class="border border-slate-200 px-2 py-1 text-right">Qty</th>
                    <th class="border border-slate-200 px-2 py-1 text-right">Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p,i) in (waybillOrder?.products||[])" :key="i">
                    <td class="border border-slate-200 px-2 py-1">{{ i+1 }}</td>
                    <td class="border border-slate-200 px-2 py-1">{{ p.item_name || p.name }}</td>
                    <td class="border border-slate-200 px-2 py-1">{{ p.size || '-' }}</td>
                    <td class="border border-slate-200 px-2 py-1 text-right">{{ p.quantity ?? p.qty ?? 1 }}</td>
                    <td class="border border-slate-200 px-2 py-1 text-right">{{ money(p.price || 0) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th colspan="4" class="border border-slate-200 px-2 py-1 text-right">Total</th>
                    <th class="border border-slate-200 px-2 py-1 text-right">{{ money(total(waybillOrder)) }}</th>
                  </tr>
                </tfoot>
              </table>

              <div class="mt-2 text-xs text-slate-500">Generated by HousebibiGoWhere — attach this page to the parcel.</div>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useToast } from '@/composables/useToast'
import { auth, db } from '@/firebase/firebase_config'
import {
  collection, query, where, orderBy, onSnapshot,
  doc, updateDoc, serverTimestamp, limit, arrayUnion, Timestamp
} from 'firebase/firestore'

const { success, error: toastError } = useToast()

/* Live orders */
const orders = ref([])
let unsubPrimary = null
let unsubFallback = null

onMounted(() => {
  const stop = auth.onAuthStateChanged(u => {
    unsubPrimary?.(); unsubPrimary = null
    unsubFallback?.(); unsubFallback = null
    orders.value = []
    if (!u) return

    const qPrimary = query(collection(db, 'orders'), where('sellerId', '==', u.uid), orderBy('createdAt','desc'))
    unsubPrimary = onSnapshot(qPrimary, snap => {
      const rows = snap.docs.map(d => ({ id:d.id, ...d.data() }))
      if (rows.length) {
        orders.value = rows
        unsubFallback?.(); unsubFallback = null
      } else {
        if (!unsubFallback) {
          const qFallback = query(collection(db, 'orders'), orderBy('createdAt','desc'), limit(200))
          unsubFallback = onSnapshot(qFallback, s2 => {
            const all = s2.docs.map(d => ({ id:d.id, ...d.data() }))
            orders.value = all.filter(o => Array.isArray(o.products) && o.products.some(p => p?.sellerId === u.uid))
          })
        }
      }
    })
  })
  onBeforeUnmount(() => { unsubPrimary?.(); unsubFallback?.(); stop?.() })
})

/* Status util */
const statusOf = (o) => o?.status || (Array.isArray(o?.statusLog) && o.statusLog.length ? o.statusLog.at(-1).status : 'to_ship')

/* UI state */
const tab = ref('to_process')
const searchQuery = ref('')
const expanded = reactive({})
const openActionsFor = ref(null) // which row has the actions popover open

/* Rows */
const base = computed(() =>
  orders.value
  .filter(o => statusOf(o) === 'to_ship')
  .map(o => ({ ...o, __processed: !!o?.shipping?.arranged }))
)
const counts = computed(() => ({
  to_process: base.value.filter(r => !r.__processed).length,
  processed:  base.value.filter(r =>  r.__processed).length,
}))
const filtered = computed(() => {
  let pool = base.value
  if (tab.value==='to_process') pool = pool.filter(r => !r.__processed)
  if (tab.value==='processed')  pool = pool.filter(r =>  r.__processed)
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return pool
  return pool.filter(r =>
    (r.id || '').toLowerCase().includes(q) ||
    (r.buyer?.name || '').toLowerCase().includes(q) ||
    (r.products?.map(p => p.item_name || p.name).join(' ') || '').toLowerCase().includes(q)
  )
})

/* Helpers */
const money = n => '$ ' + (Math.round((n||0)*100)/100).toFixed(2)
const total = o => (o?.products||[]).reduce((s,p)=>s+(p.price||0)*(p.quantity ?? p.qty ?? 1),0)
const titleLine = o => (o.products?.[0]?.item_name || o.products?.[0]?.name || '—')
const thumbnail = o => o.products?.[0]?.img_url || o.products?.[0]?.image || 'https://via.placeholder.com/48x48?text=%20'
function deadline(o){
  const dts = o.shipping?.dts ?? 2
  const created = o.createdAt?.toDate?.() ?? new Date(o.createdAt || Date.now())
  const deadlineAt = new Date(created.getTime() + dts*86400000)
  const days = Math.ceil((deadlineAt - Date.now())/86400000)
  const overdue = days < 0
  const label = overdue ? `Overdue ${Math.abs(days)}d` : (days===0 ? 'Today' : `To ship in ${days}d`)
  return { label, overdue, deadlineStr: deadlineAt.toLocaleDateString() }
}
function toggleExpand(id){ expanded[id] = !expanded[id] }
function toggleActions(id){ openActionsFor.value = openActionsFor.value === id ? null : id }

/* Modals (existing) */
const chooserOpen = ref(false)
const pickupOpen  = ref(false)
const current = ref(null)
const pickup = reactive({ date:'', slot:'9-12', remark:'' })
const minDate = computed(()=>{ const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0] })

/* New modals/state for Drop-off Done + Locations */
const confirmHandoverOpen = ref(false)
function openConfirmHandover(o){ current.value = o; confirmHandoverOpen.value = true; openActionsFor.value = null }
function closeConfirmHandover(){ confirmHandoverOpen.value = false; confirming.value = false }
const isPickup = (ordRef) => (ordRef?.value?.shipping?.method || ordRef?.shipping?.method) === 'pickup'
const locationsOpen = ref(false)
const confirming = ref(false)
const LOCATIONS = [
  { id: 'hbbx-001', name: 'HouseBiBi Hub @ Ang Mo Kio', address: '71 Ang Mo Kio Rd #01-01, 569971' },
  { id: 'hbbx-002', name: 'HouseBiBi Hub @ Tampines',   address: '9 Tampines Ave 3 #02-12, 529889' },
  { id: 'hbbx-003', name: 'HouseBiBi Hub @ Clementi',   address: '315 Clementi Ave 4 #01-23, 120315' },
]

function openChooser(o){ current.value=o; chooserOpen.value=true; openActionsFor.value=null }
function openPickup(o){ current.value=o; pickupOpen.value=true; openActionsFor.value=null }
function openDropoffLocations(){ locationsOpen.value=true; openActionsFor.value=null }
function closeLocations(){ locationsOpen.value=false }
function closeAll(){ chooserOpen.value=false; pickupOpen.value=false; current.value=null; pickup.date=''; pickup.slot='9-12'; pickup.remark='' }

/* Waybill MODAL state */
const waybillOpen = ref(false)
const waybillOrder = ref(null)
const waybillOpts = ref(null)
const awb = computed(()=> `HBBX-${(waybillOrder.value?.id||'').slice(-6).toUpperCase()}-${Date.now().toString().slice(-6)}`)
const barcode = computed(()=> awb.value.replace(/./g,'█'))
const shopName = (o)=> o?.seller?.shopName || o?.seller?.name || (o?.products?.[0]?.shopName) || 'Your Shop'
const shipToName = (o)=> o?.shippingAddress?.fullName || o?.buyer?.name || 'Buyer'
const shipToAddr = (o)=> o?.shippingAddress
  ? [o.shippingAddress.streetName, o.shippingAddress.unitNumber?`#${o.shippingAddress.unitNumber}`:'', o.shippingAddress.postalCode].filter(Boolean).join(', ')
  : '—'

function openWaybillModal(order, opts){ waybillOrder.value = order; waybillOpts.value = opts || { method:'dropoff' }; waybillOpen.value = true }
function closeWaybill(){ waybillOpen.value = false }
function printCurrentWaybill(){ window.print() }

/* Arrange shipment */
async function confirm(method){
  try{
    if(!current.value) return
    if(method==='pickup' && !pickup.date){ toastError('Please choose a pickup date.'); return }
    await arrangeShipment(current.value, { method, pickup: method==='pickup' ? { ...pickup } : null })
    success(method==='pickup' ? 'Pickup scheduled. Waybill prepared…' : 'Drop-off waybill prepared…')
    closeAll()
  }catch(e){ console.error(e); toastError('Failed to arrange shipment.') }
}

async function arrangeShipment(order, opts){
  if(!order?.id) throw new Error('Order missing id')
  if(!opts?.method) throw new Error('Missing shipping method')
  const orderRef = doc(db,'orders',order.id)
  const existing = order.shipping || {}
  await updateDoc(orderRef, {
    status: 'to_ship',
    updatedAt: serverTimestamp(),
    sellerId: order.sellerId || (Array.isArray(order.products) ? order.products[0]?.sellerId : null),
    shipping: {
      ...existing,
      channel: 'HouseBiBi Express',
      channelCapabilities: ['pickup','dropoff'],
      dts: existing.dts || 2,
      arranged: true,
      method: opts.method,
      pickup: opts.method === 'pickup' ? { ...(opts.pickup || {}), windowDays: existing.pickup?.windowDays || 1 } : existing.pickup || null,
      dropoff: opts.method === 'dropoff' ? { ...(existing.dropoff || {}), windowDays: existing.dropoff?.windowDays || 3 } : existing.dropoff || null,
      arrangedAt: serverTimestamp(),
    }
  })
  // show waybill inside modal (no new tab, no auto-print)
  openWaybillModal(order, opts)
}

/* Drop-off Done */
async function markHandoverDone(){
  if (!current.value?.id) return
  confirming.value = true
  try {
    const refDoc = doc(db, 'orders', current.value.id)

    // decide which branch to complete
    const method = current.value?.shipping?.method === 'pickup' ? 'pickup' : 'dropoff'
    const completionField = method === 'pickup'
      ? { 'shipping.pickup.completed': true, 'shipping.pickup.completedAt': serverTimestamp() }
      : { 'shipping.dropoff.completed': true, 'shipping.dropoff.completedAt': serverTimestamp() }

    await updateDoc(refDoc, {
      status: 'to_receive',
      shippedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...completionField,
      statusLog: arrayUnion({
        status: 'to_receive',
        by: 'seller',
        message: method === 'pickup'
          ? 'Seller confirmed parcel picked up by courier'
          : 'Seller confirmed parcel dropped off',
        time: Timestamp.now(), // ✅ allowed inside arrayUnion
      }),
    })

    success(method === 'pickup' ? 'Pick-up confirmed. Order moved to To Receive.' : 'Drop-off confirmed. Order moved to To Receive.')
    closeConfirmHandover()
  } catch (e) {
    console.error(e)
    toastError('Failed to confirm handover.')
    confirming.value = false
  }
}

function reprintWaybill(order){ openWaybillModal(order || current.value, { method:'dropoff' }) }
</script>

<style>
/* Hide common chat FABs on this page */
.intercom-lightweight-app-launcher,
.tawk-button,
.tidio-chat-root,
.chatbot-fab,
button[aria-label="Chat"],
iframe[src*="tawk.to"],
iframe[src*="intercom"] { display: none !important; }

/* Print only the waybill modal content */
@media print {
  body * { visibility: hidden !important; }
  #waybill-print-area, #waybill-print-area * { visibility: visible !important; }
  #waybill-print-area { position: absolute; inset: 0; margin: 0; padding: 0.5in; background: white; }
}
</style>
