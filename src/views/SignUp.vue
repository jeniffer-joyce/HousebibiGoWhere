<template>
  <div class="min-h-screen bg-[#F5F7F7] dark:bg-[#0B1220] pb-24">
    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm mx-4">
        <div class="flex flex-col items-center gap-4">
          <!-- Spinner -->
          <svg class="animate-spin h-12 w-12 text-[#10A9C7]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          
          <!-- Message -->
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {{ loadingMessage }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Please wait, this may take a moment...
            </p>
          </div>
          
          <!-- Upload Progress (only for sellers with file) -->
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="w-full">
            <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
              <span>Uploading document...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-[#10A9C7] transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-xl mx-auto px-4">
      <div class="rounded-2xl shadow-md border p-8 md:p-10 mt-8
                  bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <h1 class="text-3xl font-extrabold text-center tracking-tight dark:text-gray-100">
          Create an account
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-center mt-2">
          Join our community of buyers and sellers!
        </p>

        <!-- Role -->
        <div class="grid grid-cols-2 gap-2 mt-6">
          <button type="button"
                  class="h-10 rounded-lg font-medium transition border"
                  :class="role==='buyer'
                    ? 'bg-[#10A9C7] text-white border-transparent'
                    : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600'"
                  @click="setRole('buyer')">
            I'm a Buyer
          </button>
          <button type="button"
                  class="h-10 rounded-lg font-medium transition border"
                  :class="role==='seller'
                    ? 'bg-[#10A9C7] text-white border-transparent'
                    : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600'"
                  @click="setRole('seller')">
            I'm a Seller
          </button>
        </div>

        <!-- Business Information Header (Seller only) -->
        <br></br>
        <div v-if="role==='seller'" class="mb-6">
          <button
            type="button"
            @click="showSingPassModal = true"
            class="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
            <span>🇸🇬 Verify with SingPass</span>
          </button>
          
          <div v-if="isSingPassVerified" class="mt-2 p-3 bg-green-50 rounded-lg">
            <p class="text-sm text-green-800">
              ✓ Verified: {{ verifiedBusinessData.businessName }}
            </p>
          </div>
        </div>

        <!-- FORM -->
        <form class="mt-5 space-y-4" @submit.prevent="onSubmit" novalidate>
          <!-- Business Fields (Seller only) -->
          <div v-if="role==='seller'" class="space-y-3">
            <div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-200">NRIC/FIN</label>
                <span class="text-xs text-gray-500">{{ nric.length }}/9</span>
              </div>
              <input v-model.trim="nric" maxlength="9"
                     class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     :class="invalid(nricValid) ? 'border-red-400' : ''" 
                     placeholder="e.g., S1234567A" />
              <p v-if="invalid(nricValid)" class="text-xs text-red-500 mt-1">Please enter a valid NRIC/FIN</p>
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Registered Company Name</label>
                <span class="text-xs text-gray-500">{{ companyName.length }}/100</span>
              </div>
              <input v-model.trim="companyName" maxlength="100"
                     class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     :class="invalid(companyNameValid) ? 'border-red-400' : ''" placeholder="Company Name" />
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Business License Number/UEN</label>
                <span class="text-xs text-gray-500">{{ uen.length }}/20</span>
              </div>
              <input
                v-model.trim="uen"
                maxlength="20"
                :class="[
                  'w-full rounded-lg px-4 py-3',
                  'bg-gray-50 text-gray-900 placeholder-gray-400',
                  'dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400',
                  invalid(uenValid) ? 'border border-red-400 dark:border-red-500'
                                    : 'border border-gray-200 dark:border-gray-700'
                ]"
                placeholder="UEN"
              />
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Registered Company Address</label>
              <input v-model.trim="postalCode" inputmode="numeric" maxlength="6"
                     class="mt-1 w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     :class="invalid(postalValid) ? 'border-red-400' : ''" placeholder="Postal Code (e.g. 123456)" />
              <input v-model.trim="addressLine"
                     class="mt-2 w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     :class="invalid(addressLineValid) ? 'border-red-400' : ''"
                     placeholder="Address (e.g., BLK 123A GREENLAND DRIVE 10)" />
              <input v-model.trim="unitNo"
                     class="mt-2 w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     placeholder="Unit No (e.g. #10-234)" />
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Business License Document</label>
              <div class="mt-1">
                <label class="inline-flex items-center gap-2 rounded-lg border px-4 py-2 cursor-pointer
                               bg-white border-gray-200 hover:bg-gray-50
                               dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                       :class="{ 'opacity-50 cursor-not-allowed': loading }">
                  <input type="file" class="hidden" @change="onUpload" accept=".pdf,.jpg,.jpeg,.png" :disabled="loading" />
                  <svg class="h-4 w-4 text-[#10A9C7]" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                  <span>Upload</span>
                </label>
                <span v-if="licenseFileName" class="ml-2 text-sm text-gray-600 dark:text-gray-300">{{ licenseFileName }}</span>
              </div>
              <!-- Upload Progress Bar -->
              <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-2">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-[#10A9C7] transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-600 dark:text-gray-400">{{ uploadProgress }}%</span>
                </div>
              </div>
              <p v-if="invalid(licenseValid)" class="text-xs text-red-500 mt-1">Please upload your BizFile+ / license</p>
              <p v-if="uploadError" class="text-xs text-red-500 mt-1">{{ uploadError }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF, JPG, or PNG. Max 5MB.</p>
            </div>

            <label class="mt-1 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" v-model="termsAccepted" class="mt-0.5">
              <span>I agree to the <a class="text-[#10A9C7] hover:underline" href="#" target="_blank">Terms & Conditions</a>.</span>
            </label>
            <p v-if="invalid(termsValid)" class="text-xs text-red-500">You must agree to the Terms</p>
          </div>

          <!-- Account Details Section Header -->
          <div :class="role==='seller' ? 'mt-6' : ''">
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Account Details</p>
          </div>

          <!-- Account details (everyone) -->
          <div class="space-y-3">
            <div>
              <input v-model.trim="username" type="text"
                     class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     placeholder="Username" autocomplete="username" />
              <p v-if="username && !usernameValid" class="text-xs text-red-500 mt-1">
                Username must be 8–20 alphanumeric characters
              </p>
            </div>

            <div>
              <input v-model.trim="email" type="email"
                     class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     placeholder="Email" autocomplete="email" />
              <p v-if="email && !emailValid" class="text-xs text-red-500 mt-1">Please enter a valid email</p>
            </div>

            <div>
              <div class="relative">
                <input :type="showPassword ? 'text' : 'password'" v-model="password"
                       class="w-full rounded-lg px-4 py-3 pr-10 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                              dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                       placeholder="Password" autocomplete="new-password" />
                <button type="button" @click="showPassword=!showPassword"
                        class="absolute inset-y-0 right-3 grid place-items-center text-gray-500 dark:text-gray-300 hover:opacity-80 focus:outline-none">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 013.563-4.773M6.223 6.223A9.965 9.965 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.953 9.953 0 01-4.152 5.016M6.223 6.223L3 3m3.223 3.223L21 21"/>
                  </svg>
                </button>
              </div>
              <p v-if="password && !passwordStrong" class="text-xs text-red-500 mt-1">
                Password must have 8+ chars, one upper, one lower, and a symbol
              </p>
            </div>

            <div>
              <input v-model.trim="displayName" type="text"
                     class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     placeholder="Full Name" autocomplete="name" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <select
  v-model="gender"
  class="w-full rounded-lg px-4 py-3 pr-10 border bg-gray-50 border-gray-200 text-gray-700
         appearance-none relative
         dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
  style="background-image: linear-gradient(45deg, transparent 50%, gray 50%), linear-gradient(135deg, gray 50%, transparent 50%);
         background-position: right 1rem center, right 0.75rem center;
         background-size: 6px 6px, 6px 6px;
         background-repeat: no-repeat;">
  <option value="" disabled selected>Gender</option>
  <option value="Female">Female</option>
  <option value="Male">Male</option>
  <option value="Prefer not to say">Prefer not to say</option>
</select>




              <div>
                <input v-model="birthday" type="date"
                       class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200
                              dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                       placeholder="Birthday" />
                <p v-if="birthday && !birthdayValid" class="text-xs text-red-500 mt-1">You must be at least 18</p>
              </div>
            </div>

            <div>
              <input v-model.trim="phone" type="tel" inputmode="tel"
                     class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                            dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                     placeholder="SG Phone Number" />
              <p v-if="phone && !phoneValid" class="text-xs text-red-500 mt-1">
                Use 8 digits starting with 8 or 9, or +65 8/9xxxxxxx
              </p>
            </div>

            <!-- reCAPTCHA -->
            <div class="mt-2">
              <div class="flex justify-center"><div id="recaptcha-container" class="inline-block"></div></div>
              <p v-if="captchaError" class="text-xs text-red-500 mt-1 text-center">Please complete the reCAPTCHA.</p>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button type="submit" :disabled="!canSubmit || loading"
                      class="w-full rounded-lg bg-[#FF7A5C] px-5 py-2.5 text-white font-semibold
                             hover:opacity-95 disabled:bg-gray-300 disabled:cursor-not-allowed">
                <span v-if="!loading">Sign up</span><span v-else>Creating account…</span>
              </button>
            </div>

            <p class="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?
              <router-link to="/login" class="text-[#10A9C7] hover:underline">Log in</router-link>
            </p>

            <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>
          </div>
        </form>
      </div>
    </div>
  <SingPassVerificationModal 
      :show="showSingPassModal"
      @close="showSingPassModal = false"
      @verified="handleSingPassVerified"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { registerUserWithUsername } from '../firebase/auth/authService'
import { auth } from '../firebase/firebase_config'
import { user } from '@/store/user.js'
import { useRoute } from 'vue-router'
import SingPassVerificationModal from '@/components/SingPassVerificationModal.vue'
import { verifySingPass, markBusinessAsRegistered } from '@/firebase/services/singpassVerification'

const route = useRoute()
const router = useRouter()

// SingPass verification
const showSingPassModal = ref(false)
const verifiedBusinessData = ref(null)
const isSingPassVerified = ref(false)

// Handle successful SingPass verification
function handleSingPassVerified(data) {
  console.log('✅ SingPass verified:', data)
  verifiedBusinessData.value = data
  isSingPassVerified.value = true
  
  // Pre-fill form fields with verified data
  nric.value = data.nric
  displayName.value = data.fullName
  birthday.value = data.dateOfBirth
  gender.value = data.gender
  phone.value = data.phone
  companyName.value = data.businessName
  uen.value = data.uen
  postalCode.value = data.businessAddress.postalCode
  addressLine.value = data.businessAddress.addressLine
  unitNo.value = data.businessAddress.unitNo || ''
  
  // Show success message
  alert('✅ Your business details have been verified and pre-filled!')
}
/* Role */
const role = ref('buyer')
function setRole(v){ role.value = v }

/* Business fields (Seller only) */
const nric = ref('')
const companyName = ref('')
const uen = ref('')
const postalCode = ref('')
const addressLine = ref('')
const unitNo = ref('')
const licenseFile = ref(null)
const licenseFileName = ref('')
const termsAccepted = ref(false)
const triedSubmit = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')

function onUpload(e){ 
  const f = e.target.files?.[0]
  licenseFile.value = f || null
  licenseFileName.value = f?.name || ''
  uploadError.value = ''
  uploadProgress.value = 0
  
  // Validate file type
  if (f) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(f.type)) {
      uploadError.value = 'Please upload a PDF, JPG, or PNG file.'
      licenseFile.value = null
      licenseFileName.value = ''
      return
    }
    
    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (f.size > maxSize) {
      uploadError.value = 'File is too large. Maximum size is 5MB.'
      licenseFile.value = null
      licenseFileName.value = ''
      return
    }
  }
}

/* Account fields */
const username = ref('')
const email = ref('')
const password = ref('')
const displayName = ref('')
const gender = ref('')
const birthday = ref('')
const phone = ref('')

/* UI */
const showPassword = ref(false)
const loading = ref(false)
const loadingMessage = ref('Creating your account...')
const errorMsg = ref('')

/* Validations */
const usernameValid = computed(()=>/^[A-Za-z0-9]{8,20}$/.test(username.value.trim()))
const emailValid = computed(()=>/\S+@\S+\.\S+/.test(email.value))
const passwordStrong = computed(()=>/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(password.value))
const phoneValid = computed(()=>{ const v=phone.value.trim(); if(!v) return true; return /^(?:\+65\s*)?[89]\d{7}$/.test(v) })
const birthdayValid = computed(()=>{ if(!birthday.value) return true; const b=new Date(birthday.value), t=new Date(); let a=t.getFullYear()-b.getFullYear(); const before=t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()); if(before) a--; return a>=18 })

