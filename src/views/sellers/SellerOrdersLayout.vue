<!-- src/views/sellers/orders/SellerOrdersLayout.vue -->
<template>
  <div class="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
    <SellerOrdersSidebar :counts="counts" />
    <main class="flex-1 overflow-auto">
      <div class="p-4 sm:p-6 lg:p-8">
        <!-- Your child pages render here -->
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { auth, db } from '@/firebase/firebase_config'
import { collection, onSnapshot, query as fsQuery, where, orderBy } from 'firebase/firestore'
import SellerOrdersSidebar from '@/components/layout/SellerOrdersSidebar.vue'

const counts = ref({ 
  toShip: 0, 
  shipping: 0, 
  completed: 0, 
  cancelled: 0, 
  rr: 0,
  inventory: 0,
  reviews: 0,   // 👈 added here so the sidebar can show a badge for Reviews
})

let stopAuth = null
let stopOrders = null
let stopProducts = null
let stopReviews = null

function recalcOrders(docs, uid) {
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
      case 'to_receive':    c.shipping++;    break
      case 'completed':     c.completed++;   break
      case 'cancelled':     c.cancelled++;   break
      case 'return_refund': c.rr++;          break
    }
  }
  
  // ✅ Preserve other counters (inventory, reviews) when orders update
  counts.value = { ...counts.value, ...c }
}

// ⭐ Count products for inventory (READ-ONLY, no watcher initialization)
function recalcProducts(docs) {
  counts.value = { ...counts.value, inventory: docs.length }
}

// ⭐ NEW: Reviews counter (choose one of the two strategies below)
// Strategy A: count review documents (1 review doc == 1)
function recalcReviews(docs /*, uid */) {
  const reviewDocs = docs.length
  counts.value = { ...counts.value, reviews: reviewDocs }
}

/* 
// Strategy B (optional): count total item-level ratings across all reviews instead
function recalcReviews(docs) {
  const totalItemRatings = docs.reduce((acc, d) => {
    const r = d.data() || {}
    const items = Array.isArray(r.items) ? r.items : []
    return acc + items.filter(x => Number(x?.rating) > 0).length
  }, 0)
  counts.value = { ...counts.value, reviews: totalItemRatings }
}
*/

onMounted(() => {
  stopAuth = auth.onAuthStateChanged(user => {
    // clean previous listeners
    stopOrders?.();   stopOrders = null
    stopProducts?.(); stopProducts = null
    stopReviews?.();  stopReviews = null
    
    // ✅ include reviews in the reset object
    counts.value = { 
      toShip: 0, 
      shipping: 0, 
      completed: 0, 
      cancelled: 0, 
      rr: 0,
      inventory: 0,
      reviews: 0
    }
    
    if (!user) return

    // Stream orders (existing logic)
    const ordersQuery = fsQuery(
      collection(db, 'orders'),
      where('sellerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    stopOrders = onSnapshot(ordersQuery, snap => {
      recalcOrders(snap.docs, user.uid)
    })

    // ⭐ Stream products for inventory count ONLY (no inventory_management.js here)
    // The inventory watcher is initialized in SellerOrdersInventory.vue
    const productsQuery = fsQuery(
      collection(db, 'products'),
      where('sellerId', '==', user.uid)
    )
    stopProducts = onSnapshot(productsQuery, snap => {
      recalcProducts(snap.docs)
    })

    // ⭐ Stream reviews so the sidebar badge updates live
    const reviewsQuery = fsQuery(
      collection(db, 'reviews'),
      where('sellerId', '==', user.uid)
    )
    stopReviews = onSnapshot(reviewsQuery, snap => {
      recalcReviews(snap.docs, user.uid)
    })
  })
})

onBeforeUnmount(() => { 
  stopOrders?.()
  stopProducts?.()
  stopReviews?.()   // ✅ cleanup reviews listener
  stopAuth?.() 
})
</script>
