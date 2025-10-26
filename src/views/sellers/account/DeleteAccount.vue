<!-- src/views/sellers/account/DeleteAccount.vue -->
<template>
  <div>
    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Delete Account</h2>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Permanently delete your account and all associated data.
    </p>

    <section
      class="mt-6 rounded-2xl border border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 p-6"
    >
      <h3 class="text-xl font-semibold text-rose-700 dark:text-rose-300">Delete Account</h3>

      <ul class="mt-3 space-y-2 text-sm">
        <li class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-rose-500"></span>
          <span class="text-rose-700/90 dark:text-rose-200/90">
            Deletes your account <span class="font-semibold">forever</span>.
          </span>
        </li>
        <li class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-rose-500"></span>
          <span class="text-rose-700/90 dark:text-rose-200/90">
            This action <span class="font-semibold">cannot be undone</span>.
          </span>
        </li>
      </ul>

      <div class="mt-6">
        <label class="block text-sm font-medium text-rose-800 dark:text-rose-200 mb-2">
          Confirm with your account password
        </label>
        <div class="relative">
          <input
            :type="show ? 'text' : 'password'"
            v-model.trim="password"
            placeholder="••••••••"
            class="w-full h-12 rounded-xl border border-rose-900/30 bg-slate-100 dark:bg-slate-800
                   text-slate-900 dark:text-slate-100 px-4 pr-12 text-sm focus:outline-none
                   focus:ring-2 focus:ring-rose-500/40"
          />
          <button
            type="button"
            @click="show = !show"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md
                   text-rose-400 hover:text-rose-300"
          >
            <span v-if="!show" class="material-symbols-outlined text-lg">visibility</span>
            <span v-else class="material-symbols-outlined text-lg">visibility_off</span>
          </button>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-3">
        <input
          id="ack"
          type="checkbox"
          v-model="ack"
          class="mt-1 h-4 w-4 rounded border-rose-900/40 text-rose-600 focus:ring-rose-500"
        />
        <label for="ack" class="text-sm text-rose-800/90 dark:text-rose-200/90">
          I understand this will permanently remove my account and all associated data.
        </label>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          type="button"
          @click="showConfirm = true"
          :disabled="!canDelete"
          class="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold
                 text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed
                 border border-rose-900/40 shadow-sm"
        >
          Delete My Account
        </button>
      </div>
    </section>

    <!-- Confirm Modal -->
    <div v-if="showConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h4 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Are you sure you want to delete your account?
        </h4>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">
          This action cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="showConfirm = false"
            class="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-600
                   hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { deleteSellerAccount } from '@/firebase/services/sellers/seller_crud.js'

const router = useRouter()
const password = ref('')
const ack = ref(false)
const show = ref(false)
const showConfirm = ref(false)

const canDelete = computed(() => password.value.length > 0 && ack.value)

async function handleDelete() {
  try {
    await deleteSellerAccount(password.value)
    alert('Account deleted successfully.')
    router.push('/')
  } catch (err) {
    console.error(err)
    alert('Failed to delete account. Please check your password and try again.')
  } finally {
    showConfirm.value = false
  }
}
</script>
