<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase/firebase_config';
import { useMessages } from '@/composables/useMessages.js'
import { user } from '@/store/user.js'

const router = useRouter()
const unreadCount = ref(0)
const currentUserId = ref(null) // 🔹 CHANGED from currentBusinessId

// Navigate to messages page
function goToMessages() {
  router.push('/buyer-messages')
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

</script>

<template>
  <div v-if="user.isLoggedIn" class="fixed bottom-6 right-6 z-[9999]">
    <button @click="goToMessages" class="relative p-4 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition">
      <!-- Chat icon SVG -->
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 3.866-3.582 7-8 7a8.964 8.964 0 01-4-.933L3 21l1.933-6.333A8.964 8.964 0 013 12c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
      </svg>

      <!-- Notification badge -->
      <span v-if="unreadCount > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full unread-badge">
        {{ unreadCount }}
      </span>
    </button>
  </div>
</template>

<style scoped>
/* Optional: add a pulse animation for new messages */
</style>