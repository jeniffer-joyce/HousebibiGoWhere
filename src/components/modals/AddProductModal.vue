<!-- AddProductModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="close">
        <div class="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h2>
            <button @click="close" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <span class="material-symbols-outlined text-gray-500">close</span>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto px-6 py-6">
            <div class="space-y-6">
              
              <!-- Product Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.item_name"
                  type="text"
                  required
                  placeholder="e.g., Handmade Ceramic Mug"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.category"
                  required
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/40">
                  <option value="">Select category</option>
                  <option value="food-and-beverages">Food & Beverages</option>
                  <option value="handmade-crafts">Handmade Crafts</option>
                  <option value="home-decor">Home Decor</option>
                  <option value="personalized-gifts">Personalized Gifts</option>
                  <option value="clothing-and-accessories">Clothing & Accessories</option>
                  <option value="plants-and-gardening">Plants & Gardening</option>
                  <option value="stationery-and-paper-goods">Stationery</option>
                  <option value="catering">Catering</option>
                  <option value="tutoring">Tutoring</option>
                </select>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="form.description"
                  required
                  rows="3"
                  placeholder="Describe your product..."
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/40 resize-none"
                ></textarea>
              </div>

              <!-- Has Multiple Sizes Toggle -->
              <div class="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div>
                  <p class="text-sm font-medium text-blue-900 dark:text-blue-100">Multiple Sizes?</p>
                  <p class="text-xs text-blue-700 dark:text-blue-300">Enable if product has different sizes</p>
                </div>
                <button
                  type="button"
                  @click="toggleMultipleSizes"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="hasMultipleSizes ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'">
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="hasMultipleSizes ? 'translate-x-6' : 'translate-x-1'">
                  </span>
                </button>
              </div>

              <!-- Single Size Mode -->
              <div v-if="!hasMultipleSizes" class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (SGD) <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      v-model.number="form.price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      class="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="form.quantity"
                    type="number"
                    min="0"
                    required
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <!-- Multiple Sizes Mode -->
              <div v-else class="space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Size Variants</label>
                  <button
                    type="button"
                    @click="addSize"
                    class="text-sm text-primary font-medium hover:underline">
                    + Add Size
                  </button>
                </div>
                <div v-for="(size, idx) in form.sizes" :key="idx" class="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <input
                    v-model="size.name"
                    type="text"
                    placeholder="Size"
                    required
                    class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  />
                  <div class="relative">
                    <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                    <input
                      v-model.number="size.price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      required
                      class="w-24 pl-6 pr-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                  <input
                    v-model.number="size.quantity"
                    type="number"
                    min="0"
                    placeholder="Qty"
                    required
                    class="w-20 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  />
                  <button
                    v-if="form.sizes.length > 1"
                    type="button"
                    @click="removeSize(idx)"
                    class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <span class="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>

              <!-- Product Image Section -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Image <span class="text-red-500">*</span>
                </label>

                <!-- Image Source Tabs -->
                <div class="flex gap-2 mb-4">
                  <button
                    type="button"
                    @click="imageSource = 'unsplash'"
                    :class="[
                      'flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm',
                      imageSource === 'unsplash'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    ]">
                    <span class="flex items-center justify-center gap-2">
                      <span class="text-lg">🎨</span>
                      AI Images
                    </span>
                  </button>
                  <button
                    type="button"
                    @click="imageSource = 'upload'"
                    :class="[
                      'flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm',
                      imageSource === 'upload'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    ]">
                    <span class="flex items-center justify-center gap-2">
                      <span class="text-lg">📤</span>
                      Upload
                    </span>
                  </button>
                  <button
                    type="button"
                    @click="imageSource = 'url'"
                    :class="[
                      'flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm',
                      imageSource === 'url'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    ]">
                    <span class="flex items-center justify-center gap-2">
                      <span class="text-lg">🔗</span>
                      Image URL
                    </span>
                  </button>
                </div>

                <!-- Unsplash Image Picker -->
                <div v-if="imageSource === 'unsplash'">
                  <UnsplashImagePicker
                    v-model="selectedUnsplashImage"
                    @select="handleUnsplashSelect"
                    :placeholder="`Search for ${form.category || 'product'} images...`"
                  />
                </div>

                <!-- File Upload -->
                <div v-else-if="imageSource === 'upload'">
                  <div class="space-y-3">
                    <!-- Upload Area -->
                    <div class="relative">
                      <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        @change="handleFileUpload"
                        class="hidden"
                      />
                      
                      <!-- Upload Button/Preview -->
                      <div v-if="!uploadedImagePreview" 
                        @click="$refs.fileInput.click()"
                        class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div class="flex flex-col items-center gap-3">
                          <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <span class="text-3xl">📸</span>
                          </div>
                          <div>
                            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Click to upload image
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </div>
                      </div>

                      <!-- Image Preview -->
                      <div v-else class="relative">
                        <img 
                          :src="uploadedImagePreview" 
                          alt="Preview"
                          class="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          @click="clearUploadedImage"
                          class="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg">
                          <span class="material-symbols-outlined text-base">delete</span>
                        </button>
                        <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <p class="truncate">{{ uploadedFileName }}</p>
                          <p class="text-xs">{{ uploadedFileSize }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Upload Progress -->
                    <div v-if="uploading" class="space-y-2">
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Uploading...</span>
                        <span class="text-gray-900 dark:text-white font-medium">{{ uploadProgress }}%</span>
                      </div>
                      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          class="bg-primary h-full transition-all duration-300"
                          :style="{ width: uploadProgress + '%' }">
                        </div>
                      </div>
                    </div>

                    <!-- Upload Error -->
                    <p v-if="uploadError" class="text-sm text-red-500">
                      {{ uploadError }}
                    </p>
                  </div>
                </div>

                <!-- Manual URL Input -->
                <div v-else-if="imageSource === 'url'">
                  <input
                    v-model="form.img_url"
                    type="url"
                    :required="!form.img_url"
                    placeholder="https://example.com/image.jpg"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/40"
                  />
                  <div v-if="form.img_url" class="mt-3 flex justify-center">
                    <img 
                      :src="form.img_url" 
                      class="h-32 w-32 object-cover rounded-lg" 
                      @error="imgError = true"
                      @load="imgError = false" 
                    />
                  </div>
                  <p v-if="imgError" class="mt-2 text-sm text-red-500">Failed to load image. Please check the URL.</p>
                </div>
              </div>

              <!-- Availability -->
              <div class="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">Available for Sale</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Product visible to customers</p>
                </div>
                <button
                  type="button"
                  @click="form.availability = !form.availability"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="form.availability ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'">
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="form.availability ? 'translate-x-6' : 'translate-x-1'">
                  </span>
                </button>
              </div>

            </div>
          </form>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button
              type="button"
              @click="close"
              class="px-6 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button
              @click="handleSubmit"
              :disabled="saving || !isFormValid"
              class="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="saving" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
              <span>{{ saving ? 'Adding...' : 'Add Product' }}</span>
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { storage, auth } from '@/firebase/firebase_config'
// ✅ Correct - CDN syntax (matches your firebase_config.js)
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js'
import UnsplashImagePicker from '@/components/UnsplashImagePicker.vue'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'save'])

