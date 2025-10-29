<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="close">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        
        <!-- Modal -->
        <div class="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h3>
            <button @click="close" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Description -->
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <!-- Success Message -->
          <div v-if="successMsg" class="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-green-800 dark:text-green-200">{{ successMsg }}</p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMsg" class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p class="text-sm text-red-800 dark:text-red-200">{{ errorMsg }}</p>
          </div>

          <!-- Form -->
          <form v-if="!successMsg" @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label for="reset-email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="reset-email"
                v-model="email"
                type="email"
                placeholder="Enter your email"
                required
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                @click="close"
                class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="loading || !email"
                class="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="!loading">Send Reset Link</span>
                <span v-else>Sending...</span>
              </button>
            </div>
          </form>

          <!-- Close button after success -->
          <button
            v-else
            @click="close"
            class="w-full px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase/firebase_config'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

function close() {
  email.value = ''
  errorMsg.value = ''
  successMsg.value = ''
  emit('close')
}

async function handleSubmit() {
  if (!email.value) return
  
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  try {
    await sendPasswordResetEmail(auth, email.value)
    successMsg.value = 'Password reset link sent! Check your email inbox (and spam folder).'
  } catch (error) {
    console.error('Password reset error:', error)
    
    // Handle specific error codes
    if (error.code === 'auth/user-not-found') {
      errorMsg.value = 'No account found with this email address.'
    } else if (error.code === 'auth/invalid-email') {
      errorMsg.value = 'Please enter a valid email address.'
    } else if (error.code === 'auth/too-many-requests') {
      errorMsg.value = 'Too many attempts. Please try again later.'
    } else {
      errorMsg.value = 'Failed to send reset email. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>