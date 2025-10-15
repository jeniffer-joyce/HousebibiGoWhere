<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProduct } from '@/composables/useProduct'

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
    stockStatus,
    loadProduct,
    selectImage
} = useProduct(productId)

// Load product on mount
onMounted(() => {
    loadProduct()
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
        <div v-else class="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <!-- Left Column - Images & Reviews -->
            <div class="flex flex-col gap-4">
                <!-- Product Images -->
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <!-- Main Image -->
                    <div class="col-span-3 h-96 rounded-lg bg-cover bg-center bg-no-repeat"
                        :style="`background-image: url('${mainImage}');`">
                    </div>

                    <!-- Thumbnail Images -->
                    <div v-for="(image, index) in productImages.slice(0, 3)" :key="index" @click="selectImage(index)"
                        class="h-40 rounded-lg bg-cover bg-center bg-no-repeat cursor-pointer border-2 transition-all"
                        :class="selectedImage === index ? 'border-primary' : 'border-transparent hover:border-gray-300'"
                        :style="`background-image: url('${image}');`">
                    </div>
                </div>

                <!-- Customer Reviews Section -->
                <div class="mt-8">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
                    <div class="mt-4 flex items-center gap-8 rounded-lg bg-white p-6 shadow-sm dark:bg-background-dark">
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

                    <!-- Sample Reviews (You can make this dynamic too) -->
                    <div class="mt-6 space-y-6">
                        <div class="flex gap-4">
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
                                    Absolutely love this product! The craftsmanship is superb, and it feels great.
                                    It's become my favorite.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column - Product Details -->
            <div class="space-y-8">
                <!-- Breadcrumb -->
                <div>
                    <nav aria-label="Breadcrumb">
                        <ol class="flex items-center space-x-2 text-sm">
                            <li>
                                <a class="text-gray-500 hover:text-primary dark:text-gray-400" href="#">Home</a>
                            </li>
                            <li>
                                <span class="material-symbols-outlined text-sm text-gray-400">chevron_right</span>
                            </li>
                            <li>
                                <span class="font-medium text-gray-700 dark:text-gray-300">{{ product.category ||
                                    'Products' }}</span>
                            </li>
                        </ol>
                    </nav>

                    <!-- Product Name -->
                    <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        {{ product.item_name }}
                    </h1>

                    <!-- Price -->
                    <p class="mt-4 text-3xl text-gray-900 dark:text-white">{{ formattedPrice }}</p>
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
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">Size</h3>
                    <p class="mt-2 text-base text-gray-600 dark:text-gray-300">{{ product.size }}</p>
                </div>

                <!-- Stock Status -->
                <div class="mt-6">
                    <p class="text-sm font-medium" :class="stockStatus.color">
                        {{ stockStatus.text }}
                    </p>
                </div>

                <!-- Seller Info -->
                <div v-if="seller" class="mt-6">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">Seller</h3>
                    <div class="mt-2 flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-background-dark">
                        <div class="h-16 w-16 rounded-full bg-cover bg-center"
                            :style="`background-image: url('${seller.profile_image || seller.logo || 'https://via.placeholder.com/150'}');`">
                        </div>
                        <div>
                            <p class="font-semibold text-gray-800 dark:text-white">
                                {{ seller.business_name || seller.name || 'Unknown Seller' }}
                            </p>
                            <a class="text-sm text-primary hover:underline" href="#">View Shop</a>
                        </div>
                    </div>
                </div>

                <!-- Add to Cart Button -->
                <div class="mt-10">
                    <button :disabled="stockStatus.color === 'text-red-600'"
                        class="flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="stockStatus.color === 'text-red-600' ? 'bg-gray-400' : 'bg-primary hover:bg-primary/80'"
                        type="button">
                        {{ stockStatus.color === 'text-red-600' ? 'Out of Stock' : 'Add to Cart' }}
                    </button>
                </div>
            </div>
        </div>
    </main>
</template>