const saving = ref(false)
const imgError = ref(false)
const hasMultipleSizes = ref(false)
const imageSource = ref('unsplash') // 'unsplash', 'upload', or 'url'
const selectedUnsplashImage = ref(null)

// File upload states
const fileInput = ref(null)
const uploadedImagePreview = ref(null)
const uploadedFileName = ref('')
const uploadedFileSize = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref(null)

const form = reactive({
  item_name: '',
  category: '',
  description: '',
  price: null,
  quantity: null,
  sizes: [{ name: 'S', price: 0, quantity: 0 }],
  img_url: '',
  imageAttribution: null,
  imageSource: 'unsplash',
  availability: true
})

// Validate form has image
const isFormValid = computed(() => {
  return form.img_url && form.img_url.trim().length > 0
})

// Update search placeholder based on category
watch(() => form.category, (newCategory) => {
  if (imageSource.value === 'unsplash' && selectedUnsplashImage.value === null) {
    // Category changed, could trigger new search suggestions
  }
})

// Handle Unsplash image selection
function handleUnsplashSelect(photo) {
  if (photo) {
    selectedUnsplashImage.value = photo
    
    // Use the Unsplash URL directly (hotlink - required by Unsplash)
    form.img_url = photo.urls.regular
    
    // Store attribution info (required by Unsplash)
    form.imageAttribution = {
      photographerName: photo.attribution.photographerName,
      photographerLink: photo.attribution.photographerLink,
      photoLink: photo.links.html,
      unsplashLink: 'https://unsplash.com'
    }
    
    form.imageSource = 'unsplash'
    imgError.value = false
  } else {
    // User cleared the Unsplash selection
    selectedUnsplashImage.value = null
    form.img_url = ''
    form.imageAttribution = null
  }
}

