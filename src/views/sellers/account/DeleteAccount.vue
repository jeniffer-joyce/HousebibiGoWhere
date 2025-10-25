<!-- src/views/sellers/account/DeleteAccount.vue -->
<template>
  <div>
    <!-- Page header -->
    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Delete Account</h2>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Permanently delete your account and personal data.
    </p>

    <!-- Danger card -->
    <section
      class="mt-6 rounded-2xl border border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 p-6"
    >
      <h3 class="text-xl font-semibold text-rose-700 dark:text-rose-300">Delete Account</h3>

      <!-- Bulleted notes (dot centered with text) -->
      <ul class="mt-3 space-y-2 text-sm">
        <li class="flex items-center gap-3">
          <span class="inline-block h-1.5 w-1.5 rounded-full bg-rose-500 flex-none"></span>
          <span class="text-rose-700/90 dark:text-rose-200/90">
            Deletes your account <span class="font-semibold">forever</span>!
          </span>
        </li>
        <li class="flex items-center gap-3">
          <span class="inline-block h-1.5 w-1.5 rounded-full bg-rose-500 flex-none"></span>
          <span class="text-rose-700/90 dark:text-rose-200/90">
            This action <span class="font-semibold">cannot be undone</span>.
          </span>
        </li>
      </ul>

      <!-- Confirm password -->
      <div class="mt-6">
        <label class="block text-sm font-medium text-rose-800 dark:text-rose-200 mb-2">
          Confirm with your account password
        </label>

        <div class="relative">
          <input
            :type="show ? 'text' : 'password'"
            v-model.trim="password"
            class="w-full h-12 rounded-xl border border-rose-900/30 bg-slate-900/70 text-slate-100
                   dark:bg-slate-900 dark:text-slate-100 px-4 pr-12 text-sm focus:outline-none
                   focus:ring-2 focus:ring-rose-500/40"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          <button
            type="button"
            @click="show = !show"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md
                   text-rose-300 hover:text-rose-200"
            :aria-label="show ? 'Hide password' : 'Show password'"
          >
            <!-- eye icon -->
            <svg v-if="!show" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              <circle cx="12" cy="12" r="3" stroke-width="2" />
            </svg>
            <!-- eye-off icon -->
            <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.03.39-2.003 1.087-2.904M6.18 6.18C7.93 4.83 9.92 4 12 4c5 0 9 4 9 7 0 1.262-.49 2.445-1.343 3.492M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Extra confirmation (checkbox + text aligned) -->
      <div class="mt-4 flex items-center gap-3">
        <input
          id="ack"
          type="checkbox"
          v-model="ack"
          class="h-4 w-4 rounded border-rose-900/40 text-rose-600 focus:ring-rose-500"
        />
        <label for="ack" class="text-sm text-rose-800/90 dark:text-rose-200/90 select-none">
          I understand this will permanently remove my account and all associated data.
        </label>
      </div>

      <!-- Delete button (only enabled when password entered AND checkbox checked) -->
      <div class="mt-6 flex justify-end">
        <button
          type="button"
          :disabled="!canDelete"
          class="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold
                 text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed
                 border border-rose-900/40 shadow-sm"
          :aria-disabled="!canDelete"
        >
          Delete My Account
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const password = ref('')
const show = ref(false)
const ack = ref(false)

/* Design-only gating for the button */
const canDelete = computed(() => password.value.length > 0 && ack.value)
</script>
