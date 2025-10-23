<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { user } from '@/store/user.js'
import { auth } from '@/firebase/firebase_config'
import { signOut } from 'firebase/auth'
/* 🔽 NEW: read name from Firestore */
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebase_config'

import SearchOverlay from '@/components/layout/SearchOverlay.vue'

const router = useRouter()

/* 🔽 NEW: reactive name shown in the navbar */
const displayName = ref('')

/* 🔽 NEW: robust loader that prefers Firestore, falls back to Auth */
async function loadName () {
  try {
    const uid = user?.uid || auth.currentUser?.uid
    const authName = (auth.currentUser?.displayName || '').trim()
    const authEmail = (auth.currentUser?.email || '').trim()

    if (uid) {
      const snap = await getDoc(doc(db, 'users', uid))
      displayName.value =
        (snap.exists() && (snap.data().displayName || '').trim()) ||
        authName ||
        authEmail
    } else {
      displayName.value = authName || authEmail || ''
    }
  } catch {
    displayName.value = (auth.currentUser?.displayName || auth.currentUser?.email || '').trim()
  }
}

/* Theme */
const isDark = ref(false)
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = savedTheme ? savedTheme === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', isDark.value)

  /* 🔽 NEW: ensure name loads on first mount */
  loadName()
})
/* 🔽 NEW: refresh name when login state or uid changes */
watch(() => [user.isLoggedIn, user.uid], () => { loadName() })

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

/* Logo swap based on theme */
const lightLogo = new URL('../../assets/housebibi_logo_light.svg', import.meta.url).href
const darkLogo  = new URL('../../assets/housebibi_logo_dark.svg', import.meta.url).href
const logoSrc   = computed(() => (isDark.value ? darkLogo : lightLogo))

/* Search overlay */
const showSearchOverlay = ref(false)

/* Profile dropdown */
const showProfileDropdown = ref(false)
async function handleLogout () {
  try {
    showMobileNav.value = false
    await signOut(auth)
    showProfileDropdown.value = false
    await router.push('/')
    window.location.reload()
  } catch (err) {
    console.error('Error logging out:', err)
    alert('Failed to logout. Please try again.')
  }
}
onMounted(() => {
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.profile-dropdown-container')
    if (dropdown && !dropdown.contains(e.target)) showProfileDropdown.value = false
  })
})

router.afterEach(() => {
  showProfileDropdown.value = false
})

/* Mobile nav */
const showMobileNav = ref(false)
const toggleMobileNav = () => { showMobileNav.value = !showMobileNav.value }
const closeMobileNav  = () => { showMobileNav.value = false }
</script>

