import { ref, computed, onMounted } from 'vue'
import { getCategories } from '@/firebase/services/home/categories.js'
import { getBusinesses } from '@/firebase/services/home/business.js'
import { user } from '@/store/user.js'

export function useCategories() {
    const loading = ref(true)
    const categories = ref([])
    const businesses = ref([])
    const selectedCategories = ref([])

    // Fetch data on mount
    onMounted(async () => {
        try {
            const [categoriesData, businessesData] = await Promise.all([
                getCategories(),
                getBusinesses()
            ])

            categories.value = categoriesData
            businesses.value = businessesData

            // Initialize selected categories from user preferences
            if (user.isLoggedIn && user.preferences.categories.length > 0) {
                selectedCategories.value = [...user.preferences.categories]
            }
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            loading.value = false
        }
    })

    // Toggle individual category
    function toggleCategory(slug) {
        const index = selectedCategories.value.indexOf(slug)
        if (index > -1) {
            selectedCategories.value.splice(index, 1)
        } else {
            selectedCategories.value.push(slug)
        }
    }

    // Toggle all categories
    function toggleAll() {
        if (isAllSelected.value) {
            selectedCategories.value = []
        } else {
            selectedCategories.value = categories.value.map(c => c.slug)
        }
    }

    // Check if all categories are selected
    const isAllSelected = computed(() => {
        return selectedCategories.value.length === 0 || 
               selectedCategories.value.length === categories.value.length
    })

    // Check if a specific category is selected
    function isCategorySelected(slug) {
        return selectedCategories.value.includes(slug)
    }

    // Filter businesses based on selected categories
    const filteredBusinesses = computed(() => {
        // ✅ ALWAYS show only featured businesses in the "Featured Businesses" section
        // This section is specifically for featured businesses only
        
        // If no categories selected or all selected, show featured businesses
        if (selectedCategories.value.length === 0 || isAllSelected.value) {
            return businesses.value.filter(b => b.featured === true)
        }

        // ✅ When filtering by specific categories, STILL only show featured businesses
        // This ensures non-featured businesses don't appear in the "Featured Businesses" section
        return businesses.value.filter(business => {
            // Must be featured
            if (business.featured !== true) {
                return false
            }
            
            // Must have categories
            if (!business.categories || business.categories.length === 0) {
                return false
            }
            
            // Check if business category matches any selected category (by slug OR name)
            return business.categories.some(businessCategory => {
                return selectedCategories.value.some(selectedSlug => {
                    const categoryObj = categories.value.find(c => c.slug === selectedSlug)
                    if (!categoryObj) return false
                    
                    // Match by slug (e.g., "home-decor") or by name (e.g., "Home Decor")
                    return businessCategory === categoryObj.slug || 
                           businessCategory === categoryObj.name ||
                           businessCategory.toLowerCase() === categoryObj.name.toLowerCase()
                })
            })
        })
    })

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
    }
}