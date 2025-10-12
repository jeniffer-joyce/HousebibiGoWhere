<!-- AddNewProduct.vue -->
<template>
  <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="max-w-4xl mx-auto">

      <!-- =========================
           Preview (top, centered) + Carousel
           ========================= -->
      <div class="mb-10">
        <h3 class="text-base font-semibold mb-3 text-center">Preview</h3>
        <div class="flex justify-center">
          <div class="group relative flex w-full max-w-xs flex-col overflow-hidden rounded-lg bg-creamy-white dark:bg-gray-800/50">
            <div class="relative">
              <!-- Image area -->
              <div class="aspect-square w-full bg-cover bg-center"
                   :style="{ backgroundImage: `url('${currentPreviewSrc}')` }"></div>

              <!-- Stock badge -->
              <span class="absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-semibold shadow"
                    :class="stockClass(previewItem)">
                {{ stockLabel(previewItem) }}
              </span>

              <!-- Carousel arrows (only if > 1) -->
              <button
                v-if="previewImages.length > 1"
                type="button"
                class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white p-2 hover:bg-black/60 transition"
                @click="prevImage"
                aria-label="Previous image">
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                v-if="previewImages.length > 1"
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white p-2 hover:bg-black/60 transition"
                @click="nextImage"
                aria-label="Next image">
                <span class="material-symbols-outlined">chevron_right</span>
              </button>

              <!-- Optional tiny dots -->
              <div v-if="previewImages.length > 1" class="absolute bottom-2 inset-x-0 flex justify-center gap-1">
                <span
                  v-for="(src, i) in previewImages"
                  :key="i"
                  class="h-1.5 w-1.5 rounded-full"
                  :class="i === previewIndex ? 'bg-white' : 'bg-white/50'"></span>
              </div>
            </div>

            <div class="p-4 flex flex-col grow">
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white line-clamp-2 min-h-[3rem]">
                  {{ form.name || (form.type === 'service' ? 'Untitled Service' : 'Untitled Product') }}
                </h4>
                <p class="mt-1 text-sm text-primary font-semibold">
                  {{ form.type === 'service' ? servicePriceDisplay(previewItem) : priceDisplay(previewItem) }}
                </p>
              </div>

              <!-- Product variant chips -->
              <div v-if="form.type === 'product' && form.variantsEnabled && form.variants.length" class="mt-3 flex flex-wrap gap-1.5">
                <span v-for="(v, i) in form.variants" :key="i"
                      class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
                      :class="v.quantity > 0 ? 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
                                             : 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 line-through opacity-60'">
                  {{ v.label || 'Variant' }}
                </span>
              </div>

              <!-- Service package chips -->
              <div v-if="form.type === 'service' && form.packages.length" class="mt-3 flex flex-wrap gap-1.5">
                <span v-for="(pk, i) in form.packages" :key="i"
                      class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs
                             border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                  {{ pk.name || 'Package' }}
                </span>
              </div>

              <div class="mt-auto"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- =========================
           Header
           ========================= -->
      <div class="mb-8">
        <h2 class="text-3xl font-extrabold tracking-tight">
          Add New {{ form.type === 'service' ? 'Service' : 'Product' }}
        </h2>
        <p class="mt-2 text-gray-600 dark:text-gray-300">
          Fill in the details below to add a new {{ form.type }} to your store.
        </p>
      </div>

      <!-- =========================
           Form
           ========================= -->
      <form class="space-y-8" @submit.prevent="onSubmit">
        <!-- Listing Type (now spaced: label above, toggle with mt-2) -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Listing Type </label>
          <div class="mt-2 inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button type="button" class="px-4 py-2 text-sm font-medium"
                    :class="form.type === 'product' ? activeSeg : idleSeg"
                    @click="form.type = 'product'">Product</button>
            <button type="button" class="px-4 py-2 text-sm font-medium border-l border-gray-200 dark:border-gray-700"
                    :class="form.type === 'service' ? activeSeg : idleSeg"
                    @click="form.type = 'service'">Service</button>
          </div>
        </div>

        <!-- Core Fields -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="space-y-2 md:col-span-2">
            <label class="text-sm font-medium" for="name">Name</label>
            <input id="name" type="text" required
                   placeholder="e.g., Handmade Knitted Blanket"
                   class="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary focus:ring-primary focus:ring-opacity-50 px-4 py-3"
                   v-model.trim="form.name"/>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium" for="category">Category</label>
            <select id="category" required
                    class="form-select block w-full appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-primary focus:ring-opacity-50 px-4 py-3"
                    v-model="form.category">
              <option disabled value="">Select a category</option>
              <option v-for="opt in categories" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium" for="description">Description</label>
            <textarea id="description" rows="4"
                      placeholder="Describe your item…"
                      class="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary focus:ring-primary focus:ring-opacity-50 px-4 py-3 resize-y"
                      v-model.trim="form.description"></textarea>
          </div>
        </div>

        <!-- PRODUCT: Pricing & Variants -->
        <section v-if="form.type === 'product'" class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Pricing & Stock</h3>
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.variantsEnabled"
                     class="rounded border-gray-300 text-primary focus:ring-primary"/>
              Use variants (size/color with own price & qty)
            </label>
          </div>

          <!-- Simple price/qty -->
          <div v-if="!form.variantsEnabled" class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm font-medium" for="price">Price (SGD)</label>
              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">S$</span>
                <input id="price" type="number" step="0.01" min="0" required placeholder="25.00"
                       class="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary focus:ring-primary focus:ring-opacity-50 pl-9 pr-4 py-3"
                       v-model.number="form.price"/>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium" for="quantity">Quantity</label>
              <input id="quantity" type="number" min="0" required placeholder="e.g., 50"
                     class="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary focus:ring-primary focus:ring-opacity-50 px-4 py-3"
                     v-model.number="form.quantity"/>
            </div>
          </div>

          <!-- Variants table -->
          <div v-else class="space-y-3">
            <div class="flex justify-between items-center">
              <h4 class="font-medium">Variants</h4>
              <button type="button" @click="addVariant"
                      class="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                <span class="material-symbols-outlined text-base">add</span>Add variant
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead class="text-gray-600 dark:text-gray-300">
                  <tr>
                    <th class="text-left py-2 pr-4">Label (e.g., Small / Red)</th>
                    <th class="text-left py-2 pr-4">Price (SGD)</th>
                    <th class="text-left py-2 pr-4">Quantity</th>
                    <th class="text-right py-2 pl-4"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(v, i) in form.variants" :key="i" class="align-middle">
                    <td class="py-2 pr-4">
                      <input type="text" placeholder="e.g., Small"
                             class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2"
                             v-model.trim="v.label"/>
                    </td>
                    <td class="py-2 pr-4">
                      <input type="number" step="0.01" min="0" placeholder="12.50"
                             class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2"
                             v-model.number="v.price"/>
                    </td>
                    <td class="py-2 pr-4">
                      <input type="number" min="0" placeholder="10"
                             class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2"
                             v-model.number="v.quantity"/>
                    </td>
                    <td class="py-2 pl-4 text-right">
                      <button type="button" @click="removeVariant(i)"
                              class="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400">
                        <span class="material-symbols-outlined text-base">delete</span>Remove
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- SERVICE: Packages & Timeslots (no capacity) -->
        <section v-if="form.type === 'service'" class="space-y-6">
          <!-- Packages -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <h3 class="text-base font-semibold">Packages</h3>
              <button type="button" @click="addPackage"
                      class="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                <span class="material-symbols-outlined text-base">add</span>Add package
              </button>
            </div>

            <div class="grid gap-3">
              <div v-for="(pk, i) in form.packages" :key="i" class="grid grid-cols-1 md:grid-cols-12 gap-3">
                <input class="md:col-span-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2"
                       placeholder="Package name (e.g., Basic 1 hr)" v-model.trim="pk.name"/>
                <input class="md:col-span-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2"
                       type="number" step="0.01" min="0" placeholder="Price" v-model.number="pk.price"/>
                <div class="md:col-span-1 flex justify-end">
                  <button type="button" @click="removePackage(i)"
                          class="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400">
                    <span class="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeslots -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <h3 class="text-base font-semibold">Timeslots</h3>
              <button type="button" @click="addTimeslot"
                      class="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                <span class="material-symbols-outlined text-base">add</span>Add timeslot
              </button>
            </div>

            <div class="grid gap-3">
              <div v-for="(sl, i) in form.timeslots" :key="i" class="grid grid-cols-1 md:grid-cols-12 gap-3">
                <input class="md:col-span-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2"
                       placeholder="Label (e.g., 10:00)" v-model.trim="sl.label"/>
                <input class="md:col-span-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2"
                       type="datetime-local" v-model="sl.start"/>
                <input class="md:col-span-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2"
                       type="datetime-local" v-model="sl.end"/>
                <div class="md:col-span-1 flex justify-end">
                  <button type="button" @click="removeTimeslot(i)"
                          class="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400">
                    <span class="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Images -->
        <section class="space-y-4">
          <h3 class="text-base font-semibold">Images</h3>
          <div
            class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 px-6 py-10 text-center bg-gray-50 dark:bg-gray-900/40">
            <span class="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500">add_photo_alternate</span>
            <p class="mt-4 font-semibold text-gray-900 dark:text-gray-100">Upload or Generate Images</p>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Drag &amp; drop, or click to browse.</p>

            <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFilesChosen"/>
            <div class="mt-4 flex gap-2">
              <button type="button" @click="fileInput?.click()"
                      class="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                <span class="material-symbols-outlined text-base">upload</span>Choose files
              </button>
              <button type="button" @click="onGenerateAIImage"
                      class="inline-flex items-center gap-2 rounded-lg bg-primary/20 dark:bg-primary/30 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/30 dark:hover:bg-primary/40">
                <span class="material-symbols-outlined text-base">auto_awesome</span>Generate with AI
              </button>
            </div>

            <div class="mt-4 w-full max-w-md">
              <label class="text-sm font-medium" for="image-url">Image URL (optional)</label>
              <input id="image-url" type="url" placeholder="https://example.com/image.jpg"
                     class="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary focus:ring-primary focus:ring-opacity-50 px-4 py-3"
                     v-model.trim="form.imgUrl"/>
            </div>

            <div v-if="imagePreviews.length" class="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-3 w-full">
              <div v-for="(src, i) in imagePreviews" :key="i" class="relative">
                <div class="aspect-square w-full bg-center bg-cover rounded-lg" :style="{ backgroundImage: `url('${src}')` }"></div>
                <button type="button" @click="removePreview(i)"
                        class="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1 leading-none">
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Submit -->
        <div class="flex justify-end pt-2">
          <button type="submit"
                  class="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-bold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Save {{ form.type === 'service' ? 'Service' : 'Product' }}
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'

