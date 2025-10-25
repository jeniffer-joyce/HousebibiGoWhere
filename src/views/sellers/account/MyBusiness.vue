<!-- src/views/sellers/account/MyBusiness.vue -->
<template>
  <div>
    <h2 class="text-lg font-semibold text-slate-900 dark:text-white">My Business</h2>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Business profile and branding.</p>

    <!-- ===== Business ID Card ===== -->
    <div class="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-6">
      <!-- Header row -->
      <div class="flex items-start justify-between gap-4">
        <!-- Avatar + UEN -->
        <div class="flex items-start gap-6">
          <div class="shrink-0">
            <img
              :src="avatar"
              alt="Business avatar"
              class="h-40 w-40 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
            />
            <p class="mt-4 text-xl font-semibold text-slate-900 dark:text-white text-center">
              {{ uen }}
            </p>
          </div>

          <!-- Title, location, bio -->
          <div>
            <div class="flex items-center gap-3">
              <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {{ displayName }}
              </h3>
            </div>

            <div class="mt-1 flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <svg class="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M10 2a6 6 0 00-6 6c0 4.08 5.4 9.38 5.63 9.6a.75.75 0 001.05 0C10.6 17.38 16 12.08 16 8a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
              <span class="text-sm">{{ location }}</span>
            </div>

            <div class="mt-5">
              <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">BIO</p>
              <p class="mt-1 text-sm text-slate-700 dark:text-slate-300">{{ bio }}</p>
            </div>
          </div>
        </div>

        <!-- Verified badge -->
        <span
          class="inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-semibold border
                 bg-emerald-500/10 text-emerald-700 border-emerald-500/30
                 dark:bg-emerald-700/20 dark:text-emerald-300 dark:border-emerald-700/30"
          title="Verified business"
        >
          <span class="material-symbols-outlined text-base leading-none">verified</span>
          Verified
        </span>
      </div>

      <!-- Info grid -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">CATEGORY</p>
          <p class="mt-1 text-sm text-slate-700 dark:text-slate-300">{{ category }}</p>
        </div>
        <div>
          <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">ACCOUNT CREATED</p>
          <p class="mt-1 text-sm text-slate-700 dark:text-slate-300">{{ createdAt }}</p>
        </div>

        <div class="col-span-full mt-2 h-px bg-slate-200 dark:bg-slate-700/40"></div>

        <div>
          <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">LICENSE</p>
          <button type="button" class="mt-1 text-sm font-semibold text-primary hover:underline" @click="openLicense">
            Click to view
          </button>
        </div>

        <div class="flex items-center gap-2">
          <div>
            <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">RATING</p>
            <div class="mt-1 flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <svg class="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"/>
              </svg>
              <span class="font-semibold">{{ rating.toFixed(1) }}</span>
              <span class="text-slate-500 dark:text-slate-400">/ 5.0</span>
            </div>
          </div>
        </div>

        <div>
          <p class="text:[11px] text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">FOLLOWERS</p>
          <p class="mt-1 text-slate-900 dark:text-slate-200 font-semibold">{{ followers }}</p>
        </div>
        <div>
          <p class="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">FOLLOWING</p>
          <p class="mt-1 text-slate-900 dark:text-slate-200 font-semibold">{{ following }}</p>
        </div>
      </div>

      <!-- Barcode -->
      <div ref="barcodeHost" class="mt-6">
        <svg :width="svgWidth" :height="80" role="img" aria-label="Business UID barcode">
          <rect :width="svgWidth" height="80" :fill="bgBar" />
          <g :fill="barColor">
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
    </div>

    <!-- ===== Editable Company (Name & Bio only) ===== -->
    <div class="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-6">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-slate-900 dark:text-white">Edit Business Details</h3>

        <button
          type="button"
          @click="toggleCompanyEdit"
          class="h-9 px-3 rounded-lg text-sm font-semibold border transition-colors"
          :class="isEditingCompany
            ? 'border-red-600 text-red-600 hover:bg-red-600/10'
            : 'border-primary/40 text-primary hover:bg-primary/10'">
          {{ isEditingCompany ? 'Cancel' : 'Edit' }}
        </button>
      </div>

      <div class="mt-5 grid grid-cols-1 gap-4">
        <!-- Company / Display Name -->
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 pl-3">Business Name</label>
          <input
            v-model.trim="companyForm.name"
            :disabled="!isEditingCompany"
            type="text"
            placeholder="Your company name"
            class="w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700
                   bg-white dark:bg-slate-900 px-3 text-sm
                   disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>

        <!-- Bio -->
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 pl-3">Bio</label>
          <textarea
            v-model.trim="companyForm.bio"
            :disabled="!isEditingCompany"
            rows="4"
            placeholder="Tell customers about your business..."
            class="w-full rounded-lg border border-slate-300/40 dark:border-slate-700
                   bg-white dark:bg-slate-900 px-3 py-2 text-sm
                   disabled:opacity-70 disabled:cursor-not-allowed"
          ></textarea>
        </div>

        <!-- Save bar -->
        <div v-if="isEditingCompany" class="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="toggleCompanyEdit"
            class="h-10 px-4 rounded-lg text-sm font-semibold border border-slate-300/50 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
            Discard
          </button>
          <button
            type="button"
            @click="saveCompany"
            class="h-10 px-4 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/** Mocked data (wire to Firestore later) */
