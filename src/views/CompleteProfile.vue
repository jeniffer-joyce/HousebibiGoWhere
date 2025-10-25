<template>
  <div class="min-h-[70vh] flex items-center justify-center py-10 px-4">
    <div class="w-full max-w-3xl bg-background-light dark:bg-background-dark rounded-xl border border-black/5 dark:border-white/10 p-6 sm:p-8">
    <!-- Role toggle - only show if NOT pre-selected -->
    <div v-if="!rolePreSelected" class="flex gap-3">
      <button
        type="button"
        :class="role==='buyer' ? activeTab : inactiveTab"
        @click="role='buyer'">I'm a Buyer</button>
      <button
        type="button"
        :class="role==='seller' ? activeTab : inactiveTab"
        @click="role='seller'">I'm a Seller</button>
    </div>

    <!-- ✅ Show role badge when locked -->
    <div v-else class="mb-6">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
        <span class="font-medium">
          {{ role === 'buyer' ? '🛍️ Completing Buyer Registration' : '🏪 Completing Seller Registration' }}
        </span>
      </div>
    </div>

      <!-- SELLER -->
      <form v-if="role==='seller'" class="mt-6 space-y-6" @submit.prevent="onSubmit">
        <!-- SingPass Verification (Seller only) -->
        <section v-if="role==='seller'">
          <h2 class="text-base font-semibold">Business Verification</h2>
          <p class="mt-1 text-sm text-background-dark/70 dark:text-background-light/70">
            Verify your business details via SingPass for faster registration.
          </p>
          
          <div class="mt-4">
            <button
              type="button"
              @click="showSingPassModal = true"
              class="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
              <span>🇸🇬 Verify with SingPass</span>
            </button>
            
            <div v-if="isSingPassVerified" class="mt-2 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <p class="text-sm text-green-800 dark:text-green-200">
                ✓ Verified: {{ verifiedBusinessData.businessName }}
              </p>
            </div>
          </div>
        </section>
        <section>
          <h2 class="text-base font-semibold">Business Information</h2>
          <p class="mt-1 text-sm text-background-dark/70 dark:text-background-light/70">
            Please provide your business details for verification. All details will be verified via SingPass and ACRA.
          </p>

          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- NRIC/FIN -->
            <div>
              <label class="block text-sm font-medium mb-1">NRIC/FIN</label>
              <input
                type="text"
                v-model.trim="nric"
                @input="nric = (nric || '').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,9)"
                @blur="t.nric=true"
                placeholder="e.g., S1234567A"
                maxlength="9"
                class="w-full rounded-lg border px-3 py-2"
                :class="t.nric && !nricValid ? 'border-red-400' : ''"
              />
              <div class="flex justify-between text-xs mt-1">
                <span v-if="t.nric && !nricValid" class="text-red-600">Enter a valid NRIC/FIN.</span>
                <span class="text-background-dark/60 dark:text-background-light/60">{{ (nric||'').length }}/9</span>
              </div>
            </div>

            <!-- Registered Company Name -->
            <div>
              <label class="block text-sm font-medium mb-1">Registered Company Name</label>
              <input
                type="text"
                v-model.trim="companyName"
                @input="companyName = (companyName || '').slice(0,100)"
                @blur="t.companyName=true"
                placeholder="Company Name"
                maxlength="100"
                class="w-full rounded-lg border px-3 py-2"
                :class="t.companyName && !companyNameValid ? 'border-red-400' : ''"
              />
              <div class="flex justify-between text-xs mt-1">
                <span v-if="t.companyName && !companyNameValid" class="text-red-600">Company name is required.</span>
                <span class="text-background-dark/60 dark:text-background-light/60">{{ (companyName||'').length }}/100</span>
              </div>
            </div>

            <!-- UEN -->
            <div>
              <label class="block text-sm font-medium mb-1">Business License Number/UEN</label>
              <input
                type="text"
                v-model.trim="uen"
                @input="uen = (uen || '').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,20)"
                @blur="t.uen=true"
                placeholder="UEN"
                maxlength="20"
                class="w-full rounded-lg border px-3 py-2"
                :class="t.uen && !uenValid ? 'border-red-400' : ''"
              />
              <div class="flex justify-between text-xs mt-1">
                <span v-if="t.uen && !uenValid" class="text-red-600">UEN is required.</span>
                <span class="text-background-dark/60 dark:text-background-light/60">{{ (uen||'').length }}/20</span>
              </div>
            </div>
          </div>

          <!-- Address (SELLER ONLY) -->
          <div class="mt-4">
            <h3 class="text-sm font-semibold">Registered Company Address</h3>
            <div class="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  inputmode="numeric"
                  v-model.trim="postalCode"
                  @input="postalCode = (postalCode || '').replace(/\D/g,'').slice(0,6)"
                  @blur="t.postalCode=true"
                  placeholder="Postal Code (e.g. 123456)"
                  maxlength="6"
                  class="w-full rounded-lg border px-3 py-2"
                  :class="t.postalCode && !postalValid ? 'border-red-400' : ''"
                />
                <p v-if="t.postalCode && !postalValid" class="text-xs text-red-600 mt-1">Enter a 6-digit postal code.</p>
              </div>
              <div class="sm:col-span-2">
                <input
                  type="text"
                  v-model.trim="addressLine"
                  @blur="t.addressLine=true"
                  placeholder="Address (e.g., BLK 123A GREENLAND DRIVE 10)"
                  class="w-full rounded-lg border px-3 py-2"
                  :class="t.addressLine && !addressLineValid ? 'border-red-400' : ''"
                />
                <p v-if="t.addressLine && !addressLineValid" class="text-xs text-red-600 mt-1">Address is required.</p>
              </div>
              <div class="sm:col-span-3">
                <input
                  type="text"
                  v-model.trim="unitNo"
                  placeholder="Unit No (e.g., #10-234)"
                  class="w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>
          </div>

          <!-- License -->
          <div class="mt-4">
            <h3 class="text-sm font-semibold">Business License Document</h3>
            <div class="mt-2 flex items-center gap-3">
              <label class="inline-flex items-center">
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" @change="onPickLicense" class="hidden" ref="fileInput" />
                <button type="button" @click="$refs.fileInput.click()" class="px-3 py-2 rounded-lg border">+ Upload</button>
              </label>
              <span class="text-sm" v-if="licenseFileName">{{ licenseFileName }}</span>
            </div>
            <p class="text-xs text-background-dark/60 dark:text-background-light/60 mt-1">PDF, JPG, or PNG. Max 5MB.</p>
            <p v-if="t.license && !licenseValid" class="text-xs text-red-600 mt-1">Please upload your BizFile+ / license.</p>
            <p v-if="uploadErr" class="text-xs text-red-600 mt-1">{{ uploadErr }}</p>

            <label class="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="agree" @change="t.agree=true" />
              <span>I agree to the Terms &amp; Conditions.</span>
            </label>
            <p v-if="t.agree && !agreeValid" class="text-xs text-red-600 mt-1">You must agree to continue.</p>
          </div>
        </section>

        <!-- Account Details -->
        <section>
          <h2 class="text-base font-semibold mt-2">Account Details</h2>
          <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <input
                v-model.trim="username"
                @blur="t.username=true"
                placeholder="Username"
                class="rounded-lg border px-3 py-2 w-full"
                :class="t.username && !usernameValid ? 'border-red-400' : ''" />
              <p v-if="t.username && !usernameValid" class="text-xs text-red-600 mt-1">
                Username must be 8–20 letters or numbers.
              </p>
            </div>

            <div>
              <input v-model.trim="email" placeholder="Email" class="w-full rounded-lg border px-3 py-2 bg-gray-100 opacity-80 cursor-not-allowed" disabled />
            </div>

            <div>
              <input
                v-model.trim="displayName"
                @blur="t.displayName=true"
                placeholder="Full Name"
                class="rounded-lg border px-3 py-2 w-full"
                :class="t.displayName && !displayNameValid ? 'border-red-400' : ''" />
              <p v-if="t.displayName && !displayNameValid" class="text-xs text-red-600 mt-1">Full name is required.</p>
            </div>

            <select v-model="gender" class="rounded-lg border px-3 py-2">
              <option value="" disabled>Gender</option>
              <option>Female</option>
              <option>Male</option>
              <option>Prefer not to say</option>
              <option>Other</option>
            </select>

            <input
              type="date"
              v-model="birthday"
              @blur="t.birthday=true"
              class="rounded-lg border px-3 py-2"
              :class="t.birthday && !birthdayValid ? 'border-red-400' : ''" />
            <p v-if="t.birthday && !birthdayValid" class="text-xs text-red-600 sm:col-span-2 -mt-2">
              You must be at least 18 years old.
            </p>

            <input
              v-model.trim="phone"
              @blur="t.phone=true"
              placeholder="SG Phone Number"
              class="rounded-lg border px-3 py-2 sm:col-span-2"
              :class="t.phone && phone && !phoneValid ? 'border-red-400' : ''" />
            <p v-if="t.phone && phone && !phoneValid" class="text-xs text-red-600 -mt-3 sm:col-span-2">
              Use SG format (+65 optional), starting with 8 or 9 (8 digits).
            </p>
          </div>
        </section>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex items-center gap-3">
          <button
            type="submit"
            class="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-60"
            :disabled="isCompleted || isSaving || !formOk"
          >
            <span v-if="!isCompleted && !isSaving">Save and Continue</span>
            <span v-else-if="isSaving">Saving…</span>
            <span v-else>Completed</span>
          </button>
        </div>

        <div v-if="done" class="rounded-lg bg-green-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 p-3 text-sm mt-2">
          Registration complete! You can proceed to your Seller page.
        </div>
      </form>

      <!-- BUYER -->
      <form v-else class="mt-6 space-y-6" @submit.prevent="onSubmit">
        <h2 class="text-base font-semibold">Account Details</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <input
              v-model.trim="username"
              @blur="t.username=true"
              placeholder="Username"
              class="rounded-lg border px-3 py-2 w-full"
              :class="t.username && !usernameValid ? 'border-red-400' : ''" />
            <p v-if="t.username && !usernameValid" class="text-xs text-red-600 mt-1">
              Username must be 8–20 letters or numbers.
            </p>
          </div>

          <div class="sm:col-span-2">
            <input v-model.trim="email" placeholder="Email" class="w-full rounded-lg border px-3 py-2 bg-gray-100 opacity-80 cursor-not-allowed" disabled />
          </div>

          <div class="sm:col-span-2">
            <input
              v-model.trim="displayName"
              @blur="t.displayName=true"
              placeholder="Full Name"
              class="rounded-lg border px-3 py-2 w-full"
              :class="t.displayName && !displayNameValid ? 'border-red-400' : ''" />
            <p v-if="t.displayName && !displayNameValid" class="text-xs text-red-600 mt-1">Full name is required.</p>
          </div>

          <select v-model="gender" class="rounded-lg border px-3 py-2">
            <option value="" disabled>Gender</option>
            <option>Female</option>
            <option>Male</option>
            <option>Prefer not to say</option>
            <option>Other</option>
          </select>

          <input
            type="date"
            v-model="birthday"
            @blur="t.birthday=true"
            class="rounded-lg border px-3 py-2"
            :class="t.birthday && !birthdayValid ? 'border-red-400' : ''" />
          <p v-if="t.birthday && !birthdayValid" class="text-xs text-red-600 sm:col-span-2 -mt-2">
            You must be at least 18 years old.
          </p>

          <input
            v-model.trim="phone"
            @blur="t.phone=true"
            placeholder="SG Phone Number"
            class="rounded-lg border px-3 py-2 sm:col-span-2"
            :class="t.phone && phone && !phoneValid ? 'border-red-400' : ''" />
          <p v-if="t.phone && phone && !phoneValid" class="text-xs text-red-600 -mt-3 sm:col-span-2">
            Use SG format (+65 optional), starting with 8 or 9 (8 digits).
          </p>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex items-center gap-3">
          <button
            type="submit"
            :disabled="isSaving || isCompleted || !formOk"
            class="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-60">
            <span v-if="!isSaving && !isCompleted">Save and Continue</span>
            <span v-else-if="isSaving">Saving…</span>
            <span v-else>Completed</span>
          </button>
          <button v-if="done" type="button" @click="goToRoleHome()" class="px-4 py-2 rounded-lg border">
            Go to Buyer page
          </button>
        </div>

        <div v-if="done" class="rounded-lg bg-green-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 p-3 text-sm mt-2">
          Registration complete! You can proceed to your Buyer page.
        </div>
      </form>
    </div>
  </div>
  <!-- SingPass Modal -->
