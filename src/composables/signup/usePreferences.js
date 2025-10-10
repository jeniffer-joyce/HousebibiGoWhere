import { ref } from 'vue';

export function usePreferences(selectedCategories, categories) {
    const showPreferencePrompt = ref(true);
    const selectedPreferences = ref([]);
    const hasSubmittedPreference = ref(false);

    const togglePreferenceSelection = (value) => {
        const index = selectedPreferences.value.indexOf(value);
        if (index === -1) {
            selectedPreferences.value.push(value);
        } else {
            selectedPreferences.value.splice(index, 1);
        }
    };

    const isPreferenceSelected = (value) => {
        return selectedPreferences.value.includes(value);
    };

    const savePreference = () => {
        if (selectedPreferences.value.length > 0) {
            selectedCategories.value = categories.value
                .filter(cat => {
                    return selectedPreferences.value.some(pref => {
                        const prefLower = pref.toLowerCase();
                        const catNameLower = cat.name.toLowerCase();
                        const catSlugLower = cat.slug.toLowerCase();
                        return catNameLower.includes(prefLower) ||
                            catSlugLower.includes(prefLower) ||
                            prefLower.includes(catNameLower.split(' ')[0].toLowerCase());
                    });
                })
                .map(cat => cat.slug);

            hasSubmittedPreference.value = true;
            showPreferencePrompt.value = false;
        }
    };

    const skipPreference = () => {
        selectedCategories.value = [];
        hasSubmittedPreference.value = false;
        showPreferencePrompt.value = false;
    };

    return {
        showPreferencePrompt,
        selectedPreferences,
        hasSubmittedPreference,
        togglePreferenceSelection,
        isPreferenceSelected,
        savePreference,
        skipPreference
    };
}
