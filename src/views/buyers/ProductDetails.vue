<script setup>
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProduct } from '@/composables/useProduct'
import MessageButton from '@/components/messageButton.vue'
import { db } from "@/firebase/firebase_config"
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from "firebase/firestore"

import { useImageZoom } from '@/composables/useImageZoom'
import { useCart } from '@/composables/useCart'

import Loading from '@/components/status/Loading.vue';

import { useToast } from '@/composables/useToast.js' // Import toast

import AddToCartSuccessModal from '@/components/modals/AddToCartSuccessModal.vue'


const route = useRoute()

// Get product ID from route params
const productId = computed(() => route.params.id)

// Use the product composable
const {
    product,
    seller,
    loading,
    productError,
    formattedPrice,
    productImages,
    mainImage,
    stock,
    loadProduct,
    selectImage
} = useProduct(productId)

// Load product on mount
onMounted(() => {
    loadProduct()
})

const {
    showImageModal,
    selectedImage,
    zoomLevel,
    panX,
    panY,
    isPanning,
    openImageModal,
    closeImageModal,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel,
    startPan,
    handlePan,
    endPan
} = useImageZoom();


const selectedSize = ref(0);
const userQuantity = ref(1)
const currentImageIndex = ref(0) // Track current image in mobile carousel

// Add to Cart Success Modal
const showSuccessModal = ref(false)
const addedProductName = ref('')
const addedQuantity = ref(1)

function selectSize(index) {
    selectedSize.value = index;
}

// Handle image carousel scroll for mobile
function handleImageScroll(event) {
    const container = event.target
    const scrollLeft = container.scrollLeft
    const itemWidth = container.offsetWidth
    const newIndex = Math.round(scrollLeft / itemWidth)
    currentImageIndex.value = newIndex
}

// Computed property for formatted price based on selected size index
const selectedFormattedPrice = computed(() => {
    if (product.value.size === null) {
        return `$${parseFloat(product.value.price).toFixed(2)}`;
    }

    if (selectedSize.value !== null && product.value?.price) {
        // Return the formatted price corresponding to the selected size
        return `$${parseFloat(product.value.price[selectedSize.value]).toFixed(2)}`;
    }
    // Default to the first price if no size is selected
    return formattedPrice.value[0];
})

const selectedQuantity = computed(() => {
    if (selectedSize.value !== null && product.value?.quantity && Array.isArray(product.value.quantity)) {
        // Return the quantity corresponding to the selected size
        return product.value.quantity[selectedSize.value];
    }
    // Default to the first stock quantity if no size is selected
    return product.value?.quantity[0] || 0;  // Default to 0 if no quantity is found
})

// Format Availability status
const selectedStockStatus = computed(() => {
  // Wait until product data is actually loaded
  if (!product.value || product.value.quantity == null) {
    return { text: 'Loading...', color: 'text-gray-400' }
  }

  if (product.value.quantity <= 0) {
    return { text: 'Out of Stock', color: 'text-red-600' }
  }

  return { text: 'In Stock', color: 'text-green-600' }
})


// Ensure userQuantity stays within stock and handles out-of-stock
watch([userQuantity, selectedQuantity], () => {
    if (selectedQuantity.value <= 0) {
        // Out of stock → force to 0
        userQuantity.value = 0
    } else {
        // Clamp between 1 and available stock
        if (userQuantity.value < 1) {
            userQuantity.value = 1
        } else if (userQuantity.value > selectedQuantity.value) {
            userQuantity.value = selectedQuantity.value
        }
    }
})

/* ====== PRODUCT REVIEWS (UI + Data) ====== */
// Get productId & make sure your composable already loaded product/seller

const productIdParam = computed(() => route.params.id)

// ─── Review state ──────────────────────────────────────────────────────────────
const prRaw = ref([])          // flattened raw rows for this product
const prFilter = reactive({
    sort: 'newest',              // 'newest' | 'oldest' | 'highest' | 'lowest'
    size: 'all',                 // 'all' or e.g. 'M'
})

let prUnsub = null

