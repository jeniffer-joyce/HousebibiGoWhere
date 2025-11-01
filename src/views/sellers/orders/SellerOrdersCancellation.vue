<!-- src/views/sellers/orders/SellerOrdersAll.vue -->
<template>
  <header class="mb-6">
    <h2 class="text-2xl font-bold text-foreground-light dark:text-foreground-dark">All Orders</h2>
    <p class="text-sm text-muted-light dark:text-muted-dark">Manage your incoming and pending orders.</p>
  </header>

  <!-- 👉 Paste your existing ALL ORDERS search + tabs + table/cards + pagination here. -->
  <!-- Use orders from the composable instead of local mock data. -->

  <div v-if="!ready" class="p-8 text-center text-muted-light dark:text-muted-dark">Loading…</div>
  <div v-else>
    <!-- Example tiny table (replace with your full one) -->
    <div class="overflow-x-auto rounded-lg border border-accent-light dark:border-accent-dark">
      <table class="min-w-full divide-y divide-accent-light dark:divide-accent-dark text-left">
        <thead class="bg-accent-light/50 dark:bg-accent-dark/50">
          <tr>
            <th class="px-4 py-3 text-sm">Order ID</th>
            <th class="px-4 py-3 text-sm">Buyer</th>
            <th class="px-4 py-3 text-sm">Total</th>
            <th class="px-4 py-3 text-sm">Status</th>
          </tr>
        </thead>
        <tbody class="bg-background-light dark:bg-background-dark divide-y divide-accent-light dark:divide-accent-dark">
          <tr v-for="o in orders" :key="o.id">
            <td class="px-4 py-3 text-primary">{{ o.orderId || o.id }}</td>
            <td class="px-4 py-3">{{ o.buyerName || o.buyer || '—' }}</td>
            <td class="px-4 py-3">{{ currency(orderGrand(o)) }}</td>
            <td class="px-4 py-3">{{ o.status }}</td>
          </tr>
          <tr v-if="orders.length===0">
            <td colspan="4" class="px-4 py-10 text-center text-sm text-muted-light dark:text-muted-dark">No orders.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSellerOrders } from '@/composables/useSellerOrders'
const { orders, ready } = useSellerOrders()
const orderGrand = (o) =>
  o?.totals?.grandTotal ?? (o.products||[]).reduce((a,p)=>a + (p.totalPrice ?? p.price*(p.quantity??1)),0)
const currency = (n) => `S$${Number(n||0).toFixed(2)}`
</script>
