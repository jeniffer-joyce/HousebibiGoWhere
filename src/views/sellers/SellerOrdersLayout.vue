<!-- src/views/sellers/SellerOrdersLayout.vue -->
<template>
  <main class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <SellerOrdersSidebar :counts="counts" />
    <section class="flex-1 overflow-y-auto">
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <RouterView />
      </div>
    </section>
  </main>
</template>

<script setup>
import SellerOrdersSidebar from '@/components/layout/SellerOrdersSidebar.vue'
import { useSellerOrders } from '@/composables/useSellerOrders'
const { counts } = useSellerOrders()
</script>