<SingPassVerificationModal 
  :show="showSingPassModal"
  @close="showSingPassModal = false"
  @verified="handleSingPassVerified"
/>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { user } from '@/store/user.js'
import { useRouter } from 'vue-router'
import { auth, db } from '@/firebase/firebase_config'
import {
  doc, getDoc, setDoc, serverTimestamp, deleteField
} from 'firebase/firestore'
import { uploadBusinessLicense } from '@/firebase/services/fileUpload.js'
import SingPassVerificationModal from '@/components/SingPassVerificationModal.vue'
import { markBusinessAsRegistered } from '@/firebase/services/singpassVerification.js'
import { useToast } from '@/composables/useToast'
const { success, error:toastError } = useToast()

// Add these refs
const showSingPassModal = ref(false)
const verifiedBusinessData = ref(null)
const isSingPassVerified = ref(false)

const router = useRouter()

const activeTab = 'px-4 py-2 rounded-lg bg-primary text-white'
const inactiveTab = 'px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#0b1220]'

// core state
const uid = ref(null)
const role = ref('buyer')
const rolePreSelected = ref(false)  // ✅ Add this if missing
const username = ref('')
const email = ref('')
const displayName = ref('')
const phone = ref('')
const birthday = ref('')
const gender = ref('')

/* Seller-only fields */
const postalCode = ref('')
const addressLine = ref('')
const unitNo = ref('')
const nric = ref('')
const companyName = ref('')
const uen = ref('')
const licenseFile = ref(null)
const licenseFileName = ref('')
const agree = ref(false)

