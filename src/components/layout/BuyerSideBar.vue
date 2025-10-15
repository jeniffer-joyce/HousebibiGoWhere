<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const navigationItems = [
    { name: 'Dashboard', icon: 'home', path: '/buyer/dashboard' },
    { name: 'Orders', icon: 'shopping-bag', path: '/buyer/orders' },
    { name: 'Favorites', icon: 'heart', path: '/buyer/favorites' },
    { name: 'Reviews', icon: 'star', path: '/buyer/reviews' },
    { name: 'Settings', icon: 'settings', path: '/buyer/settings' }
];

function navigateTo(path) {
    router.push(path);
}

function isActive(path) {
    return route.path === path;
}
</script>

<template>
    <aside class="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed h-full">
        <!-- Logo -->
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
            <RouterLink to="/" class="flex items-center gap-2">
                <svg class="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
                <span class="text-xl font-bold text-primary">HouseibiGoWhere</span>
            </RouterLink>
        </div>

        <!-- Navigation Items -->
        <nav class="p-4 space-y-2">
            <button
                v-for="item in navigationItems"
                :key="item.path"
                @click="navigateTo(item.path)"
                :class="[
                    'flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors',
                    isActive(item.path)
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                ]">
                <!-- Home Icon -->
                <svg v-if="item.icon === 'home'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <!-- Shopping Bag Icon -->
                <svg v-else-if="item.icon === 'shopping-bag'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                <!-- Heart Icon -->
                <svg v-else-if="item.icon === 'heart'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <!-- Star Icon -->
                <svg v-else-if="item.icon === 'star'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
                <!-- Settings Icon -->
                <svg v-else-if="item.icon === 'settings'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {{ item.name }}
            </button>
        </nav>
    </aside>
</template>

<style scoped>
button {
    transition: all 0.2s ease;
}
</style>