const companyNameValid = computed(()=>companyName.value.trim().length>0 && companyName.value.trim().length<=100)
const nricValid = computed(() => {
  const val = nric.value.trim().toUpperCase()
  // Singapore NRIC/FIN format: Letter + 7 digits + Letter
  // Valid starting letters: S, T, F, G, M
  return /^[STFGM]\d{7}[A-Z]$/.test(val)
})
const uenValid = computed(() => uen.value.trim().length > 0)
const postalValid = computed(()=>/^\d{6}$/.test(postalCode.value.trim()))
const addressLineValid = computed(()=>addressLine.value.trim().length>0)
const licenseValid = computed(()=>!!licenseFile.value)
const termsValid = computed(()=>termsAccepted.value===true)
const invalid = (rule)=> triedSubmit.value && !rule

/* Business validation gate */
const businessOk = computed(()=>{
  if(role.value !== 'seller') return true
  return nricValid.value && companyNameValid.value && uenValid.value && postalValid.value && addressLineValid.value && licenseValid.value && termsValid.value
})

/* reCAPTCHA */
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
const captchaToken = ref('')
const captchaError = ref(false)
let widgetId = null
let themeObserver

function currentTheme () {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

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
  const theme = currentTheme()
  widgetId = window.grecaptcha.render('recaptcha-container', {
    sitekey: recaptchaSiteKey,
    theme,
    callback: (token) => {
      captchaToken.value = token
      captchaError.value = false
    },
    'expired-callback': () => {
      captchaToken.value = ''
      captchaError.value = true
    }
  })
}

