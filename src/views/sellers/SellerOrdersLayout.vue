<!-- src/views/sellers/orders/SellerOrdersLayout.vue -->
<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <SellerOrdersSidebar :counts="counts" />
    <main class="flex-1 p-6 sm:p-8">
      <!-- Your child pages render here -->
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { auth, db } from '@/firebase/firebase_config'
import { collection, onSnapshot, query as fsQuery, where, orderBy } from 'firebase/firestore'
import SellerOrdersSidebar from '@/components/layout/SellerOrdersSidebar.vue'

const counts = ref({ toShip: 0, shipping: 0, completed: 0, cancelled: 0, rr: 0 })

let stopAuth = null
let stopOrders = null

function recalc(docs, uid) {
  const c = { toShip: 0, shipping: 0, completed: 0, cancelled: 0, rr: 0 }

  for (const d of docs) {
    const o = d.data()
    // accept either root sellerId OR products[0].sellerId
    const isMine =
      o?.sellerId === uid ||
      (Array.isArray(o?.products) && o.products[0]?.sellerId === uid)

    if (!isMine) continue

    switch (o?.status) {
      case 'to_ship':       c.toShip++;      break
      case 'to_receive':    c.shipping++;    break   // <-- this feeds the "Shipping" badge
      case 'completed':     c.completed++;   break
      case 'cancelled':     c.cancelled++;   break
      case 'return_refund': c.rr++;          break
    }
  }
  counts.value = c
}

onMounted(() => {
  stopAuth = auth.onAuthStateChanged(user => {
    // clean previous listener
    stopOrders?.(); stopOrders = null
    counts.value = { toShip: 0, shipping: 0, completed: 0, cancelled: 0, rr: 0 }
    if (!user) return

    // stream only THIS seller's orders (works with new rules)
    const q = fsQuery(
      collection(db, 'orders'),
      where('sellerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    stopOrders = onSnapshot(q, snap => {
      recalc(snap.docs, user.uid)
    })
  })
})

onBeforeUnmount(() => { stopOrders?.(); stopAuth?.() })
</script>
