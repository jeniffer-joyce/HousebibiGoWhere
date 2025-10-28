import { ref, watch, computed } from 'vue'
import { db } from '@/firebase/firebase_config.js'
import { collection, getDocs } from 'firebase/firestore'

export function useSearch(searchQuery) {
    const isSearching = ref(false)
    const allBusinesses = ref([])
    const allProducts = ref([])
    
    // Combined search results
    const searchResults = computed(() => {
        if (!searchQuery.value || searchQuery.value.trim().length < 2) {
            return { businesses: [], products: [] }
        }
        
        const q = searchQuery.value.toLowerCase().trim()
        const keywords = q.split(' ').filter(k => k.length > 0)
        
        // Filter businesses
        const matchedBusinesses = allBusinesses.value.filter(business => {
            const searchText = `${business.name || ''} ${business.bio || ''} ${business.description || ''} ${business.category || ''}`.toLowerCase()
            // Check if any keyword matches
            return keywords.some(keyword => searchText.includes(keyword))
        })
        
        // Filter products
        const matchedProducts = allProducts.value.filter(product => {
            const searchText = `${product.item_name || ''} ${product.description || ''} ${product.category || ''} ${product.sellerName || ''}`.toLowerCase()
            // Check if any keyword matches
            return keywords.some(keyword => searchText.includes(keyword))
        })
        
        return {
            businesses: matchedBusinesses,
            products: matchedProducts
        }
    })
    
    // Load all businesses (not just featured)
    async function loadAllBusinesses() {
        try {
            const snapshot = await getDocs(collection(db, 'businesses'))
            allBusinesses.value = snapshot.docs.map(doc => ({
                id: doc.id,
                uid: doc.data().uid || doc.id,
                ...doc.data(),
                image: doc.data().profilePic || doc.data().image || '/placeholder.png'
            }))
            console.log('✅ Loaded all businesses for search:', allBusinesses.value.length)
        } catch (error) {
            console.error('Error loading businesses:', error)
        }
    }
    
    // Load all products
    async function loadAllProducts() {
        try {
            const snapshot = await getDocs(collection(db, 'products'))
            allProducts.value = snapshot.docs.map(doc => {
                const data = doc.data()
                
                // Handle price - could be number or array
                let priceDisplay = '$0'
                if (Array.isArray(data.price) && data.price.length > 0) {
                    const prices = data.price.filter(p => typeof p === 'number')
                    if (prices.length > 0) {
                        const min = Math.min(...prices)
                        const max = Math.max(...prices)
                        priceDisplay = min === max ? `$${min}` : `$${min} - $${max}`
                    }
                } else if (typeof data.price === 'number') {
                    priceDisplay = `$${data.price}`
                }
                
                return {
                    id: doc.id,
                    item_name: data.item_name,
                    category: data.category,
                    description: data.description,
                    price: data.price,
                    priceDisplay,
                    img_url: data.img_url,
                    availability: data.availability,
                    sellerName: data.sellerName || 'Unknown Seller',
                    rating: data.rating || 0,
                    ...data
                }
            })
            console.log('✅ Loaded all products for search:', allProducts.value.length)
        } catch (error) {
            console.error('Error loading products:', error)
        }
    }
    
    // Load data when composable is initialized
    loadAllBusinesses()
    loadAllProducts()
    
    // Watch search query for loading state
    watch(searchQuery, (newVal) => {
        if (newVal && newVal.trim().length >= 2) {
            isSearching.value = true
            setTimeout(() => {
                isSearching.value = false
            }, 300)
        }
    })
    
    return {
        isSearching,
        searchResults
    }
}