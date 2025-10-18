<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="close">
        <div class="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <img src="https://jtcdams-delivery.stylelabs.cloud/api/public/content/d1efb9ffb29d4a47a3d60b3ce437d6c7?v=0b83a484"
                       alt="SingPass" 
                       class="w-10 h-6" />
                </div>
                <div>
                  <h2 class="text-xl font-bold text-white">SingPass Verification</h2>
                  <p class="text-sm text-red-100">Secure Business Verification</p>
                </div>
              </div>
              <button @click="close" class="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <span class="material-symbols-outlined text-white">close</span>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="px-6 py-6">
            <!-- Initial State -->
            <div v-if="!verifying && !verificationResult">
              <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p class="text-sm text-blue-900 dark:text-blue-100">
                  <strong class="font-semibold">🔒 Secure Verification</strong><br/>
                  Please enter your details exactly as they appear on your NRIC/FIN.
                </p>
              </div>

              <form @submit.prevent="handleVerify" class="space-y-4">
                <!-- NRIC -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NRIC/FIN <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.nric"
                    type="text"
                    maxlength="9"
                    required
                    placeholder="e.g., S1234567A"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white uppercase"
                  />
                </div>

                <!-- Full Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name (as per NRIC) <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.fullName"
                    type="text"
                    required
                    placeholder="e.g., John Tan Wei Ming"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <!-- Date of Birth -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.dateOfBirth"
                    type="date"
                    required
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  :disabled="verifying"
                  class="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <span v-if="verifying" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  <span>{{ verifying ? 'Verifying...' : 'Verify with SingPass' }}</span>
                </button>
              </form>
            </div>

            <!-- Verifying State -->
            <div v-else-if="verifying" class="py-8 text-center">
              <div class="inline-block p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                <span class="material-symbols-outlined text-red-600 text-4xl animate-spin">progress_activity</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Verifying...</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Please wait while we verify your details with SingPass
              </p>
            </div>

            <!-- Success Result -->
            <div v-else-if="verificationResult && verificationResult.success" class="text-center py-6">
              <div class="inline-block p-4 bg-green-50 dark:bg-green-900/20 rounded-full mb-4">
                <span class="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Verification Successful!</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Your business details have been verified
              </p>

              <!-- Verified Details -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Business Name:</span>
                    <span class="font-medium text-gray-900 dark:text-white">{{ verificationResult.data.businessName }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">UEN:</span>
                    <span class="font-medium text-gray-900 dark:text-white">{{ verificationResult.data.uen }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Full Name:</span>
                    <span class="font-medium text-gray-900 dark:text-white">{{ verificationResult.data.fullName }}</span>
                  </div>
                </div>
              </div>

              <button
                @click="handleContinue"
                class="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
                Continue
              </button>
            </div>

            <!-- Error Result -->
            <div v-else-if="verificationResult && !verificationResult.success" class="text-center py-6">
              <div class="inline-block p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                <span class="material-symbols-outlined text-red-600 text-4xl">error</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Verification Failed</h3>
              <p class="text-sm text-red-600 dark:text-red-400 mb-6">
                {{ errorMessage }}
              </p>

              <button
                @click="resetForm"
                class="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors">
                Try Again
              </button>
            </div>
          </div>

          <!-- Footer Info -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
              🔒 Your information is secured and encrypted
            </p>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { verifySingPass, formatVerificationError } from '@/firebase/services/singpassVerification'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'verified'])

const verifying = ref(false)
const verificationResult = ref(null)
const errorMessage = ref('')

const formData = reactive({
  nric: '',
  fullName: '',
  dateOfBirth: ''
})

async function handleVerify() {
  verifying.value = true
  verificationResult.value = null
  errorMessage.value = ''

  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const result = await verifySingPass({
      nric: formData.nric,
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth
    })

    verificationResult.value = result

    if (!result.success) {
      errorMessage.value = formatVerificationError(result)
    }

  } catch (error) {
    console.error('Verification error:', error)
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    verifying.value = false
  }
}

function handleContinue() {
  if (verificationResult.value?.success) {
    emit('verified', verificationResult.value.data)
    close()
  }
}

function resetForm() {
  formData.nric = ''
  formData.fullName = ''
  formData.dateOfBirth = ''
  verificationResult.value = null
  errorMessage.value = ''
  verifying.value = false
}

function close() {
  resetForm()
  emit('close')
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>