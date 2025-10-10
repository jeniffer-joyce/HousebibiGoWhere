import { onMounted, ref, computed } from 'vue';
import { getCategories } from '@/firebase/services/home/categories.js';
import { getBusinesses } from '@/firebase/services/home/business.js';

export function useCategories() {
    const categories = ref([]);
    const businesses = ref([]);
    const loading = ref(true);
    const selectedCategories = ref([]);

    onMounted(async () => {
        try {
            const [cats, biz] = await Promise.all([getCategories(), getBusinesses()])
            categories.value = cats;
            businesses.value = biz;
        } catch (e) {
            console.error(e)
        } finally {
            loading.value = false
        }
    });

    const toggleCategory = (categorySlug) => {
        const index = selectedCategories.value.indexOf(categorySlug);
        if (index === -1) {
            selectedCategories.value.push(categorySlug);
        } else {
            if (selectedCategories.value.length === 1) {
                selectedCategories.value = [];
            } else {
                selectedCategories.value.splice(index, 1);
            }
        }
    };

    const toggleAll = () => {
        selectedCategories.value = [];
    };

    const isAllSelected = computed(() => {
        return selectedCategories.value.length === 0;
    });

    const isCategorySelected = (categorySlug) => {
        return selectedCategories.value.includes(categorySlug);
    };

    const filteredBusinesses = computed(() => {
        if (selectedCategories.value.length === 0) return businesses.value

        const result = businesses.value.filter(b => selectedCategories.value.includes(b.category));

        return result.sort((a, b) => {
            const aIndex = selectedCategories.value.indexOf(a.category);
            const bIndex = selectedCategories.value.indexOf(b.category);
            return aIndex - bIndex;
        });
    });

    return {
        loading,
        categories,
        businesses,
        selectedCategories,
        toggleCategory,
        toggleAll,
        isAllSelected,
        isCategorySelected,
        filteredBusinesses
    };
}