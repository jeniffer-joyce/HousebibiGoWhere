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
                {{ activeBuyerEmail || 'Customer' }}
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
          <!-- Selected Files Preview -->
          <div v-if="selectedFiles.length > 0" class="mb-3 flex flex-wrap gap-2">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="relative flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 pr-8">
              <span class="text-xl">{{ getFileIcon(file) }}</span>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                  {{ file.name }}
                </span>
                <span class="text-xs text-slate-500 dark:text-slate-400">
                  {{ formatFileSize(file.size) }}
                </span>
              </div>
              <button
                @click="removeFile(index)"
                type="button"
                class="absolute right-1 top-1 p-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 rounded">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <form @submit.prevent="selectedFiles.length > 0 ? sendMessageWithFiles() : handleSendMessage()" class="flex items-end gap-3">
            <!-- Hidden file input -->
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              @change="handleFileSelect"
              class="hidden" />
            
            <!-- Paperclip button -->
            <button 
              type="button"
              @click="openFilePicker"
              class="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Attach files or images">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
              </svg>
            </button>
            <textarea
              v-model="newMessage"
              @keydown.enter.exact.prevent="selectedFiles.length > 0 ? sendMessageWithFiles() : handleSendMessage()"
              placeholder="Type your message..."
              rows="1"
              :disabled="sending"
              class="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
            <button
              type="submit"
              :disabled="(!newMessage.trim() && selectedFiles.length === 0) || sending || uploadingFiles"
              :class="[
                'p-3 rounded-lg transition-colors',
                (newMessage.trim() || selectedFiles.length > 0) && !sending && !uploadingFiles
                  ? 'bg-primary text-white hover:bg-primary/90' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
              ]">
              <svg v-if="!sending && !uploadingFiles" class="h-6 w-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <p class="text-slate-600 dark:text-slate-400">Choose a conversation to start messaging</p>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <ToastNotification
      :show="showToast"
      :type="toastType"
      :title="toastTitle"
      :message="toastMessage"
      @close="closeToast" />

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmModal"
      :type="confirmModalType"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="handleConfirm"
      @cancel="handleCancel" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { auth, db } from '@/firebase/firebase_config';
import { doc, getDoc } from 'firebase/firestore';
import { useMessages } from '@/composables/useMessages';
import ToastNotification from '@/components/ToastNotification.vue';
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue';

// Component state
const searchQuery = ref('');
const currentBusinessId = ref(null);
const newMessage = ref('');
const sending = ref(false);
const messagesList = ref(null);
const buyersCache = ref({});
const activeBuyerData = ref(null);

// File upload state
const fileInput = ref(null);
const selectedFiles = ref([]);
const uploadingFiles = ref(false);

// Toast state
const showToast = ref(false);
const toastType = ref('success');
const toastTitle = ref('');
const toastMessage = ref('');

// Confirmation modal state
const showConfirmModal = ref(false);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');
const confirmModalType = ref('warning');
const pendingAction = ref(null);

// Show toast notification
function showToastNotification(type, title, message) {
  toastType.value = type;
  toastTitle.value = title;
  toastMessage.value = message;
  showToast.value = true;
}

// Close toast
function closeToast() {
  showToast.value = false;
}

// Show confirmation modal
function showConfirmation(title, message, type, action) {
  confirmModalTitle.value = title;
  confirmModalMessage.value = message;
  confirmModalType.value = type;
  pendingAction.value = action;
  showConfirmModal.value = true;
}

// Handle confirmation
function handleConfirm() {
  showConfirmModal.value = false;
  if (pendingAction.value) {
    pendingAction.value();
    pendingAction.value = null;
  }
}

// Handle cancel
function handleCancel() {
  showConfirmModal.value = false;
  pendingAction.value = null;
}

// Fetch business data from Firebase
const fetchBusinessData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      showToastNotification('error', 'Authentication Error', 'No user is currently logged in');
      return;
    }

    const businessDoc = await getDoc(doc(db, 'businesses', user.uid));
    if (businessDoc.exists()) {
      currentBusinessId.value = user.uid;
    } else {
      showToastNotification('error', 'Business Not Found', 'Business profile not found');
    }
  } catch (error) {
    console.error('Error fetching business data:', error);
    showToastNotification('error', 'Error Loading Business', 'Failed to load business data');
  }
};

// Fetch buyer data
const fetchBuyerData = async (buyerId) => {
  if (buyersCache.value[buyerId]) {
    return buyersCache.value[buyerId];
  }

  try {
    // Fetch from users collection (buyers are users with role="buyer")
    const userDoc = await getDoc(doc(db, 'users', buyerId));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const buyerInfo = {
        displayName: data.displayName || data.username || data.email?.split('@')[0] || 'Customer',
        email: data.email || '',
        photoURL: data.photoURL || null,
        username: data.username || '',
        role: data.role || ''
      };
      buyersCache.value[buyerId] = buyerInfo;
      console.log('Buyer data loaded:', buyerInfo);
      return buyerInfo;
    }
    
    console.warn('Buyer data not found for ID:', buyerId);
  } catch (error) {
    console.error('Error fetching buyer data:', error);
  }
  return null;
};

