<template>
  <section class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile summary -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div class="flex flex-col items-center">
          <div
            class="h-28 w-28 rounded-full bg-cover bg-center border-4 border-primary"
            :style="{ backgroundImage: `url('${avatar || fallbackAvatar}')` }"
          />
          <h3 class="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            {{ form.displayName || '—' }}
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ form.email || '—' }}
          </p>
          
          <!-- Hidden file input -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />
          
          <button
            type="button"
            @click="triggerFileInput"
            :disabled="uploading"
            class="mt-4 w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-opacity"
          >
            {{ uploading ? 'Uploading...' : 'Change Photo' }}
          </button>
          
          <!-- Upload progress -->
          <div v-if="uploading" class="mt-2 w-full">
            <div class="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700">
              <div
                class="bg-primary h-2 rounded-full transition-all duration-300"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
            <p class="text-xs text-center text-slate-500 mt-1">{{ uploadProgress }}%</p>
          </div>
          
          <!-- Upload status messages -->
          <p v-if="uploadSuccess" class="mt-2 text-xs text-emerald-600">{{ uploadSuccess }}</p>
          <p v-if="uploadError" class="mt-2 text-xs text-red-600">{{ uploadError }}</p>
          
          <p class="mt-2 text-xs text-slate-400">Buyer since {{ memberSince }}</p>
        </div>
      </div>

      <!-- Editable form -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Personal Information</h2>
          <button
            type="button"
            @click="toggleEdit"
            class="rounded-lg border border-primary px-4 py-2 text-primary hover:bg-primary/10"
          >
            {{ isEditing ? 'Cancel' : 'Edit Profile' }}
          </button>
        </div>

        <!-- Optional success banners from redirects -->
        <div>
          <p v-if="$route.query.emailChangeSent" class="mb-3 text-sm text-emerald-600">
            We sent a confirmation link to your new email. Please verify to complete the change.
          </p>
          <p v-if="$route.query.emailChanged" class="mb-3 text-sm text-emerald-600">
            Your sign-in email was successfully changed.
          </p>
        </div>

        <form @submit.prevent="save" class="grid grid-cols-1 gap-4">
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
            <input
              v-model.trim="form.username"
              :disabled="!isEditing || saving"
              class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              :class="t.username && !usernameValid ? 'border-red-500' : ''"
              @blur="t.username = true"
              placeholder="e.g. buyertest88"
            />
            <p v-if="t.username && !usernameValid" class="text-xs text-red-600">
              8–20 letters or numbers only.
            </p>
          </div>

          <!-- Display name -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
            <input
              v-model.trim="form.displayName"
              :disabled="!isEditing || saving"
              class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              :class="t.displayName && !displayNameValid ? 'border-red-500' : ''"
              @blur="t.displayName = true"
              placeholder="Full name"
            />
            <p v-if="t.displayName && !displayNameValid" class="text-xs text-red-600">
              Display name is required.
            </p>
          </div>

          <!-- Email (read-only; change via dedicated page) -->
          <div>
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <RouterLink
                v-if="!isGoogle"
                to="/change-email"
                class="text-sm text-primary hover:underline"
              >
                Change email
              </RouterLink>
            </div>
            <input
              v-model.trim="form.email"
              disabled
              class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900 disabled:opacity-70"
            />
            <p v-if="isGoogle" class="text-xs text-slate-500">
              Email is managed by Google Sign-In and cannot be changed here.
            </p>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <input
              v-model.trim="form.phone"
              :disabled="!isEditing || saving"
              class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              :class="t.phone && form.phone && !phoneValid ? 'border-red-500' : ''"
              @blur="t.phone = true"
              placeholder="SG format e.g. +65 9xxxxxxx"
            />
            <p v-if="t.phone && form.phone && !phoneValid" class="text-xs text-red-600">
              Use SG format (+65 optional), starting with 8 or 9 (8 digits).
            </p>
          </div>

          <!-- Gender & Birthday -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select
                v-model="form.gender"
                :disabled="!isEditing || saving"
                class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              >
                <option value="" disabled>Select</option>
                <option>Female</option>
                <option>Male</option>
                <option>Prefer not to say</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Birthday</label>
              <input
                type="date"
                v-model="form.birthday"
                :disabled="!isEditing || saving"
                class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
                :class="t.birthday && !birthdayValid ? 'border-red-500' : ''"
                @blur="t.birthday = true"
              />
              <p v-if="t.birthday && !birthdayValid" class="text-xs text-red-600">
                You must be at least 18 years old.
              </p>
            </div>
          </div>

          <!-- Actions / status -->
          <div class="mt-2 flex items-center gap-3">
            <button
              v-if="isEditing"
              type="submit"
              :disabled="saving || !formOk"
              class="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
            <p v-if="emailNotice" class="text-sm text-emerald-600">{{ emailNotice }}</p>
            <p v-if="success" class="text-sm text-emerald-600">{{ success }}</p>
            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { auth, db, storage } from '@/firebase/firebase_config'
