<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BuyerSideBar from '@/components/layout/BuyerSideBar.vue';
import { auth, db } from '@/firebase/firebase_config';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, getCountFromServer } from 'firebase/firestore';
import { useMessages } from '@/composables/useMessages';
import { useFavorites } from '@/composables/useFavorites';

const router = useRouter();
const totalOrdersCount = ref(0);
const pendingOrdersCount = ref(0);

// Sidebar collapsed state
const isSidebarCollapsed = ref(false);

function handleSidebarToggle(collapsed) {
    isSidebarCollapsed.value = collapsed;
}

// Loading states
const loadingOrders = ref(true);

// Dynamic data
const recentOrders = ref([]);

// Get current user ID
const currentUserIdRef = computed(() => auth.currentUser?.uid);

// Initialize messaging composable (same as BuyerMessages)
const messaging = useMessages(currentUserIdRef);

// Initialize favorites composable (same as Favourites.vue)
const favoritesComposable = useFavorites();

// Custom fetch for favorite businesses since the composable fetches from wrong collection
const customFavoriteBusinesses = ref([]);
const loadingFavorites = ref(false);

async function fetchOrderCounts() {
  const userId = auth.currentUser?.uid;
  if (!userId) { totalOrdersCount.value = 0; pendingOrdersCount.value = 0; return; }

  const ordersRef = collection(db, 'orders');

  // All orders for this buyer
  const totalSnap = await getCountFromServer(query(ordersRef, where('uid', '==', userId)));
  totalOrdersCount.value = totalSnap.data().count;

  // Pending-style orders (choose the statuses you consider “pending”)
  // Option A: single 'in' query (needs index)
  try {
    const pendingSnap = await getCountFromServer(
      query(ordersRef, where('uid', '==', userId), where('status', 'in', ['to_ship', 'pending']))
    );
    pendingOrdersCount.value = pendingSnap.data().count;
  } catch {
    // Option B: two queries if 'in' is inconvenient
    const toShip = await getCountFromServer(query(ordersRef, where('uid','==',userId), where('status','==','to_ship')));
    const pending = await getCountFromServer(query(ordersRef, where('uid','==',userId), where('status','==','pending')));
    pendingOrdersCount.value = toShip.data().count + pending.data().count;
  }
}

async function fetchFavoriteBusinessesCustom() {
    try {
        loadingFavorites.value = true;
        const userId = auth.currentUser?.uid;
        if (!userId) {
            customFavoriteBusinesses.value = [];
            return;
        }

        // Fetch user document
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            customFavoriteBusinesses.value = [];
            return;
        }

        // Get favoriteBusinesses array (note: without 'u')
        const favBizIds = userDoc.data().favoriteBusinesses || [];
        
        if (favBizIds.length === 0) {
            customFavoriteBusinesses.value = [];
            return;
        }

        // Fetch each business from businesses collection (not users)
        const businessPromises = favBizIds.slice(0, 6).map(async (businessOwnerId) => {
            try {
                // First, get the business owner's user data for display name
                const ownerDocRef = doc(db, 'users', businessOwnerId);
                const ownerDoc = await getDoc(ownerDocRef);
                
                let ownerName = 'Business Owner';
                if (ownerDoc.exists()) {
                    const ownerData = ownerDoc.data();
                    ownerName = ownerData.displayName || ownerData.name || ownerData.businessName || 'Business Owner';
                }
                
                // Then get the actual business from businesses collection
                const bizDocRef = doc(db, 'businesses', businessOwnerId);
                const bizDoc = await getDoc(bizDocRef);
                
                if (bizDoc.exists()) {
                    const data = bizDoc.data();
                    // Get business name and image from businesses collection
                    const businessName = data.name || data.businessName || 'Unnamed Business';
                    const businessImage = data.profilePic || data.profileImage || data.image || data.logo;
                    const category = data.category || 'General';
                    
                    return {
                        id: businessOwnerId,
                        name: businessName, // Actual business name
                        ownerName: ownerName, // Owner's display name (instead of category)
                        category: category, // Keep original category as fallback
                        description: data.description || data.bio || '',
                        rating: data.rating || 0,
                        reviews: data.reviews || data.reviewCount || 0,
                        image: businessImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName)}&background=FFD7BA&color=8B4513&size=200&bold=true`,
                        isFavorite: true
                    };
                } else {
                    // If no business document exists, fall back to user data
                    if (ownerDoc.exists()) {
                        const ownerData = ownerDoc.data();
                        const businessName = ownerData.businessName || ownerData.name || 'Business';
                        return {
                            id: businessOwnerId,
                            name: businessName,
                            ownerName: ownerName,
                            category: ownerData.category || 'General',
                            description: ownerData.description || '',
                            rating: ownerData.rating || 0,
                            reviews: ownerData.reviews || 0,
                            image: ownerData.avatar || ownerData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName)}&background=FFD7BA&color=8B4513&size=200&bold=true`,
                            isFavorite: true
                        };
                    }
                }
            } catch (err) {
                console.error('Error fetching business:', err);
            }
            return null;
        });

        const businesses = await Promise.all(businessPromises);
        customFavoriteBusinesses.value = businesses.filter(b => b !== null);
        
        // Debug log to see what we're getting
        console.log('Fetched favorite businesses:', customFavoriteBusinesses.value);
    } catch (error) {
        console.error('Error fetching favorite businesses:', error);
        customFavoriteBusinesses.value = [];
    } finally {
        loadingFavorites.value = false;
    }
}

