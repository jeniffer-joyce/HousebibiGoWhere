<!-- src/views/sellers/EditAccount.vue -->
<template>
  <main class="flex-grow">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <!-- 2-col layout; both columns stretch to same height -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <!-- =============== Sidebar =============== -->
        <aside class="lg:col-span-3">
          <!-- Desktop sidebar -->
          <nav
            aria-label="Account sections"
            class="hidden lg:block rounded-xl border border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark p-2 h-full"
            role="tablist"
            aria-orientation="vertical"
          >
            <h3 class="mb-3 px-2 text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">
              Account Settings
            </h3>

            <ul class="space-y-1">
              <li v-for="t in tabs" :key="t.key">
                <RouterLink
                  :to="toFor(t)"
                  custom
                  v-slot="{ navigate }"
                >
                  <button
                    :id="`tab-${t.key}`"
                    :aria-controls="`panel-${t.key}`"
                    role="tab"
                    :aria-selected="isActive(t)"
                    @click="navigate"
                    :class="tabClass(t)"
                  >
                    <span class="material-symbols-outlined text-base">{{ t.icon }}</span>
                    <span class="truncate">{{ t.label }}</span>
                  </button>
                </RouterLink>
              </li>
            </ul>
          </nav>

          <!-- Mobile top tab bar -->
          <div class="lg:hidden -mt-2">
            <div
              role="tablist"
              aria-orientation="horizontal"
              class="flex gap-2 overflow-x-auto no-scrollbar rounded-xl border border-slate-200 dark:border-slate-800
                     bg-background-light dark:bg-background-dark p-2"
            >
              <RouterLink
                v-for="t in tabs"
                :key="t.key"
                :to="toFor(t)"
                custom
                v-slot="{ navigate }"
              >
                <button
                  @click="navigate"
                  :aria-selected="isActive(t)"
                  :class="mobileTabClass(t)"
                >
                  <span class="material-symbols-outlined text-base">{{ t.icon }}</span>
                  <span class="truncate">{{ t.label }}</span>
                </button>
              </RouterLink>
            </div>
          </div>
        </aside>

        <!-- =============== Content =============== -->
        <section class="lg:col-span-9">
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark p-6 h-full">
            <!-- Child pages render here -->
            <RouterView />
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { useRoute } from 'vue-router'

/** If you pass username as a prop via the route, you can keep this.
    It's optional — we read route.params.username below anyway. */
defineProps({ username: { type: String, required: false } })

const route = useRoute()

/** Tabs model — names MUST match your index.js child route names */
const tabs = [
  { key: 'my-profile',      label: 'My Profile',        icon: 'person',        routeName: 'edit-profile.my-profile' },
  { key: 'my-business',     label: 'My Business',       icon: 'storefront',    routeName: 'edit-profile.my-business' },
  { key: 'notifications',   label: 'Notifications',     icon: 'notifications', routeName: 'edit-profile.notifications' },
  { key: 'return-refund',    label: 'Return Refund',    icon: 'undo',          routeName: 'edit-profile.return-refund' },
  { key: 'change-password', label: 'Change Password',   icon: 'key',           routeName: 'edit-profile.change-password' },
  { key: 'delete-account',  label: 'Delete Account',    icon: 'delete_forever',routeName: 'edit-profile.delete-account' },
]

/** Is this tab active? (based on the current named child route) */
const isActive = (t) => route.name === t.routeName

/** Router target helper (preserves :username from the URL) */
const toFor = (t) => ({ name: t.routeName, params: { username: route.params.username } })

/** Shared button classes + active/hover styles (desktop) */
const baseTabBtn =
  'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary'
const tabClass = (t) =>
  (isActive(t)
    ? 'bg-primary/10 text-primary dark:bg-primary/20'
    : 'text-slate-700 dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:ring-2 hover:ring-primary/40'
  ) + ' ' + baseTabBtn

/** Mobile tab button styles */
const baseMobileBtn =
  'shrink-0 inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary'
const mobileTabClass = (t) =>
  (isActive(t)
    ? 'bg-primary/10 text-primary dark:bg-primary/20'
    : 'text-slate-700 dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:ring-2 hover:ring-primary/40'
  ) + ' ' + baseMobileBtn
</script>

<style scoped>
/* Hide scrollbar on the mobile tab bar */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
