// inventory_management.js
// Live inventory sync (orders -> products) for a specific seller
// - Listens to the most recent orders and filters client-side to this seller
// - Applies idempotent adjustments based on the latest status in statusLog
// - Handles single-variant and multi-variant products (size / sizeIndex)
// - Uses Firestore transactions to update quantities and totalSales safely

import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  doc,
  updateDoc,
} from 'firebase/firestore'

let _unsub = null

/**
 * Attach a live watcher that syncs inventory for a seller.
 * Call this once after seller signs in (you already call it from seller_product.js).
 *
 * @param {Object} opts
 * @param {import('firebase/firestore').Firestore} opts.db
 * @param {any} opts.auth     // not used here, kept for symmetry with your call sites
 * @param {string} opts.sellerId
 */
export function attachInventoryWatcher({ db = getFirestore(), auth, sellerId }) {
  if (!sellerId) {
    console.warn('[Inventory] attachInventoryWatcher: missing sellerId')
    return () => {}
  }

  // If already attached for some reason, detach old one
  if (_unsub) {
    try { _unsub(); } catch {}
    _unsub = null
  }

  // Heuristic: watch the most recently updated orders (keeps cost sane)
  // Your orders have `updatedAt` (timestamp). We keep it lean with limit(200).
  const ordersRef = collection(db, 'orders')
  const q = query(ordersRef, orderBy('updatedAt', 'desc'), limit(200))

  console.log(`[Inventory] Initializing live watcher for seller: ${sellerId}`)
  _unsub = onSnapshot(
    q,
    async (snap) => {
      // Process only changed docs (added/modified)
      const changes = snap.docChanges()
      if (!changes.length) return

      for (const ch of changes) {
        if (ch.type !== 'added' && ch.type !== 'modified') continue
        const order = { id: ch.doc.id, ...ch.doc.data() }

        // Ignore orders that don’t include this seller in products[]
        if (!Array.isArray(order.products) || !order.products.some(p => p?.sellerId === sellerId)) {
          continue
        }

        try {
          await handleOrderStatusChange(db, order, sellerId)
        } catch (err) {
          console.error(`[Inventory] Failed to handle order ${order.id}:`, err)
        }
      }
    },
    (err) => {
      console.error('[Inventory] Snapshot listener error:', err)
    }
  )

  return _unsub
}

/**
 * Detach the watcher if needed (e.g., on logout).
 */
export function detachInventoryWatcher() {
  if (_unsub) {
    try { _unsub(); } catch {}
    _unsub = null
  }
}

/* ====================================================================== */
/* =====================  CORE STATUS HANDLER  ========================== */
/* ====================================================================== */

/**
 * Decide what inventory adjustment to apply for the seller, based on the
 * latest status in statusLog. We write an idempotency marker into the order:
 * inventoryCursor: { [sellerId]: "<status-we-last-applied>" }
 *
 * Rules we’re implementing (based on your spec):
 * - When status moves to 'to_ship' (or is 'to_ship' as latest): DEDUCT quantities for all items of this seller.
 * - When status moves to 'cancelled': REIMBURSE quantities for all items of this seller.
 * - When status moves to 'completed': INCREMENT totalSales for all items of this seller (no quantity change).
 *
 * Notes:
 * - Orders are seller-scoped in your app, but we still scope the cursor by sellerId to be safe.
 * - We only act if latestStatus !== inventoryCursor[sellerId] to keep it idempotent.
 */
