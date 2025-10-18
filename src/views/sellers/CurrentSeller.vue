<!-- TEST VUE ONLY - NOT USED IN FINALISED PROJECT -->
<template>
  <main class="container mx-auto py-10 px-4 space-y-12">
    <h1 class="text-2xl font-semibold text-center">👤 Current Seller (Auth-linked)</h1>
    <h2 class="text-xl text-center text-gray-500">Testing site to ensure seller_info.js and seller_account sync works</h2>

    <!-- Loading / Error -->
    <div v-if="loading" class="text-center text-gray-500">Loading current user…</div>
    <div v-else-if="error" class="text-center text-red-500">Error: {{ error }}</div>

    <!-- Signed out or no doc -->
    <div v-else-if="!seller" class="text-center text-gray-500">
      No signed-in user or user document not found in <code>/users</code>.
    </div>

    <!-- Seller / Users Table -->
    <section v-else>
      <h3 class="text-lg font-semibold mb-3 text-center text-blue-700">User Document (/users/{{ seller.id }})</h3>
      <div class="overflow-x-auto mb-10">
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
      </div>

      <!-- Seller Account Table -->
      <h3 class="text-lg font-semibold mb-3 text-center text-green-700">Seller Account Document (/seller_account/{{ sellerAccount?.id }})</h3>
      <div v-if="sellerAccount" class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200">
          <tbody>
            <tr v-for="(value, key) in sellerAccount" :key="key" class="border-b border-gray-200">
              <td class="px-4 py-2 font-semibold bg-gray-100 dark:bg-gray-700">{{ formatKey(key) }}</td>
              <td class="px-4 py-2">
                <template v-if="key === 'logo' && value">
                  <img :src="value" alt="Logo" class="w-20 h-20 object-cover rounded-full border" />
                </template>
                <template v-else-if="Array.isArray(value)">
                  <ul class="list-disc pl-5">
                    <li v-for="(item, idx) in value" :key="idx">{{ item }}</li>
                  </ul>
                </template>
                <template v-else>{{ value }}</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center text-gray-500">
        No seller_account document found or could not be created.
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { waitForAuthReady, getCurrentSeller, getCurrentSellerAccount } from "@/firebase/services/sellers/seller_info.js";

const loading = ref(true);
const error = ref(null);
const seller = ref(null);
const sellerAccount = ref(null);

onMounted(async () => {
  try {
    await waitForAuthReady();
    seller.value = await getCurrentSeller();
    sellerAccount.value = await getCurrentSellerAccount();
  } catch (e) {
    error.value = e?.message || String(e);
  } finally {
    loading.value = false;
  }
});

function formatKey(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}
</script>

<style scoped>
table {
  border-collapse: collapse;
}
td {
  word-break: break-word;
}
</style>
