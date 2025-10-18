<template>
  <main class="mx-auto w-full max-w-2xl p-6 sm:p-8">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Change Email</h1>
    <p class="mt-2 text-slate-600 dark:text-slate-400">
      Enter your new email. We’ll send a confirmation link to verify the change.
    </p>

    <!-- Google account notice -->
    <div
      v-if="isGoogle"
      class="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900
             dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-100"
    >
      This account is signed in with Google. Please update your email in your Google Account, then
      sign out and sign in again.
    </div>

    <form @submit.prevent="sendLink" class="mt-6 space-y-5">
      <!-- New email -->
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          New Email
        </label>
        <input
          v-model.trim="newEmail"
          type="email"
          :disabled="sending || isGoogle"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400
                 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          :placeholder="currentEmail || 'name@example.com'"
        />
        <p v-if="sameEmail && !isGoogle" class="mt-1 text-sm text-red-600">
          That’s already your current email ({{ currentEmail }}).
        </p>
      </div>

      <!-- Password (email/password users only) -->
      <div v-if="!isGoogle">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Current Password
        </label>

        <div class="relative">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            :disabled="sending"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 pr-11 text-slate-900 placeholder-slate-400
                   focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            placeholder="••••••••"
          />

          <!-- Signup-style eye button -->
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center
                   h-8 w-8 rounded-md text-slate-500 hover:bg-slate-100 focus:outline-none
                   dark:text-slate-300 dark:hover:bg-slate-800"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <!-- eye / eye-off -->
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.07.21.07.436 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z"/>
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.29 16.15 7.29 19 12 19c1.64 0 3.19-.33 4.58-.92M6.23 6.23A10.45 10.45 0 0 1 12 5c4.71 0 8.71 2.85 10.07 7-.26.82-.66 1.59-1.18 2.28M3 3l18 18"/>
            </svg>
          </button>
        </div>

        <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button
          type="submit"
          :disabled="sending || isGoogle || sameEmail"
          class="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {{ sending ? 'Sending…' : 'Send Confirmation' }}
        </button>
        <RouterLink
          to="/buyer-account/profile"
          class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50
                 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </RouterLink>
      </div>

      <!-- Messages -->
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div v-if="success" class="text-sm text-emerald-600">
        {{ success }}
        <span v-if="countdown > 0" class="font-semibold">Redirecting in {{ countdown }}…</span>
      </div>
    </form>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase/firebase_config'
import {
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'

const router = useRouter()

const newEmail = ref('')
const currentEmail = ref('')
const password = ref('')
const showPassword = ref(false)

const sending = ref(false)
const error = ref('')
const success = ref('')
const passwordError = ref('')
const countdown = ref(0)
let timer = null

const isGoogle = ref(false)
const sameEmail = computed(() =>
  newEmail.value.trim().toLowerCase() === (currentEmail.value || '').toLowerCase()
)

onMounted(() => {
  const u = auth.currentUser
  if (!u) {
    router.push('/login/')
    return
  }
  currentEmail.value = u.email || ''
  isGoogle.value = (u.providerData?.[0]?.providerId || 'password') === 'google.com'
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function startCountdown() {
  countdown.value = 3
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(timer)
      router.push({ path: '/buyer-account/profile', query: { emailChangeSent: '1' } })
    }
  }, 1000)
}

function validEmail(e) {
  return /\S+@\S+\.\S+/.test(e)
}

async function sendLink() {
  error.value = ''
  passwordError.value = ''
  success.value = ''

  const u = auth.currentUser
  if (!u) {
    error.value = 'You are not signed in.'
    return
  }

  if (!validEmail(newEmail.value)) {
    error.value = 'Please enter a valid email address.'
    return
  }

  if (sameEmail.value) {
    error.value = 'That’s already your current email.'
    return
  }

  try {
    sending.value = true

    // Re-authenticate for password users
    if (!isGoogle.value) {
      if (!password.value) {
        passwordError.value = 'Please enter your current password.'
        sending.value = false
        return
      }
      const cred = EmailAuthProvider.credential(u.email || '', password.value)
      await reauthenticateWithCredential(u, cred)
    }

    // IMPORTANT: send verification to NEW email and return to confirm route
    const continueUrl = `${window.location.origin}/buyer-account/email-change-done`

    await verifyBeforeUpdateEmail(auth.currentUser, newEmail.value, {
    url: continueUrl,
    handleCodeInApp: false, // since we're using the hosted handler
    })

    success.value =
      'Confirmation link sent to your new email. Please check your inbox and follow the instructions.'
    startCountdown()
  } catch (e) {
    console.error(e)
    if (e.code === 'auth/requires-recent-login') {
      error.value = 'Please sign in again and try sending the confirmation link.'
    } else if (e.code === 'auth/invalid-email') {
      error.value = 'That email address looks invalid.'
    } else if (e.code === 'auth/wrong-password') {
      passwordError.value = 'The password you entered is incorrect.'
    } else {
      error.value = 'Could not send the confirmation email.'
    }
  } finally {
    sending.value = false
  }
}
</script>
