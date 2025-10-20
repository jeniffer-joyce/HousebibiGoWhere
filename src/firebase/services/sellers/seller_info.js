// ============================================================================
// seller_info.js
// ============================================================================
// Current-authenticated seller data & business sync:
// - Load /users/{uid}
// - Ensure /businesses/{uid} (create if missing, otherwise update mirrored fields)
// - Adds/maintains: profilePic default, createdAt copy, and NEW business fields:
//     category (default: 'home-decor')
//     description (default: null)
//     featured (auto: rating > 4 ? true : false)
//     followers (default: 0 on create)
//     following (default: 0 on create)
// - Backward compatible: exported function names remain the same
//   (getCurrentSellerAccount now returns /businesses/{uid})
// ============================================================================

import { auth, db } from "../../firebase_config.js";
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

// ---------- Internal state ----------
let _currentUid = null;
let _currentSeller = null;        // /users/{uid} (normalized)
let _currentBusiness = null;      // /businesses/{uid} (normalized)
let _authInited = false;
let _unsubAuth = null;

// ---------- Auth readiness gate ----------
let _authReady = false;
const _waiters = [];
function _resolveReady() {
  if (_authReady) return;
  _authReady = true;
  while (_waiters.length) _waiters.shift()?.();
}
export function waitForAuthReady() {
  if (_authReady) return Promise.resolve();
  return new Promise((res) => _waiters.push(res));
}

// ---------- Utils ----------
function normalizeDocSnap(snap) {
  if (!snap || !snap.exists()) return null;
  const data = snap.data() || {};
  const createdAt =
    data.createdAt && typeof data.createdAt.toDate === "function"
      ? data.createdAt.toDate()
      : data.createdAt ?? null;
  return { id: snap.id, ...data, createdAt };
}

async function fetchUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return normalizeDocSnap(snap);
}
async function fetchBusiness(uid) {
  const snap = await getDoc(doc(db, "businesses", uid));
  return normalizeDocSnap(snap);
}

function computeFeatured(ratingValue) {
  const num = Number(ratingValue);
  return Number.isFinite(num) && num > 4;
}

/**
 * Map /users -> /businesses payload.
 * - Adds default profilePic if none present
 * - NEW fields initialized on create:
 *   category='home-decor', description=null, followers=0, following=0
 * - featured is auto derived (rating > 4)
 * - Only sets rating/bio/followers/following on creation (preserves if existing)
 */
function mapUserToBusinessPayload(userDoc, { isNew }) {
  const name =
    userDoc?.companyName ||
    userDoc?.displayName ||
    userDoc?.username ||
    "";

  const address = userDoc?.addressLine || "";

  const defaultProfilePic = "/avatar.png";
  const profilePic =
    userDoc?.profilePic ||
    userDoc?.photoURL ||
    userDoc?.logo ||
    defaultProfilePic;

  const rating = isNew ? 0 : undefined;
  const bio = isNew ? "" : undefined;
  const followers = isNew ? 0 : undefined;
  const following = isNew ? 0 : undefined;

  return {
    uid: userDoc?.id || userDoc?.uid || null,
    name,
    verified: true,
    account_type: "seller",
    uen: userDoc?.uen || "",
    address,
    profilePic,
    createdAt: userDoc?.createdAt || null, // copy from /users

    // Optional profile fields (only on create)
    rating,
    bio,

    // NEW business fields
    category: isNew ? "none" : undefined,
    description: isNew ? "" : undefined,
    followers,
    following,

    // featured computed outside using computeFeatured
    featured: undefined,
  };
}

// ---------- Auth watcher (auto-start) ----------
function initAuthWatcher() {
  if (_authInited) return;
  _authInited = true;

  _unsubAuth = onAuthStateChanged(auth, async (user) => {
    const newUid = user?.uid || null;

    if (newUid !== _currentUid) {
      _currentUid = newUid;
      _currentSeller = null;
      _currentBusiness = null;
    }

    if (_currentUid) {
      try {
        _currentSeller = await fetchUser(_currentUid);
      } catch {
        _currentSeller = null;
      }
    }

    _resolveReady();
  });
}
initAuthWatcher();

