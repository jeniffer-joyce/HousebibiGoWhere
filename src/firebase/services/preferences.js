// src/firebase/services/preferences.js
import { db } from '../firebase_config.js';
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Get user preferences from Firestore
 * @param {string} userId - User's UID
 * @returns {Promise<Object>} User preferences object
 */
export async function getUserPreferences(userId) {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Check if user has the new preferredCategories field OR old preferences field
      const categories = data.preferredCategories || data.preferences || [];
      const hasSet = data.hasSetPreferences !== undefined 
        ? data.hasSetPreferences 
        : (categories.length > 0); // If they have old preferences, consider it set
      
      return {
        categories: categories,
        hasSetPreferences: hasSet
      };
    }
    
    return {
      categories: [],
      hasSetPreferences: false
    };
  } catch (error) {
    console.error('Error loading user preferences:', error);
    throw error;
  }
}

/**
 * Save user preferences to Firestore
 * @param {string} userId - User's UID
 * @param {Array<string>} categories - Array of category slugs
 * @returns {Promise<void>}
 */
export async function saveUserPreferences(userId, categories) {
  try {
    const docRef = doc(db, "users", userId);
    
    await updateDoc(docRef, {
      preferredCategories: categories,
      hasSetPreferences: true,
      preferencesUpdatedAt: new Date().toISOString()
    });
    
    console.log('✅ Preferences saved successfully');
  } catch (error) {
    console.error('❌ Error saving preferences:', error);
    throw error;
  }
}

/**
 * Mark that user has been prompted (even if they skipped)
 * @param {string} userId - User's UID
 * @returns {Promise<void>}
 */
export async function markPreferencesPrompted(userId) {
  try {
    const docRef = doc(db, "users", userId);
    
    await updateDoc(docRef, {
      hasSetPreferences: true,
      preferencesUpdatedAt: new Date().toISOString()
    });
    
    console.log('✅ User marked as prompted');
  } catch (error) {
    console.error('❌ Error marking user as prompted:', error);
    throw error;
  }
}