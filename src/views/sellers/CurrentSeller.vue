<!-- TEST VUE ONLY - NOT USED IN FINALISED PROJECT -->
<template>
  <main class="container mx-auto py-10 px-4 space-y-12">
    <h1 class="text-2xl font-semibold text-center">👤 Current Seller (Auth-linked)</h1>
    <h2 class="text-xl text-center text-gray-500">
      Testing site to ensure seller_info.js and seller_product.js are in sync correctly.
    </h2>
    <p class="text-center">
      This uses the Firestore collections: <code>/users</code>, <code>/businesses</code>, and <code>/products</code>.
    </p>

    <!-- UID always visible -->
    <div class="text-center mt-4">
      <span class="inline-block rounded-md bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm">
        Signed-in UID: <strong>{{ uid || '— (not signed in)' }}</strong>
      </span>
    </div>

    <!-- Loading / Error (non-permission) -->
    <div v-if="loading" class="text-center text-gray-500 mt-6">Loading current user…</div>
    <div v-else-if="fatalError" class="text-center text-red-500 mt-6">Error: {{ fatalError }}</div>

    <!-- Content -->
    <section v-else class="space-y-12">

      <!-- =================== /users/{uid} =================== -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-center text-blue-700">
          User Document (/users/{{ seller?.id || uid }})
        </h3>

        <!-- Permission banner -->
        <div
          v-if="permDenied.users"
          class="max-w-3xl mx-auto mb-4 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 px-4 py-3 text-sm"
        >
          🔒 Permission denied reading <code>/users/{{ uid }}</code>. Showing nothing for this section.
        </div>

        <div v-else>
          <div v-if="seller" class="overflow-x-auto">
            <table class="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200">
              <tbody>
                <tr v-for="(value, key) in seller" :key="key" class="border-b border-gray-200">
                  <td class="px-4 py-2 font-semibold bg-gray-100 dark:bg-gray-700">{{ formatKey(key) }}</td>
                  <td class="px-4 py-2">
                    <template v-if="key === 'licenseFileURL' && value">
                      <a :href="value" target="_blank" class="text-blue-600 hover:underline">View License</a>
                    </template>
                    <template v-else-if="key === 'photoURL' && value">
                      <img :src="value" alt="Photo" class="w-20 h-20 object-cover rounded-full border" />
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
          <p v-else class="text-center text-gray-500">No /users document (or not readable).</p>
        </div>
      </div>

      <!-- =================== /businesses/{uid} =================== -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-center text-green-700">
          Business Document (/businesses/{{ sellerAccount?.id || uid }})
        </h3>

        <!-- Permission banner -->
        <div
          v-if="permDenied.businesses"
          class="max-w-3xl mx-auto mb-4 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 px-4 py-3 text-sm"
        >
          🔒 Permission denied reading <code>/businesses/{{ uid }}</code>. Showing nothing for this section.
        </div>

        <div v-else>
          <div v-if="sellerAccount" class="overflow-x-auto">
            <table class="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200">
              <tbody>
                <!-- Explicit profilePic row -->
                <tr class="border-b border-gray-200">
                  <td class="px-4 py-2 font-semibold bg-gray-100 dark:bg-gray-700">Profile Pic</td>
                  <td class="px-4 py-2">
                    <div class="w-20 h-20 rounded-full overflow-hidden border bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <img
                        :src="sellerAccount.profilePic || '/avatar.png'"
                        alt="Profile Pic"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ sellerAccount.profilePic || '/avatar.png' }}
                    </div>
                  </td>
                </tr>

                <!-- Remaining fields -->
                <tr
                  v-for="(value, key) in sellerAccount"
                  :key="key"
                  class="border-b border-gray-200"
                  v-if="key !== 'profilePic'"
                >
                  <td class="px-4 py-2 font-semibold bg-gray-100 dark:bg-gray-700">{{ formatKey(key) }}</td>
                  <td class="px-4 py-2">
                    <template v-if="value instanceof Date">
                      {{ value.toLocaleString() }}
                    </template>
                    <template v-else-if="Array.isArray(value)">
                      <ul class="list-disc pl-5">
                        <li v-for="(item, idx) in value" :key="idx">{{ item }}</li>
                      </ul>
                    </template>
                    <template v-else>
                      {{ value }}
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-center text-gray-500">No /businesses document (or not readable).</p>
        </div>
      </div>

      <!-- =================== /products (by sellerId) =================== -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-center text-purple-700">
          Products Collection (Filtered by Authenticated Seller)
        </h3>

        <!-- Permission banner -->
        <div
          v-if="permDenied.products"
          class="max-w-3xl mx-auto mb-4 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 px-4 py-3 text-sm"
        >
          🔒 Permission denied reading <code>/products</code> for sellerId={{ uid }}. Showing nothing for this section.
        </div>

        <div v-else>
          <div v-if="products.length" class="overflow-x-auto">
            <table class="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200">
              <thead class="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th class="px-4 py-2 text-left">S/N</th>
                  <th class="px-4 py-2 text-left">Image</th>
                  <th class="px-4 py-2 text-left">Item Name</th>
                  <th class="px-4 py-2 text-left">Category</th>
                  <th class="px-4 py-2 text-left">Price</th>
                  <th class="px-4 py-2 text-left">Quantity</th>
                  <th class="px-4 py-2 text-left">Size</th>
                  <th class="px-4 py-2 text-left">Availability</th>
                  <th class="px-4 py-2 text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in products" :key="product.id" class="border-b border-gray-200">
                  <td class="px-4 py-2">{{ index + 1 }}</td>
                  <td class="px-4 py-2">
                    <div class="w-16 h-16 rounded-md overflow-hidden border bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <template v-if="product.img_url">
                        <a :href="product.img_url" target="_blank" rel="noopener">
                          <img :src="product.img_url" :alt="`Image of ${product.item_name || 'product'}`" class="w-16 h-16 object-cover" />
                        </a>
                      </template>
                      <template v-else>
                        <span class="text-xs text-gray-500 px-2 text-center">No Image</span>
                      </template>
                    </div>
                  </td>
                  <td class="px-4 py-2">{{ product.item_name }}</td>
                  <td class="px-4 py-2">{{ product.category }}</td>
                  <td class="px-4 py-2">
                    <span v-if="Array.isArray(product.price)">
                      {{ product.price.join(', ') }}
                    </span>
                    <span v-else>{{ product.price }}</span>
                  </td>
                  <td class="px-4 py-2">
                    <span v-if="Array.isArray(product.quantity)">
                      {{ product.quantity.join(', ') }}
                    </span>
                    <span v-else>{{ product.quantity }}</span>
                  </td>
                  <td class="px-4 py-2">
                    <span v-if="Array.isArray(product.size)">
                      {{ product.size.join(', ') }}
                    </span>
                    <span v-else>{{ product.size || '—' }}</span>
                  </td>
                  <td class="px-4 py-2">
                    <span :class="product.availability ? 'text-green-600' : 'text-red-600'">
                      {{ product.availability ? 'Available' : 'Unavailable' }}
                    </span>
                  </td>
                  <td class="px-4 py-2">{{ formatDate(product.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-center text-gray-500">No products found for this seller.</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  waitForAuthReady,
  getCurrentUid,
  getCurrentSeller,
  getCurrentSellerAccount,   // now returns /businesses/{uid}
  ensureCurrentSellerAccount // ensures /businesses/{uid} exists & patches defaults
} from "@/firebase/services/sellers/seller_info.js";
import { getSellerProducts } from "@/firebase/services/sellers/seller_product.js";

// state
const loading = ref(true);
const fatalError = ref(null);
const uid = ref(null);

// permission-denied flags (per section)
const permDenied = ref({
  users: false,
  businesses: false,
  products: false
});

// data
const seller = ref(null);         // /users/{uid}
const sellerAccount = ref(null);  // /businesses/{uid}
const products = ref([]);         // /products where sellerId == uid

// helper to detect permission-denied without killing the page
function safeCall(fn, sectionKey) {
  return fn().catch((e) => {
    const msg = String(e?.message || e);
    // very broad match to catch both emulator and prod texts
    if (msg.includes("Missing or insufficient permissions") || msg.includes("PERMISSION_DENIED")) {
      permDenied.value[sectionKey] = true;
      return null; // swallow error for this section
    }
    // other errors: bubble up to show in "fatalError"
    throw e;
  });
}

onMounted(async () => {
  try {
    await waitForAuthReady();
    uid.value = getCurrentUid();

    // /users/{uid}
    seller.value = await safeCall(() => getCurrentSeller(), "users");

    // Ensure /businesses/{uid} (may fail due to rules; that's OK for test)
    await safeCall(() => ensureCurrentSellerAccount(), "businesses");

    // Read /businesses/{uid}
    sellerAccount.value = await safeCall(() => getCurrentSellerAccount(), "businesses");

    // /products for sellerId == uid
    const prods = await safeCall(() => getSellerProducts(), "products");
    if (Array.isArray(prods)) products.value = prods;
  } catch (e) {
    fatalError.value = e?.message || String(e);
  } finally {
    loading.value = false;
  }
});

function formatKey(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}
function formatDate(val) {
  if (!val) return "—";
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleString();
  } catch {
    return val;
  }
}
</script>

<style scoped>
table { border-collapse: collapse; }
td, th { word-break: break-word; }
</style>