async function handleOrderStatusChange(db, order, sellerId) {
  const latestStatus = getLatestStatus(order)
  if (!latestStatus) return

  const cursor = order.inventoryCursor && typeof order.inventoryCursor === 'object'
    ? order.inventoryCursor[sellerId]
    : undefined

  // Nothing to do if we’ve already applied this status for this seller
  if (cursor === latestStatus) {
    // Debug:
    // console.log(`[Inventory] Order ${order.id} already applied for status ${latestStatus}`)
    return
  }

  console.log(`[Inventory] Handling order ${order.id} → ${latestStatus} (prev: ${cursor ?? 'none'})`)

  // Filter order items to only products of this seller
  const sellerItems = (order.products || []).filter(p => p?.sellerId === sellerId)
  if (!sellerItems.length) return

  // Apply by status
  if (latestStatus === 'to_ship') {
    await adjustAllItems(db, sellerItems, 'DEDUCT')
  } else if (latestStatus === 'cancelled') {
    await adjustAllItems(db, sellerItems, 'REIMBURSE')
  } else if (latestStatus === 'completed') {
    await addSalesAllItems(db, sellerItems)
  } else {
    // For other statuses we do nothing to stock/metrics
    // e.g. to_pay, to_receive, return_refund ...
  }

  // Mark idempotent cursor so we won’t redo the same work next snapshot
  try {
    const orderRef = doc(db, 'orders', order.id)
    await updateDoc(orderRef, {
      [`inventoryCursor.${sellerId}`]: latestStatus
    })
  } catch (e) {
    // Non-fatal; if this write fails, you might re-apply on next snapshot.
    console.warn(`[Inventory] Could not write inventoryCursor for ${order.id}:`, e)
  }
}

/* ====================================================================== */
/* =======================  APPLY ADJUSTMENTS  ========================== */
/* ====================================================================== */

/**
 * DEDUCT or REIMBURSE quantities for each item in the order for this seller.
 * Handles both single-variant (quantity:number) and multi-variant (quantity:number[])
 */
async function adjustAllItems(db, items, mode /* 'DEDUCT' | 'REIMBURSE' */) {
  const isDeduct = mode === 'DEDUCT'
  const verb = isDeduct ? 'Deducted' : 'Reimbursed'

  await Promise.all(items.map(async (it) => {
    const productRef = doc(db, 'products', it.productId)
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(productRef)
      if (!snap.exists()) return

      const data = snap.data() || {}

      // Decide if single or multi variant
      const hasVariants = Array.isArray(data.size) && Array.isArray(data.quantity)
      const orderQty = Number(it.quantity ?? 1) || 1

      if (hasVariants) {
        // Prefer explicit sizeIndex from order if present, else match by size label
        let idx = Number.isInteger(it.sizeIndex) ? it.sizeIndex : -1
        if (idx < 0 && it.size != null) {
          idx = (data.size || []).findIndex(s => String(s) === String(it.size))
        }
        if (idx < 0) {
          // Couldn’t match a variant -> no-op for safety
          console.warn(`[Inventory] Variant not found for product ${it.productId}. sizeIndex=${it.sizeIndex} size=${it.size}`)
          return
        }

        const qtyArr = Array.isArray(data.quantity) ? [...data.quantity] : []
        const current = Number(qtyArr[idx] ?? 0) || 0
        const next = isDeduct ? Math.max(0, current - orderQty) : current + orderQty
        qtyArr[idx] = next

        tx.update(productRef, { quantity: qtyArr })
        console.log(`[Inventory] ${verb} ${orderQty} from product ${it.productId} (variant #${idx}) → ${next}`)
      } else {
        // Single-variant product
        const current = Number(data.quantity ?? 0) || 0
        const next = isDeduct ? Math.max(0, current - orderQty) : current + orderQty

        tx.update(productRef, { quantity: next })
        console.log(`[Inventory] ${verb} ${orderQty} from product ${it.productId} → ${next}`)
      }
    })
  }))
}

/**
 * Increment totalSales for each item (no stock change).
 * For multi-variant products we increment totalSales as a single counter (your schema).
 */
async function addSalesAllItems(db, items) {
  await Promise.all(items.map(async (it) => {
    const productRef = doc(db, 'products', it.productId)
    const incBy = Number(it.quantity ?? 1) || 1

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(productRef)
      if (!snap.exists()) return
      const data = snap.data() || {}
      const currentSales = Number(data.totalSales ?? 0) || 0
      const nextSales = currentSales + incBy
      tx.update(productRef, { totalSales: nextSales })
      console.log(`[Inventory] Added sales +${incBy} to product ${it.productId} → totalSales=${nextSales}`)
    })
  }))
}

/* ====================================================================== */
/* =========================  SMALL HELPERS  ============================ */
/* ====================================================================== */

function getLatestStatus(order) {
  const log = Array.isArray(order.statusLog) ? order.statusLog : []
  if (!log.length) return order.status || null
  const last = log[log.length - 1]
  return last?.status || order.status || null
}
