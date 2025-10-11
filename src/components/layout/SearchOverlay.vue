<script setup>
import { ref } from 'vue'
import { useSearch } from '@/composables/useSearch';
import { useCategories } from '@/composables/home/useCategories'

const props = defineProps({
    show: Boolean
})

const emit = defineEmits(['close', 'select'])

const searchQuery = ref('')
const { businesses, selectedCategories } = useCategories()

const {
    searchSuggestions,
    isSearching,
    selectSuggestion
} = useSearch(searchQuery, businesses, selectedCategories)

function handleSelect(business) {
    selectSuggestion(business)
    emit('select', business)
    emit('close')
}
</script>


<template>
    <transition name="fade-slide">
        <div v-if="show" class="fixed inset-0 z-50 pointer-events-none">
            <!-- Bottom Half - Blurred Backdrop (rendered first so it's behind) -->
            <div @click="$emit('close')"
                class="absolute bottom-0 left-0 w-full backdrop-blur-lg bg-slate-900/30 dark:bg-slate-950/50 pointer-events-auto"
                style="height: 60vh; top: 50vh;">
            </div>

            <!-- Top Half - Search Section -->
            <div class="absolute top-0 left-0 w-full bg-white dark:bg-slate-900 shadow-lg p-6 transition-all pointer-events-auto flex flex-col"
                style="height: 60vh;">

                <!-- Close Button -->
                    <div class="flex justify-end mb-4">
                        <button @click="$emit('close')" class="text-slate-600 dark:text-slate-300 hover:text-red-500">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Search Input -->
                    <div class="relative mb-4">
                        <input v-model="searchQuery" type="text" placeholder="Search products or businesses..."
                            class="w-full bg-transparent border-0 border-b-4 border-slate-300 dark:border-slate-700 px-0 py-3 text-2xl text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-0" />
                        <span v-if="isSearching" class="absolute right-4 top-1/2 -translate-y-1/2">
                            <svg class="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </span>
                    </div>
                <!-- Search Results: flex-grow + scroll -->
                <div class="flex-1 max-w-7xl mx-auto px-4 overflow-y-auto">
                    <div v-if="searchQuery.trim() && searchSuggestions.length === 0 && !isSearching"
                        class="text-center text-slate-500 dark:text-slate-400">
                        No results found.
                    </div>

                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button v-for="business in searchSuggestions" :key="business.name"
                            @click="handleSelect(business)"
                            class="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left">
                            <img :src="business.image" :alt="business.name" class="h-16 w-16 rounded-lg object-cover" />
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-slate-800 dark:text-slate-200 truncate">{{ business.name }}
                                </p>
                                <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ business.description
                                    || 'Click to view' }}</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>