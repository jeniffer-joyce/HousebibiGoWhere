<template>
  <div class="seller-messages-container">
    <!-- Header -->
    <div class="messages-header">
      <h1>Customer Messages</h1>
      <span v-if="totalUnreadCount > 0" class="unread-badge">
        {{ totalUnreadCount }} unread
      </span>
    </div>

    <div class="messages-layout">
      <!-- Conversations List -->
      <div class="conversations-sidebar">
        <div class="search-bar">
          <input
            type="text"
            placeholder="Search customers"
            v-model="searchQuery"
            class="search-input"
          />
        </div>

        <!-- Loading State -->
        <div v-if="loading && conversations.length === 0" class="loading-state">
          <p>Loading conversations...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading && filteredConversations.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <p>No customer messages yet</p>
        </div>

        <!-- Conversations List -->
        <div v-else class="conversations-list">
          <div
            v-for="conversation in filteredConversations"
            :key="conversation.id"
            @click="selectConversation(conversation.id)"
            :class="[
              'conversation-item',
              { active: activeConversationId === conversation.id }
            ]"
          >
            <!-- Avatar -->
            <div class="conversation-avatar">
              <img
                v-if="getBuyerAvatar(conversation)"
                :src="getBuyerAvatar(conversation)"
                :alt="getBuyerName(conversation)"
              />
              <div v-else class="avatar-placeholder">
                {{ getInitials(getBuyerName(conversation)) }}
              </div>
            </div>

            <!-- Conversation Details -->
            <div class="conversation-details">
              <div class="conversation-header">
                <h3 class="customer-name">
                  {{ getBuyerName(conversation) }}
                </h3>
                <span class="message-time">
                  {{ formatMessageTime(conversation.lastMessageTime) }}
                </span>
              </div>
              <div class="conversation-preview">
                <p class="last-message">
                  <span v-if="conversation.lastMessageSenderId === currentBusinessId">
                    You: 
                  </span>
                  {{ conversation.lastMessage || 'No messages yet' }}
                </p>
                <span v-if="conversation.unreadCount > 0" class="unread-count">
                  {{ conversation.unreadCount }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="messages-area">
        <!-- No Conversation Selected -->
        <div v-if="!activeConversationId" class="no-conversation">
          <div class="no-conversation-icon">💬</div>
          <h2>No conversation selected</h2>
          <p>Choose a conversation to start messaging your customers</p>
        </div>

        <!-- Active Conversation -->
        <div v-else class="active-conversation">
          <!-- Conversation Header - SHOWS BUYER INFO -->
          <div class="conversation-header-bar">
            <div class="header-user-info">
              <div class="header-avatar">
                <img
                  v-if="activeBuyerData?.photoURL || activeBuyerData?.avatar"
                  :src="activeBuyerData?.photoURL || activeBuyerData?.avatar"
                  :alt="activeBuyerData?.displayName || activeBuyerData?.name"
                />
                <div v-else class="avatar-placeholder">
                  {{ getInitials(activeBuyerData?.displayName || activeBuyerData?.name || 'Customer') }}
                </div>
              </div>
              <div class="header-details">
                <h2>{{ activeBuyerData?.displayName || activeBuyerData?.name || activeBuyerData?.email || 'Customer' }}</h2>
                <p class="user-type">{{ activeBuyerData?.email || 'Buyer' }}</p>
              </div>
            </div>
          </div>

          <!-- Messages List -->
          <div class="messages-list" ref="messagesList">
            <div v-if="messages.length === 0" class="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>

            <!-- Grouped messages by date -->
            <div v-else class="space-y-4">
              <div v-for="group in groupedMessages" :key="group.date">
                <!-- Date Separator -->
                <div class="date-separator">
                  <div class="date-separator-line"></div>
                  <div class="date-separator-text">
                    <span>{{ group.date }}</span>
                  </div>
                </div>

                <!-- Messages for this date -->
                <div class="messages-group">
                  <div
                    v-for="message in group.messages"
                    :key="message.id"
                    :class="[
                      'message',
                      { 'message-sent': message.senderId === currentBusinessId },
                      { 'message-received': message.senderId !== currentBusinessId }
                    ]"
                  >
                    <div class="message-content">
                      <div class="message-bubble">
                        <p>{{ message.text }}</p>
                        <span class="message-timestamp">
                          {{ formatMessageTimeDetailed(message.timestamp || message.createdAt) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="message-input-container">
            <form @submit.prevent="handleSendMessage" class="message-form">
              <input
                type="text"
                v-model="newMessage"
                placeholder="Type your message..."
                class="message-input"
                :disabled="sending"
              />
              <button
                type="submit"
                :disabled="!newMessage.trim() || sending"
                class="send-button"
              >
                {{ sending ? 'Sending...' : 'Send' }}
              </button>
            </form>
          </div>
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
  if (!conversation) return null;
  
  const buyerId = conversation.otherUserId;
  const cachedBuyer = buyersCache.value[buyerId];
  
  if (cachedBuyer) {
    return cachedBuyer.photoURL || cachedBuyer.avatar;
  }
  
  // Fallback to otherUser if available
  if (conversation.otherUser?.avatar) {
    return conversation.otherUser.avatar;
  }
  
  return null;
};

// Initialize useMessages with business ID
const {
  conversations,
  activeConversationId,
  activeConversation,
  messages,
  loading,
  error,
  totalUnreadCount,
  loadConversations,
  loadMessages,
  sendNewMessage,
  formatMessageTime,
  formatMessageTimeDetailed
} = useMessages(currentBusinessId);

// Filtered conversations based on search
const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return conversations.value;
  }

  const query = searchQuery.value.toLowerCase();
  return conversations.value.filter(conv => {
    const buyerName = getBuyerName(conv);
    return buyerName.toLowerCase().includes(query) ||
           conv.lastMessage?.toLowerCase().includes(query);
  });
});

