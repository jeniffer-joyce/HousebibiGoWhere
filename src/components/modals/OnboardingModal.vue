<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div class="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          
          <!-- Header -->
          <div class="px-8 py-6 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span class="text-2xl">🎉</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome to HouseBibiGoWhere!</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">Let's set up your business profile</p>
              </div>
            </div>
          </div>

          <!-- Form - Now includes footer -->
          <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto flex flex-col">
            
            <!-- Form Content -->
            <div class="px-8 py-6 space-y-6 flex-1">
              <!-- Business Name (Pre-filled from SingPass) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.businessName"
                  type="text"
                  disabled
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  ✓ Verified from your SingPass registration
                </p>
              </div>

              <!-- Business Address (Pre-filled from SingPass) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Address <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.address"
                  type="text"
                  disabled
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  ✓ Verified from your SingPass registration
                </p>
              </div>

              <!-- Business Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Category <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.category"
                  required
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/40 focus:border-primary">
                  <option value="" disabled>Select your business category</option>
                  <option value="food-and-beverages">🍕 Food & Beverages</option>
                  <option value="handmade-crafts">🎨 Handmade Crafts</option>
                  <option value="home-decor">🏠 Home Decor</option>
                  <option value="personalized-gifts">🎁 Personalized Gifts</option>
                  <option value="clothing-and-accessories">👕 Clothing & Accessories</option>
                  <option value="other">📦 Other</option>
                </select>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This helps customers discover your business
                </p>
              </div>

              <!-- Business Bio -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Tagline <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="form.bio"
                  required
                  rows="2"
                  maxlength="150"
                  placeholder="e.g., 'Handmade crafts with love since 2020' or 'Fresh baked goods daily'"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary/40 resize-none"
                ></textarea>
                <div class="flex justify-between items-center mt-1">
                  <p class="text-xs text-gray-500 dark:text-gray-400">A short description that appears on your profile</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ form.bio.length }}/150</p>
                </div>
              </div>

              <!-- Business Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detailed Description (Optional)
                </label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  maxlength="500"
                  placeholder="Tell customers more about your business, what makes you unique, your story..."
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary/40 resize-none"
                ></textarea>
                <div class="flex justify-between items-center mt-1">
                  <p class="text-xs text-gray-500 dark:text-gray-400">This will be displayed on your detailed business page</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ form.description.length }}/500</p>
                </div>
              </div>

              <!-- Profile Picture/Logo -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Logo (Optional)
                </label>
                
                <!-- Preview or Upload Area -->
                <div v-if="!logoPreview" class="relative">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleLogoUpload"
                    class="hidden"
                  />
                  
                  <div
                    @click="$refs.fileInput.click()"
                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div class="flex flex-col items-center gap-3">
                      <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span class="text-3xl">🏢</span>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Click to upload your business logo
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          PNG, JPG up to 5MB (square images work best)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Logo Preview -->
                <div v-else class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <img :src="logoPreview" alt="Logo preview" class="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" />
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">Logo uploaded</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ logoFileName }}</p>
                  </div>
                  <button
                    type="button"
                    @click="clearLogo"
                    class="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>

                <!-- Upload Progress -->
                <div v-if="uploading" class="mt-3">
                  <div class="flex items-center justify-between text-sm mb-2">
                    <span class="text-gray-600 dark:text-gray-400">Uploading...</span>
                    <span class="text-gray-900 dark:text-white font-medium">{{ uploadProgress }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div class="bg-primary h-full transition-all" :style="{ width: uploadProgress + '%' }"></div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Footer Button - Now INSIDE the form -->
            <div class="flex items-center justify-between gap-3 px-8 py-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <button
                type="submit"
                :disabled="saving || !isFormValid"
                class="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <span v-if="saving" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
                <span>{{ saving ? 'Saving...' : 'Complete Setup' }}</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>


<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { db, auth, storage } from '@/firebase/firebase_config.js'
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { user } from '@/store/user.js'
import { markBusinessAsRegistered } from '@/firebase/services/singpassVerification.js'
import { useToast } from '@/composables/useToast'
const { success, error:toastError } = useToast()

const props = defineProps({
  show: Boolean,
  verifiedData: Object // Keep existing prop
})

const prefilledData = computed(() => {
  if (props.verifiedData) {
    return props.verifiedData
  }
  // ✅ Fallback to store onboarding data from signup
  return user.onboardingData || {}
})


const emit = defineEmits(['close', 'complete'])

const form = reactive({
  businessName: '', // ✅ ADD THIS
  category: '',
  bio: '',
  description: '',
  address: '', // ✅ ADD THIS
  profilePic: null
})

// ✅ ADD THIS - Initialize form with prefilled data
// ✅ BETTER INITIALIZATION in onMounted
onMounted(() => {
  console.log('🔍 PrefilledData:', prefilledData.value)
  
  if (prefilledData.value) {
    // Try multiple possible keys for business name
    form.businessName = 
      prefilledData.value.businessName || 
      prefilledData.value.name || 
      prefilledData.value.companyName || 
      ''
    
    // For address, use the pre-built full address if available
    form.address = prefilledData.value.address || ''
    
    console.log('✅ Form initialized - businessName:', form.businessName)
    console.log('✅ Form initialized - address:', form.address)
  }
})



const logoPreview = ref(null)
const logoFileName = ref('')
const fileInput = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const saving = ref(false)

const isFormValid = computed(() => {
  return (
    form.businessName && 
    form.businessName.trim().length > 0 && 
    form.category && 
    form.bio.trim().length > 0
  )
})


async function handleLogoUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toastError('Please select an image file')
    return
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    toastError('File size must be less than 5MB')
    return
  }

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
  logoFileName.value = file.name

  uploading.value = true
  uploadProgress.value = 0

  try {
    const timestamp = Date.now()
    const fileName = `business-logos/${auth.currentUser.uid}_${timestamp}_${file.name}`
    const imageRef = storageRef(storage, fileName)
    const uploadTask = uploadBytesResumable(imageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        uploadProgress.value = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        )
      },
      (error) => {
        console.error('Upload error:', error)
        toastError('Upload failed. Please try again.')
        uploading.value = false
        clearLogo()
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        form.profilePic = downloadURL
        uploading.value = false
        console.log('✅ Logo uploaded:', downloadURL)
      }
    )
  } catch (error) {
    console.error('Error handling file:', error)
    toastError('Failed to process image')
    uploading.value = false
    clearLogo()
  }
}