// Watch image source changes
watch(imageSource, (newSource) => {
  if (newSource === 'url') {
    // Switching to manual URL
    selectedUnsplashImage.value = null
    form.imageAttribution = null
    clearUploadedImage()
    form.imageSource = 'url'
  } else if (newSource === 'unsplash') {
    // Switching to Unsplash
    if (!selectedUnsplashImage.value) {
      form.img_url = ''
      form.imageAttribution = null
    }
    clearUploadedImage()
    form.imageSource = 'unsplash'
  } else if (newSource === 'upload') {
    // Switching to file upload
    selectedUnsplashImage.value = null
    form.imageAttribution = null
    form.imageSource = 'upload'
  }
})

// Handle file upload
async function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Please select an image file'
    return
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    uploadError.value = 'File size must be less than 10MB'
    return
  }

  uploadError.value = null
  uploading.value = true
  uploadProgress.value = 0

  try {
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)

    // Store file info
    uploadedFileName.value = file.name
    uploadedFileSize.value = formatFileSize(file.size)

    // Upload to Firebase Storage
    const timestamp = Date.now()
    const fileName = `products/${timestamp}_${file.name}`
    const imageRef = storageRef(storage, fileName)
    const uploadTask = uploadBytesResumable(imageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progress
        uploadProgress.value = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        )
      },
      (error) => {
        // Error
        console.error('Upload error:', error)
        uploadError.value = 'Upload failed. Please try again.'
        uploading.value = false
      },
      async () => {
        // Success
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        form.img_url = downloadURL
        form.imageSource = 'upload'
        uploading.value = false
        console.log('✅ Image uploaded successfully')
      }
    )
  } catch (error) {
    console.error('Error handling file:', error)
    uploadError.value = 'Failed to process image'
    uploading.value = false
  }
}

// Clear uploaded image
function clearUploadedImage() {
  uploadedImagePreview.value = null
  uploadedFileName.value = ''
  uploadedFileSize.value = ''
  uploadProgress.value = 0
  uploadError.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  if (imageSource.value === 'upload') {
    form.img_url = ''
  }
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function toggleMultipleSizes() {
  hasMultipleSizes.value = !hasMultipleSizes.value
  if (hasMultipleSizes.value && !form.sizes.length) {
    form.sizes = [{ name: 'S', price: 0, quantity: 0 }]
  }
}

function addSize() {
  form.sizes.push({ name: '', price: 0, quantity: 0 })
}

function removeSize(idx) {
  form.sizes.splice(idx, 1)
}

function close() {
  resetForm()
  emit('close')
}

function resetForm() {
  form.item_name = ''
  form.category = ''
  form.description = ''
  form.price = null
  form.quantity = null
  form.sizes = [{ name: 'S', price: 0, quantity: 0 }]
  form.img_url = ''
  form.imageAttribution = null
  form.imageSource = 'unsplash'
  form.availability = true
  
  hasMultipleSizes.value = false
  imageSource.value = 'unsplash'
  selectedUnsplashImage.value = null
  imgError.value = false
  saving.value = false
  
  // Clear upload states
  clearUploadedImage()
}

async function handleSubmit() {
  // Validate image
  if (!form.img_url) {
    alert('Please select or provide a product image')
    return
  }

  saving.value = true
  
  try {
    const productData = {
      item_name: form.item_name,
      category: form.category,
      description: form.description,
      img_url: form.img_url,
      imageSource: form.imageSource,
      availability: form.availability,
      sellerId: auth.currentUser.uid, // ← ADD THIS LINE
      sellerName: auth.currentUser.displayName || 'Unknown Seller', // ← OPTIONAL BUT HELPFUL
      createdAt: new Date().toISOString()
    }

    // Add attribution only for Unsplash images
    if (form.imageSource === 'unsplash' && form.imageAttribution) {
      productData.imageAttribution = form.imageAttribution
    }

    // Handle pricing based on size mode
    if (hasMultipleSizes.value) {
      productData.size = form.sizes.map(s => s.name)
      productData.price = form.sizes.map(s => s.price)
      productData.quantity = form.sizes.map(s => s.quantity)
    } else {
      productData.size = null
      productData.price = form.price
      productData.quantity = form.quantity
    }

    emit('save', productData)
    resetForm()
  } catch (error) {
    console.error('Error preparing product data:', error)
    alert('Failed to add product. Please try again.')
  } finally {
    saving.value = false
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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>