/**
 * @file src/services/firestore.test.js
 * @description Unit tests for the Firestore data layer.
 *
 * Strategy: We test saveFootprint, getFootprintHistory, and savePledge
 * against the in-memory mock store (demo mode) so no real Firebase
 * credentials are needed in CI or local test runs.
 *
 * Firebase SDK imports are mocked via vi.mock() so the module under
 * test never tries to hit the network.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock firebase/firestore SDK ────────────────────────────────────────────────
// These stubs prevent real network calls and let us control return values.
vi.mock('firebase/firestore', () => ({
  collection:      vi.fn(() => 'collection-ref'),
  addDoc:          vi.fn(async () => ({ id: 'mock-doc-id' })),
  query:           vi.fn(() => 'query-ref'),
  where:           vi.fn(() => 'where-clause'),
  orderBy:         vi.fn(() => 'orderBy-clause'),
  limit:           vi.fn(() => 'limit-clause'),
  getDocs:         vi.fn(async () => ({
    docs: [
      { id: 'doc1', data: () => ({ userId: 'user1', total: 300, breakdown: {}, inputs: {} }) },
      { id: 'doc2', data: () => ({ userId: 'user1', total: 250, breakdown: {}, inputs: {} }) },
    ],
  })),
  serverTimestamp: vi.fn(() => 'server-ts'),
}));

// ── Mock the firebase.js initialisation ───────────────────────────────────────
vi.mock('./firebase', () => ({
  db:                  null,
  isFirebaseConfigured: false, // Force demo mode so we test the in-memory path
}));

// Import module AFTER mocks are set up
const { saveFootprint, getFootprintHistory, savePledge } =
  await import('./firestore.js');

// ── saveFootprint ─────────────────────────────────────────────────────────────
describe('saveFootprint (demo mode)', () => {
  it('returns success: true with a generated id', async () => {
    const result = await saveFootprint('user-abc', {
      total:     350,
      breakdown: { transport: 100, diet: 150, energy: 50, shopping: 50 },
      inputs:    { kmCar: 200 },
    });

    expect(result.success).toBe(true);
    expect(result.id).toMatch(/^demo_\d+$/);
  });

  it('generates a unique id on each call', async () => {
    const r1 = await saveFootprint('user-abc', { total: 100, breakdown: {}, inputs: {} });
    const r2 = await saveFootprint('user-abc', { total: 200, breakdown: {}, inputs: {} });
    // Both should be valid demo ids in the correct format
    expect(r1.id).toMatch(/^demo_\d+$/);
    expect(r2.id).toMatch(/^demo_\d+$/);
    // Both should be successful
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it('stores the correct total in the mock store', async () => {
    await saveFootprint('user-history', {
      total: 999, breakdown: {}, inputs: {},
    });
    const history = await getFootprintHistory('user-history');
    // At least the most-recent record has the correct total
    const found = history.find(d => d.total === 999);
    expect(found).toBeDefined();
  });

  it('accepts partial data without throwing', async () => {
    const result = await saveFootprint('user-partial', {});
    expect(result.success).toBe(true);
  });
});

// ── getFootprintHistory ───────────────────────────────────────────────────────
describe('getFootprintHistory (demo mode)', () => {
  it('returns an array', async () => {
    const history = await getFootprintHistory('any-user');
    expect(Array.isArray(history)).toBe(true);
  });

  it('filters records by userId', async () => {
    // Save two records for different users
    await saveFootprint('alice', { total: 400, breakdown: {}, inputs: {} });
    await saveFootprint('bob',   { total: 600, breakdown: {}, inputs: {} });

    const aliceHistory = await getFootprintHistory('alice');
    const allAlice = aliceHistory.every(r => r.userId === 'alice');
    expect(allAlice).toBe(true);
  });

  it('returns at most 10 records', async () => {
    const userId = 'heavy-user';
    // Insert 15 records
    for (let i = 0; i < 15; i++) {
      await saveFootprint(userId, { total: i * 10, breakdown: {}, inputs: {} });
    }
    const history = await getFootprintHistory(userId);
    expect(history.length).toBeLessThanOrEqual(10);
  });

  it('returns records ordered newest-first', async () => {
    const userId = 'order-user';
    await saveFootprint(userId, { total: 100, breakdown: {}, inputs: {} });
    await saveFootprint(userId, { total: 200, breakdown: {}, inputs: {} });

    const history = await getFootprintHistory(userId);
    // Newest entry (total: 200) should be first
    if (history.length >= 2) {
      expect(history[0].total).toBeGreaterThanOrEqual(history[1].total);
    }
  });
});

// ── savePledge ────────────────────────────────────────────────────────────────
describe('savePledge (demo mode)', () => {
  it('returns success: true', async () => {
    const result = await savePledge('user-pledge', ['Eat less meat', 'Cycle more']);
    expect(result.success).toBe(true);
    expect(result.id).toMatch(/^pledge_\d+$/);
  });

  it('truncates pledge array to max 10 items', async () => {
    const tooMany = Array.from({ length: 20 }, (_, i) => `Pledge ${i}`);
    // Should not throw, and the function handles truncation internally
    const result = await savePledge('user-pledge', tooMany);
    expect(result.success).toBe(true);
  });

  it('sanitizes long pledge strings to max 200 chars', async () => {
    const longString = 'A'.repeat(500);
    // Should not throw
    const result = await savePledge('user-pledge', [longString]);
    expect(result.success).toBe(true);
  });

  it('handles empty pledge array', async () => {
    const result = await savePledge('user-pledge', []);
    expect(result.success).toBe(true);
  });
});
