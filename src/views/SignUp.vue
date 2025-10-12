<template>
  <div class="min-h-screen bg-[#F5F7F7]">
    <div class="max-w-6xl mx-auto px-6 pt-7 pb-4"></div>

    <div class="max-w-xl mx-auto px-4">
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-8 md:p-10">
        <h1 class="text-3xl font-extrabold text-center tracking-tight">Create an account</h1>
        <p class="text-gray-500 text-center mt-2">Join our community of buyers and sellers!</p>

        <!-- Role Selection -->
        <div class="grid grid-cols-2 gap-2 mt-6">
          <button
            type="button"
            class="h-10 rounded-lg font-medium transition border"
            :class="role === 'buyer'
              ? 'bg-[#10A9C7] text-white border-transparent'
              : 'bg-gray-100 text-gray-700 border-gray-200'"
            @click="role = 'buyer'"
          >
            I'm a Buyer
          </button>
          <button
            type="button"
            class="h-10 rounded-lg font-medium transition border"
            :class="role === 'seller'
              ? 'bg-[#10A9C7] text-white border-transparent'
              : 'bg-gray-100 text-gray-700 border-gray-200'"
            @click="role = 'seller'"
          >
            I'm a Seller
          </button>
        </div>

        <form class="mt-5 space-y-3" @submit.prevent="onSubmit" novalidate>
          <!-- UEN (Seller only) -->
          <div v-if="role === 'seller'">
            <input
              v-model.trim="uen"
              type="text"
              inputmode="text"
              class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              placeholder="Government UEN"
              autocomplete="off"
            />
          </div>

          <!-- Username -->
          <div>
            <input
              v-model.trim="username"
              type="text"
              class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              placeholder="Username"
              autocomplete="username"
            />
            <p v-if="username && !usernameValid" class="text-xs text-red-600 mt-1">
              Username must be 8–20 characters long and contain only letters and numbers.
            </p>
          </div>

          <!-- Email -->
          <div>
            <input
              v-model.trim="email"
              type="email"
              class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              placeholder="Email"
              autocomplete="email"
            />
            <p v-if="email && !emailValid" class="text-xs text-red-600 mt-1">
              Please enter a valid email address.
            </p>
          </div>

          <!-- Password with Eye Icon -->
          <div>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pr-10"
                placeholder="Password"
                autocomplete="new-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-3 grid place-items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Toggle password visibility"
                tabindex="-1"
              >
                <!-- closed eye -->
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <!-- crossed eye -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 013.563-4.773M6.223 6.223A9.965 9.965 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.953 9.953 0 01-4.152 5.016M6.223 6.223L3 3m3.223 3.223L21 21"/>
                </svg>
              </button>
            </div>
            <p v-if="password && !passwordStrong" class="text-xs text-red-600 mt-1">
              Password must be at least 8 characters and include an uppercase, lowercase, and special character.
            </p>
          </div>

          <!-- Name -->
          <div>
            <input
              v-model.trim="displayName"
              type="text"
              class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              placeholder="Full Name"
              autocomplete="name"
            />
          </div>

          <!-- Gender + Birthday with Age Gate -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <select
                v-model="gender"
                class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700"
              >
                <option value="" disabled selected>Gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <input
                v-model="birthday"
                type="date"
                class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                placeholder="Birthday"
              />
              <p v-if="birthday && !birthdayValid" class="text-xs text-red-600 mt-1">
                You must be at least 18 years old to create an account.
              </p>
            </div>
          </div>

          <!-- Phone -->
          <div>
            <input
              v-model.trim="phone"
              type="tel"
              class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              placeholder="SG Phone Number"
              autocomplete="tel"
            />
            <p v-if="phone && !phoneValid" class="text-xs text-red-600 mt-1">
              Enter 8 digits (e.g., 8xxxxxxx / 9xxxxxxx) or +65XXXXXXXX.
            </p>
          </div>

          <!-- User Preferences Section (Buyers Only) -->
          <div v-if="role === 'buyer'" class="mt-6 rounded-xl border border-[#10A9C7]/20 bg-gradient-to-br from-[#10A9C7]/5 to-[#10A9C7]/10 p-5 shadow-sm">
            <div class="flex flex-col gap-4">
              <div class="flex items-start gap-3">
                <div class="rounded-full bg-[#10A9C7]/10 p-2 mt-0.5">
                  <svg class="h-5 w-5 text-[#10A9C7]" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24">
                    <path
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-base font-bold text-slate-900">What are your favorite categories?</h3>
                  <p class="text-xs text-slate-600 mt-1">Select multiple categories to personalize your experience (optional)</p>
                </div>
              </div>
              
              <div v-if="categoriesLoading" class="flex justify-center py-4">
                <div class="animate-spin h-6 w-6 border-2 border-[#10A9C7] border-t-transparent rounded-full"></div>
              </div>
              
              <div v-else-if="categories.length > 0" class="flex flex-wrap gap-2">
                <button
                  v-for="category in categories"
                  :key="category.slug"
                  type="button"
                  @click="togglePreference(category.slug)"
                  :class="[
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    selectedPreferences.includes(category.slug)
                      ? 'bg-[#10A9C7] text-white hover:bg-[#10A9C7]/90'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  ]">
                  {{ category.name }}
                </button>
              </div>
              
              <p v-else class="text-xs text-slate-500 text-center py-2">
                Unable to load categories. You can set your preferences later!
              </p>
            </div>
          </div>

          <!-- reCAPTCHA -->
          <div class="mt-4">
            <div v-if="recaptchaLoading" class="flex flex-col items-center gap-2 py-8">
              <div class="animate-spin h-8 w-8 border-3 border-[#10A9C7] border-t-transparent rounded-full"></div>
              <p class="text-sm text-slate-500">Loading security check...</p>
            </div>
            <div v-show="!recaptchaLoading" class="flex justify-center">
              <div id="recaptcha-container"></div>
            </div>
          </div>
          <p v-if="captchaError" class="text-xs text-red-600 mt-1 text-center">
            Please complete the reCAPTCHA before signing up.
          </p>

          <!-- Error -->
          <p v-if="errorMsg" class="text-sm text-red-600 mt-1">{{ errorMsg }}</p>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="!canSubmit || loading"
            class="w-full h-11 rounded-lg text-white font-semibold mt-2 transition"
            :class="canSubmit ? 'bg-[#FF7A5C] hover:opacity-95' : 'bg-gray-300 cursor-not-allowed'"
          >
            <span v-if="!loading">Sign up</span>
            <span v-else>Creating account…</span>
          </button>

          <p class="text-center text-sm text-gray-500 mt-3">
            Already have an account?
            <router-link to="/login" class="text-[#10A9C7] hover:underline">Log in</router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { registerUserWithUsername } from '../firebase/auth/authService'