// ---------- Public API ----------
/** Return current Firebase Auth UID (or null). */
export function getCurrentUid() {
  return _currentUid;
}

/** Return /users/{uid} (cached or fetched). Null if signed out or missing. */
export async function getCurrentSeller() {
  await waitForAuthReady();
  if (!_currentUid) return null;
  if (_currentSeller) return _currentSeller;
  _currentSeller = await fetchUser(_currentUid);
  return _currentSeller;
}

/**
 * Ensure /businesses/{uid} exists and mirrors user fields.
 * - Create if missing with defaults (rating=0, bio="", followers=0, following=0,
 *   category='home-decor', description=null, profilePic default)
 * - Update lightweight fields if exists; patch createdAt/profilePic if missing
 * - featured is auto-updated based on rating (>4 => true)
 */
export async function ensureCurrentSellerAccount() {
  // NOTE: kept the function name for backwards compatibility
  await waitForAuthReady();
  if (!_currentUid) return null;

  const userDoc = await getCurrentSeller();
  if (!userDoc) return null;

  const businessRef = doc(db, "businesses", _currentUid);
  const existingSnap = await getDoc(businessRef);

  if (!existingSnap.exists()) {
    const payload = mapUserToBusinessPayload(userDoc, { isNew: true });
    payload.featured = computeFeatured(payload.rating ?? 0);
    await setDoc(businessRef, payload, { merge: false });
    _currentBusiness = normalizeDocSnap(await getDoc(businessRef));
    return _currentBusiness;
  }

  const existing = normalizeDocSnap(existingSnap);
  const updatePayload = mapUserToBusinessPayload(userDoc, { isNew: false });

  // Patch missing createdAt/profilePic
  if (!existing.createdAt && userDoc.createdAt) updatePayload.createdAt = userDoc.createdAt;
  if (!existing.profilePic && updatePayload.profilePic) updatePayload.profilePic = updatePayload.profilePic;

  // Recompute featured based on effective rating
  const effectiveRating =
    typeof existing.rating !== "undefined" ? existing.rating : (updatePayload.rating ?? 0);
  updatePayload.featured = computeFeatured(effectiveRating);

  // Remove undefined keys (avoid clobbering)
  Object.keys(updatePayload).forEach((k) => updatePayload[k] === undefined && delete updatePayload[k]);

  await updateDoc(businessRef, updatePayload);
  _currentBusiness = normalizeDocSnap(await getDoc(businessRef));
  return _currentBusiness;
}

/** Get /businesses/{uid} (ensure exists; auto-patch missing createdAt/profilePic; auto-featured). */
export async function getCurrentSellerAccount() {
  // NOTE: kept the function name for backwards compatibility
  await waitForAuthReady();
  if (!_currentUid) return null;

  if (_currentBusiness) return _currentBusiness;

  const existing = await fetchBusiness(_currentUid);
  if (existing) {
    const userDoc = await getCurrentSeller();
    const patch = {};

    if (!existing.createdAt && userDoc?.createdAt) patch.createdAt = userDoc.createdAt;

    if (!existing.profilePic) {
      const defaultProfilePic = "/avatar.png";
      patch.profilePic =
        existing.profilePic ||
        userDoc?.profilePic ||
        userDoc?.photoURL ||
        userDoc?.logo ||
        defaultProfilePic;
    }

    if (typeof existing.rating !== "undefined") {
      const shouldBe = computeFeatured(existing.rating);
      if (existing.featured !== shouldBe) patch.featured = shouldBe;
    }

    if (Object.keys(patch).length) {
      await updateDoc(doc(db, "businesses", _currentUid), patch);
      Object.assign(existing, patch);
    }

    _currentBusiness = existing;
    return _currentBusiness;
  }

  // Not found → create from /users
  return await ensureCurrentSellerAccount();
}

/** Stop the auth watcher (rarely needed). */
export function stopAuthWatcher() {
  if (_unsubAuth) {
    _unsubAuth();
    _unsubAuth = null;
    _authInited = false;
  }
}
