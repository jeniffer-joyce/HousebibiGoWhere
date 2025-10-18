// ============================================================================
// seller_info.js
// ============================================================================
// Handles authenticated seller data logic in Firestore.
//
// This file watches Firebase Auth and automatically syncs the signed-in user's
// document from the `/users` collection with a corresponding document in
// `/seller_account`.
//
// Core Features:
// - Auto-load the current signed-in user's Firestore `/users/{uid}` document.
// - Auto-create `/seller_account/{uid}` if it does not exist.
// - Auto-sync key fields (e.g., name, address, logo, etc.).
// - Auto-copy `createdAt` from `/users` to `/seller_account`.
// - Auto-patch missing `createdAt` on existing accounts.
//
// ============================================================================

import { auth, db } from "../../firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---------------------------------------------------------------------------
// INTERNAL STATE VARIABLES
// ---------------------------------------------------------------------------
// These are private module-level variables used to store the current user's
// UID, user document, and seller account document while the app is running.
let _currentUid = null;               // Firebase Auth UID of current user
let _currentSeller = null;            // Cached /users/{uid} document
let _currentSellerAccount = null;     // Cached /seller_account/{uid} document
let _authInited = false;              // Ensures auth watcher initializes only once
let _unsubAuth = null;                // Reference to the onAuthStateChanged listener

// ---------------------------------------------------------------------------
// AUTH READY PROMISE HANDLER
// ---------------------------------------------------------------------------
// Ensures that code waits until Firebase Auth finishes initialization
// before fetching Firestore data (important for SSR or delayed auth states).
let _authReady = false;
const _waiters = [];
function _resolveReady() {
  if (_authReady) return;
  _authReady = true;
  while (_waiters.length) _waiters.shift()?.();
}

/**
 * Returns a promise that resolves once Firebase Auth has finished loading.
 * Useful for components that need to wait for user auth state.
 */
export function waitForAuthReady() {
  if (_authReady) return Promise.resolve();
  return new Promise((res) => _waiters.push(res));
}

// ---------------------------------------------------------------------------
// UTILITY HELPERS
// ---------------------------------------------------------------------------

/**
 * Normalizes a Firestore document snapshot into a plain JS object
 * and converts `createdAt` (Timestamp) into a JS Date.
 */
function normalizeDocSnap(snap) {
  if (!snap || !snap.exists()) return null;
  const data = snap.data() || {};
  const createdAt =
    data.createdAt && typeof data.createdAt.toDate === "function"
      ? data.createdAt.toDate()
      : data.createdAt ?? null;
  return { id: snap.id, ...data, createdAt };
}

/**
 * Fetches the signed-in user's document from the `/users` collection.
 */
async function fetchSeller(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return normalizeDocSnap(snap);
}

/**
 * Fetches the user's seller account document from `/seller_account`.
 */
async function fetchSellerAccount(uid) {
  const snap = await getDoc(doc(db, "seller_account", uid));
  return normalizeDocSnap(snap);
}

/**
 * Maps data from `/users/{uid}` into the payload structure used by
 * `/seller_account/{uid}`. This ensures consistent field naming.
 */
function mapUserToSellerAccountPayload(userDoc, { isNew }) {
  const name =
    userDoc?.companyName ||
    userDoc?.displayName ||
    userDoc?.username ||
    "";

  const logo = userDoc?.logo || "";
  const address = userDoc?.addressLine || "";

  return {
    uid: userDoc?.id || userDoc?.uid || null,
    name,
    verified: true,                   // Always true (verified seller)
    account_type: "seller",
    uen: userDoc?.uen || "",
    rating: isNew ? 0 : undefined,    // Default rating for new sellers
    bio: isNew ? "" : undefined,      // Default empty bio for new sellers
    logo,
    address,
    products: isNew ? [] : undefined, // Initialize empty product list
    createdAt: userDoc?.createdAt || null, // Copy original account creation date
  };
}

// ---------------------------------------------------------------------------
// AUTH STATE WATCHER
// ---------------------------------------------------------------------------
// Watches Firebase Auth to detect when a user logs in or out.
// When logged in, it preloads the `/users/{uid}` Firestore document.

