<template>
  <div class="flex h-screen bg-slate-50 dark:bg-slate-900">
    <div class="flex w-full h-full">
      <!-- Conversations List -->
      <div class="w-96 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-800">
        <!-- Header -->
        <div class="p-4 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Customer Messages</h1>
            <span v-if="totalUnreadCount > 0" 
              class="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
              {{ totalUnreadCount }} unread
            </span>
          </div>
          
          <!-- Search -->
          <div class="relative">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search customers"
              class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
            <svg class="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <!-- Conversations List -->
        <div class="flex-1 overflow-y-auto">
          <!-- Loading State -->
          <div v-if="loading && conversations.length === 0" class="flex items-center justify-center h-full">
            <div class="text-center">
              <svg class="animate-spin h-10 w-10 mx-auto text-primary mb-3" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <p class="text-slate-600 dark:text-slate-400">Loading conversations...</p>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredConversations.length === 0" class="flex items-center justify-center h-full">
            <div class="text-center px-4">
              <svg class="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <p class="text-slate-600 dark:text-slate-400">
                {{ searchQuery ? 'No conversations found' : 'No customer messages yet' }}
              </p>
            </div>
          </div>

          <!-- Conversations -->
          <div v-else>
            <div 
              v-for="conversation in filteredConversations" 
              :key="conversation.id"
              @click="selectConversation(conversation.id)"
              :class="[
                'p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors',
                activeConversationId === conversation.id ? 'bg-slate-100 dark:bg-slate-700 border-l-4 border-l-primary' : ''
              ]">
              <div class="flex items-start gap-3">
                <div class="relative">
                  <img 
                    :src="getBuyerAvatar(conversation)" 
                    :alt="getBuyerName(conversation)" 
                    class="w-12 h-12 rounded-full object-cover" />
                  <span v-if="conversation.unreadCount > 0" 
                    class="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                    {{ conversation.unreadCount }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-1">
                    <h3 class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {{ getBuyerName(conversation) }}
                    </h3>
                    <span class="text-xs text-slate-500 dark:text-slate-400 ml-2 flex-shrink-0">
                      {{ formatMessageTime(conversation.lastMessageTime) }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-sm text-slate-600 dark:text-slate-400 truncate flex-1">
                      <span v-if="conversation.lastMessageSenderId === currentBusinessId" class="font-medium">You: </span>
                      {{ conversation.lastMessage || 'No messages yet' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div v-if="activeConversationId" class="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
        <!-- Chat Header -->
        <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
          <div class="flex items-center gap-3">
            <img 
              :src="activeBuyerAvatar" 
              :alt="activeBuyerName" 
              class="w-10 h-10 rounded-full object-cover" />
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">
                {{ activeBuyerName }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ activeBuyerData?.email || 'Customer' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div 
          ref="messagesList"
          class="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900">
          <div v-if="!messages || messages.length === 0" class="flex items-center justify-center h-full">
            <div class="text-center">
              <svg class="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <p class="text-slate-600 dark:text-slate-400">No messages yet. Start the conversation!</p>
            </div>
          </div>

          <!-- Grouped messages by date -->
          <div v-else class="space-y-4">
            <div v-for="group in groupedMessages" :key="group.date">
              <!-- Date Separator -->
              <div class="relative flex items-center justify-center my-4">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div class="relative px-3 bg-slate-50 dark:bg-slate-900">
                  <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {{ group.date }}
                  </span>
                </div>
              </div>

              <!-- Messages for this date -->
              <div class="space-y-2">
                <div
                  v-for="message in group.messages"
                  :key="message.id"
                  :class="[
                    'flex',
                    message.senderId === currentBusinessId ? 'justify-end' : 'justify-start'
                  ]">
                  <div :class="[
                    'max-w-xs px-3 py-2 rounded-2xl',
                    message.senderId === currentBusinessId
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md shadow-sm'
                  ]">
                    <p class="text-sm whitespace-pre-wrap break-words">{{ message.text }}</p>
                    <p :class="[
                      'text-xs mt-1',
                      message.senderId === currentBusinessId ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                    ]">
                      {{ formatMessageTimeDetailed(message.timestamp || message.createdAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
          <form @submit.prevent="handleSendMessage" class="flex items-end gap-3">
            <textarea
              v-model="newMessage"
              @keydown.enter.exact.prevent="handleSendMessage"
              placeholder="Type your message..."
              rows="1"
              :disabled="sending"
              class="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
            <button
              type="submit"
              :disabled="!newMessage.trim() || sending"
              :class="[
                'p-3 rounded-lg transition-colors',
                newMessage.trim() && !sending
                  ? 'bg-primary text-white hover:bg-primary/90' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
              ]">
              <svg v-if="!sending" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              <svg v-else class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </button>
          </form>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div class="text-center">
          <svg class="h-24 w-24 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">No conversation selected</h3>
          <p class="text-slate-600 dark:text-slate-400">Choose a conversation to start messaging your customers</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useMessages } from '../../composables/useMessages';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase_config';
import { getAuth } from 'firebase/auth';

// Get current user's UID from Firebase Auth
const auth = getAuth();
const currentUser = auth.currentUser;

// Current business ID (this is the logged-in seller's business UID)
const currentBusinessId = ref(null);
const businessName = ref('');
const businessData = ref(null);
const searchQuery = ref('');
const newMessage = ref('');
const sending = ref(false);
const messagesList = ref(null);

// Store buyer data for active conversation
const activeBuyerData = ref(null);
const buyersCache = ref({});

// Fetch business data for current user
const fetchBusinessData = async () => {
  if (!currentUser) {
    console.error('No user logged in');
    return;
  }

  try {
    // Set the current business ID to the authenticated user's UID
    currentBusinessId.value = currentUser.uid;
    
    // Fetch business document
    const businessDoc = await getDoc(doc(db, 'businesses', currentUser.uid));
    
    if (businessDoc.exists()) {
      businessData.value = businessDoc.data();
      businessName.value = businessData.value.name || businessData.value.businessName || 'Your Business';
      console.log('Business data loaded:', businessName.value);
    } else {
      console.error('Business document not found for UID:', currentUser.uid);
      businessName.value = 'Business';
    }
  } catch (error) {
    console.error('Error fetching business data:', error);
    businessName.value = 'Business';
  }
};

// Fetch buyer/user data from users collection
const fetchBuyerData = async (buyerId) => {
  if (!buyerId) return null;
  
  // Check cache first
  if (buyersCache.value[buyerId]) {
    return buyersCache.value[buyerId];
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', buyerId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const buyerData = {
        id: buyerId,
        displayName: userData.displayName || userData.name || null,
        name: userData.name || userData.displayName || null,
        email: userData.email || null,
        photoURL: userData.photoURL || userData.avatar || null,
        avatar: userData.avatar || userData.photoURL || null,
        type: 'buyer'
      };
      
      // Cache the data
      buyersCache.value[buyerId] = buyerData;
      console.log('Buyer data fetched:', buyerData);
      return buyerData;
    } else {
      console.warn('User document not found for ID:', buyerId);
      return {
        id: buyerId,
        displayName: 'Customer',
        name: 'Customer',
        email: null,
        photoURL: null,
        avatar: null,
        type: 'buyer'
      };
    }
  } catch (error) {
    console.error('Error fetching buyer data:', error);
    return {
      id: buyerId,
      displayName: 'Customer',
      name: 'Customer',
      email: null,
      photoURL: null,
      avatar: null,
      type: 'buyer'
    };
  }
};

