// src/composables/useSellerOrders.js
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { auth, db } from '@/firebase/firebase_config'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'

const orders = ref([])
let unsub = null

const statusOf = (o) => o?.status || o?.statusLog?.[o.statusLog.length-1]?.status || 'to_ship'

export function useSellerOrders() {
  onMounted(() => {
    const stop = auth.onAuthStateChanged(u => {
      if (!u) return
      const q = query(
        collection(db, 'orders'),
        where('products.0.sellerId', '==', u.uid),
        orderBy('createdAt','desc')
      )
      unsub?.()
      unsub = onSnapshot(q, s => { orders.value = s.docs.map(d => ({ id:d.id, ...d.data() })) })
    })
    onBeforeUnmount(() => { unsub?.(); stop?.() })
  })

  const counts = computed(() => ({
    toShip:     orders.value.filter(o => statusOf(o) === 'to_ship').length,
    shipping:   orders.value.filter(o => statusOf(o) === 'shipped').length,
    completed:  orders.value.filter(o => statusOf(o) === 'completed').length,
    cancelled:  orders.value.filter(o => statusOf(o) === 'cancelled').length,
    rr:         orders.value.filter(o => statusOf(o) === 'return_refund' || o.returnRequestSummary).length,
  }))

  return { orders, counts, statusOf }
}
