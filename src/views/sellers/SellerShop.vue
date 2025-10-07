
<template>
    <div class="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
        <div class="flex flex-col min-h-screen" x-data="{ addProductModal: false }">
            <header
                class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-background-light/80 px-4 py-3 backdrop-blur-sm dark:border-slate-800/80 dark:bg-background-dark/80 sm:px-6 lg:px-8">
                <div class="flex items-center gap-6">
                    <div class="flex items-center gap-2">
                        <svg class="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 48"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                                fill="currentColor"></path>
                        </svg>
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
                    <RouterLink to="/signup/"
                        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-accent text-white text-sm font-bold leading-normal tracking-wide hover:bg-accent/90 transition-colors">
                        <span class="truncate">Sign Up</span>
                    </RouterLink>
                    <RouterLink to="/login/"
                        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background text-gray-800 border border-gray-300 text-sm font-bold leading-normal tracking-wide hover:bg-gray-100 transition-colors">
                        <span class="truncate">Log In</span>
                    </RouterLink>

                </div>
            </header>
            <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="max-w-4xl mx-auto">
                    <div
                        class="flex flex-col items-center text-center p-6 bg-creamy-white dark:bg-gray-800/50 rounded-xl shadow-sm">
                        <div class="relative mb-4">
                            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32"
                                style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAvDcbMzFfeOb3_h2t6uZzdwHccl2CtXAV_HefE3Vq9CTAeiMu4sCE6Jhdva_sb7S3PV3u9zSaANk2iz7iFIRPCHqAvHuCd-xacQWdeUyun9Iy7oICCCN_X1QqwJ1lyHqbtjGYzhOn5mKV_i9eD1o6fGeWgjfIB87h1dAcVufqCvvW4N0925h4gJ92uxp7J-7z5vz7SHWEf4IObyuH5WZLYNVL2GAYYWtkDBuyJtHtigkoLtjT0cc6ghqtBLxUoRxa4OnNWmD2O1c0b');">
                            </div>
                            <button
                                class="absolute -bottom-1 -right-1 bg-primary text-white rounded-full size-8 flex items-center justify-center hover:bg-primary/80 transition-colors">
                                <span class="material-symbols-outlined text-base">edit</span>
                            </button>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">The Cozy Corner</h1>
                        <p class="mt-2 text-gray-600 dark:text-gray-400">Handmade crafts and unique home decor items.
                        </p>
                        <div class="flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400">
                            <span class="material-symbols-outlined text-lg text-yellow-500">star</span>
                            <span class="font-medium">4.8</span>
                            <span class="text-gray-400 dark:text-gray-600">·</span>
                            <span>120 reviews</span>
                        </div>
                        <button
                            class="mt-6 flex items-center justify-center gap-2 h-10 px-6 bg-primary/10 dark:bg-primary/20 text-primary font-bold text-sm rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                            <span class="material-symbols-outlined text-lg">settings</span>
                            <span>Manage Shop</span>
                        </button>
                    </div>
                    <div class="mt-8">
                        <div class="border-b border-gray-200 dark:border-gray-800">
                            <nav aria-label="Tabs" class="-mb-px flex gap-6 px-4">
                                <a class="shrink-0 border-b-2 border-primary px-1 pb-4 text-sm font-medium text-primary"
                                    href="#">Products</a>
                                <a class="shrink-0 border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 dark:text-gray-400 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                                    href="#">About</a>
                                <a class="shrink-0 border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 dark:text-gray-400 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                                    href="#">Reviews</a>
                            </nav>
                        </div>
                        <div class="py-6">
                            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                <div class="group relative flex flex-col overflow-hidden rounded-lg">
                                    <div class="aspect-square w-full bg-cover bg-center"
                                        style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuD7TbMdiUe5J4NKqvd8j8Etl3AibjXD4teMfsdqetttjyc8hBjKqvyMY4-lD9Fg7eNeTxrPWmRCB6GJd4m9CG8cmn4xAhhuM9sAGobUW6Sx8U0Q3__inQTCI5WUImHH0JwQlqQZJ9lee7IVngjNfxT9nv6YQcR3CTq1utiY7OMdespxQbqML9YUvMrt-XrS-OFnHc3KM6Ww-kRCKulXnPxqCpdTow8s2hJ4c_G_8WOnXurf6jlnB1_Xjs6A986qKAN39699ti3n9C-L');">
                                    </div>
                                    <div class="p-4 bg-creamy-white dark:bg-gray-800/50">
                                        <h3 class="font-medium text-gray-900 dark:text-white">Handmade Knitted Blanket
                                        </h3>
                                        <p class="mt-1 text-sm text-primary font-semibold">$45.00</p>
                                    </div>
                                </div>
                                <div class="group relative flex flex-col overflow-hidden rounded-lg">
                                    <div class="aspect-square w-full bg-cover bg-center"
                                        style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDOtBBELolEMKhFpA8lnRHddIxEUknqls3jVEpGpjvBW3Q3p0eEen0nwbCH27A9wZMW8ARFkdE3oROrbaynWBLyGiFxf52phd19O2g0sxWf-Rooost_Gsuq9VEbZ4ley0yWZNmkY8toGjkdLWN_ysppW-BZHRmKKppLOskRsVZeLuG8PBvPSprWXluj9kzXgY5tYXhcD0-sDGZqvRCsBqmQYRGZiQ2DWC-FRLCBOY8eWL8n1JkoIDAocy4gXlyDGnCa3UHMlxlAY13X');">
                                    </div>
                                    <div class="p-4 bg-creamy-white dark:bg-gray-800/50">
                                        <h3 class="font-medium text-gray-900 dark:text-white">Ceramic Coffee Mugs</h3>
                                        <p class="mt-1 text-sm text-primary font-semibold">$20.00</p>
                                    </div>
                                </div>
                                <div class="group relative flex flex-col overflow-hidden rounded-lg">
                                    <div class="aspect-square w-full bg-cover bg-center"
                                        style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuA2KpTDeFZuCC0_EtV3QQHgksfM5U0IRJLhXzMsY8InvSWvSpspPAiT7BVltoAsh28XI0nBPYwkEVnNekfuAfDpC2Bfs4727KsLULqoS2EBHV2mRe9DtUuZMqf7HMv_IQWQpNCPUVuCZFKygtdQFqCOmiv44z5IgNxJZTECY3as8gzyvHZ11N4F6uJ5S7-Fiyq7BJOEB2S2MtqcytHI1yXJsOV9uQNLLz7OpnIdw2bEj0sMakXpRarlNBsC91ELagpWDZkBAhBTGPtU');">
                                    </div>
                                    <div class="p-4 bg-creamy-white dark:bg-gray-800/50">
                                        <h3 class="font-medium text-gray-900 dark:text-white">Scented Candles Set</h3>
                                        <p class="mt-1 text-sm text-primary font-semibold">$30.00</p>
                                    </div>
                                </div>
                                <div class="group relative flex flex-col overflow-hidden rounded-lg">
                                    <div class="aspect-square w-full bg-cover bg-center"
                                        style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCp0g-4Hz2UpiF4GOnxmsqGwXfaHCA-GZqjaTM_6glPFL1avpvDoiTWxXsVXh6gM7KgZTwZpq2_xxAVwimNFXVH5KrUE5TtaCxkc2rSFhWP6Oj3h5tE5nLBkN-OjEXP3EJaoJMMC7zi4CQkd3Ti8FVRLJxM6uO8yD4V88oNZiGRG5xddkuzp_0k8iop1HbiZ2q9lLLd5sm4IsAMPTNQdNtsykr3Vpn10ULpD-_7U5V2bj0_vkhy5OsDRIg1mP2yO7NUERBNOh8PnGyg');">
                                    </div>
                                    <div class="p-4 bg-creamy-white dark:bg-gray-800/50">
                                        <h3 class="font-medium text-gray-900 dark:text-white">Wooden Coasters</h3>
                                        <p class="mt-1 text-sm text-primary font-semibold">$15.00</p>
                                    </div>
                                </div>
                                <div class="group relative flex flex-col overflow-hidden rounded-lg">
                                    <div class="aspect-square w-full bg-cover bg-center"
                                        style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAkKHmxXCcH5XZk1QLxyBI61zdmfOY3FhlrHfpx8TpvjVQQU0wo9JOG-vNU8-Bvqf4a80QEx8_6ZkLhBJU73mCzN2R_FU0xUXnCC-Nmbf9d9i6stRn397LUUfMouJTizKfOl7cbOHgGiUa81IU9YkxRMeszE1eGhed7MPXOY_prrUrOLFhLsZ8d-KleyPJw1jVHKBH3rBi1GsykAZTKW5hcQurtGBmBywvsvaUz9U8AYfWB2zJScHfuolnaGYaxXC5aBUsj9YZukvVV');">
                                    </div>
                                    <div class="p-4 bg-creamy-white dark:bg-gray-800/50">
                                        <h3 class="font-medium text-gray-900 dark:text-white">Macrame Wall Hanging</h3>
                                        <p class="mt-1 text-sm text-primary font-semibold">$25.00</p>
                                    </div>
                                </div>
                                <div class="group relative flex flex-col overflow-hidden rounded-lg">
                                    <div class="aspect-square w-full bg-cover bg-center"
                                        style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDxM4GDJ-QHi29SrHwwJXPDkDpuCEyJHc2Y1XtgxlM_cP6zWz5XtmTwLanIyFZYMjGwEhrs7BNLxrHqoVDNOIZvWv42gXUhyD20gPEgmOnQZhJrrkrtdtQzPAL5DffP-EAqnestASgC1_BPEtc-uCVBpyoEj3zLF4MjYwLSe0RXNKk_WlLODzYW4C2tKrrenLK4kN8glkeRx5A9lhu6lvQPUxrbXfGlGvoVn7hwzv0XtfIDUBkbNoDQDl05IJg3RZu_4X5lbrvoDnxi');">
                                    </div>
                                    <div class="p-4 bg-creamy-white dark:bg-gray-800/50">
                                        <h3 class="font-medium text-gray-900 dark:text-white">Custom Pet Portraits</h3>
                                        <p class="mt-1 text-sm text-primary font-semibold">$50.00</p>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-8 flex justify-center">
                                <button @click="addProductModal = true"
                                    class="flex items-center justify-center gap-2 h-12 px-8 bg-accent text-white font-bold text-sm rounded-lg shadow-lg hover:bg-vibrant-coral/90 transition-all transform hover:scale-105">
                                    <span class="material-symbols-outlined">add_circle</span>
                                    <span>Add New Product</span>
                                </button>
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
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                style="display: none;" x-show="addProductModal" x-transition:enter="transition ease-out duration-300"
                x-transition:enter-end="opacity-100" x-transition:enter-start="opacity-0"
                x-transition:leave="transition ease-in duration-200" x-transition:leave-end="opacity-0"
                x-transition:leave-start="opacity-100">
                <div @click.away="addProductModal = false"
                    class="bg-creamy-white dark:bg-background-dark rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="p-8">
                        <div class="flex justify-between items-start">
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h2>
                            <button @click="addProductModal = false"
                                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form class="mt-6 space-y-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    for="product-name">Product Name</label>
                                <input
                                    class="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-soft-warm-gray dark:bg-gray-800 focus:border-primary focus:ring-primary dark:text-white"
                                    id="product-name" name="product-name" placeholder="e.g., Handmade Knitted Blanket"
                                    type="text" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    for="product-description">Description</label>
                                <textarea
                                    class="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-soft-warm-gray dark:bg-gray-800 focus:border-primary focus:ring-primary dark:text-white"
                                    id="product-description" name="product-description"
                                    placeholder="Describe your product..." rows="4"></textarea>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        for="product-price">Price</label>
                                    <div class="relative mt-1">
                                        <span
                                            class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">$</span>
                                        <input
                                            class="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-soft-warm-gray dark:bg-gray-800 focus:border-primary focus:ring-primary pl-7 pr-12 dark:text-white"
                                            id="product-price" name="product-price" placeholder="0.00" type="text" />
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        for="product-category">Category</label>
                                    <select
                                        class="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-soft-warm-gray dark:bg-gray-800 focus:border-primary focus:ring-primary dark:text-white"
                                        id="product-category" name="product-category">
                                        <option>Home Decor</option>
                                        <option>Crafts</option>
                                        <option>Fashion</option>
                                        <option>Accessories</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Product
                                    Images</label>
                                <div
                                    class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-6 pt-5 pb-6 bg-soft-warm-gray dark:bg-gray-800">
                                    <div class="space-y-1 text-center">
                                        <span
                                            class="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500">cloud_upload</span>
                                        <div class="flex text-sm text-gray-600 dark:text-gray-400">
                                            <label
                                                class="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                                                for="file-upload">
                                                <span>Upload files</span>
                                                <input class="sr-only" id="file-upload" multiple="" name="file-upload"
                                                    type="file" />
                                            </label>
                                            <p class="pl-1">or drag and drop</p>
                                        </div>
                                        <p class="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-end gap-4 pt-4">
                                <button @click="addProductModal = false"
                                    class="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-soft-warm-gray dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    type="button">
                                    Cancel
                                </button>
                                <button
                                    class="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-md"
                                    type="submit">
                                    Add Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<!-- <script defer src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.x.x/dist/alpine.min.js"></script> -->

