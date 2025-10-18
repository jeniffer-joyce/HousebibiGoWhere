<template>
  <section class="space-y-6">
    <!-- Outer white container -->
    <div
      class="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800 dark:text-slate-100 w-full"
    >
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
        Privacy Settings
      </h2>
      <p class="mt-1 text-slate-600 dark:text-slate-400">
        Permanently delete your account and personal data.
      </p>

      <!-- Red delete card -->
      <div
        class="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm
               dark:border-red-900/40 dark:bg-red-900/15"
      >
        <h3 class="text-xl font-semibold text-red-800 dark:text-red-300">
          Delete Account
        </h3>
        <ul class="mt-2 list-disc pl-5 text-sm text-red-700 dark:text-red-200 space-y-1">
          <li>Deletes your account forever!</li>
          <li>This cannot be undone!</li>
        </ul>

        <!-- Google notice -->
        <div
          v-if="isGoogle"
          class="mt-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900
                 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-100"
        >
          You signed in with Google. To confirm deletion, type
          <span class="font-semibold">DELETE</span> below.
        </div>

        <!-- Form -->
        <div class="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
          <div class="space-y-1">
            <label class="block text-sm font-medium text-red-800 dark:text-red-200">
              {{ isGoogle ? 'Type “DELETE” to confirm' : 'Confirm with your account password' }}
            </label>

            <div class="relative">
              <input
                :type="isGoogle ? 'text' : (show ? 'text' : 'password')"
                v-model.trim="confirmInput"
                class="w-full rounded-lg border border-red-200 bg-white px-3 py-2 pr-11
                       text-slate-900 placeholder-red-400
                       focus:border-red-400 focus:ring-red-400
                       dark:border-red-900/40 dark:bg-slate-900 dark:text-slate-100"
                :placeholder="isGoogle ? 'DELETE' : '••••••••'"
                @keyup.enter="onDelete"
              />

              <!-- Eye icon (only for password users) -->
              <button
                v-if="!isGoogle"
                type="button"
                @click="show = !show"
                class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center
                       rounded-md text-red-600 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/30"
                :aria-label="show ? 'Hide password' : 'Show password'"
              >
                <!-- eye / eye-off -->
                <svg v-if="!show" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.07.21.07.436 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z"/>
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.29 16.15 7.29 19 12 19c1.64 0 3.19-.33 4.58-.92M6.23 6.23A10.45 10.45 0 0112 5c4.71 0 8.71 2.85 10.07 7-.26.82-.66 1.59-1.18 2.28M3 3l18 18"/>
                </svg>
              </button>
            </div>

            <p v-if="error" class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
            <p v-if="success" class="text-sm text-emerald-700 dark:text-emerald-300">{{ success }}</p>
          </div>

          <div class="flex items-end">
            <button
              @click="onDelete"
              :disabled="deleting || (isGoogle ? confirmInput !== 'DELETE' : !confirmInput)"
              class="h-10 rounded-lg bg-red-600 px-5 font-semibold text-white
                     hover:bg-red-700 disabled:opacity-60"
            >
              {{ deleting ? 'Deleting…' : 'Delete My Account' }}
            </button>
          </div>
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
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'
import {
  doc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'

const router = useRouter()

const isGoogle = ref(false)
const show = ref(false)
const confirmInput = ref('')
const deleting = ref(false)
const error = ref('')
const success = ref('')

onMounted(() => {
  const u = auth.currentUser
  isGoogle.value = (u?.providerData?.[0]?.providerId || 'password') === 'google.com'
})

async function onDelete() {
  error.value = ''
  success.value = ''
  const u = auth.currentUser
  if (!u) {
    error.value = 'You are not signed in.'
    return
  }

  try {
    deleting.value = true

    // Reauth for password users
    if (!isGoogle.value) {
      const cred = EmailAuthProvider.credential(u.email || '', confirmInput.value)
      await reauthenticateWithCredential(u, cred)
    } else {
      if (confirmInput.value !== 'DELETE') {
        error.value = 'Please type DELETE to confirm.'
        deleting.value = false
        return
      }
    }

    // Optional: mark in deletion log
    await setDoc(
      doc(db, 'deletion_logs', u.uid),
      { deletedAt: serverTimestamp() },
      { merge: true }
    )

    // Delete Firestore user document
    await deleteDoc(doc(db, 'users', u.uid))

    // Delete Firebase Auth user
    await deleteUser(u)

    success.value = 'Account deleted. Redirecting…'
    setTimeout(() => router.push('/login/'), 800)
  } catch (e) {
    console.error(e)
    if (e.code === 'auth/wrong-password') error.value = 'Incorrect password.'
    else if (e.code === 'auth/requires-recent-login')
      error.value = 'Please sign in again and retry.'
    else error.value = 'Failed to delete account.'
  } finally {
    deleting.value = false
  }
}
</script>
