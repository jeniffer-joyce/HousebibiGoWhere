// inventory_management.js
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
  getDoc,
} from 'firebase/firestore'

let _unsub = null
let _businessCheckTimeout = null

/**
 * Attach a live watcher that syncs inventory for a seller.
 * ✅ NOW CHECKS if businesses document exists first!
 *
 * @param {Object} opts
 * @param {import('firebase/firestore').Firestore} opts.db
 * @param {any} opts.auth     // not used here, kept for symmetry
 * @param {string} opts.sellerId
 */
export function attachInventoryWatcher({ db = getFirestore(), auth, sellerId }) {
  if (!sellerId) {
    console.warn('[Inventory] attachInventoryWatcher: missing sellerId')
    return () => {}
  }

  console.log(`[Inventory] Checking if business document exists for seller: ${sellerId}`)

  // ✅ CHECK if businesses document exists first
  checkBusinessDocumentExists(db, sellerId)
    .then(exists => {
      if (!exists) {
        console.log(`[Inventory] Business document not found for ${sellerId} - will retry`)
        // Retry after 2 seconds
        _businessCheckTimeout = setTimeout(() => {
          attachInventoryWatcher({ db, auth, sellerId })
        }, 2000)
        return
      }

      console.log(`[Inventory] Business document found - initializing watcher`)
      initializeWatcher(db, sellerId)
    })
    .catch(err => {
      console.error(`[Inventory] Error checking business document:`, err)
      // Retry on error
      _businessCheckTimeout = setTimeout(() => {
        attachInventoryWatcher({ db, auth, sellerId })
      }, 2000)
    })

  return _unsub || (() => {})
}

/**
 * ✅ CHECK if businesses document exists
 */
async function checkBusinessDocumentExists(db, sellerId) {
  try {
    const businessDoc = await getDoc(doc(db, 'businesses', sellerId))
    return businessDoc.exists()
  } catch (error) {
    console.error('[Inventory] Error checking business document:', error)
    throw error
  }
}

/**
 * ✅ Initialize the actual watcher (only after businesses doc confirmed)
 */
function initializeWatcher(db, sellerId) {
  // If already attached, detach old one
  if (_unsub) {
    try { _unsub(); } catch {}
    _unsub = null
  }

  // Clear any pending retry
  if (_businessCheckTimeout) {
    clearTimeout(_businessCheckTimeout)
    _businessCheckTimeout = null
  }

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

  return _unsub
}

/**
 * Detach the watcher if needed (e.g., on logout).
 */
export function detachInventoryWatcher() {
  if (_businessCheckTimeout) {
    clearTimeout(_businessCheckTimeout)
    _businessCheckTimeout = null
  }
  if (_unsub) {
    try { _unsub(); } catch {}
    _unsub = null
  }
}

/* ====================================================================== */
/* =====================  CORE STATUS HANDLER  ========================== */
/* ====================================================================== */

async function handleOrderStatusChange(db, order, sellerId) {
  const latestStatus = getLatestStatus(order)
  if (!latestStatus) return

  const cursor = order.inventoryCursor && typeof order.inventoryCursor === 'object'
    ? order.inventoryCursor[sellerId]
    : undefined

  if (cursor === latestStatus) {
    return
  }

  console.log(`[Inventory] Handling order ${order.id} → ${latestStatus} (prev: ${cursor ?? 'none'})`)

  const sellerItems = (order.products || []).filter(p => p?.sellerId === sellerId)
  if (!sellerItems.length) return

  if (latestStatus === 'to_ship') {
    await adjustAllItems(db, sellerItems, 'DEDUCT')
  } else if (latestStatus === 'cancelled') {
    await adjustAllItems(db, sellerItems, 'REIMBURSE')
  } else if (latestStatus === 'completed') {
    await addSalesAllItems(db, sellerItems)
  }

  try {
    const orderRef = doc(db, 'orders', order.id)
    await updateDoc(orderRef, {
      [`inventoryCursor.${sellerId}`]: latestStatus
    })
  } catch (e) {
    console.warn(`[Inventory] Could not write inventoryCursor for ${order.id}:`, e)
  }
}

/* ====================================================================== */
/* =======================  APPLY ADJUSTMENTS  ========================== */
/* ====================================================================== */

async function adjustAllItems(db, items, mode) {
  const isDeduct = mode === 'DEDUCT'
  const verb = isDeduct ? 'Deducted' : 'Reimbursed'

  await Promise.all(items.map(async (it) => {
    const productRef = doc(db, 'products', it.productId)
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(productRef)
      if (!snap.exists()) return

      const data = snap.data() || {}

      const hasVariants = Array.isArray(data.size) && Array.isArray(data.quantity)
      const orderQty = Number(it.quantity ?? 1) || 1

      if (hasVariants) {
        let idx = Number.isInteger(it.sizeIndex) ? it.sizeIndex : -1
        if (idx < 0 && it.size != null) {
          idx = (data.size || []).findIndex(s => String(s) === String(it.size))
        }
        if (idx < 0) {
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
        const current = Number(data.quantity ?? 0) || 0
        const next = isDeduct ? Math.max(0, current - orderQty) : current + orderQty

        tx.update(productRef, { quantity: next })
        console.log(`[Inventory] ${verb} ${orderQty} from product ${it.productId} → ${next}`)
      }
    })
  }))
}

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
