// ============================================================================
// seller_product.js
// ============================================================================
// Public API (unchanged for BusinessHomepage.vue):
//   - getSellerProducts()
//   - getSellerInfo(uid)
//   - createProduct(productData)
//
// Collection changes:
//   • seller name now comes from `/businesses/{uid}`
//   • products remain in `/products` filtered by sellerId == uid
//   • Normalizes images, timestamps, price/quantity/size arrays
// ============================================================================

import { db } from '../../firebase_config.js';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth } from "../../firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ------------------- Auth helper -------------------
let _authReadyOnce;
function waitForCurrentUser() {
  if (_authReadyOnce) return _authReadyOnce;
  _authReadyOnce = new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user || null);
    });
  });
  return _authReadyOnce;
}

// ------------------- Firestore helpers -------------------
async function fetchBusiness(uid) {
  const ref = doc(db, "businesses", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

function toIso(val) {
  if (!val) return null;
  try {
    if (val instanceof Date) return val.toISOString();
    if (val instanceof Timestamp) return val.toDate().toISOString();
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return null;
}

function normalizeImages(data) {
  let images = [];
  if (Array.isArray(data?.img_url)) images = data.img_url.filter(Boolean);
  else if (Array.isArray(data?.images)) images = data.images.filter(Boolean);
  else if (typeof data?.img_url === 'string' && data.img_url.trim()) images = [data.img_url.trim()];
  const thumbnail = images[0] || "";
  return { images, thumbnail };
}
function normalizeNumberArray(val, fallback = 0) {
  if (Array.isArray(val)) return val.map(n => Number(n) || 0);
  if (val === undefined || val === null) return [fallback];
  return [Number(val) || fallback];
}
function normalizeSize(val) {
  if (Array.isArray(val)) return val.map(String);
  if (val === undefined || val === null || val === '') return [];
  return [String(val)];
}

// ------------------- Public: getSellerProducts -------------------
export async function getSellerProducts() {
  try {
    const user = await waitForCurrentUser();
    if (!user) return [];

    const uid = user.uid;
    const business = await fetchBusiness(uid);
    const sellerName = business?.name || "Unknown Seller";

    const q = query(collection(db, "products"), where("sellerId", "==", uid));
    const querySnapshot = await getDocs(q);

    const products = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() || {};
      const { images, thumbnail } = normalizeImages(data);

      products.push({
        id: docSnap.id,

        // Seller references
        sellerId: data.sellerId,
        sellerName,

        // Core fields
        item_name: data.item_name || "",
        description: data.description || "",
        category: data.category || "",       // slug expected
        availability: data.availability ?? true,

        // Timestamps (ISO)
        createdAt: toIso(data.createdAt) || null,

        // Arrays for variants
        price: normalizeNumberArray(data.price, 0),
        quantity: normalizeNumberArray(data.quantity, 0),
        size: normalizeSize(data.size),

        // Images normalized
        images,
        thumbnail,
        img_url: thumbnail, // legacy single
        imageSource: data.imageSource || "",
      });
    });

    return products;
  } catch (error) {
    console.error("❌ getSellerProducts error:", error);
    throw error;
  }
}

// ------------------- Public: getSellerInfo -------------------
/** Read `/businesses/{uid}`. */
export async function getSellerInfo(uid) {
  try {
    const ref = doc(db, "businesses", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (error) {
    console.error("❌ getSellerInfo error:", error);
    throw error;
  }
}

// ------------------- Public: createProduct -------------------
/**
 * Create a new product for the current seller.
 * Accepts productData with:
 *   - img_url: string | string[]
 *   - images: string[]
 * Writes both `images[]` and `img_url` (thumbnail) for compatibility.
 */
export async function createProduct(productData = {}) {
  try {
    const user = await waitForCurrentUser();
    if (!user) throw new Error("No authenticated user.");

    const uid = user.uid;

    const business = await fetchBusiness(uid);
    const sellerName = business?.name || "Unknown Seller";
    const sellerCategory = business?.category || "uncategorized";  // ← ADD THIS


    const { images, thumbnail } = normalizeImages(productData);

    const payload = {
      ...productData,
      sellerId: uid,
      sellerName,
      category: productData.category || sellerCategory,  // ← ADD THIS (uses passed category or defaults to seller's)
      createdAt: serverTimestamp(),
      availability: productData.availability ?? true,
      images,
      img_url: thumbnail,
    };

    if (typeof payload.item_name === 'string') payload.item_name = payload.item_name.trim();
    if (typeof payload.description === 'string') payload.description = payload.description.trim();
    if (typeof payload.category === 'string') payload.category = payload.category.trim().toLowerCase();

    const docRef = await addDoc(collection(db, "products"), payload);
    return docRef.id;
  } catch (error) {
    console.error("❌ createProduct error:", error);
    throw error;
  }
}
