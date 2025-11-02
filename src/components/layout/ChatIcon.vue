<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth } from '@/firebase/firebase_config';
import { useMessages } from '@/composables/useMessages.js'
import { user } from '@/store/user.js'

const router = useRouter()
const route = useRoute()
const unreadCount = ref(0)
const currentUserId = ref(null) // 🔹 CHANGED from currentBusinessId

// Navigate to respective messages based on user role
function goToMessages() {
  if (user.role === 'seller') {
    router.push('/seller-messages/')
  } else {
    router.push('/buyer-messages/')
  }
}

// Fetch the currently logged-in user
const fetchCurrentUserId = () => { // 🔹 CHANGED function name
  const currentUser = auth.currentUser
  if (currentUser) {
    currentUserId.value = currentUser.uid
  }
}

// Initialize messages composable with reactive user ID
const { totalUnreadCount, loadConversations } = useMessages(currentUserId)

// Watch totalUnreadCount and update local unreadCount
watch(totalUnreadCount, (val) => {
  unreadCount.value = val
})

// Load conversations after user is fetched
onMounted(() => {
  fetchCurrentUserId()
  if (currentUserId.value) {
    loadConversations() // fetch conversations for badge count
  }
})

// Computed property to determine if we should show the icon
const showChatIcon = computed(() => {
  const hiddenRoutes = ['/buyer-messages/', '/seller-messages/']
  return user.isLoggedIn && !hiddenRoutes.includes(route.path)
})

</script>

<template>
  <div v-if="showChatIcon" class="fixed bottom-6 right-6 z-[9999]">
    <button @click="goToMessages" class="relative p-4 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition">
      <!-- Chat icon SVG -->
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2A1 1 0 003.8 21.454l3.032-.892A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-3 11a1 1 0 110-2 1 1 0 010 2zm3 0a1 1 0 110-2 1 1 0 010 2zm3 0a1 1 0 110-2 1 1 0 010 2z"/>
      </svg>

      <!-- Notification badge -->
      <span v-if="unreadCount > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full unread-badge">
        {{ unreadCount }}
      </span>
    </button>
  </div>
</template>