<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950">
    <!-- Hero Section -->
    <section class="relative h-[500px] bg-cover bg-center" 
      style="background-image: url('/HousebibiGoWhere/src/assets/home_business.png');">
      <!-- Dark overlay -->
      <div class="absolute inset-0 bg-black/50"></div>
      
      <!-- Content -->
      <div class="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h1 class="text-4xl font-bold text-white sm:text-5xl md:text-6xl mb-6">
          Empowering Home-Based Businesses
        </h1>
        <p class="max-w-3xl text-lg text-white/90 sm:text-xl mb-8">
          Connect with a community of passionate creators and discover unique, handcrafted goods.
          Whether you're a seller looking to expand your reach or a buyer seeking one-of-a-kind
          items, HousebibiGoWhere is your destination.
        </p>
        <div class="flex flex-wrap gap-4 justify-center">
          <router-link 
            to="/categories"
            class="rounded-lg bg-[#10A9C7] px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-[#10A9C7]/90 transition-all">
            Browse Categories
          </router-link>
          <router-link 
            to="/"
            class="rounded-lg bg-gray-700/80 backdrop-blur-sm px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-gray-700 transition-all">
            Explore Products
          </router-link>
        </div>
      </div>
    </section>

    <!-- Why Choose Section -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 class="text-center text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl mb-4">
        Why Choose HousebibiGoWhere?
      </h2>
      <p class="text-center text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto">
        We provide the tools and support for home-based businesses to thrive and for buyers to
        find exceptional products.
      </p>

      <!-- Feature Cards -->
      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <!-- Easy Setup -->
        <div class="flex flex-col items-center text-center p-6">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#10A9C7]/10">
            <svg class="h-8 w-8 text-[#10A9C7]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
          <h3 class="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
            Easy Setup
          </h3>
          <p class="text-slate-600 dark:text-slate-400">
            Quickly set up your online store and start selling your creations.
          </p>
        </div>

        <!-- Community Support -->
        <div class="flex flex-col items-center text-center p-6">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#10A9C7]/10">
            <svg class="h-8 w-8 text-[#10A9C7]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
          <h3 class="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
            Community Support
          </h3>
          <p class="text-slate-600 dark:text-slate-400">
            Join a vibrant community of sellers and buyers, sharing tips and inspiration.
          </p>
        </div>

        <!-- Quality Assurance -->
        <div class="flex flex-col items-center text-center p-6">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#10A9C7]/10">
            <svg class="h-8 w-8 text-[#10A9C7]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
          <h3 class="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
            Quality Assurance
          </h3>
          <p class="text-slate-600 dark:text-slate-400">
            We ensure a high standard of quality for all products and services listed on our platform.
          </p>
        </div>
      </div>
    </section>

    <!-- Meet Our Team Section -->
    <section class="bg-white dark:bg-slate-900 py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="text-center text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl mb-4">
          Meet Our Team
        </h2>
        <p class="text-center text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto">
          The passionate creators behind HousebibiGoWhere, dedicated to empowering home-based businesses.
        </p>

        <!-- Team Grid -->
        <div class="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          <!-- Team Member 1 -->
          <div class="flex flex-col items-center">
            <div class="mb-4 h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-[#10A9C7] to-[#0891b2] shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" 
                alt="Dexter"
                class="h-full w-full object-cover"
              />
            </div>
            <h3 class="text-base font-semibold text-slate-900 dark:text-white">Dexter</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">CEO & Founder</p>
          </div>

          <!-- Team Member 2 -->
          <div class="flex flex-col items-center">
            <div class="mb-4 h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-[#10A9C7] to-[#0891b2] shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" 
                alt="Sean"
                class="h-full w-full object-cover"
              />
            </div>
            <h3 class="text-base font-semibold text-slate-900 dark:text-white">Sean</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">CTO</p>
          </div>

          <!-- Team Member 3 -->
          <div class="flex flex-col items-center">
            <div class="mb-4 h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-[#10A9C7] to-[#0891b2] shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400" 
                alt="Hong Yao"
                class="h-full w-full object-cover"
              />
            </div>
            <h3 class="text-base font-semibold text-slate-900 dark:text-white">Hong Yao</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">Design Lead</p>
          </div>

          <!-- Team Member 4 -->
          <div class="flex flex-col items-center">
            <div class="mb-4 h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-[#10A9C7] to-[#0891b2] shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400" 
                alt="Mirabelle"
                class="h-full w-full object-cover"
              />
            </div>
            <h3 class="text-base font-semibold text-slate-900 dark:text-white">Mirabelle</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">Marketing Director</p>
          </div>

          <!-- Team Member 5 -->
          <div class="flex flex-col items-center">
            <div class="mb-4 h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-[#10A9C7] to-[#0891b2] shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" 
                alt="Jeniffer"
                class="h-full w-full object-cover"
              />
            </div>
            <h3 class="text-base font-semibold text-slate-900 dark:text-white">Jeniffer</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">Community Manager</p>
          </div>

          <!-- Team Member 6 -->
          <div class="flex flex-col items-center">
            <div class="mb-4 h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-[#10A9C7] to-[#0891b2] shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400" 
                alt="Jeremiah"
                class="h-full w-full object-cover"
              />
            </div>
            <h3 class="text-base font-semibold text-slate-900 dark:text-white">Jeremiah</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">Operations Lead</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Footer Links -->
        <div class="flex flex-wrap justify-center gap-8 mb-8">
          <a href="#" class="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Terms of Service
          </a>
          <a href="#" class="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" class="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Contact Us
          </a>
        </div>

        <!-- Social Icons -->
        <div class="flex justify-center gap-6 mb-8">
          <a href="#" class="text-slate-600 dark:text-slate-400 hover:text-[#10A9C7] transition-colors">
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
          <a href="#" class="text-slate-600 dark:text-slate-400 hover:text-[#10A9C7] transition-colors">
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
            </svg>
          </a>
          <a href="#" class="text-slate-600 dark:text-slate-400 hover:text-[#10A9C7] transition-colors">
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/>
            </svg>
          </a>
        </div>

        <!-- Copyright -->
        <p class="text-center text-sm text-slate-600 dark:text-slate-400">
          ©2024 HousebibiGoWhere. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

// Infinite scroll functionality
let scrollTimeout;

const handleScroll = () => {
  clearTimeout(scrollTimeout);
  
  scrollTimeout = setTimeout(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const clientHeight = window.innerHeight;
    
    // Check if user has scrolled to the bottom
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      // Smoothly scroll back to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, 100);
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  clearTimeout(scrollTimeout);
});
</script>

<style scoped>
/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Animation for team member cards on hover */
.flex.flex-col.items-center:hover img {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

.flex.flex-col.items-center img {
  transition: transform 0.3s ease;
}
</style>