/* Segmented button styles */
const activeSeg = 'bg-primary/10 text-primary'
const idleSeg   = 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'

/* Categories */
const categories = ['Home Decor','Stationery','Kitchenware','Electronics','Fitness','Home Fragrance']

/* Form model */
const form = reactive({
  type: 'product',
  name: '',
  category: '',
  description: '',

  // Product
  variantsEnabled: false,
  price: null,
  quantity: 0,
  variants: [], // [{label, price, quantity}]

  // Service
  packages: [],  // [{name, price}]
  timeslots: [], // [{label, start, end}]

  // Images
  imgUrl: ''
})

/* File input & previews */
const fileInput = ref(null)
const imagePreviews = ref([])   // object URLs of chosen files

/* Build array for carousel:
   - chosen files (object URLs)
   - if imgUrl present, append it as the last slide */
const previewImages = computed(() => {
  const arr = [...imagePreviews.value]
  if (form.imgUrl) arr.push(form.imgUrl.trim())
  return arr.length ? arr : ['https://via.placeholder.com/600x600?text=Preview']
})

/* Carousel index + looping nav (A: continuous loop) */
const previewIndex = ref(0)
const currentPreviewSrc = computed(() => previewImages.value[Math.abs(previewIndex.value) % previewImages.value.length])
function nextImage () {
  previewIndex.value = (previewIndex.value + 1) % previewImages.value.length
}
function prevImage () {
  previewIndex.value = (previewIndex.value - 1 + previewImages.value.length) % previewImages.value.length
}

