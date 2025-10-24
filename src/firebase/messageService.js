import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs,
  getDoc,
  setDoc,
  increment
} from 'firebase/firestore';
import { db } from './firebase_config';

/**
 * Get or create a conversation between two users
 */
export const getOrCreateConversation = async (buyerId, sellerId) => {
  try {
    const conversationsRef = collection(db, 'conversations');
    
    // Check if conversation already exists
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', buyerId)
    );
    
    const querySnapshot = await getDocs(q);
    let existingConversation = null;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(sellerId)) {
        existingConversation = { id: doc.id, ...data };
      }
    });
    
    if (existingConversation) {
      return existingConversation;
    }
    
    // Create new conversation
    const newConversation = {
      participants: [buyerId, sellerId],
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: '',
      [`unreadCount_${buyerId}`]: 0,
      [`unreadCount_${sellerId}`]: 0
    };
    
    const docRef = await addDoc(conversationsRef, newConversation);
    
    return { id: docRef.id, ...newConversation };
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    throw error;
  }
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = (userId, callback) => {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    return onSnapshot(q, callback);
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
};

/**
 * Get messages for a conversation
 */
export const getConversationMessages = (conversationId, callback) => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    return onSnapshot(q, callback);
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
};

/**
 * Send a message in a conversation
 */
export const sendMessage = async (conversationId, senderId, messageText) => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const conversationRef = doc(db, 'conversations', conversationId);
    
    // Get conversation to determine receiver
    const conversationDoc = await getDoc(conversationRef);
    const conversationData = conversationDoc.data();
    const receiverId = conversationData.participants.find(id => id !== senderId);
    
    // Add message to subcollection
    const messageData = {
      senderId,
      text: messageText,
      createdAt: serverTimestamp(),
      read: false
    };
    
    await addDoc(messagesRef, messageData);
    
    // Update conversation document
    await updateDoc(conversationRef, {
      lastMessage: messageText,
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: senderId,
      [`unreadCount_${receiverId}`]: increment(1)
    });
    
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Mark conversation as read
 */
export const markConversationAsRead = async (conversationId, userId) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    
    await updateDoc(conversationRef, {
      [`unreadCount_${userId}`]: 0
    });
    
    return true;
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};

/**
 * Get user details (business name or user name)
 */
export const getUserDetails = async (userId) => {
  try {
    // Try to get from businesses collection first
    const businessDoc = await getDoc(doc(db, 'businesses', userId));
    if (businessDoc.exists()) {
      const data = businessDoc.data();
      return {
        id: userId,
        name: data.businessName || 'Business',
        type: 'business',
        avatar: data.profileImage || null
      };
    }
    
    // Try users collection
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userId,
        name: data.displayName || data.email || 'User',
        type: 'user',
        avatar: data.photoURL || null
      };
    }
    
    return {
      id: userId,
      name: 'Unknown User',
      type: 'unknown',
      avatar: null
    };
  } catch (error) {
    console.error('Error getting user details:', error);
    return {
      id: userId,
      name: 'Unknown User',
      type: 'unknown',
      avatar: null
    };
  }
};