// Format date separator (e.g., "Today", "Yesterday", "October 24, 2025")
const formatDateSeparator = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset time to midnight for comparison
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

// Get initials for avatar
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Select a conversation
const selectConversation = async (conversationId) => {
  loadMessages(conversationId);
  
  // Find the conversation and fetch buyer data
  const conversation = conversations.value.find(c => c.id === conversationId);
  if (conversation && conversation.otherUserId) {
    activeBuyerData.value = await fetchBuyerData(conversation.otherUserId);
  }
};

// Handle sending message
const handleSendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) {
    return;
  }

  try {
    sending.value = true;
    await sendNewMessage(newMessage.value);
    newMessage.value = '';
  } catch (err) {
    console.error('Error sending message:', err);
    alert('Failed to send message. Please try again.');
  } finally {
    sending.value = false;
  }
};

// Pre-fetch buyer data for all conversations
const preloadBuyerData = async () => {
  if (!conversations.value || conversations.value.length === 0) return;
  
  for (const conversation of conversations.value) {
    if (conversation.otherUserId && !buyersCache.value[conversation.otherUserId]) {
      await fetchBuyerData(conversation.otherUserId);
    }
  }
};

// Watch for conversations changes and preload buyer data
watch(conversations, async (newConversations) => {
  if (newConversations && newConversations.length > 0) {
    await preloadBuyerData();
  }
}, { deep: true });

// Watch for active conversation changes
watch(activeConversationId, async (newId) => {
  if (newId) {
    const conversation = conversations.value.find(c => c.id === newId);
    if (conversation && conversation.otherUserId) {
      activeBuyerData.value = await fetchBuyerData(conversation.otherUserId);
    }
  } else {
    activeBuyerData.value = null;
  }
});

// Auto-scroll to bottom when new messages arrive
watch(messages, async () => {
  await nextTick();
  if (messagesList.value) {
    messagesList.value.scrollTop = messagesList.value.scrollHeight;
  }
}, { deep: true });

// Initialize on mount
onMounted(async () => {
  await fetchBusinessData();
  
  // Load conversations after business ID is set
  if (currentBusinessId.value) {
    loadConversations();
  }
});

// Handle errors
watch(error, (newError) => {
  if (newError) {
    console.error('Messages error:', newError);
  }
});
</script>

<style scoped>
.seller-messages-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.messages-header {
  background: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.messages-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.unread-badge {
  background: #ff4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.messages-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Conversations Sidebar */
.conversations-sidebar {
  width: 350px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.search-bar {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.conversation-item:hover {
  background: #f9f9f9;
}

.conversation-item.active {
  background: #e8f5e9;
  border-left: 3px solid #4CAF50;
}

.conversation-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 1rem;
}

.conversation-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.conversation-details {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.customer-name {
  font-size: 0.938rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-time {
  font-size: 0.75rem;
  color: #999;
  flex-shrink: 0;
}

.conversation-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.unread-count {
  background: #4CAF50;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

/* Empty/Loading States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Messages Area */
.messages-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.no-conversation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
}

.no-conversation-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.no-conversation h2 {
  font-size: 1.5rem;
  color: #666;
  margin: 0 0 0.5rem 0;
}

.no-conversation p {
  color: #999;
}

/* Active Conversation */
.active-conversation {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.conversation-header-bar {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.header-user-info {
  display: flex;
  align-items: center;
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
}

.header-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-details h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.user-type {
  font-size: 0.813rem;
  color: #999;
  margin: 0.125rem 0 0 0;
  text-transform: capitalize;
}

/* Messages List */
.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #f8f9fa;
}

.no-messages {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

/* Date Separator */
.date-separator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
}

.date-separator-line {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
}

.date-separator-line::before {
  content: '';
  width: 100%;
  border-top: 1px solid #e0e0e0;
}

.date-separator-text {
  position: relative;
  padding: 0 0.75rem;
  background: #f8f9fa;
}

.date-separator-text span {
  font-size: 0.75rem;
  font-weight: 500;
  color: #666;
}

/* Messages Group */
.messages-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message {
  display: flex;
  margin-bottom: 0.5rem;
}

.message-sent {
  justify-content: flex-end;
}

.message-received {
  justify-content: flex-start;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 60%;
}

.message-sent .message-content {
  align-items: flex-end;
}

.message-received .message-content {
  align-items: flex-start;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 18px;
  word-wrap: break-word;
  position: relative;
}

.message-sent .message-bubble {
  background: #2563eb;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-received .message-bubble {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-bubble p {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-timestamp {
  font-size: 0.688rem;
  margin-top: 0.25rem;
  display: block;
}

.message-sent .message-timestamp {
  color: rgba(255, 255, 255, 0.75);
}

.message-received .message-timestamp {
  color: #9ca3af;
}

/* Message Input */
.message-input-container {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.message-form {
  display: flex;
  gap: 0.75rem;
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 0.938rem;
}

.message-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.send-button {
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 24px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #45a049;
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Scrollbar Styling */
.conversations-list::-webkit-scrollbar,
.messages-list::-webkit-scrollbar {
  width: 6px;
}

.conversations-list::-webkit-scrollbar-track,
.messages-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.conversations-list::-webkit-scrollbar-thumb,
.messages-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.conversations-list::-webkit-scrollbar-thumb:hover,
.messages-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>