function initAuthWatcher() {
  if (_authInited) return;
  _authInited = true;

  _unsubAuth = onAuthStateChanged(auth, async (user) => {
    const newUid = user?.uid || null;

    // Reset cache if the user changes
    if (newUid !== _currentUid) {
      _currentUid = newUid;
      _currentSeller = null;
      _currentSellerAccount = null;
    }

    // Load /users doc when signed in
    if (_currentUid) {
      try {
        _currentSeller = await fetchSeller(_currentUid);
      } catch {
        _currentSeller = null;
      }
    }

    _resolveReady();
  });
}
initAuthWatcher();

// ---------------------------------------------------------------------------
// PUBLIC API FUNCTIONS
// ---------------------------------------------------------------------------

/**
 * Returns the UID of the currently signed-in Firebase user.
 */
export function getCurrentUid() {
  return _currentUid;
}

/**
 * Returns the current user's `/users/{uid}` document.
 * - Uses cache if available.
 * - Refetches if cache is missing.
 */
export async function getCurrentSeller() {
  await waitForAuthReady();
  if (!_currentUid) return null;
  if (_currentSeller) return _currentSeller;
  _currentSeller = await fetchSeller(_currentUid);
  return _currentSeller;
}

/**
 * Ensures `/seller_account/{uid}` exists for the current user.
 *
 * Behavior:
 * - If missing: creates a new seller account document using `/users/{uid}` data.
 * - If existing: updates key fields (name, logo, address, etc.) to match the user doc.
 * - Auto-copies `createdAt` from `/users/{uid}` if missing in seller_account.
 */
export async function ensureCurrentSellerAccount() {
  await waitForAuthReady();
  if (!_currentUid) return null;

  const userDoc = await getCurrentSeller();
  if (!userDoc) return null;

  const accountRef = doc(db, "seller_account", _currentUid);
  const existingSnap = await getDoc(accountRef);
  const exists = existingSnap.exists();

  // -----------------------------------------------------
  // 1️⃣ Create a new seller_account document if missing
  // -----------------------------------------------------
  if (!exists) {
    const payload = mapUserToSellerAccountPayload(userDoc, { isNew: true });
    await setDoc(accountRef, payload, { merge: false });
    _currentSellerAccount = normalizeDocSnap(await getDoc(accountRef));
    return _currentSellerAccount;
  }

  // -----------------------------------------------------
  // 2️⃣ Update existing document and ensure createdAt field
  // -----------------------------------------------------
  const existing = normalizeDocSnap(existingSnap);
  const updatePayload = mapUserToSellerAccountPayload(userDoc, { isNew: false });

  // If createdAt missing, patch it from userDoc
  if (!existing.createdAt && userDoc.createdAt)
    updatePayload.createdAt = userDoc.createdAt;

  // Remove undefined keys before updating
  Object.keys(updatePayload).forEach((k) => updatePayload[k] === undefined && delete updatePayload[k]);

  await updateDoc(accountRef, updatePayload);
  _currentSellerAccount = normalizeDocSnap(await getDoc(accountRef));
  return _currentSellerAccount;
}

/**
 * Returns `/seller_account/{uid}` for the current user.
 * - Fetches from cache if available.
 * - If missing, automatically calls `ensureCurrentSellerAccount()` to create it.
 * - Also patches `createdAt` if missing on existing docs.
 */
export async function getCurrentSellerAccount() {
  await waitForAuthReady();
  if (!_currentUid) return null;

  // Serve cached version if already available
  if (_currentSellerAccount) return _currentSellerAccount;

  // Fetch from Firestore
  const existing = await fetchSellerAccount(_currentUid);
  if (existing) {
    // Patch missing createdAt if necessary
    const userDoc = await getCurrentSeller();
    if (!existing.createdAt && userDoc?.createdAt) {
      await updateDoc(doc(db, "seller_account", _currentUid), {
        createdAt: userDoc.createdAt,
      });
      existing.createdAt = userDoc.createdAt;
    }
    _currentSellerAccount = existing;
    return _currentSellerAccount;
  }

  // If seller_account doesn't exist → create it
  return await ensureCurrentSellerAccount();
}

/**
 * Stops the Firebase Auth watcher.
 * (Not typically needed unless app teardown is manual.)
 */
export function stopAuthWatcher() {
  if (_unsubAuth) {
    _unsubAuth();
    _unsubAuth = null;
    _authInited = false;
  }
}
    