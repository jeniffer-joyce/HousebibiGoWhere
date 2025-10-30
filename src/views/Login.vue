<template>
  <main class="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 bg-background-light dark:bg-background-dark p-8 sm:p-10 rounded-xl border border-background-dark/10 dark:border-background-light/10">
      <div>
        <h2 class="text-center text-3xl font-extrabold text-background-dark dark:text-background-light">
          Welcome back
        </h2>
        <p class="mt-2 text-center text-sm text-background-dark/60 dark:text-background-light/60 mb-6">
          Log in to continue your journey with us.
        </p>
      </div>

      <!-- 🆕 Role Toggle (Visual Only) -->
      <div class="grid grid-cols-2 gap-2 mb-6">
        <button
          type="button"
          class="h-10 rounded-lg font-medium transition border"
          :class="role === 'buyer'
            ? 'bg-[#10A9C7] text-white border-transparent'
            : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600'"
          @click="role = 'buyer'">
          I'm a Buyer
        </button>
        <button
          type="button"
          class="h-10 rounded-lg font-medium transition border"
          :class="role === 'seller'
            ? 'bg-[#10A9C7] text-white border-transparent'
            : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600'"
          @click="role = 'seller'">
          I'm a Seller
        </button>
      </div>

      <!-- Google Sign-In -->
      <div class="space-y-4">
        <button
          type="button"
          @click="onGoogleLogin"
          :disabled="loading || loadingGoogle"
          class="w-full inline-flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold
                 border border-background-dark/15 dark:border-background-light/15
                 bg-white hover:bg-gray-50 dark:bg-[#0E1526] dark:hover:bg-[#111a2c]
                 text-background-dark dark:text-background-light
                 transition disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Sign in with Google"
        >
          <img :src="googleLogo" alt="Google" class="h-5 w-5" />
          <span v-if="!loadingGoogle">Sign in with Google</span>
          <span v-else>Connecting…</span>
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-4">
          <div class="h-px grow bg-background-dark/10 dark:bg-background-light/10"></div>
          <span class="text-xs text-background-dark/60 dark:text-background-light/60">OR</span>
          <div class="h-px grow bg-background-dark/10 dark:bg-background-light/10"></div>
        </div>
      </div>

      <!-- Email / password form -->
      <form class="mt-6 space-y-6" @submit.prevent="onSubmit">
        <div class="-space-y-px">
          <!-- Email -->
          <div>
            <label class="sr-only" for="identifier">Email</label>
            <input
              id="identifier"
              v-model.trim="identifier"
              type="text"
              inputmode="email"
              autocomplete="email"
              autocapitalize="none"
              spellcheck="false"
              placeholder="Email"
              class="form-input appearance-none rounded-none relative block w-full px-3 py-3 border border-background-dark/20 dark:border-background-light/20 bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light placeholder-opacity-50 focus:outline-none focus:ring-primary focus:border-primary text-sm rounded-t-lg"
              required
            />
          </div>

          <!-- Password with eye toggle -->
          <div>
            <label class="sr-only" for="password">Password</label>
            <div class="relative">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="Password"
                autocomplete="current-password"
                class="form-input appearance-none rounded-none relative block w-full px-3 py-3 pr-10 border border-background-dark/20 dark:border-background-light/20 bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light placeholder-opacity-50 focus:outline-none focus:ring-primary focus:border-primary text-sm rounded-b-lg"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-3 grid place-items-center text-background-dark/60 dark:text-background-light/60 hover:opacity-80 focus:outline-none z-20"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                tabindex="-1"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 013.563-4.773M6.223 6.223A9.965 9.965 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.953 9.953 0 01-4.152 5.016M6.223 6.223L3 3m3.223 3.223L21 21"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Forgot password -->
        <div class="flex items-center justify-end -mt-2">
          <button
            type="button"
            @click="showForgotPasswordModal = true"
            class="text-sm font-medium text-primary hover:text-primary/80"
          >
            Forgot your password?
          </button>
        </div>

        <!-- reCAPTCHA - with unique key to force re-render -->
        <div class="mt-2">
          <div class="flex justify-center">
            <div :id="recaptchaContainerId" :key="recaptchaKey" class="inline-block"></div>
          </div>
          <p v-if="captchaError" class="text-xs text-red-600 mt-2 text-center">
            Please complete the reCAPTCHA.
          </p>
        </div>

        <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>

        <div>
          <button
            type="submit"
            :disabled="loading || !identifier || !password || !captchaToken"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white
                   bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                   focus:ring-offset-background-light dark:focus:ring-offset-background-dark transition-colors
                   disabled:opacity-60 disabled:cursor-not-allowed">
            <span v-if="!loading">Log in</span>
            <span v-else>Logging in…</span>
          </button>
        </div>
      </form>

      <p class="text-center text-sm text-background-dark/60 dark:text-background-light/60">
        Don't have an account?
        <router-link class="font-medium text-primary hover:text-primary/80" to="/signup">
          Sign up
        </router-link>
      </p>
    </div>

    <!-- Forgot Password Modal -->
    <ForgotPasswordModal
      :show="showForgotPasswordModal"
      @close="showForgotPasswordModal = false"
    />
  </main>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import ForgotPasswordModal from '@/components/modals/ForgotPasswordModal.vue'
import { loginWithIdentifier } from '../firebase/auth/authService'
import {
  loginWithGooglePopup,
  handleGoogleRedirectResult,
} from '../firebase/auth/authService'
import { db, auth } from '@/firebase/firebase_config'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import googleLogo from '@/assets/google-logo.png'

const router = useRouter()

// 🆕 Role state (visual only - doesn't affect auth)
const role = ref('buyer')

// form
const identifier = ref('')
const password = ref('')
const showPassword = ref(false)

// reCAPTCHA - using dynamic container ID and key for re-rendering
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
const captchaToken = ref('')
const captchaError = ref(false)
const showForgotPasswordModal = ref(false)
const recaptchaKey = ref(0) // Used to force re-render
const recaptchaContainerId = ref('recaptcha-login-0')
let widgetId = null
let expireTimer
let themeObserver

function loadRecaptchaScript () {
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

function onTokenReceived (token) {
  captchaToken.value = token
  captchaError.value = false
  clearTimeout(expireTimer)
  expireTimer = setTimeout(() => resetRecaptcha(), 110000)
}

function renderRecaptcha () {
  const container = document.getElementById(recaptchaContainerId.value)
  if (!container) {
    console.error('reCAPTCHA container not found:', recaptchaContainerId.value)
    return
  }
  
  if (!window.grecaptcha || typeof window.grecaptcha.render !== 'function') {
    console.error('grecaptcha not ready')
    return
  }
  
  const isDark = document.documentElement.classList.contains('dark')
  
  try {
    widgetId = window.grecaptcha.render(recaptchaContainerId.value, {
      sitekey: recaptchaSiteKey,
      theme: isDark ? 'dark' : 'light',
      callback: onTokenReceived,
      'expired-callback': () => {
        captchaToken.value = ''
        captchaError.value = true
      }
    })
  } catch (error) {
    console.error('Error rendering reCAPTCHA:', error)
  }
}

function resetRecaptcha () {
  if (window.grecaptcha && widgetId !== null) {
    try {
      window.grecaptcha.reset(widgetId)
    } catch (e) {
      console.log('Reset failed:', e)
    }
  }
  captchaToken.value = ''
}

function recreateRecaptcha() {
  // Increment key to force Vue to destroy and recreate the container
  recaptchaKey.value++
  recaptchaContainerId.value = `recaptcha-login-${recaptchaKey.value}`
  widgetId = null
  captchaToken.value = ''
  captchaError.value = false
  
  // Wait for Vue to create the new DOM element
  setTimeout(() => {
    renderRecaptcha()
  }, 100)
}

// Route user based on Firestore role (ignores visual toggle)
async function goToSellerHome(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  const data = snap.exists() ? snap.data() : null
  const username = String(data?.username || '').trim().toLowerCase()
  if (data?.role === 'seller' && username) {
    await router.replace({ name: 'business-home', params: { username } })
    return true
  }
  return false
}

async function routeAfterLogin(uid) {
  // Route based on ACTUAL Firestore role, not visual toggle
  const went = await goToSellerHome(uid)
  if (went) return
  await router.replace('/')
}

onMounted(async () => {
  try {
    const result = await handleGoogleRedirectResult()
    if (result) {
      const { user: u, isNewUser } = result
      
      // Same logic as above for new users
      if (isNewUser) {
        if (role.value === 'seller') {
          await router.push('/signup?role=seller&showSingPass=true')
          return
        }
        await router.push('/complete-profile')
        return
      }
      
      await routeAfterLogin(u.uid)
      return
    }
  } catch (e) {
    console.error(e)
  }

  if (!recaptchaSiteKey) {
    console.error('Missing VITE_RECAPTCHA_SITE_KEY')
    return
  }
  
  await loadRecaptchaScript()
  renderRecaptcha()

  // Watch for dark mode changes and recreate reCAPTCHA with new container
  themeObserver = new MutationObserver(() => {
    recreateRecaptcha()
  })
  themeObserver.observe(document.documentElement, { 
    attributes: true, 
    attributeFilter: ['class'] 
  })
})

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  clearTimeout(expireTimer)
  resetRecaptcha()
})

