<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950 overflow-x-hidden">
    <!-- Hero Section with uploaded image -->
    <section class="relative w-full min-h-[60vh] sm:min-h-[80vh] bg-cover bg-center"
    style="background-image: url('/home_business.png');">
      <!-- Lighter overlay to show the image better -->
      <div class="absolute inset-0 bg-black/40"></div>
      
      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center px-4 sm:px-6 md:px-8 text-center w-full pt-20 sm:pt-32 md:pt-40">
        <h1 class="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">
          Empowering Home-Based Businesses
        </h1>
        <p class="max-w-xl sm:max-w-3xl text-sm sm:text-lg md:text-xl text-white/95 mb-6 sm:mb-8 drop-shadow-md">
          Connect with a community of passionate creators and discover unique, handcrafted goods.
          Whether you're a seller looking to expand your reach or a buyer seeking one-of-a-kind
          items, HousebibiGoWhere is your destination.
        </p>
        <div class="flex flex-col sm:flex-row sm:gap-4 space-y-3 sm:space-y-0">
          <router-link 
            to="/"
            class="rounded-lg bg-[#10A9C7] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg hover:bg-[#10A9C7]/90 transition-all">
            Browse Featured Businesses
          </router-link>
          <router-link 
            to="/products"
            class="rounded-lg bg-gray-700/80 backdrop-blur-sm px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg hover:bg-gray-700 transition-all">
            Explore Products
          </router-link>
        </div>
      </div>
    </section>

    <!-- Why Choose Section -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h3 class="text-center text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl md:text-4xl mb-4">
        Why Choose HousebibiGoWhere?
      </h3>
      <p class="text-center text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-8 sm:mb-4">
        We provide the tools and support for home-based businesses to thrive and for buyers to
        find exceptional products.
      </p>

      <!-- Feature Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <!-- Easy Setup -->
        <div class="flex flex-col items-center text-center p-4 sm:p-6">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#10A9C7]/10">
            <svg class="h-8 w-8 text-[#10A9C7]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
          <h3 class="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
            Easy Setup
          </h3>
          <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Quickly set up your online store and start selling your creations.
          </p>
        </div>

        <!-- Community Support -->
        <div class="flex flex-col items-center text-center p-4 sm:p-6">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#10A9C7]/10">
            <svg class="h-8 w-8 text-[#10A9C7]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
          <h3 class="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
            Community Support
          </h3>
          <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Join a vibrant community of sellers and buyers, sharing tips and inspiration.
          </p>
        </div>

        <!-- Quality Assurance -->
        <div class="flex flex-col items-center text-center p-4 sm:p-6">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#10A9C7]/10">
            <svg class="h-8 w-8 text-[#10A9C7]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
          <h3 class="mb-2 text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Quality Assurance
          </h3>
          <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            We ensure a high standard of quality for all products and services listed on our platform.
          </p>
        </div>
      </div>
    </section>

    <!-- Meet Our Team Section -->
    <section class="bg-white dark:bg-slate-900 py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Meet Our Team
        </h2>
        <p class="text-center text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-xl sm:max-w-3xl mx-auto">
          The passionate creators behind HousebibiGoWhere, dedicated to empowering home-based businesses.
        </p>

        <!-- Team Grid -->
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <!-- Team Member 1 -->
          <div class="flex flex-col items-center">
            <div class="mb-4 h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full bg-gradient-to-br from-[#10A9C7] to-[#0891b2] shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" 
                alt="Dexter"
                class="h-full w-full object-cover max-w-full"
              />
            </div>
            <h3 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Dexter</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">CEO & Founder</p>
          </div>

          <!-- Team Member 2 -->
          <div class="flex flex-col items-center">
            <div class="mb-4 h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full bg-gradient-to-br from-[#10A9C7] to-[#0891b2] shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" 
                alt="Sean"
                class="h-full w-full object-cover max-w-full"
              />
            </div>
            <h3 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Sean</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Designer Lead</p>
          </div>

          <!-- Team Member 3 -->
          <div class="flex flex-col items-center">
            <div class="mb-4 h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full bg-gradient-to-br from-[#10A9C7] to-[#0891b2] shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400" 
                alt="Hong Yao"
                class="h-full w-full object-cover max-w-full"
              />
            </div>
            <h3 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Hong Yao</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">CTO</p>
          </div>

          <!-- Team Member 4 -->
          <div class="flex flex-col items-center">
            <div class="mb-4 h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full bg-gradient-to-br from-[#10A9C7] to-[#0891b2] shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400" 
                alt="Jeniffer"
                class="h-full w-full object-cover max-w-full"
              />
            </div>
            <h3 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Jeniffer</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Marketing Director</p>
          </div>

          <!-- Team Member 5 -->
          <div class="flex flex-col items-center">
            <div class="mb-4 h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full bg-gradient-to-br from-[#10A9C7] to-[#0891b2] shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" 
                alt="Mirabelle"
                class="h-full w-full object-cover max-w-full"
              />
            </div>
            <h3 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Mirabelle</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Community Manager</p>
          </div>

          <!-- Team Member 6 -->
          <div class="flex flex-col items-center">
            <div class="mb-4 h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full bg-gradient-to-br from-[#10A9C7] to-[#0891b2] shadow-lg">
              <img 
                src="/src/assets/JeremiahMugshot.jpeg" 
                alt="Jeremiah"
                class="h-full w-full object-cover max-w-full"
              />
            </div>
            <h3 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Jeremiah</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Operations Lead</p>
          </div>
        </div>
      </div>
    </section>
    
  </div>
</template>

<script setup>
// No infinite scroll - page scrolls normally
</script>

<style scoped>
/* Animation for team member cards on hover */
.flex.flex-col.items-center:hover img {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

.flex.flex-col.items-center img {
  transition: transform 0.3s ease;
}
</style>