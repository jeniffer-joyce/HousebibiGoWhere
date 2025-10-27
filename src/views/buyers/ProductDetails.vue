<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProduct } from '@/composables/useProduct'
import MessageButton from '@/components/messageButton.vue'

const route = useRoute()

// Get product ID from route params
const productId = computed(() => route.params.id)

// Use the product composable
const {
    product,
    seller,
    loading,
    error,
    selectedImage,
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

const selectedSize = ref(0);
// Computed property for formatted price based on selected size index
const selectedFormattedPrice = computed(() => {
    if (selectedSize.value !== null && product.value?.price) {
        // Return the formatted price corresponding to the selected size
        return `$${parseFloat(product.value.price[selectedSize.value]).toFixed(2)}`;
    }
    // Default to the first price if no size is selected
    return formattedPrice.value[0]
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
            text: 'Limited availability',
            color: 'text-yellow-600'
        }
    } else {
        return {
            text: `In stock (${selectedQuantity.value} available)`,
            color: 'text-green-600'
        }
    }
})
// Function to handle size selection
const selectSize = (index) => {
    selectedSize.value = index
}

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
                    <!-- All Images -->
                    <div v-for="(image, index) in productImages" :key="index"
                        class="h-96 rounded-lg bg-cover bg-center bg-no-repeat"
                        :style="`background-image: url('${image}');`">
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

                        <!-- Stock Status -->
                        <div class="mt-6">
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
                            <button :disabled="selectedStockStatus.color === 'text-red-600'"
                                class="flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                :class="selectedStockStatus.color === 'text-red-600' ? 'bg-gray-400' : 'bg-primary hover:bg-primary/80'"
                                type="button">
                                {{ selectedStockStatus.color === 'text-red-600' ? 'Out of Stock' : 'Add to Cart' }}
                            </button>
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
    </main>
</template>