<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { auth } from '@/firebase/firebase_config'
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue'
import { useMessages } from '@/composables/useMessages'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebase_config'

// Sidebar state
const isSidebarCollapsed = ref(false)

function handleSidebarToggle(collapsed) {
    isSidebarCollapsed.value = collapsed
}

// Get current user ID
const currentUserIdRef = computed(() => auth.currentUser?.uid)

// Initialize messaging composable
const messaging = useMessages(currentUserIdRef)

// Destructure for easier access
const conversations = messaging.conversations
const activeConversationId = messaging.activeConversationId
const activeConversation = messaging.activeConversation
const messages = messaging.messages
const loading = messaging.loading
const error = messaging.error
const totalUnreadCount = messaging.totalUnreadCount
const loadConversations = messaging.loadConversations
const loadMessages = messaging.loadMessages
const sendNewMessage = messaging.sendNewMessage
const formatMessageTime = messaging.formatMessageTime
const formatMessageTimeDetailed = messaging.formatMessageTimeDetailed

// Search query
const searchQuery = ref('')

// Filtered conversations
const filteredConversations = computed(() => {
    if (!searchQuery.value.trim()) {
        return conversations.value
    }
    
    const query = searchQuery.value.toLowerCase()
    return conversations.value.filter(conv => 
        conv.otherUser?.name.toLowerCase().includes(query) ||
        conv.lastMessage?.toLowerCase().includes(query)
    )
})

// New message input
const newMessage = ref('')
const messagesContainer = ref(null)
const activeBusinessName = ref(null)

// Select conversation
function selectConversation(conversationId) {
    loadMessages(conversationId)
    nextTick(() => {
        scrollToBottom()
    })
}

// Load business name when conversation becomes active
watch(activeConversationId, async (newId) => {
    if (newId) {
        const conv = conversations.value.find(c => c.id === newId)
        if (conv && conv.otherUser?.type === 'business') {
            activeBusinessName.value = await getBusinessName(conv.otherUserId)
        } else {
            activeBusinessName.value = null
        }
    }
})

// Send message
async function sendMessage() {
    if (!newMessage.value.trim()) return
    
    try {
        await sendNewMessage(newMessage.value)
        newMessage.value = ''
        await nextTick()
        scrollToBottom()
    } catch (err) {
        console.error('Error sending message:', err)
        alert('Failed to send message. Please try again.')
    }
}

// Scroll to bottom of messages
function scrollToBottom() {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}