/* Image handlers */
function onFilesChosen (e) {
  const files = Array.from(e.target.files || [])
  files.forEach(f => imagePreviews.value.push(URL.createObjectURL(f)))
  // Reset to the first slide whenever we add images
  previewIndex.value = 0
}
function removePreview (idx) {
  const url = imagePreviews.value[idx]
  URL.revokeObjectURL(url)
  imagePreviews.value.splice(idx, 1)
  if (previewIndex.value >= previewImages.value.length) previewIndex.value = 0
}
function onGenerateAIImage () {
  alert('Image generation not wired yet — connect your generator here.')
}

/* Variants helpers */
function addVariant () { form.variants.push({ label: '', price: null, quantity: 0 }) }
function removeVariant (i) { form.variants.splice(i, 1) }

/* Service helpers */
function addPackage () { form.packages.push({ name: '', price: null }) }
function removePackage (i) { form.packages.splice(i, 1) }
function addTimeslot () { form.timeslots.push({ label: '', start: '', end: '' }) }
function removeTimeslot (i) { form.timeslots.splice(i, 1) }

/* Preview synthesis for card */
const previewItem = computed(() => {
  if (form.type === 'service') {
    return {
      type: 'service',
      name: form.name,
      description: form.description,
      img: currentPreviewSrc.value,
      packages: form.packages.slice(),
      timeslots: form.timeslots.slice(),
      availability: true
    }
  }
  const hasVariants = form.variantsEnabled && form.variants.length
  const price = hasVariants ? form.variants.map(v => Number(v.price || 0)) : Number(form.price || 0)
  const quantity = hasVariants ? form.variants.map(v => Number(v.quantity || 0)) : Number(form.quantity || 0)
  return {
    type: 'product',
    name: form.name,
    description: form.description,
    img: currentPreviewSrc.value,
    price,
    quantity,
    size: hasVariants ? form.variants.map(v => v.label || 'Variant') : null,
    availability: (Array.isArray(quantity) ? quantity.reduce((a,b)=>a+b,0) : quantity) > 0
  }
})

