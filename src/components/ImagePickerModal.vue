<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="$emit('close')">
        <div class="relative w-full max-w-4xl max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Add Product Image</h3>
            <button @click="$emit('close')" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <span class="material-symbols-outlined text-gray-500">close</span>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex gap-2 px-6 pt-4">
            
            <button
              @click="activeTab = 'upload'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                activeTab === 'upload'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              ]">
              📤 Upload
            </button>

            <button
              @click="activeTab = 'unsplash'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                activeTab === 'unsplash'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              ]">
              🎨 Unsplash
            </button>
            
            <button
              @click="activeTab = 'url'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                activeTab === 'url'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              ]">
              🔗 URL
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Unsplash Tab -->
            <div v-if="activeTab === 'unsplash'">
              <UnsplashImagePicker
                @select="handleUnsplashSelect"
                :placeholder="`Search for ${category || 'product'} images...`"
              />
            </div>

            <!-- Upload Tab -->
            <div v-else-if="activeTab === 'upload'">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileUpload"
                class="hidden"
              />
              
              <div
                @click="$refs.fileInput.click()"
                class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div class="flex flex-col items-center gap-4">
                  <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span class="text-4xl">📸</span>
                  </div>
                  <div>
                    <p class="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Click to upload image
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              <!-- Upload Progress -->
              <div v-if="uploading" class="mt-4">
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-gray-600 dark:text-gray-400">Uploading...</span>
                  <span class="text-gray-900 dark:text-white font-medium">{{ uploadProgress }}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="bg-primary h-full transition-all" :style="{ width: uploadProgress + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- URL Tab -->
            <div v-else-if="activeTab === 'url'">
              <div class="space-y-4">
                <input
                  v-model="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  @click="handleUrlSubmit"
                  :disabled="!imageUrl"
                  class="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                  Add Image
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { storage } from '@/firebase/firebase_config'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import UnsplashImagePicker from '@/components/UnsplashImagePicker.vue'
import { useToast } from '@/composables/useToast'
const { success, error:toastError } = useToast()

const props = defineProps({
  show: Boolean,
  category: String
})

const emit = defineEmits(['close', 'select'])

const activeTab = ref('upload')
const imageUrl = ref('')
const fileInput = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)

function handleUnsplashSelect(photo) {
  if (photo) {
    emit('select', photo.urls.regular)
  }
}

async function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toastError('Please select an image file')
    return
  }

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    toastError('File size must be less than 10MB')
    return
  }

  uploading.value = true
  uploadProgress.value = 0

  try {
    const timestamp = Date.now()
    const fileName = `products/${timestamp}_${file.name}`
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
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        emit('select', downloadURL)
        uploading.value = false
        uploadProgress.value = 0
      }
    )
  } catch (error) {
    console.error('Error handling file:', error)
    toastError('Failed to process image')
    uploading.value = false
  }
}

function handleUrlSubmit() {
  if (imageUrl.value) {
    emit('select', imageUrl.value)
    imageUrl.value = ''
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
</style>