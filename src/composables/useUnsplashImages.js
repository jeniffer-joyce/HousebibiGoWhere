// src/composables/useUnsplashImages.js
import { ref, watch } from 'vue';
import { searchPhotos, trackPhotoDownload, getPhotoAttribution } from '@/firebase/services/unsplash.js';

export function useUnsplashImages() {
    const searchQuery = ref('');
    const searchResults = ref([]);
    const isSearching = ref(false);
    const currentPage = ref(1);
    const totalPages = ref(0);
    const selectedPhoto = ref(null);
    const error = ref(null);

    let searchTimeout = null;

    // Debounced search
    watch(searchQuery, (newQuery) => {
        clearTimeout(searchTimeout);
        
        if (!newQuery.trim()) {
            searchResults.value = [];
            return;
        }

        searchTimeout = setTimeout(() => {
            performSearch(newQuery);
        }, 500); // Wait 500ms after user stops typing
    });

    async function performSearch(query = searchQuery.value, page = 1) {
        if (!query.trim()) return;

        isSearching.value = true;
        error.value = null;

        try {
            const results = await searchPhotos(query, page, 12);
            searchResults.value = results.results;
            currentPage.value = page;
            totalPages.value = results.totalPages;
        } catch (err) {
            error.value = 'Failed to search images. Please try again.';
            console.error('Search error:', err);
        } finally {
            isSearching.value = false;
        }
    }

    async function selectPhoto(photo) {
        try {
            // Track download (REQUIRED by Unsplash)
            await trackPhotoDownload(photo.links.download);
            
            // Get attribution info
            const attribution = getPhotoAttribution(photo);
            
            // Store selected photo with attribution
            selectedPhoto.value = {
                ...photo,
                attribution
            };

            console.log('✅ Photo selected:', photo.id);
            return selectedPhoto.value;
        } catch (err) {
            console.error('Error selecting photo:', err);
            throw err;
        }
    }

    function clearSelection() {
        selectedPhoto.value = null;
    }

    function clearSearch() {
        searchQuery.value = '';
        searchResults.value = [];
        currentPage.value = 1;
        totalPages.value = 0;
        error.value = null;
    }

    return {
        // State
        searchQuery,
        searchResults,
        isSearching,
        currentPage,
        totalPages,
        selectedPhoto,
        error,

        // Methods
        performSearch,
        selectPhoto,
        clearSelection,
        clearSearch
    };
}