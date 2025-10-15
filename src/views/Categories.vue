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
                            <h3 class="font-bold mb-3">Filters</h3>
                            <div class="flex flex-wrap gap-2">
                                <button class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-background-light dark:bg-background-dark hover:bg-primary/10 dark:hover:bg-primary/20">
                                        Price
                                        <span class="material-symbols-outlined text-lg">expand_more</span>
                                </button>
                                <button class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-background-light dark:bg-background-dark hover:bg-primary/10 dark:hover:bg-primary/20">
                                    Seller
                                    <span class="material-symbols-outlined text-lg">expand_more</span>
                                </button>
                                <button class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-background-light dark:bg-background-dark hover:bg-primary/10 dark:hover:bg-primary/20">
                                    Rating
                                    <span class="material-symbols-outlined text-lg">expand_more</span>
                                </button>
                                <button class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-background-light dark:bg-background-dark hover:bg-primary/10 dark:hover:bg-primary/20">
                                    Material
                                    <span class="material-symbols-outlined text-lg">expand_more</span>
                                </button>
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
            <div class="group">
                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                    <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuB5U45vvmTCAxuSrzQ6Vs4KCHjGXXXXrRRYBGI7AWjGG1J_8XbdZJ1VbK6maV1iqBBb3CtEyvzchReQfncyDrQV3t_gVwv5P9bEOU5pC5VYroExmtNHo3993fnnqiEa3CH6ohglqWG13Pug8Q2jrRxjNKgFFo-7mIogJ1cSfxIjW1hPw5lfjewGKxJi5IWQPkvHUKyn333XEDwbhJMKdyzQ_F0wd9-qD19BaMeZ5180TFN7gRvH_0pSiT_KlhScaDUW4we3paDMTY9g");'></div>
                    <button class="absolute top-3 right-3 rounded-full p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm text-foreground-light dark:text-foreground-dark hover:text-primary transition-colors">
                        <span class="material-symbols-outlined">favorite_border</span>
                    </button>
                </div>
                <div class="pt-3">
                    <h3 class="font-bold text-base">Handmade Soap</h3>
                    <p class="text-sm text-subtle-dark dark:text-subtle-dark">The Soap Shop</p>
                    <p class="font-bold mt-1">$12.00</p>
                </div>
            </div>
            <div class="group">
                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCuF6wf2dyKgATsJ1g-PPmi5oZ0uPkhedbq7-5X1i7Qt8zKoec8bA2ehiTuSXOlMQAVhaqQLyME6MqtrGfqQwSgI80QA3m--clsJJou8IlPecCH_esy1YpScknaVW2wEBpqUATmqP8uOeKs3Q8EV_ec4kxN8GOew__a91LcqkmBe0pVkebHPlnebrXzzhUYuoHobK4rfb4dPvZY2YeFUwElyAjd5tQ1fJTYFwoIgXPSY_ySBsjkFgBCxxfQJyNedTt81TmLiSecqSg_");'></div>
                <button class="absolute top-3 right-3 rounded-full p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm text-foreground-light dark:text-foreground-dark hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">favorite_border</span>
                </button>
                </div>
                <div class="pt-3">
                    <h3 class="font-bold text-base">Knitted Scarf</h3>
                    <p class="text-sm text-subtle-dark dark:text-subtle-dark">Cozy Knits</p>
                    <p class="font-bold mt-1">$45.00</p>
                </div>
            </div>
            <div class="group">
                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAjXzNrHDmdQNdyGZlyVilq94wODe2XIub9_PHodXjOhTAG8K6Ax9Ysq1E69-caaVRVzB-59E6MhukYF4IaGkjU9H41dWdSqFukusJa_jXCHik8z02exK841lIz7AugjIzUUWv5gx0Dp61apevCX_R2Hw14XFPWaA7YgjmWlVxqeuRzTlr4xI4yQZxZPdhN7BG2ZHdK-pm7w1rTau_dWCVKBOY8eq8VDHQLQVppOWtiH9eUsnvqPCYNVT1OWGag3f0Q7167EWoRElRW");'></div>
                <button class="absolute top-3 right-3 rounded-full p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm text-foreground-light dark:text-foreground-dark hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">favorite_border</span>
                </button>
                </div>
                <div class="pt-3">
                    <h3 class="font-bold text-base">Ceramic Mug</h3>
                    <p class="text-sm text-subtle-dark dark:text-subtle-dark">Pottery Place</p>
                    <p class="font-bold mt-1">$25.00</p>
                </div>
            </div>
            <div class="group">
                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCSGoUSw-biU84chxrc928kCki4JmQvFI8gYUXeBN-kaeXvPns_z_9ZQjXeY7sv4-8zhu-WqTtJLLokrJkIsKi_DR_SJyEpVBz2ifPtX1jwpYh5451435nNSJ7OowggLqDXeJ1plRe0K-VjVI1lRCFwIKRoliwoFb-msQcLD0nh5OEfc0iLv4wAkp8VkfQa73csP_pn-Yp7lCMl88Hy9QICc2WC6hsssivbciE2nRFpOsyBgrzY-XHdBbrkk30WMoAtYL-InPshb8TF");'></div>
                <button class="absolute top-3 right-3 rounded-full p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm text-foreground-light dark:text-foreground-dark hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">favorite_border</span>
                </button>
                </div>
                <div class="pt-3">
                    <h3 class="font-bold text-base">Wooden Coasters</h3>
                    <p class="text-sm text-subtle-dark dark:text-subtle-dark">Woodcraft Wonders</p>
                    <p class="font-bold mt-1">$20.00</p>
                </div>
            </div>
            <div class="group">
                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuC8Z_aDLqCJT9Q6EBpKbYWvy1YLdzZ_FWIa8xlZ8yNTCRH1a4S8d6EXELohYy17292MDzJQP---3xH5iBbYh0l3Wqm2hWzrP-15D0QMy5qGpcYe3d3Bgr6yUkRs-bCsV_9QSwM5L7kzaYdppNMnxWl6URRgy6wGypE6OrTPKNAIxwU8b3weEkOcOJvNT5QLScU0d-TgJBDVYEAPsPbV1uwxTiKX4EvbGmesDnOr9Pm8KYEDBBicaM9fGdEE2dPt3A6OHtqhV2jsXNNA");'></div>
                <button class="absolute top-3 right-3 rounded-full p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm text-foreground-light dark:text-foreground-dark hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">favorite</span>
                </button>
                </div>
                <div class="pt-3">
                    <h3 class="font-bold text-base">Scented Candles</h3>
                    <p class="text-sm text-subtle-dark dark:text-subtle-dark">Candlelight Creations</p>
                    <p class="font-bold mt-1">$18.00</p>
                </div>
            </div>
            <div class="group">
                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBgJHuk9ndm2jxETNbk3vrcw61UxsNVEBqDVVosoLwWKfi_hwMGXN5A4z1uLPeuLX2F9YWXYVn4INHs6EnLBwG8LmxFB3JtAJqwp0aRfEKw-gRDQweyaDpELPJYr2YLi2UYbZUVdepA5z94au8EFBOJEMyMOjzPFDfOk9IHvcWo7N8bZnaH9j9Q04hDh1uiQnPfz5gg6A9AO2D6oxcG5oRDha93o-yFnOaXYa3cElUe6W7g2XfmUoYftSwlqoVX7wt1mevuIUhKkfI8");'></div>
                <button class="absolute top-3 right-3 rounded-full p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm text-foreground-light dark:text-foreground-dark hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">favorite_border</span>
                </button>
                </div>
                <div class="pt-3">
                    <h3 class="font-bold text-base">Crochet Blanket</h3>
                    <p class="text-sm text-subtle-dark dark:text-subtle-dark">Crochet Corner</p>
                    <p class="font-bold mt-1">$80.00</p>
                </div>
            </div>
            <div class="group">
                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuA_iL1b0TMaoUSzOqtZJhZJHAHXIObEVUsMCl8JPrEJtj27dfL02uvUovp_zkcBpKjSKmhkrNQnuik7E2ksUThvQCXwbY2N60kmo8ca_gHEoRJp7KTOtHpnG3HZYSLla2XS0xP3gMl7s0nnT2xaBpUqHb2YKOD9LXWfPsl1od07I0K1IMzRlLDvgMm3ys2WTgkmqm7d0p0c02_t6_OyjWnwegwiTnHbHBVaEwObkON1lAZ30CFUYujp0efHwysaDUfC1VHsHsDC4bc4");'></div>
                <button class="absolute top-3 right-3 rounded-full p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm text-foreground-light dark:text-foreground-dark hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">favorite_border</span>
                </button>
                </div>
                <div class="pt-3">
                    <h3 class="font-bold text-base">Painted Vase</h3>
                    <p class="text-sm text-subtle-dark dark:text-subtle-dark">Artistic Vases</p>
                    <p class="font-bold mt-1">$35.00</p>
                </div>
            </div>
            <div class="group">
                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCGDnb4PmAGNjYJ1OKoTEDbVG8L31z2B9mCdjFBf66E97WHNRSsTEJDLPLtFiyfPf6jpRnq-urOpHyd-eqTp1cKSvMM3GRx6WkOS0kNlPS7gEelqv7tMKdSqcefSBiohUskzI3oC4SesjBLuMDo_yf7ExPad0f3_xHbXVKD4M0kAseP5-AL4ET5r1FNqn88xF85l6kNqRyLh2gPDr1yYda1Hs-6eP-ejUSMUxu9tcy3EcUeej8o0jLjpvHd1LbdNLO4InKi_xyVCAx6");'></div>
                <button class="absolute top-3 right-3 rounded-full p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm text-foreground-light dark:text-foreground-dark hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">favorite_border</span>
                </button>
                </div>
                <div class="pt-3">
                    <h3 class="font-bold text-base">Beaded Jewelry</h3>
                    <p class="text-sm text-subtle-dark dark:text-subtle-dark">Jewelry Junction</p>
                    <p class="font-bold mt-1">$22.00</p>
                </div>
            </div>
            <div class="group">
                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuANzgTglkyZg8jVkBrWyBJH0e2vdBrt7xWEgXmINvcNLd3A81bJY3GR-b8-nvRHLyReawPa4jroidW0YVNK5OWtIut4yZgxqkXw9vPHoQZxLQP998cdPh8xYMgxxzYJ8vmJU1EVbtZAaFRgrtnY0hDeZ8aXWR-tKD5DvEo5qRlvJq4pQ9xBbb84uprOvy3dVz64CmrWPwIreucu6-QIBLdM0n0XNWWDtqV5oAVFTgAPULSYD1MvbGeaVIMKS-qOwt4zmlcuadhGwNK0");'></div>
                <button class="absolute top-3 right-3 rounded-full p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm text-foreground-light dark:text-foreground-dark hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">favorite_border</span>
                </button>
                </div>
                <div class="pt-3">
                    <h3 class="font-bold text-base">Handmade Soap</h3>
                    <p class="text-sm text-subtle-dark dark:text-subtle-dark">The Soap Shop</p>
                    <p class="font-bold mt-1">$12.00</p>
                </div>
            </div>
            <div class="group">
                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCR7gBwLzwDOGBVMHG3FEV15NCZgyZAZ1X5KzoNTyO22Z1foGqv97pVpTgVdqJy8DeV0_rgNOWw1mo2e1p4pJWCaF_xAWAA6gYu5341pPKxJVtw3lQqpz-vsQu78HEpa-fUAXOf3hc6Q8kt4QrUSNBjakQe6Pw-IsI96T4j7t_5Eu4YmMJnOizivhbUi3eAJxYt31LoDj28OO3OnybJSVVsRpV3o7k_pMmh2eLfNzF8gJZKsz4jE__AnHSXWAOHyHoQsfBq5163ZAIO");'></div>
                <button class="absolute top-3 right-3 rounded-full p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm text-foreground-light dark:text-foreground-dark hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">favorite_border</span>
                </button>
                </div>
                <div class="pt-3">
                    <h3 class="font-bold text-base">Knitted Scarf</h3>
                    <p class="text-sm text-subtle-dark dark:text-subtle-dark">Cozy Knits</p>
                    <p class="font-bold mt-1">$45.00</p>
                </div>
            </div>
            <div class="group">
                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuC6GkobOWj8_QtoCHfFWOYfgNxD_7fggXn6N8g_LBCXjGipsR2TfBku-chlumGcjvTpL9p1CaM5idvbHc7gtDHfbJdCjQc94XJn4ecdYPee2RIUCiU1R6dqXXjDV-xAe04OKd8jGVUHzbOI-ddP7wubihj3908vUCVRqUZtilaVENd30F50oEkqBpDEicQqZYFuoQCRT2bLGtY5rBxPC-Omr7mGVGYDMdDJeJbxJvduTPMQTlOEisYlZI8ex5-pTL1GfMaSDH-vGqe7");'></div>
                <button class="absolute top-3 right-3 rounded-full p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm text-foreground-light dark:text-foreground-dark hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">favorite_border</span>
                </button>
                </div>
                <div class="pt-3">
                    <h3 class="font-bold text-base">Ceramic Mug</h3>
                    <p class="text-sm text-subtle-dark dark:text-subtle-dark">Pottery Place</p>
                    <p class="font-bold mt-1">$25.00</p>
                </div>
            </div>
            <div class="group">
                <div class="relative overflow-hidden rounded-lg bg-background-light dark:bg-background-dark">
                <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCKO3jSx80oRTe7b0ueeTUwv5cue5zGIqz7ho0BMXXdBshZOjiQBGqTXes_HN96KnSVZu1nIkj6WxP8gW6bPrKx0BEPVpKDhY_bivRUO6U5__x-iUtRIw8Pwy1ppmgKpD-llVkPjCfjvwdsoDEKfF4xelXvJG6LqyLZdPH9-Oi1sGXPrUOvk7z9J-y_rAanIzox0VpZtKjULFEh_XqXNzxlchFxUGbZdfUdIU2okepo08SfYJ6maxOF8fjI74afHvPWw3_W1UBSyrKc");'></div>
                <button class="absolute top-3 right-3 rounded-full p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm text-foreground-light dark:text-foreground-dark hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">favorite_border</span>
                </button>
                </div>
                <div class="pt-3">
                    <h3 class="font-bold text-base">Wooden Coasters</h3>
                    <p class="text-sm text-subtle-dark dark:text-subtle-dark">Woodcraft Wonders</p>
                    <p class="font-bold mt-1">$20.00</p>
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
