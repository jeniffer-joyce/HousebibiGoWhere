<!-- src/views/sellers/EditAccount.vue -->
<template>
  <main class="flex-grow">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-6 items-start">
        <!-- =============== Collapsible Sidebar =============== -->
        <aside 
          :class="[
            'sticky top-4 transition-all duration-300 ease-in-out',
            'hidden sm:block',
            isCollapsed ? 'w-16' : 'w-64'
          ]"
        >
          <nav
            aria-label="Account sections"
            class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
            role="tablist"
            aria-orientation="vertical"
          >
            <!-- Toggle Button -->
            <div 
              :class="[
                'flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50',
                isCollapsed ? 'justify-center p-3' : 'justify-between p-4'
              ]"
            >
              <h3 
                v-if="!isCollapsed"
                class="text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Account Settings
              </h3>
              <button
                @click="toggleSidebar"
                class="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
              >
                <span class="material-symbols-outlined text-lg text-slate-600 dark:text-slate-400">
                  {{ isCollapsed ? 'menu' : 'menu_open' }}
                </span>
              </button>
            </div>

            <!-- Navigation Items -->
            <ul class="p-2">
              <li v-for="t in tabs" :key="t.key" class="mb-1">
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
                    :class="[
                      'w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                      isCollapsed ? 'justify-center' : 'gap-3',
                      isActive(t)
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    ]"
                    :title="isCollapsed ? t.label : ''"
                  >
                    <span class="material-symbols-outlined text-xl shrink-0">
                      {{ t.icon }}
                    </span>
                    <span 
                      v-if="!isCollapsed" 
                      class="truncate text-left"
                    >
                      {{ t.label }}
                    </span>
                  </button>
                </RouterLink>
              </li>
            </ul>
          </nav>
        </aside>

        <!-- =============== Main Content =============== -->
        <section class="flex-1 min-w-0">
          <!-- Mobile Navigation -->
          <div class="sm:hidden mb-6">
            <div class="relative">
              <button
                @click="showMobileMenu = !showMobileMenu"
                class="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-primary">
                    {{ currentTab?.icon }}
                  </span>
                  <span class="font-medium text-slate-900 dark:text-slate-100">
                    {{ currentTab?.label }}
                  </span>
                </div>
                <span class="material-symbols-outlined text-slate-500">
                  {{ showMobileMenu ? 'expand_less' : 'expand_more' }}
                </span>
              </button>

              <!-- Mobile Dropdown Menu -->
              <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-1"
              >
                <div
                  v-if="showMobileMenu"
                  class="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden"
                >
                  <RouterLink
                    v-for="t in tabs"
                    :key="t.key"
                    :to="toFor(t)"
                    custom
                    v-slot="{ navigate }"
                  >
                    <button
                      @click="() => { navigate(); showMobileMenu = false }"
                      :class="[
                        'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                        'border-b border-slate-100 dark:border-slate-800 last:border-b-0',
                        isActive(t)
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      ]"
                    >
                      <span class="material-symbols-outlined text-xl">
                        {{ t.icon }}
                      </span>
                      <span>{{ t.label }}</span>
                    </button>
                  </RouterLink>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Content Area -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <RouterView />
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

defineProps({ username: { type: String, required: false } })

const route = useRoute()

/** Tabs configuration */
const tabs = [
  { key: 'my-profile',      label: 'My Profile',        icon: 'person',         routeName: 'edit-profile.my-profile' },
  { key: 'my-business',     label: 'My Business',       icon: 'storefront',     routeName: 'edit-profile.my-business' },
  { key: 'change-password', label: 'Change Password',   icon: 'key',            routeName: 'edit-profile.change-password' },
  { key: 'delete-account',  label: 'Delete Account',    icon: 'delete_forever', routeName: 'edit-profile.delete-account' },
]

/** State */
const isCollapsed = ref(false)
const showMobileMenu = ref(false)
const userCollapsedManually = ref(false)

/** Current active tab */
const currentTab = computed(() => tabs.find(t => t.routeName === route.name))

/** Check if tab is active */
const isActive = (t) => route.name === t.routeName

/** Router target helper */
const toFor = (t) => ({ name: t.routeName, params: { username: route.params.username } })

/** Toggle sidebar manually */
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  userCollapsedManually.value = true
}

/** Auto-collapse based on screen size */
const handleResize = () => {
  // If user hasn't manually toggled, auto-collapse based on screen size
  if (!userCollapsedManually.value) {
    if (window.innerWidth < 1024) { // lg breakpoint
      isCollapsed.value = true
    } else if (window.innerWidth >= 1280) { // xl breakpoint
      isCollapsed.value = false
    }
  }
}

/** Setup */
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Smooth transitions */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>