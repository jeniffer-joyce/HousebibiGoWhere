<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase/firebase_config';
import { getOrCreateConversation } from '../firebase/messageService';

const props = defineProps({
  sellerId: {
    type: String,
    required: true
  },
  sellerName: {
    type: String,
    default: 'Seller'
  },
  variant: {
    type: String,
    default: 'primary', // 'primary', 'secondary', 'icon'
    validator: (value) => ['primary', 'secondary', 'icon'].includes(value)
  },
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
});

const router = useRouter();
const loading = ref(false);

const currentUserId = computed(() => auth.currentUser?.uid);

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 disabled:bg-primary/50',
    secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary/5 disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700',
    icon: 'p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-full'
  };
  
  return `${base} ${sizes[props.size]} ${variants[props.variant]}`;
});

async function handleMessageClick() {
  if (!currentUserId.value) {
    alert('Please login to send messages');
    router.push('/login');
    return;
  }
  
  if (!props.sellerId) {
    alert('Invalid seller ID');
    return;
  }
  
  try {
    loading.value = true;
    
    // Create or get conversation
    const conversation = await getOrCreateConversation(
      currentUserId.value,
      props.sellerId
    );
    
    // Navigate to messages page with conversation ID
    router.push({
      name: 'BuyerMessages', // or your route name
      query: { conversation: conversation.id }
    });
  } catch (error) {
    console.error('Error opening conversation:', error);
    alert('Failed to open conversation. Please try again.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="loading || !sellerId"
    @click="handleMessageClick"
    type="button">
    <!-- Loading Spinner -->
    <svg 
      v-if="loading" 
      class="animate-spin h-5 w-5" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    
    <!-- Message Icon -->
    <svg 
      v-else
      class="h-5 w-5" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24">
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
      </path>
    </svg>
    
    <!-- Button Text (only for non-icon variants) -->
    <span v-if="variant !== 'icon'">
      {{ loading ? 'Loading...' : 'Message' }}
    </span>
  </button>
</template>