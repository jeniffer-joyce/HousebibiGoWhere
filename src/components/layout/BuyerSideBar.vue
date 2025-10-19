<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const isCollapsed = ref(false);

const navigationItems = [
  { name: 'Dashboard', icon: 'home', path: '/buyer-dashboard/' },
  { name: 'Orders', icon: 'shopping-bag', path: '/buyer-orders/' },
  { name: 'Favorites', icon: 'heart', path: '/buyer-favourites/' },
  { name: 'Messages', icon: 'message', path: '/buyer-messages/' },
  { name: 'Account', icon: 'user', path: '/buyer-account/profile' }
];

function navigateTo(path) {
  router.push(path);
}

function isActive(path) {
  if (path.startsWith('/buyer-account/')) {
    return route.path.startsWith('/buyer-account/');
  }
  return route.path === path;
}

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}

const emit = defineEmits(['sidebar-toggle']);
watch(isCollapsed, (newVal) => emit('sidebar-toggle', newVal));
</script>

<template>
  <aside
    :class="[
      'bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed h-full transition-all duration-300 z-40',
      isCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-end">
      <button
        @click="toggleSidebar"
        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <svg
          class="h-5 w-5 text-slate-600 dark:text-slate-400 transition-transform"
          :class="{ 'rotate-180': isCollapsed }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </div>

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
        ]"
        :title="isCollapsed ? item.name : ''"
      >
        <svg v-if="item.icon === 'home'" class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <svg v-else-if="item.icon === 'shopping-bag'" class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <svg v-else-if="item.icon === 'heart'" class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <svg v-else-if="item.icon === 'message'" class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <svg v-else-if="item.icon === 'user'" class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span v-show="!isCollapsed" class="truncate">{{ item.name }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
button { transition: all 0.2s ease; }
</style>