function clearLogo() {
  logoPreview.value = null
  logoFileName.value = ''
  form.profilePic = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function handleSubmit() {
  console.log('🔍 === HANDLESUBMIT CALLED ===')
  console.log('📋 isFormValid.value:', isFormValid.value)
  
  if (!isFormValid.value) {
    console.log('❌ VALIDATION FAILED - form is not valid')
    toastError('Please fill in all required fields')
    return
  }

  console.log('✅ Validation passed, proceeding with submission...')
  saving.value = true

  try {
    console.log('🔍 Checking authentication...')
    if (!auth.currentUser) {
      console.log('❌ NO AUTHENTICATED USER - STOPPING')
      toastError('You must be logged in')
      saving.value = false
      return
    }

    const uid = auth.currentUser.uid
    console.log('✅ User authenticated, UID:', uid)

    // ✅ FETCH USER DATA FIRST (before using it)
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (!userDoc.exists()) {
      throw new Error('User document not found')
    }
    const userData = userDoc.data()
    console.log('👤 User document found:', userData)

    // ✅ NOW build updates object with all data
    const updates = {
      uid: uid,
      account_type: 'seller',
      name: form.businessName || userData.username || '',
      category: form.category.trim(),
      bio: form.bio.trim(),
      description: form.description.trim(),
      address: form.address || '',
      featured: false,
      verified: false,
      followers: 0,
      following: 0,
      rating: 0,
      uen: userData.uen || prefilledData.value?.uen || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (form.profilePic) {
      updates.profilePic = form.profilePic
      console.log('📸 Profile picture included')
    }

    console.log('💾 ABOUT TO CALL SETDOC')
    console.log('📍 Document path: businesses/' + uid)
    console.log('📊 Data to write:', JSON.stringify(updates, null, 2))
    
    // Call setDoc
    await setDoc(doc(db, 'businesses', uid), updates, { merge: true })
    
    console.log('✅ SETDOC COMPLETED')

    // ✅ VERIFY THE DOCUMENT ACTUALLY EXISTS
    console.log('🔍 VERIFYING document exists in Firestore...')
    const verifyDoc = await getDoc(doc(db, 'businesses', uid))
    
    if (verifyDoc.exists()) {
      console.log('✅✅✅ VERIFIED: Document exists! Data:', verifyDoc.data())
    } else {
      console.log('❌❌❌ VERIFICATION FAILED: Document does NOT exist in Firestore!')
      throw new Error('Document creation failed - document not found after setDoc')
    }

    // Try to mark SingPass as registered if NRIC exists
    if (userData.nric) {
      try {
        const normalizedNric = userData.nric.trim().toUpperCase()
        console.log('🔗 Calling markBusinessAsRegistered with NRIC:', normalizedNric)
        
        const result = await markBusinessAsRegistered(normalizedNric, {
          uid: uid,
          email: userData.email || auth.currentUser.email,
          username: userData.username
        })
        
        console.log('✅ markBusinessAsRegistered succeeded:', result)
      } catch (verificationError) {
        console.error('⚠️ Error updating SingPass verification:', verificationError.message)
        // Don't throw - continue even if SingPass marking fails
      }
    } else {
      console.warn('⚠️ NO NRIC FOUND IN USER DOCUMENT')
    }

    console.log('✅✅✅ ALL UPDATES COMPLETE ✅✅✅')
    
    // ✅ CLEAR ONBOARDING FLAG
    user.needsOnboarding = false
    user.onboardingData = null
    
    success('✅ Business profile created successfully!')
    
    console.log('⏰ WAITING 2 SECONDS BEFORE RELOAD...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('⏰ NOW RELOADING PAGE...')
    window.location.reload()

  } catch (error) {
    console.error('❌❌❌ ERROR IN HANDLESUBMIT ❌❌❌')
    console.error('Error message:', error.message)
    console.error('Error:', error)
    
    let userMessage = 'Failed to create business profile. '
    if (error.code === 'permission-denied') {
      userMessage += 'Permission denied - check Firestore rules.'
    } else if (error.message) {
      userMessage += error.message
    } else {
      userMessage += 'Please try again.'
    }
    
    toastError(userMessage)
    saving.value = false
  }
}





function skipForNow() {
  const confirmed = confirm('Are you sure you want to skip? You can complete your profile later in settings.')
  if (confirmed) {
    emit('close')
  }
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