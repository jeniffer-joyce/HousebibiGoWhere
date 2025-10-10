import { onMounted, ref, computed, watch } from 'vue';
import { getCategories } from '@/firebase/services/home/categories.js';
import { getBusinesses } from '@/firebase/services/home/business.js';

export function useHomeData() {
    const categories = ref([]);
    const businesses = ref([]);
    const loading = ref(true);
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

    return {categories, businesses, loading};

}