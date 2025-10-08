<template>
    <div class="bg-background dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
        <div class="flex min-h-screen w-full flex-col">
            <header
                class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-background-light/80 px-4 py-3 backdrop-blur-sm dark:border-slate-800/80 dark:bg-background-dark/80 sm:px-6 lg:px-8">
                <div class="flex items-center gap-6">
                    <div class="flex items-center gap-2">
                        <img src="../assets/logo_housebibi_2.png" alt="My image" class="h-8 w-8">
                            <path
                                d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                                fill="currentColor"></path>
                        <h1 class="text-xl font-bold text-slate-900 dark:text-white">HousebibiGoWhere</h1>
                    </div>
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
                    <RouterLink to="/signup/"
                        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-accent text-white text-sm font-bold leading-normal tracking-wide hover:bg-accent/90 transition-colors">
                        <span class="truncate">Sign Up</span>
                    </RouterLink>
                    <RouterLink to="/login/"
                        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background text-gray-800 border border-gray-300 text-sm font-bold leading-normal tracking-wide hover:bg-gray-100 transition-colors">
                        <span class="truncate">Log In</span>
                    </RouterLink>

                    <!-- <img alt="User avatar" class="h-10 w-10 rounded-full"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAMJx_5eJzz0Sh9loNmGlo-UuScFKKIPfNcl8R1lQteskge8Eeo-wMKFgotFUs-eoR0hyy_0Y5DOQiEYVr_94xEJLyUdSqcSGDHB852pDylXrQAchMaX72KC6t28ruC7_2ywm4bzOQqL2CLrUaGDMi5OJYVmB6edhWn91_8RxcR81wJzAhq5ijVqD8u7fdaOIYRKaF8pLlJuf-QO05QuwJyAvPRyacWiQWhNLd5oZWbId_OWpbQQfFdy1WX-3EiEfV-c9EVRzta92K" /> -->
                </div>
            </header>
            <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <div class="flex flex-col gap-10">
                    <div class="flex flex-col items-center gap-4 text-center">
                        <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                            Discover Home-Based Businesses
                        </h2>
                        <p class="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                            Explore a world of unique products and services, right from your neighborhood.
                        </p>
                        <div class="relative mt-4 w-full max-w-xl">
                            <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z">
                                    </path>
                                </svg>
                            </span>
                            <input
                                class="h-14 w-full rounded-xl border-slate-300 bg-white pl-12 pr-4 text-lg text-slate-800 placeholder-slate-500 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:border-primary"
                                placeholder="Search for products or businesses" type="text" />
                        </div>
                    </div>
                    <div>
                        <h3 class="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Categories</h3>
                        <div class="flex flex-wrap gap-3">
                            <button
                                class="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                                Baked Goods
                            </button>
                            <button
                                class="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                                Handmade Crafts
                            </button>
                            <button
                                class="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                                Home Services
                            </button>
                            <button
                                class="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                                Personalized Gifts
                            </button>
                            <button
                                class="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                                Catering
                            </button>
                            <button
                                class="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                                Tutoring
                            </button>
                        </div>
                    </div>
                    <div>
                        <h3 class="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Featured Businesses</h3>
                        <div class="relative">
                            <div
                                class="hide-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                                <div
                                    class="flex w-64 shrink-0 flex-col gap-3 overflow-hidden rounded-xl bg-white shadow-md dark:bg-slate-900">
                                    <img alt="Sweet Delights Bakery" class="h-40 w-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAH6Z8ErOzE73WyIn6KFIuGhKINB_LehnL4A0Bd3IxU5S8XaqW5ZBkXVK4_om7-xELoMKt1CsffYDVttejXHYDRQSwTsXpYu-UHb7-KbsZIKiE9k6ofSe7r8AQaHzHuDhtbz4OfKoh1Eb2lYWvM28rbKBu6gPu7cxU15Hef5mk-UU-r9FoP1PxwW24RZhMCT_PZNq2yF3WW6mVQhju3hLGUl_uvhvEKI1GRYVGX3FZqVHdaCKTmaRs6DiNrVNuzFcHfM6smMt7IOAkU" />
                                    <p class="px-4 pb-4 text-base font-semibold text-slate-800 dark:text-slate-200">
                                        Sweet Delights Bakery
                                    </p>
                                </div>
                                <div
                                    class="flex w-64 shrink-0 flex-col gap-3 overflow-hidden rounded-xl bg-white shadow-md dark:bg-slate-900">
                                    <img alt="Crafty Creations" class="h-40 w-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaMgPzv_udZpxox49El-cbdRrPNSJA4oViuVSFUpAPt6zpJdHBU9U0931hLH8vDDzjL1RzgnRhWAkAcW-34Zl6-FbFCaBK_Gb_pMFixmem_9i3zRPAEtMOQ0DQX2Zv0ehxnlqxbrX_jV97OyRD2w_Om2XNkOSFnjAqpZvgxc-11A5o_ihdaY55igHbEb0sEUgxCNybJP13Mc7ckX4LKGQFoCwEX0UTsgYk_rLMOmT1kIuroOYbTmkF1Q54Av5PW8H7hBpqEEL1138x" />
                                    <p class="px-4 pb-4 text-base font-semibold text-slate-800 dark:text-slate-200">
                                        Crafty Creations</p>
                                </div>
                                <div
                                    class="flex w-64 shrink-0 flex-col gap-3 overflow-hidden rounded-xl bg-white shadow-md dark:bg-slate-900">
                                    <img alt="Home Harmony Services" class="h-40 w-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzk5-9zcmehkKF9HHsXH6fNwcmGGhGWX5-twJqdkf1w0LRCmgIg2ElyGnW4jYseYBG_yjGWrHif_SmwZOH9ebxOrdbABuTi_MAVzrVH4Sy1jS855W9jAP_hZ7e87OKAFSKiXhsWFf-UYTwHQu_jbAwwFjASrKzaw7EPAlBsUqwWm0fliQIkszukcg4Dkmq13CsOEsxUEYrRAqzlzhI8xGZA_Y1qe2Cb7DIlqrK6HNHFW7RfMWK8HhG63vOKIlVCHPBBxVLaz9l0R8L" />
                                    <p class="px-4 pb-4 text-base font-semibold text-slate-800 dark:text-slate-200">
                                        Home Harmony Services
                                    </p>
                                </div>
                                <div
                                    class="flex w-64 shrink-0 flex-col gap-3 overflow-hidden rounded-xl bg-white shadow-md dark:bg-slate-900">
                                    <img alt="Unique Gifts by Sarah" class="h-40 w-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1pdNfiWtr0X63hsn-fMdMQYRQSs8CnxpQKxgy8EsvKkHKZPlNozRSHMkqYq_7W-fpJ09d4Y-CpCv3L9xxosHnvV9tpbyAf2YSy3z3eC9PhcpH9ENDdA55BWNi4WzmVxLIdLM1ZBAlrxjTlQd91DGhiD6sS3DubddS2-BtyJ6v1Z_BkmizcIXNEc7babVJx4rWCHrmmFwdjxqpM9jb1wZ9h4qaSkGCRzizI16IDTQdiIK9pck70Eo5ivlZv8HqVnftzTj9r09HJ71L" />
                                    <p class="px-4 pb-4 text-base font-semibold text-slate-800 dark:text-slate-200">
                                        Unique Gifts by Sarah
                                    </p>
                                </div>
                                <div
                                    class="flex w-64 shrink-0 flex-col gap-3 overflow-hidden rounded-xl bg-white shadow-md dark:bg-slate-900">
                                    <img alt="Catering by Chef Alex" class="h-40 w-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGxTphtJev25dxLW7ZoQG4IiWxRwfAMQo5RfUue2eaa3OsLOo0cgvGvtRQfLNTIiUbfkkfxue0po4DWobSPg7YdQqj1opka5XXN5Nqr7pl5uUQpsZjnOrEXbWImNaZEz0_V2uufB7jomwO5ZlDzoCIPq4JfX-vNws7PYwku901A_WE6yiZzHWUpyPzb2k8oXd2ORx0jHt0IE9u--i0P_AsXdAM67MqMbgD1v0zs-s4Bm3VDZQ3YjuTeC8a8n_fkH2gQ3mMyCtX36M9" />
                                    <p class="px-4 pb-4 text-base font-semibold text-slate-800 dark:text-slate-200">
                                        Catering by Chef Alex
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 class="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Special Recommendation</h3>
                        <div class="@container overflow-hidden rounded-xl bg-white shadow-lg dark:bg-slate-900">
                            <div class="flex flex-col @[50rem]:flex-row">
                                <img alt="The Cozy Corner"
                                    class="h-64 w-full object-cover @[50rem]:h-auto @[50rem]:w-1/2"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFRZNjbZkOjY-nw6l4nK6s-SBPbftnfdmu2nA6gyBQ1WQKSnxiY7aagZXYAF06NRs7uHncvFB7mMryoEayxMObeitafO5JfXfslNdViTa5XD7JDnHCWCe5LIzWESRahw21-nBtE5Iw20jNHe0iTlNgKOiqvpz0Tu4dYgMlb-20FUSPpej063dLJnNm4ufEkA7mIJLojJ6Hv9a2BdKMD9Y-8DftLijkGux_dP0zoRcvSI4SNH04WC3jIOkH_gbFIVs698CttmsMJbKO" />
                                <div class="flex flex-col justify-center p-6 @[50rem]:w-1/2 @[50rem]:p-8">
                                    <h4 class="text-2xl font-bold text-slate-900 dark:text-white">The Cozy Corner</h4>
                                    <p class="mt-2 text-slate-600 dark:text-slate-400">
                                        Discover unique handmade crafts and home decor items that add warmth and
                                        personality to your space.
                                    </p>
                                    <button
                                        class="mt-6 w-full rounded-lg bg-primary px-6 py-3 text-base font-bold text-white shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 sm:w-auto">
                                        Shop Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <footer class="bg-secondary border-t border-gray-200">
                <div class="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div class="flex flex-col items-center gap-8">
                        <p class="text-center text-sm text-gray-500">@2024 HousebibiGoWhere. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    </div>
</template>
<script>
    import { db, loadCategories, loadBusinesses, filterByCategory } from "/src/firebase_config.js";

    export default {
    data() {
        return {
        categories: [],
        businesses: [],
        currentCategory: null,
        activeClass: "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors",
        inactiveClass: "rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30 transition-colors",
        };
    },
    computed: {
        filteredBusinesses() {
        if (!this.currentCategory) return this.businesses;
        return this.businesses.filter(biz => biz.category === this.currentCategory);
        },
    },
    methods: {
        async loadCategories() {
        const q = query(collection(db, "button_categories"), orderBy("order"));
        const snapshot = await getDocs(q);
        this.categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        async loadBusinesses() {
        const snapshot = await getDocs(collection(db, "businesses"));
        this.businesses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        filterByCategory(slug) {
        this.currentCategory = slug;
        },
    },
    mounted() {
        this.loadCategories();
        this.loadBusinesses();
    },
    };
</script>