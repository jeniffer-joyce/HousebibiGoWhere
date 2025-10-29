<!-- src/views/sellers/account/MyProfile.vue -->
<template>
  <div>
    <h2 class="text-lg font-semibold text-slate-900 dark:text-white">My Profile Details</h2>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Basic information about your account.
    </p>

    <div class="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- LEFT: Avatar card -->
      <aside class="lg:col-span-4">
        <div
          class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-6 h-full">
          <div class="flex flex-col items-center text-center">
            <div
              class="h-28 w-28 rounded-full ring-4 ring-primary/30 bg-center bg-cover bg-no-repeat"
              :style="{ backgroundImage: `url('${photoPreview || fields.profilePic || business.profilePic || '/avatar.png'}')` }"
            ></div>

            <h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              {{ fields.displayName || '—' }}
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 break-all">
              {{ fields.email || '—' }}
            </p>

            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onPickPhoto" />

            <button
              type="button"
              :disabled="!isEditing"
              @click="triggerPick"
              class="mt-4 inline-flex items-center justify-center h-10 px-4 rounded-lg text-sm font-semibold
                     bg-primary/20 text-primary hover:bg-primary/30 dark:bg-primary/25 dark:hover:bg-primary/35
                     disabled:opacity-60 disabled:cursor-not-allowed">
              Change Photo
            </button>

            <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Seller since {{ memberSince }}
            </p>
          </div>
        </div>
      </aside>

      <!-- RIGHT: Personal info -->
      <section class="lg:col-span-8">
        <div
          class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-slate-900 dark:text-white">Personal Information</h3>

            <button
              type="button"
              @click="toggleEdit"
              class="h-9 px-3 rounded-lg text-sm font-semibold border transition-colors"
              :class="isEditing
                ? 'border-red-600 text-red-600 hover:bg-red-600/10'
                : 'border-primary/40 text-primary hover:bg-primary/10'">
              {{ isEditing ? 'Cancel' : 'Edit Profile' }}
            </button>
          </div>

          <div class="mt-5 grid grid-cols-1 gap-4">
            <!-- Username -->
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 pl-3">Username</label>
              <input
                v-model.trim="fields.username"
                :disabled="!isEditing"
                type="text"
                placeholder="yourname"
                class="w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700
                       bg-background-light dark:bg-background-dark px-3 text-sm
                       disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>

            <!-- Display Name -->
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 pl-3">Display Name</label>
              <input
                v-model.trim="fields.displayName"
                :disabled="!isEditing"
                type="text"
                placeholder="Your Name"
                class="w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700
                       bg-background-light dark:bg-background-dark px-3 text-sm
                       disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>

            <!-- Email (disabled; link only for non-Google) -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 pl-3">Email Address</label>
                <button
                  v-if="!isGoogle"
                  type="button"
                  class="text-xs font-semibold text-primary hover:underline"
                  @click="onChangeEmail"
                >
                  Change email
                </button>
                <span v-else class="text-xs text-slate-400 dark:text-slate-500 italic select-none">
                  Linked with Google
                </span>
              </div>
              <input
                v-model.trim="fields.email"
                disabled
                type="email"
                class="w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700
                       bg-background-light dark:bg-background-dark px-3 text-sm
                       opacity-70 cursor-not-allowed"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 pl-3">Phone Number</label>
              <input
                v-model.trim="fields.phone"
                :disabled="!isEditing"
                type="tel"
                placeholder="e.g. 91234567"
                class="w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700
                       bg-background-light dark:bg-background-dark px-3 text-sm
                       disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>

            <!-- Gender + Birthday -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Gender -->
              <div class="relative">
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 pl-3">Gender</label>
                <div class="relative">
                  <select
                    v-model="fields.gender"
                    :disabled="!isEditing"
                    class="w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700
                           bg-background-light dark:bg-background-dark px-3 pr-12 text-sm
                           appearance-none disabled:opacity-70 disabled:cursor-not-allowed">
                    <option value="">—</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg class="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Birthday (DD-MM-YYYY visible, native picker overlay when editing) -->
              <div class="relative">
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 pl-3">Birthday</label>
                <div class="relative">
                  <!-- Visible text field in DD-MM-YYYY -->
                  <input
                    v-model="birthdayText"
                    :disabled="!isEditing"
                    type="text"
                    inputmode="numeric"
                    placeholder="DD-MM-YYYY"
                    class="w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700
                           bg-background-light dark:bg-background-dark px-3 pr-12 text-sm
                           disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                  <!-- Custom icon (kept) -->
                  <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg class="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a 2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                    </svg>
                  </div>

                  <!-- Invisible native date input to open the picker (only when editing) -->
                  <input
                    v-if="isEditing"
                    v-model="birthdayYMD"
                    type="date"
                    class="absolute inset-0 opacity-0 cursor-pointer"
                    tabindex="-1"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            <!-- Save bar -->
            <div v-if="isEditing" class="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                @click="cancelEdit"
                class="h-10 px-4 rounded-lg text-sm font-semibold border border-slate-300/50 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                Discard
              </button>
              <button
                type="button"
                @click="saveProfile"
                class="h-10 px-4 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90"
                :disabled="saving">
                {{ saving ? 'Saving…' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase/firebase_config'

// Consolidated CRUD
import { authReady, fetchSellerComposite, updateSellerProfile } from '@/firebase/services/sellers/seller_crud.js'

const router = useRouter()

const isEditing = ref(false)
const saving = ref(false)
const fileInput = ref(null)
const photoPreview = ref('')

// model from Firestore
const fields = ref({
  username: '',
  displayName: '',
  email: '',
  phone: '',
  gender: '',
  birthday: '',   // stored as 'YYYY-MM-DD' in Firestore
  profilePic: '',
})

// UI-only text for DD-MM-YYYY display/edit
const birthdayText = ref('')

// Computed bridge for hidden native date input (YYYY-MM-DD)
const birthdayYMD = computed({
  get() {
    return dmyToYmd(birthdayText.value) || ''  // convert visible text -> YMD
  },
  set(val) {
    // when user picks from native picker, sync visible field
    birthdayText.value = ymdToDmy(val || '')
  }
})

const business = ref({})
const providerId = ref('password')
const isGoogle = computed(() => providerId.value === 'google.com')

/* ---------- Date helpers ---------- */
function toYMD(input) {
  if (!input) return ''
  try {
    const d = typeof input?.toDate === 'function'
      ? input.toDate()
      : input instanceof Date
        ? input
        : new Date(input)
    if (Number.isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch { return '' }
}
function ymdToDmy(ymd) {
  if (!ymd) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return ''
  return `${m[3]}-${m[2]}-${m[1]}`
}
function dmyToYmd(dmy) {
  if (typeof dmy !== 'string') return ''
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dmy.trim())
  if (!m) return ''
  return `${m[3]}-${m[2]}-${m[1]}`
}

/* ---------- Mount: load data ---------- */
onMounted(async () => {
  await authReady()

  const u = auth.currentUser
  if (u?.providerData?.length) providerId.value = u.providerData[0]?.providerId || 'password'

  const { user: userDoc, business: bizDoc } = await fetchSellerComposite()
  if (userDoc) {
    fields.value.username   = userDoc.username || ''
    fields.value.displayName= userDoc.displayName || ''
    fields.value.email      = userDoc.email || ''
    fields.value.phone      = userDoc.phone || ''
    fields.value.gender     = userDoc.gender || ''
    fields.value.birthday   = toYMD(userDoc.birthday) || ''   // normalized storage string
    birthdayText.value      = ymdToDmy(fields.value.birthday) // UI text as DD-MM-YYYY
    fields.value.profilePic = userDoc.profilePic || userDoc.photoURL || ''
  }
  if (bizDoc) business.value = bizDoc
})

/* ---------- Derived ---------- */
const memberSince = computed(() => {
  const v = business.value?.createdAt
  try {
    const d = v?.toDate ? v.toDate() : new Date(v)
    if (!d || isNaN(d)) return '—'
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
  } catch { return '—' }
})

/* ---------- UI handlers ---------- */
function toggleEdit() { isEditing.value = !isEditing.value }
function cancelEdit() { isEditing.value = false }
function onChangeEmail() { if (!isGoogle.value) router.push('/change-email') }
function triggerPick() { if (isEditing.value) fileInput.value?.click() }

async function onPickPhoto(e) {
  const f = e?.target?.files?.[0]
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => {
    photoPreview.value = reader.result
    fields.value.profilePic = String(reader.result || '')
  }
  reader.readAsDataURL(f)
}

/* ---------- Save ---------- */
async function saveProfile() {
  try {
    saving.value = true

    // Convert what user sees (DD-MM-YYYY) -> storage format (YYYY-MM-DD)
    const ymd = dmyToYmd(birthdayText.value)
    const birthdayForStore = ymd || ''

    const patch = {
      username:    fields.value.username || '',
      displayName: fields.value.displayName || '',
      phone:       fields.value.phone || '',
      gender:      fields.value.gender || '',
      birthday:    birthdayForStore,             // stored as 'YYYY-MM-DD'
      profilePic:  fields.value.profilePic || undefined,
    }

    await updateSellerProfile(patch)

    // Refresh local view
    const { user: updatedUser, business: updatedBiz } = await fetchSellerComposite()
    if (updatedUser) {
      fields.value.username   = updatedUser.username || ''
      fields.value.displayName= updatedUser.displayName || ''
      fields.value.email      = updatedUser.email || ''
      fields.value.phone      = updatedUser.phone || ''
      fields.value.gender     = updatedUser.gender || ''
      fields.value.birthday   = toYMD(updatedUser.birthday) || ''
      birthdayText.value      = ymdToDmy(fields.value.birthday)
      fields.value.profilePic = updatedUser.profilePic || updatedUser.photoURL || fields.value.profilePic
    }
    if (updatedBiz) business.value = updatedBiz

    isEditing.value = false
  } catch (err) {
    console.error('❌ Failed to save profile:', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Keep native indicator hidden whenever a date input is visible (we overlay it invisibly). */
input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0; width: 100%; cursor: pointer; }
input[type="date"]::-moz-calendar-picker-indicator { opacity: 0; cursor: pointer; }
</style>
