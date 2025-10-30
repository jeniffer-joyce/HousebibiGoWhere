<template>
    <main
        class="flex-1 px-4 sm:px-6 lg:px-8 xl:px-40 py-10 bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
        <div class="max-w-8xl mx-auto">
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <a class="hover:text-primary" href="#">Home</a>
                <span>/</span>
                <span class="font-medium text-gray-700 dark:text-gray-200">Shopping Cart</span>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div class="lg:col-span-2">
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Shopping Cart</h1>
                    <div class="space-y-4">
                        <div
                            class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm rounded-lg">
                            <div class="flex items-center gap-4">
                                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16"
                                    style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBhW3lGE1cV2KL5shpDzPP6-KhNLHIRfCiZs6sSrnXlkeZJLxZsV7yOX01vrVJmjGKLNO02QU5SuXsjofCWwRx0PZhgIL524kX118L-EZ_8EYTdMf8CEp00fp3Zf_dn_RLwYPYTx320Gyh6knsCF0FoXHLVH1ZsgQ6lpTgAZb6FdtlAfk2l084QrbI8L79k3FpX2Rip1wVazwqGqKEttcWWtv66Za-9-tEeJ9o8lwnCHvi8HINNtG8IVPeeyBTcGOoNg4uqZJcBlUgF");'>
                                </div>
                                <div>
                                    <p class="font-semibold text-gray-800 dark:text-white">Handmade Soap Set</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <p class="text-lg font-medium text-gray-900 dark:text-white">$20.00</p>
                                <div class="flex items-center gap-2">
                                    <button
                                        @click="$event.target.nextElementSibling.value = Math.max(1, parseInt($event.target.nextElementSibling.value) - 1)"
                                        class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold">
                                        −
                                    </button>
                                    <input type="number" value="2" min="1"
                                        class="w-16 h-8 text-center border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                                    <button
                                        @click="$event.target.previousElementSibling.value = parseInt($event.target.previousElementSibling.value) + 1"
                                        class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold">
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>  
                        <div
                            class="flex items-center justify-between p-4 bg-white dark:bg-background-dark/50 rounded-lg">
                            <div class="flex items-center gap-4">
                                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16"
                                    style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDmCugF2IiaVIDcaB9O8coHlXJ1wDt3FpGme-wBBA-nJc4S8cEVLy_gcIiVjYLh6RgEUm2ypeQDIpb5XUaRu1NfQ5XEBIaZo3LkE_-PxutwaMSmwPy-JFmTrYsoUPV5319YJDquktWXlBc8bBM1bSqJ3joJwdI4gAXvBYz_rUe6kp90GDXzKMU7CmgrXkMUJ4yVmDwT5Fwa4cY1FJvLh5OQPStDU7hdq4eITNe10MNTcZ6ulYUnYoCrNa1XspOESClZh-68RdQNgGT0");'>
                                </div>
                                <div>
                                    <p class="font-semibold text-gray-800 dark:text-white">Organic Honey</p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Quantity: 1</p>
                                </div>
                            </div>
                            <p class="text-lg font-medium text-gray-900 dark:text-white">$15.00</p>
                        </div>
                        <div
                            class="flex items-center justify-between p-4 bg-white dark:bg-background-dark/50 rounded-lg">
                            <div class="flex items-center gap-4">
                                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16"
                                    style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCLETBooF5JQakotshbHza-FX6Okgc8rK53UyXkxd2nxfnASsPGKQIQfvAq0Gutm7bZa5vHEy2ayQSRH5eJXO7azSZw0lFM-EvYlzERivXJvaXnihNoaiVxpMo4eQd8Jk0o08hcy_KhKPFS2kMUOKzXohpx4zkTJG4kRood7UzJ02o1lsEUxwFZn69LyrkPILI1GQ4mmHxL1S6gR4sfpszrGNeiqaTKH4HF4bD5du7cXHk_mN_vl0NNljo6YheNqIm0tw1v-dBw2RdF");'>
                                </div>
                                <div>
                                    <p class="font-semibold text-gray-800 dark:text-white">Knitted Scarf</p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Quantity: 3</p>
                                </div>
                            </div>
                            <p class="text-lg font-medium text-gray-900 dark:text-white">$30.00</p>
                        </div>
                    </div>
                </div>
                <div class="lg:col-span-1">
                    <div class="bg-white dark:bg-background-dark/50 p-6 rounded-lg sticky top-10">
                        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary<span
                                class="text-lg font-medium text-gray-900 dark:text-white mb-6"> | 3 item(s)</span></h2>
                        <div class="space-y-4 mb-6">
                            <div class="flex justify-between text-gray-600 dark:text-gray-300">
                                <span>Item(s) Subtotal</span>
                                <span class="font-medium text-gray-800 dark:text-white">$65.00</span>
                            </div>

                            <div class="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                            <div class="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span>$65.00</span>
                            </div>
                        </div>
                        <!-- <div class="space-y-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    for="shipping-address">Shipping Address</label>
                                <input
                                    class="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                                    id="shipping-address" placeholder="Enter your address" type="text" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    for="payment-method">Payment Method</label>
                                <div class="relative">
                                    <select
                                        class="form-select w-full appearance-none rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                                        id="payment-method">
                                        <option>Select payment method</option>
                                        <option>Credit Card</option>
                                        <option>PayPal</option>
                                        <option>Bank Transfer</option>
                                    </select>
                                    <div
                                        class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <svg aria-hidden="true" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path clip-rule="evenodd"
                                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                                fill-rule="evenodd"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div> -->
                        <button
                            class="mt-8 w-full flex items-center justify-center rounded-lg h-12 px-5 bg-primary text-white text-base font-bold hover:bg-primary/90 transition-colors">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>