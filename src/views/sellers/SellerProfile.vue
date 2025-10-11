<!-- SellerProfile.vue -->
<template>
  <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Profile Card -->
      <div class="flex flex-col items-center text-center p-6 bg-creamy-white dark:bg-gray-800/50 rounded-xl shadow-sm">
        <div class="relative mb-4">
          <div
            class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32"
            :style="{ backgroundImage: `url('${seller.logo}')` }"
          ></div>
        </div>

        <!-- Name + Verified badge -->
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          <span class="inline-flex items-center gap-2">
            {{ seller.name }}
            <span
              v-if="seller.verified"
              class="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full
                     bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 align-middle">
              <span class="material-symbols-outlined text-base leading-none">verified</span>
              Verified
            </span>
          </span>
        </h1>

        <p class="mt-2 text-gray-600 dark:text-gray-400">{{ seller.bio }}</p>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          <span class="material-symbols-outlined text-lg text-red-500">location_on</span>
          Located @ {{ seller.address }}
        </p>

        <div class="flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400">
          <span class="material-symbols-outlined text-lg text-yellow-500">star</span>
          <span class="font-medium">{{ seller.rating }} / 5.0</span>
          <span class="text-gray-400 dark:text-gray-600">·</span>
          <span>20 Followings</span>
          <span class="text-gray-400 dark:text-gray-600">·</span>
          <span>120 Followers</span>
        </div>

        <button
          class="mt-6 flex items-center justify-center gap-2 h-10 px-6 bg-primary/10 dark:bg-primary/20 text-primary font-bold text-sm rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
          <span class="material-symbols-outlined text-lg">settings</span>
          <span>Edit Profile Page</span>
        </button>
      </div>
      <!-- /Profile Card -->

      <!-- Tabs -->
      <div class="mt-8">
        <div class="border-b border-gray-200 dark:border-gray-800">
          <nav aria-label="Tabs" class="-mb-px flex gap-6 px-4">
            <button
              v-for="t in tabs"
              :key="t"
              @click="activeTab = t"
              class="shrink-0 border-b-2 px-1 pb-4 text-sm font-medium transition-colors"
              :class="activeTab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 dark:text-gray-400 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300'">
              {{ t }}
            </button>
          </nav>
        </div>

        <!-- Products -->
        <div v-if="activeTab === 'Products'" class="py-6" id="product_list">
          <!-- If products exist: show grid -->
          <div
            v-if="seller.products && seller.products.length > 0"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            id="product_grid">
            <div
              v-for="(p, idx) in seller.products"
              :key="idx"
              class="group relative flex flex-col overflow-hidden rounded-lg bg-creamy-white dark:bg-gray-800/50 h-full">

              <!-- Image + hover overlay + stock badge -->
              <div class="relative">
                <div
                  class="aspect-square w-full bg-cover bg-center"
                  :style="{ backgroundImage: `url('${p.img}')` }"
                ></div>

                <!-- Stock badge -->
                <span
                  class="absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-semibold shadow"
                  :class="stockClass(p)">
                  {{ stockLabel(p) }}
                </span>

                <!-- Hover overlay with Edit Product -->
                <div
                  class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition
                         group-hover:bg-black/30 group-hover:opacity-100">
                  <button
                    class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold
                           bg-white text-gray-900 shadow hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">
                    <span class="material-symbols-outlined text-base">settings</span>
                    Edit Product
                  </button>
                </div>
              </div>

              <!-- Card body (equal height support) -->
              <div class="p-4 flex flex-col grow">
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white line-clamp-2 min-h-[3rem]">
                    {{ p.name }}
                  </h3>

                  <!-- Price or Price Range -->
                  <p class="mt-1 text-sm text-primary font-semibold">
                    {{ priceDisplay(p) }}
                  </p>
                </div>

                <!-- Sizes (with disabled/greyed chips for qty 0) -->
                <div v-if="hasSizes(p)" class="mt-3 flex flex-wrap gap-1.5">
                  <span
                    v-for="(s, i) in p.size"
                    :key="i"
                    class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
                    :class="sizeChipClass(p, i)">
                    {{ s }}
                  </span>
                </div>

                <!-- Spacer to push any future actions to bottom, guaranteeing equal heights -->
                <div class="mt-auto"></div>
              </div>
            </div>
          </div>

          <!-- If no products yet: show placeholder -->
          <div v-else class="py-16 flex items-center justify-center">
            <h3 class="text-gray-500 dark:text-gray-400 text-lg font-medium">No products yet.</h3>
          </div>

          <!-- Add button stays visible in both cases -->
          <div class="mt-8 flex justify-center">
            <button @click="addProductModal = true"
                    class="flex items-center justify-center gap-2 h-12 px-8 bg-accent text-white font-bold text-sm rounded-lg shadow-lg hover:bg-vibrant-coral/90 transition-all transform hover:scale-105">
              <span class="material-symbols-outlined">add_circle</span>
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        <!-- Wishlist (placeholder) -->
        <div
          v-else-if="activeTab === 'Wishlist'"
          id="wishlist_list"
          class="py-16 flex items-center justify-center">
          <h3 class="text-gray-500 dark:text-gray-400 text-lg font-medium">No wishlist items yet.</h3>
        </div>

        <!-- Reviews (placeholder) -->
        <div
          v-else
          id="reviews_list"
          class="py-16 flex items-center justify-center">
          <h3 class="text-gray-500 dark:text-gray-400 text-lg font-medium">No reviews yet.</h3>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
