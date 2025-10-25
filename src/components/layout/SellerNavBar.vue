<script setup> 
import { ref, onMounted, computed, watch } from 'vue'
import { user } from '@/store/user.js'
import { auth, db } from '@/firebase/firebase_config'
import { signOut } from 'firebase/auth'
/* 🔽 Firestore helpers to read displayName + username */
import { doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
const { success, error:toastError } = useToast()

const router = useRouter()

/* ---------------------------------------
 * Name & Username used in navbar/links
 * --------------------------------------- */
const displayName = ref('')     // shown text
const username = ref('')        // 🔵 NEW: used for /:username/ routing

const avatarUrl = computed(() => {
  if (user.avatar) return user.avatar
  
  const name = displayName.value || user.email || 'Seller'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=200`
})
/* Robust loader: prefers Firestore, falls back to Auth */
async function loadName () {
  try {
    const uid = user?.uid || auth.currentUser?.uid
    const authName = (auth.currentUser?.displayName || '').trim()
    const authEmail = (auth.currentUser?.email || '').trim()

    if (uid) {
      const snap = await getDoc(doc(db, 'users', uid))
      const data = snap.exists() ? (snap.data() || {}) : {}
      displayName.value =
        (data.displayName || '').trim() ||
        authName ||
        authEmail

      // 🔵 NEW: capture username from /users so we can route to /:username/
      username.value =
        String(data.username || user?.username || '').trim().toLowerCase()
    } else {
      displayName.value = authName || authEmail || ''
      // fallback (no uid) — username stays empty
      username.value = String(user?.username || '').trim().toLowerCase()
    }
  } catch {
    displayName.value = (auth.currentUser?.displayName || auth.currentUser?.email || '').trim()
    username.value = String(user?.username || '').trim().toLowerCase()
  }
}

/* 🔵 NEW: computed route target for BusinessHomepage (/ :username /) */
const profileTo = computed(() => {
  if (username.value) {
    // uses the named route defined in router/index.js:
    // { path: '/:username/', name: 'business-home', ... }
    return { name: 'business-home', params: { username: username.value } }
  }
  // graceful fallback if username not set yet
  return '/complete-profile/'
})

//  🔵 NEW: seller messages tab 
  import { useMessages } from '@/composables/useMessages';

  // Get unread message count
  const currentUserId = computed(() => auth.currentUser?.uid);
  const { totalUnreadCount, loadConversations } = useMessages(currentUserId);

  // Load conversations when user is logged in
  watch(() => [user.isLoggedIn, user.uid], ([loggedIn, uid]) => {
    if (loggedIn && uid) {
      loadConversations();
    }
  }, { immediate: true });

/* ------------------------------
 * Theme (light/dark)
 * ------------------------------ */
const isDark = ref(false)

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = savedTheme ? savedTheme === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', isDark.value)

  /* ensure name + username load on first mount */
  loadName()
})

/* refresh data when login state or uid changes */
watch(() => [user.isLoggedIn, user.uid], () => { loadName() })

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

/* Swap logo based on theme */
const lightLogo = new URL('../../assets/housebibi_logo_light.svg', import.meta.url).href
const darkLogo  = new URL('../../assets/housebibi_logo_dark.svg',  import.meta.url).href
const logoSrc   = computed(() => (isDark.value ? darkLogo : lightLogo))

/* ------------------------------
 * Profile dropdown
 * ------------------------------ */
const showProfileDropdown = ref(false)

async function handleLogout () {
  try {
    await signOut(auth)
    showProfileDropdown.value = false
    await router.push('/')
    window.location.reload()
  } catch (err) {
    console.error('Error logging out:', err)
    toastError('Failed to logout. Please try again.')
  }
}

/* Close dropdown on outside click */
onMounted(() => {
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.profile-dropdown-container')
    if (dropdown && !dropdown.contains(e.target)) showProfileDropdown.value = false
  })
})

/* ------------------------------
 * Mobile nav (hamburger)
 * ------------------------------ */
const showMobileNav = ref(false)
const toggleMobileNav = () => { showMobileNav.value = !showMobileNav.value }
const closeMobileNav  = () => { showMobileNav.value = false }
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-slate-200/80 bg-background-light/80 backdrop-blur-sm dark:border-slate-800/80 dark:bg-background-dark/80">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

      <!-- LEFT: Logo + brand + (Desktop) nav -->
      <div class="flex items-center gap-6">
        <RouterLink to="/" class="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
          <img :src="logoSrc" alt="Housebibi logo" class="h-9 w-9 shrink-0 select-none" />
          <span class="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
            HousebibiGoWhere
          </span>
        </RouterLink>

        <!-- Desktop nav now sits on the LEFT -->
        <nav class="hidden md:flex items-center gap-6">
          <RouterLink
            to="/seller-orders/"
            class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors">
            Orders
          </RouterLink>
          <RouterLink
            to="/seller-messages/"
            class="relative text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors">
            Messages
            <span v-if="totalUnreadCount > 0" 
              class="absolute -top-1 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {{ totalUnreadCount > 9 ? '9+' : totalUnreadCount }}
            </span>
          </RouterLink>
          <RouterLink
            to="/dashboard/"
            class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors">
            Dashboard
          </RouterLink>
        </nav>
      </div>

      <!-- RIGHT: Theme toggle + Profile (desktop) + Hamburger -->
      <div class="flex items-center gap-2">
        <!-- Theme toggle (always visible) -->
        <button
          @click="toggleDarkMode"
          class="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
          <svg v-if="!isDark" class="h-5 w-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <svg v-else class="h-5 w-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        </button>

        <!-- Auth: Login/Signup (desktop >= md) -->
        <div v-if="!user.isLoggedIn" class="hidden md:flex items-center gap-3">
          <RouterLink
            to="/signup/"
            class="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors">
            <span class="truncate">Sign Up</span>
          </RouterLink>

          <RouterLink
            to="/login/"
            class="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-background text-gray-800 border border-gray-300 text-sm font-bold hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors">
            <span class="truncate">Log In</span>
          </RouterLink>
        </div>

        <!-- Profile (desktop >= md). It disappears on mobile (in hamburger menu instead). -->
        <div v-else-if="user.isLoggedIn && !user.loading" class="hidden md:block">
          <div class="relative profile-dropdown-container">
            <button
              @click.stop="showProfileDropdown = !showProfileDropdown"
              class="focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
              <img 
                  :src="user.avatar || '/avatar.png'" 
                  @error="$event.target.src = '/avatar.png'"
                  alt="Profile" 
                  class="h-8 w-8 rounded-full object-cover"
              />
          </button>

            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95">
              <div
                v-if="showProfileDropdown"
                class="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <p class="text-sm font-medium text-slate-900 dark:text-white">{{ displayName }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ user.email }}</p>
                  <span class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    Seller
                  </span>
                </div>

                <div class="py-1">
                  <!-- 🔁 CHANGED: was to="/seller-profile" -->
                  <RouterLink
                    :to="profileTo"
                    @click="showProfileDropdown = false"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    My Profile
                  </RouterLink>

                  <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Hamburger (mobile < md) -->
        <button
          class="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          @click="toggleMobileNav"
          :aria-expanded="showMobileNav"
          aria-controls="mobile-menu"
          aria-label="Toggle navigation">
          <span class="material-symbols-outlined text-xl text-slate-700 dark:text-slate-200">
            {{ showMobileNav ? 'close' : 'menu' }}
          </span>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0">
      <div
        v-if="showMobileNav"
        id="mobile-menu"
        class="md:hidden border-t border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark">
        <nav class="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div class="flex flex-col gap-2">
            <RouterLink
              to="/seller-orders/"
              @click="closeMobileNav"
              class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
              Orders
            </RouterLink>
            <RouterLink
              to="/seller-messages/"
              @click="closeMobileNav"
              class="relative rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
              <span class="flex items-center justify-between">
                Messages
                <span v-if="totalUnreadCount > 0" 
                  class="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {{ totalUnreadCount > 9 ? '9+' : totalUnreadCount }}
                </span>
              </span>
            </RouterLink>
            <RouterLink
              to="/dashboard/"
              @click="closeMobileNav"
              class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
              Dashboard
            </RouterLink>

            <div v-if="!user.isLoggedIn" class="mt-2 grid grid-cols-2 gap-2">
              <RouterLink
                to="/signup/"
                @click="closeMobileNav"
                class="flex items-center justify-center rounded-lg h-10 bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors">
                Sign Up
              </RouterLink>
              <RouterLink
                to="/login/"
                @click="closeMobileNav"
                class="flex items-center justify-center rounded-lg h-10 bg-background text-gray-800 border border-gray-300 text-sm font-bold hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors">
                Log In
              </RouterLink>
            </div>

            <div v-else-if="user.isLoggedIn && !user.loading" class="mt-2">
              <!-- 🔁 CHANGED: was to="/seller-profile" -->
              <RouterLink
                :to="profileTo"
                @click="closeMobileNav"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <img 
                  :src="user.avatar || '/avatar.png'" 
                  @error="$event.target.src = '/avatar.png'"
                  alt="Profile" 
                  class="h-8 w-8 rounded-full object-cover"
              />
                <div class="min-w-0">
                  <p class="truncate font-medium">{{ displayName }}</p>
                  <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ user.email }}</p>
                </div>
              </RouterLink>
              <button
                @click="handleLogout"
                class="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>