// cache for buyer details
const prBuyers = new Map()   // buyerId -> {displayName, photoURL}

// cache for product details (name) in case you want to show it (optional)
const prProducts = new Map() // productId -> {name}

// Fetch a buyer's display info
async function prFetchBuyer(uid) {
    if (!uid) return { displayName: 'User', photoURL: '' }
    if (prBuyers.has(uid)) return prBuyers.get(uid)
    // try users, then profiles
    let snap = await getDoc(doc(db, 'users', uid)).catch(() => null)
    let data = snap?.exists() ? snap.data() : null
    if (!data) {
        snap = await getDoc(doc(db, 'profiles', uid)).catch(() => null)
        data = snap?.exists() ? snap.data() : null
    }
    const user = {
        displayName: data?.displayName || data?.name || 'User',
        photoURL: data?.photoURL || data?.avatar || ''
    }
    prBuyers.set(uid, user)
    return user
}

// optional: product name lookup (if needed)
async function prFetchProductName(pid) {
    if (!pid) return 'Product'
    if (prProducts.has(pid)) return prProducts.get(pid).name
    const snap = await getDoc(doc(db, 'products', pid)).catch(() => null)
    const data = snap?.exists() ? snap.data() : null
    const name = data?.name || data?.item_name || 'Product'
    prProducts.set(pid, { name })
    return name
}

// Listen for this product's reviews (via sellerId; filter items by productId)
watch(
    productIdParam,
    async (pid, _, onCleanup) => {
        if (prUnsub) { prUnsub(); prUnsub = null }
        prRaw.value = []

        // We don't know sellerId here without your product record; query all & filter is OK.
        // If you have sellerId available (e.g., computed from your composable), prefer:
        // const sellerId = product.value?.seller_id
        // const qRef = query(collection(db, 'reviews'), where('sellerId','==', sellerId), orderBy('createdAt','desc'))

        const qRef = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))

        prUnsub = onSnapshot(qRef, async (snap) => {
            const rows = []
            const jobs = []

            snap.forEach(docSnap => {
                const rev = { id: docSnap.id, ...docSnap.data() }
                if (!Array.isArray(rev.items)) return

                rev.items.forEach((it, idx) => {
                    if (String(it.productId) !== String(pid)) return

                    const row = {
                        key: `${docSnap.id}-${idx}`,
                        createdAt: rev.createdAt,
                        buyerId: rev.buyerId,
                        productId: it.productId,
                        productName: null,
                        size: it.size || null,
                        rating: Number(it.rating || 0),
                        text: it.text || '',
                        images: Array.isArray(it.images) ? it.images : [],
                        anonymous: Number(it.anonymous ?? 0),

                        // resolved later:
                        buyerName: null,
                        buyerPhoto: null,
                    }
                    rows.push(row)

                    jobs.push(
                        (async () => {
                            const user = await prFetchBuyer(rev.buyerId)
                            row.buyerName = user.displayName
                            row.buyerPhoto = user.photoURL || null
                            row.productName = await prFetchProductName(it.productId)
                        })()
                    )
                })
            })

            await Promise.all(jobs)
            prRaw.value = rows
        }, (err) => console.error('product reviews onSnapshot error:', err))

        onCleanup?.(() => { prUnsub && prUnsub() })
    },
    { immediate: true }
)

