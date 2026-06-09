/**
 * @fileoverview Firestore data layer — footprint persistence.
 *
 * Design decisions:
 *  - All writes use anonymous Firebase UIDs (never PII)
 *  - In-memory mock for demo mode (no Firebase configured)
 *  - All async operations are wrapped in try/catch — callers always get a result
 *  - Timestamps use serverTimestamp() for tamper-proof ordering
 *
 * @module services/firestore
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

// ─── In-memory mock store (demo mode) ────────────────────────────────────────
/** @type {Array<Object>} */
const _mockStore = [];

// ─── Footprint ────────────────────────────────────────────────────────────────

/**
 * Persist a footprint record for an anonymous user session.
 *
 * Security: userId must always be a Firebase anonymous UID.
 *           Never pass raw user data (name, email, IP) as userId.
 *
 * @param {string} userId        - Firebase anonymous UID (e.g. "abc123xyz")
 * @param {Object} data
 * @param {number} data.total    - Monthly CO₂e kg
 * @param {Object} data.breakdown - Per-category kg values
 * @param {Object} data.inputs   - Raw survey inputs (no PII)
 * @returns {Promise<{id: string|null, success: boolean, error?: string}>}
 */
export async function saveFootprint(userId, data) {
  if (!isFirebaseConfigured) {
    const doc = { id: `demo_${Date.now()}`, userId, ...data, ts: Date.now() };
    _mockStore.push(doc);
    console.info('[Firestore DEMO] Saved footprint:', doc.id);
    return { id: doc.id, success: true };
  }

  try {
    const ref = await addDoc(collection(db, 'footprints'), {
      userId,
      total: data.total,
      breakdown: data.breakdown,
      inputs: data.inputs,
      ts: serverTimestamp(),
    });
    return { id: ref.id, success: true };
  } catch (err) {
    console.error('[Firestore] saveFootprint failed:', err.message);
    return { id: null, success: false, error: err.message };
  }
}

/**
 * Retrieve the most recent footprint records for a user (max 10).
 *
 * @param {string} userId - Firebase anonymous UID
 * @returns {Promise<Array<Object>>} Ordered newest-first
 */
export async function getFootprintHistory(userId) {
  if (!isFirebaseConfigured) {
    return _mockStore
      .filter((d) => d.userId === userId)
      .slice(-10)
      .reverse();
  }

  try {
    const q = query(
      collection(db, 'footprints'),
      where('userId', '==', userId),
      orderBy('ts', 'desc'),
      limit(10),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[Firestore] getFootprintHistory failed:', err.message);
    return [];
  }
}

// ─── Pledges ──────────────────────────────────────────────────────────────────

/**
 * Save a 30-day challenge pledge for a user.
 *
 * @param {string}   userId   - Firebase anonymous UID
 * @param {string[]} pledges  - Array of challenge action strings (max 10)
 * @returns {Promise<{id: string|null, success: boolean}>}
 */
export async function savePledge(userId, pledges) {
  // Input guard: prevent storing huge payloads
  const safePledges = pledges.slice(0, 10).map((p) => String(p).slice(0, 200));

  if (!isFirebaseConfigured) {
    console.info('[Firestore DEMO] Pledge saved:', safePledges);
    return { id: `pledge_${Date.now()}`, success: true };
  }

  try {
    const ref = await addDoc(collection(db, 'pledges'), {
      userId,
      pledges: safePledges,
      ts: serverTimestamp(),
    });
    return { id: ref.id, success: true };
  } catch (err) {
    console.error('[Firestore] savePledge failed:', err.message);
    return { id: null, success: false };
  }
}
