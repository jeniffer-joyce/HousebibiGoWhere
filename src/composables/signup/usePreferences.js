// src/composables/signup/usePreferences.js
import { ref, computed, watch } from 'vue';
import { user } from '@/store/user.js';
import { saveUserPreferences, markPreferencesPrompted } from '@/firebase/services/preferences.js';

export function usePreferences(selectedCategories, categories) {
  // Only show prompt if user is logged in AND hasn't set preferences yet
  const showPreferencePrompt = ref(false);
  const selectedPreferences = ref([]);
  const hasSubmittedPreference = ref(false);

  // Watch for user login state and preferences
  watch(
    () => [user.isLoggedIn, user.preferences.hasSetPreferences, user.loading],
    ([isLoggedIn, hasSet, loading]) => {
      if (!loading && isLoggedIn && !hasSet) {
        // First-time user - show prompt
        showPreferencePrompt.value = true;
        selectedPreferences.value = [];
      } else if (!loading && isLoggedIn && hasSet) {
        // Returning user with saved preferences
        showPreferencePrompt.value = false;
        hasSubmittedPreference.value = true;
        
        // Load saved preferences and apply them
        if (user.preferences.categories.length > 0) {
          selectedPreferences.value = [...user.preferences.categories];
          selectedCategories.value = [...user.preferences.categories];
        } else {
          // User has cleared their preferences
          selectedPreferences.value = [];
          selectedCategories.value = [];
        }
      } else if (!isLoggedIn) {
        // Not logged in - hide everything
        showPreferencePrompt.value = false;
        hasSubmittedPreference.value = false;
        selectedPreferences.value = [];
      }
    },
    { immediate: true }
  );

  // Watch for when prompt opens - reload current preferences
  watch(showPreferencePrompt, (isOpen) => {
    if (isOpen && user.isLoggedIn) {
      // When opening prompt, load current saved preferences
      selectedPreferences.value = [...user.preferences.categories];
    }
  });

  function togglePreferenceSelection(slug) {
    const index = selectedPreferences.value.indexOf(slug);
    if (index > -1) {
      selectedPreferences.value.splice(index, 1);
    } else {
      selectedPreferences.value.push(slug);
    }
  }

  function isPreferenceSelected(slug) {
    return selectedPreferences.value.includes(slug);
  }

  async function savePreference() {
    if (!user.isLoggedIn || !user.uid) {
      console.error('User must be logged in to save preferences');
      return;
    }

    try {
      // Allow saving even with empty array (clearing preferences)
      await saveUserPreferences(user.uid, selectedPreferences.value);
      
      // Update local user state
      user.preferences.categories = [...selectedPreferences.value];
      user.preferences.hasSetPreferences = true;
      
      // Apply the selected categories as filters
      selectedCategories.value = [...selectedPreferences.value];
      
      // Update UI state
      hasSubmittedPreference.value = selectedPreferences.value.length > 0;
      showPreferencePrompt.value = false;
      
      console.log('Preferences saved and applied!', selectedPreferences.value);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  }

  async function skipPreference() {
    if (!user.isLoggedIn || !user.uid) {
      console.error('User must be logged in');
      return;
    }

    // If user has already set preferences before, just close the prompt
    if (user.preferences.hasSetPreferences) {
      // Just close without saving - revert to saved preferences
      selectedPreferences.value = [...user.preferences.categories];
      showPreferencePrompt.value = false;
      console.log('Cancelled - reverted to saved preferences');
      return;
    }

    // First-time user clicking skip - mark as prompted
    try {
      await markPreferencesPrompted(user.uid);
      
      // Update local user state
      user.preferences.hasSetPreferences = true;
      user.preferences.categories = []; // Clear any preferences
      
      // Clear selections
      selectedPreferences.value = [];
      selectedCategories.value = [];
      
      // Close prompt
      showPreferencePrompt.value = false;
      hasSubmittedPreference.value = false;
      
      console.log('Preferences prompt skipped');
    } catch (error) {
      console.error('Failed to mark preferences as prompted:', error);
      // Still close the prompt even if save fails
      showPreferencePrompt.value = false;
    }
  }

  return {
    showPreferencePrompt,
    selectedPreferences,
    hasSubmittedPreference,
    togglePreferenceSelection,
    isPreferenceSelected,
    savePreference,
    skipPreference,
  };
}