/* Display utils */
const formatter = new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' })
const formatPrice = (n) => formatter.format(Number(n || 0))

const priceDisplay = (p = {}) => {
  const price = p.price
  if (Array.isArray(price)) {
    const nums = price.map(Number).filter(n=>!isNaN(n)).sort((a,b)=>a-b)
    if (!nums.length) return formatPrice(0)
    const [min,max] = [nums[0], nums[nums.length-1]]
    return min===max ? formatPrice(min) : `${formatPrice(min)}–${formatPrice(max)}`
  }
  return formatPrice(Number(price || 0))
}

const hasPackages = (p={}) => Array.isArray(p.packages) && p.packages.length>0
const servicePriceDisplay = (p={}) => {
  if (!hasPackages(p)) return priceDisplay(p)
  const nums = (p.packages||[]).map(pk=>Number(pk.price)).filter(n=>!isNaN(n)).sort((a,b)=>a-b)
  if (!nums.length) return formatPrice(0)
  const [min,max] = [nums[0], nums[nums.length-1]]
  return min===max ? formatPrice(min) : `${formatPrice(min)}–${formatPrice(max)}`
}

/* Timeslot availability WITHOUT capacity: available if not in past */
const slotInPast = (slot={}) => {
  const start = new Date(slot.start||'')
  return isNaN(start) ? false : start < new Date()
}
const serviceHasFuture = (p={}) =>
  Array.isArray(p.timeslots) && p.timeslots.some(slot => !slotInPast(slot))
