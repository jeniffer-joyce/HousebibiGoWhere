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
                  <option value="handmade-crafts">Handmade Crafts</option>
                  <option value="homemade-crafts">Homemade Crafts</option>
                  <option value="personalized-gifts">Personalized Gifts</option>
                  <option value="home-decor">Home Decor</option>
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

              <!-- Image URL -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.img_url"
                  type="url"
                  required
                  placeholder="https://example.com/image.jpg"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/40"
                />
                <div v-if="form.img_url" class="mt-3 flex justify-center">
                  <img :src="form.img_url" class="h-32 w-32 object-cover rounded-lg" @error="imgError = true" />
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
              :disabled="saving"
              class="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50">
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
import { ref, reactive } from 'vue'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'save'])

const saving = ref(false)
const imgError = ref(false)
const hasMultipleSizes = ref(false)

const form = reactive({
  item_name: '',
  category: '',
  description: '',
  price: null,
  quantity: null,
  sizes: [{ name: 'S', price: 0, quantity: 0 }],
  img_url: '',
  availability: true
})

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
  emit('close')
}

async function handleSubmit() {
  saving.value = true
  
  try {
    const productData = {
      item_name: form.item_name,
      category: form.category,
      description: form.description,
      img_url: form.img_url,
      availability: form.availability
    }

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
</style>