// Get favorite businesses (use custom fetch instead of composable for now)
const favoriteBusinesses = computed(() => {
    return customFavoriteBusinesses.value;
});

// Get unread messages from the composable
const unreadMessages = computed(() => {
    // Filter conversations that have unread messages and take only first 3
    return messaging.conversations.value
        .filter(conv => {
            const unread = conv.unreadCount || 0;
            return unread > 0;
        })
        .slice(0, 3)
        .map(conv => ({
            id: conv.id,
            business: conv.otherUser?.name || 'Business',
            message: conv.lastMessage || 'New message',
            avatar: conv.otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUser?.name || 'Business')}&background=FF9B7A&color=fff&size=50`,
            timestamp: conv.lastMessageTime,
            otherUserId: conv.otherUserId
        }));
});

// Loading state for messages from composable
const loadingMessages = computed(() => messaging.loading.value);

// Stats
const stats = computed(() => ({
  totalOrders: totalOrdersCount.value,
  pendingOrders: pendingOrdersCount.value,
  unreadCount: unreadMessages.value.length,
  favoriteCount: favoriteBusinesses.value.length
}));

// Fetch recent orders (last 3)
async function fetchRecentOrders() {
    try {
        loadingOrders.value = true;
        const userId = auth.currentUser?.uid;
        if (!userId) {
            recentOrders.value = [];
            return;
        }

        const ordersRef = collection(db, 'orders');
        // Using 'uid' field as per Firestore rules (buyer's uid)
        const q = query(
            ordersRef,
            where('uid', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(3)
        );

        const snapshot = await getDocs(q);
        recentOrders.value = snapshot.docs.map(doc => {
            const data = doc.data();
            const firstProduct = data.products?.[0] || {};
            
            return {
                id: doc.id,
                orderId: data.orderId || doc.id.slice(-6).toUpperCase(),
                title: firstProduct.item_name || 'Order',
                date: formatDate(data.createdAt),
                image: firstProduct.img_url || 'https://via.placeholder.com/400x300?text=Product',
                status: data.status || 'pending',
                shopName: firstProduct.shopName || 'Shop',
                sellerId: firstProduct.sellerId || data.sellerId || ''
            };
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        recentOrders.value = [];
    } finally {
        loadingOrders.value = false;
    }
}

// Format date helper
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        return 'N/A';
    }
}

// Navigation helpers
function goToOrder(orderId) {
    router.push('/buyer-orders/');
}

function goToMessage(conversationId) {
    router.push(`/buyer-messages/?conversation=${conversationId}`);
}

function goToShop(businessId) {
    if (businessId) {
        router.push(`/shop-details/${businessId}`);
    }
}

// Initialize data on mount
onMounted(() => {
  fetchRecentOrders();            
  fetchOrderCounts();             
  messaging.loadConversations();
  fetchFavoriteBusinessesCustom();
});
</script>

<template>
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
        <BuyerSideBar @sidebar-toggle="handleSidebarToggle" />
        
        <main 
            class="transition-all duration-300 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 md:ml-64"
            :class="{ 'md:!ml-20': isSidebarCollapsed }"
        >
            <div class="max-w-7xl mx-auto">
                <!-- Header -->
                <div class="mb-6 lg:mb-8">
                    <h1 class="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                    <p class="text-sm lg:text-base text-slate-600 dark:text-slate-400 mt-1">Welcome back! Here's your overview</p>
                </div>

                <!-- Stats Grid - Mobile: 2 columns, Desktop: 4 columns -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
                    <!-- Total Orders Card -->
                    <div class="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                            <div class="p-1.5 sm:p-2 lg:p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <svg class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 mb-1">Total Orders</p>
                        <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{{ stats.totalOrders }}</p>
                    </div>

                    <!-- Pending Orders Card -->
                    <div class="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                            <div class="p-1.5 sm:p-2 lg:p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                                <svg class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 mb-1">Pending Shipping Orders</p>
                        <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{{ stats.pendingOrders }}</p>
                    </div>

                    <!-- Unread Messages Card -->
                    <div class="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                            <div class="p-1.5 sm:p-2 lg:p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <svg class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 mb-1">Unread Messages</p>
                        <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{{ stats.unreadCount }}</p>
                    </div>

                    <!-- Favorites Card -->
                    <div class="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                            <div class="p-1.5 sm:p-2 lg:p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                                <svg class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 mb-1">Favorite Businesses</p>
                        <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{{ stats.favoriteCount }}</p>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <!-- Recent Orders Section -->
                    <div class="lg:col-span-2">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Recent Orders</h2>
                            <RouterLink to="/buyer-orders/" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                                View All
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </RouterLink>
                        </div>

                        <!-- Loading State -->
                        <div v-if="loadingOrders" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div v-for="i in 3" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden animate-pulse border border-slate-200 dark:border-slate-700">
                                <div class="h-40 bg-slate-200 dark:bg-slate-700"></div>
                                <div class="p-4 space-y-3">
                                    <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Orders Grid -->
                        <div v-else-if="recentOrders.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div
                                v-for="order in recentOrders"
                                :key="order.id"
                                @click="goToOrder(order.id)"
                                class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500">
                                <div class="relative overflow-hidden">
                                    <img :src="order.image" :alt="order.title" class="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300" />
                                    <div class="absolute top-3 right-3">
                                        <span class="px-3 py-1 text-xs font-semibold rounded-full bg-white/90 backdrop-blur-sm text-slate-700">
                                            {{ order.status === 'to_ship' ? 'Processing' : order.status === 'to_receive' ? 'Shipped' : 'Pending' }}
                                        </span>
                                    </div>
                                </div>
                                <div class="p-4">
                                    <h3 class="font-semibold text-slate-900 dark:text-white mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {{ order.title }}
                                    </h3>
                                    <p class="text-sm text-slate-500 dark:text-slate-400">Order #{{ order.orderId }}</p>
                                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Placed on {{ order.date }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-else class="bg-white dark:bg-slate-800 rounded-xl lg:rounded-2xl p-8 lg:p-12 text-center border border-slate-200 dark:border-slate-700">
                            <svg class="h-12 w-12 lg:h-16 lg:w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                            <h3 class="text-base lg:text-lg font-semibold text-slate-900 dark:text-white mb-2">No orders yet</h3>
                            <p class="text-sm lg:text-base text-slate-600 dark:text-slate-400 mb-4">Start shopping to see your orders here</p>
                            <RouterLink to="/products/">
                                <button class="px-4 lg:px-6 py-2 bg-blue-600 text-white text-sm lg:text-base rounded-lg hover:bg-blue-700 transition-colors">
                                    Browse Products
                                </button>
                            </RouterLink>
                        </div>

                        <!-- Favorite Businesses Section -->
                        <div class="mt-6 lg:mt-8">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Favorite Businesses</h2>
                                <RouterLink to="/buyer-favourites/" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                                    View All
                                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </RouterLink>
                            </div>

                            <!-- Loading State -->
                            <div v-if="loadingFavorites" class="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div v-for="i in 6" :key="i" class="flex flex-col items-center">
                                    <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse mb-3"></div>
                                    <div class="h-3 w-20 lg:w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                </div>
                            </div>

                            <!-- Favorites Grid -->
                            <div v-else-if="favoriteBusinesses.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <div
                                    v-for="business in favoriteBusinesses"
                                    :key="business.id"
                                    @click="goToShop(business.id)"
                                    class="flex flex-col items-center cursor-pointer group">
                                    <div class="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden mb-3 group-hover:scale-110 transition-transform duration-300 ring-2 ring-transparent group-hover:ring-blue-500 shadow-md">
                                        <img :src="business.image" :alt="business.name" class="w-full h-full object-cover" />
                                    </div>
                                    <p class="text-xs lg:text-sm font-medium text-slate-900 dark:text-white text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 px-1">
                                        {{ business.name }}
                                    </p>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                                        {{ business.ownerName }}
                                    </p>
                                </div>
                            </div>

                            <!-- Empty State -->
                            <div v-else class="bg-white dark:bg-slate-800 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-center border border-slate-200 dark:border-slate-700">
                                <svg class="h-10 w-10 lg:h-12 lg:w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                </svg>
                                <p class="text-sm lg:text-base text-slate-600 dark:text-slate-400">No favorite businesses yet</p>
                            </div>
                        </div>
                    </div>

                    <!-- Unread Messages Section -->
                    <div class="lg:col-span-1">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Unread Messages</h2>
                            <RouterLink to="/buyer-messages/" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                                View All
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </RouterLink>
                        </div>

                        <!-- Loading State -->
                        <div v-if="loadingMessages" class="space-y-3">
                            <div v-for="i in 3" :key="i" class="bg-white dark:bg-slate-800 rounded-xl lg:rounded-2xl p-4 animate-pulse border border-slate-200 dark:border-slate-700">
                                <div class="flex items-start gap-3">
                                    <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                    <div class="flex-1 space-y-2">
                                        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Messages List -->
                        <div v-else-if="unreadMessages.length > 0" class="space-y-3">
                            <div
                                v-for="message in unreadMessages"
                                :key="message.id"
                                @click="goToMessage(message.id)"
                                class="group bg-white dark:bg-slate-800 rounded-xl lg:rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500">
                                <div class="flex items-start gap-3">
                                    <img :src="message.avatar" :alt="message.business" class="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex-shrink-0 ring-2 ring-transparent group-hover:ring-blue-500 transition-all" />
                                    <div class="flex-1 min-w-0">
                                        <h3 class="font-semibold text-sm lg:text-base text-slate-900 dark:text-white mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {{ message.business }}
                                        </h3>
                                        <p class="text-xs lg:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{{ message.message }}</p>
                                        <div class="flex items-center gap-2 mt-2">
                                            <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                                <span class="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
                                                New
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-else class="bg-white dark:bg-slate-800 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-center border border-slate-200 dark:border-slate-700">
                            <svg class="h-10 w-10 lg:h-12 lg:w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                            </svg>
                            <p class="text-sm lg:text-base text-slate-600 dark:text-slate-400">No new messages</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
/* Smooth animations */
* {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform;
    transition-duration: 200ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Line clamp utility */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>