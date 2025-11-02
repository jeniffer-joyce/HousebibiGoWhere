<template>
  <div class="w-full overflow-x-auto">
    <div class="min-w-[720px] px-2">
      <ol class="flex items-center justify-between gap-2">
        <template v-for="(s, i) in steps" :key="s.key">
          <!-- left connector -->
          <div v-if="i>0" class="flex-1 h-1"
               :class="i <= activeIndex ? 'bg-green-500' : 'bg-slate-200'"></div>

          <!-- node -->
          <li class="shrink-0 flex flex-col items-center">
            <div class="relative flex items-center justify-center h-14 w-14 rounded-full border-2"
              :class="i <= activeIndex ? 'bg-white border-green-500' : 'bg-white border-slate-300'">

              <!-- ✅ inline SVGs (no runtime compiler required) -->
              <svg v-if="s.key==='placed'" viewBox="0 0 24 24" class="h-7 w-7"
                   fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M7 3h10a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Z"/>
                <path d="M9 8h6M9 12h6" stroke-linecap="round"/>
              </svg>

              <svg v-else-if="s.key==='preparing'" viewBox="0 0 24 24" class="h-7 w-7"
                   fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
                <path d="M3 7l9 4 9-4M3 7l9-4 9 4M3 7v10l9 4 9-4V7"/>
              </svg>

              <svg v-else-if="s.key==='transit'" viewBox="0 0 24 24" class="h-7 w-7"
                   fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
                <path d="M3 6h10v9H3zM13 9h4l3 3v3h-7V9z"/>
                <circle cx="7" cy="18" r="2"/>
                <circle cx="17" cy="18" r="2"/>
              </svg>

              <svg v-else viewBox="0 0 24 24" class="h-7 w-7"
                   fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12l4 4 8-8"/>
                <path d="M4 20h16"/>
              </svg>
            </div>

            <div class="mt-3 text-center">
              <div class="text-sm font-semibold"
                   :class="i <= activeIndex ? 'text-slate-900' : 'text-slate-500'">
                {{ s.label }}
              </div>
              <div class="text-xs text-slate-500">{{ s.timeText }}</div>
            </div>
          </li>

          <!-- right connector -->
          <div v-if="i<steps.length-1" class="flex-1 h-1"
               :class="i < activeIndex ? 'bg-green-500' : 'bg-slate-200'"></div>
        </template>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order:    { type: Object, default: null },
  shipping: { type: Object, default: () => ({}) },
  logistics:{ type: Object, default: () => ({}) }
})

const times = computed(() => {
  const o  = props.order || {}
  const tl = props.shipping?.timeline || []
  const find = (k) => tl.find(e => e.key === k || e.status === k)

  const placed    = o.createdAt || find('placed')?.time
  const preparing = find('preparing')?.time || find('to_ship')?.time || o.updatedAt
  const transit   = find('in_transit')?.time || find('to_receive')?.time || o.shippedAt
  const delivered = find('delivered')?.time || o.deliveredAt || (o.status==='completed' ? o.updatedAt : null)

  return { placed, preparing, transit, delivered }
})

function toText(t){
  if(!t) return ''
  const d = typeof t?.toDate === 'function' ? t.toDate() : new Date(t)
  return d.toLocaleString('en-SG', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

function rank(s){ return ({ to_pay:0, to_ship:1, to_receive:2, completed:3 }[s] ?? 0) }
const activeIndex = computed(() => {
  const s = props.order?.status || props.order?.statusLog?.at?.(-1)?.status || 'to_pay'
  return rank(s)
})

const steps = computed(() => ([
  { key:'placed',     label:'Order Placed',      timeText: toText(times.value.placed) },
  { key:'preparing',  label:'Preparing to Ship', timeText: toText(times.value.preparing) },
  { key:'transit',    label:'In Transit',        timeText: toText(times.value.transit) },
  { key:'delivered',  label:'Delivered',         timeText: toText(times.value.delivered) }
]))
</script>

<style scoped>
/* Color icons by progress */
svg { color: rgb(148 163 184); }            /* default slate-400 */
:deep(.ring-green-500) + * svg,
:deep(.ring-green-500) ~ svg {
  /* not needed – we color via classes below */
}
</style>
