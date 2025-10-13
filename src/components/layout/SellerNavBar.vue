<script setup>
import { ref, onMounted } from 'vue';
import { user } from "@/store/user.js";
import { auth } from "@/firebase/firebase_config";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { useRouter } from 'vue-router';

const router = useRouter();

// Dark mode state
const isDark = ref(false);

// Initialize dark mode from localStorage or system preference
onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        isDark.value = true;
        document.documentElement.classList.add('dark');
    } else {
        isDark.value = false;
        document.documentElement.classList.remove('dark');
    }
});

// Toggle dark mode
const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    
    if (isDark.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
};

// Profile dropdown state
const showProfileDropdown = ref(false)

// Logout function
async function handleLogout() {
    try {
        await signOut(auth)
        showProfileDropdown.value = false
        console.log('Logged out successfully')
        
        // Redirect to homepage and force refresh
        router.push('/').then(() => {
            window.location.reload()
        })
    } catch (error) {
        console.error('Error logging out:', error)
        alert('Failed to logout. Please try again.')
    }
}

// Close dropdown when clicking outside
onMounted(() => {
    document.addEventListener('click', (e) => {
        const dropdown = document.querySelector('.profile-dropdown-container')
        if (dropdown && !dropdown.contains(e.target)) {
            showProfileDropdown.value = false
        }
    })
})
</script>

<template>
    <header
        class="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/80 bg-background-light/80 px-4 py-3 backdrop-blur-sm dark:border-slate-800/80 dark:bg-background-dark/80 sm:px-6 lg:px-8">
        <div class="flex items-center gap-6">
            <RouterLink to="/">
                <div class="flex items-center gap-2">
                    <img src="../../assets/logo_housebibi_2.png" alt="My image" class="h-8 w-8">
                    <path
                        d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                        fill="currentColor"></path>
                    <h1 class="text-xl font-bold text-slate-900 dark:text-white">HousebibiGoWhere</h1>
                </div>
            </RouterLink>
            <nav class="hidden items-center gap-6 md:flex">
                <RouterLink to="/seller-orders/"
                    class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    href="#">Orders</RouterLink>
                <RouterLink to="/about/"
                    class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    href="#">Messages</RouterLink>
            </nav>
        </div>
        <div class="flex items-center gap-4">

            <!-- Dark Mode Toggle -->
            <button
                @click="toggleDarkMode"
                class="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
                <!-- Sun Icon (Light Mode) -->
                <svg v-if="!isDark" class="h-5 w-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
                    </path>
                </svg>
                <!-- Moon Icon (Dark Mode) -->
                <svg v-else class="h-5 w-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z">
                    </path>
                </svg>
            </button>

            <div>
                <div v-if="!user.isLoggedIn" class="flex items-center gap-4">
                    <RouterLink to="/signup/" 
                        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-accent text-white text-sm font-bold leading-normal tracking-wide hover:bg-accent/90 transition-colors">
                        <span class="truncate">Sign Up</span>
                    </RouterLink>

                    <RouterLink to="/login/" 
                        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background text-gray-800 border border-gray-300 text-sm font-bold leading-normal tracking-wide hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors">
                        <span class="truncate">Log In</span>
                    </RouterLink>
                </div>
                <div v-else-if="user.isLoggedIn && !user.loading" class="flex items-center gap-4">
                    <!-- Profile Picture with Dropdown -->
                    <div class="relative profile-dropdown-container">
                        <button 
                            @click.stop="showProfileDropdown = !showProfileDropdown"
                            class="focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
                            <div 
                                class="h-10 w-10 rounded-full bg-cover bg-center cursor-pointer hover:opacity-80 transition-opacity"
                                :style="{ backgroundImage: `url('${user.avatar || '/avatar.png'}')` }">
                            </div>
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
                                class="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                                
                                <!-- User Info -->
                                <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ user.name }}</p>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ user.email }}</p>
                                    <span class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                        Seller
                                    </span>
                                </div>

                                <!-- Menu Items -->
                                <div class="py-1">
                                    <RouterLink 
                                        to="/sellers/profile"
                                        @click="showProfileDropdown = false"
                                        class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        My Profile
                                    </RouterLink>

                                    <button 
                                        @click="handleLogout"
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
            </div>
        </div>
    </header>
</template>