<template>
    <main class="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div
            class="flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-8 p-8 bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32 flex-shrink-0"
                :style="profilePicStyle">
            </div>
            <div v-if="business" class="flex flex-col items-center md:items-start gap-2">
                <h1 class="text-3xl font-bold text-background-dark dark:text-background-light">{{ business.name }}</h1>
                <p class="text-base text-background-dark/70 dark:text-background-light/70">{{ business.description }}
                </p>
                <div class="flex items-center gap-2 text-background-dark/70 dark:text-background-light/70">
                    <span class="material-symbols-outlined text-xl text-primary">star</span>
                    <span class="font-semibold">4.8</span>
                    <span>(120 Reviews)</span>
                </div>
                <button
                    class="mt-4 flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-sm hover:bg-opacity-90 transition-colors">Follow</button>
            </div>
            <div v-else>
                <Loading />
            </div>
        </div>
        <div class="mt-8">
            <div class="border-b border-primary/20">
                <nav aria-label="Tabs" class="-mb-px flex space-x-8">
                    <a class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-background-dark/60 dark:text-background-light/60 hover:text-primary hover:border-primary/50 dark:hover:border-primary/50"
                        href="#"> About </a>
                    <a aria-current="page"
                        class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-primary text-primary"
                        href="#"> Products </a>
                    <a class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-background-dark/60 dark:text-background-light/60 hover:text-primary hover:border-primary/50 dark:hover:border-primary/50"
                        href="#"> Reviews </a>
                </nav>
            </div>
        </div>
        <section class="mt-10">
            <h2 class="text-2xl font-bold text-background-dark dark:text-background-light mb-6">Featured Products</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                    class="group flex flex-col rounded-lg overflow-hidden bg-white dark:bg-background-dark/50 shadow-sm transition-shadow hover:shadow-lg">
                    <div class="w-full bg-center bg-no-repeat aspect-square bg-cover"
                        style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDYzNnFQQk8pTpmaoH-iK-ELxpM5chtYyQGonQSLFzwzu0gc1I2tDpZTL7TL42ph2ORdUd2-n0bbNOjGvB-6UCo9QgYPzqzYzl663iNmIhH8_8GQV7kfmqLPfDO9c6SzmDk1LkLCeIUBoSxVL4cGeUkg8AGAnunxzzXu5oJwYzz1zrLdp2locj3FnrsplB2VUtRNcI-mcII6ej6KIXQVjmK-y1Y6KzPWupbKhBz5X_YcIJyqg6H6wu50CY1hT1RORRkRge9a0U5n00R");'>
                    </div>
                    <div class="p-4 flex-1 flex flex-col">
                        <h3 class="text-base font-semibold text-background-dark dark:text-background-light">Hand-knitted
                            Throw Blanket</h3>
                        <p class="text-sm text-background-dark/70 dark:text-background-light/70 mt-auto pt-2">$45</p>
                    </div>
                </div>
                <div
                    class="group flex flex-col rounded-lg overflow-hidden bg-white dark:bg-background-dark/50 shadow-sm transition-shadow hover:shadow-lg">
                    <div class="w-full bg-center bg-no-repeat aspect-square bg-cover"
                        style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBoB6wsaFBzXIN4EG6bVJFVERxeLaes8CQIPPgSW7oeQh3f6PvFt_YGEC9nOmN-EKbd2zcGF_Cc4f75OJ5y0GOqePBKAfiyMNjr3DbUk8zQMEPJi8gbBFUn0HPH6_s_mwoO0N88QED4wOCiJ-761BVks6FSKyuv45TCsxgqf3gVBhFKBOqLluoXQTY4CwbQY3zIKCG-q4OlP9K2uwKFYlXQ0jEF4kfUEI_TD3bBZhRlgIKOtc2myXEh0Ix06f-7TSolBJ_BbN3KDWQ_");'>
                    </div>
                    <div class="p-4 flex-1 flex flex-col">
                        <h3 class="text-base font-semibold text-background-dark dark:text-background-light">Scented Soy
                            Candles</h3>
                        <p class="text-sm text-background-dark/70 dark:text-background-light/70 mt-auto pt-2">$15</p>
                    </div>
                </div>
                <div
                    class="group flex flex-col rounded-lg overflow-hidden bg-white dark:bg-background-dark/50 shadow-sm transition-shadow hover:shadow-lg">
                    <div class="w-full bg-center bg-no-repeat aspect-square bg-cover"
                        style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDOotewaguwlhOHvqNLEaO4qAKL9xDgV5IDve3UVdzhCHT6aaHHmtx9jxMXOb0ljYWrKaQrEfz52NeVgIB9-fH2QRK-IrRxJ21DTVhTDnINgMYTdlTBmrzkjZLejqR30mGIYbeJ0x7mxgJVolYAbeqrHDs0zXJKaXVgfQGJGgu289VIC86NBWTn65Y-EuAy3nrGT9sbxerMnxhMn6iEcJoCk_2qY9O3itq5bit4NUhRcPDcJXgQFFc0BOe9yflZlRLKCIvQGXpTM4yf");'>
                    </div>
                    <div class="p-4 flex-1 flex flex-col">
                        <h3 class="text-base font-semibold text-background-dark dark:text-background-light">Artisan Soap
                            Set</h3>
                        <p class="text-sm text-background-dark/70 dark:text-background-light/70 mt-auto pt-2">$20</p>
                    </div>
                </div>
                <div
                    class="group flex flex-col rounded-lg overflow-hidden bg-white dark:bg-background-dark/50 shadow-sm transition-shadow hover:shadow-lg">
                    <div class="w-full bg-center bg-no-repeat aspect-square bg-cover"
                        style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuA6TYJD5ZqjX1vAJVOu3UyOuaBIKuMPoLSTX0WVXpk7Zfe2CvyKShHBQwaOtYYS3-8JtoFhrmDQWEouBaD59hmsxUXXe3DaHZTOLKBKhHkXcxlK2VqjTlsOxaN9MomsWeuBsDJmtEp1x_jgRRI7-QfT3VYwdcZxMbH7YhN-wz0oGZKIKnVmuAo0TiGXWdS7upJR1B1YHYabziI7HWGXw_0tY5l-zfKhjLKcdM_9xd6cdoUExrCbjRiuV89qVViS_4rR3BDDzVsXmnjk");'>
                    </div>
                    <div class="p-4 flex-1 flex flex-col">
                        <h3 class="text-base font-semibold text-background-dark dark:text-background-light">Ceramic
                            Coffee Mugs</h3>
                        <p class="text-sm text-background-dark/70 dark:text-background-light/70 mt-auto pt-2">$12</p>
                    </div>
                </div>
            </div>
            <div class="mt-8 flex justify-center">
                <button
                    class="flex items-center justify-center rounded-lg h-10 px-6 bg-primary/10 dark:bg-primary/20 text-primary text-sm font-bold hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">View
                    All Products</button>
            </div>
        </section>
        <section class="mt-12">
            <h2 class="text-2xl font-bold text-background-dark dark:text-background-light mb-6">Customer Reviews</h2>
            <div class="space-y-8">
                <div class="flex flex-col gap-3 p-4 rounded-lg bg-white dark:bg-background-dark/50 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                            style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDDXSJSZps974dSmZos44bQ4fkVJvtVwiH3d7TXHIdpmz3GwZlK5Ntcd1NJUcd-6g8bZUiLD4FGP3Ja7r8X6IsNfzOC5XwSlD8dTS321IodUu8SSmC11Tq1cQeJzFXpCYuVrirtXgVOFcibUQPIXcF3hWDvx9TuHppAF5yqeA1RxWVPfk37kj-r25aJA2rksTLnAN3FPKU7WhoUuGS1vS19-C6IXVkli9flviCrfkgBLGJeFcgIi6Cs-jamK7CGv9BsGEFvtoldckBo");'>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold text-background-dark dark:text-background-light">Sophia</p>
                            <p class="text-xs text-background-dark/60 dark:text-background-light/60">2 weeks ago</p>
                        </div>
                    </div>
                    <div class="flex gap-0.5 text-primary">
                        <span class="material-symbols-outlined text-base">star</span>
                        <span class="material-symbols-outlined text-base">star</span>
                        <span class="material-symbols-outlined text-base">star</span>
                        <span class="material-symbols-outlined text-base">star</span>
                        <span class="material-symbols-outlined text-base">star</span>
                    </div>
                    <p class="text-sm text-background-dark/80 dark:text-background-light/80">
                        Absolutely love the throw blanket I purchased! It's so soft and cozy, perfect for chilly
                        evenings. The quality is excellent, and the craftsmanship is evident. Highly recommend!
                    </p>
                </div>
                <div class="flex flex-col gap-3 p-4 rounded-lg bg-white dark:bg-background-dark/50 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                            style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuA8OR5kpRLPMky4F6t0lMZm_G4o3WNgP5M2uxKWJOXHUyFAaPDwUeDLt4Ccv0wKiDKya4MeGm_74lmKLI9NvPiLZKzWnba2oD1o1ZL_Afqsi5i7W-5lGuBScMWHOwS0EDvBKl2irDcYgCRkkN-a1TGVYlBP-JL_jYT_IPwayaoPvWhuKn3U-j4Yh_e2ocWCZHpuotpk7cFjIEXfpbKKcSCiFtyCvYN3LN-qp8ASWis8dCVAk4NDpEE7O7Fnm_BtGuz5d2b01ljaIOFn");'>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold text-background-dark dark:text-background-light">Ethan</p>
                            <p class="text-xs text-background-dark/60 dark:text-background-light/60">1 month ago</p>
                        </div>
                    </div>
                    <div class="flex gap-0.5">
                        <span class="material-symbols-outlined text-base text-primary">star</span>
                        <span class="material-symbols-outlined text-base text-primary">star</span>
                        <span class="material-symbols-outlined text-base text-primary">star</span>
                        <span class="material-symbols-outlined text-base text-primary">star</span>
                        <span
                            class="material-symbols-outlined text-base text-background-dark/30 dark:text-background-light/30">star</span>
                    </div>
                    <p class="text-sm text-background-dark/80 dark:text-background-light/80">
                        The scented candles are lovely, but the scent could be a bit stronger. Overall, a good product
                        for the price.
                    </p>
                </div>
                <div class="flex flex-col gap-3 p-4 rounded-lg bg-white dark:bg-background-dark/50 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                            style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBDXu2pguYR7AezNQUFVJpWpYk048Zh5-5JBnNGcZCQgEmSuYW52uOeSm82u56G4oOAjXKNN0XyVrb_dmTVv-w0yIvE2VUl4bYITx0EatHHHgB8jlZbwSHNARNDW2cpxByTgLKB7BKkA-4iuKoV0c10lexiYhiYN72V5QkvdLqwHZiaNpZdUp7imVopNqsMxX5hcom67-6qB-PZt2TXrqxu1iD-FG2AqaEFzLAvZbyYNyWZAQxfpHci5DgfeAox8aFxS9N72PSw_4FJ");'>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold text-background-dark dark:text-background-light">Olivia</p>
                            <p class="text-xs text-background-dark/60 dark:text-background-light/60">2 months ago</p>
                        </div>
                    </div>
                    <div class="flex gap-0.5 text-primary">
                        <span class="material-symbols-outlined text-base">star</span>
                        <span class="material-symbols-outlined text-base">star</span>
                        <span class="material-symbols-outlined text-base">star</span>
                        <span class="material-symbols-outlined text-base">star</span>
                        <span class="material-symbols-outlined text-base">star</span>
                    </div>
                    <p class="text-sm text-background-dark/80 dark:text-background-light/80">
                        The artisan soap set is a fantastic gift! The soaps smell amazing and are beautifully packaged.
                        The recipient was thrilled. Will definitely order again.
                    </p>
                </div>
            </div>
        </section>
    </main>
</template>

<script setup>
import { getBusinesses } from '@/firebase/services/home/business.js';
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import Loading from '@/components/status/Loading.vue';
import defaultProfilePic from '@/assets/defaultBusinessLogo.png'

const route = useRoute();
const businessId = route.params.id; // Get the dynamic :id from URL

const business = ref(null);

onMounted(async () => {
    const businesses = await getBusinesses();
    business.value = businesses.find(b => b.businessId === businessId);
});

// Style for profile picture background image
const profilePicStyle = computed(() => {
     return `background-image: url(${business.value?.profilePic || defaultProfilePic})`  // Default image if no profilePic
});



</script>