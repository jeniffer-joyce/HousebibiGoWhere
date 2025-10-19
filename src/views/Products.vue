<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { user } from '@/store/user.js'

// Track local wishlist state for UI
// const wishlist = computed(() => user.wishlist)

// Temporary Array of Products (NEED TO REMOVE AND REPLACE IT BY TAKING FROM FIREBASE)
const products = ref([
  { id: 1, name: 'Handmade Soap', price: 12, seller: 'The Soap Shop', material: 'Soap', rating: 4, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5U45vvmTCAxuSrzQ6Vs4KCHjGXXXXrRRYBGI7AWjGG1J_8XbdZJ1VbK6maV1iqBBb3CtEyvzchReQfncyDrQV3t_gVwv5P9bEOU5pC5VYroExmtNHo3993fnnqiEa3CH6ohglqWG13Pug8Q2jrRxjNKgFFo-7mIogJ1cSfxIjW1hPw5lfjewGKxJi5IWQPkvHUKyn333XEDwbhJMKdyzQ_F0wd9-qD19BaMeZ5180TFN7gRvH_0pSiT_KlhScaDUW4we3paDMTY9g' },
  { id: 2, name: 'Knitted Scarf', price: 45, seller: 'Cozy Knits', material: 'Wool', rating: 5, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuF6wf2dyKgATsJ1g-PPmi5oZ0uPkhedbq7-5X1i7Qt8zKoec8bA2ehiTuSXOlMQAVhaqQLyME6MqtrGfqQwSgI80QA3m--clsJJou8IlPecCH_esy1YpScknaVW2wEBpqUATmqP8uOeKs3Q8EV_ec4kxN8GOew__a91LcqkmBe0pVkebHPlnebrXzzhUYuoHobK4rfb4dPvZY2YeFUwElyAjd5tQ1fJTYFwoIgXPSY_ySBsjkFgBCxxfQJyNedTt81TmLiSecqSg_' },
  { id: 3, name: 'Ceramic Mug', price: 25, seller: 'Pottery Place', material: 'Ceramic', rating: 3, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjXzNrHDmdQNdyGZlyVilq94wODe2XIub9_PHodXjOhTAG8K6Ax9Ysq1E69-caaVRVzB-59E6MhukYF4IaGkjU9H41dWdSqFukusJa_jXCHik8z02exK841lIz7AugjIzUUWv5gx0Dp61apevCX_R2Hw14XFPWaA7YgjmWlVxqeuRzTlr4xI4yQZxZPdhN7BG2ZHdK-pm7w1rTau_dWCVKBOY8eq8VDHQLQVppOWtiH9eUsnvqPCYNVT1OWGag3f0Q7167EWoRElRW' },
  { id: 4, name: 'Wooden Coasters', price: 20, seller: 'Woodcraft Wonders', material: 'Wood', rating: 4, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSGoUSw-biU84chxrc928kCki4JmQvFI8gYUXeBN-kaeXvPns_z_9ZQjXeY7sv4-8zhu-WqTtJLLokrJkIsKi_DR_SJyEpVBz2ifPtX1jwpYh5451435nNSJ7OowggLqDXeJ1plRe0K-VjVI1lRCFwIKRoliwoFb-msQcLD0nh5OEfc0iLv4wAkp8VkfQa73csP_pn-Yp7lCMl88Hy9QICc2WC6hsssivbciE2nRFpOsyBgrzY-XHdBbrkk30WMoAtYL-InPshb8TF' },
  { id: 5, name: 'Scented Candle', price: 18, seller: 'Candlelight Creations', material: 'Wax', rating: 5, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8Z_aDLqCJT9Q6EBpKbYWvy1YLdzZ_FWIa8xlZ8yNTCRH1a4S8d6EXELohYy17292MDzJQP---3xH5iBbYh0l3Wqm2hWzrP-15D0QMy5qGpcYe3d3Bgr6yUkRs-bCsV_9QSwM5L7kzaYdppNMnxWl6URRgy6wGypE6OrTPKNAIxwU8b3weEkOcOJvNT5QLScU0d-TgJBDVYEAPsPbV1uwxTiKX4EvbGmesDnOr9Pm8KYEDBBicaM9fGdEE2dPt3A6OHtqhV2jsXNNA' },
  { id: 6, name: 'Crochet Blanket', price: 80, seller: 'Crochet Corner', material: 'Wool', rating: 4, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgJHuk9ndm2jxETNbk3vrcw61UxsNVEBqDVVosoLwWKfi_hwMGXN5A4z1uLPeuLX2F9YWXYVn4INHs6EnLBwG8LmxFB3JtAJqwp0aRfEKw-gRDQweyaDpELPJYr2YLi2UYbZUVdepA5z94au8EFBOJEMyMOjzPFDfOk9IHvcWo7N8bZnaH9j9Q04hDh1uiQnPfz5gg6A9AO2D6oxcG5oRDha93o-yFnOaXYa3cElUe6W7g2XfmUoYftSwlqoVX7wt1mevuIUhKkfI8' },
  { id: 7, name: 'Painted Vase', price: 35, seller: 'Artistic Vases', material: 'Ceramic', rating: 5, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_iL1b0TMaoUSzOqtZJhZJHAHXIObEVUsMCl8JPrEJtj27dfL02uvUovp_zkcBpKjSKmhkrNQnuik7E2ksUThvQCXwbY2N60kmo8ca_gHEoRJp7KTOtHpnG3HZYSLla2XS0xP3gMl7s0nnT2xaBpUqHb2YKOD9LXWfPsl1od07I0K1IMzRlLDvgMm3ys2WTgkmqm7d0p0c02_t6_OyjWnwegwiTnHbHBVaEwObkON1lAZ30CFUYujp0efHwysaDUfC1VHsHsDC4bc4' },
  { id: 8, name: 'Beaded Jewelry', price: 22, seller: 'Jewelry Junction', material: 'Glass', rating: 3, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGDnb4PmAGNjYJ1OKoTEDbVG8L31z2B9mCdjFBf66E97WHNRSsTEJDLPLtFiyfPf6jpRnq-urOpHyd-eqTp1cKSvMM3GRx6WkOS0kNlPS7gEelqv7tMKdSqcefSBiohUskzI3oC4SesjBLuMDo_yf7ExPad0f3_xHbXVKD4M0kAseP5-AL4ET5r1FNqn88xF85l6kNqRyLh2gPDr1yYda1Hs-6eP-ejUSMUxu9tcy3EcUeej8o0jLjpvHd1LbdNLO4InKi_xyVCAx6' },
])



/* Toggle a product in wishlist
function toggleWishlist(product) {
  const index = user.wishlist.findIndex(item => item.id === product.id)
  if (index === -1) {
    user.wishlist.push(product)  // Add
  } else {
    user.wishlist.splice(index, 1) // Remove
  }
}


// Check if product is in wishlist
function isInWishlist(product) {
  return user.wishlist.some(item => item.id === product.id)
}
*/

// Example filters data
const filters = ref({
  price: ['Under $20', '$20 - $50', '$50 - $100', 'Over $100'],
  seller: ['The Soap Shop', 'Cozy Knits', 'Pottery Place', 'Woodcraft Wonders'],
  rating: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
  material: ['Cotton', 'Wool', 'Ceramic', 'Wood', 'Glass']
})

const openFilter = ref(null)

// Track selected filter option
const selectedFilters = reactive({
  price: null,
  seller: null,
  rating: null,
  material: null,
})

// Computed array of selected filters for pills
const selectedFilterArray = computed(() => {
  return Object.entries(selectedFilters).filter(([key, val]) => val)
})

// Toggle dropdown open/close
function toggleDropdown(key) {
  openFilter.value = openFilter.value === key ? null : key
}

// Select an option
function selectOption(key, option) {
  selectedFilters[key] = option
  openFilter.value = null // close dropdown
}

// Clear all filters
function clearAllFilters() {
  Object.keys(selectedFilters).forEach(key => selectedFilters[key] = null)
  openFilter.value = null
}

// Clear individual filter
function clearFilter(key) {
  selectedFilters[key] = null
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  if (!event.target.closest('.filter-dropdown')) {
    openFilter.value = null
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

// Filtered products
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const priceMatch = !selectedFilters.price ||
      (selectedFilters.price === 'Under $20' && p.price < 20) ||
      (selectedFilters.price === '$20 - $50' && p.price >= 20 && p.price <= 50) ||
      (selectedFilters.price === '$50 - $100' && p.price > 50 && p.price <= 100) ||
      (selectedFilters.price === 'Over $100' && p.price > 100)

    const sellerMatch = !selectedFilters.seller || p.seller === selectedFilters.seller
    const materialMatch = !selectedFilters.material || p.material === selectedFilters.material
    const ratingMatch = !selectedFilters.rating || p.rating === parseInt(selectedFilters.rating)

    return priceMatch && sellerMatch && materialMatch && ratingMatch
  })
})

</script>

<template>
    <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center gap-2 text-sm text-subtle-light dark:text-subtle-dark mb-6">
            <RouterLink to="/"
            class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
            href="#">Home</RouterLink>
            <span class="material-symbols-outlined text-base">chevron_right</span>
            <span class="font-medium text-foreground-light dark:text-foreground-dark">Crafts</span>
        </div>
        <div class="flex flex-col lg:flex-row gap-8">
            <aside class="w-full lg:w-1/4">
                <div class="sticky top-28">
                    <h2 class="text-2xl font-bold mb-6">Crafts</h2>
                    <div class="space-y-6">
                        <div>
                            <h3 class="font-bold mb-3 flex justify-between items-center">
                            Filters
                            <button v-if="selectedFilterArray.length" @click="clearAllFilters" class="text-sm text-primary hover:underline">Clear All</button>
                            </h3>

                            <!-- Selected Filter Pills -->
                            <div class="flex flex-wrap gap-2 mb-2">
                            <span v-for="([key, val], idx) in selectedFilterArray" :key="key"
                                class="flex items-center gap-1 bg-blue-200 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
                                {{ val }}
                                <button @click="clearFilter(key)" class="text-xs font-bold">&times;</button>
                            </span>
                            </div>


                            <!--Filter Dropdown-->
                            <div class="flex flex-wrap gap-2">
                                <div
                                    v-for="(options, key) in filters"
                                    :key="key"
                                    class="relative filter-dropdown"
                                >
                                    <button
                                    @click.stop="toggleDropdown(key)" 
                                    class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-background-light dark:bg-background-dark hover:bg-primary/10 dark:hover:bg-primary/20"
                                    >
                                    {{ selectedFilters[key] || key.charAt(0).toUpperCase() + key.slice(1) }}
                                    <span
                                        class="material-symbols-outlined text-lg transition-transform duration-200"
                                        :class="{ 'rotate-180': openFilter === key }"
                                    >
                                        expand_more
                                    </span>
                                    </button>

                                    <!-- Dropdown -->
                                    <div
                                    v-if="openFilter === key"
                                    class="absolute mt-2 bg-background-light dark:bg-background-dark border rounded-lg shadow-lg z-10 w-40"
                                    >
                                    <div
                                        v-for="option in options"
                                        :key="option"
                                        @click="selectOption(key, option)"
                                        class="px-4 py-2 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer"
                                    >
                                        {{ option }}
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        <div>
                            <h3 class="font-bold mb-3">Sort by</h3>
                            <div class="relative">
                                <select
                                class="form-select appearance-none w-full rounded-lg border-background-dark/20 dark:border-background-light/20 bg-background-light dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-12 px-4 focus:border-primary focus:ring-primary"
                                >
                                    <option>Most Popular</option>
                                    <option>Newest</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-subtle-light dark:text-subtle-dark">unfold_more</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
    <div class="flex-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div class="group" v-for="item in filteredProducts" :key="item.id">
                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                    <div
                    class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                    :style="{ backgroundImage: `url(${item.image})` }"
                    ></div>
                    <button
                    class="absolute top-3 right-3 rounded-full p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm text-foreground-light dark:text-foreground-dark hover:text-primary transition-colors"
                    >
                    <span class="material-symbols-outlined">
                        favorite_border
                    </span>
                    </button>
                </div>
                <div class="pt-3">
                    <h3 class="font-bold text-base">{{ item.name }}</h3>
                    <p class="text-sm text-subtle-dark dark:text-subtle-dark">{{ item.seller }}</p>
                    <p class="font-bold mt-1">${{ item.price }}</p>

                    <!-- Ratings -->
                    <div class="flex items-center mt-1">
                        <span v-for="n in 5" :key="n" class="text-yellow-500 text-sm">
                            <span v-if="n <= item.rating">★</span>
                            <span v-else class="text-gray-300 dark:text-gray-600">★</span>
                        </span>
                        <span class="ml-2 text-xs text-subtle-dark dark:text-subtle-dark">{{ item.rating }}/5</span>
                    </div>

                </div>
            </div>
        </div>
        <nav class="mt-12 flex items-center justify-center gap-2">
            <a class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-background-light dark:hover:bg-background-dark" href="#">
                <span class="material-symbols-outlined text-xl">chevron_left</span>
            </a>
            <a class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white" href="#">1</a>
            <a class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium hover:bg-background-light dark:hover:bg-background-dark" href="#">2</a>
            <a class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium hover:bg-background-light dark:hover:bg-background-dark" href="#">3</a>
            <span class="text-sm">...</span>
            <a class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium hover:bg-background-light dark:hover:bg-background-dark" href="#">8</a>
            <a class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-background-light dark:hover:bg-background-dark" href="#">
                <span class="material-symbols-outlined text-xl">chevron_right</span>
            </a>
        </nav>
        </div>
    </div>
</main>
</template>
