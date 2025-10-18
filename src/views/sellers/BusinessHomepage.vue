<template>
  <main class="container mx-auto py-10 px-4">
    <h1 class="text-2xl font-semibold mb-6 text-center">👤 Current Seller (Auth-linked)</h1>

    <!-- Loading / Error -->
    <div v-if="loading" class="text-center text-gray-500">Loading current user…</div>
    <div v-else-if="error" class="text-center text-red-500">Error: {{ error }}</div>

    <!-- Signed out or no doc -->
    <div v-else-if="!seller" class="text-center text-gray-500">
      No signed-in user or user document not found in <code>/users</code>.
    </div>

    <!-- Seller table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200">
        <tbody>
          <tr v-for="(value, key) in seller" :key="key" class="border-b border-gray-200">
            <td class="px-4 py-2 font-semibold bg-gray-100 dark:bg-gray-700">{{ formatKey(key) }}</td>
            <td class="px-4 py-2">
              <template v-if="key === 'licenseFileURL' && value">
                <a :href="value" target="_blank" class="text-blue-600 hover:underline">View License</a>
              </template>
              <template v-else-if="(key === 'logo' || key === 'photoURL') && value">
                <img :src="value" alt="Logo" class="w-20 h-20 object-cover rounded-full border" />
              </template>
              <template v-else-if="value instanceof Date">
                {{ value.toLocaleString() }}
              </template>
              <template v-else>
                {{ value }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="mt-3 text-sm text-gray-500">
        Showing fields from <code>/users/{{ seller.id }}</code>.
      </p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { waitForAuthReady, getCurrentSeller } from "@/firebase/services/sellers/seller_info.js";

// State
const loading = ref(true);
const error = ref(null);
const seller = ref(null);

// Fetch current seller on mount
onMounted(async () => {
  try {
    await waitForAuthReady();
    seller.value = await getCurrentSeller(); // no manual search or refresh needed
  } catch (e) {
    error.value = e?.message || String(e);
  } finally {
    loading.value = false;
  }
});

// Format keys for display
function formatKey(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}
</script>

<style scoped>
table { border-collapse: collapse; }
td { word-break: break-word; }
</style>