<template>
<header class="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/80 bg-background-light/80 px-4 py-3 backdrop-blur-sm dark:border-slate-800/80 dark:bg-background-dark/80 sm:px-6 lg:px-8">
  <SearchOverlay :show="showSearchOverlay" @close="showSearchOverlay = false" @select="(business) => console.log('Selected:', business)" />

  <!-- LEFT: Logo + Desktop nav -->
  <div class="flex items-center gap-6">
    <RouterLink to="/" class="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
      <img :src="logoSrc" alt="Housebibi logo" class="h-9 w-9 shrink-0 select-none" />
      <span class="hidden sm:inline text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
      HousebibiGoWhere
      </span>
    </RouterLink>

    <!-- Desktop nav links -->
    <nav class="hidden [@media(min-width:880px)]:flex items-center gap-6">
      <RouterLink to="/" class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary">Home</RouterLink>
      <RouterLink to="/products/" class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary">Products</RouterLink>
      <RouterLink to="/about/" class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary">About Us</RouterLink>
      <RouterLink to="/for-sellers" class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary">For Sellers</RouterLink>
    </nav>
  </div>

  <!-- RIGHT: Search, Dark Mode, Cart/Wishlist/Profile -->
  <div class="flex items-center gap-4">
    <!-- Search -->
    <div class="relative block">
      <button @click="showSearchOverlay = true" class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors" title="Search">
        <svg class="h-5 w-5 text-slate-800 dark:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"/>
        </svg>
      </button>
    </div>

    <!-- Dark Mode Toggle -->
    <button @click="toggleDarkMode" class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
      <svg v-if="!isDark" class="h-5 w-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>
      <svg v-else class="h-5 w-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
      </svg>
    </button>


    <div v-if="!user.isLoggedIn && !user.loading" class="hidden [@media(min-width:880px)]:flex items-center gap-3">
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

    <!-- Desktop only: Cart, Wishlist, Profile -->
    <div v-else-if="user.isLoggedIn && !user.loading" class="flex items-center gap-4">

        <!-- Wishlist Icon -->
          <RouterLink to="/buyer-favourites/">
            <button
              class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
              <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#010101" d="m12.1 18.55l-.1.1l-.11-.1C7.14 14.24 4 11.39 4 8.5C4 6.5 5.5 5 7.5 5c1.54 0 3.04 1 3.57 2.36h1.86C13.46 6 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5c0 2.89-3.14 5.74-7.9 10.05M16.5 3c-1.74 0-3.41.81-4.5 2.08C10.91 3.81 9.24 3 7.5 3C4.42 3 2 5.41 2 8.5c0 3.77 3.4 6.86 8.55 11.53L12 21.35l1.45-1.32C18.6 15.36 22 12.27 22 8.5C22 5.41 19.58 3 16.5 3"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#fff" d="m12.1 18.55l-.1.1l-.11-.1C7.14 14.24 4 11.39 4 8.5C4 6.5 5.5 5 7.5 5c1.54 0 3.04 1 3.57 2.36h1.86C13.46 6 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5c0 2.89-3.14 5.74-7.9 10.05M16.5 3c-1.74 0-3.41.81-4.5 2.08C10.91 3.81 9.24 3 7.5 3C4.42 3 2 5.41 2 8.5c0 3.77 3.4 6.86 8.55 11.53L12 21.35l1.45-1.32C18.6 15.36 22 12.27 22 8.5C22 5.41 19.58 3 16.5 3"/>
              </svg>
            </button>
          </RouterLink>

        <!-- Cart Icon -->
        <button @click="() => console.log('Go to cart')"
            class="relative p-2 rounded-lg text-white hover:bg-primary/90">
            <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#010101" d="M17 18a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.11.89-2 2-2M1 2h3.27l.94 2H20a1 1 0 0 1 1 1c0 .17-.05.34-.12.5l-3.58 6.47c-.34.61-1 1.03-1.75 1.03H8.1l-.9 1.63l-.03.12a.25.25 0 0 0 .25.25H19v2H7a2 2 0 0 1-2-2c0-.35.09-.68.24-.96l1.36-2.45L3 4H1zm6 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.11.89-2 2-2m9-7l2.78-5H6.14l2.36 5z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M17 18a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.11.89-2 2-2M1 2h3.27l.94 2H20a1 1 0 0 1 1 1c0 .17-.05.34-.12.5l-3.58 6.47c-.34.61-1 1.03-1.75 1.03H8.1l-.9 1.63l-.03.12a.25.25 0 0 0 .25.25H19v2H7a2 2 0 0 1-2-2c0-.35.09-.68.24-.96l1.36-2.45L3 4H1zm6 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.11.89-2 2-2m9-7l2.78-5H6.14l2.36 5z"/>
            </svg>
            <!-- Cart Item Count Badge -->
                <span class="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-4 h-4">
                {{ user.cart.length }}
                </span>
        </button>

        <!-- Profile Dropdown -->
        <div class="hidden [@media(min-width:880px)]:flex relative profile-dropdown-container">
            <button 
            @click.stop="showProfileDropdown = !showProfileDropdown"
            class="focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
                <img :src="user.avatar" alt="avatar" class="h-10 w-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" />
            </button>

            <!-- Dropdown Menu -->
            <Transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95">                                
                <div 
                    v-if="showProfileDropdown"
                    class="absolute right-0 mt-12 w-56 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                                    
                    <!-- User Info -->
                    <RouterLink v-if="user.role !== 'seller'" to="/buyer-account/">
                      <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                          <!-- 🔽 CHANGED: use displayName -->
                          <p class="text-sm font-medium text-slate-900 dark:text-white">{{ displayName }}</p>
                          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ user.email }}</p>
                          <span class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                              Buyer
                          </span>
                      </div>
                    </RouterLink>

                    <!-- Menu Items -->
                    <div class="py-1">
                        <!-- Dashboard Link for Buyers -->
                        <RouterLink 
                            v-if="user.role !== 'seller'"
                            to="/buyer-dashboard/"
                            @click="showProfileDropdown = false"
                            class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </RouterLink>

                        <button 
                            @click="handleLogout(); closeMobileNav()"
                            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </Transition>
        </div>
    </div>

    <!-- Hamburger / Close Icon -->
    <button 
      @click="toggleMobileNav"
      class="[@media(min-width:880px)]:hidden p-2 rounded-md text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <svg v-if="!showMobileNav" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>

      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

  </div>