/**
 * Using Vue 3 <script setup> for concise composition API.
 * All state and helpers are defined here and used directly in the template.
 */
import { ref, reactive } from 'vue'

/* -----------------------------------------
 * Reactive seller data (mocked)
 * - added `verified` flag for badge
 * - products can have:
 *   - price: number           -> single price
 *   - price: number[]         -> price per variant (size/color/spec), we show a range
 *   - quantity: number|number[] similar to price
 * ----------------------------------------- */
const seller = reactive({
  userID: 'A0000001',
  dateCreated: '2023-01-15 10:30:00 UTC+8',
  name: 'The Cozy Corner',
  verified: true, // <-- toggle this to show/hide the badge
  account_type: 'seller',
  uen: '12345678A',
  rating: 4.8,
  bio: 'Handmade crafts and unique home decor items. Bringing warmth and style to your living space. Crafted with love in Singapore. Follow us for the latest updates and exclusive offers!',
  logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvDcbMzFfeOb3_h2t6uZzdwHccl2CtXAV_HefE3Vq9CTAeiMu4sCE6Jhdva_sb7S3PV3u9zSaANk2iz7iFIRPCHqAvHuCd-xacQWdeUyun9Iy7oICCCN_X1QqwJ1lyHqbtjGYzhOn5mKV_i9eD1o6fGeWgjfIB87h1dAcVufqCvvW4N0925h4gJ92uxp7J-7z5vz7SHWEf4IObyuH5WZLYNVL2GAYYWtkDBuyJtHtigkoLtjT0cc6ghqtBLxUoRxa4OnNWmD2O1c0b',
  address: '216 Wadapp St, Singapore',
  products: [
    {
      name: 'Handmade Knitted Blanket',
      category: 'Home Decor',
      price: [12.5, 15.3, 18],
      availability: true,
      quantity: [10, 15, 5],
      size: ['Small', 'Medium', 'Large'],
      description: 'A cozy and warm blanket, perfect for chilly evenings.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7TbMdiUe5J4NKqvd8j8Etl3AibjXD4teMfsdqetttjyc8hBjKqvyMY4-lD9Fg7eNeTxrPWmRCB6GJd4m9CG8cmn4xAhhuM9sAGobUW6Sx8U0Q3__inQTCI5WUImHH0JwQlqQZJ9lee7IVngjNfxT9nv6YQcR3CTq1utiY7OMdespxQbqML9YUvMrt-XrS-OFnHc3KM6Ww-kRCKulXnPxqCpdTow8s2hJ4c_G_8WOnXurf6jlnB1_Xjs6A986qKAN39699ti3n9C-L'
    },
    {
      name: 'Vintage Leather Journal',
      category: 'Stationery',
      price: 25.0,
      availability: true,
      quantity: 30,
      size: null,
      description: 'A beautifully crafted journal with a rustic leather cover.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOtBBELolEMKhFpA8lnRHddIxEUknqls3jVEpGpjvBW3Q3p0eEen0nwbCH27A9wZMW8ARFkdE3oROrbaynWBLyGiFxf52phd19O2g0sxWf-Rooost_Gsuq9VEbZ4ley0yWZNmkY8toGjkdLWN_ysppW-BZHRmKKppLOskRsVZeLuG8PBvPSprWXluj9kzXgY5tYXhcD0-sDGZqvRCsBqmQYRGZiQ2DWC-FRLCBOY8eWL8n1JkoIDAocy4gXlyDGnCa3UHMlxlAY13X'
    },
    {
      name: 'Ceramic Coffee Mug',
      category: 'Kitchenware',
      price: [12.5, 15.0],
      availability: true,
      quantity: [20, 15],
      size: ['300ml', '450ml'],
      description: 'A stylish mug for your morning coffee or tea.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2KpTDeFZuCC0_EtV3QQHgksfM5U0IRJLhXzMsY8InvSWvSpspPAiT7BVltoAsh28XI0nBPYwkEVnNekfuAfDpC2Bfs4727KsLULqoS2EBHV2mRe9DtUuZMqf7HMv_IQWQpNCPUVuCZFKygtdQFqCOmiv44z5IgNxJZTECY3as8gzyvHZ11N4F6uJ5S7-Fiyq7BJOEB2S2MtqcytHI1yXJsOV9uQNLLz7OpnIdw2bEj0sMakXpRarlNBsC91ELagpWDZkBAhBTGPtU'
    },
    {
      name: 'Bluetooth Speaker',
      category: 'Electronics',
      price: 60.0,
      availability: false,
      quantity: 0,
      size: null,
      description: 'A portable speaker with excellent sound quality.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp0g-4Hz2UpiF4GOnxmsqGwXfaHCA-GZqjaTM_6glPFL1avpvDoiTWxXsVXh6gM7KgZTwZpq2_xxAVwimNFXVH5KrUE5TtaCxkc2rSFhWP6Oj3h5tE5nLBkN-OjEXP3EJaoJMMC7zi4CQkd3Ti8FVRLJxM6uO8yD4V88oNZiGRG5xddkuzp_0k8iop1HbiZ2q9lLLd5sm4IsAMPTNQdNtsykr3Vpn10ULpD-_7U5V2bj0_vkhy5OsDRIg1mP2yO7NUERBNOh8PnGyg'
    },
    {
      name: 'Yoga Mat',
      category: 'Fitness',
      price: [12.0, 20.0, 30.0],
      availability: true,
      quantity: [25, 10, 0],
      size: ['Standard', 'Thick', 'Extra Thick'],
      description: 'A non-slip mat for all your yoga and exercise needs.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkKHmxXCcH5XZk1QLxyBI61zdmfOY3FhlrHfpx8TpvjVQQU0wo9JOG-vNU8-Bvqf4a80QEx8_6ZkLhBJU73mCzN2R_FU0xUXnCC-Nmbf9d9i6stRn397LUUfMouJTizKfOl7cbOHgGiUa81IU9YkxRMeszE1eGhed7MPXOY_prrUrOLFhLsZ8d-KleyPJw1jVHKBH3rBi1GsykAZTKW5hcQurtGBmBywvsvaUz9U8AYfWB2zJScHfuolnaGYaxXC5aBUsj9YZukvVV'
    },
    {
      name: 'Scented Candles Set',
      category: 'Home Fragrance',
      price: 20.0,
      availability: true,
      quantity: 40,
      size: null,
      description: 'A set of three scented candles to create a relaxing atmosphere.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxM4GDJ-QHi29SrHwwJXPDkDpuCEyJHc2Y1XtgxlM_cP6zWz5XtmTwLanIyFZYMjGwEhrs7BNLxrHqoVDNOIZvWv42gXUhyD20gPEgmOnQZhJrrkrtdtQzPAL5DffP-EAqnestASgC1_BPEtc-uCVBpyoEj3zLF4MjYwLSe0RXNKk_WlLODzYW4C2tKrrenLK4kN8glkeRx5A9lhu6lvQPUxrbXfGlGvoVn7hwzv0XtfIDUBkbNoDQDl05IJg3RZu_4X5lbrvoDnxi'
    }
  ]
})

