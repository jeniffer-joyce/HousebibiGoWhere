import { db } from '@/firebase/firebase_config.js'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'

export async function getBusinesses() {
  try {
    const querySnapshot = await getDocs(collection(db, "businesses"))
    const businesses = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      // ✅ Handle both 'category' (singular) and 'categories' (plural) fields
      let categoriesArray = []
      if (data.categories && Array.isArray(data.categories)) {
        categoriesArray = data.categories
      } else if (data.category) {
        // If category is a single string, wrap it in an array
        categoriesArray = [data.category]
      }
      
      businesses.push({
        id: doc.id,
        ...data,
        // ✅ Map profilePic to image for template consistency
        image: data.profilePic || data.image || '/placeholder.png',
        // Ensure name field exists
        name: data.name || '',
        // ✅ Normalize categories to always be an array
        categories: categoriesArray,
        // Ensure featured is a boolean
        featured: data.featured || false
      })
    })

    return businesses
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return []
  }
}