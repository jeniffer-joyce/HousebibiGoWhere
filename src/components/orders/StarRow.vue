<template>
  <div class="flex items-center">
    <svg
      v-for="n in 5"
      :key="n"
      class="h-5 w-5"
      :class="n <= value ? 'text-blue-500' : 'text-slate-300'"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.802-2.036a1 1 0 00-1.175 0L6.616 16.28c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"
      />
    </svg>
  </div>
</template>

<script setup>
defineProps({
  value: { type: Number, default: 0 }
})
</script>
