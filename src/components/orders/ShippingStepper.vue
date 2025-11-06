<template>
  <div class="w-full overflow-x-auto">
    <div class="min-w-[720px] px-2">
      <ol class="flex items-center justify-between gap-2">
        <template v-for="(s, i) in steps" :key="s.key">
          <!-- left connector -->
          <div
            v-if="i > 0"
            class="flex-1 h-1"
            :class="i <= activeIndex ? 'bg-green-500 dark:bg-green-600' : 'bg-slate-200 dark:bg-slate-700'"
          />
          <!-- node -->
          <li class="shrink-0 flex flex-col items-center">
            <div
              class="relative flex items-center justify-center h-14 w-14 rounded-full border-2"
              :class="i <= activeIndex ? 'bg-white dark:bg-slate-800 border-green-500 dark:border-green-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'"
            >
              <!-- inline SVGs -->
              <svg
                v-if="s.key==='placed'"
                viewBox="0 0 24 24"
                class="h-7 w-7"
                :class="i <= activeIndex ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-500'"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path d="M7 3h10a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Z"/>
                <path d="M9 8h6M9 12h6" stroke-linecap="round"/>
              </svg>

              <svg
                v-else-if="s.key==='preparing'"
                viewBox="0 0 24 24"
                class="h-7 w-7"
                :class="i <= activeIndex ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-500'"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              >
                <path d="M3 7l9 4 9-4M3 7l9-4 9 4M3 7v10l9 4 9-4V7"/>
              </svg>

              <svg
                v-else-if="s.key==='transit'"
                viewBox="0 0 24 24"
                class="h-7 w-7"
                :class="i <= activeIndex ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-500'"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              >
                <path d="M3 6h10v9H3zM13 9h4l3 3v3h-7V9z"/>
                <circle cx="7" cy="18" r="2"/>
                <circle cx="17" cy="18" r="2"/>
              </svg>

              <svg
                v-else
                viewBox="0 0 24 24"
                class="h-7 w-7"
                :class="i <= activeIndex ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-500'"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M4 12l4 4 8-8"/>
                <path d="M4 20h16"/>
              </svg>
            </div>

            <div class="mt-3 text-center">
              <div
                class="text-sm font-semibold"
                :class="i <= activeIndex ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'"
              >
                {{ s.label }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">{{ s.timeText }}</div>
            </div>
          </li>

          <!-- right connector -->
          <div
            v-if="i < steps.length - 1"
            class="flex-1 h-1"
            :class="i < activeIndex ? 'bg-green-500 dark:bg-green-600' : 'bg-slate-200 dark:bg-slate-700'"
          />
        </template>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order:     { type: Object, default: null },
  shipping:  { type: Object, default: () => ({}) },
  logistics: { type: Object, default: () => ({}) }
})

/* ---------- utils ---------- */
const lower = (s) => (s || '').toString().toLowerCase()
function toMs(t) {
  try {
    if (!t) return 0
    if (typeof t.toDate === 'function') return t.toDate().getTime()
    if (typeof t === 'number') return t
    return new Date(t).getTime() || 0
  } catch { return 0 }
}
function toText(t) {
  const ms = toMs(t)
  if (!ms) return ''
  const d = new Date(ms)
  return d.toLocaleString('en-SG', {
    day:'2-digit', month:'2-digit', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  })
}
function firstTimeByPredicate(list, pred) {
  const times = (Array.isArray(list) ? list : [])
    .filter(pred)
    .map(e => e?.time)
    .filter(Boolean)
    .map(toMs)
  return times.length ? Math.min(...times) : 0
}

/* ---------- sources ---------- */
const timeline   = computed(() => Array.isArray(props.shipping?.timeline) ? props.shipping.timeline : [])
const tracks     = computed(() => Array.isArray(props.logistics?.trackingHistory) ? props.logistics.trackingHistory : [])
const statusLog  = computed(() => Array.isArray(props.order?.statusLog) ? props.order.statusLog : [])

/* ---------- stage times (earliest) ---------- */
const times = computed(() => {
  const o = props.order || {}

  // 1) Order placed
  const placed =
    o.createdAt ||
    props.logistics?.orderedAt ||
    props.shipping?.orderedAt || null

  // 2) Preparing to Ship (arrangement/config steps only)
  const fromArranged     = props.shipping?.arrangedAt
  const fromStatusToShip = statusLog.value.find(s => s?.status === 'to_ship')?.time
  const fromPreparingTl  = firstTimeByPredicate(timeline.value, (e) => {
    const s = lower(e.label) || lower(e.text)
    return (
      s.startsWith('seller is preparing') ||
      s.includes('drop-off method selected') ||
      s.includes('pickup scheduled') ||
      s.includes('shipment arranged') || s.includes('arranged')
    )
  })
  const preparing = [fromArranged, fromStatusToShip, fromPreparingTl].map(toMs).filter(Boolean)
                    .sort((a,b)=>a-b)[0] || null

  // 3) In Transit (first real movement / handover)
  const fromStarted      = o?.delivery?.startedAt
  const fromTransitTl    = firstTimeByPredicate(timeline.value, (e) => {
    const s = lower(e.label) || lower(e.text)
    return (
      s.includes('picked up') ||
      s.includes('dropped off') ||
      s.includes('out for delivery') ||
      s.includes('parcel sent out for delivery')
    )
  })
  const fromTransitTrack = firstTimeByPredicate(tracks.value, (e) => {
    const s = lower(e.label) || lower(e.text)
    return (
      s.includes('picked up') ||
      s.includes('dropped off') ||
      s.includes('out for delivery') ||
      s.includes('parcel sent out for delivery')
    )
  })
  const transit = [fromStarted, fromTransitTl, fromTransitTrack].map(toMs).filter(Boolean)
                  .sort((a,b)=>a-b)[0] || null

  // 4) Delivered
  const fromDelivered    = o?.delivery?.deliveredAt
  const fromDeliveredTl  = firstTimeByPredicate(timeline.value, (e) => {
    const s = (e?.key ? lower(e.key) + ' ' : '') + lower(e.label) + ' ' + lower(e.text)
    return s.includes('delivered')
  })
  const fromDeliveredTrk = firstTimeByPredicate(tracks.value, (e) => {
    const s = lower(e.label) + ' ' + lower(e.text)
    return s.includes('delivered')
  })
  const fallbackCompleted = (o?.status === 'completed') ? o?.updatedAt : null
  const delivered = [fromDelivered, fromDeliveredTl, fromDeliveredTrk, fallbackCompleted]
                    .map(toMs).filter(Boolean).sort((a,b)=>a-b)[0] || null

  return { placed, preparing, transit, delivered }
})

/* active step index from order.status */
function rank(s){ return ({ to_pay:0, to_ship:1, to_receive:2, completed:3 }[s] ?? 0) }
const activeIndex = computed(() => {
  const s = props.order?.status || props.order?.statusLog?.at?.(-1)?.status || 'to_pay'
  return rank(s)
})

/* renderable steps */
const steps = computed(() => ([
  { key:'placed',     label:'Order Placed',      timeText: toText(times.value.placed) },
  { key:'preparing',  label:'Preparing to Ship', timeText: toText(times.value.preparing) },
  { key:'transit',    label:'In Transit',        timeText: toText(times.value.transit) },
  { key:'delivered',  label:'Delivered',         timeText: toText(times.value.delivered) }
]))
</script>