<template>
  <section class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 md:p-8 w-full">
    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Change Password</h2>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Choose a new password for your account.
    </p>

    <!-- Google sign-in notice -->
    <div
      v-if="provider === 'google.com'"
      class="mt-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900
             dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-100">
      <p class="font-medium">Password managed by Google</p>
      <p class="text-sm mt-1">This account uses Google Sign-In, so you can’t change the password here.</p>
    </div>

    <!-- Form -->
    <form v-else class="mt-6 space-y-6" @submit.prevent="onSubmit">
      <!-- Current password (for re-auth) -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Current Password
        </label>
        <div class="relative">
          <input
            :type="show.current ? 'text' : 'password'"
            v-model.trim="currentPassword"
            autocomplete="current-password"
            :disabled="submitting"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 pr-11 text-slate-900 placeholder-slate-400
                   focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100
                   disabled:opacity-60"
            :class="touched.current && !currentPassword ? 'border-red-500' : ''"
          />
          <!-- eye -->
          <button
            type="button"
            @click="show.current = !show.current"
            class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md
                   text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            <svg v-if="!show.current" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.07.21.07.436 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z" />
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M3.98 8.223A10.48 10.48 0 001.934 12C3.29 16.15 7.29 19 12 19c1.64 0 3.19-.33 4.58-.92M6.23 6.23A10.45 10.45 0 0112 5c4.71 0 8.71 2.85 10.07 7-.26.82-.66 1.59-1.18 2.28M3 3l18 18" />
            </svg>
          </button>
        </div>
        <p v-if="touched.current && !currentPassword" class="mt-1 text-xs text-red-600">
          Enter your current password.
        </p>
      </div>

      <!-- New password -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          New Password
        </label>
        <div class="relative">
          <input
            :type="show.new ? 'text' : 'password'"
            v-model.trim="newPassword"
            autocomplete="new-password"
            :disabled="submitting"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 pr-11 text-slate-900 placeholder-slate-400
                   focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100
                   disabled:opacity-60"
            :class="touched.new && !strength.ok ? 'border-red-500' : ''"
          />
          <!-- eye -->
          <button
            type="button"
            @click="show.new = !show.new"
            class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md
                   text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            <svg v-if="!show.new" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.07.21.07.436 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z" />
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M3.98 8.223A10.48 10.48 0 001.934 12C3.29 16.15 7.29 19 12 19c1.64 0 3.19-.33 4.58-.92M6.23 6.23A10.45 10.45 0 0112 5c4.71 0 8.71 2.85 10.07 7-.26.82-.66 1.59-1.18 2.28M3 3l18 18" />
            </svg>
          </button>
        </div>

        <!-- Strength checklist (no number requirement) -->
        <ul class="mt-2 grid grid-cols-2 gap-2 text-xs">
          <li :class="cls(strength.len)">• At least 8 characters</li>
          <li :class="cls(strength.upper)">• One uppercase letter</li>
          <li :class="cls(strength.sym)">• One special character</li>
        </ul>
        <p v-if="touched.new && !strength.ok" class="mt-1 text-xs text-red-600">
          Please choose a stronger password.
        </p>
      </div>

      <!-- Confirm -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Confirm New Password
        </label>
        <div class="relative">
          <input
            :type="show.confirm ? 'text' : 'password'"
            v-model.trim="confirmPassword"
            autocomplete="new-password"
            :disabled="submitting"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 pr-11 text-slate-900 placeholder-slate-400
                   focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100
                   disabled:opacity-60"
            :class="touched.confirm && !matches ? 'border-red-500' : ''"
          />
          <!-- eye -->
          <button
            type="button"
            @click="show.confirm = !show.confirm"
            class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md
                   text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            <svg v-if="!show.confirm" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.07.21.07.436 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z" />
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M3.98 8.223A10.48 10.48 0 001.934 12C3.29 16.15 7.29 19 12 19c1.64 0 3.19-.33 4.58-.92M6.23 6.23A10.45 10.45 0 0112 5c4.71 0 8.71 2.85 10.07 7-.26.82-.66 1.59-1.18 2.28M3 3l18 18" />
            </svg>
          </button>
        </div>
        <p v-if="touched.confirm && !matches" class="mt-1 text-xs text-red-600">
          Passwords do not match.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 pt-2">
        <button
          type="submit"
          :disabled="submitting"
          class="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60">
          {{ submitting ? 'Updating…' : 'Update Password' }}
        </button>
        <p v-if="success" class="text-sm text-emerald-600">{{ success }}</p>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { auth } from '@/firebase/firebase_config'
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'

/* provider check (google.com vs password) */
const provider = ref('password')

/* fields */
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

/* ui */
const show = ref({ current: false, new: false, confirm: false })
const submitting = ref(false)
const success = ref('')
const error = ref('')
const touched = ref({ current: false, new: false, confirm: false })

/* strength rules (no number requirement) */
const strength = computed(() => {
  const v = newPassword.value || ''
  const len = v.length >= 8
  const upper = /[A-Z]/.test(v)
  const sym = /[^A-Za-z0-9]/.test(v)
  return { len, upper, sym, ok: len && upper && sym }
})
const matches = computed(() => (confirmPassword.value || '') === (newPassword.value || ''))

function cls(ok) {
  return ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
}

/* load provider */
onMounted(() => {
  const u = auth.currentUser
  provider.value = u?.providerData?.[0]?.providerId || 'password'
})

async function onSubmit() {
  touched.value = { current: true, new: true, confirm: true }
  success.value = ''
  error.value = ''

  if (!currentPassword.value) {
    error.value = 'Please enter your current password.'
    return
  }
  if (!strength.value.ok) {
    error.value = 'Please choose a stronger password.'
    return
  }
  if (!matches.value) {
    error.value = 'Passwords do not match.'
    return
  }

  try {
    submitting.value = true
    const u = auth.currentUser
    if (!u?.email) throw new Error('auth/missing-user')

    // Inline re-authentication with current password
    const cred = EmailAuthProvider.credential(u.email, currentPassword.value)
    await reauthenticateWithCredential(u, cred)

    // Update password
    await updatePassword(u, newPassword.value)

    // Reset fields
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    touched.value = { current: false, new: false, confirm: false }

    success.value = 'Your password has been updated.'
  } catch (e) {
    console.error(e)
    if (e.code === 'auth/wrong-password') error.value = 'Your current password is incorrect.'
    else if (e.code === 'auth/too-many-requests') error.value = 'Too many attempts. Please try again later.'
    else if (e.code === 'auth/requires-recent-login')
      error.value = 'Please sign in again and retry.'
    else error.value = 'Failed to update password. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
