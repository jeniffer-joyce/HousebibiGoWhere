<!-- src/views/sellers/account/MyBusiness.vue -->
<template>
  <div>
    <h2 class="text-lg font-semibold text-slate-900 dark:text-white">My Business</h2>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Business profile and branding.</p>

    <!-- Main Card -->
    <section
      class="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-6">
      
      <!-- Header row -->
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        
        <!-- Left: Avatar + Main Info -->
        <div class="flex flex-col sm:flex-row items-start gap-6 w-full">
          <!-- Avatar + UEN -->
          <div class="shrink-0 w-full sm:w-auto flex flex-col items-center">
            <img
              :src="avatarSrc"
              alt="Business avatar"
              class="h-36 w-36 sm:h-40 sm:w-40 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
            />
            <p class="mt-3 text-lg sm:text-xl font-semibold text-center sm:text-left text-slate-900 dark:text-white">
              {{ business.uen || '—' }}
            </p>
          </div>

          <!-- Business Info -->
          <div class="flex-1">
            <!-- Business Name -->
            <div class="flex flex-wrap items-center gap-3">
              <h3
                v-if="!isEditing"
                class="text-xl font-semibold text-slate-900 dark:text-slate-100 break-words">
                {{ business.name || user.displayName || '—' }}
              </h3>
              <input
                v-else
                v-model.trim="form.name"
                type="text"
                placeholder="Business name"
                class="h-10 w-full sm:w-auto rounded-lg border border-slate-300/60 dark:border-slate-700
                       bg-background-light dark:bg-background-dark px-3 text-sm font-semibold
                       text-slate-900 dark:text-slate-100"
              />
            </div>

            <!-- Location (moved below name) -->
            <div class="mt-2 flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <svg class="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M10 2a6 6 0 00-6 6c0 4.08 5.4 9.38 5.63 9.6a.75.75 0 001.05 0C10.6 17.38 16 12.08 16 8a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
              <span class="text-sm break-words">{{ business.address || '—' }}</span>
            </div>

            <!-- BIO -->
            <div class="mt-5">
              <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">BIO</p>
              <p v-if="!isEditing" class="mt-1 text-sm text-slate-700 dark:text-slate-300">
                {{ business.bio || '—' }}
              </p>
              <textarea
                v-else
                v-model.trim="form.bio"
                rows="2"
                class="mt-1 w-full rounded-lg border border-slate-300/50 dark:border-slate-700
                       bg-background-light dark:bg-background-dark px-3 py-2 text-sm
                       text-slate-900 dark:text-slate-100"
                placeholder="Short bio customers will see…"
              />
            </div>

            <!-- DESCRIPTION -->
            <div class="mt-4">
              <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">DESCRIPTION</p>
              <p v-if="!isEditing" class="mt-1 text-sm text-slate-700 dark:text-slate-300">
                {{ business.description || '—' }}
              </p>
              <textarea
                v-else
                v-model.trim="form.description"
                rows="3"
                class="mt-1 w-full rounded-lg border border-slate-300/50 dark:border-slate-700
                       bg-background-light dark:bg-background-dark px-3 py-2 text-sm
                       text-slate-900 dark:text-slate-100"
                placeholder="Tell customers more about your products and brand…"
              />
            </div>
          </div>
        </div>

        <!-- Right: Verified + Buttons -->
        <div class="flex items-start gap-3 self-end md:self-start">
          <span
            v-if="business.verified"
            class="inline-flex items-center gap-2 rounded-md bg-emerald-600/15 px-3 py-1 text-sm font-semibold
                   text-emerald-500 border border-emerald-700/30"
            title="Verified business">
            <span class="material-symbols-outlined text-base leading-none">verified</span>
            Verified
          </span>

          <div class="flex items-center gap-2">
            <button
              v-if="!isEditing"
              type="button"
              @click="toggleEdit"
              class="h-9 px-3 rounded-lg text-sm font-semibold border border-primary/40 text-primary hover:bg-primary/10">
              Edit
            </button>
            <template v-else>
              <button
                type="button"
                @click="cancelEdit"
                class="h-9 px-3 rounded-lg text-sm font-semibold border border-slate-300/50 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button
                type="button"
                :disabled="saving"
                @click="save"
                class="h-9 px-3 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-60">
                {{ saving ? 'Saving…' : 'Save' }}
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Info grid -->
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">CATEGORY</p>
          <p class="mt-1 text-sm text-slate-800 dark:text-slate-300">{{ business.category || '—' }}</p>
        </div>

        <div>
          <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">ACCOUNT CREATED</p>
          <p class="mt-1 text-sm text-slate-800 dark:text-slate-300">{{ createdAtDisplay }}</p>
        </div>

        <div class="col-span-full mt-2 h-px bg-slate-300 dark:bg-slate-700/40"></div>

        <div>
          <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">LICENSE</p>
          <button
            v-if="licenseUrl"
            type="button"
            class="mt-1 text-sm font-semibold text-primary hover:underline"
            @click="openLicense">
            Click to view
          </button>
          <p v-else class="mt-1 text-sm text-slate-500 dark:text-slate-500">—</p>
        </div>

        <div class="flex items-center">
          <div>
            <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">RATING</p>
            <div class="mt-1 flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <svg class="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"/>
              </svg>
              <span class="font-semibold">{{ (business.rating ?? 0).toFixed(1) }}</span>
              <span class="text-slate-500 dark:text-slate-400">/ 5.0</span>
            </div>
          </div>
        </div>

        <div>
          <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">FOLLOWERS</p>
          <p class="mt-1 text-slate-800 dark:text-slate-200 font-semibold">{{ business.followers ?? 0 }}</p>
        </div>
        <div>
          <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">FOLLOWING</p>
          <p class="mt-1 text-slate-800 dark:text-slate-200 font-semibold">{{ business.following ?? 0 }}</p>
        </div>
      </div>

      <!-- Barcode -->
      <div ref="barcodeHost" class="mt-6">
        <svg :width="svgWidth" :height="80" role="img" aria-label="Business UID barcode">
          <rect :width="svgWidth" height="80" :fill="bgBar" />
          <g :fill="fgBar">
            <rect
              v-for="(bar, idx) in scaledBars"
              :key="idx"
              :x="bar.x"
              y="8"
              :width="bar.w"
              height="64"
              rx="1"
            />
          </g>
        </svg>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { fetchSellerComposite, updateSellerBusiness, authReady } from '@/firebase/services/sellers/seller_crud.js'

