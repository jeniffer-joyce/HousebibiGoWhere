<template>
  <section class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h2>
      <button
        v-if="notifications.length > 0"
        @click="markAllRead"
        class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
        Mark All as Read
      </button>
    </div>

    <div v-if="loading" class="text-slate-600 dark:text-slate-300">Loading notifications…</div>

    <div v-else-if="notifications.length === 0" class="text-slate-600 dark:text-slate-400">
      You have no notifications yet.
    </div>

    <!-- Notifications list -->
    <div v-else class="divide-y divide-slate-200 dark:divide-slate-700">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="flex justify-between items-start gap-4 py-4 px-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-lg transition-colors"
        :class="{ 'opacity-60': n.read }"
      >
        <div class="flex-1 min-w-0">
          <h3
            class="font-semibold text-slate-900 dark:text-white"
            :class="{ 'font-bold': !n.read }"
          >
            {{ n.title }}
          </h3>
          <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">{{ n.message }}</p>

          <div class="flex items-center gap-3 mt-2">
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ formatDate(n.timestamp) }}
            </p>

            <button
              v-if="!n.read"
              @click="markRead(n)"
              class="text-xs text-primary hover:underline"
            >
              Mark as Read
            </button>

            <button
              v-if="n.action && n.actionLink"
              @click="goTo(n.actionLink)"
              class="text-xs text-primary hover:underline"
            >
              {{ n.action }}
            </button>
          </div>
        </div>

        <button
          @click="removeNotification(n)"
          class="shrink-0 text-slate-400 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Success/Error -->
    <p v-if="successMessage" class="mt-4 text-sm text-emerald-600">{{ successMessage }}</p>
    <p v-if="errorMessage" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth, db } from '@/firebase/firebase_config'
import {
  collection, doc, getDocs, deleteDoc, updateDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore'
import { useRouter } from 'vue-router'

const router = useRouter()
const notifications = ref([])
const loading = ref(true)
const successMessage = ref('')
const errorMessage = ref('')

async function loadNotifications() {
  loading.value = true
  try {
    const user = auth.currentUser
    if (!user) return

    const notifCol = collection(db, 'users', user.uid, 'notifications')
    const q = query(notifCol, orderBy('timestamp', 'desc'))
    const snap = await getDocs(q)

    notifications.value = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }))
  } catch (e) {
    console.error(e)
    errorMessage.value = 'Failed to load notifications.'
  } finally {
    loading.value = false
  }
}

async function markRead(n) {
  try {
    const user = auth.currentUser
    if (!user) return
    const notifRef = doc(db, 'users', user.uid, 'notifications', n.id)
    await updateDoc(notifRef, { read: true, updatedAt: serverTimestamp() })
    n.read = true
    successMessage.value = 'Notification marked as read.'
  } catch (e) {
    console.error(e)
  }
}

async function markAllRead() {
  try {
    const user = auth.currentUser
    if (!user) return
    const updates = notifications.value
      .filter(n => !n.read)
      .map(n => updateDoc(doc(db, 'users', user.uid, 'notifications', n.id), {
        read: true,
        updatedAt: serverTimestamp(),
      }))
    await Promise.all(updates)
    notifications.value.forEach(n => (n.read = true))
    successMessage.value = 'All notifications marked as read.'
  } catch (e) {
    console.error(e)
  }
}

async function removeNotification(n) {
  try {
    const user = auth.currentUser
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'notifications', n.id))
    notifications.value = notifications.value.filter(x => x.id !== n.id)
  } catch (e) {
    console.error(e)
    errorMessage.value = 'Failed to delete notification.'
  }
}

function formatDate(ts) {
  if (!ts) return ''
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleString('en-SG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function goTo(link) {
  if (link) router.push(link)
}

onMounted(loadNotifications)
</script>