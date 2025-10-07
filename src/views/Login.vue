<template>

    <div class="bg-background-light font-display">
        <div class="flex flex-col min-h-screen">
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
            <main class="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div
                    class="w-full max-w-md space-y-8 bg-background-light dark:bg-background-dark p-8 sm:p-10 rounded-xl border border-background-dark/10 dark:border-background-light/10">
                    <div>
                        <h2 class="text-center text-3xl font-extrabold text-background-dark dark:text-background-light">
                            Welcome back
                        </h2>
                        <p class="mt-2 text-center text-sm text-background-dark/60 dark:text-background-light/60">
                            Log in to continue your journey with us.
                        </p>
                    </div>
                    <form action="#" class="mt-8 space-y-6" method="POST">
                        <div class="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label class="sr-only" for="email-address">Username or email</label>
                                <input autocomplete="email"
                                    class="form-input appearance-none rounded-none relative block w-full px-3 py-3 border border-background-dark/20 dark:border-background-light/20 bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light placeholder-opacity-50 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 text-sm rounded-t-lg"
                                    id="email-address" name="email" placeholder="Username or email" required
                                    type="email" />
                            </div>
                            <div>
                                <label class="sr-only" for="password">Password</label>
                                <input autocomplete="current-password"
                                    class="form-input appearance-none rounded-none relative block w-full px-3 py-3 border border-background-dark/20 dark:border-background-light/20 bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light placeholder-opacity-50 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 text-sm rounded-b-lg"
                                    id="password" name="password" placeholder="Password" required type="password" />
                            </div>
                        </div>
                        <div class="flex items-center justify-end">
                            <div class="text-sm">
                                <a class="font-medium text-primary hover:text-primary/80" href="#">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>
                        <div>
                            <button
                                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background-light dark:focus:ring-offset-background-dark transition-colors"
                                type="submit">
                                Log in
                            </button>
                        </div>
                    </form>
                    <p class="text-center text-sm text-background-dark/60 dark:text-background-light/60">
                        Don't have an account?
                        <a class="font-medium text-primary hover:text-primary/80" href="#">
                            Sign up
                        </a>
                    </p>
                </div>
            </main>      
        </div>
    </div>
</template>