const futureSlotCount = (p={}) =>
  Array.isArray(p.timeslots) ? p.timeslots.filter(slot => !slotInPast(slot)).length : 0

const totalQty = (q) => Array.isArray(q)
  ? q.map(Number).filter(n=>!isNaN(n)).reduce((a,b)=>a+b,0)
  : (isNaN(Number(q)) ? 0 : Number(q))

const isOutOfStockOrNoSlots = (p={}) => p.type==='service'
  ? !serviceHasFuture(p)
  : totalQty(p.quantity) <= 0

const isLowStockOrFewSlots = (p={}) => p.type==='service'
  ? (futureSlotCount(p) > 0 && futureSlotCount(p) <= 2)
  : (totalQty(p.quantity) > 0 && totalQty(p.quantity) <= 5)

const stockLabel = (p={}) =>
  isOutOfStockOrNoSlots(p) ? (p.type==='service' ? 'No slots' : 'Out of stock')
  : isLowStockOrFewSlots(p) ? (p.type==='service' ? 'Few slots' : 'Low stock')
  : 'In stock'

const stockClass = (p={}) =>
  isOutOfStockOrNoSlots(p) ? 'bg-red-600 text-white'
  : isLowStockOrFewSlots(p) ? 'bg-amber-500 text-white'
  : 'bg-emerald-600 text-white'

/* Submit */
function onSubmit () {
  if (!form.name || !form.category) {
    alert('Please enter a name and choose a category.')
    return
  }

  let payload
  if (form.type === 'service') {
    payload = {
      type: 'service',
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      packages: form.packages
        .filter(pk => pk.name && Number(pk.price) >= 0)
        .map(pk => ({ name: pk.name.trim(), price: Number(pk.price) })),
      timeslots: form.timeslots
        .filter(sl => sl.start && sl.end)
        .map(sl => ({ label: sl.label?.trim() || '', start: sl.start, end: sl.end })),
      availability: true,
      img: currentPreviewSrc.value
    }
  } else {
    if (!form.variantsEnabled) {
      if (Number(form.price) < 0 || Number(form.quantity) < 0) {
        alert('Price/Quantity must be 0 or more.')
        return
      }
      payload = {
        type: 'product',
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        price: Number(form.price || 0),
        quantity: Number(form.quantity || 0),
        size: null,
        availability: Number(form.quantity || 0) > 0,
        img: currentPreviewSrc.value
      }
    } else {
      const clean = form.variants
        .filter(v => v.label && Number(v.price) >= 0 && Number(v.quantity) >= 0)
        .map(v => ({ label: v.label.trim(), price: Number(v.price||0), quantity: Number(v.quantity||0) }))
      if (!clean.length) {
        alert('Please add at least one valid variant (label, price, quantity).')
        return
      }
      payload = {
        type: 'product',
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        price: clean.map(v => v.price),
        quantity: clean.map(v => v.quantity),
        size: clean.map(v => v.label),
        availability: clean.some(v => v.quantity > 0),
        img: currentPreviewSrc.value
      }
    }
  }

  console.log('Submitting payload:', payload)
  alert('Captured to console. Hook this to your DB next!')
}
</script>

<style scoped>
/* Select chevron — LIGHT */
.form-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.25em 1.25em;
  padding-right: 2.5rem;
}
/* Select chevron — DARK */
:where(.dark) .form-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23CBD5E1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
}
</style>
