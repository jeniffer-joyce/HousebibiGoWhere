// src/composables/useSellerRatings.js
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { auth, db } from '@/firebase/firebase_config'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

/**
 * Live aggregates for a seller's ratings from /reviews
 * review doc shape (assumed):
 * {
 *   sellerId: string,
 *   sellerService: number,
 *   delivery: number,
 *   items: [{ rating: number, productId, size, ... }]
 * }
 */
const loading = ref(true)
const error = ref('')
const metrics = ref({
  avgItem: 0,             // average of item-level ratings across all review items
  avgSellerService: 0,    // average per review doc
  avgDelivery: 0,         // average per review doc
  totalReviews: 0,        // number of review docs
  totalItemRatings: 0,    // number of items with rating > 0 across all reviews
  dist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } // item-level star distribution
})

let unsubReviews = null
let stopAuth = null

export function useSellerRatings () {
  onMounted(() => {
    // cleanup any old listeners if hot-reloading
    unsubReviews?.(); unsubReviews = null
    stopAuth?.(); stopAuth = null
    loading.value = true
    error.value = ''
    metrics.value = {
      avgItem: 0, avgSellerService: 0, avgDelivery: 0,
      totalReviews: 0, totalItemRatings: 0,
      dist: { 1:0, 2:0, 3:0, 4:0, 5:0 }
    }

    stopAuth = auth.onAuthStateChanged(u => {
      // reset state and listeners when auth changes
      unsubReviews?.(); unsubReviews = null
      loading.value = true
      error.value = ''
      metrics.value = {
        avgItem: 0, avgSellerService: 0, avgDelivery: 0,
        totalReviews: 0, totalItemRatings: 0,
        dist: { 1:0, 2:0, 3:0, 4:0, 5:0 }
      }

      if (!u) { loading.value = false; return }

      const qRef = query(
        collection(db, 'reviews'),
        where('sellerId', '==', u.uid)
      )

      unsubReviews = onSnapshot(qRef, (snap) => {
        // running totals
        let itemSum = 0
        let itemCount = 0
        let sellerServiceSum = 0
        let deliverySum = 0
        let reviewCount = 0
        const dist = { 1:0, 2:0, 3:0, 4:0, 5:0 }

        snap.forEach(d => {
          const r = d.data() || {}
          reviewCount++

          const ss = Number(r.sellerService || 0)
          const dv = Number(r.delivery || 0)
          sellerServiceSum += ss
          deliverySum += dv

          const items = Array.isArray(r.items) ? r.items : []
          for (const it of items) {
            const raw = Number(it?.rating || 0)
            const rating = Number.isFinite(raw) ? Math.max(0, Math.min(5, raw)) : 0
            if (rating > 0) {
              itemSum += rating
              itemCount++
              const bucket = Math.max(1, Math.min(5, Math.round(rating))) // bucket to 1..5
              dist[bucket]++
            }
          }
        })

        metrics.value = {
          avgItem: itemCount ? itemSum / itemCount : 0,
          avgSellerService: reviewCount ? sellerServiceSum / reviewCount : 0,
          avgDelivery: reviewCount ? deliverySum / reviewCount : 0,
          totalReviews: reviewCount,
          totalItemRatings: itemCount,
          dist
        }

        loading.value = false
        error.value = ''
      }, (e) => {
        console.error('[useSellerRatings] onSnapshot error:', e)
        error.value = 'Failed to load ratings'
        loading.value = false
      })
    })
  })

  onBeforeUnmount(() => {
    unsubReviews?.(); unsubReviews = null
    stopAuth?.(); stopAuth = null
  })

  // convenient computed helpers (optional)
  const starDistArray = computed(() => [5,4,3,2,1].map(star => ({
    star,
    count: metrics.value.dist[star] ?? 0
  })))

  const starDistPct = (star) => {
    const total = Object.values(metrics.value.dist || {}).reduce((a, b) => a + b, 0) || 1
    return Math.round(((metrics.value.dist[star] || 0) / total) * 100)
  }

  const rounded = computed(() => ({
    avgItem: Number(metrics.value.avgItem.toFixed(2)),
    avgSellerService: Number(metrics.value.avgSellerService.toFixed(2)),
    avgDelivery: Number(metrics.value.avgDelivery.toFixed(2))
  }))

  return {
    loading,
    error,
    metrics,        // raw numbers
    rounded,        // rounded 2dp
    starDistArray,  // [{star,count}] in 5..1 order
    starDistPct     // function(star) => %
  }
}
