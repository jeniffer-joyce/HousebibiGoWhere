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
  meta:      { type: Object, default: () => ({ createdAt: null, statusLog: [] }) }
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
    return d.toISOString().slice(0, 16) // yyyy-mm-ddThh:mm
  } catch { return '' }
}
const isPlaced    = (e) => (e.label || e.text || '').toLowerCase().startsWith('order placed')
const isPreparing = (e) => (e.label || e.text || '').toLowerCase().startsWith('seller is preparing')

/* ---------- synthesize buyer-side events ---------- */
const baseEvents = computed(() => {
  const out = []

  // "Order placed" — try meta.createdAt first
  const placed =
    props.meta?.createdAt ||
    props.logistics?.orderedAt ||
    props.shipping?.orderedAt ||
    null

  if (placed) {
    out.push({ time: placed, label: 'Order placed', text: 'Order placed' })
  }

  // "Seller is preparing to ship"
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

/* ---------- merge all sources, sort NEWEST → OLDEST, then pin bottom two ---------- */
const orderedEvents = computed(() => {
  const a = (props.shipping?.timeline || []).map(e => ({ ...e }))
  const b = (props.logistics?.trackingHistory || []).map(e => ({ ...e }))

  // Merge and keep only items with time
  const merged = [...a, ...b, ...baseEvents.value].filter(e => !!e?.time)

  // Sort DESC by time (newest first)
  merged.sort((x, y) => toMs(y.time) - toMs(x.time))

  // De-dupe by (label/text + minute)
  const seen = new Set()
  const deduped = []
  for (const e of merged) {
    const key = `${(e.label || e.text || '').toLowerCase()}|${fmtMinute(e.time)}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(e)
  }

  // ---- Pin bottom order: [ ...others(newest→oldest), "Seller is preparing...", "Order placed" ]
  // Pick ONE preparing & ONE placed (prefer earliest of each to match chronology)
  const preparingCandidates = deduped.filter(isPreparing).sort((x,y)=>toMs(x.time)-toMs(y.time))
  const placedCandidates    = deduped.filter(isPlaced).sort((x,y)=>toMs(x.time)-toMs(y.time))
  const preparingPinned = preparingCandidates[0] || null
  const placedPinned    = placedCandidates[0]    || null

  // Remove any preparing/placed from the list first
  const rest = deduped.filter(e => !(isPreparing(e) || isPlaced(e)))

  // Append pinned ones so bottom is "Order placed", second-from-bottom is "Seller is preparing…"
  if (preparingPinned) rest.push(preparingPinned)
  if (placedPinned)    rest.push(placedPinned)

  return rest
})
</script>
