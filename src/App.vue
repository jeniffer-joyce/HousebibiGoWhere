<template>
  <div class="bg-background dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
    <div class="flex min-h-screen w-full flex-col">
      <template v-if="!user.loading">
        <SellersNavbar v-if="user.role === 'seller'" />
        <Navbar
          v-else
          :is-buyer-side-bar="user.role === 'buyer' && $route.path.startsWith('/buyer-')"
        />
        <ChatIcon />

        <router-view />
        <ToastNotification
      :show="toastState.show"
      :type="toastState.type"
      :title="toastState.title"
      :message="toastState.message"
      :duration="toastState.duration"
      @close="close"
    />
        <!-- Hide footer on messages pages -->
        <Footer v-if="!isMessagesPage" />
      </template>
    </div>

    <OnboardingModal
      :show="showOnboarding"
      @close="showOnboarding = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { user } from "@/store/user.js"
import Navbar from '@/components/layout/Navbar.vue'
import SellersNavbar from '@/components/layout/SellerNavBar.vue'
import Footer from '@/components/layout/Footer.vue'
import OnboardingModal from '@/components/modals/OnboardingModal.vue'
import { useToast } from '@/composables/useToast'
import ToastNotification from '@/components/ToastNotification.vue'
import ChatIcon from '@/components/layout/ChatIcon.vue'
import { initInventoryAuthBridge } from '@/firebase/services/sellers/seller_product'

const route = useRoute()

onMounted(() => {
  initInventoryAuthBridge()
})

const { toastState, close } = useToast()

const showOnboarding = ref(false)

// Check if current page is messages page (buyer or seller)
const isMessagesPage = computed(() => {
  return route.path === '/buyer-messages/' || 
         route.path.startsWith('/buyer-messages') ||
         route.path === '/seller-messages/' ||
         route.path.startsWith('/seller-messages')
})

// Watch for new seller signups that need onboarding
watch(() => user.needsOnboarding, (needs) => {
  console.log('👀 needsOnboarding changed to:', needs)
  if (needs) {
    showOnboarding.value = true
  }
})
</script>