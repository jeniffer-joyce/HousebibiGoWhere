<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <!-- Primary app sidebar -->
    <BuyerSideBar @sidebar-toggle="isCollapsed = $event" />

    <!-- Page content shifts with BuyerSideBar width on md+ only (no push on mobile) -->
    <main
      class="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 md:ml-64"
      :class="{ 'md:!ml-20': isCollapsed }"
    >
      <div class="mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 lg:gap-6">
        <!-- Secondary account sidebar -->
        <aside
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 lg:sticky lg:top-6 h-max"
        >
          <h3 class="mb-3 px-2 text-xs sm:text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            My Account
          </h3>

          <nav class="flex flex-col">
            <RouterLink
              v-for="it in items"
              :key="it.to"
              :to="it.to"
              class="px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              :class="isActive(it.to)
                ? 'bg-primary/10 text-primary'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'"
            >
              {{ it.label }}
            </RouterLink>
          </nav>
        </aside>

        <!-- Tab content -->
        <!-- Wrap with account-content so buttons inside tabs can scale on mobile via deep selectors -->
        <section class="min-w-0 account-content">
          <router-view />
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue'

const route = useRoute()
const router = useRouter()

// track BuyerSideBar collapsed state
const isCollapsed = ref(false)

const items = [
  { label: 'Profile',               to: '/buyer-account/profile' },
  { label: 'Banks & Cards',         to: '/buyer-account/banks-cards' },
  { label: 'Addresses',             to: '/buyer-account/addresses' },
  { label: 'Change Password',       to: '/buyer-account/password' },
  { label: 'Privacy Settings',      to: '/buyer-account/privacy' },
]

// when landing on /buyer-account or /buyer-account/ → push to default tab (Profile)
if (route.path === '/buyer-account' || route.path === '/buyer-account/') {
  router.replace('/buyer-account/profile')
}

function isActive (path) {
  return route.path.startsWith(path)
}
</script>

<style scoped>
/* Make buttons within tab content scale appropriately on mobile without changing any fetching logic */
@media (max-width: 767px) {
  /* Deep selector to reach children rendered by <router-view> */
  :deep(.account-content button) {
    font-size: 0.875rem;         /* text-sm */
    padding: 0.5rem 0.75rem;     /* px-3 py-2 */
    border-radius: 0.5rem;       /* rounded-lg */
  }
  :deep(.account-content .text-xl) { font-size: 1.125rem; } /* h2 in some tabs */
  :deep(.account-content .text-2xl) { font-size: 1.25rem; }
  :deep(.account-content .px-6) { padding-left: 1rem; padding-right: 1rem; }
  :deep(.account-content .py-3) { padding-top: 0.5rem; padding-bottom: 0.5rem; }
}
</style>