import { ref, watch } from 'vue';

export function useSearch(searchQuery, businesses, selectedCategories) {

    const isSearching = ref(false);
    const searchSuggestions = ref([]);
    const showSuggestions = ref(false);

    // Debounced search with Gemini for suggestions
    let searchTimeout;
    watch(searchQuery, (newQuery) => {
        clearTimeout(searchTimeout);

        if (!newQuery.trim()) {
            searchSuggestions.value = [];
            showSuggestions.value = false;
            return;
        }

        isSearching.value = true;
        showSuggestions.value = true;

        searchTimeout = setTimeout(async () => {
            try {
                searchSuggestions.value = await search(newQuery, businesses.value);
            } catch (error) {
                console.error('Search error:', error);
                // Fallback to simple search
                searchSuggestions.value = businesses.value.filter(b =>
                    b.name.toLowerCase().includes(newQuery.toLowerCase()) ||
                    b.description?.toLowerCase().includes(newQuery.toLowerCase())
                );
            } finally {
                isSearching.value = false;
            }
        }, 500);
    });

    // Select a suggestion
    const selectSuggestion = (business) => {
        searchQuery.value = '';
        showSuggestions.value = false;
        searchSuggestions.value = [];

        // Find and select the category of this business
        if (business.category) {
            selectedCategories.value = [business.category];

            // Scroll to the business card
            setTimeout(() => {
                const element = document.querySelector(`[data-business="${business.name}"]`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    };
    return {
        isSearching,
        searchSuggestions,
        showSuggestions,
        selectSuggestion

    }

}
export async function search(query, businesses) {
    // Smart keyword search (no AI needed)
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(' ');

    return businesses.filter(business => {
        const searchText = `${business.name} ${business.description || ''} ${business.category || ''}`.toLowerCase();

        // Check if any keyword matches
        return keywords.some(keyword => searchText.includes(keyword));
    });
}