import {
  doc, getDoc, setDoc, serverTimestamp, query, where, getDocs, collection
} from 'firebase/firestore'
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import { user } from '@/store/user.js'

const isEditing = ref(false)
const saving = ref(false)
const success = ref('')
const error = ref('')
const emailNotice = ref('')
const t = ref({ username: false, displayName: false, email: false, phone: false, birthday: false })

// Photo upload states
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadSuccess = ref('')
const uploadError = ref('')
const fileInput = ref(null)

const form = ref({
  username: '',
  displayName: '',
  email: '',
  phone: '',
  gender: '',
  birthday: '',
})
const original = ref(null)
const avatar = ref('')
const fallbackAvatar = '/avatar.png'
const memberSince = ref('—')

const providerId = ref('password')
const isGoogle = computed(() => providerId.value === 'google.com')

const usernameValid = computed(() => /^[A-Za-z0-9]{8,20}$/.test((form.value.username || '').trim()))
const displayNameValid = computed(() => (form.value.displayName || '').trim().length > 0)
const emailValid = computed(() => /\S+@\S+\.\S+/.test(form.value.email || ''))
const phoneValid = computed(() => {
  const v = (form.value.phone || '').trim()
  return !v || /^(?:\+65\s*)?[89]\d{7}$/.test(v)
})
const birthdayValid = computed(() => {
  const v = form.value.birthday
  if (!v) return false
  const b = new Date(v)
  if (Number.isNaN(+b)) return false
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  if (
    now.getMonth() < b.getMonth() ||
    (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())
  )
    age--
  return age >= 18
})
const formOk = computed(
  () =>
    usernameValid.value &&
    displayNameValid.value &&
    emailValid.value &&
    phoneValid.value &&
    birthdayValid.value
)

function resetTouched() {
  t.value = { username: false, displayName: false, email: false, phone: false, birthday: false }
}

function toggleEdit() {
  success.value = ''
  error.value = ''
  emailNotice.value = ''
  if (!isEditing.value) {
    original.value = JSON.parse(JSON.stringify(form.value))
    isEditing.value = true
  } else {
    if (original.value) form.value = { ...original.value }
    resetTouched()
    isEditing.value = false
  }
}

// Photo upload functions
function triggerFileInput() {
  uploadSuccess.value = ''
  uploadError.value = ''
  fileInput.value?.click()
}

