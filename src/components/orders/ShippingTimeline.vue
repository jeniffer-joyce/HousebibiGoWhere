<template>
  <div class="border-l-2 border-slate-200 pl-7 space-y-4">
    <div v-for="(ev, i) in orderedEvents" :key="i" class="relative">
      <!-- node: latest = green, others grey -->
      <div
        class="absolute -left-3 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white"
        :class="i === 0 ? 'bg-green-600' : 'bg-slate-400'"
      />
      <div class="text-xs text-slate-500">{{ fmt(ev.time) }}</div>
      <div class="font-semibold text-sm leading-tight">
        {{ ev.label || ev.text || '—' }}
      </div>
      <div v-if="ev.text && ev.text !== ev.label" class="text-sm text-slate-600">
        {{ ev.text }}
      </div>

      <!-- ✅ Show proof button directly below the Delivered text -->
      <div
        v-if="(ev.key === 'delivered' || ev.label?.toLowerCase()?.includes('delivered')) && delivery?.proofUrl"
        class="mt-2 flex items-center gap-3"
      >
        <a
          :href="delivery.proofUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
        >
          View proof photo
        </a>
        <img
          :src="delivery.proofUrl"
          alt="Proof thumbnail"
          class="h-10 w-10 rounded-md object-cover ring-1 ring-slate-200"
        />
      </div>

      <div v-if="ev.note" class="text-xs text-slate-500">{{ ev.note }}</div>
    </div>

    <div v-if="orderedEvents.length === 0" class="text-sm text-slate-500">
      No shipping events yet.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  shipping:  { type: Object, default: () => ({}) },
  logistics: { type: Object, default: () => ({}) },
  meta:      { type: Object, default: () => ({ createdAt: null, statusLog: [] }) },
  delivery:  { type: Object, default: null } // ✅ added
})

/* ---------- utils ---------- */
function toMs(t) {
  try {
    if (t && typeof t.toDate === 'function') return t.toDate().getTime()
    return new Date(t).getTime()
  } catch { return 0 }
}
function fmt(t) {
  try {
    const d = t && typeof t.toDate === 'function' ? t.toDate() : new Date(t)
    return d.toLocaleString('en-SG', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch { return '' }
}
function fmtMinute(t) {
  try {
    const d = t && typeof t.toDate === 'function' ? t.toDate() : new Date(t)
    return d.toISOString().slice(0, 16)
  } catch { return '' }
}
const isPlaced    = (e) => (e.label || e.text || '').toLowerCase().startsWith('order placed')
const isPreparing = (e) => (e.label || e.text || '').toLowerCase().startsWith('seller is preparing')

function eventKind(lbl = '', txt = '') {
  const s = (lbl || txt || '').toLowerCase()
  if (s.startsWith('order placed'))                 return 'placed'
  if (s.startsWith('seller is preparing'))         return 'preparing'
  if (s.includes('pickup scheduled'))              return 'pickup_scheduled'
  if (s.includes('shipment arranged') || s.includes('arranged')) return 'arranged'
  if (s.includes('picked up'))                     return 'picked_up'
  if (s.includes('drop-off done') || s.includes('dropped off'))  return 'dropped_off'
  return 'other'
}

/* ---------- synthesize buyer-side events ---------- */
const baseEvents = computed(() => {
  const out = []
  const placed =
    props.meta?.createdAt ||
    props.logistics?.orderedAt ||
    props.shipping?.orderedAt ||
    null
  if (placed) out.push({ time: placed, label: 'Order placed', text: 'Order placed' })

  const arrangedAt = props.shipping?.arrangedAt
  const statusLog  = Array.isArray(props.meta?.statusLog) ? props.meta.statusLog : []
  const toShipLog  = statusLog.find(s => s?.status === 'to_ship')
  const preparing  = arrangedAt || toShipLog?.time
  if (preparing) {
    out.push({
      time: preparing,
      label: 'Seller is preparing to ship',
      text:  'Seller is preparing to pack your order'
    })
  }
  return out
})

/* ---------- merge, collapse, order ---------- */
const orderedEvents = computed(() => {
  const a = (props.shipping?.timeline || []).map(e => ({ ...e }))
  const b = (props.logistics?.trackingHistory || []).map(e => ({ ...e }))
  const merged = [...a, ...b, ...baseEvents.value].filter(e => !!e?.time)

  merged.sort((x, y) => toMs(y.time) - toMs(x.time))

  const bucket = new Map()
  for (const e of merged) {
    const minute = fmtMinute(e.time)
    const kind   = eventKind(e.label, e.text)
    const key    = `${kind}|${minute}`

    if (!bucket.has(key)) bucket.set(key, { ...e })
    else {
      const cur = bucket.get(key)
      if ((!cur.label || cur.label === cur.text) && e.label) cur.label = e.label
      if ((e.text || '').length > (cur.text || '').length) cur.text = e.text
      if (toMs(e.time) > toMs(cur.time)) cur.time = e.time
      bucket.set(key, cur)
    }
  }

  const collapsed = Array.from(bucket.values())
  const seen = new Set()
  const deduped = []
  for (const e of collapsed) {
    const key = `${(e.label || e.text || '').toLowerCase()}|${fmtMinute(e.time)}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(e)
  }

  const preparingPinned = deduped.find(isPreparing)
  const placedPinned    = deduped.find(isPlaced)
  const rest = deduped
    .filter(e => !(isPreparing(e) || isPlaced(e)))
    .sort((x, y) => toMs(y.time) - toMs(x.time))
  if (preparingPinned) rest.push(preparingPinned)
  if (placedPinned)    rest.push(placedPinned)
  return rest
})
</script>
