<template>
  <div class="bg-background dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
    <div class="flex min-h-screen w-full flex-col">
      <!-- Conditionally render navbars -->
      <template v-if="!user.loading">
        <SellersNavbar v-if="user.role === 'seller'" />
        <Navbar v-else />

        <router-view />
        <Footer />
      </template>
      
    </div>
  </div>
</template>

<script setup>
import { user } from "@/store/user.js";
import Navbar from '@/components/layout/Navbar.vue';           // buyer navbar
import SellersNavbar from '@/components/layout/SellerNavBar.vue'; // seller navbar
import Footer from '@/components/layout/Footer.vue';
</script>
