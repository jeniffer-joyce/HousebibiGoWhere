<!-- src/views/sellers/EditAccount.vue -->
<template>
  <main class="flex-grow">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <!-- ================= Sidebar ================= -->
        <aside class="lg:col-span-3">
          <nav
            aria-label="Account sections"
            class="hidden lg:block rounded-xl border border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark p-2 h-full"
            role="tablist"
            :aria-orientation="'vertical'">
            <h3 class="mb-3 px-2 text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">
              Account Settings
            </h3>
            <ul class="space-y-1">
              <li v-for="t in tabs" :key="t.key">
                <button
                  :id="`tab-${t.key}`"
                  :aria-controls="`panel-${t.key}`"
                  role="tab"
                  :aria-selected="currentSection === t.key"
                  @click="go(t.key)"
                  class="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all
                         focus:outline-none focus:ring-2 focus:ring-primary"
                  :class="buttonClass(t.key)">
                  <span class="material-symbols-outlined text-base">{{ t.icon }}</span>
                  <span class="truncate">{{ t.label }}</span>
                </button>
              </li>
            </ul>
          </nav>

          <!-- Mobile tabs -->
          <div class="lg:hidden -mt-2">
            <div
              role="tablist"
              aria-orientation="horizontal"
              class="flex gap-2 overflow-x-auto no-scrollbar rounded-xl border border-slate-200 dark:border-slate-800
                     bg-background-light dark:bg-background-dark p-2">
              <button
                v-for="t in tabs"
                :key="t.key"
                :aria-selected="currentSection === t.key"
                @click="go(t.key)"
                class="shrink-0 inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg transition-all
                       focus:outline-none focus:ring-2 focus:ring-primary"
                :class="mobileButtonClass(t.key)">
                <span class="material-symbols-outlined text-base">{{ t.icon }}</span>
                <span class="truncate">{{ t.label }}</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- ================= Content ================= -->
        <section class="lg:col-span-9">
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark p-6 h-full">
            <!-- My Profile -->
            <div v-show="currentSection === 'my-profile-details'"
                 :id="'panel-my-profile-details'"
                 role="tabpanel"
                 :aria-labelledby="'tab-my-profile-details'">
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white">My Profile Details</h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Basic information about your account.</p>

              <div class="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- Avatar card -->
                <aside class="lg:col-span-4">
                  <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-6 h-full">
                    <div class="flex flex-col items-center text-center">
                      <div
                        class="h-28 w-28 rounded-full ring-4 ring-primary/30 bg-center bg-cover bg-no-repeat"
                        :style="{ backgroundImage: `url('${fields.avatar || '/avatar.png'}')` }">
                      </div>

                      <h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                        {{ fields.displayName || '—' }}
                      </h3>
                      <p class="text-sm text-slate-500 dark:text-slate-400 break-all">
                        {{ fields.email || '—' }}
                      </p>

                      <button
                        type="button"
                        class="mt-4 inline-flex items-center justify-center h-10 px-4 rounded-lg text-sm font-semibold
                               bg-primary/20 text-primary hover:bg-primary/30 dark:bg-primary/25 dark:hover:bg-primary/35">
                        Change Photo
                      </button>

                      <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
                        Seller since {{ memberSince }}
                      </p>
                    </div>
                  </div>
                </aside>

                <!-- Personal info -->
                <section class="lg:col-span-8">
                  <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-6">
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
                          v-model="fields.username"
                          :disabled="!isEditing"
                          class="w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700 bg-background-light dark:bg-background-dark px-3 text-sm
                                 disabled:opacity-70 disabled:cursor-not-allowed"
                          type="text" placeholder="yourname" />
                      </div>

                      <!-- Display Name -->
                      <div>
                        <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 pl-3">Display Name</label>
                        <input
                          v-model="fields.displayName"
                          :disabled="!isEditing"
                          class="w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700 bg-background-light dark:bg-background-dark px-3 text-sm
                                 disabled:opacity-70 disabled:cursor-not-allowed"
                          type="text" placeholder="Your Name" />
                      </div>

                      <!-- Email (disabled + change link disabled unless editing) -->
                      <div>
                        <div class="flex items-center justify-between mb-1">
                          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 pl-3">Email Address</label>
                          <button
                            type="button"
                            :disabled="!isEditing"
                            :class="isEditing
                              ? 'text-xs font-semibold text-primary hover:underline'
                              : 'text-xs font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed pointer-events-none'">
                            Change email
                          </button>
                        </div>
                        <input
                          v-model="fields.email"
                          :disabled="true"
                          class="w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700 bg-background-light dark:bg-background-dark px-3 text-sm
                                 opacity-70 cursor-not-allowed"
                          type="email" placeholder="name@example.com" />
                      </div>

                      <!-- Phone -->
                      <div>
                        <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 pl-3">Phone Number</label>
                        <input
                          v-model="fields.phone"
                          :disabled="!isEditing"
                          class="w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700 bg-background-light dark:bg-background-dark px-3 text-sm
                                 disabled:opacity-70 disabled:cursor-not-allowed"
                          type="tel" placeholder="e.g. 91234567" />
                      </div>

                      <!-- Gender + Birthday -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Gender -->
                        <div>
                          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 pl-3">Gender</label>
                          <div class="relative">
                            <select
                              v-model="fields.gender"
                              :disabled="!isEditing"
                              class="w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700
                                     bg-background-light dark:bg-background-dark px-3 pr-10 text-sm
                                     appearance-none disabled:opacity-70 disabled:cursor-not-allowed">
                              <option value="">—</option>
                              <option value="Female">Female</option>
                              <option value="Male">Male</option>
                              <option value="Other">Other</option>
                              <option value="Prefer not to say">Prefer not to say</option>
                            </select>

                            <!-- centered caret -->
                            <svg
                              class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400 pointer-events-none"
                              fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        <!-- Birthday -->
                        <div>
                          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 pl-3">Birthday</label>
                          <div class="relative">
                            <input
                              v-model="fields.birthday"
                              :disabled="!isEditing"
                              class="w-full h-11 rounded-lg border border-slate-300/40 dark:border-slate-700
                                     bg-background-light dark:bg-background-dark px-3 pr-10 text-sm
                                     disabled:opacity-70 disabled:cursor-not-allowed appearance-none"
                              type="date" />

                            <!-- centered calendar icon -->
                            <svg
                              class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400 pointer-events-none"
                              fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <!-- Save bar -->
                      <div v-if="isEditing" class="pt-2 flex items-center justify-end gap-3">
                        <button type="button"
                                @click="toggleEdit"
                                class="h-10 px-4 rounded-lg text-sm font-semibold border border-slate-300/50 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                          Discard
                        </button>
                        <button type="button"
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

            <!-- My Business -->
            <div v-show="currentSection === 'my-business'"
                 :id="'panel-my-business'"
                 role="tabpanel"
                 :aria-labelledby="'tab-my-business'">
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white">My Business</h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Business profile and branding.</p>
              <div class="mt-6 min-h-24 rounded-lg bg-slate-50 dark:bg-slate-900/40"></div>
            </div>

            <!-- Change Password -->
            <div v-show="currentSection === 'change-password'"
                 :id="'panel-change-password'"
                 role="tabpanel"
                 :aria-labelledby="'tab-change-password'">
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Change Password</h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Update your login credentials.</p>
              <div class="mt-6 min-h-24 rounded-lg bg-slate-50 dark:bg-slate-900/40"></div>
            </div>

            <!-- Notifications -->
            <div v-show="currentSection === 'notifications'"
                 :id="'panel-notifications'"
                 role="tabpanel"
                 :aria-labelledby="'tab-notifications'">
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Notification Settings</h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Control email and in-app notifications.</p>
              <div class="mt-6 min-h-24 rounded-lg bg-slate-50 dark:bg-slate-900/40"></div>
            </div>

            <!-- Delete Account -->
            <div v-show="currentSection === 'delete-account'"
                 :id="'panel-delete-account'"
                 role="tabpanel"
                 :aria-labelledby="'tab-delete-account'">
              <h2 class="text-lg font-semibold text-red-600 dark:text-red-400">Account Deletion</h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Permanently delete your account and data.</p>
              <div class="mt-6 min-h-24 rounded-lg bg-red-50 dark:bg-red-900/20"></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps(['username'])
