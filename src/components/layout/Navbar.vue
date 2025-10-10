<script setup>
    import { user } from "@/store/user.js";

    //Firebase authetication - check to see if user has logged in or not.
    /*
    import { ref, onMounted } from "vue";
    import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

    const user = ref(null);
    const defaultProfilePic = "/default-profile.png";

    const auth = getAuth();

    onMounted(() => {
    onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser;
    });
    });

    function logout() {
    signOut(auth)
        .then(() => {
        user.value = null;
        })
        .catch((error) => {
        console.error("Logout error:", error);
        });
    }

    */
</script>

<template>
    <header
        class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-background-light/80 px-4 py-3 backdrop-blur-sm dark:border-slate-800/80 dark:bg-background-dark/80 sm:px-6 lg:px-8">
        <div class="flex items-center gap-6">
            <RouterLink to="/">
                <div class="flex items-center gap-2">
                    <img src="../../assets/logo_housebibi_2.png" alt="My image" class="h-8 w-8">
                    <path
                        d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                        fill="currentColor"></path>
                    <h1 class="text-xl font-bold text-slate-900 dark:text-white">HousebibiGoWhere</h1>
                </div>
            </RouterLink>
            <nav class="hidden items-center gap-6 md:flex">
                <RouterLink to="/"
                    class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    href="#">Home</RouterLink>
                <RouterLink to="/categories/"
                    class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    href="#">Categories</RouterLink>
                <RouterLink to="/about/"
                    class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    href="#">About Us</RouterLink>
                <RouterLink to="/for-sellers"
                    class="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    href="#">For Sellers</RouterLink>
            </nav>
        </div>
        <div class="flex items-center gap-4">
            <div class="relative hidden lg:block">
                <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z">
                        </path>
                    </svg>
                </span>
                <input
                    class="h-10 w-48 rounded-lg border-slate-300 bg-slate-100 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-500 focus:border-primary focus:ring-primary"
                    placeholder="Search..." type="text" />
            </div>
        </div>

            <!-- <button
                        class="hidden rounded-full p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 sm:block">
                        <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z">
                            </path>
                        </svg>
                    </button>
                    <button
                        class="hidden rounded-full p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 sm:block">
                        <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z">
                            </path>
                        </svg>
                    </button> -->

            <div>
                    <div v-if="!user.isLoggedIn" class="flex items-center gap-4">
                        <RouterLink to="/signup/" 
                            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-accent text-white text-sm font-bold leading-normal tracking-wide hover:bg-accent/90 transition-colors">
                            <span class="truncate">Sign Up</span>
                        </RouterLink>

                        <RouterLink to="/login/" 
                            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background text-gray-800 border border-gray-300 text-sm font-bold leading-normal tracking-wide hover:bg-gray-100 transition-colors">
                            <span class="truncate">Log In</span>
                        </RouterLink>
                    </div>
                    <div v-else class="flex items-center gap-4">
                        <!-- Cart Icon -->
                        <button @click="() => console.log('Go to cart')" 
                                class="relative p-2 rounded-lg bg-primary text-white hover:bg-primary/90">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7H19M7 13l-4-8m16 0v2M9 21h6"/>
                            </svg>
                            <!-- Cart Item Count Badge -->
                            <span class="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-4 h-4">
                            {{ user.cart.length }}
                            </span>
                        </button>

                        <!-- Wishlist Icon -->
                        <button @click="() => console.log('Go to wishlist')" 
                                class="relative p-2 rounded-lg bg-primary text-white hover:bg-primary/90">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 8c0-1.105.895-2 2-2h12c1.105 0 2 .895 2 2v12l-8-4-8 4V8z"/>
                            </svg>
                            <!-- Wishlist Count Badge -->
                            <span class="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-4 h-4">
                            {{ user.wishlist.length }}
                            </span>
                        </button>

                        <!-- Profile Picture -->
                        <img :src="user.avatar" alt="avatar" class="h-10 w-10 rounded-full"/>
                    </div>
            </div>
            

        <!-- <img alt="User avatar" class="h-10 w-10 rounded-full"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAMJx_5eJzz0Sh9loNmGlo-UuScFKKIPfNcl8R1lQteskge8Eeo-wMKFgotFUs-eoR0hyy_0Y5DOQiEYVr_94xEJLyUdSqcSGDHB852pDylXrQAchMaX72KC6t28ruC7_2ywm4bzOQqL2CLrUaGDMi5OJYVmB6edhWn91_8RxcR81wJzAhq5ijVqD8u7fdaOIYRKaF8pLlJuf-QO05QuwJyAvPRyacWiQWhNLd5oZWbId_OWpbQQfFdy1WX-3EiEfV-c9EVRzta92K" /> -->
    </header>
</template>