const isSaving = ref(false)
const isCompleted = ref(false)
const done = ref(false)
const error = ref('')
const uploadErr = ref('')

// touched fields
const t = ref({
  username: false, displayName: false, birthday: false, phone: false,
  postalCode: false, addressLine: false, nric: false,
  companyName: false, uen: false, license: false, agree: false,
})

// validators
const usernameValid = computed(()=>/^[A-Za-z0-9]{8,20}$/.test((username.value||'').trim()))
const emailValid = computed(()=>/\S+@\S+\.\S+/.test(email.value||''))
const displayNameValid = computed(()=> (displayName.value||'').trim().length>0)
const phoneValid = computed(()=>{
  const v=(phone.value||'').trim()
  return !v || /^(?:\+65\s*)?[89]\d{7}$/.test(v)
})
const birthdayValid = computed(()=>{
  if(!birthday.value) return false
  const b = new Date(birthday.value)
  if(Number.isNaN(+b)) return false
  const tday=new Date()
  let age=tday.getFullYear()-b.getFullYear()
  const before=(tday.getMonth()<b.getMonth())||(tday.getMonth()===b.getMonth()&&tday.getDate()<b.getDate())
  if(before) age--
  return age>=18
})
const postalValid=computed(()=>/^\d{6}$/.test((postalCode.value||'').trim()))
const addressLineValid=computed(()=> (addressLine.value||'').trim().length>0)
const nricValid=computed(()=>/^(?:(?:S|T|F|G|M)\d{7}[A-Z])$/.test((nric.value||'').trim()))
const companyNameValid=computed(()=> (companyName.value||'').trim().length>0)
const uenValid=computed(()=> (uen.value||'').trim().length>0)
const licenseValid=computed(()=> !!licenseFile.value)
const agreeValid=computed(()=> !!agree.value)