</header>

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
        class="fixed left-0 right-0 top-[64px] z-40 block [@media(min-width:880px)]:hidden border-t border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark shadow-lg"
      >
        <nav class="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 block [@media(min-width:880px)]:hidden">
        <div class="flex flex-col gap-2">
        
        <div v-if="!user.isLoggedIn && !user.loading" class="flex flex-col gap-2">
              <RouterLink
                    to="/"
                    @click="closeMobileNav"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                    Home
                </RouterLink>

                <RouterLink
                    to="/products/"
                    @click="closeMobileNav"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                    Products
                </RouterLink>

                <RouterLink
                    to="/about/"
                    @click="closeMobileNav"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                    About Us
                </RouterLink>

                <RouterLink
                    to="/for-sellers/"
                    @click="closeMobileNav"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                    For Sellers
                </RouterLink>

                  <div class="mt-2 flex gap-2">
                    <RouterLink
                      to="/signup/"
                      @click="closeMobileNav"
                      class="flex-1 flex items-center justify-center rounded-lg h-10 bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors">
                      Sign Up
                    </RouterLink>
                    <RouterLink
                      to="/login/"
                      @click="closeMobileNav"
                      class="flex-1 flex items-center justify-center rounded-lg h-10 bg-background text-gray-800 border border-gray-300 text-sm font-bold hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors">
                      Log In
                    </RouterLink>
                  </div>
        </div>

            <div v-else-if="user.isLoggedIn && !user.loading" class="flex flex-col gap-2">
                <RouterLink
                    to="/"
                    @click="closeMobileNav"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                    Home
                </RouterLink>

                <RouterLink
                    to="/products/"
                    @click="closeMobileNav"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                    Products
                </RouterLink>

                <RouterLink
                    to="/about/"
                    @click="closeMobileNav"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                    About Us
                </RouterLink>

                <RouterLink
                    to="/for-sellers/"
                    @click="closeMobileNav"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                    For Sellers
                </RouterLink>

                <RouterLink
                    v-if="user.role !== 'seller'"
                    to="/buyer-dashboard/"
                    @click="closeMobileNav"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                    Dashboard
                </RouterLink>

              <RouterLink
                to="/buyer-account/"
                @click="closeMobileNav"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span class="inline-block h-8 w-8 rounded-full bg-cover bg-center"
                  :style="{ backgroundImage: `url('${user.avatar || '/avatar.png'}')` }"></span>
                <div class="min-w-0">
                  <!-- 🔽 CHANGED: use displayName -->
                  <p class="truncate font-medium">{{ displayName }}</p>
                  <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ user.email }}</p>
                  <span
                    class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary"
                  >
                    {{ user.role === 'seller' ? 'Seller' : 'Buyer' }}
                  </span>
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

</template>