async function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Please select an image file.'
    return
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    uploadError.value = 'Image must be less than 5MB.'
    return
  }

  const u = auth.currentUser
  if (!u) {
    uploadError.value = 'You are not signed in.'
    return
  }

  uploading.value = true
  uploadProgress.value = 0
  uploadSuccess.value = ''
  uploadError.value = ''

  try {
    // Delete old photo if it exists and is not the default
    if (avatar.value && !avatar.value.includes('avatar.png')) {
      try {
        // Extract the old filename from the URL
        const oldUrl = avatar.value
        const oldPath = decodeURIComponent(oldUrl.split('/o/')[1]?.split('?')[0] || '')
        if (oldPath && oldPath.startsWith('profile-photos/')) {
          const oldPhotoRef = storageRef(storage, oldPath)
          await deleteObject(oldPhotoRef)
        }
      } catch (deleteError) {
        console.log('No old photo to delete or error deleting:', deleteError)
      }
    }

    // Create a reference to the storage location
    const fileExtension = file.name.split('.').pop()
    const fileName = `profile-photos/${u.uid}.${fileExtension}`
    const photoRef = storageRef(storage, fileName)

    // Upload the file with progress tracking
    const uploadTask = uploadBytesResumable(photoRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Track upload progress
        uploadProgress.value = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
      },
      (uploadError) => {
        // Handle upload errors
        console.error('Upload error:', uploadError)
        uploadError.value = 'Failed to upload image. Please try again.'
        uploading.value = false
      },
      async () => {
        // Upload completed successfully
        try {
          // Get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

          // Update Firebase Auth profile
          await updateProfile(u, {
            photoURL: downloadURL
          })

          // Update Firestore user document
          await setDoc(
            doc(db, 'users', u.uid),
            {
              photoURL: downloadURL,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          )

          // Update local avatar state
          avatar.value = downloadURL
          
          // ✅ Update the user store immediately for instant UI update
          user.avatar = downloadURL

          uploadSuccess.value = 'Photo updated successfully!'
          uploading.value = false
          uploadProgress.value = 0

          // Clear success message after 3 seconds
          setTimeout(() => {
            uploadSuccess.value = ''
          }, 3000)
        } catch (updateError) {
          console.error('Error updating profile:', updateError)
          uploadError.value = 'Failed to update profile. Please try again.'
          uploading.value = false
        }
      }
    )
  } catch (err) {
    console.error('Upload error:', err)
    uploadError.value = 'An error occurred. Please try again.'
    uploading.value = false
  }

  // Clear the file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

onMounted(async () => {
  await auth.currentUser?.reload()
  const u = auth.currentUser
  if (!u) return

  providerId.value = u.providerData?.[0]?.providerId || 'password'
  avatar.value = u.photoURL || ''
  memberSince.value = new Date(u.metadata?.creationTime || Date.now()).toLocaleDateString('en-SG', {
    month: 'long',
    year: 'numeric',
  })

  const snap = await getDoc(doc(db, 'users', u.uid))
  if (snap.exists()) {
    const d = snap.data()
    form.value.username = d.username || ''
    form.value.displayName = d.displayName || u.displayName || ''
    form.value.email = d.email || u.email || ''
    form.value.phone = d.phone || ''
    form.value.gender = d.gender || ''
    form.value.birthday = d.birthday || ''
    
    // Use photoURL from Firestore if available
    if (d.photoURL) {
      avatar.value = d.photoURL
    }
  } else {
    form.value.displayName = u.displayName || ''
    form.value.email = u.email || ''
  }

  // ✅ Hard-sync Firestore email to Auth email every time
  try {
    await auth.currentUser?.reload()
    const u = auth.currentUser
    if (u?.email) {
        await setDoc(doc(db, 'users', u.uid),
        { email: u.email, updatedAt: serverTimestamp() },
        { merge: true }
        )
        form.value.email = u.email
    }
    } catch (e) {
    console.error('Email hard-sync failed:', e)
    }

  original.value = JSON.parse(JSON.stringify(form.value))
})

async function save() {
  t.value = { username: true, displayName: true, email: true, phone: true, birthday: true }
  success.value = ''
  error.value = ''
  emailNotice.value = ''

  if (!formOk.value) {
    error.value = 'Please fix the highlighted fields.'
    return
  }

  const u = auth.currentUser
  if (!u) {
    error.value = 'You are not signed in.'
    return
  }

  saving.value = true
  try {
    const uname = form.value.username.trim().toLowerCase()
    const qUsers = query(collection(db, 'users'), where('username', '==', uname))
    const result = await getDocs(qUsers)
    const taken = result.docs.some((d) => d.id !== u.uid)
    if (taken) throw new Error('username-taken')

    // Update Firebase Auth displayName
    await updateProfile(u, {
      displayName: form.value.displayName.trim()
    })

    // Update Firestore user document
    await setDoc(
      doc(db, 'users', u.uid),
      {
        uid: u.uid,
        username: uname,
        displayName: form.value.displayName.trim(),
        phone: form.value.phone.trim(),
        gender: form.value.gender,
        birthday: form.value.birthday,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    // ✅ Update the user store immediately for instant UI update
    user.name = form.value.displayName.trim()

    success.value = 'Profile updated.'
    isEditing.value = false
    original.value = JSON.parse(JSON.stringify(form.value))
  } catch (e) {
    console.error(e)
    if (e.message === 'username-taken') error.value = 'That username is already taken.'
    else error.value = 'Could not save profile.'
  } finally {
    saving.value = false
  }
}
</script>