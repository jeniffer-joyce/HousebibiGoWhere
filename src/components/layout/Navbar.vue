<script setup>
import { ref, onMounted } from 'vue';
import { user } from "@/store/user.js";
import SearchOverlay from '@/components/layout/SearchOverlay.vue';


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

const showSearchOverlay = ref(false)

</script>

<template>
    <header
        class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-background-light/80 px-4 py-3 backdrop-blur-sm dark:border-slate-800/80 dark:bg-background-dark/80 sm:px-6 lg:px-8">
        <SearchOverlay :show="showSearchOverlay" @close="showSearchOverlay = false"
            @select="(business) => console.log('Selected:', business)" />
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
                <RouterLink to="/"
                    class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    href="#">Home</RouterLink>
                <RouterLink to="/categories/"
                    class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    href="#">Categories</RouterLink>
                <RouterLink to="/about/"
                    class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    href="#">About Us</RouterLink>
                <RouterLink to="/for-sellers"
                    class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    href="#">For Sellers</RouterLink>
            </nav>
        </div>
        <div class="flex items-center gap-4">
            <div class="relative hidden lg:block">
                <button @click="showSearchOverlay = true"
                    class="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                    title="Search">
                    <svg class="h-5 w-5 text-slate-800 dark:text-slate-200" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                    </svg>
                </button>
            </div>

            <!-- Dark Mode Toggle -->
            <button @click="toggleDarkMode"
                class="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
                <!-- Sun Icon (Light Mode) -->
                <svg v-if="!isDark" class="h-5 w-5 text-slate-800" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
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
                <div v-else class="flex items-center gap-4">
                    <!-- Cart Icon -->
                    <button @click="() => console.log('Go to cart')"
                        class="relative p-2 rounded-lg bg-primary text-white hover:bg-primary/90">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7H19M7 13l-4-8m16 0v2M9 21h6" />
                        </svg>
                        <!-- Cart Item Count Badge -->
                        <span
                            class="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-4 h-4">
                            {{ user.cart.length }}
                        </span>
                    </button>

                    <!-- Wishlist Icon -->
                    <button @click="() => console.log('Go to wishlist')"
                        class="relative p-2 rounded-lg bg-primary text-white hover:bg-primary/90">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 8c0-1.105.895-2 2-2h12c1.105 0 2 .895 2 2v12l-8-4-8 4V8z" />
                        </svg>
                        <!-- Wishlist Count Badge -->
                        <span
                            class="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-4 h-4">
                            {{ user.wishlist.length }}
                        </span>
                    </button>

                    <!-- Profile Picture -->
                    <img :src="user.avatar" alt="avatar" class="h-10 w-10 rounded-full" />
                </div>
            </div>
        </div>
    </header>
</template>
