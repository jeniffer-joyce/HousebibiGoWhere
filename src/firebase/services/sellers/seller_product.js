// ============================================================================
// seller_product.js - UPDATED
// ============================================================================
// Public API (used by BusinessHomepage.vue & AddProductModal.vue):
//   - getSellerProducts()
//   - getSellerInfo(uid)
//   - createProduct(productData)
//   - getMyProduct(productId)
//   - updateMyProduct(productId, patch)
//   - deleteMyProduct(productId)
//   - initInventoryAuthBridge()
//   - ensureInventoryWatcher()
//   - startInventoryWatcherForCurrentSeller()
//   - stopInventoryWatcher()
//
// Changes:
//   • totalSales is now always retrieved from Firestore products collection
//   • Defaults to 0 if field doesn't exist
//   • createProduct now initializes totalSales: 0
// ============================================================================

import { auth, db } from '@/firebase/firebase_config'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

// ------------------- Auth helper -------------------
let _authReadyOnce
function waitForCurrentUser() {
  if (_authReadyOnce) return _authReadyOnce
  _authReadyOnce = new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub()
      resolve(user || null)
    })
  })
  return _authReadyOnce
}

// ------------------- Firestore helpers -------------------
async function fetchBusiness(uid) {
  const ref = doc(db, 'businesses', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

function toIso(val) {
  if (!val) return null
  try {
    if (val instanceof Date) return val.toISOString()
    if (val instanceof Timestamp) return val.toDate().toISOString()
    const d = new Date(val)
    if (!isNaN(d.getTime())) return d.toISOString()
  } catch {}
  return null
}

/**
 * Normalize image fields from any of:
 *   - img_url: string | string[]
 *   - images: string[]
 *   - additional_images: string[]
 * Returns { images[], thumbnail }
 */
function normalizeImages(data) {
  const merged = [
    ...(Array.isArray(data?.img_url) ? data.img_url : [data?.img_url]),
    ...(Array.isArray(data?.images) ? data.images : []),
    ...(Array.isArray(data?.additional_images) ? data.additional_images : []),
  ]
    .filter(Boolean)
    .map(String)

  // dedupe while preserving order
  const seen = new Set()
  const images = merged.filter((u) => (u && !seen.has(u) ? (seen.add(u), true) : false))

  const thumbnail = images[0] || ''
  return { images, thumbnail }
}

function normalizeNumberArray(val, fallback = 0) {
  if (Array.isArray(val)) return val.map((n) => Number(n) || 0)
  if (val === undefined || val === null) return [fallback]
  return [Number(val) || fallback]
}

function normalizeSize(val) {
  if (Array.isArray(val)) return val.map(String)
  if (val === undefined || val === null || val === '') return []
  return [String(val)]
}

// ------------------- Public: getSellerProducts -------------------
export async function getSellerProducts() {
  try {
    const user = await waitForCurrentUser()
    if (!user) return []

    const uid = user.uid
    const business = await fetchBusiness(uid)
    const sellerName = business?.name || 'Unknown Seller'

    const q = query(collection(db, 'products'), where('sellerId', '==', uid))
    const querySnapshot = await getDocs(q)

    const products = []
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() || {}
      const { images, thumbnail } = normalizeImages(data)

      products.push({
        id: docSnap.id,

        // Seller references
        sellerId: data.sellerId,
        sellerName,

        // Core fields
        item_name: data.item_name || '',
        description: data.description || '',
        category: data.category || '',
        availability: data.availability ?? true,

        // Timestamps
        createdAt: toIso(data.createdAt) || null,
        updatedAt: toIso(data.updatedAt) || null,

        // Variants
        price: normalizeNumberArray(data.price, 0),
        quantity: normalizeNumberArray(data.quantity, 0),
        size: normalizeSize(data.size),

        // Images
        images,
        thumbnail,
        img_url: thumbnail,
        imageSource: data.imageSource || '',

        // ⭐ ALWAYS retrieve totalSales from Firestore
        totalSales: Number(data.totalSales) || 0,
      })
    })

    return products
  } catch (error) {
    console.error('❌ getSellerProducts error:', error)
    throw error
  }
}

// ------------------- Public: getSellerInfo -------------------
export async function getSellerInfo(uid) {
  try {
    const ref = doc(db, 'businesses', uid)
    const snap = await getDoc(ref)
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch (error) {
    console.error('❌ getSellerInfo error:', error)
    throw error
  }
}

// ------------------- Public: createProduct -------------------
export async function createProduct(productData = {}) {
  try {
    const user = await waitForCurrentUser()
    if (!user) throw new Error('No authenticated user.')

    const uid = user.uid
    const business = await fetchBusiness(uid)
    const sellerName = business?.name || 'Unknown Seller'
    const sellerCategory = business?.category || 'uncategorized'

    // Merge primary + additional before normalizing so we always save images[]
    const mergedForSave = {
      images: [
        ...(Array.isArray(productData.img_url) ? productData.img_url : [productData.img_url]),
        ...(productData.additional_images || []),
      ].filter(Boolean),
    }
    const { images, thumbnail } = normalizeImages(mergedForSave)

    const payload = {
      ...productData,
      sellerId: uid,
      sellerName,
      category: productData.category || sellerCategory,
      createdAt: serverTimestamp(),
      availability: productData.availability ?? true,
      images,
      img_url: thumbnail, // keep single for legacy consumers
      totalSales: 0, // ⭐ Initialize totalSales to 0
    }

    if (typeof payload.item_name === 'string') payload.item_name = payload.item_name.trim()
    if (typeof payload.description === 'string') payload.description = payload.description.trim()
    if (typeof payload.category === 'string') payload.category = payload.category.trim().toLowerCase()

    const docRef = await addDoc(collection(db, 'products'), payload)
    return docRef.id
  } catch (error) {
    console.error('❌ createProduct error:', error)
    throw error
  }
}

// ============================================================================
// Product editing utilities
// ============================================================================

/** Ensure the product belongs to the current authenticated user. */
async function ensureOwnedProduct(productId) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not signed in')

  const ref = doc(db, 'products', String(productId))
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Product not found')

  const data = snap.data() || {}
  if (String(data.sellerId || '') !== uid) {
    throw new Error('Not authorized to update this product')
  }

  return { ref, snap, data }
}

