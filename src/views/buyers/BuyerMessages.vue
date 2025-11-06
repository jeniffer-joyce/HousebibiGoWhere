<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '@/firebase/firebase_config'
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'
import { useMessages } from '@/composables/useMessages'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebase_config'

// Sidebar state
const isSidebarCollapsed = ref(false)

function handleSidebarToggle(collapsed) {
    isSidebarCollapsed.value = collapsed
}

// Toast state
const showToast = ref(false)
const toastType = ref('success')
const toastTitle = ref('')
const toastMessage = ref('')

// Confirmation modal state
const showConfirmModal = ref(false)
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
const confirmModalType = ref('warning')
const pendingAction = ref(null)

// Show toast notification
function showToastNotification(type, title, message) {
    toastType.value = type
    toastTitle.value = title
    toastMessage.value = message
    showToast.value = true
}

// Close toast
function closeToast() {
    showToast.value = false
}

// Show confirmation modal
function showConfirmation(title, message, type, action) {
    confirmModalTitle.value = title
    confirmModalMessage.value = message
    confirmModalType.value = type
    pendingAction.value = action
    showConfirmModal.value = true
}

// Handle confirmation
function handleConfirm() {
    showConfirmModal.value = false
    if (pendingAction.value) {
        pendingAction.value()
        pendingAction.value = null
    }
}