const user = reactive({})
const business = reactive({})
const form = reactive({ name: '', bio: '', description: '' })
const licenseUrl = ref('')

const isEditing = ref(false)
const saving = ref(false)
const avatarSrc = computed(() => user.profilePic || business.profilePic || '/avatar.png')

const createdAtDisplay = computed(() => {
  const v = business.createdAt
  try {
    const d = v?.toDate ? v.toDate() : new Date(v)
    if (!d || isNaN(d)) return '—'
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return '—' }
})

function openLicense() {
  if (!licenseUrl.value) return
  window.open(licenseUrl.value, '_blank', 'noopener')
}

function toggleEdit() {
  isEditing.value = true
  Object.assign(form, {
    name: business.name || user.displayName || '',
    bio: business.bio || '',
    description: business.description || ''
  })
}

function cancelEdit() {
  isEditing.value = false
}

async function save() {
  if (saving.value) return
  saving.value = true
  try {
    await updateSellerBusiness(form)
    await loadData()
    isEditing.value = false
  } finally {
    saving.value = false
  }
}

async function loadData() {
  const { user: u, business: b } = await fetchSellerComposite()
  Object.assign(user, u || {})
  Object.assign(business, b || {})
  licenseUrl.value = u?.licenseFileURL || ''
}

/* Barcode */
const fgBar = computed(() => 'rgb(148 163 184 / 0.85)')
const bgBar = computed(() => 'transparent')
const uid = computed(() => user.uid || '')
const barcodeHost = ref(null)
const svgWidth = ref(320)
let ro

onMounted(async () => {
  await authReady()
  await loadData()
  if (barcodeHost.value) {
    ro = new ResizeObserver(entries => {
      const entry = entries[0]
      const cw = Math.floor(entry.contentRect.width || 320)
      svgWidth.value = Math.max(cw, 240)
    })
    ro.observe(barcodeHost.value)
  }
})
onBeforeUnmount(() => ro?.disconnect?.())

const scaledBars = computed(() => {
  const id = String(uid.value || '').replace(/-/g, '')
  const out = []
  let x = 16
  for (const ch of id) {
    const w = (ch.charCodeAt(0) % 4) + 1
    out.push({ x, w })
    x += w + 1
  }
  const total = x + 16
  const scale = total > 0 ? svgWidth.value / total : 1
  return out.map(b => ({
    x: Math.round(b.x * scale),
    w: Math.max(1, Math.round(b.w * scale))
  }))
})
</script>
