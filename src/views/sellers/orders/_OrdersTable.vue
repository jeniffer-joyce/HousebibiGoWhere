<!-- src/views/sellers/orders/_OrdersTable.vue -->
<template>
  <div class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
        <tr>
          <th class="px-4 py-2 text-left">Product</th>
          <th class="px-4 py-2 text-left">Buyer</th>
          <th class="px-4 py-2 text-center">Quantity</th>
          <th class="px-4 py-2 text-center">Total</th>
          <th class="px-4 py-2 text-center">Status</th>
          <th class="px-4 py-2 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in rows" :key="o.id" class="border-t border-slate-200 dark:border-slate-700">
          <td class="px-4 py-2">
            <div class="flex items-center gap-3">
              <img :src="o.products?.[0]?.img_url" class="h-10 w-10 rounded object-cover" />
              <div class="truncate">
                <p class="font-medium text-slate-900 dark:text-white truncate">{{ o.products?.[0]?.item_name }}</p>
              </div>
            </div>
          </td>
          <td class="px-4 py-2">{{ o.buyerName || '—' }}</td>
          <td class="px-4 py-2 text-center">{{ o.products?.[0]?.quantity || 1 }}</td>
          <td class="px-4 py-2 text-center">S${{ o.totals?.grandTotal?.toFixed(2) || '—' }}</td>
          <td class="px-4 py-2 text-center capitalize">
            <span class="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
              {{ o.status }}
            </span>
          </td>
          <td class="px-4 py-2 text-center">
            <button class="text-blue-600 hover:underline text-xs">View Details</button>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="6" class="px-4 py-6 text-center text-slate-500 dark:text-slate-400">No orders available</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({ rows: { type: Array, default: () => [] } })
</script>
