<!-- src/views/sellers/orders/SellerOrdersShipping.vue -->
<template><h2 class="text-2xl font-bold mb-4">Shipping</h2><OrdersTable :rows="rows" /></template>
<script setup>
import { computed } from 'vue'
import { useSellerOrders } from '@/composables/useSellerOrders'
import OrdersTable from './_OrdersTable.vue'
const { orders, statusOf } = useSellerOrders()
const rows = computed(() => orders.value.filter(o => statusOf(o) === 'shipped'))
</script>