const displayName = 'The Cozy Corner'
const location = 'Bukit Batok, Singapore'
const bio = 'Homestyle bakes crafted daily.'
const category = 'Cakes & Pastries'
const createdAt = 'Aug 12, 2023'
const licenseUrl = 'https://example.com/license.pdf'
const avatar = '/avatar.png'
const uen = '201912345K'
const rating = 4.6
const followers = 120
const following = 20
const uid = 'd4f09a0c-2ac1-49c7-92c6-EXAMPLE-UID' // replace with real uid later

function openLicense () {
  window.open(licenseUrl, '_blank', 'noopener')
}

/* ---------- Editable “Company Details” section ---------- */
const isEditingCompany = ref(false)
const companyForm = ref({
  name: displayName,
  bio: bio
})
function toggleCompanyEdit () {
  // reset on cancel
  if (isEditingCompany.value) {
    companyForm.value = { name: displayName, bio }
  }
  isEditingCompany.value = !isEditingCompany.value
}
function saveCompany () {
  // TODO: persist to Firestore
  // After save you would update displayName/bio shown above:
  // displayName = companyForm.value.name
  // bio = companyForm.value.bio
  isEditingCompany.value = false
}

/* ---------- Barcode (theme-aware + ResizeObserver) ---------- */
const isDark = ref(false)
onMounted(() => {
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
  if (mq) {
    isDark.value = mq.matches
    const listener = e => (isDark.value = e.matches)
    mq.addEventListener ? mq.addEventListener('change', listener) : mq.addListener(listener)
    onBeforeUnmount(() => {
      mq.removeEventListener ? mq.removeEventListener('change', listener) : mq.removeListener(listener)
    })
  }
})
const barColor = computed(() =>
  isDark.value ? 'rgba(220,230,255,0.9)' : 'rgba(71,85,105,0.45)'
)
const bgBar = computed(() => 'transparent')

const gap = 1, minBar = 1, maxBar = 4, leftPad = 16, rightPad = 16
const rawBars = computed(() => {
  const out = []
  let x = leftPad
  for (const ch of uid.replace(/-/g, '')) {
    const w = (ch.charCodeAt(0) % (maxBar - minBar + 1)) + minBar
    out.push({ x, w })
    x += w + gap
  }
  const total = x + rightPad
  return { bars: out, total }
})

const barcodeHost = ref(null)
const svgWidth = ref(320)
let ro

onMounted(() => {
  if (!barcodeHost.value) return
  ro = new ResizeObserver(entries => {
    const cw = Math.floor(entries[0].contentRect.width || 320)
    svgWidth.value = Math.max(cw, 240)
  })
  ro.observe(barcodeHost.value)
})
onBeforeUnmount(() => ro?.disconnect?.())

const scaledBars = computed(() => {
  const { bars, total } = rawBars.value
  const scale = total > 0 ? svgWidth.value / total : 1
  return bars.map(b => ({ x: Math.round(b.x * scale), w: Math.max(1, Math.round(b.w * scale)) }))
})
</script>