// Handle cancel
function handleCancel() {
    showConfirmModal.value = false
    pendingAction.value = null
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

// Store business details
const businessDetails = ref({})

// Filtered conversations
const filteredConversations = computed(() => {
    if (!searchQuery.value.trim()) {
        return conversations.value
    }
    
    const query = searchQuery.value.toLowerCase()
    return conversations.value.filter(conv => {
        const businessName = businessDetails.value[conv.otherUserId]?.name || conv.otherUser?.name || ''
        return businessName.toLowerCase().includes(query) ||
               conv.lastMessage?.toLowerCase().includes(query)
    })
})

// New message input
const newMessage = ref('')
const messagesContainer = ref(null)
const route = useRoute()
const router = useRouter()
const showOptionsMenu = ref(false)

// File upload state
const fileInput = ref(null)
const selectedFiles = ref([])
const uploadingFiles = ref(false)

// Delete conversation
async function deleteConversation(conversationId) {
    showConfirmation(
        'Delete Conversation',
        'Are you sure you want to delete this conversation? This action cannot be undone.',
        'danger',
        async () => {
            try {
                const conversationRef = doc(db, 'conversations', conversationId)
                await deleteDoc(conversationRef)
                
                // Close the conversation if it's currently active
                if (activeConversationId.value === conversationId) {
                    activeConversationId.value = null
                }
                
                showOptionsMenu.value = false
                showToastNotification('success', 'Conversation Deleted', 'The conversation has been deleted successfully')
            } catch (error) {
                console.error('Error deleting conversation:', error)
                showToastNotification('error', 'Delete Failed', 'Failed to delete conversation. Please try again.')
            }
        }
    )
}

// Navigate to shop details
function goToShopDetails() {
    if (activeConversation.value) {
        router.push(`/shop-details/${activeConversation.value.otherUserId}`)
    }
}

// Select conversation
function selectConversation(conversationId) {
    loadMessages(conversationId)
    nextTick(() => {
        scrollToBottom()
    })
}

// Load business details for all conversations
watch(conversations, async (newConversations) => {
    for (const conv of newConversations) {
        if (conv.otherUserId && !businessDetails.value[conv.otherUserId]) {
            const details = await getBusinessDetails(conv.otherUserId)
            if (details) {
                businessDetails.value[conv.otherUserId] = details
            }
        }
    }
}, { deep: true, immediate: true })

// Get business details including name and profile pic
async function getBusinessDetails(userId) {
    try {
        const businessDoc = await getDoc(doc(db, 'businesses', userId))
        if (businessDoc.exists()) {
            const data = businessDoc.data()
            return {
                name: data.name || data.businessName || 'Business',
                profilePic: data.profilePic || data.profileImage || null,
                type: 'business'
            }
        }
    } catch (error) {
        console.error('Error getting business details:', error)
    }
    return null
}

// Send message
async function sendMessage() {
    if (!newMessage.value.trim() && selectedFiles.value.length === 0) return
    
    try {
        await sendNewMessage(newMessage.value)
        newMessage.value = ''
        await nextTick()
        scrollToBottom()
    } catch (err) {
        console.error('Error sending message:', err)
        showToastNotification('error', 'Failed to Send', 'Failed to send message. Please try again.')
    }
}

// Handle file selection
function handleFileSelect(event) {
    const files = Array.from(event.target.files)
    if (files.length === 0) return
    
    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024
    const oversizedFiles = files.filter(file => file.size > maxSize)
    
    if (oversizedFiles.length > 0) {
        showToastNotification('error', 'File Too Large', 'Each file must be less than 10MB')
        return
    }
    
    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
        showToastNotification('error', 'Invalid File Type', 'Only images, PDFs, and documents are allowed')
        return
    }
    
    // Add files to selected files
    selectedFiles.value = [...selectedFiles.value, ...files]
    
    // Reset file input
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

// Remove selected file
function removeFile(index) {
    selectedFiles.value.splice(index, 1)
}

// Open file picker
function openFilePicker() {
    fileInput.value?.click()
}

// Get file icon based on type
function getFileIcon(file) {
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type === 'application/pdf') return '📄'
    if (file.type.includes('document')) return '📝'
    return '📎'
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Send message with files
async function sendMessageWithFiles() {
    if (!newMessage.value.trim() && selectedFiles.value.length === 0) return
    
    try {
        uploadingFiles.value = true
        
        await messaging.sendMessageWithFiles(
            newMessage.value,
            selectedFiles.value,
            activeConversationId.value
        )
        
        newMessage.value = ''
        selectedFiles.value = []
        showToastNotification('success', 'Files Sent', 'Files uploaded and message sent successfully!')
        
        await nextTick()
        scrollToBottom()
    } catch (err) {
        console.error('Error sending message with files:', err)
        showToastNotification('error', 'Failed to Send', err.message || 'Failed to upload files. Please try again.')
    } finally {
        uploadingFiles.value = false
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

// Get avatar URL - prioritize business profile pic
function getAvatarUrl(userId) {
    const business = businessDetails.value[userId]
    if (business?.profilePic) {
        return business.profilePic
    }
    const name = business?.name || 'Business'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&size=50`
}

// Get display name - show business name
function getDisplayName(userId) {
    const business = businessDetails.value[userId]
    return business?.name || 'Business'
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

// Load conversations and handle query parameter
onMounted(() => {
    loadConversations()
    
    // Check if there's a conversation query parameter
    const conversationId = route.query.conversation
    if (conversationId) {
        // Wait for conversations to load, then select the conversation
        watch(conversations, (newConversations) => {
            if (newConversations.length > 0) {
                const targetConv = newConversations.find(c => c.id === conversationId)
                if (targetConv) {
                    selectConversation(conversationId)
                } else {
                    // If conversation not in list yet, still try to load it
                    loadMessages(conversationId)
                }
            }
        }, { immediate: true })
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', handleClickOutside)
})

// Cleanup on unmount
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

// Handle click outside to close dropdown
function handleClickOutside(event) {
    const dropdown = event.target.closest('.relative')
    if (!dropdown || !dropdown.contains(event.target)) {
        showOptionsMenu.value = false
    }
}
</script>

<template>
    <div class="flex h-screen bg-slate-50 dark:bg-slate-900">
        <!-- Sidebar -->
        <BuyerSideBar @sidebar-toggle="handleSidebarToggle" />

        <!-- Main Content -->
        <main :class="[
            'flex-1 flex transition-all duration-300 overflow-hidden',
            isSidebarCollapsed ? 'ml-20' : 'ml-64'
        ]">
                <!-- Conversations List - Minimal width below 768px for full chat visibility even with expanded sidebar -->
                <div class="w-[15vw] md:w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-800 flex-shrink-0">
                    <!-- Header -->
                    <div class="p-2 md:p-4 border-b border-slate-200 dark:border-slate-700">
                        <div class="flex items-center justify-between mb-2 md:mb-4">
                            <h1 class="text-base md:text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
                        </div>
                        
                        <!-- Search -->
                        <div class="relative">
                            <input 
                                v-model="searchQuery"
                                type="text" 
                                placeholder="Search"
                                class="w-full pl-8 md:pl-10 pr-2 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                            <svg class="absolute left-2 md:left-3 top-1.5 md:top-2.5 h-4 w-4 md:h-5 md:w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </div>

                    <!-- Conversations List -->
                    <div class="flex-1 overflow-y-auto">
                        <div v-if="loading && conversations.length === 0" class="flex items-center justify-center h-full">
                            <div class="text-center p-2">
                                <svg class="animate-spin h-6 md:h-10 w-6 md:w-10 mx-auto text-primary mb-2 md:mb-3" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                <p class="text-xs md:text-sm text-slate-600 dark:text-slate-400">Loading...</p>
                            </div>
                        </div>

                        <div v-else-if="filteredConversations.length === 0" class="flex items-center justify-center h-full">
                            <div class="text-center px-2 md:px-4">
                                <svg class="h-10 md:h-16 w-10 md:w-16 mx-auto text-slate-300 dark:text-slate-600 mb-2 md:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                </svg>
                                <p class="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                                    {{ searchQuery ? 'No conversations found' : 'No messages yet' }}
                                </p>
                            </div>
                        </div>

                        <div v-else>
                            <div 
                                v-for="conversation in filteredConversations" 
                                :key="conversation.id"
                                @click="selectConversation(conversation.id)"
                                :class="[
                                    'p-2 md:p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors',
                                    activeConversationId === conversation.id ? 'bg-slate-100 dark:bg-slate-700 border-l-2 md:border-l-4 border-l-primary' : ''
                                ]">
                                <!-- Mobile: Ultra Compact Layout for 15vw width -->
                                <div class="flex md:hidden flex-col items-center text-center gap-1">
                                    <img 
                                        :src="getAvatarUrl(conversation.otherUserId)" 
                                        :alt="getDisplayName(conversation.otherUserId)" 
                                        class="w-8 h-8 rounded-full object-cover" />
                                    <div class="w-full">
                                        <h3 class="text-[10px] font-semibold text-slate-900 dark:text-white truncate">
                                            {{ getDisplayName(conversation.otherUserId).length > 8 ? getDisplayName(conversation.otherUserId).substring(0, 8) + '...' : getDisplayName(conversation.otherUserId) }}
                                        </h3>
                                        <p class="text-[8px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                                            {{ conversation.lastMessage ? (conversation.lastMessage.length > 8 ? conversation.lastMessage.substring(0, 8) + '...' : conversation.lastMessage) : 'New' }}
                                        </p>
                                        <div class="flex items-center justify-center gap-0.5 mt-0.5">
                                            <span v-if="conversation.unreadCount > 0" 
                                                class="w-2 h-2 bg-primary rounded-full">
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Desktop: Horizontal Layout -->
                                <div class="hidden md:flex items-start gap-3">
                                    <img 
                                        :src="getAvatarUrl(conversation.otherUserId)" 
                                        :alt="getDisplayName(conversation.otherUserId)" 
                                        class="w-12 h-12 rounded-full object-cover" />
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-start justify-between mb-1">
                                            <h3 class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                {{ getDisplayName(conversation.otherUserId) }}
                                            </h3>
                                            <span class="text-xs text-slate-500 dark:text-slate-400 ml-2 flex-shrink-0">
                                                {{ formatMessageTime(conversation.lastMessageTime) }}
                                            </span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <p class="text-sm text-slate-600 dark:text-slate-400 truncate flex-1">
                                                {{ conversation.lastMessage || 'No messages yet' }}
                                            </p>
                                            <span v-if="conversation.unreadCount > 0" 
                                                class="ml-2 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full flex-shrink-0">
                                                {{ conversation.unreadCount }}
                                            </span>
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
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <img 
                                    :src="getAvatarUrl(activeConversation.otherUserId)" 
                                    :alt="getDisplayName(activeConversation.otherUserId)" 
                                    class="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <h2 class="text-base font-semibold text-slate-900 dark:text-white">
                                        {{ getDisplayName(activeConversation.otherUserId) }}
                                    </h2>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">Business</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <!-- Info button - Navigate to shop -->
                                <button 
                                    @click="goToShopDetails"
                                    class="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg"
                                    title="View Shop Details">
                                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </button>
                                
                                <!-- Options menu button -->
                                <div class="relative">
                                    <button 
                                        @click="showOptionsMenu = !showOptionsMenu"
                                        class="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg"
                                        title="Options">
                                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                        </svg>
                                    </button>
                                    
                                    <!-- Dropdown menu -->
                                    <div 
                                        v-if="showOptionsMenu"
                                        class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                                        <button
                                            @click="deleteConversation(activeConversationId)"
                                            class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                            Delete Conversation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Messages -->
                    <div 
                        ref="messagesContainer"
                        class="flex-1 overflow-y-auto p-2 md:p-4 bg-slate-50 dark:bg-slate-900">
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
                                            'max-w-[70%] md:max-w-xs px-3 py-2 rounded-2xl',
                                            message.senderId === currentUserIdRef
                                                ? 'bg-blue-500 text-white rounded-br-md'
                                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md shadow-sm'
                                        ]">
                                            <p v-if="message.text" class="text-sm whitespace-pre-wrap break-words">{{ message.text }}</p>

                                            <!-- File links (NEW) -->
                                            <div v-if="message.attachments && message.attachments.length > 0" class="...">
                                            <div v-for="file in message.attachments" :key="file.url" class="...">

                                                <a 
                                                :href="file.url" 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="flex items-center gap-1 text-xs underline hover:opacity-75">
                                                <span>{{ getFileIcon(file) }}</span>
                                                <span class="truncate">{{ file.name }}</span>
                                                </a>
                                            </div>
                                            </div>

                                            <!-- Timestamp -->
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

                        <form @submit.prevent="selectedFiles.length > 0 ? sendMessageWithFiles() : sendMessage()" class="flex items-end gap-3">
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
                                @keydown.enter.exact.prevent="selectedFiles.length > 0 ? sendMessageWithFiles() : sendMessage()"
                                placeholder="Type your message..."
                                rows="1"
                                class="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
                            <button
                                type="submit"
                                :disabled="(!newMessage.trim() && selectedFiles.length === 0) || uploadingFiles"
                                :class="[
                                    'p-3 rounded-lg transition-colors',
                                    (newMessage.trim() || selectedFiles.length > 0) && !uploadingFiles
                                        ? 'bg-primary text-white hover:bg-primary/90' 
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                                ]">
                                <svg v-if="!uploadingFiles" class="h-6 w-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                </svg>
                                <svg v-else class="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
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
        </main>

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

<style scoped>
button {
    transition: all 0.2s ease;
}

textarea {
    max-height: 150px;
}
</style>