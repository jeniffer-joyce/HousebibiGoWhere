<script setup>
import { ref, watch } from 'vue';
import { useUnsplashImages } from '@/composables/useUnsplashImages';

const props = defineProps({
    modelValue: {
        type: Object,
        default: null
    },
    placeholder: {
        type: String,
        default: 'Search for images (e.g., "coffee", "bakery", "handmade")'
    }
});

const emit = defineEmits(['update:modelValue', 'select']);

const {
    searchQuery,
    searchResults,
    isSearching,
    selectedPhoto,
    error,
    performSearch,
    selectPhoto,
    clearSelection
} = useUnsplashImages();

const showPicker = ref(false);

// Handle photo selection
async function handleSelectPhoto(photo) {
    try {
        const selected = await selectPhoto(photo);
        emit('update:modelValue', selected);
        emit('select', selected);
        showPicker.value = false;
    } catch (err) {
        alert('Failed to select image. Please try again.');
    }
}

// Handle removal
function handleRemovePhoto() {
    clearSelection();
    emit('update:modelValue', null);
    emit('select', null);
}

// Sync with parent's v-model
watch(() => props.modelValue, (newVal) => {
    if (!newVal) {
        clearSelection();
    }
});
</script>

<template>
    <div class="unsplash-image-picker">
        <!-- Selected Photo Display -->
        <div v-if="selectedPhoto" class="selected-photo mb-4">
            <div class="relative rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
                <img 
                    :src="selectedPhoto.urls.regular" 
                    :alt="selectedPhoto.description"
                    class="w-full h-48 object-cover"
                />
                <button
                    @click="handleRemovePhoto"
                    class="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    type="button">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <!-- Attribution (REQUIRED by Unsplash) -->
            <div class="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Photo by 
                <a 
                    :href="selectedPhoto.attribution.photographerLink" 
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline hover:text-primary">
                    {{ selectedPhoto.attribution.photographerName }}
                </a>
                on 
                <a 
                    href="https://unsplash.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline hover:text-primary">
                    Unsplash
                </a>
            </div>
        </div>

        <!-- Open Picker Button -->
        <button
            v-if="!selectedPhoto"
            @click="showPicker = true"
            type="button"
            class="w-full py-3 px-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary dark:hover:border-primary transition-colors text-slate-600 dark:text-slate-400 hover:text-primary flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Search Unsplash for AI Images
        </button>

        <!-- Image Picker Modal -->
        <Teleport to="body">
            <div 
                v-if="showPicker"
                class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
                @click.self="showPicker = false">
                <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    <!-- Header -->
                    <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-slate-900 dark:text-white">
                                Search Unsplash Images
                            </h3>
                            <button
                                @click="showPicker = false"
                                class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                type="button">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <!-- Search Input -->
                        <div class="relative">
                            <input
                                v-model="searchQuery"
                                type="text"
                                :placeholder="placeholder"
                                class="w-full px-4 py-3 pl-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <!-- Error Message -->
                        <div v-if="error" class="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                            {{ error }}
                        </div>
                    </div>

                    <!-- Results -->
                    <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 200px);">
                        <!-- Loading State -->
                        <div v-if="isSearching" class="flex justify-center items-center py-12">
                            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                        </div>

                        <!-- Empty State -->
                        <div v-else-if="!searchQuery.trim()" class="text-center py-12 text-slate-500 dark:text-slate-400">
                            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Start typing to search for images</p>
                        </div>

                        <!-- No Results -->
                        <div v-else-if="searchResults.length === 0 && !isSearching" class="text-center py-12 text-slate-500 dark:text-slate-400">
                            No images found. Try a different search term.
                        </div>

                        <!-- Image Grid -->
                        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            <button
                                v-for="photo in searchResults"
                                :key="photo.id"
                                @click="handleSelectPhoto(photo)"
                                type="button"
                                class="group relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer">
                                <img
                                    :src="photo.urls.small"
                                    :alt="photo.description"
                                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <!-- Overlay on hover -->
                                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                    <span class="text-white text-xs truncate">
                                        by {{ photo.user.name }}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Footer with Unsplash Attribution -->
                    <div class="p-4 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                        Powered by 
                        <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" class="underline hover:text-primary">
                            Unsplash
                        </a>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>