<!-- EditAccount.vue -->
<template>
  <main class="flex-grow">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <!-- Equal height layout using flex -->
      <div class="flex flex-col lg:flex-row gap-8 items-start">
        
        <!-- Sidebar (left) -->
        <aside
          class="w-full lg:w-1/4 rounded-xl border border-slate-200 dark:border-slate-800 
                 bg-background-light dark:bg-background-dark p-4 flex-shrink-0 flex flex-col"
          style="height: 100%; min-height: 100%;"
        >
          <h3 class="mb-3 px-2 text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            Account Settings
          </h3>

          <nav aria-label="Account sections" role="tablist" :aria-orientation="'vertical'" class="flex-1">
            <ul class="space-y-1">
              <li v-for="(t, i) in tabs" :key="t.key">
                <button
                  :id="`tab-${t.key}`"
                  :aria-controls="`panel-${t.key}`"
                  role="tab"
                  :aria-selected="currentTab === t.key"
                  @click="setTab(t.key)"
                  @keydown="onTabKeydown($event, i)"
                  class="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all
                         focus:outline-none focus:ring-2 focus:ring-primary"
                  :class="buttonClass(t.key)"
                >
                  <span class="material-symbols-outlined text-base">{{ t.icon }}</span>
                  <span class="truncate">{{ t.label }}</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <!-- Main content (right) -->
        <section
          class="flex-1 flex flex-col gap-8 rounded-xl border border-slate-200 dark:border-slate-800 
                 bg-background-light dark:bg-background-dark p-6"
          style="min-height: 100%;"
        >
          <!-- Profile -->
          <div
            v-show="currentTab === 'profile'"
            id="panel-profile"
            role="tabpanel"
            aria-labelledby="tab-profile"
          >
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">My Profile Details</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Basic information about your account.
            </p>
            <div class="mt-6 h-24 rounded-lg bg-slate-50 dark:bg-slate-900/40"></div>
          </div>

          <!-- My Business -->
          <div
            v-show="currentTab === 'business'"
            id="panel-business"
            role="tabpanel"
            aria-labelledby="tab-business"
          >
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">My Business</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Business profile and branding.
            </p>
            <div class="mt-6 h-24 rounded-lg bg-slate-50 dark:bg-slate-900/40"></div>
          </div>

          <!-- Change Password -->
          <div
            v-show="currentTab === 'password'"
            id="panel-password"
            role="tabpanel"
            aria-labelledby="tab-password"
          >
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Change Password</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Update your login credentials.
            </p>
            <div class="mt-6 h-24 rounded-lg bg-slate-50 dark:bg-slate-900/40"></div>
          </div>

          <!-- Notification Settings -->
          <div
            v-show="currentTab === 'notifications'"
            id="panel-notifications"
            role="tabpanel"
            aria-labelledby="tab-notifications"
          >
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Notification Settings</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Control email and in-app notifications.
            </p>
            <div class="mt-6 h-24 rounded-lg bg-slate-50 dark:bg-slate-900/40"></div>
          </div>

          <!-- Account Deletion -->
          <div
            v-show="currentTab === 'delete'"
            id="panel-delete"
            role="tabpanel"
            aria-labelledby="tab-delete"
          >
            <h2 class="text-lg font-semibold text-red-600 dark:text-red-400">Account Deletion</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Permanently delete your account and data.
            </p>
            <div class="mt-6 h-24 rounded-lg bg-red-50 dark:bg-red-900/20"></div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'

const tabs = [
  { key: 'profile',       label: 'My Profile Details',    icon: 'person' },
  { key: 'business',      label: 'My Business',           icon: 'storefront' },
  { key: 'password',      label: 'Change Password',       icon: 'key' },
  { key: 'notifications', label: 'Notification Settings', icon: 'notifications' },
  { key: 'delete',        label: 'Account Deletion',      icon: 'delete_forever' },
]

const currentTab = ref('profile')

function setTab(key) {
  currentTab.value = key
}

function onTabKeydown(e, index) {
  const last = tabs.length - 1
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const next = index === last ? 0 : index + 1
    setTab(tabs[next].key)
    requestFocus(tabs[next].key)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    const prev = index === 0 ? last : index - 1
    setTab(tabs[prev].key)
    requestFocus(tabs[prev].key)
  }
}

function requestFocus(key) {
  const el = document.getElementById(`tab-${key}`)
  if (el) el.focus()
}

function buttonClass(key) {
  const active = currentTab.value === key
  return active
    ? 'bg-primary/10 text-primary dark:bg-primary/20'
    : 'text-slate-700 dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:ring-2 hover:ring-primary/40'
}
</script>

<style scoped>
/* Match height between sidebar and content */
main,
aside,
section {
  height: 100%;
}
</style>