// Get avatar URL
function getAvatarUrl(user) {
    if (user?.avatar) {
        return user.avatar
    }
    const name = user?.name || 'User'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=50`
}

// Get business name for conversation
async function getBusinessName(otherUserId) {
    try {
        const businessDoc = await getDoc(doc(db, 'businesses', otherUserId))
        if (businessDoc.exists()) {
            const data = businessDoc.data()
            return data.name || data.businessName || 'Business'
        }
    } catch (error) {
        console.error('Error getting business name:', error)
    }
    return null
}

// Format date separator (e.g., "Today", "Yesterday", "October 24, 2025")
function formatDateSeparator(timestamp) {
    if (!timestamp) return ''
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Reset time to midnight for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
        return 'Today'
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
        return 'Yesterday'
    } else {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    }
}

// Group messages by date
const groupedMessages = computed(() => {
    if (!messages.value || messages.value.length === 0) return []
    
    const groups = []
    let currentDate = null
    let currentGroup = null
    
    messages.value.forEach(message => {
        const messageDate = formatDateSeparator(message.timestamp || message.createdAt)
        
        if (messageDate !== currentDate) {
            currentDate = messageDate
            currentGroup = {
                date: messageDate,
                messages: []
            }
            groups.push(currentGroup)
        }
        
        currentGroup.messages.push(message)
    })
    
    return groups
})

// Auto-scroll when messages change
watch(messages, () => {
    nextTick(() => {
        scrollToBottom()
    })
}, { deep: true })

// Load conversations on mount
onMounted(() => {
    if (currentUserIdRef.value) {
        loadConversations()
    }
})

// Watch for auth state changes
watch(currentUserIdRef, (newId) => {
    if (newId) {
        loadConversations()
    }
}, { immediate: true })
</script>

<template>
    <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <!-- Sidebar -->
        <BuyerSideBar @sidebar-toggle="handleSidebarToggle" />

        <!-- Main Content - MATCHES OTHER PAGES: uses ml-20/ml-64 -->
        <main 
            class="flex-1 transition-all duration-300"
            :class="isSidebarCollapsed ? 'ml-20' : 'ml-64'">
            <div class="flex h-screen">
                <!-- Conversations List -->
                <div class="w-80 flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <!-- Header -->
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">Messages</h1>
                        
                        <!-- Search -->
                        <div class="relative">
                            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Search messages"
                                class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>

                    <!-- Loading State -->
                    <div v-if="loading && conversations.length === 0" class="flex-1 flex items-center justify-center">
                        <div class="text-center">
                            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p class="text-slate-600 dark:text-slate-400">Loading conversations...</p>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else-if="!loading && filteredConversations.length === 0" class="flex-1 flex items-center justify-center p-4">
                        <div class="text-center">
                            <svg class="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                            <p class="text-slate-600 dark:text-slate-400">No conversations yet</p>
                        </div>
                    </div>

                    <!-- Conversations List -->
                    <div v-else class="flex-1 overflow-y-auto">
                        <div
                            v-for="conversation in filteredConversations"
                            :key="conversation.id"
                            @click="selectConversation(conversation.id)"
                            :class="[
                                'flex items-start gap-3 p-4 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-700',
                                activeConversationId === conversation.id 
                                    ? 'bg-blue-50 dark:bg-slate-700/50 border-l-4 border-l-primary' 
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                            ]">
                            <!-- Avatar -->
                            <img 
                                :src="getAvatarUrl(conversation.otherUser)" 
                                :alt="conversation.otherUser?.name" 
                                class="w-12 h-12 rounded-full flex-shrink-0" />
                            
                            <!-- Conversation Details -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between mb-1">
                                    <h3 class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                        {{ conversation.otherUser?.name || 'Unknown User' }}
                                    </h3>
                                    <span class="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">
                                        {{ formatMessageTime(conversation.lastMessageTime) }}
                                    </span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <p :class="[
                                        'text-sm truncate',
                                        conversation.unreadCount > 0 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'
                                    ]">
                                        {{ conversation.lastMessage || 'No messages yet' }}
                                    </p>
                                    <span v-if="conversation.unreadCount > 0" 
                                        class="flex-shrink-0 ml-2 bg-primary text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                                        {{ conversation.unreadCount }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chat Area -->
                <div v-if="activeConversation" class="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
                    <!-- Chat Header -->
                    <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <img 
                                    :src="getAvatarUrl(activeConversation.otherUser)" 
                                    :alt="activeConversation.otherUser?.name" 
                                    class="w-10 h-10 rounded-full" />
                                <div>
                                    <h2 class="text-base font-semibold text-slate-900 dark:text-white">
                                        {{ activeConversation.otherUser?.name || 'Unknown User' }}
                                    </h2>
                                    <p v-if="activeBusinessName" class="text-xs text-slate-500 dark:text-slate-400">
                                        {{ activeBusinessName }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button class="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg">
                                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </button>
                                <button class="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg">
                                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Messages -->
                    <div 
                        ref="messagesContainer"
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
                                            message.senderId === currentUserIdRef ? 'justify-end' : 'justify-start'
                                        ]">
                                        <div :class="[
                                            'max-w-xs px-3 py-2 rounded-2xl',
                                            message.senderId === currentUserIdRef
                                                ? 'bg-blue-500 text-white rounded-br-md'
                                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md shadow-sm'
                                        ]">
                                            <p class="text-sm whitespace-pre-wrap break-words">{{ message.text }}</p>
                                            <p :class="[
                                                'text-xs mt-1',
                                                message.senderId === currentUserIdRef ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
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
                        <form @submit.prevent="sendMessage" class="flex items-end gap-3">
                            <button 
                                type="button"
                                class="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg">
                                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                </svg>
                            </button>
                            <textarea
                                v-model="newMessage"
                                @keydown.enter.exact.prevent="sendMessage"
                                placeholder="Type your message..."
                                rows="1"
                                class="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
                            <button
                                type="submit"
                                :disabled="!newMessage.trim()"
                                :class="[
                                    'p-3 rounded-lg transition-colors',
                                    newMessage.trim() 
                                        ? 'bg-primary text-white hover:bg-primary/90' 
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                                ]">
                                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
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
        </main>

        <!-- Error Toast -->
        <div v-if="error" class="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {{ error }}
        </div>
    </div>
</template>

<style scoped>
button {
    transition: all 0.2s ease;
}

textarea {
    max-height: 150px;
}
</style>