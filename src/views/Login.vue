<template>
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
                            id="email-address" name="email" placeholder="Username or email" required type="email" />
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
</template>