<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProduct } from '@/composables/useProduct'
import MessageButton from '@/components/messageButton.vue'
import { useImageZoom } from '@/composables/useImageZoom'

const route = useRoute()

// Get product ID from route params
const productId = computed(() => route.params.id)

// Use the product composable
const {
    product,
    seller,
    loading,
    error,
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

function selectSize(index) {
    selectedSize.value = index;
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
    if (selectedQuantity.value <= 0) {
        return {
            text: 'Out of stock',
            color: 'text-red-600'
        }
    } else if (selectedQuantity.value <= 10) {
        return {
            text: `Limited availability (${selectedQuantity.value})`,
            color: 'text-yellow-600'
        }
    } else {
        return {
            text: `In stock (${selectedQuantity.value} available)`,
            color: 'text-green-600'
        }
    }
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
</script>

<template>
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <svg class="animate-spin h-12 w-12 text-primary mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p class="mt-4 text-gray-600 dark:text-gray-400">Loading product...</p>
            </div>
        </div>

        <!-- Product Not Found -->
        <div v-else-if="!product" class="text-center py-20">
            <p class="text-xl text-gray-600 dark:text-gray-400">Product not found</p>
        </div>

        <!-- Product Content -->
        <div v-else>
            <!-- Two Column Layout with Sticky Behavior -->
            <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
                <!-- Left Column - Images (Scrollable) -->
                <div class="flex flex-col gap-4">
                    <div v-for="(image, index) in productImages" :key="index">
                        <!-- Image - now clickable with better cursor and hover effect -->
                        <div class="h-96 rounded-lg bg-cover bg-center bg-no-repeat cursor-zoom-in hover:opacity-95 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                            :style="`background-image: url('${image}');`" @click="openImageModal(image)"></div>

                        <!-- Disclaimer below image -->
                        <div v-if="image.includes('unsplash.com')"
                            class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-end">
                            Image by
                            <a href="https://unsplash.com" target="_blank" class="underline">Unsplash</a>
                        </div>
                    </div>
                </div>

                <!-- Right Column - Product Details (Sticky) -->
                <div class="space-y-8">
                    <div class="lg:sticky lg:top-[80px] lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto">
                        <!-- Product Name -->
                        <div>
                            <h1
                                class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                {{ product.item_name }}
                            </h1>

                            <!-- Price -->
                            <p class="mt-4 text-3xl text-gray-900 dark:text-white">
                                <span>{{ selectedFormattedPrice }}</span>
                            </p>
                        </div>

                        <!-- Description -->
                        <div class="mt-6">
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Description</h3>
                            <p class="mt-2 text-base text-gray-600 dark:text-gray-300">
                                {{ product.description || 'No description available.' }}
                            </p>
                        </div>

                        <!-- Size (if available) -->
                        <div v-if="product.size" class="mt-6">
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Variations</h3>
                            <div class="mt-2 flex gap-4">
                                <button v-for="(size, index) in product.size" :key="index" :class="{
                                    'bg-gray-500 text-white': selectedSize === index,
                                    'bg-gray-200 text-gray-700': selectedSize !== index
                                }" @click="selectSize(index)"
                                    class="px-4 py-2 rounded-md transition-all hover:bg-gray-500 hover:text-white">
                                    {{ size }}
                                </button>
                            </div>
                        </div>
                        <h3 class="mt-6 text-lg font-medium text-gray-900 dark:text-white">Quantity</h3>
                        <!-- Stock Status + Quantity -->
                        <div class="flex items-center justify-between">
                            <!-- Quantity Buttons -->
                            <div class="flex items-center gap-2">
                                <button @click="userQuantity = Math.max(1, userQuantity - 1)"
                                    :disabled="selectedQuantity <= 0 || userQuantity <= 1"
                                    class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                                    −
                                </button>

                                <input type="number" v-model.number="userQuantity" :min="selectedQuantity > 0 ? 1 : 0"
                                    :max="selectedQuantity" :disabled="selectedQuantity <= 0" class="w-16 h-8 text-center border border-gray-300 dark:border-slate-600 rounded-lg 
         bg-white dark:bg-slate-700 text-gray-900 dark:text-white 
         focus:outline-none focus:ring-2 focus:ring-blue-500 
         disabled:bg-gray-100 dark:disabled:bg-slate-800 
         disabled:text-gray-400 disabled:cursor-not-allowed 
         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
         [&::-webkit-inner-spin-button]:appearance-none" />

                                <button @click="userQuantity = Math.min(selectedQuantity, userQuantity + 1)"
                                    :disabled="selectedQuantity <= 0 || userQuantity >= selectedQuantity"
                                    class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                                    +
                                </button>
                            </div>

                            <!-- Stock Status -->
                            <p class="text-sm font-medium" :class="selectedStockStatus.color">
                                {{ selectedStockStatus.text }}
                            </p>

                        </div>


                        <!-- Message Seller Button -->
                        <div v-if="product.seller_id" class="mt-6">
                            <MessageButton :seller-id="product.seller_id"
                                :seller-name="seller ? (seller.business_name || seller.name) : 'Seller'"
                                variant="secondary" size="md" class="w-full" />
                        </div>

                        <!-- Seller Info -->
                        <div v-if="seller" class="mt-6">
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Seller</h3>
                            <div
                                class="mt-2 flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-background-dark">
                                <div class="h-16 w-16 rounded-full bg-cover bg-center"
                                    :style="`background-image: url('${seller.profile_image || seller.logo || seller.profilePic || 'https://via.placeholder.com/150'}');`">
                                </div>
                                <div class="flex-1">
                                    <p class="font-semibold text-gray-800 dark:text-white">
                                        {{ seller.business_name || seller.name || 'Unknown Seller' }}
                                    </p>
                                    <a class="text-sm text-primary hover:underline" href="#">View Shop</a>
                                </div>
                                <MessageButton :seller-id="product.seller_id || seller.uid || seller.id"
                                    :seller-name="seller.business_name || seller.name || 'Seller'" variant="secondary"
                                    size="sm" />
                            </div>
                        </div>

                        <!-- Add to Cart Button -->
                        <div class="mt-10">
                            <RouterLink to="/cart/"
                                @click.prevent="selectedStockStatus.color === 'text-red-600' && $event.preventDefault()"
                                class="flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                :class="selectedStockStatus.color === 'text-red-600' ? 'bg-gray-400 pointer-events-none' : 'bg-primary hover:bg-primary/80'">
                                {{ selectedStockStatus.color === 'text-red-600' ? 'Out of Stock' : 'Add to Cart' }}
                            </RouterLink>
                        </div>
                    </div>
                </div>

                <!-- Customer Reviews Section (Below the grid, full width) -->
                <div class="mt-16">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>

                    <div
                        class="mt-4 flex flex-col md:flex-row items-start md:items-center gap-8 rounded-lg bg-white p-6 shadow-sm dark:bg-background-dark">
                        <div class="flex flex-col items-center">
                            <p class="text-5xl font-bold text-primary">4.8</p>
                            <div class="mt-1 flex items-center">
                                <span class="material-symbols-outlined text-yellow-500">star</span>
                                <span class="material-symbols-outlined text-yellow-500">star</span>
                                <span class="material-symbols-outlined text-yellow-500">star</span>
                                <span class="material-symbols-outlined text-yellow-500">star</span>
                                <span class="material-symbols-outlined text-yellow-500">star_half</span>
                            </div>
                            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Based on 125 reviews</p>
                        </div>

                        <div class="w-full flex-1">
                            <div class="flex items-center gap-2">
                                <span class="text-sm text-gray-600 dark:text-gray-400">5</span>
                                <div class="h-2 w-full flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div class="h-2 rounded-full bg-primary" style="width: 70%;"></div>
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">70%</span>
                            </div>
                            <div class="mt-1 flex items-center gap-2">
                                <span class="text-sm text-gray-600 dark:text-gray-400">4</span>
                                <div class="h-2 w-full flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div class="h-2 rounded-full bg-primary" style="width: 20%;"></div>
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">20%</span>
                            </div>
                            <div class="mt-1 flex items-center gap-2">
                                <span class="text-sm text-gray-600 dark:text-gray-400">3</span>
                                <div class="h-2 w-full flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div class="h-2 rounded-full bg-primary" style="width: 5%;"></div>
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">5%</span>
                            </div>
                            <div class="mt-1 flex items-center gap-2">
                                <span class="text-sm text-gray-600 dark:text-gray-400">2</span>
                                <div class="h-2 w-full flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div class="h-2 rounded-full bg-primary" style="width: 3%;"></div>
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">3%</span>
                            </div>
                            <div class="mt-1 flex items-center gap-2">
                                <span class="text-sm text-gray-600 dark:text-gray-400">1</span>
                                <div class="h-2 w-full flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div class="h-2 rounded-full bg-primary" style="width: 2%;"></div>
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">2%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Sample Reviews -->
                    <div class="mt-6 space-y-6">
                        <div class="flex gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-background-dark">
                            <div class="h-12 w-12 flex-shrink-0 rounded-full bg-cover bg-center"
                                style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDpniYb7D3tMLnCI7ITT5j59BgcmXpGQ6-mH7eN48M5sdTooruX4x0I53gNp42lDWA6liEyDDU_hbuLI7XoUQC4fzoh4kGW5eV7LAmeLLti4vUXLMFvfMRkA0IB4s-T77MPJankY5jUoN6LmKgzVV9M5S1wGS3K9nq2FbrqGIk-iIbsGheYVHVm4JTVZF-nMXTq73G8Z8mJmUFVoAHu2xoDflgkBACFrxjtszIAuvmns1VTcKs5qubbgcqngMnJAcaXSbHzjEKXMgj0");'>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h4 class="font-semibold text-gray-800 dark:text-white">Sophia Carter</h4>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">2 weeks ago</p>
                                </div>
                                <div class="mt-1 flex items-center">
                                    <span class="material-symbols-outlined text-yellow-500">star</span>
                                    <span class="material-symbols-outlined text-yellow-500">star</span>
                                    <span class="material-symbols-outlined text-yellow-500">star</span>
                                    <span class="material-symbols-outlined text-yellow-500">star</span>
                                    <span class="material-symbols-outlined text-yellow-500">star</span>
                                </div>
                                <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                    Absolutely love this product! The craftsmanship is superb, and it feels great. It's
                                    become my favorite.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Image Zoom Modal with smooth transitions -->
        <transition enter-active-class="transition-opacity duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="showImageModal" @click="closeImageModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
                <!-- Close button -->
                <button @click="closeImageModal"
                    class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <!-- Zoom Controls -->
                <div class="absolute top-4 left-4 flex gap-2 z-10">
                    <button @click.stop="zoomIn"
                        class="bg-white/10 hover:bg-white/20 text-white rounded-lg p-2 transition-colors backdrop-blur-sm">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                    </button>
                    <button @click.stop="zoomOut"
                        class="bg-white/10 hover:bg-white/20 text-white rounded-lg p-2 transition-colors backdrop-blur-sm">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                        </svg>
                    </button>
                    <button @click.stop="resetZoom"
                        class="bg-white/10 hover:bg-white/20 text-white rounded-lg p-2 transition-colors backdrop-blur-sm">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

                <!-- Zoom level indicator -->
                <div
                    class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-10">
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