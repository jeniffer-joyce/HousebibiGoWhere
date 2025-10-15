<script setup>
import { ref } from 'vue';
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue';

// User profile data
const userProfile = ref({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+65 9123 4567',
    address: '123 Orchard Road, Singapore 238858',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff&size=200',
    memberSince: 'January 2024'
});

const isEditing = ref(false);

// Form data for editing
const formData = ref({
    name: userProfile.value.name,
    email: userProfile.value.email,
    phone: userProfile.value.phone,
    address: userProfile.value.address
});

function toggleEdit() {
    if (isEditing.value) {
        // Save changes
        userProfile.value = { ...userProfile.value, ...formData.value };
    } else {
        // Start editing
        formData.value = {
            name: userProfile.value.name,
            email: userProfile.value.email,
            phone: userProfile.value.phone,
            address: userProfile.value.address
        };
    }
    isEditing.value = !isEditing.value;
}

function cancelEdit() {
    formData.value = {
        name: userProfile.value.name,
        email: userProfile.value.email,
        phone: userProfile.value.phone,
        address: userProfile.value.address
    };
    isEditing.value = false;
}

// Account statistics
const stats = ref([
    { label: 'Total Orders', value: '24', icon: 'shopping-bag' },
    { label: 'Favorites', value: '12', icon: 'heart' },
    { label: 'Reviews Written', value: '18', icon: 'star' }
]);
</script>

<template>
    <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <!-- Sidebar Navigation -->
        <BuyerSideBar />

        <!-- Main Content Area -->
        <main class="flex-1 ml-64 p-8">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                    <p class="text-slate-600 dark:text-slate-400 mt-1">Manage your account information</p>
                </div>
                <div class="flex items-center gap-4">
                    <!-- Search -->
                    <div class="relative">
                        <input
                            type="text"
                            placeholder="Search"
                            class="w-64 pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <!-- Notifications -->
                    <button class="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                        </svg>
                    </button>
                    <!-- Profile -->
                    <img :src="userProfile.avatar" alt="Profile" class="h-10 w-10 rounded-full border-2 border-primary" />
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Profile Card -->
                <div class="lg:col-span-1">
                    <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <div class="flex flex-col items-center">
                            <img :src="userProfile.avatar" alt="Profile" class="w-32 h-32 rounded-full border-4 border-primary mb-4" />
                            <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ userProfile.name }}</h2>
                            <p class="text-slate-600 dark:text-slate-400 mb-4">{{ userProfile.email }}</p>
                            <p class="text-sm text-slate-500 dark:text-slate-400">Member since {{ userProfile.memberSince }}</p>
                            <button class="mt-6 w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                                Change Photo
                            </button>
                        </div>
                    </div>

                    <!-- Statistics -->
                    <div class="mt-6 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Account Stats</h3>
                        <div class="space-y-4">
                            <div v-for="stat in stats" :key="stat.label" class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <svg v-if="stat.icon === 'shopping-bag'" class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                        </svg>
                                        <svg v-if="stat.icon === 'heart'" class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                        </svg>
                                        <svg v-if="stat.icon === 'star'" class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                        </svg>
                                    </div>
                                    <span class="text-slate-600 dark:text-slate-400">{{ stat.label }}</span>
                                </div>
                                <span class="text-xl font-bold text-slate-900 dark:text-white">{{ stat.value }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Profile Information -->
                <div class="lg:col-span-2">
                    <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-semibold text-slate-900 dark:text-white">Personal Information</h3>
                            <button
                                @click="toggleEdit"
                                class="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors">
                                {{ isEditing ? 'Save Changes' : 'Edit Profile' }}
                            </button>
                        </div>

                        <div class="space-y-6">
                            <!-- Name -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                                <input
                                    v-model="formData.name"
                                    :disabled="!isEditing"
                                    type="text"
                                    class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 dark:disabled:bg-slate-700 disabled:text-slate-500" />
                            </div>

                            <!-- Email -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                <input
                                    v-model="formData.email"
                                    :disabled="!isEditing"
                                    type="email"
                                    class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 dark:disabled:bg-slate-700 disabled:text-slate-500" />
                            </div>

                            <!-- Phone -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                                <input
                                    v-model="formData.phone"
                                    :disabled="!isEditing"
                                    type="tel"
                                    class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 dark:disabled:bg-slate-700 disabled:text-slate-500" />
                            </div>

                            <!-- Address -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Address</label>
                                <textarea
                                    v-model="formData.address"
                                    :disabled="!isEditing"
                                    rows="3"
                                    class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 dark:disabled:bg-slate-700 disabled:text-slate-500"></textarea>
                            </div>

                            <div v-if="isEditing" class="flex gap-3">
                                <button
                                    @click="toggleEdit"
                                    class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                                    Save Changes
                                </button>
                                <button
                                    @click="cancelEdit"
                                    class="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Security Settings -->
                    <div class="mt-6 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-6">Security Settings</h3>
                        <div class="space-y-4">
                            <button class="w-full flex items-center justify-between px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <span class="text-slate-900 dark:text-white">Change Password</span>
                                <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                            <button class="w-full flex items-center justify-between px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <span class="text-slate-900 dark:text-white">Two-Factor Authentication</span>
                                <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
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