import { getCategories } from '../firebase/services/home/categories.js'

const router = useRouter()

// Role & fields
const role = ref('buyer')
const uen = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const displayName = ref('')
const gender = ref('')
const birthday = ref('')
const phone = ref('')

const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

// Preferences
const categories = ref([])
const categoriesLoading = ref(true)
const selectedPreferences = ref([])
const recaptchaLoading = ref(true)

// Validation
const usernameValid = computed(() => /^[A-Za-z0-9]{8,20}$/.test(username.value.trim()))
const emailValid = computed(() => /\S+@\S+\.\S+/.test(email.value))
const passwordStrong = computed(() => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(password.value))
const phoneValid = computed(() => {
  const v = phone.value.trim()
  return v === '' || /^(\+65)?\s?\d{8}$/.test(v)
})
const birthdayValid = computed(() => {
  if (!birthday.value) return true
  const birth = new Date(birthday.value)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  if (beforeBirthday) age -= 1
  return age >= 18
})
const uenRequiredOk = computed(() => role.value === 'buyer' || uen.value.trim().length > 0)
const canSubmit = computed(() =>
  usernameValid.value &&
  emailValid.value &&
  passwordStrong.value &&
  phoneValid.value &&
  birthdayValid.value &&
  displayName.value.trim().length > 0 &&
  uenRequiredOk.value
)

// Preferences functions
const togglePreference = (categorySlug) => {
  const index = selectedPreferences.value.indexOf(categorySlug)
  if (index === -1) {
    selectedPreferences.value.push(categorySlug)
  } else {
    selectedPreferences.value.splice(index, 1)
  }
}