/** Tab state for switching sections */
const tabs = ['Products', 'Wishlist', 'Reviews']
const activeTab = ref('Products')

/** For future: control of “add product” modal (not implemented here) */
const addProductModal = ref(false)

/* -----------------------------------------
 * Formatting helpers
 * ----------------------------------------- */

/** Currency formatter (SGD). Reuse everywhere for consistent display. */
const formatter = new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' })
const formatPrice = (val) => formatter.format(Number(val ?? 0))

/**
 * Display either a single price or a range.
 * - If price is an array, we sanitize -> find min/max -> show "min–max".
 * - If min === max, we show one price (no range).
 * - If price is a number, just format it.
 */
const priceDisplay = (p) => {
  const { price } = p
  if (Array.isArray(price)) {
    const nums = price
      .map(Number)
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b)

    if (nums.length === 0) return formatPrice(0)

    const min = nums[0]
    const max = nums[nums.length - 1]
    return min === max ? formatPrice(min) : `${formatPrice(min)}–${formatPrice(max)}`
  }
  // price is a single number
  return formatPrice(price)
}

/* -----------------------------------------
 * Stock helpers
 * ----------------------------------------- */

/** Sum any quantity arrays; coerce single numbers; fallback to 0 on invalid. */
const totalQty = (q) => {
  if (Array.isArray(q)) return q.map(Number).filter(n => !isNaN(n)).reduce((a, b) => a + b, 0)
  const n = Number(q)
  return isNaN(n) ? 0 : n
}

