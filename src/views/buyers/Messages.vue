<script setup>
import { ref } from 'vue';
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue';

// Mock data for conversations
const conversations = ref([
    {
        id: 1,
        business: 'The Cozy Kitchen',
        lastMessage: 'Your order is ready for pickup!',
        time: '10 mins ago',
        unread: 2,
        avatar: 'https://ui-avatars.com/api/?name=The+Cozy+Kitchen&background=FF9B7A&color=fff&size=50',
        active: true
    },
    {
        id: 2,
        business: 'Crafty Corner',
        lastMessage: 'Thank you for your review!',
        time: '1 hour ago',
        unread: 0,
        avatar: 'https://ui-avatars.com/api/?name=Crafty+Corner&background=90C8AC&color=fff&size=50',
        active: false
    },
    {
        id: 3,
        business: 'Fashion Finds',
        lastMessage: 'We have new items that might interest you',
        time: '3 hours ago',
        unread: 1,
        avatar: 'https://ui-avatars.com/api/?name=Fashion+Finds&background=FFD7BA&color=fff&size=50',
        active: false
    },
    {
        id: 4,
        business: 'Sweet Delights',
        lastMessage: 'Your custom cake order has been confirmed',
        time: '1 day ago',
        unread: 0,
        avatar: 'https://ui-avatars.com/api/?name=Sweet+Delights&background=FFB6C1&color=fff&size=50',
        active: false
    }
]);

// Mock messages for active conversation
const messages = ref([
    {
        id: 1,
        sender: 'business',
        text: 'Hello! Thanks for your order. We\'re preparing it now.',
        time: '2:30 PM'
    },
    {
        id: 2,
        sender: 'user',
        text: 'Great! About what time will it be ready?',
        time: '2:32 PM'
    },
    {
        id: 3,
        sender: 'business',
        text: 'It should be ready in about 30 minutes.',
        time: '2:35 PM'
    },
    {
        id: 4,
        sender: 'user',
        text: 'Perfect, I\'ll come by around 3:15 PM then.',
        time: '2:36 PM'
    },
    {
        id: 5,
        sender: 'business',
        text: 'Your order is ready for pickup!',
        time: '3:05 PM'
    }
]);

const newMessage = ref('');

function selectConversation(id) {
    conversations.value.forEach(conv => {
        conv.active = conv.id === id;
        if (conv.id === id) {
            conv.unread = 0;
        }
    });
}

function sendMessage() {
    if (newMessage.value.trim()) {
        messages.value.push({
            id: messages.value.length + 1,
            sender: 'user',
            text: newMessage.value,
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        });
        newMessage.value = '';
    }
}

const activeConversation = computed(() => 
    conversations.value.find(conv => conv.active)
);
</script>

<template>
    <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <!-- Sidebar Navigation -->
        <BuyerSideBar />

        <!-- Main Content Area -->
        <main class="flex-1 ml-64 flex">
            <!-- Conversations List -->
            <div class="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                <!-- Header -->
                <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">Messages</h2>
                    <div class="relative">
                        <input
                            type="text"
                            placeholder="Search messages"
                            class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                </div>

                <!-- Conversations -->
                <div class="overflow-y-auto" style="height: calc(100vh - 200px)">
                    <div
                        v-for="conversation in conversations"
                        :key="conversation.id"
                        @click="selectConversation(conversation.id)"
                        :class="[
                            'p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors',
                            conversation.active ? 'bg-primary/5' : ''
                        ]">
                        <div class="flex items-start gap-3">
                            <div class="relative">
                                <img :src="conversation.avatar" :alt="conversation.business" class="w-12 h-12 rounded-full" />
                                <div v-if="conversation.unread > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                                    {{ conversation.unread }}
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between mb-1">
                                    <h3 class="font-semibold text-slate-900 dark:text-white truncate">{{ conversation.business }}</h3>
                                    <span class="text-xs text-slate-500 dark:text-slate-400">{{ conversation.time }}</span>
                                </div>
                                <p :class="[
                                    'text-sm truncate',
                                    conversation.unread > 0 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'
                                ]">
                                    {{ conversation.lastMessage }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chat Area -->
            <div v-if="activeConversation" class="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
                <!-- Chat Header -->
                <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <img :src="activeConversation.avatar" :alt="activeConversation.business" class="w-12 h-12 rounded-full" />
                            <div>
                                <h2 class="text-lg font-semibold text-slate-900 dark:text-white">{{ activeConversation.business }}</h2>
                                <p class="text-sm text-slate-500 dark:text-slate-400">Active now</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg">
                                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                            </button>
                            <button class="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg">
                                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Messages -->
                <div class="flex-1 overflow-y-auto p-6 space-y-4">
                    <div
                        v-for="message in messages"
                        :key="message.id"
                        :class="[
                            'flex',
                            message.sender === 'user' ? 'justify-end' : 'justify-start'
                        ]">
                        <div :class="[
                            'max-w-md px-4 py-3 rounded-2xl',
                            message.sender === 'user'
                                ? 'bg-primary text-white rounded-br-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm'
                        ]">
                            <p class="text-sm">{{ message.text }}</p>
                            <p :class="[
                                'text-xs mt-1',
                                message.sender === 'user' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
                            ]">
                                {{ message.time }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Message Input -->
                <div class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
                    <div class="flex items-end gap-3">
                        <button class="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                            </svg>
                        </button>
                        <textarea
                            v-model="newMessage"
                            @keydown.enter.prevent="sendMessage"
                            placeholder="Type your message..."
                            rows="1"
                            class="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
                        <button
                            @click="sendMessage"
                            class="p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                            </svg>
                        </button>
                    </div>
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
    </div>
</template>

<style scoped>
button {
    transition: all 0.2s ease;
}
</style>