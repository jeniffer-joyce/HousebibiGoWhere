<!-- src/views/sellers/account/ChangePassword.vue -->
<template>
  <div>
    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Change Password</h2>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Choose a new password for your account.
    </p>

    <div class="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-6">
      <form @submit.prevent class="space-y-6">
        <!-- Current password -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Current Password
          </label>
          <div class="relative">
            <input
              :type="showCurrent ? 'text' : 'password'"
              v-model.trim="form.current"
              class="w-full h-12 rounded-xl border border-slate-300/60 dark:border-slate-700
                     bg-slate-50 dark:bg-slate-900 px-4 pr-12 text-sm focus:outline-none
                     focus:ring-2 focus:ring-cyan-500/30"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              @click="showCurrent = !showCurrent"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md
                     text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              :aria-label="showCurrent ? 'Hide password' : 'Show password'"
            >
              <!-- eye / eye-off -->
              <svg v-if="!showCurrent" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <circle cx="12" cy="12" r="3" stroke-width="2" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.03.39-2.003 1.087-2.904M6.18 6.18C7.93 4.83 9.92 4 12 4c5 0 9 4 9 7 0 1.262-.49 2.445-1.343 3.492M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88" />
              </svg>
            </button>
          </div>
        </div>

        <!-- New password -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            New Password
          </label>
          <div class="relative">
            <input
              :type="showNew ? 'text' : 'password'"
              v-model="form.new"
              class="w-full h-12 rounded-xl border border-slate-300/60 dark:border-slate-700
                     bg-slate-50 dark:bg-slate-900 px-4 pr-12 text-sm focus:outline-none
                     focus:ring-2 focus:ring-cyan-500/30"
              autocomplete="new-password"
              required
            />
            <button
              type="button"
              @click="showNew = !showNew"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md
                     text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              :aria-label="showNew ? 'Hide password' : 'Show password'"
            >
              <svg v-if="!showNew" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <circle cx="12" cy="12" r="3" stroke-width="2" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.03.39-2.003 1.087-2.904M6.18 6.18C7.93 4.83 9.92 4 12 4c5 0 9 4 9 7 0 1.262-.49 2.445-1.343 3.492M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88" />
              </svg>
            </button>
          </div>

          <!-- Requirements -->
          <ul class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <li class="flex items-center gap-2" :class="rules.min ? okClass : dimClass">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path v-if="rules.min" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"/>
                <path v-else fill-rule="evenodd" clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11H9v4h2V7zm0 6H9v2h2v-2z"/>
              </svg>
              <span>At least 8 characters</span>
            </li>
            <li class="flex items-center gap-2" :class="rules.upper ? okClass : dimClass">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path v-if="rules.upper" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"/>
                <path v-else fill-rule="evenodd" clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11H9v4h2V7zm0 6H9v2h2v-2z"/>
              </svg>
              <span>One uppercase letter</span>
            </li>
            <li class="flex items-center gap-2" :class="rules.special ? okClass : dimClass">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path v-if="rules.special" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"/>
                <path v-else fill-rule="evenodd" clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11H9v4h2V7zm0 6H9v2h2v-2z"/>
              </svg>
              <span>One special character</span>
            </li>
          </ul>
        </div>

        <!-- Confirm -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Confirm New Password
          </label>
          <div class="relative">
            <input
              :type="showConfirm ? 'text' : 'password'"
              v-model="form.confirm"
              class="w-full h-12 rounded-xl border border-slate-300/60 dark:border-slate-700
                     bg-slate-50 dark:bg-slate-900 px-4 pr-12 text-sm focus:outline-none
                     focus:ring-2 focus:ring-cyan-500/30"
              autocomplete="new-password"
              required
            />
            <button
              type="button"
              @click="showConfirm = !showConfirm"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md
                     text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              :aria-label="showConfirm ? 'Hide password' : 'Show password'"
            >
              <svg v-if="!showConfirm" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <circle cx="12" cy="12" r="3" stroke-width="2" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.03.39-2.003 1.087-2.904M6.18 6.18C7.93 4.83 9.92 4 12 4c5 0 9 4 9 7 0 1.262-.49 2.445-1.343 3.492M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88" />
              </svg>
            </button>
          </div>
          <p v-if="form.confirm && !rules.match" class="mt-2 text-xs text-rose-500">
            Passwords do not match.
          </p>
        </div>

        <!-- Submit (design only) -->
        <div class="pt-2">
          <button
            type="button"
            :disabled="!canSubmit"
            class="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold
                   text-white bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'

const form = reactive({ current: '', new: '', confirm: '' })
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const rules = computed(() => {
  const v = form.new || ''
  return {
    min: v.length >= 8,
    upper: /[A-Z]/.test(v),
    special: /[^A-Za-z0-9]/.test(v),
    match: form.new !== '' && form.new === form.confirm
  }
})

const canSubmit = computed(() =>
  !!form.current && rules.value.min && rules.value.upper && rules.value.special && rules.value.match
)

const okClass = 'text-emerald-600 dark:text-emerald-400'
const dimClass = 'text-slate-500 dark:text-slate-400'
</script>
