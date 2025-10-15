<template>
  <div class="min-h-screen bg-[#F5F7F7] dark:bg-[#0B1220] pb-24">
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

        <!-- Verification (Seller only) -->
        <div v-if="role==='seller'" class="mt-6">
          <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Verification Method</p>

          <div class="grid gap-3">
            <!-- MyInfo -->
            <button type="button" @click="setVerification('myinfo')"
                    class="w-full text-left rounded-xl border p-4 transition
                           bg-white border-gray-200 hover:border-[#10A9C7]/50
                           dark:bg-gray-800 dark:border-gray-700 ring-2"
                    :class="verificationMethod==='myinfo' ? 'ring-[#10A9C7] border-[#10A9C7]' : 'ring-transparent'">
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3">
                  <div class="h-10 w-10 grid place-items-center rounded-lg"
                       :class="verificationMethod==='myinfo' ? 'bg-[#10A9C7]/10' : 'bg-gray-100 dark:bg-gray-700'">
                    <svg class="h-5 w-5 text-[#10A9C7]" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">
                      Verify with MyInfo Business
                      <span class="ml-2 align-middle text-[11px] px-2 py-0.5 rounded-full bg-[#FF7A5C]/10 text-[#FF7A5C]">Instant</span>
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Log in with Singpass and retrieve business details.</p>
                  </div>
                </div>
                <span class="mt-1 h-5 w-5 rounded-full border dark:border-gray-600 grid place-items-center"
                      :class="verificationMethod==='myinfo' ? 'border-[#10A9C7]' : 'border-gray-300'">
                  <span class="h-2.5 w-2.5 rounded-full" :class="verificationMethod==='myinfo' ? 'bg-[#10A9C7]' : 'bg-transparent'"></span>
                </span>
              </div>
              <div v-if="verificationMethod==='myinfo' && step===2" class="mt-3">
                <button type="button" @click="handleMyInfo"
                        class="inline-flex items-center gap-2 rounded-lg bg-[#10A9C7] px-4 py-2 text-white font-medium hover:opacity-95">
                  Continue with Singpass
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </button>

            <!-- Manual -->
            <button type="button" @click="setVerification('manual')"
                    class="w-full text-left rounded-xl border p-4 transition
                           bg-white border-gray-200 hover:border-[#10A9C7]/50
                           dark:bg-gray-800 dark:border-gray-700 ring-2"
                    :class="verificationMethod==='manual' ? 'ring-[#10A9C7] border-[#10A9C7]' : 'ring-transparent'">
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3">
                  <div class="h-10 w-10 grid place-items-center rounded-lg"
                       :class="verificationMethod==='manual' ? 'bg-[#10A9C7]/10' : 'bg-gray-100 dark:bg-gray-700'">
                    <svg class="h-5 w-5 text-[#10A9C7]" viewBox="0 0 24 24" fill="none">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M14.06 4.94l3.75 3.75 1.06-1.06a2.5 2.5 0 000-3.54l-.21-.21a2.5 2.5 0 00-3.54 0l-1.06 1.06z" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">Verify by completing a form manually</p>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Upload BizFile+ and ID; our team will review.</p>
                  </div>
                </div>
                <span class="mt-1 h-5 w-5 rounded-full border dark:border-gray-600 grid place-items-center"
                      :class="verificationMethod==='manual' ? 'border-[#10A9C7]' : 'border-gray-300'">
                  <span class="h-2.5 w-2.5 rounded-full" :class="verificationMethod==='manual' ? 'bg-[#10A9C7]' : 'bg-transparent'"></span>
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- FORM -->
        <form class="mt-5 space-y-4" @submit.prevent="onSubmit" novalidate>
          <!-- STEP 1: Seller + Manual only -->
          <div v-if="role==='seller' && verificationMethod==='manual' && step===1" class="space-y-3">
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
                <span class="text-xs text-gray-500">{{ uen.length }}/10</span>
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
                     placeholder="Address (e.g., APT BLK 123A GREENLAND DRIVE 10)" />
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
                               dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                  <input type="file" class="hidden" @change="onUpload" accept=".pdf,.jpg,.jpeg,.png" />
                  <svg class="h-4 w-4 text-[#10A9C7]" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                  <span>Upload</span>
                </label>
                <span v-if="licenseFileName" class="ml-2 text-sm text-gray-600 dark:text-gray-300">{{ licenseFileName }}</span>
              </div>
              <p v-if="invalid(licenseValid)" class="text-xs text-red-500 mt-1">Please upload your BizFile+ / license</p>
            </div>

            <label class="mt-1 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" v-model="termsAccepted" class="mt-0.5">
              <span>I agree to the <a class="text-[#10A9C7] hover:underline" href="#" target="_blank">Terms & Conditions</a>.</span>
            </label>
            <p v-if="invalid(termsValid)" class="text-xs text-red-500">You must agree to the Terms</p>

            <div class="flex justify-end pt-2">
              <button type="button" @click="goNextFromManual"
                      class="inline-flex items-center gap-2 rounded-lg bg-[#10A9C7] px-5 py-2.5 text-white font-semibold hover:opacity-95">
                Next
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- STEP 2: Account details (everyone) -->
          <div v-if="step===2" class="space-y-3">
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
              <select v-model="gender"
                      class="w-full rounded-lg px-4 py-3 border bg-gray-50 border-gray-200 text-gray-700
                             dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
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

            <!-- Actions -->
            <div class="flex items-center justify-between pt-2" v-if="role==='seller' && verificationMethod==='manual'">
              <button type="button" @click="step=1"
                      class="rounded-lg px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700
                             dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                Back
              </button>
              <button type="submit" :disabled="!canSubmit || loading"
                      class="rounded-lg bg-[#FF7A5C] px-5 py-2.5 text-white font-semibold
                             hover:opacity-95 disabled:bg-gray-300 disabled:cursor-not-allowed">
                <span v-if="!loading">Sign up</span><span v-else>Creating account…</span>
              </button>
            </div>

            <div class="pt-2" v-else>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { registerUserWithUsername } from '../firebase/auth/authService'

const router = useRouter()

/* Step control */
const step = ref(2) // default for buyer / myinfo. For seller+manual we switch to 1.
function setRole(v){ role.value=v; fixStep() }
function setVerification(v){ verificationMethod.value=v; fixStep() }
function fixStep(){
  step.value = (role.value==='seller' && verificationMethod.value==='manual') ? 1 : 2
}

/* Role & verification */
const role = ref('buyer')
const verificationMethod = ref('myinfo')

/* Manual step fields */
const companyName = ref('')
const uen = ref('')
const postalCode = ref('')
const addressLine = ref('')
const unitNo = ref('')
const licenseFile = ref(null)
const licenseFileName = ref('')
const termsAccepted = ref(false)
const triedSubmit = ref(false)
function onUpload(e){ const f=e.target.files?.[0]; licenseFile.value=f||null; licenseFileName.value=f?.name||'' }

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
const errorMsg = ref('')

/* Validations */
const usernameValid = computed(()=>/^[A-Za-z0-9]{8,20}$/.test(username.value.trim()))
const emailValid = computed(()=>/\S+@\S+\.\S+/.test(email.value))
const passwordStrong = computed(()=>/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(password.value))
const phoneValid = computed(()=>{ const v=phone.value.trim(); if(!v) return true; return /^(?:\+65\s*)?[89]\d{7}$/.test(v) })
const birthdayValid = computed(()=>{ if(!birthday.value) return true; const b=new Date(birthday.value), t=new Date(); let a=t.getFullYear()-b.getFullYear(); const before=t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()); if(before) a--; return a>=18 })

const companyNameValid = computed(()=>companyName.value.trim().length>0 && companyName.value.trim().length<=100)
const uenValid = computed(() => uen.value.trim().length > 0)
const postalValid = computed(()=>/^\d{6}$/.test(postalCode.value.trim()))
const addressLineValid = computed(()=>addressLine.value.trim().length>0)
const licenseValid = computed(()=>!!licenseFile.value)
const termsValid = computed(()=>termsAccepted.value===true)
const invalid = (rule)=> triedSubmit.value && !rule

/* Step 1 gate */
const manualOk = computed(()=>{
  if(!(role.value==='seller' && verificationMethod.value==='manual')) return true
  return companyNameValid.value && uenValid.value && postalValid.value && addressLineValid.value && licenseValid.value && termsValid.value
})

function goNextFromManual(){
  triedSubmit.value = true
  if(!manualOk.value) return
  step.value = 2
}

/* reCAPTCHA */
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
const captchaToken = ref(''); const captchaError = ref(false)
let widgetId = null; let themeObserver
const currentTheme = () => document.documentElement.classList.contains('dark') ? 'dark' : 'light'
function resetRecaptcha(){ if(window.grecaptcha && widgetId!==null) window.grecaptcha.reset(widgetId); captchaToken.value='' }
function loadRecaptchaScript(){ return new Promise((res,rej)=>{ if(window.grecaptcha?.render) return res(); const s=document.createElement('script'); s.src='https://www.google.com/recaptcha/api.js?render=explicit'; s.async=true; s.defer=true; s.onload=()=>res(); s.onerror=()=>rej(new Error('recaptcha/script-failed')); document.head.appendChild(s) }) }
function renderRecaptcha(){ widgetId = window.grecaptcha.render('recaptcha-container',{ sitekey:recaptchaSiteKey, theme:currentTheme(), callback:(t)=>{captchaToken.value=t; captchaError.value=false}, 'expired-callback':()=>{captchaToken.value=''; captchaError.value=true} }) }
const validateCaptcha = ()=>{ if(!captchaToken.value){ captchaError.value=true; return false } return true }

/* Lifecycle */
onMounted(async ()=>{
  fixStep()
  if(!recaptchaSiteKey) return
  await loadRecaptchaScript(); renderRecaptcha()
  themeObserver = new MutationObserver(()=>{ const el=document.getElementById('recaptcha-container'); if(!el||!window.grecaptcha) return; el.innerHTML=''; widgetId=null; captchaToken.value=''; renderRecaptcha() })
  themeObserver.observe(document.documentElement,{attributes:true, attributeFilter:['class']})
})
onBeforeUnmount(()=>{ themeObserver?.disconnect(); resetRecaptcha() })

/* Submit */
function handleMyInfo(){ /* start Singpass/MyInfo flow here */ }

const canSubmit = computed(()=>(
  usernameValid.value && emailValid.value && passwordStrong.value &&
  phoneValid.value && birthdayValid.value && displayName.value.trim().length>0 &&
  (role.value!=='seller' || verificationMethod.value!=='manual' || manualOk.value)
))

async function onSubmit(){
  if(step.value!==2) return
  if(!canSubmit.value || loading.value) return
  if(!validateCaptcha()) return

  loading.value = true; errorMsg.value=''
  try{
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
        verificationMethod: role.value==='seller' ? verificationMethod.value : null,
        ...(role.value==='seller' && verificationMethod.value==='manual'
          ? { companyName: companyName.value.trim(), uen: uen.value.trim(),
              postalCode: postalCode.value.trim(), addressLine: addressLine.value.trim(),
              unitNo: unitNo.value.trim() || null, licenseFileName: licenseFileName.value }
          : { uen: role.value==='seller' ? null : null }),
      },
      captchaToken: captchaToken.value
    })
    resetRecaptcha()
    router.push('/')
  }catch(err){
    console.error(err)
    errorMsg.value = mapError(err)
    resetRecaptcha()
  }finally{ loading.value=false }
}

function mapError(err){
  const code = err?.code || err?.message || ''
  if (code.includes('username-already-in-use')) return 'Username has been taken.'
  if (code.includes('invalid-username')) return 'Username must be 8–20 alphanumeric characters.'
  if (code.includes('email-already-in-use')) return 'This email is already registered.'
  if (code.includes('invalid-email')) return 'Please enter a valid email.'
  if (code.includes('weak-password')) return 'Password must be stronger.'
  if (code.includes('captcha')) return 'Please complete the reCAPTCHA.'
  return 'Something went wrong. Please try again.'
}
</script>