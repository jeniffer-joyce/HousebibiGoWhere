<!-- src/components/modals/AddProductModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="close"
      >
        <div
          class="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ isEdit ? 'Edit Product' : 'Add New Product' }}
              </h2>
              <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Provide product details and images. You can add up to 5 images and set a primary image.
              </p>
            </div>
            <button
              @click="close"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">close</span>
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
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         placeholder:text-gray-400 dark:placeholder:text-gray-500
                         focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
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
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         placeholder:text-gray-400 dark:placeholder:text-gray-500
                         focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                ></textarea>
              </div>

              <!-- Multiple Sizes Toggle -->
              <div class="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 
                          border border-blue-200 dark:border-blue-800">
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
                        :class="hasMultipleSizes ? 'translate-x-6' : 'translate-x-1'"></span>
                </button>
              </div>

              <!-- Single Size Mode -->
              <div v-if="!hasMultipleSizes" class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (SGD) <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                    <input
                      v-model.number="form.price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      class="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             placeholder:text-gray-400 dark:placeholder:text-gray-500
                             focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                <div
                  v-for="(size, idx) in form.sizes"
                  :key="idx" 
                  class="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <input
                    v-model="size.name"
                    type="text"
                    placeholder="Size"
                    required
                    class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                           bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <div class="relative">
                    <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">$</span>
                    <input
                      v-model.number="size.price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      required
                      class="w-24 pl-6 pr-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                             bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white
                             placeholder:text-gray-400 dark:placeholder:text-gray-500
                             focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <input
                    v-model.number="size.quantity"
                    type="number"
                    min="0"
                    placeholder="Qty"
                    required
                    class="w-20 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                           bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    v-if="form.sizes.length > 1"
                    type="button"
                    @click="removeSize(idx)"
                    class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    aria-label="Remove size"
                  >
                    <span class="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>

              <!-- Product Images -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Images <span class="text-red-500">*</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ productImages.length }}/5)</span>
                  </label>
                  <button
                    v-if="productImages.length < 5"
                    type="button"
                    @click="showImagePicker = true"
                    class="text-sm text-primary font-medium hover:underline">
                    + Add Image
                  </button>
                </div>

                <!-- Selected Images -->
                <div v-if="productImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <div
                    v-for="(url, idx) in productImages"
                    :key="idx"
                    class="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 
                           dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  >
                    <img :src="url" :alt="`Product image ${idx + 1}`" class="w-full h-full object-cover" />
                    <div
                      v-if="idx === 0"
                      class="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs font-medium rounded shadow">
                      Primary
                    </div>
                    <button
                      type="button"
                      @click="removeImage(idx)"
                      class="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 
                             transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      <span class="material-symbols-outlined text-sm leading-none">close</span>
                    </button>
                    <button
                      v-if="idx !== 0"
                      type="button"
                      @click="setAsPrimary(idx)"
                      class="absolute bottom-2 left-2 right-2 px-2 py-1 bg-white/90 dark:bg-gray-800/90
                             text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity
                             text-gray-800 dark:text-gray-200"
                    >
                      Set as Primary
                    </button>
                  </div>
                </div>

                <!-- Empty State -->
                <div
                  v-else
                  @click="showImagePicker = true"
                  class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center 
                         cursor-pointer hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span class="text-3xl">🖼️</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Click to add product images
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Add up to 5 images
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Availability -->
              <div class="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 
                          border border-gray-200 dark:border-gray-800">
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
                        :class="form.availability ? 'translate-x-6' : 'translate-x-1'"></span>
                </button>
              </div>
            </div>
          </form>

          <!-- Footer -->
          <div
            class="flex items-center justify-between flex-wrap gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 
                   bg-gray-50 dark:bg-gray-800/50"
          >
            <!-- Delete Button (Edit mode only) -->
            <button
              v-if="isEdit"
              type="button"
              @click="showDeleteConfirm = true"
              class="flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium 
                     text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <span class="material-symbols-outlined text-base">delete</span>
              Delete
            </button>

            <div class="flex items-center gap-3 ml-auto">
              <button
                type="button"
                @click="close"
                class="px-6 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 
                       hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                @click="handleSubmit"
                :disabled="saving || !isFormValid"
                class="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-white 
                       hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="saving" class="material-symbols-outlined animate-spin text-base">
                  progress_activity
                </span>
                <span>
                  {{ saving ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add Product') }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="fade">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm Deletion</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to permanently delete this product?<br />
            <span class="font-medium text-red-600 dark:text-red-400">This action cannot be undone.</span>
          </p>
          <div class="flex justify-center gap-3 mt-4">
            <button
              @click="showDeleteConfirm = false"
              class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                     hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Image Picker -->
    <ImagePickerModal
      :show="showImagePicker"
      :category="form.category"
      @close="showImagePicker = false"
      @select="addImage"
    />
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import ImagePickerModal from '@/components/ImagePickerModal.vue'
import { useToast } from '@/composables/useToast'
import { deleteMyProduct } from '@/firebase/services/sellers/seller_product'

const { success, error: toastError } = useToast()

/* Props & Emits */
const props = defineProps({
  show: { type: Boolean, default: false },
  editProduct: { type: Object, default: null } // when set -> edit mode
})
const emit = defineEmits(['close', 'save', 'deleted'])

/* Local state */
const saving = ref(false)
const hasMultipleSizes = ref(false)
const showImagePicker = ref(false)
const showDeleteConfirm = ref(false)
const productImages = ref([]) // for UI
const isEdit = computed(() => !!props.editProduct)

/* Form model */
const form = reactive({
  item_name: '',
  description: '',
  price: null,
  quantity: null,
  sizes: [{ name: 'S', price: 0, quantity: 0 }],
  img_url: '',              // primary image (derived)
  additional_images: [],    // extra images (derived)
  imageSource: 'unsplash',
  availability: true,
  category: '',
  // ✅ NEW: default totalSales for newly created products
  totalSales: 0
})

/* Prefill on open (Edit mode) */
watch(
  () => [props.show, props.editProduct],
  ([visible, product]) => {
    if (!visible) return
    if (product) {
      form.item_name = product.item_name || ''
      form.description = product.description || ''
      form.availability = product.availability ?? true
      form.category = product.category || ''

      // Load images from `images` if present; otherwise combine legacy fields
      const imgs = Array.isArray(product.images) && product.images.length
        ? product.images
        : [product.img_url, ...(product.additional_images || [])].filter(Boolean)
      productImages.value = imgs.slice(0, 5)
      updateFormImages()

      const hasSizesArr = Array.isArray(product.size) && product.size.length > 0
      hasMultipleSizes.value = hasSizesArr
      if (hasSizesArr) {
        const prices = Array.isArray(product.price) ? product.price : []
        const qtys = Array.isArray(product.quantity) ? product.quantity : []
        form.sizes = product.size.map((name, i) => ([
          name,
          Number(prices[i]) || 0,
          Number(qtys[i]) || 0
        ])).map(([name, price, quantity]) => ({ name, price, quantity }))
      } else {
        const p = Array.isArray(product.price) ? product.price[0] : product.price
        const q = Array.isArray(product.quantity) ? product.quantity[0] : product.quantity
        form.price = Number(p) || 0
        form.quantity = Number(q) || 0
        form.sizes = [{ name: 'S', price: 0, quantity: 0 }]
      }
    } else {
      resetForm(true)
    }
  },
  { immediate: true }
)

/* Validation */
const isFormValid = computed(() => {
  if (!form.item_name?.trim() || !form.description?.trim()) return false
  if (productImages.value.length === 0) return false

  if (hasMultipleSizes.value) {
    return form.sizes.length > 0 && form.sizes.every(s =>
      s.name?.trim() && Number(s.price) >= 0 && Number.isFinite(Number(s.quantity)) && Number(s.quantity) >= 0
    )
  } else {
    return Number.isFinite(Number(form.price)) && Number(form.price) >= 0 &&
           Number.isFinite(Number(form.quantity)) && Number(form.quantity) >= 0
  }
})

/* ---------- Image helpers ---------- */
function updateFormImages() {
  form.img_url = productImages.value[0] || ''
  form.additional_images = productImages.value.slice(1)
}
function addImage(url) {
  if (productImages.value.length < 5) {
    productImages.value.push(url)
    updateFormImages()
  }
  showImagePicker.value = false
}
function removeImage(index) {
  productImages.value.splice(index, 1)
  updateFormImages()
}
function setAsPrimary(index) {
  const [img] = productImages.value.splice(index, 1)
  productImages.value.unshift(img)
  updateFormImages()
}

/* ---------- Size helpers ---------- */
function toggleMultipleSizes() {
  hasMultipleSizes.value = !hasMultipleSizes.value
  if (hasMultipleSizes.value && !form.sizes.length)
    form.sizes = [{ name: 'S', price: 0, quantity: 0 }]
}
function addSize() { form.sizes.push({ name: '', price: 0, quantity: 0 }) }
function removeSize(idx) { form.sizes.splice(idx, 1) }

/* ---------- Close + Reset ---------- */
function close() {
  resetForm(true) // clear all data when modal closes
  emit('close')
}
function resetForm(full = false) {
  if (full) {
    form.item_name = ''
    form.description = ''
    form.price = null
    form.quantity = null
    form.sizes = [{ name: 'S', price: 0, quantity: 0 }]
    form.img_url = ''
    form.additional_images = []
    form.imageSource = 'unsplash'
    form.availability = true
    form.category = ''
    form.totalSales = 0 // ✅ reset default
    productImages.value = []
  }
  saving.value = false
  showImagePicker.value = false
  showDeleteConfirm.value = false
}

/* ---------- Submit (Add / Edit) ---------- */
async function handleSubmit() {
  if (!isFormValid.value) {
    toastError('Please complete all required fields')
    return
  }
  try {
    saving.value = true

    const payload = {
      item_name: form.item_name.trim(),
      description: form.description.trim(),
      img_url: form.img_url,                  // primary
      additional_images: form.additional_images, // extra images
      imageSource: form.imageSource,
      availability: form.availability,
      category: form.category || undefined
    }

    if (hasMultipleSizes.value) {
      payload.size = form.sizes.map(s => s.name)
      payload.price = form.sizes.map(s => Number(s.price) || 0)
      payload.quantity = form.sizes.map(s => Number(s.quantity) || 0)
    } else {
      payload.size = null
      payload.price = Number(form.price) || 0
      payload.quantity = Number(form.quantity) || 0
    }

    // ✅ Only attach totalSales on creation to avoid overwriting existing counts
    if (!isEdit.value) {
      payload.totalSales = Number(form.totalSales) || 0
    }

    emit('save', payload) // parent decides create/update
  } finally {
    saving.value = false
  }
}

/* ---------- Delete (Edit mode) ---------- */
async function confirmDelete() {
  if (!props.editProduct?.id) {
    showDeleteConfirm.value = false
    return
  }
  try {
    saving.value = true
    await deleteMyProduct(props.editProduct.id)
    success('✅ Product deleted.')
    emit('deleted', props.editProduct.id)
    close()
  } catch (e) {
    console.error('❌ Delete failed:', e)
    toastError('Failed to delete product. Please try again.')
    showDeleteConfirm.value = false
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Modal fade */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

/* Simple fade for confirm dialog */
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}

/* Scrollbar (works in both themes) */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb {
  background-color: rgba(100,116,139,0.35); /* slate-500/35 */
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100,116,139,0.55); /* slate-500/55 */
}
</style>