const formOk=computed(()=>{
  const common=usernameValid.value&&emailValid.value&&displayNameValid.value&&birthdayValid.value&&phoneValid.value
  if(!common) return false
  if(role.value==='buyer') return true
  return postalValid.value&&addressLineValid.value&&nricValid.value&&companyNameValid.value&&uenValid.value&&licenseValid.value&&agreeValid.value
})

// load current user
onMounted(async()=>{
  const u=auth.currentUser
  if(!u) return router.push('/login/')
  uid.value=u.uid
  email.value=u.email||''
  displayName.value=u.displayName||''
  
  const snap=await getDoc(doc(db,'users',u.uid))
  if(snap.exists()){
    const d=snap.data()
    
    // ✅ Check if profile is actually complete
    if(d.role && d.username && d.profileComplete === true) {
      // Profile is complete - redirect to home
      return goToRoleHome(d.role)
    }
    
    // ✅ If user has a role saved in Firestore, lock the toggle
    if(d.role) {
      role.value = d.role
      rolePreSelected.value = true
      console.log('🔒 Role locked from Firestore:', d.role)
    } else {
      rolePreSelected.value = false
      console.log('🆕 No role saved - toggle enabled')
    }
    
    username.value=d.username||''
    phone.value=d.phone||''
    birthday.value=d.birthday||''
    gender.value=d.gender||''
    postalCode.value=d.postalCode||''
    addressLine.value=d.addressLine||''
    unitNo.value=d.unitNo||''
    nric.value=d.nric||''
    companyName.value=d.companyName||''
    uen.value=d.uen||''
    licenseFileName.value=d.licenseFileName||''
  }
})

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
  
  success('✅ Your business details have been verified and pre-filled!')
}
// handlers
function onPickLicense(e){
  const f=e.target.files?.[0]
  t.value.license=true
  if(!f){licenseFile.value=null;licenseFileName.value='';return}
  if(f.size>5*1024*1024){uploadErr.value='File too large (max 5MB).';return}
  uploadErr.value=''
  licenseFile.value=f
  licenseFileName.value=f.name
}

