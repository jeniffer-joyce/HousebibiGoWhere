// ============================================================================
// products.js
// ============================================================================
// Fetches and manages products belonging to the currently authenticated seller.
//
// Logic:
// - Uses the signed-in seller's UID (from Auth / seller_account) to filter
//   Firestore products collection.
// - Automatically injects the seller's display name from seller_account.
// - Handles both Version A (array-based price/quantity/size) and Version B
//   (single-value price/quantity/size) structures.
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
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth } from "../../firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Waits for Firebase Auth to resolve the current user before proceeding.
 */
function waitForCurrentUser() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user || null);
    });
  });
}

/**
 * Fetches seller account info from `/seller_account/{uid}` to get sellerName.
 */
async function fetchSellerAccount(uid) {
  const ref = doc(db, "seller_account", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ---------------------------------------------------------------------------
// Public Functions
// ---------------------------------------------------------------------------

/**
 * getSellerProducts()
 * -------------------
 * Fetches all products belonging to the currently logged-in seller.
 * Automatically filters using the sellerId from Auth.
 */
export async function getSellerProducts() {
  console.log("🔍 Fetching products for current seller...");

  try {
    // 1️⃣ Wait for current user auth
    const user = await waitForCurrentUser();
    if (!user) {
      console.warn("⚠️ No authenticated user found.");
      return [];
    }

    const uid = user.uid;

    // 2️⃣ Get seller info (name, etc.) from seller_account
    const sellerAccount = await fetchSellerAccount(uid);
    const sellerName = sellerAccount?.name || "Unknown Seller";

    // 3️⃣ Query products where sellerId == uid
    const q = query(collection(db, "products"), where("sellerId", "==", uid));
    const querySnapshot = await getDocs(q);

    console.log(`✅ Found ${querySnapshot.size} products for seller: ${sellerName}`);

    // 4️⃣ Normalize each product doc into a friendly structure
    const products = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      products.push({
        id: docSnap.id,
        sellerId: data.sellerId,
        sellerName, // from seller_account
        item_name: data.item_name || "",
        description: data.description || "",
        category: data.category || "",
        img_url: data.img_url || "",
        imageSource: data.imageSource || "",
        availability: data.availability ?? true,
        createdAt: data.createdAt || null,

        // Handle both Version A (arrays) and Version B (single values)
        price: Array.isArray(data.price) ? data.price : [data.price ?? 0],
        quantity: Array.isArray(data.quantity) ? data.quantity : [data.quantity ?? 0],
        size: Array.isArray(data.size) ? data.size : (data.size ? [data.size] : []),
      });
    });

    console.log("📦 Loaded products:", products);
    return products;
  } catch (error) {
    console.error("❌ Error loading products:", error);
    throw error;
  }
}

/**
 * getSellerInfo()
 * ----------------
 * Fetches a specific seller_account document by UID.
 * Useful when you only need seller profile data (not products).
 */
export async function getSellerInfo(uid) {
  try {
    const ref = doc(db, "seller_account", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (error) {
    console.error("❌ Error fetching seller info:", error);
    throw error;
  }
}

/**
 * createProduct()
 * ----------------
 * Adds a new product to Firestore and auto-injects sellerId + sellerName
 * from the authenticated seller's account.
 */
export async function createProduct(productData) {
  console.log("📝 Creating new product in Firestore...");

  try {
    // 1️⃣ Get current user
    const user = await waitForCurrentUser();
    if (!user) throw new Error("No authenticated user.");

    const uid = user.uid;

    // 2️⃣ Get seller info for name reference
    const sellerAccount = await fetchSellerAccount(uid);
    const sellerName = sellerAccount?.name || "Unknown Seller";

    // 3️⃣ Merge product data with seller references
    const payload = {
      ...productData,
      sellerId: uid,
      sellerName,
      createdAt: new Date().toISOString(),
    };

    // 4️⃣ Add to Firestore
    const docRef = await addDoc(collection(db, "products"), payload);
    console.log("✅ Product created with ID:", docRef.id);

    return docRef.id;
  } catch (error) {
    console.error("❌ Error creating product:", error);
    throw error;
  }
}