// Get buyer name from conversation
const getBuyerName = (conversation) => {
  if (!conversation) return 'Customer';
  
  const buyerId = conversation.otherUserId;
  const cachedBuyer = buyersCache.value[buyerId];
  
  if (cachedBuyer) {
    return cachedBuyer.displayName || cachedBuyer.name || cachedBuyer.email || 'Customer';
  }
  
  // Fallback to otherUser if available (from useMessages composable)
  if (conversation.otherUser) {
    return conversation.otherUser.name || 'Customer';
  }
  
  return 'Customer';
};

// Get buyer avatar from conversation
const getBuyerAvatar = (conversation) => {
  if (!conversation) return getDefaultAvatar('Customer');
  
  const buyerId = conversation.otherUserId;
  const cachedBuyer = buyersCache.value[buyerId];
  
  if (cachedBuyer?.photoURL) {
    return cachedBuyer.photoURL;
  }
  
  if (cachedBuyer?.avatar) {
    return cachedBuyer.avatar;
  }
  
  // Fallback to otherUser if available
  if (conversation.otherUser?.avatar) {
    return conversation.otherUser.avatar;
  }
  
  const name = getBuyerName(conversation);
  return getDefaultAvatar(name);
};

// Get default avatar URL
const getDefaultAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=50`;
};

// Get initials for avatar placeholder
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Initialize composable with current business ID
const currentBusinessIdComputed = computed(() => currentBusinessId.value);

// Initialize the messages composable
const messaging = useMessages(currentBusinessIdComputed);

// Destructure
const conversations = messaging.conversations;
const activeConversationId = messaging.activeConversationId;
const activeConversation = messaging.activeConversation;
const messages = messaging.messages;
const loading = messaging.loading;
const error = messaging.error;
const totalUnreadCount = messaging.totalUnreadCount;
const loadConversations = messaging.loadConversations;
const loadMessages = messaging.loadMessages;
const sendNewMessage = messaging.sendNewMessage;
const formatMessageTime = messaging.formatMessageTime;
const formatMessageTimeDetailed = messaging.formatMessageTimeDetailed;

// Filtered conversations based on search query
const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return conversations.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return conversations.value.filter(conv => {
    const buyerName = getBuyerName(conv).toLowerCase();
    const lastMessage = (conv.lastMessage || '').toLowerCase();
    return buyerName.includes(query) || lastMessage.includes(query);
  });
});

// Computed properties for active buyer
const activeBuyerName = computed(() => {
  if (!activeConversation.value) return 'Customer';
  return getBuyerName(activeConversation.value);
});

const activeBuyerAvatar = computed(() => {
  if (!activeConversation.value) return getDefaultAvatar('Customer');
  return getBuyerAvatar(activeConversation.value);
});

// Watch for active conversation changes to fetch buyer data
watch(activeConversationId, async (newId) => {
  if (newId) {
    const conv = conversations.value.find(c => c.id === newId);
    if (conv && conv.otherUserId) {
      activeBuyerData.value = await fetchBuyerData(conv.otherUserId);
    }
  } else {
    activeBuyerData.value = null;
  }
});

// Watch conversations to pre-fetch buyer data
watch(conversations, async (newConversations) => {
  for (const conv of newConversations) {
    if (conv.otherUserId && !buyersCache.value[conv.otherUserId]) {
      await fetchBuyerData(conv.otherUserId);
    }
  }
}, { deep: true, immediate: true });

// Format date separator
const formatDateSeparator = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  
  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};

// Group messages by date
const groupedMessages = computed(() => {
  if (!messages.value || messages.value.length === 0) return [];
  
  const groups = [];
  let currentDate = null;
  let currentGroup = null;
  
  messages.value.forEach(message => {
    const messageDate = formatDateSeparator(message.timestamp || message.createdAt);
    
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      currentGroup = {
        date: messageDate,
        messages: []
      };
      groups.push(currentGroup);
    }
    
    currentGroup.messages.push(message);
  });
  
  return groups;
});

// Select a conversation
const selectConversation = (conversationId) => {
  loadMessages(conversationId);
  nextTick(() => {
    scrollToBottom();
  });
};

// Send message
const handleSendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return;
  
  try {
    sending.value = true;
    await sendNewMessage(newMessage.value);
    newMessage.value = '';
    await nextTick();
    scrollToBottom();
  } catch (err) {
    console.error('Error sending message:', err);
    alert('Failed to send message. Please try again.');
  } finally {
    sending.value = false;
  }
};

// Scroll to bottom
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesList.value) {
      messagesList.value.scrollTop = messagesList.value.scrollHeight;
    }
  });
};

// Initialize
onMounted(async () => {
  await fetchBusinessData();
  if (currentBusinessId.value) {
    loadConversations();
  }
});
</script>

<style scoped>
textarea {
  max-height: 150px;
}
</style>