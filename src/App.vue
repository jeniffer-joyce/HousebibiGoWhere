<template>
  <div class="bg-background dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
    <div class="flex min-h-screen w-full flex-col">
      <Navbar />
      <router-view />
      <Footer />
    </div>
  </div>
</template>

<!-- <style scoped></style> -->

<script setup>
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
</script>
