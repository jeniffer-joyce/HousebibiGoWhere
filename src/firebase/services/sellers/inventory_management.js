// inventory_management.js
// Live inventory sync (orders -> products) for a specific seller
// - Listens to the most recent orders and filters client-side to this seller
// - Applies idempotent adjustments based on the latest status in statusLog
// - Handles single-variant and multi-variant products (size / sizeIndex)
// - Uses Firestore transactions to update quantities and totalSales safely
// - FIXED: Timestamp-based guard prevents reprocessing unchanged orders

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
  Timestamp,
} from 'firebase/firestore'

let _unsub = null
let _activeSellerId = null

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

  // ⭐ Prevent duplicate watchers for the same seller
  if (_activeSellerId === sellerId && _unsub) {
    console.log(`[Inventory] Watcher already active for seller: ${sellerId}`)
    return _unsub
  }

  // If already attached for different seller, detach old one
  if (_unsub) {
    try { _unsub(); } catch {}
    _unsub = null
    _activeSellerId = null
  }

  // Heuristic: watch the most recently updated orders (keeps cost sane)
  const ordersRef = collection(db, 'orders')
  const q = query(ordersRef, orderBy('updatedAt', 'desc'), limit(200))

  console.log(`[Inventory] Initializing watcher for seller: ${sellerId}`)
  _unsub = onSnapshot(
    q,
    async (snap) => {
      // Process only changed docs (added/modified)
      const changes = snap.docChanges()
      if (!changes.length) return

      for (const ch of changes) {
        if (ch.type !== 'added' && ch.type !== 'modified') continue
        const order = { id: ch.doc.id, ...ch.doc.data() }

        // Ignore orders that don't include this seller in products[]
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

  _activeSellerId = sellerId
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
  _activeSellerId = null
  console.log('[Inventory] Watcher detached')
}

/* ====================================================================== */
/* =====================  CORE STATUS HANDLER  ========================== */
/* ====================================================================== */

/**
 * Convert various timestamp formats to milliseconds since epoch
 */
function toMillis(val) {
  if (!val) return 0
  if (typeof val === 'number') return val
  if (val instanceof Date) return val.getTime()
  if (val instanceof Timestamp) return val.toMillis()
  if (typeof val === 'string') {
    const d = new Date(val)
    return isNaN(d.getTime()) ? 0 : d.getTime()
  }
  return 0
}

/**
 * Get the timestamp of the latest status change from statusLog
 */
function getLatestStatusTimestamp(order) {
  const log = Array.isArray(order.statusLog) ? order.statusLog : []
  if (!log.length) return toMillis(order.createdAt) || 0
  
  const last = log[log.length - 1]
  return toMillis(last?.time) || toMillis(order.updatedAt) || 0
}

/**
 * ⭐ FIXED IDEMPOTENCY LOGIC with TIMESTAMP GUARD
 * 
 * Cursor structure:
 * inventoryCursor: {
 *   [sellerId]: {
 *     lastStatus: "to_ship",
 *     lastProcessedTimestamp: 1699123456789,  // ⭐ NEW: milliseconds since epoch
 *     processedActions: {
 *       "to_ship_deduct": true,
 *       "completed_sales": true
 *     }
 *   }
 * }
 */
async function handleOrderStatusChange(db, order, sellerId) {
  const latestStatus = getLatestStatus(order)
  if (!latestStatus) return

  // Get the timestamp of the latest status change
  const latestStatusTimestamp = getLatestStatusTimestamp(order)

  // ⭐ Parse cursor with backward compatibility
  const cursorRaw = order.inventoryCursor?.[sellerId]
  let processedActions = {}
  let lastProcessedStatus = null
  let lastProcessedTimestamp = 0

  if (typeof cursorRaw === 'string') {
    // OLD FORMAT: just a status string - migrate
    lastProcessedStatus = cursorRaw
    lastProcessedTimestamp = 0 // Unknown, will reprocess once
    
    if (cursorRaw === 'to_ship' || cursorRaw === 'to_receive' || cursorRaw === 'completed') {
      processedActions['to_ship_deduct'] = true
    }
    if (cursorRaw === 'completed') {
      processedActions['completed_sales'] = true
    }
    if (cursorRaw === 'cancelled') {
      processedActions['cancelled_reimburse'] = true
    }
  } else if (typeof cursorRaw === 'object' && cursorRaw !== null) {
    // NEW FORMAT: object with detailed tracking
    lastProcessedStatus = cursorRaw.lastStatus
    lastProcessedTimestamp = Number(cursorRaw.lastProcessedTimestamp) || 0
    processedActions = cursorRaw.processedActions || {}
  }

  // ⭐ TIMESTAMP GUARD: If we've already processed a more recent or equal timestamp, skip
  if (lastProcessedTimestamp >= latestStatusTimestamp && lastProcessedTimestamp > 0) {
    // We've already processed this status change or a more recent one
    return
  }

  // ⭐ ACTION KEY CHECK: If this specific action was already processed, skip
  const actionKey = getActionKey(latestStatus)
  if (actionKey && processedActions[actionKey]) {
    // Action already completed, but update timestamp if needed
    if (lastProcessedTimestamp < latestStatusTimestamp) {
      await updateCursor(db, order.id, sellerId, latestStatus, processedActions, latestStatusTimestamp)
    }
    return
  }

  // If status hasn't changed and no new timestamp, nothing to do
  if (lastProcessedStatus === latestStatus && lastProcessedTimestamp >= latestStatusTimestamp) {
    return
  }

  // Filter order items to only products of this seller
  const sellerItems = (order.products || []).filter(p => p?.sellerId === sellerId)
  if (!sellerItems.length) return

  // Track what actions we perform
  const actionsToMark = {}
  let actionPerformed = false

  console.log(`[Inventory] Processing order ${order.id}: ${latestStatus}`)

  // ⭐ Apply adjustments based on status - ONLY if not already processed
  
  if (latestStatus === 'to_ship' && !processedActions['to_ship_deduct']) {
    await adjustAllItems(db, sellerItems, 'DEDUCT')
    actionsToMark['to_ship_deduct'] = true
    actionPerformed = true
  }
  
  if (latestStatus === 'cancelled' && !processedActions['cancelled_reimburse']) {
    // REIMBURSE only if we previously deducted
    if (processedActions['to_ship_deduct']) {
      await adjustAllItems(db, sellerItems, 'REIMBURSE')
      actionsToMark['cancelled_reimburse'] = true
      actionPerformed = true
    } else {
      // Mark as processed to avoid future checks
      actionsToMark['cancelled_reimburse'] = true
      actionPerformed = true
    }
  }
  
  if (latestStatus === 'completed' && !processedActions['completed_sales']) {
    await addSalesAllItems(db, sellerItems)
    actionsToMark['completed_sales'] = true
    actionPerformed = true
  }

  // Update cursor with new status, timestamp, and actions
  if (actionPerformed) {
    const newProcessedActions = { ...processedActions, ...actionsToMark }
    await updateCursor(db, order.id, sellerId, latestStatus, newProcessedActions, latestStatusTimestamp)
  }
}

/**
 * Update the inventory cursor for an order
 */
async function updateCursor(db, orderId, sellerId, status, processedActions, timestamp) {
  try {
    const orderRef = doc(db, 'orders', orderId)
    await updateDoc(orderRef, {
      [`inventoryCursor.${sellerId}`]: {
        lastStatus: status,
        lastProcessedTimestamp: timestamp,
        processedActions: processedActions,
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (e) {
    console.warn(`[Inventory] Could not write cursor for ${orderId}:`, e)
  }
}

/**
 * Get the action key for a given status
 */
function getActionKey(status) {
  const actionMap = {
    'to_ship': 'to_ship_deduct',
    'cancelled': 'cancelled_reimburse',
    'completed': 'completed_sales'
  }
  return actionMap[status] || null
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
        // ⭐ MULTI-VARIANT PRODUCT
        let idx = Number.isInteger(it.sizeIndex) ? it.sizeIndex : -1
        if (idx < 0 && it.size != null) {
          idx = (data.size || []).findIndex(s => String(s) === String(it.size))
        }
        
        if (idx < 0 || idx >= data.quantity.length) return

        const qtyArr = [...data.quantity]
        const current = Number(qtyArr[idx] ?? 0) || 0
        const next = isDeduct 
          ? Math.max(0, current - orderQty)
          : current + orderQty

        qtyArr[idx] = next
        tx.update(productRef, { quantity: qtyArr })
      } else {
        // ⭐ SINGLE-VARIANT PRODUCT
        const current = Number(data.quantity ?? 0) || 0
        const next = isDeduct 
          ? Math.max(0, current - orderQty)
          : current + orderQty

        tx.update(productRef, { quantity: next })
      }
    })
  }))
}

/**
 * Increment totalSales for each item (no stock change).
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