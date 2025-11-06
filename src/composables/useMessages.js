import { ref, computed, onUnmounted } from 'vue';
import { storage } from '../firebase/firebase_config';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
  getUserDetails,
  getOrCreateConversation
} from '../firebase/messageService';
import { sendMessageWithMetadata } from '../firebase/messageService';



export function useMessages(currentUserId) {
  const conversations = ref([]);
  const activeConversationId = ref(null);
  const messages = ref([]);
  const conversationDetails = ref({});
  const loading = ref(false);
  const error = ref(null);

  let conversationsUnsubscribe = null;
  let messagesUnsubscribe = null;

  // Load conversations for current user
  const loadConversations = () => {
    loading.value = true;
    error.value = null;

    conversationsUnsubscribe = getUserConversations(
      currentUserId.value,
      async (snapshot) => {
        const conversationsList = [];
        
        for (const doc of snapshot.docs) {
          const data = doc.data();
          const otherUserId = data.participants.find(id => id !== currentUserId.value);
          
          // Get other user details
          if (!conversationDetails.value[otherUserId]) {
            conversationDetails.value[otherUserId] = await getUserDetails(otherUserId);
          }
          
          conversationsList.push({
            id: doc.id,
            ...data,
            otherUserId,
            otherUser: conversationDetails.value[otherUserId],
            unreadCount: data[`unreadCount_${currentUserId.value}`] || 0
          });
        }
        
        conversations.value = conversationsList;
        loading.value = false;
      }
    );
  };

  // Load messages for a conversation
  const loadMessages = (conversationId) => {
    if (messagesUnsubscribe) {
      messagesUnsubscribe();
    }

    activeConversationId.value = conversationId;
    messages.value = [];

    messagesUnsubscribe = getConversationMessages(conversationId, (snapshot) => {
      messages.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });

    // Mark conversation as read
    markConversationAsRead(conversationId, currentUserId.value);
  };

  // Send a new message
  const sendNewMessage = async (messageText) => {
    if (!activeConversationId.value || !messageText.trim()) {
      return;
    }

    try {
      await sendMessage(
        activeConversationId.value,
        currentUserId.value,
        messageText.trim()
      );
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

    // ✅ Upload files to Firebase Storage
  const uploadFilesToStorage = async (files, conversationId) => {
    if (!files || files.length === 0) return [];
    const uploadedFiles = [];
    for (const file of files) {
      try {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const fileRef = storageRef(storage, `chat_files/${conversationId}/${fileName}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          url: downloadURL,
          uploadedAt: new Date()
        });
        console.log(`✅ File uploaded: ${file.name}`);
      } catch (err) {
        console.error(`❌ Error uploading ${file.name}:`, err);
        throw new Error(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
    return uploadedFiles;
  };

  // ✅ Send message with files
  const sendMessageWithFiles = async (messageText, files, conversationId) => {
  if (!conversationId) {
    conversationId = activeConversationId.value;
  }
  
  if (!conversationId) {
    throw new Error('No active conversation');
  }
  
  try {
    let uploadedFiles = [];
    if (files && files.length > 0) {
      uploadedFiles = await uploadFilesToStorage(files, conversationId);
    }
    
    // Build message text
    // Build message text (without file names since they show as links)
    // Build message text
    let finalMessageText = messageText.trim();




    
    // Create message object with files
    const messageData = {
      text: finalMessageText,
      senderId: currentUserId.value,
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? uploadedFiles : null
    };
    
    // Send message with metadata
    await sendMessageWithMetadata(conversationId, messageData);
    
    return messageData;
  } catch (err) {
    error.value = err.message;
    console.error('Error sending message with files:', err);
    throw err;
  }
  };


    // Create or open conversation with a user
    const openConversation = async (otherUserId) => {
      try {
        loading.value = true;
        const conversation = await getOrCreateConversation(currentUserId.value, otherUserId);
        
        // Check if conversation already exists in list
        const existingConv = conversations.value.find(c => c.id === conversation.id);
        
        if (!existingConv) {
          // Add user details
          if (!conversationDetails.value[otherUserId]) {
            conversationDetails.value[otherUserId] = await getUserDetails(otherUserId);
          }
          
          conversations.value.unshift({
            ...conversation,
            otherUserId,
            otherUser: conversationDetails.value[otherUserId],
            unreadCount: 0
          });
        }
        
        loadMessages(conversation.id);
        loading.value = false;
        
        return conversation;
      } catch (err) {
        error.value = err.message;
        loading.value = false;
        throw err;
      }
    };

  // Get active conversation
  const activeConversation = computed(() => {
    return conversations.value.find(c => c.id === activeConversationId.value);
  });

  // Get total unread count
  const totalUnreadCount = computed(() => {
    return conversations.value.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
  });

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const formatMessageTimeDetailed = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Cleanup
  onUnmounted(() => {
    if (conversationsUnsubscribe) {
      conversationsUnsubscribe();
    }
    if (messagesUnsubscribe) {
      messagesUnsubscribe();
    }
  });

  return {
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
    sendMessageWithFiles,      // ✅ ADD
    uploadFilesToStorage,       // ✅ ADD
    openConversation,
    formatMessageTime,
    formatMessageTimeDetailed
  };
}