/** Retrieve a single owned product (for edit modal prefill). */
export async function getMyProduct(productId) {
  const { snap } = await ensureOwnedProduct(productId)
  const data = snap.data() || {}
  
  return { 
    id: snap.id, 
    ...data,
    totalSales: Number(data.totalSales) || 0  // ⭐ Ensure totalSales is included
  }
}

/** Update one owned product – partial updates allowed. */
export async function updateMyProduct(productId, patch = {}) {
  const { ref } = await ensureOwnedProduct(productId)
  const clean = {}

  // Simple direct fields
  const simpleKeys = ['item_name', 'description', 'category', 'availability', 'imageSource']
  for (const k of simpleKeys) {
    if (k in patch) clean[k] = patch[k]
  }

  // Variant arrays
  if ('size' in patch) clean.size = patch.size ?? null
  if ('price' in patch) clean.price = patch.price
  if ('quantity' in patch) clean.quantity = patch.quantity

  // ⭐ Allow totalSales to be updated (though usually managed by inventory system)
  if ('totalSales' in patch) {
    clean.totalSales = Number(patch.totalSales) || 0
  }

  // Images: accept either (img_url + additional_images) or productImages[]
  if (Array.isArray(patch.productImages)) {
    const [primary, ...rest] = patch.productImages.filter(Boolean)
    clean.img_url = primary || ''
    clean.additional_images = rest
    // Also keep a normalized images[] for consistency
    const { images } = normalizeImages({ img_url: primary, additional_images: rest })
    clean.images = images
  } else {
    if ('img_url' in patch || 'additional_images' in patch) {
      const primary = patch.img_url || ''
      const rest = patch.additional_images || []
      clean.img_url = primary
      clean.additional_images = rest
      const { images } = normalizeImages({ img_url: primary, additional_images: rest })
      clean.images = images
    }
  }

  // Always stamp updatedAt
  clean.updatedAt = serverTimestamp()

  if (Object.keys(clean).length === 0) return false

  await updateDoc(ref, clean)
  return true
}

/** Delete a product owned by the current seller. */
export async function deleteMyProduct(productId) {
  const { ref } = await ensureOwnedProduct(productId)
  await deleteDoc(ref)
  return true
}

// ============================================================================
// Inventory bridge (LAZY-LOADED, opt-in, no auto side-effects)
// ============================================================================

let _invModuleLoaded = false
let _invUnsub = null
let _attachFn = null
let _detachFn = null

async function _ensureInventoryModule() {
  if (_invModuleLoaded) return true
  try {
    const mod = await import('./inventory_management.js')
    _attachFn = mod?.attachInventoryWatcher ?? null
    _detachFn = mod?.detachInventoryWatcher ?? null
    _invModuleLoaded = true
    if (!_attachFn) {
      console.warn('[seller_product] inventory_management.js loaded but attachInventoryWatcher missing')
    }
    return true
  } catch (e) {
    console.warn('[seller_product] Could not load inventory_management.js:', e)
    _invModuleLoaded = false
    return false
  }
}

/**
 * Start live inventory watcher for the current seller (idempotent).
 * Safe no-op if module missing or already running.
 */
export async function startInventoryWatcherForCurrentSeller() {
  try {
    const user = auth?.currentUser
    if (!user?.uid) return
    if (_invUnsub) return // already attached

    const ok = await _ensureInventoryModule()
    if (!ok || !_attachFn) return

    _invUnsub = _attachFn({ db, auth, sellerId: user.uid })
    console.log('[seller_product] Inventory watcher attached for', user.uid)
  } catch (e) {
    console.error('[seller_product] startInventoryWatcherForCurrentSeller failed:', e)
  }
}

/** Stop the live inventory watcher (idempotent). */
export function stopInventoryWatcher() {
  try {
    if (_invUnsub) {
      try { _invUnsub() } catch {}
      _invUnsub = null
    }
    if (_detachFn) {
      try { _detachFn() } catch {}
    }
    console.log('[seller_product] Inventory watcher detached')
  } catch (e) {
    console.error('[seller_product] stopInventoryWatcher failed:', e)
  }
}

/**
 * Bridge auth → watcher. Call once (e.g., in a page's onMounted).
 *
 * Usage in your Vue:
 *   import { initInventoryAuthBridge } from '@/firebase/services/sellers/seller_product'
 *   onMounted(() => { initInventoryAuthBridge() })
 *
 * Returns an unsubscribe to clean up manually if you want.
 */
export function initInventoryAuthBridge() {
  if (!auth) {
    console.warn('[seller_product] initInventoryAuthBridge called before auth ready.')
    return () => {}
  }

  // Detach any previous watcher (useful during HMR)
  stopInventoryWatcher()

  const unsub = onAuthStateChanged(auth, async (user) => {
    stopInventoryWatcher()
    if (user?.uid) {
      await startInventoryWatcherForCurrentSeller()
    }
  })

  return () => {
    try { unsub?.() } catch {}
    stopInventoryWatcher()
  }
}

/** Ensure watcher is running for the current user (idempotent). */
export async function ensureInventoryWatcher() {
  const user = auth?.currentUser
  if (!user?.uid) return
  if (_invUnsub) return
  await startInventoryWatcherForCurrentSeller()
}