/** Product availability logic for the badge. */
const isOutOfStock = (p) => !p.availability || totalQty(p.quantity) <= 0
const isLowStock = (p) => !isOutOfStock(p) && totalQty(p.quantity) <= 5
const stockLabel = (p) => (isOutOfStock(p) ? 'Out of stock' : isLowStock(p) ? 'Low stock' : 'In stock')
const stockClass = (p) =>
  isOutOfStock(p)
    ? 'bg-red-600 text-white'
    : isLowStock(p)
      ? 'bg-amber-500 text-white'
      : 'bg-emerald-600 text-white'

/* -----------------------------------------
 * Size chips helpers
 * ----------------------------------------- */

/** Whether the product has sizes to render. */
const hasSizes = (p) => Array.isArray(p.size) && p.size.length > 0

/** Quantity for a given size index. Supports number or number[] structures. */
const sizeQtyAt = (p, i) => {
  if (!Array.isArray(p.quantity)) return Number(p.quantity) || 0
  const n = Number(p.quantity[i])
  return isNaN(n) ? 0 : n
}

/** Is a particular size available (> 0 qty)? */
const sizeAvailable = (p, i) => sizeQtyAt(p, i) > 0

/** Tailwind classes to style chips; greyed + strikethrough if unavailable. */
const sizeChipClass = (p, i) =>
  sizeAvailable(p, i)
    ? 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
    : 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 line-through opacity-60'

/* -----------------------------------------
 * Wishlist (SAVED FOR FUTURE — feature disabled)
 * Keep these commented for quick enable later.
 * ----------------------------------------- */
// const wishlist = ref([])
// const keyOf = (p) => `${p.name}::${p.category}`
// const inWishlist = (p) => wishlist.value.some(i => keyOf(i) === keyOf(p))
// const addToWishlist = (p) => { if (!inWishlist(p) && !isOutOfStock(p)) wishlist.value.push(p) }
// const removeFromWishlist = (p) => { wishlist.value = wishlist.value.filter(i => keyOf(i) !== keyOf(p)) }
</script>