// Get buyer name from conversation
const getBuyerName = (conversation) => {
  // First check the cache
  const buyerData = buyersCache.value[conversation.otherUserId];
  if (buyerData?.displayName) {
    return buyerData.displayName;
  }
  
  // Then check conversation.otherUser with correct field names
  if (conversation.otherUser?.displayName) {
    return conversation.otherUser.displayName;
  }
  
  if (conversation.otherUser?.username) {
    return conversation.otherUser.username;
  }
  
  if (conversation.otherUser?.name) {
    return conversation.otherUser.name;
  }
  
  // Check for email and use first part
  if (conversation.otherUser?.email) {
    return conversation.otherUser.email.split('@')[0];
  }
  
  if (buyerData?.email) {
    return buyerData.email.split('@')[0];
  }
  
  return 'Customer';
};

// Get buyer avatar from conversation
const getBuyerAvatar = (conversation) => {
  // First check the cache
  const buyerData = buyersCache.value[conversation.otherUserId];
  if (buyerData?.photoURL) {
    return buyerData.photoURL;
  }
  
  // Check conversation.otherUser with correct field names
  if (conversation.otherUser?.photoURL) {
    return conversation.otherUser.photoURL;
  }
  
  if (conversation.otherUser?.avatar) {
    return conversation.otherUser.avatar;
  }
  
  if (conversation.otherUser?.profilePic) {
    return conversation.otherUser.profilePic;
  }
  
  // Generate default avatar with buyer name
  const name = getBuyerName(conversation);
  return getDefaultAvatar(name);
};

// Get buyer email from conversation
const getBuyerEmail = (conversation) => {
  // First check the cache
  const buyerData = buyersCache.value[conversation.otherUserId];
  if (buyerData?.email) {
    return buyerData.email;
  }
  
  // Then check conversation.otherUser
  if (conversation.otherUser?.email) {
    return conversation.otherUser.email;
  }
  
  return '';
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

const activeBuyerEmail = computed(() => {
  if (!activeConversation.value) return '';
  return getBuyerEmail(activeConversation.value);
});

// Watch for active conversation changes to fetch buyer data
watch(activeConversationId, async (newId) => {
  if (newId) {
    const conv = conversations.value.find(c => c.id === newId);
    if (conv && conv.otherUserId) {
      console.log('Loading buyer data for conversation:', newId, 'Buyer ID:', conv.otherUserId);
      activeBuyerData.value = await fetchBuyerData(conv.otherUserId);
      console.log('Active buyer data:', activeBuyerData.value);
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
  if (!newMessage.value.trim() && selectedFiles.value.length === 0) return;
  
  try {
    sending.value = true;
    await sendNewMessage(newMessage.value);
    newMessage.value = '';
    await nextTick();
    scrollToBottom();
  } catch (err) {
    console.error('Error sending message:', err);
    showToastNotification('error', 'Failed to Send', 'Failed to send message. Please try again.');
  } finally {
    sending.value = false;
  }
};

// Handle file selection
function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;
  
  // Validate file size (max 10MB per file)
  const maxSize = 10 * 1024 * 1024;
  const oversizedFiles = files.filter(file => file.size > maxSize);
  
  if (oversizedFiles.length > 0) {
    showToastNotification('error', 'File Too Large', 'Each file must be less than 10MB');
    return;
  }
  
  // Validate file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
  
  if (invalidFiles.length > 0) {
    showToastNotification('error', 'Invalid File Type', 'Only images, PDFs, and documents are allowed');
    return;
  }
  
  // Add files to selected files
  selectedFiles.value = [...selectedFiles.value, ...files];
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

// Remove selected file
function removeFile(index) {
  selectedFiles.value.splice(index, 1);
}

// Open file picker
function openFilePicker() {
  fileInput.value?.click();
}

// Get file icon based on type
function getFileIcon(file) {
  if (file.type.startsWith('image/')) return '🖼️';
  if (file.type === 'application/pdf') return '📄';
  if (file.type.includes('document')) return '📝';
  return '📎';
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Send message with files
async function sendMessageWithFiles() {
  if (!newMessage.value.trim() && selectedFiles.value.length === 0) return;
  
  try {
    sending.value = true;
    uploadingFiles.value = true;
    
    // For now, just send the text message
    // TODO: Implement actual file upload to Firebase Storage
    if (newMessage.value.trim()) {
      await sendNewMessage(newMessage.value);
    }
    
    // Show success for files (placeholder until actual upload is implemented)
    if (selectedFiles.value.length > 0) {
      showToastNotification('info', 'Files Selected', `${selectedFiles.value.length} file(s) selected. File upload will be implemented with Firebase Storage.`);
    }
    
    newMessage.value = '';
    selectedFiles.value = [];
    await nextTick();
    scrollToBottom();
  } catch (err) {
    console.error('Error sending message:', err);
    showToastNotification('error', 'Failed to Send', 'Failed to send message. Please try again.');
  } finally {
    sending.value = false;
    uploadingFiles.value = false;
  }
}

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