const loading = ref(false)
const loadingGoogle = ref(false)
const errorMsg = ref('')

async function onSubmit () {
  if (!captchaToken.value) { captchaError.value = true; return }
  loading.value = true
  errorMsg.value = ''
  try {
    await loginWithIdentifier(identifier.value.trim(), password.value, captchaToken.value)
    resetRecaptcha()
    const uid = auth.currentUser?.uid
    if (uid) await routeAfterLogin(uid)
    else await router.replace('/')
  } catch (err) {
    console.error(err)
    errorMsg.value = mapErr(err)
    resetRecaptcha()
  } finally {
    loading.value = false
  }
}

async function onGoogleLogin () {
  loadingGoogle.value = true
  errorMsg.value = ''
  try {
    // ✅ Now returns { user, isNewUser }
    const result = await loginWithGooglePopup()
    const { user: u, isNewUser } = result
    
    // ✅ NEW USER HANDLING
    // ✅ NEW USER HANDLING
if (isNewUser) {
  // ✅ Save selected role to Firestore IMMEDIATELY
  await setDoc(doc(db, 'users', u.uid), {
    role: role.value,
    profileComplete: false
  }, { merge: true })
  
  console.log(`✅ Role saved: ${role.value}`)
  
  // Seller toggle selected → Go to CompleteProfile
  if (role.value === 'seller') {
    await router.push('/complete-profile')
    return
  }
  
  // Buyer toggle selected → Go to CompleteProfile
  if (role.value === 'buyer') {
    await router.push('/complete-profile')
    return
  }
}
    
    // ✅ EXISTING USER - Check if profile is complete
    const userDoc = await getDoc(doc(db, 'users', u.uid))
    const userData = userDoc.data()
    
    // If profile still incomplete (edge case)
    if (userData.profileComplete === false || !userData.username || !userData.phone) {
      await router.push('/complete-profile')
      return
    }
    
    // ✅ Profile complete - route normally
    await routeAfterLogin(u.uid)
    
  } catch (e) {
    console.error(e)
    errorMsg.value = e?.hint || e?.message || 'Google sign-in failed.'
  } finally {
    loadingGoogle.value = false
  }
}

function mapErr (err) {
  const code = err?.code || err?.message || ''
  if (code.includes('auth/user-not-found')) return 'Email not found!'
  if (code.includes('auth/wrong-password')) return 'Incorrect password!'
  if (code.includes('captcha')) return 'Please complete the reCAPTCHA.'
  return 'Login failed. Please try again.'
}
</script>