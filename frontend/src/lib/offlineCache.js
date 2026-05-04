/**
 * offlineCache.js
 * localStorage-based cache for Supabase data + offline action queue.
 * Keys:
 *   oc_purchases   — { [userId]: purchases[] }
 *   oc_progress    — { [userId_programId]: progress[] }
 *   oc_custom      — { [programId]: planData }
 *   oc_queue       — [{ type, payload, ts }]
 */

const read = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? null; } catch { return null; }
};
const write = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

// ── Purchases ─────────────────────────────────────────────────────────────────
export const cachePurchases = (userId, data) => {
  const all = read('oc_purchases') || {};
  write('oc_purchases', { ...all, [userId]: data });
};
export const getCachedPurchases = (userId) =>
  (read('oc_purchases') || {})[userId] ?? null;

// ── Progress ──────────────────────────────────────────────────────────────────
export const cacheProgress = (userId, programId, data) => {
  const key = `${userId}__${programId}`;
  const all = read('oc_progress') || {};
  write('oc_progress', { ...all, [key]: data });
};
export const getCachedProgress = (userId, programId) => {
  const key = `${userId}__${programId}`;
  return (read('oc_progress') || {})[key] ?? null;
};

// ── Custom Plans ──────────────────────────────────────────────────────────────
export const cacheCustomPlan = (programId, data) => {
  const all = read('oc_custom') || {};
  write('oc_custom', { ...all, [programId]: data });
};
export const getCachedCustomPlan = (programId) =>
  (read('oc_custom') || {})[programId] ?? null;

// ── Offline Action Queue ──────────────────────────────────────────────────────
export const enqueueOfflineAction = (action) => {
  const q = read('oc_queue') || [];
  q.push({ ...action, ts: Date.now() });
  write('oc_queue', q);
};
export const getOfflineQueue = () => read('oc_queue') || [];
export const clearOfflineQueue = () => localStorage.removeItem('oc_queue');
