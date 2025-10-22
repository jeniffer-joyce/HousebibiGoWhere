<template>
  <main class="mx-auto grid min-h-[60vh] place-items-center p-6 sm:p-10">
    <section class="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Email verified 🎉
      </h1>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Your sign-in email has been updated successfully. For security, please sign in again.
      </p>

      <p class="mt-6 text-emerald-600">
        Redirecting to login in <span class="font-semibold">{{ countdown }}</span>…
      </p>

      <div class="mt-6 flex items-center justify-center gap-3">
        <button
          @click="goNow"
          class="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-primary/90"
        >
          Sign in now
        </button>
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-600">
        {{ error }}
      </p>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase/firebase_config'
import { signOut } from 'firebase/auth'

const router = useRouter()

const countdown = ref(3)
const error = ref('')
let timer = null

const targetLoginUrl = { path: '/login/', query: { next: '/buyer-account/profile', emailUpdated: '1' } }

function goNow () {
  if (timer) clearInterval(timer)
  router.replace(targetLoginUrl)
}

onMounted(async () => {
  // End any existing session (if present) so the next page is the login screen.
  try {
    await signOut(auth)
  } catch (e) {
    // Non-fatal: we still redirect to login.
    console.warn('signOut skipped/failed:', e?.message || e)
  }

  // 3-second countdown, then send to login
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(timer)
      router.replace(targetLoginUrl)
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