const route = useRoute()
const router = useRouter()

const tabs = [
  { key: 'my-profile-details', label: 'My Profile Details', icon: 'person' },
  { key: 'my-business',       label: 'My Business',        icon: 'storefront' },
  { key: 'change-password',   label: 'Change Password',    icon: 'key' },
  { key: 'notifications',     label: 'Notification Settings', icon: 'notifications' },
  { key: 'delete-account',    label: 'Account Deletion',   icon: 'delete_forever' },
]

const currentSection = computed(() => {
  const s = String(route.params.section || '').trim()
  return s || tabs[0].key
})

function go(sectionKey) {
  router.replace({
    name: 'edit-profile-section',
    params: { username: String(props.username || route.params.username || ''), section: sectionKey }
  })
}

const isEditing = ref(false)
function toggleEdit () { isEditing.value = !isEditing.value }

const fields = ref({
  username: 'thecozycorner',
  displayName: 'Sean Seller',
  email: 'thecozycorner@gmail.com',
  phone: '98765432',
  gender: 'Male',
  birthday: '2001-12-02',
  avatar: '/avatar.png'
})

const memberSince = 'October 2025'

function saveProfile () {
  // TODO: persist to Firestore
  isEditing.value = false
}

function buttonClass(key) {
  const active = currentSection.value === key
  return active
    ? 'bg-primary/10 text-primary dark:bg-primary/20'
    : 'text-slate-700 dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:ring-2 hover:ring-primary/40'
}
function mobileButtonClass(key) {
  const active = currentSection.value === key
  return active
    ? 'bg-primary/10 text-primary dark:bg-primary/20'
    : 'text-slate-700 dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:ring-2 hover:ring-primary/40'
}
</script>

<style scoped>
/* Hide mobile tabbar scrollbar */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Keep native date picker clickable if you later choose to hide it
.date-no-native-icon::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 1.75rem;
  height: 1.75rem;
  cursor: pointer;
} */
</style>
