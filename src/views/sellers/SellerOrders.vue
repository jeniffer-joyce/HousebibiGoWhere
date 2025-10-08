<template>
    <main class="flex-1 overflow-y-auto">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 class="text-3xl font-extrabold tracking-tight text-foreground-light dark:text-foreground-dark">
                        Orders</h2>
                    <p class="text-muted-light dark:text-muted-dark mt-1">Manage your incoming and pending
                        orders.</p>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        class="flex items-center gap-2 rounded-lg bg-accent-light dark:bg-accent-dark px-4 py-2 text-sm font-medium text-muted-light dark:text-muted-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors">
                        <span class="material-symbols-outlined text-base">filter_list</span>
                        Filter
                    </button>
                    <button
                        class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                        <span class="material-symbols-outlined text-base">add</span>
                        New Order
                    </button>
                </div>
            </div>
            <div class="flex flex-col gap-6">
                <div class="relative">
                    <span
                        class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark">search</span>
                    <input
                        class="form-input w-full rounded-lg border-accent-light dark:border-accent-dark bg-background-light dark:bg-accent-dark pl-10 pr-4 py-2.5 text-foreground-light dark:text-foreground-dark focus:border-primary focus:ring-primary placeholder:text-muted-light dark:placeholder:text-muted-dark"
                        placeholder="Search orders by ID or buyer name" type="search" />
                </div>
                <div class="border-b border-accent-light dark:border-accent-dark">
                    <nav aria-label="Tabs" class="-mb-px flex space-x-6">
                        <a class="whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm text-primary border-primary"
                            href="#">All Orders</a>
                        <a class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-muted-light dark:text-muted-dark border-transparent hover:text-primary hover:border-primary/50 dark:hover:text-primary dark:hover:border-primary/50 transition-colors"
                            href="#">Pending</a>
                        <a class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-muted-light dark:text-muted-dark border-transparent hover:text-primary hover:border-primary/50 dark:hover:text-primary dark:hover:border-primary/50 transition-colors"
                            href="#">Processing</a>
                        <a class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-muted-light dark:text-muted-dark border-transparent hover:text-primary hover:border-primary/50 dark:hover:text-primary dark:hover:border-primary/50 transition-colors"
                            href="#">Shipped</a>
                        <a class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-muted-light dark:text-muted-dark border-transparent hover:text-primary hover:border-primary/50 dark:hover:text-primary dark:hover:border-primary/50 transition-colors"
                            href="#">Delivered</a>
                    </nav>
                </div>
                <div class="overflow-x-auto rounded-lg border border-accent-light dark:border-accent-dark">
                    <table class="min-w-full divide-y divide-accent-light dark:divide-accent-dark">
                        <thead class="bg-accent-light/50 dark:bg-accent-dark/50">
                            <tr>
                                <th class="px-6 py-3.5 text-left text-sm font-semibold text-foreground-light dark:text-foreground-dark"
                                    scope="col">Order ID</th>
                                <th class="px-6 py-3.5 text-left text-sm font-semibold text-foreground-light dark:text-foreground-dark"
                                    scope="col">Buyer</th>
                                <th class="px-6 py-3.5 text-left text-sm font-semibold text-foreground-light dark:text-foreground-dark"
                                    scope="col">Product(s)</th>
                                <th class="px-6 py-3.5 text-left text-sm font-semibold text-foreground-light dark:text-foreground-dark"
                                    scope="col">Quantity</th>
                                <th class="px-6 py-3.5 text-left text-sm font-semibold text-foreground-light dark:text-foreground-dark"
                                    scope="col">Total</th>
                                <th class="px-6 py-3.5 text-left text-sm font-semibold text-foreground-light dark:text-foreground-dark"
                                    scope="col">Date</th>
                                <th class="px-6 py-3.5 text-left text-sm font-semibold text-foreground-light dark:text-foreground-dark"
                                    scope="col">Status</th>
                                <th class="relative py-3.5 pl-3 pr-4 sm:pr-6" scope="col"><span
                                        class="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody
                            class="divide-y divide-accent-light dark:divide-accent-dark bg-background-light dark:bg-background-dark">
                            <tr>
                                <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-primary">#12345
                                </td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    Sophia Carter</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    Handmade Soap</td>
                                <td
                                    class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark text-center">
                                    2</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    $25.00</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    2024-07-26</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm"><span
                                        class="status-badge status-pending">Pending</span></td>
                                <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a class="text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors"
                                        href="#">View Details</a>
                                </td>
                            </tr>
                            <tr>
                                <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-primary">#12346
                                </td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    Ethan Bennett</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    Knitted Scarf</td>
                                <td
                                    class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark text-center">
                                    1</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    $30.00</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    2024-07-25</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm"><span
                                        class="status-badge status-processing">Processing</span></td>
                                <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a class="text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors"
                                        href="#">View Details</a>
                                </td>
                            </tr>
                            <tr>
                                <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-primary">#12347
                                </td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    Olivia Harper</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    Baked Cookies</td>
                                <td
                                    class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark text-center">
                                    3</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    $15.00</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    2024-07-24</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm"><span
                                        class="status-badge status-shipped">Shipped</span></td>
                                <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a class="text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors"
                                        href="#">View Details</a>
                                </td>
                            </tr>
                            <tr>
                                <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-primary">#12348
                                </td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    Liam Foster</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    Custom Mug</td>
                                <td
                                    class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark text-center">
                                    1</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    $20.00</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    2024-07-23</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm"><span
                                        class="status-badge status-delivered">Delivered</span></td>
                                <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a class="text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors"
                                        href="#">View Details</a>
                                </td>
                            </tr>
                            <tr>
                                <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-primary">#12349
                                </td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    Ava Morgan</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    Jewelry Set</td>
                                <td
                                    class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark text-center">
                                    1</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    $45.00</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                                    2024-07-22</td>
                                <td class="whitespace-nowrap px-6 py-4 text-sm"><span
                                        class="status-badge status-pending">Pending</span></td>
                                <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a class="text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors"
                                        href="#">View Details</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <nav aria-label="Pagination"
                    class="flex items-center justify-between border-t border-accent-light dark:border-accent-dark pt-4">
                    <div class="hidden sm:block">
                        <p class="text-sm text-muted-light dark:text-muted-dark">
                            Showing <span class="font-medium text-foreground-light dark:text-foreground-dark">1</span>
                            to
                            <span class="font-medium text-foreground-light dark:text-foreground-dark">5</span>
                            of <span class="font-medium text-foreground-light dark:text-foreground-dark">20</span>
                            results
                        </p>
                    </div>
                    <div class="flex flex-1 justify-between sm:justify-end">
                        <a class="relative inline-flex items-center rounded-md border border-accent-light dark:border-accent-dark bg-background-light dark:bg-background-dark px-4 py-2 text-sm font-medium text-muted-light dark:text-muted-dark hover:bg-accent-light dark:hover:bg-accent-dark"
                            href="#">Previous</a>
                        <a class="relative ml-3 inline-flex items-center rounded-md border border-accent-light dark:border-accent-dark bg-background-light dark:bg-background-dark px-4 py-2 text-sm font-medium text-muted-light dark:text-muted-dark hover:bg-accent-light dark:hover:bg-accent-dark"
                            href="#">Next</a>
                    </div>
                </nav>
            </div>
        </div>
    </main>
</template>
<style scoped>
.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-weight: 500;
    font-size: 0.75rem;
    line-height: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
}

.status-pending {
    background-color: #ffedd5;
    color: #9a3412;
}

.dark .status-pending {
    background-color: #78350f;
    color: #fed7aa;
}

.status-processing {
    background-color: #dbeafe;
    color: #1e40af;
}

.dark .status-processing {
    background-color: #1e3a8a;
    color: #93c5fd;
}

.status-shipped {
    background-color: #cce7ff;
    color: #007bff;
}

.dark .status-shipped {
    background-color: #004c99;
    color: #99cfff;
}

.status-delivered {
    background-color: #d1fae5;
    color: #065f46;
}

.dark .status-delivered {
    background-color: #064e3b;
    color: #6ee7b7;
}
</style>