async function onSubmit(){
  try{
    error.value=''
    isSaving.value=true
    if(!formOk.value)throw new Error('form/invalid')

    const uname=username.value.trim().toLowerCase()
    let uploadedURL=''
    if(role.value==='seller'&&licenseFile.value)
      uploadedURL=await uploadBusinessLicense(licenseFile.value,uid.value)

    // ✅ Generate default avatar if not already set
    const defaultAvatar = `${encodeURIComponent(displayName.value || username.value)}&background=0D8ABC&color=fff&size=200`

    // Base payload (fields common to both roles)
    const payload = {
      uid: uid.value,
      username: uname,
      role: role.value,
      displayName: displayName.value.trim(),
      email: email.value,
      phone: phone.value.trim(),
      birthday: birthday.value,
      gender: gender.value,
      photoURL: defaultAvatar,  // ✅ Add this
      profileComplete: true,
      createdAt: serverTimestamp(),
    }

    // ... rest of your code

    if(role.value==='seller'){
      // include seller-only fields
      payload.postalCode = postalCode.value.trim()
      payload.addressLine = addressLine.value.trim()
      payload.unitNo = unitNo.value.trim()
      payload.nric = nric.value.trim().toUpperCase()
      payload.companyName = companyName.value.trim()
      payload.uen = uen.value.trim()
      payload.licenseFileName = licenseFileName.value
      payload.licenseFileURL = uploadedURL
    } else {
      // ensure seller-only fields DO NOT exist for buyers
      payload.postalCode = deleteField()
      payload.addressLine = deleteField()
      payload.unitNo = deleteField()
      payload.nric = deleteField()
      payload.companyName = deleteField()
      payload.uen = deleteField()
      payload.licenseFileName = deleteField()
      payload.licenseFileURL = deleteField()
    }

    await setDoc(doc(db,'users',uid.value),payload,{merge:true})
    
    // ✅ Mark SingPass verification as registered for sellers
    if (role.value === 'seller' && isSingPassVerified.value && nric.value) {
      try {
        console.log('🔗 Marking SingPass verification as registered...')
        await markBusinessAsRegistered(nric.value, {
          email: email.value,
          username: uname,
          uid: uid.value
        })
        console.log('✅ SingPass verification marked as registered')
      } catch (verificationError) {
        console.error('⚠️ Failed to update verification record:', verificationError)
      }
    }
    
    done.value = true
    isCompleted.value = true

    // ✅ Auto-redirect based on role (NO RELOAD!)
    setTimeout(async () => {
      if (role.value === 'seller') {
        // ✅ Seller - trigger onboarding modal (same as Signup.vue)
        console.log('🎯 Seller profile complete - triggering onboarding...')
        
        // Small delay to ensure Firestore save completes
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Set the flag that App.vue watches
        user.needsOnboarding = true
        console.log('✅ needsOnboarding set to:', user.needsOnboarding)
        
        // Give the watcher time to react
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Navigate home where modal will show (NO RELOAD)
        await router.push('/')
      } else {
        // ✅ Buyer - hard reload to show preferences
        console.log('👤 Buyer profile complete - reloading...')
        await router.push('/')
        
        // Small delay then reload
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    }, 1500)
    
  }catch(e){
    console.error(e)
    error.value='Could not save profile.'
  }finally {
    isSaving.value = false
  }
}

function goToRoleHome(roleOverride){
  const r=roleOverride||role.value
  router.push(r==='seller'?'/seller-profile/':'/')
}
</script>
