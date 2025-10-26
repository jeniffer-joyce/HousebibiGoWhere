<!-- src/views/sellers/account/ChangePassword.vue -->
<template>
  <div>
    <!-- Page heading -->
    <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Change Password</h2>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Choose a new password for your account.</p>

    <!-- Card / container -->
    <section
      class="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-6"
    >
      <!-- Current password -->
      <div class="mb-8">
        <label class="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
        <div class="relative">
          <input
            :type="show.current ? 'text' : 'password'"
            v-model.trim="currentPassword"
            autocomplete="current-password"
            class="w-full h-14 rounded-xl border border-slate-200/60 dark:border-slate-700
                   bg-slate-100 dark:bg-slate-900 px-4 pr-12 text-base text-slate-900 dark:text-slate-100
                   focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="••••••••"
          />
          <button
            type="button"
            @click="show.current = !show.current"
            class="absolute inset-y-0 right-4 flex items-center text-slate-500 dark:text-slate-400"
            aria-label="Toggle current password visibility"
          >
            <svg v-if="!show.current" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z"/>
              <circle cx="12" cy="12" r="3" stroke-width="2"/>
            </svg>
            <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.03.39-2.003 1.087-2.904
                   M6.18 6.18C7.93 4.83 9.92 4 12 4c5 0 9 4 9 7 0 1.262-.49 2.445-1.343 3.492
                   M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- New password -->
      <div class="mb-8">
        <label class="block text-sm font-medium text-slate-400 mb-2">New Password</label>
        <div class="relative">
          <input
            :type="show.new ? 'text' : 'password'"
            v-model.trim="newPassword"
            autocomplete="new-password"
            class="w-full h-14 rounded-xl border border-slate-200/60 dark:border-slate-700
                   bg-slate-100 dark:bg-slate-900 px-4 pr-12 text-base text-slate-900 dark:text-slate-100
                   focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="At least 8 characters"
          />
          <button
            type="button"
            @click="show.new = !show.new"
            class="absolute inset-y-0 right-4 flex items-center text-slate-500 dark:text-slate-400"
            aria-label="Toggle new password visibility"
          >
            <svg v-if="!show.new" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7
                   c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z"/>
              <circle cx="12" cy="12" r="3" stroke-width="2"/>
            </svg>
            <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19
                   c-5 0-9-4-9-7 0-1.03.39-2.003 1.087-2.904
                   M6.18 6.18C7.93 4.83 9.92 4 12 4
                   c5 0 9 4 9 7 0 1.262-.49 2.445-1.343 3.492
                   M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88"/>
            </svg>
          </button>
        </div>

        <!-- Requirements -->
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-10 text-[13px]">
          <div class="flex items-center gap-2">
            <span :class="dot(valid.minLen)" class="inline-flex h-4 w-4 items-center justify-center rounded-full">
              <span class="block h-1 w-1 rounded-full bg-current"></span>
            </span>
            <span :class="text(valid.minLen)">At least 8 characters</span>
          </div>
          <div class="flex items-center gap-2">
            <span :class="dot(valid.upper)" class="inline-flex h-4 w-4 items-center justify-center rounded-full">
              <span class="block h-1 w-1 rounded-full bg-current"></span>
            </span>
            <span :class="text(valid.upper)">One uppercase letter</span>
          </div>
          <div class="flex items-center gap-2">
            <span :class="dot(valid.special)" class="inline-flex h-4 w-4 items-center justify-center rounded-full">
              <span class="block h-1 w-1 rounded-full bg-current"></span>
            </span>
            <span :class="text(valid.special)">One special character</span>
          </div>
        </div>
      </div>

      <!-- Confirm password -->
      <div class="mb-8">
        <label class="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
        <div class="relative">
          <input
            :type="show.confirm ? 'text' : 'password'"
            v-model.trim="confirmPassword"
            autocomplete="new-password"
            class="w-full h-14 rounded-xl border border-slate-200/60 dark:border-slate-700
                   bg-slate-100 dark:bg-slate-900 px-4 pr-12 text-base text-slate-900 dark:text-slate-100
                   focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Re-enter new password"
          />
          <button
            type="button"
            @click="show.confirm = !show.confirm"
            class="absolute inset-y-0 right-4 flex items-center text-slate-500 dark:text-slate-400"
            aria-label="Toggle confirm password visibility"
          >
            <svg v-if="!show.confirm" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7
                   c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z"/>
              <circle cx="12" cy="12" r="3" stroke-width="2"/>
            </svg>
            <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19
                   c-5 0-9-4-9-7 0-1.03.39-2.003 1.087-2.904
                   M6.18 6.18C7.93 4.83 9.92 4 12 4
                   c5 0 9 4 9 7 0 1.262-.49 2.445-1.343 3.492
                   M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88"/>
            </svg>
          </button>
        </div>

        <p v-if="confirmPassword && !valid.match" class="mt-2 text-sm text-rose-500">
          Passwords do not match.
        </p>
      </div>

      <!-- CTA triggers confirmation modal -->
      <button
        type="button"
        :disabled="!canSubmit || loading"
        @click="openConfirm()"
        class="inline-flex items-center justify-center h-12 px-6 rounded-xl text-base font-bold
               text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Update Password
      </button>
    </section>

    <!-- Confirmation modal -->
    <div
      v-if="confirmOpen"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/60"></div>
      <div
        class="absolute inset-0 flex items-center justify-center p-4"
      >
        <div class="w-full max-w-md rounded-2xl border bg-background-light dark:bg-background-dark
                    border-slate-200 dark:border-slate-700 p-6 shadow-xl">
          <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Are you sure you want to change your password?
          </h4>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            You will use this new password the next time you sign in.
          </p>

          <div class="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              class="h-10 px-4 rounded-lg text-sm font-semibold border border-slate-300/60 dark:border-slate-700
                     hover:bg-slate-100 dark:hover:bg-slate-800"
              @click="confirmOpen = false"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="loading"
              class="h-10 px-4 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90
                     disabled:opacity-50"
              @click="submit()"
            >
              {{ loading ? 'Updating…' : 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed top-4 right-4 z-[60] rounded-lg px-4 py-3 shadow-lg border"
      :class="toast.kind === 'success'
        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-emerald-300/60 dark:border-emerald-700'
        : 'bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-200 border-rose-300/60 dark:border-rose-700'"
      role="status"
    >
      <div class="flex items-center gap-2">
        <svg v-if="toast.kind === 'success'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v4m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
        </svg>
        <span class="text-sm font-medium">{{ toast.msg }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { changePassword } from '@/firebase/services/sellers/seller_crud.js'

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const show = ref({ current: false, new: false, confirm: false })

/* Only the three requested rules */
const valid = computed(() => {
  const pw = newPassword.value || ''
  return {
    minLen: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
    match: pw.length > 0 && pw === (confirmPassword.value || '')
  }
})

const canSubmit = computed(() =>
  currentPassword.value &&
  valid.value.minLen &&
  valid.value.upper &&
  valid.value.special &&
  valid.value.match
)

/* UI helpers for requirement dots/text */
function dot(ok) {
  return ok ? 'text-emerald-500' : 'text-slate-400'
}
function text(ok) {
  return ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
}

/* Modal */
const confirmOpen = ref(false)
function openConfirm () {
  if (!canSubmit.value || loading.value) return
  confirmOpen.value = true
}

/* Toast */
const toast = ref({ show: false, msg: '', kind: 'success' })
let t; function showToast(kind, msg) {
  clearTimeout(t)
  toast.value = { show: true, kind, msg }
  t = setTimeout(() => (toast.value.show = false), 2600)
}

/* Submit after modal confirm */
async function submit() {
  if (!canSubmit.value || loading.value) return
  loading.value = true
  try {
    await changePassword(currentPassword.value, newPassword.value)
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    confirmOpen.value = false
    showToast('success', 'Password changed successfully.')
  } catch (err) {
    confirmOpen.value = false
    const msg = String(err?.message || '')
    if (/wrong-password|invalid-credential/i.test(msg)) {
      showToast('error', 'Current password is incorrect.')
    } else if (/requires-recent-login|recent/i.test(msg)) {
      showToast('error', 'Please log in again and try again.')
    } else {
      showToast('error', 'Unable to change password right now.')
    }
  } finally {
    loading.value = false
  }
}
</script>
