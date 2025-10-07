<template>
    <div class="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark">
        <div class="flex min-h-screen flex-col">
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
                <div class="max-w-2xl mx-auto">
                    <div class="mb-8">
                        <h2 class="text-3xl font-extrabold tracking-tight">Add New Product</h2>
                        <p class="mt-2 text-text-light/60 dark:text-text-dark/60">Fill in the details below to add a new
                            product to your store.</p>
                    </div>
                    <form class="space-y-6">
                        <div class="space-y-2">
                            <label class="text-sm font-medium" for="product-name">Product Name</label>
                            <input
                                class="block w-full rounded-lg border border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark placeholder-placeholder-light dark:placeholder-placeholder-dark focus:border-primary focus:ring-primary focus:ring-opacity-50 px-4 py-3"
                                id="product-name" placeholder="e.g., Handmade Scented Candle" type="text" />
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-medium" for="product-description">Product Description</label>
                            <textarea
                                class="block w-full rounded-lg border border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark placeholder-placeholder-light dark:placeholder-placeholder-dark focus:border-primary focus:ring-primary focus:ring-opacity-50 px-4 py-3 resize-y"
                                id="product-description" placeholder="Describe your product in detail..."
                                rows="4"></textarea>
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-medium" for="category">Category</label>
                            <select
                                class="form-select block w-full appearance-none rounded-lg border border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark focus:border-primary focus:ring-primary focus:ring-opacity-50 px-4 py-3"
                                id="category">
                                <option>Select a category</option>
                                <option>Home Decor</option>
                                <option>Handmade Crafts</option>
                                <option>Food &amp; Beverage</option>
                                <option>Fashion</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div class="space-y-2">
                                <label class="text-sm font-medium" for="price">Price</label>
                                <div class="relative">
                                    <span
                                        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-placeholder-light dark:text-placeholder-dark">S$</span>
                                    <input
                                        class="block w-full rounded-lg border border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark placeholder-placeholder-light dark:placeholder-placeholder-dark focus:border-primary focus:ring-primary focus:ring-opacity-50 pl-9 pr-4 py-3"
                                        id="price" placeholder="25.00" type="text" />
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-medium" for="quantity">Quantity</label>
                                <input
                                    class="block w-full rounded-lg border border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark placeholder-placeholder-light dark:placeholder-placeholder-dark focus:border-primary focus:ring-primary focus:ring-opacity-50 px-4 py-3"
                                    id="quantity" placeholder="e.g., 50" type="number" />
                            </div>
                        </div>
                        <div class="space-y-4">
                            <h3 class="text-base font-medium">Product Images</h3>
                            <div
                                class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-light dark:border-border-dark px-6 py-10 text-center bg-subtle-light/30 dark:bg-subtle-dark/30">
                                <span
                                    class="material-symbols-outlined text-4xl text-placeholder-light dark:text-placeholder-dark">add_photo_alternate</span>
                                <p class="mt-4 font-semibold">Upload or Generate Product Images</p>
                                <p class="mt-1 text-sm text-text-light/60 dark:text-text-dark/60">Drag &amp; drop images
                                    here, or click to browse. Don't have images?</p>
                                <button
                                    class="mt-4 flex items-center gap-2 rounded-lg bg-primary/20 dark:bg-primary/30 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/30 dark:hover:bg-primary/40 transition-colors"
                                    type="button">
                                    <span class="material-symbols-outlined text-base">auto_awesome</span>
                                    Generate with AI
                                </button>
                            </div>
                        </div>
                        <div class="flex justify-end pt-4">
                            <button
                                class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-bold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors sm:w-auto"
                                type="submit">
                                Add Product
                                <span class="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </form>
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

<style scoped>
.form-select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23618389' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
}

</style>