function validateCaptcha() {
  if (!captchaToken.value) {
    captchaError.value = true
    return false
  }
  return true
}

// If query parameter exists, override default (for users who press 'Get Started Now' on sellers' page)
onMounted(() => {
  if (route.query.role === 'seller') {
    role.value = 'seller'
  }
})

onMounted(async () => {
  if (!recaptchaSiteKey) {
    console.error('Missing VITE_RECAPTCHA_SITE_KEY in .env.local')
    return
  }
  await loadRecaptchaScript()
  renderRecaptcha()

  themeObserver = new MutationObserver(() => {
    const el = document.getElementById('recaptcha-container')
    if (!el || !window.grecaptcha) return
    el.innerHTML = ''
    widgetId = null
    captchaToken.value = ''
    renderRecaptcha()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(()=>{ themeObserver?.disconnect(); resetRecaptcha() })

/* Submit */
const canSubmit = computed(()=>(
  usernameValid.value && emailValid.value && passwordStrong.value &&
  phoneValid.value && birthdayValid.value && displayName.value.trim().length>0 &&
  businessOk.value
))

async function onSubmit(){
  triedSubmit.value = true
  if(!canSubmit.value || loading.value) return
  if(!validateCaptcha()) return

  console.log('Starting signup process...')
  loading.value = true
  user.isSigningUp = true // Prevent auth state change from interfering
  errorMsg.value = ''
  uploadProgress.value = 0
  const startTime = Date.now() // Track when signup started
  
  try{
    // Update message based on role
    if (role.value === 'seller' && licenseFile.value) {
      loadingMessage.value = 'Uploading your business license...'
    } else {
      loadingMessage.value = 'Creating your account...'
    }
    
    console.log('Calling registerUserWithUsername...')
    const newUser = await registerUserWithUsername({
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
      displayName: displayName.value.trim(),
      role: role.value,
      extra: {
        gender: gender.value,
        birthday: birthday.value,
        phone: phone.value.trim(),
        ...(role.value==='seller'
          ? { 
              nric: nric.value.trim().toUpperCase(),
              companyName: companyName.value.trim(), 
              uen: uen.value.trim(),
              postalCode: postalCode.value.trim(), 
              addressLine: addressLine.value.trim(),
              unitNo: unitNo.value.trim() || null,
            }
          : {}),
      },
      captchaToken: captchaToken.value,
      // Pass the actual file for sellers
      licenseFile: role.value === 'seller' ? licenseFile.value : null,
      // Progress callback
      onUploadProgress: (progress) => {
        uploadProgress.value = progress
        if (progress === 100) {
          loadingMessage.value = 'Finalizing your account...'
        }
      }
    })
    
    console.log('Registration complete!')
    if (role.value === 'seller' && verifiedBusinessData.value) {
      await markBusinessAsRegistered(verifiedBusinessData.value.verificationId, {
        email: email.value,
        username: username.value,
        uid: newUser.uid
      })
    }
    // Calculate remaining time to reach 5 seconds
    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, 5000 - elapsedTime)
    
    console.log(`Elapsed time: ${elapsedTime}ms, Remaining time: ${remainingTime}ms`)
    
    // Update message to success
    loadingMessage.value = 'Account created successfully!'
    
    // Wait for remaining time to complete full 5 seconds
    if (remainingTime > 0) {
      console.log(`Waiting ${remainingTime}ms...`)
      await new Promise(resolve => setTimeout(resolve, remainingTime))
      console.log('Wait complete!')
    }
    
    console.log('About to show alert, loading value:', loading.value)
    
    // Keep loading overlay visible and show alert
    alert('Account created successfully!')
    
    console.log('Alert dismissed, about to redirect')
    
    // Clear signup flag before redirect
    user.isSigningUp = false
    
    // Redirect based on role (loading will disappear with page change)
    if (role.value === 'seller') {
      window.location.href = '/seller-profile'
    } else {
      window.location.href = '/'
    }
    
  }catch(err){
    console.error('Signup error:', err)
    errorMsg.value = mapError(err)
    uploadProgress.value = 0
    loading.value = false
    user.isSigningUp = false // Clear flag on error
    loadingMessage.value = 'Creating your account...'
    resetRecaptcha()
  }
}

function mapError(err){
  const code = err?.code || err?.message || ''
  if (code.includes('username-already-in-use')) return 'Username has been taken.'
  if (code.includes('invalid-username')) return 'Username must be 8–20 alphanumeric characters.'
  if (code.includes('email-already-in-use')) return 'This email is already registered.'
  if (code.includes('invalid-email')) return 'Please enter a valid email.'
  if (code.includes('weak-password')) return 'Password must be stronger.'
  if (code.includes('captcha')) return 'Please complete the reCAPTCHA.'
  if (code.includes('upload/invalid-file-type')) return 'Please upload a PDF, JPG, or PNG file.'
  if (code.includes('upload/file-too-large')) return 'File is too large. Maximum size is 5MB.'
  if (code.includes('upload/failed')) return 'File upload failed. Please try again.'
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