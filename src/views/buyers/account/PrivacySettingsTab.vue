<template>
  <section class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm max-w-3xl">
    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Privacy Settings</h2>
    <p class="mt-1 text-slate-600 dark:text-slate-400">
      Permanently delete your account and personal data.
    </p>

    <div class="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/40 dark:bg-red-900/10">
      <h3 class="text-lg font-semibold text-red-700 dark:text-red-200">Delete Account</h3>
      <ul class="mt-2 list-disc pl-5 text-sm text-red-700 dark:text-red-200 space-y-1">
        <li>Deletes your account from Authentication.</li>
        <li>Removes your document under <code>users/{uid}</code>.</li>
        <li>This cannot be undone.</li>
      </ul>

      <!-- GOOGLE USERS: confirm + popup reauth -->
      <div v-if="isGoogle" class="mt-5">
        <label class="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">
          Type <span class="font-semibold">DELETE</span> to enable the button
        </label>
        <input
          v-model.trim="confirmDelete"
          placeholder="DELETE"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
        <div class="mt-4 flex items-center gap-3">
          <button
            @click="deleteAccount"
            :disabled="working || confirmDelete.toUpperCase() !== 'DELETE'"
            class="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {{ working ? 'Deleting…' : 'Delete My Account' }}
          </button>
          <p v-if="error" class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
          <p v-if="success" class="text-sm text-emerald-600">{{ success }}</p>
        </div>
      </div>

      <!-- PASSWORD USERS: require password -->
      <div v-else class="mt-5">
        <label class="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">
          Confirm with your account password
        </label>
        <div class="relative">
          <input
            :type="showPwd ? 'text' : 'password'"
            v-model="password"
            placeholder="••••••••"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 pr-11 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            @click="showPwd = !showPwd"
            class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            :aria-label="showPwd ? 'Hide password' : 'Show password'"
          >
            <svg v-if="!showPwd" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.07.21.07.436 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.29 16.15 7.29 19 12 19c1.64 0 3.19-.33 4.58-.92M6.23 6.23A10.45 10.45 0 0112 5c4.71 0 8.71 2.85 10.07 7-.26.82-.66 1.59-1.18 2.28M3 3l18 18"/>
            </svg>
          </button>
        </div>

        <div class="mt-4 flex items-center gap-3">
          <button
            @click="deleteAccount"
            :disabled="working || !password"
            class="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {{ working ? 'Deleting…' : 'Delete My Account' }}
          </button>
          <p v-if="error" class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
          <p v-if="success" class="text-sm text-emerald-600">{{ success }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/firebase/firebase_config'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  deleteUser,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'
import { doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'

const router = useRouter()

const isGoogle = ref(false)
const password = ref('')
const confirmDelete = ref('')
const showPwd = ref(false)
const working = ref(false)
const error = ref('')
const success = ref('')

onMounted(() => {
  const u = auth.currentUser
  const providerId = u?.providerData?.[0]?.providerId || 'password'
  isGoogle.value = providerId === 'google.com'
})

async function reauthIfNeeded() {
  const u = auth.currentUser
  if (!u) throw new Error('not-signed-in')

  if (isGoogle.value) {
    // confirm text is checked at button level
    const provider = new GoogleAuthProvider()
    await reauthenticateWithPopup(u, provider) // ensures "recent login" for deleteUser
  } else {
    if (!password.value) throw new Error('missing-password')
    const cred = EmailAuthProvider.credential(u.email || '', password.value)
    await reauthenticateWithCredential(u, cred)
  }
}

async function deleteAccount() {
  error.value = ''
  success.value = ''
  const u = auth.currentUser
  if (!u) {
    error.value = 'You are not signed in.'
    return
  }

  try {
    working.value = true

    // Ensure recent login before dangerous ops
    await reauthIfNeeded()

    // 1) Remove Firestore user doc
    await deleteDoc(doc(db, 'users', u.uid))

    // 2) Delete Auth account
    await deleteUser(u)

    // 3) Sign out locally (safety) and redirect
    await signOut(auth).catch(() => {})
    success.value = 'Account deleted. Redirecting…'
    setTimeout(() => router.push('/login/?deleted=1'), 1200)
  } catch (e) {
    console.error(e)
    if (e.code === 'auth/requires-recent-login') {
      error.value = 'Please re-authenticate and try again.'
    } else if (e.code === 'auth/wrong-password') {
      error.value = 'Incorrect password.'
    } else if (e.code === 'permission-denied') {
      // This would occur only if your rules blocked delete; your rules already allow it.
      error.value = 'Missing or insufficient permissions.'
    } else {
      error.value = 'Failed to delete account. Please try again.'
    }
  } finally {
    working.value = false
  }
}
</script>
