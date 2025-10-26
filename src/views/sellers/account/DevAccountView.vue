<!-- src/views/sellers/DevAccountView.vue -->
<template>
  <main class="flex-grow">
    <div class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Dev Account Viewer</h1>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="h-9 px-3 rounded-lg text-sm font-semibold border border-slate-300/50 dark:border-slate-700
                   hover:bg-slate-100 dark:hover:bg-slate-800"
            @click="refresh"
          >
            Refresh
          </button>
        </div>
      </div>

      <!-- Status -->
      <div v-if="loading" class="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <p class="text-sm text-slate-600 dark:text-slate-400">Loading…</p>
      </div>
      <div v-else-if="error" class="rounded-lg border border-rose-300/50 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-900/10 p-4">
        <p class="text-sm text-rose-700 dark:text-rose-200 font-semibold">Error</p>
        <p class="text-sm text-rose-600 dark:text-rose-300 mt-1">{{ error }}</p>
      </div>

      <div v-else class="space-y-8">
        <!-- Summary / Auth -->
        <section class="rounded-xl border border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark p-5">
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">Auth Summary</h2>
          <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span class="text-slate-500 dark:text-slate-400">UID:</span> <span class="font-mono">{{ uid || '—' }}</span></div>
            <div><span class="text-slate-500 dark:text-slate-400">Email (user doc):</span> <span>{{ user?.email ?? '—' }}</span></div>
          </div>
        </section>

        <!-- Users doc -->
        <section class="rounded-xl border border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark p-5">
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">users/{{ uid }}</h2>

          <div v-if="!user" class="mt-3 text-sm text-slate-500 dark:text-slate-400">No user doc found.</div>

          <div v-else class="overflow-x-auto mt-4">
            <table class="min-w-full text-sm">
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                <tr v-for="(val, key) in user" :key="'u-'+key">
                  <th class="text-left py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400 align-top">{{ key }}</th>
                  <td class="py-2 text-slate-900 dark:text-slate-100">
                    <span v-if="isPrimitive(val)">{{ val }}</span>
                    <pre v-else class="text-xs whitespace-pre-wrap">{{ pretty(val) }}</pre>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Businesses doc -->
        <section class="rounded-xl border border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark p-5">
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">businesses/{{ uid }}</h2>

          <div v-if="!business" class="mt-3 text-sm text-slate-500 dark:text-slate-400">No business doc found.</div>

          <div v-else class="overflow-x-auto mt-4">
            <table class="min-w-full text-sm">
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                <tr v-for="(val, key) in business" :key="'b-'+key">
                  <th class="text-left py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400 align-top">{{ key }}</th>
                  <td class="py-2 text-slate-900 dark:text-slate-100">
                    <span v-if="isPrimitive(val)">{{ val }}</span>
                    <pre v-else class="text-xs whitespace-pre-wrap">{{ pretty(val) }}</pre>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Composite view -->
        <section class="rounded-xl border border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark p-5">
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">Composite (merged)</h2>

          <div class="overflow-x-auto mt-4">
            <table class="min-w-full text-sm">
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                <tr v-for="(val, key) in composite" :key="'c-'+key">
                  <th class="text-left py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400 align-top">{{ key }}</th>
                  <td class="py-2 text-slate-900 dark:text-slate-100">
                    <span v-if="isPrimitive(val)">{{ val }}</span>
                    <pre v-else class="text-xs whitespace-pre-wrap">{{ pretty(val) }}</pre>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { fetchSellerComposite, authReady } from "@/firebase/services/sellers/seller_crud.js"; // adjust relative path if needed

const loading = ref(true);
const error = ref("");
const uid = ref(null);
const user = ref(null);
const business = ref(null);
const composite = ref({});

function isPrimitive(v) {
  return v === null || ["string", "number", "boolean"].includes(typeof v);
}
function pretty(v) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    await authReady();
    const res = await fetchSellerComposite();
    uid.value = res.uid || null;
    user.value = res.user;
    business.value = res.business;
    composite.value = res.composite || {};
  } catch (e) {
    error.value = e?.message || String(e);
  } finally {
    loading.value = false;
  }
}

function refresh() {
  load();
}

onMounted(load);
</script>
