<!-- src/views/sellers/account/MyProfile.vue -->
<template>
  <div>
    <h2 class="text-lg font-semibold text-slate-900 dark:text-white">My Profile Details</h2>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Basic information about your account.
    </p>

    <div class="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Avatar card -->
      <aside class="lg:col-span-4">
        <div
          class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-6 h-full">
          <div class="flex flex-col items-center text-center">
            <div
              class="h-28 w-28 rounded-full ring-4 ring-primary/30 bg-center bg-cover bg-no-repeat"
              :style="{ backgroundImage: `url('${photoPreview || business.profilePic || '/avatar.png'}')` }"
            />
            <h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              {{ fields.displayName || '—' }}
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 break-all">
              {{ fields.email || '—' }}
            </p>

            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onPickPhoto"
            />

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
              Seller since {{ createdAtDisplay }}
            </p>
          </div>
        </div>
      </aside>

      <!-- Personal info -->
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
            
            <!-- Email (read-only; link hidden for Google accounts) -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 pl-3">
                  Email Address
                </label>

                <!-- show link only if NOT Google -->
                <button
                  v-if="!isGoogle"
                  type="button"
                  :disabled="!isEditing"
                  class="text-xs font-semibold"
                  :class="isEditing
                    ? 'text-primary hover:underline'
                    : 'text-slate-400 dark:text-slate-500 cursor-not-allowed pointer-events-none'"
                  @click="onChangeEmail"
                >
                  Change email
                </button>

                <!-- show a small note if Google-linked -->
                <span v-else class="text-xs text-slate-400 dark:text-slate-500 italic select-none">
                  Linked with Google
                </span>
              </div>

              <!-- Always display the actual email; never editable -->
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

              <!-- Birthday -->
              <div class="relative">
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 pl-3">Birthday</label>
                <div class="relative">
                  <input
                    v-model="fields.birthday"
                    :disabled="!isEditing"
                    type="date"
                    class="input-date w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700
                           bg-background-light dark:bg-background-dark px-3 pr-12 text-sm
                           disabled:opacity-70 disabled:cursor-not-allowed appearance-none" />
                  <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg class="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Save bar -->
            <div v-if="isEditing" class="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                @click="toggleEdit"
                class="h-10 px-4 rounded-lg text-sm font-semibold border border-slate-300/50 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                Discard
              </button>
              <button
                type="button"
                @click="saveProfile"
                class="h-10 px-4 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90">
                Save Changes
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
import { authReady, fetchSellerComposite } from '@/firebase/services/sellers/seller_crud.js'
import { auth } from '@/firebase/firebase_config'

const router = useRouter()
const isEditing = ref(false)
const fields = ref({
  username: '',
  displayName: '',
  email: '',
  phone: '',
  gender: '',
  birthday: '',
  avatar: ''
})
const business = ref({})
const providerId = ref('password')

onMounted(async () => {
  await authReady()
  const user = auth.currentUser
  if (user && user.providerData?.length) {
    providerId.value = user.providerData[0]?.providerId || 'password'
  }

  const { user: userDoc, business: bizDoc } = await fetchSellerComposite()
  if (userDoc) {
    fields.value = {
      username: userDoc.username || '',
      displayName: userDoc.displayName || '',
      email: userDoc.email || '',
      phone: userDoc.phone || '',
      gender: userDoc.gender || '',
      birthday: userDoc.birthday || '',
      avatar: bizDoc?.profilePic || '/avatar.png'
    }
  }
  if (bizDoc) business.value = bizDoc
})

const isGoogle = computed(() => providerId.value === 'google.com')

const createdAtDisplay = computed(() => {
  const v = business.value?.createdAt
  try {
    const d = v?.toDate ? v.toDate() : new Date(v)
    if (!d || isNaN(d)) return '—'
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
  } catch { return '—' }
})

function toggleEdit() { isEditing.value = !isEditing.value }

async function saveProfile() {
  isEditing.value = false
  location.reload()
}

function onChangeEmail() {
  if (!isEditing.value || isGoogle.value) return
  router.push('/change-email')
}
</script>