// Load categories
onMounted(async () => {
  try {
    const cats = await getCategories()
    categories.value = cats
  } catch (error) {
    console.error('Error loading categories:', error)
  } finally {
    categoriesLoading.value = false
  }

  // Load reCAPTCHA
  if (!recaptchaSiteKey) {
    console.error('Missing VITE_RECAPTCHA_SITE_KEY in .env.local')
    errorMsg.value = 'reCAPTCHA configuration error. Please contact support.'
    return
  }
  
  try {
    await loadRecaptchaScript()
    // Wait a bit to ensure the container is in the DOM
    setTimeout(() => {
      renderRecaptcha()
    }, 100)
  } catch (error) {
    console.error('reCAPTCHA loading error:', error)
    errorMsg.value = 'Failed to load reCAPTCHA. Please refresh the page.'
  }
})

// --- reCAPTCHA (v2 Checkbox) ---
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
const captchaToken = ref('')
const captchaError = ref(false)
let widgetId = null

function resetRecaptcha() {
  if (window.grecaptcha && widgetId !== null) {
    window.grecaptcha.reset(widgetId)
  }
  captchaToken.value = ''
}

function loadRecaptchaScript() {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha?.render) return resolve()
    const s = document.createElement('script')
    s.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('recaptcha/script-failed'))
    document.head.appendChild(s)
  })
}

function renderRecaptcha() {
  try {
    const container = document.getElementById('recaptcha-container')
    if (!container) {
      console.error('reCAPTCHA container not found')
      recaptchaLoading.value = false
      return
    }
    
    // Check if grecaptcha is ready
    if (!window.grecaptcha || !window.grecaptcha.render) {
      console.error('grecaptcha not ready')
      recaptchaLoading.value = false
      return
    }
    
    widgetId = window.grecaptcha.render('recaptcha-container', {
      sitekey: recaptchaSiteKey,
      callback: (token) => {
        captchaToken.value = token
        captchaError.value = false
      },
      'expired-callback': () => {
        captchaToken.value = ''
        captchaError.value = true
      }
    })
    recaptchaLoading.value = false
  } catch (error) {
    console.error('Error rendering reCAPTCHA:', error)
    recaptchaLoading.value = false
  }
}

onBeforeUnmount(() => {
  if (window.grecaptcha && widgetId !== null) {
    window.grecaptcha.reset(widgetId)
  }
})

const validateCaptcha = () => {
  if (!captchaToken.value) {
    captchaError.value = true
    return false
  }
  return true
}

// Submit
async function onSubmit() {
  if (!canSubmit.value || loading.value) return
  if (!validateCaptcha()) return

  loading.value = true
  errorMsg.value = ''
  try {
    await registerUserWithUsername({
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
      displayName: displayName.value.trim(),
      role: role.value,
      extra: {
        gender: gender.value,
        birthday: birthday.value,
        phone: phone.value.trim(),
        uen: role.value === 'seller' ? uen.value.trim() : null,
        preferences: role.value === 'buyer' ? selectedPreferences.value : [], // Only save preferences for buyers
      },
      captchaToken: captchaToken.value,
    })
    resetRecaptcha()
    router.push('/login')
  } catch (err) {
    console.error(err)
    errorMsg.value = mapError(err)
    resetRecaptcha()
  } finally {
    loading.value = false
  }
}

// Friendly errors
function mapError(err) {
  const code = err?.code || err?.message || ''
  if (code.includes('username-already-in-use')) return 'Username has been taken. Please try another username!'
  if (code.includes('invalid-username')) return 'Username must be 8–20 alphanumeric characters!'
  if (code.includes('email-already-in-use')) return 'This email is already registered. Please try another email address!'
  if (code.includes('invalid-email')) return 'Please enter a valid email address!'
  if (code.includes('weak-password')) return 'Password must be at least 8 characters and include an uppercase, lowercase, and special character!'
  if (code.includes('captcha')) return 'Please complete the reCAPTCHA before signing up.'
  return 'Something went wrong. Please try again.'
}
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>