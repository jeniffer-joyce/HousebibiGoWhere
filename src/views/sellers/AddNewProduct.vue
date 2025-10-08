<template>
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
                        id="product-description" placeholder="Describe your product in detail..." rows="4"></textarea>
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