// Helpers
function prMaskName(name) {
    const n = (name || 'User').trim()
    if (n.length <= 2) return n[0] + '*'
    return `${n[0]}${'*'.repeat(Math.max(1, n.length - 2))}${n[n.length - 1]}`
}
function prDisplayName(r) {
    return Number(r.anonymous) === 1 ? prMaskName(r.buyerName || 'User') : (r.buyerName || 'User')
}
function prAvatar(r) {
    if (Number(r.anonymous) === 1) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent('Anonymous')}&background=64748b&color=fff&size=64`
    }
    if (r.buyerPhoto) return r.buyerPhoto
    const nm = r.buyerName || 'User'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nm)}&background=10b981&color=fff&size=64`
}
function prFormatTime(ts) {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('en-SG', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

// Sizes present in reviews
const prAllSizes = computed(() => {
    const set = new Set()
    prRaw.value.forEach(r => { if (r.size) set.add(r.size) })
    return Array.from(set)
})

// Filter + sort
const prVisibleReviews = computed(() => {
    let arr = prRaw.value

    if (prFilter.size !== 'all') {
        arr = arr.filter(r => (r.size || '') === prFilter.size)
    }

    switch (prFilter.sort) {
        case 'oldest':
            arr = [...arr].sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
            break
        case 'highest':
            arr = [...arr].sort((a, b) => b.rating - a.rating || (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
            break
        case 'lowest':
            arr = [...arr].sort((a, b) => a.rating - b.rating || (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
            break
        default: // newest
            arr = [...arr].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    }

    return arr
})

function resetPrFilters() {
    prFilter.sort = 'newest'
    prFilter.size = 'all'
}

// Lightbox
const prLightbox = reactive({ open: false, url: '' })
function openPrLightbox(url) { prLightbox.url = url; prLightbox.open = true }
function closePrLightbox() { prLightbox.open = false; prLightbox.url = '' }

onBeforeUnmount(() => { prUnsub && prUnsub() })

const { error, warning } = useToast()

// Add to cart
const router = useRouter()
const { adding, addToCart } = useCart()

// Add to cart handler
async function handleAddToCart() {

    if (selectedQuantity.value <= 0) {
        warning("This item is out of stock", "Out of stock")
        return
    }

    try {
        // Prepare product data with id
        const productData = {
            id: productId.value,
            ...toRaw(product.value)
        }

        await addToCart(productData, userQuantity.value, selectedSize.value)

        // Store data for modal
        addedProductName.value = productData.item_name
        addedQuantity.value = userQuantity.value

        // Show success modal
        showSuccessModal.value = true

        console.log('Product data being sent to cart:', {
            id: productData.id,
            sellerId: productData.sellerID,
            item_name: productData.item_name,
            price: productData.price,
            quantity: productData.quantity,
            size: productData.size,
            selectedSize: selectedSize.value,
            userQuantity: userQuantity.value
        })

  
        // router.push('/cart')
    } catch (err) {
        warning('Please log in to manage cart.', 'Login Required')
        console.error(err)
    }
}
function closeSuccessModal() {
    showSuccessModal.value = false
}

</script>

<style scoped>
/* Hide scrollbar for mobile image carousel */
.scrollbar-hide {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari and Opera */
}
</style>

<template>
    <AddToCartSuccessModal :show="showSuccessModal" :product-name="addedProductName" :quantity="addedQuantity"
        @close="closeSuccessModal" />
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center min-h-[320px]">
            <Loading />
        </div>


        <!-- Product Not Found -->
        <div v-else-if="!product" class="text-center py-20">
            <p class="text-xl text-gray-600 dark:text-gray-400">Product not found</p>
        </div>

        <!-- Product Content -->
        <div v-else>
            <!-- Two Column Layout with Sticky Behavior -->
            <div class="grid grid-cols-1 gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-2">
                <!-- Left Column - Images -->
                <!-- Mobile: Horizontal Scroll -->
                <div class="lg:hidden">
                    <!-- Horizontal scrollable container -->
                    <div class="relative">
                        <div @scroll="handleImageScroll"
                            class="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
                            style="scroll-behavior: smooth; -webkit-overflow-scrolling: touch;">
                            <div v-for="(image, index) in productImages" :key="index"
                                class="flex-shrink-0 w-full snap-center">
                                <!-- Image - clickable with better cursor and hover effect -->
                                <div class="h-64 sm:h-80 rounded-lg bg-cover bg-center bg-no-repeat cursor-zoom-in hover:opacity-95 hover:shadow-xl transition-all duration-300"
                                    :style="`background-image: url('${image}');`" @click="openImageModal(image)">
                                </div>

                                <!-- Disclaimer below image -->
                                <div v-if="image.includes('unsplash.com')"
                                    class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-end">
                                    Image by
                                    <a href="https://unsplash.com" target="_blank" class="underline">Unsplash</a>
                                </div>
                            </div>
                        </div>

                        <!-- Image counter dots -->
                        <div v-if="productImages.length > 1" class="flex justify-center gap-1.5 mt-3">
                            <div v-for="(image, index) in productImages" :key="`dot-${index}`"
                                class="h-1.5 rounded-full transition-all"
                                :class="index === currentImageIndex ? 'w-6 bg-primary' : 'w-1.5 bg-gray-300 dark:bg-gray-600'">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Desktop: Vertical Scroll (original behavior) -->
                <div class="hidden lg:flex flex-col gap-3 sm:gap-4">
                    <div v-for="(image, index) in productImages" :key="index">
                        <!-- Image - clickable with better cursor and hover effect -->
                        <div class="h-64 sm:h-80 lg:h-96 rounded-lg bg-cover bg-center bg-no-repeat cursor-zoom-in hover:opacity-95 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                            :style="`background-image: url('${image}');`" @click="openImageModal(image)">
                        </div>

                        <!-- Disclaimer below image -->
                        <div v-if="image.includes('unsplash.com')"
                            class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-end">
                            Image by
                            <a href="https://unsplash.com" target="_blank" class="underline">Unsplash</a>
                        </div>
                    </div>
                </div>

                <!-- Right Column - Product Details (Sticky) -->
                <div class="space-y-6 sm:space-y-8">
                    <div class="lg:sticky lg:top-[80px] lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto space-y-6">
                        <!-- Product Name -->
                        <div>
                            <h1
                                class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {{ product.item_name }}
                            </h1>

                            <!-- Price -->
                            <p class="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                <span>{{ selectedFormattedPrice }}</span>
                            </p>
                        </div>

                        <!-- Description -->
                        <div>
                            <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Description</h3>
                            <p class="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                {{ product.description || 'No description available.' }}
                            </p>
                        </div>

                        <!-- Size (if available) -->
                        <div v-if="product.size">
                            <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Variations</h3>
                            <div class="mt-2 flex flex-wrap gap-2 sm:gap-3">
                                <button v-for="(size, index) in product.size" :key="index" :class="{
                                    'bg-gray-500 text-white': selectedSize === index,
                                    'bg-gray-200 text-gray-700': selectedSize !== index
                                }" @click="selectSize(index)"
                                    class="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md transition-all hover:bg-gray-500 hover:text-white">
                                    {{ size }}
                                </button>
                            </div>
                        </div>

                        <!-- Quantity Section -->
                        <div>
                            <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Quantity</h3>

                            <!-- Stock Status + Quantity -->
                            <div class="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <!-- Quantity Buttons -->
                                <div class="flex items-center gap-2">
                                    <button @click="userQuantity = Math.max(1, userQuantity - 1)"
                                        :disabled="selectedQuantity <= 0 || userQuantity <= 1"
                                        class="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 text-base sm:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        −
                                    </button>

                                    <input type="number" v-model.number="userQuantity"
                                        :min="selectedQuantity > 0 ? 1 : 0" :max="selectedQuantity"
                                        :disabled="selectedQuantity <= 0" class="w-16 sm:w-20 h-9 sm:h-10 text-center text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg 
                                            bg-white dark:bg-slate-700 text-gray-900 dark:text-white 
                                            focus:outline-none focus:ring-2 focus:ring-primary
                                            disabled:bg-gray-100 dark:disabled:bg-slate-800 
                                            disabled:text-gray-400 disabled:cursor-not-allowed 
                                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
                                            [&::-webkit-inner-spin-button]:appearance-none" />

                                    <button @click="userQuantity = Math.min(selectedQuantity, userQuantity + 1)"
                                        :disabled="selectedQuantity <= 0 || userQuantity >= selectedQuantity"
                                        class="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 text-base sm:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        +
                                    </button>
                                </div>

                                <!-- Stock Status -->
                                <p class="text-xs sm:text-sm font-medium text-center sm:text-right"
                                    :class="selectedStockStatus.color">
                                    {{ selectedStockStatus.text }}
                                </p>
                            </div>
                        </div>

                        <!-- Add to Cart Button -->
                        <div>
                            <button @click="handleAddToCart"
                                :disabled="selectedStockStatus.color === 'text-red-600' || adding"
                                class="flex w-full items-center justify-center rounded-lg border border-transparent px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold sm:font-medium text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                :class="selectedStockStatus.color === 'text-red-600' ? 'bg-gray-400' : 'bg-primary hover:bg-primary/80'">

                                <!-- Loading spinner -->
                                <svg v-if="adding" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none"
                                    viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4" />
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>

                                <span v-if="adding">Adding...</span>
                                <span v-else-if="selectedStockStatus.color === 'text-red-600'">Out of Stock</span>
                                <span v-else>Add to Cart</span>
                            </button>
                        </div>

                        <!-- Message Seller Button -->
                        <div v-if="product.seller_id">
                            <MessageButton :seller-id="product.seller_id"
                                :seller-name="seller ? (seller.business_name || seller.name) : 'Seller'"
                                variant="secondary" size="md" class="w-full" />
                        </div>

                        <!-- Seller Info -->
                        <div v-if="seller">
                            <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Seller</h3>
                            <div
                                class="mt-2 flex items-center gap-3 sm:gap-4 rounded-lg bg-white p-3 sm:p-4 shadow-sm dark:bg-background-dark">
                                <div class="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 rounded-full bg-cover bg-center"
                                    :style="`background-image: url('${seller.profile_image || seller.logo || seller.profilePic || 'https://via.placeholder.com/150'}');`">
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p
                                        class="font-semibold text-sm sm:text-base text-gray-800 dark:text-white truncate">
                                        {{ seller.business_name || seller.name || 'Unknown Seller' }}
                                    </p>
                                    <a class="text-xs sm:text-sm text-primary hover:underline" href="#">View Shop</a>
                                </div>
                                <MessageButton :seller-id="product.seller_id || seller.uid || seller.id"
                                    :seller-name="seller.business_name || seller.name || 'Seller'" variant="secondary"
                                    size="sm" class="hidden sm:flex" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- =================== CUSTOMER REVIEWS (Product) =================== -->
            <section class="mt-8 sm:mt-10 lg:mt-12" id="product-reviews">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>

                    <!-- Toolbar (right) -->
                    <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Sort</span>

                        <!-- Sort -->
                        <div class="relative">
                            <select v-model="prFilter.sort"
                                class="h-9 sm:h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                            px-2 sm:px-3 pr-7 sm:pr-8 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none">
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="highest">Highest rating</option>
                                <option value="lowest">Lowest rating</option>
                            </select>
                            <span
                                class="material-symbols-outlined pointer-events-none absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">expand_more</span>
                        </div>

                        <span class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Size</span>

                        <!-- Size -->
                        <div class="relative">
                            <select v-model="prFilter.size"
                                class="h-9 sm:h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                            px-2 sm:px-3 pr-7 sm:pr-8 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none">
                                <option value="all">All</option>
                                <option v-for="s in prAllSizes" :key="s" :value="s">{{ s }}</option>
                            </select>
                            <span
                                class="material-symbols-outlined pointer-events-none absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">expand_more</span>
                        </div>

                        <button @click="resetPrFilters"
                            class="inline-flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2.5 sm:px-3 rounded-lg border border-gray-200 dark:border-gray-700
                        bg-white dark:bg-gray-900 text-xs sm:text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <span class="material-symbols-outlined text-sm sm:text-base">filter_alt_off</span>
                            <span class="hidden xs:inline">Reset</span>
                        </button>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-if="prVisibleReviews.length === 0"
                    class="mt-4 sm:mt-6 rounded-xl border border-slate-200 dark:border-slate-700 p-8 sm:p-10 text-center text-slate-600 dark:text-slate-400">
                    No reviews yet.
                </div>

                <!-- Reviews -->
                <div v-for="r in prVisibleReviews" :key="r.key"
                    class="p-4 sm:p-6 mb-3 sm:mb-4 mt-4 sm:mt-5 bg-white dark:bg-background-dark/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <!-- Header: Avatar + Username + Timestamp -->
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <img :src="prAvatar(r)"
                                class="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover flex-shrink-0"
                                :alt="prDisplayName(r)" />
                            <p class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                {{ prDisplayName(r) }}
                            </p>
                        </div>
                        <p
                            class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                            {{ prFormatTime(r.createdAt) }}
                        </p>
                    </div>

                    <!-- Size + Star Rating Row -->
                    <div class="mt-3 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 pl-0 sm:pl-15">
                        <div v-if="r.size" class="flex items-center">
                            <span
                                class="inline-block rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-blue-700 dark:text-blue-300">
                                Size: {{ r.size }}
                            </span>
                        </div>

                        <!-- Rating -->
                        <div class="flex items-center gap-0.5 sm:gap-1">
                            <template v-for="n in 5" :key="'star-'+r.key+n">
                                <span class="material-symbols-outlined text-base sm:text-lg"
                                    :class="n <= r.rating ? 'text-primary' : 'text-gray-300 dark:text-gray-600'">
                                    star
                                </span>
                            </template>
                            <span class="ml-1 text-[10px] sm:text-xs text-gray-500">{{ r.rating }}/5</span>
                        </div>
                    </div>

                    <!-- Review Text -->
                    <p
                        class="mt-3 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap pl-0 sm:pl-15">
                        {{ r.text }}
                    </p>

                    <!-- Photos -->
                    <div v-if="r.images?.length" class="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3 pl-0 sm:pl-15">
                        <img v-for="(img, i) in r.images" :key="i" :src="img"
                            class="h-20 w-20 sm:h-24 sm:w-24 rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-zoom-in hover:opacity-80 transition-opacity"
                            alt="review photo" @click="openPrLightbox(img)" />
                    </div>
                </div>
            </section>
        </div>

        <!-- Image Zoom Modal with smooth transitions -->
        <transition enter-active-class="transition-opacity duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="showImageModal" @click="closeImageModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-2 sm:p-4">
                <!-- Close button -->
                <button @click="closeImageModal"
                    class="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 transition-colors z-10 p-1 sm:p-0">
                    <svg class="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <!-- Zoom Controls -->
                <div class="absolute top-2 left-2 sm:top-4 sm:left-4 flex gap-1.5 sm:gap-2 z-10">
                    <button @click.stop="zoomIn"
                        class="bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5 sm:p-2 transition-colors backdrop-blur-sm">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                    </button>
                    <button @click.stop="zoomOut"
                        class="bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5 sm:p-2 transition-colors backdrop-blur-sm">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                        </svg>
                    </button>
                    <button @click.stop="resetZoom"
                        class="bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5 sm:p-2 transition-colors backdrop-blur-sm">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

                <!-- Zoom level indicator -->
                <div
                    class="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg backdrop-blur-sm z-10">
                    {{ Math.round(zoomLevel * 100) }}%
                </div>

                <!-- Image Container with Pan and Zoom -->
                <transition enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95">
                    <div @click.stop @wheel.prevent="handleWheel" @mousedown="startPan" @mousemove="handlePan"
                        @mouseup="endPan" @mouseleave="endPan"
                        class="overflow-hidden max-h-[90vh] max-w-[90vw] flex items-center justify-center"
                        :class="{ 'cursor-grab': !isPanning && zoomLevel > 1, 'cursor-grabbing': isPanning, 'cursor-zoom-in': zoomLevel === 1 }">
                        <img :src="selectedImage" :style="{
                            transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                            transition: isPanning ? 'none' : 'transform 0.2s ease-out'
                        }" class="max-h-[90vh] max-w-[90vw] object-contain rounded-lg select-none"
                            alt="Zoomed product image" draggable="false">
                    </div>
                </transition>
            </div>
        </transition>
    </main>
</template>