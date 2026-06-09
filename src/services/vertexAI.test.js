/**
 * @file src/services/vertexAI.test.js
 * @description Unit tests for the Vertex AI / Gemini insights service.
 *
 * Strategy:
 *  - Mock globalThis.fetch to avoid real HTTP calls
 *  - Test both the happy path (API responds correctly) and the fallback
 *    path (API fails → local insight generation kicks in)
 *  - Test the local insight generator with various footprint profiles
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Builds a mock footprint payload */
function mockFootprint({
  total = 400,
  transport = 150,
  diet = 150,
  energy = 60,
  shopping = 40,
  inputs = {},
} = {}) {
  return { total, breakdown: { transport, diet, energy, shopping }, inputs };
}

/** Returns a resolved fetch response with given JSON body */
function mockFetchOk(body) {
  return vi.fn(async () => ({
    ok: true,
    json: async () => body,
  }));
}

/** Returns a fetch that throws a network error */
function mockFetchError(message = 'Network error') {
  return vi.fn(async () => {
    throw new Error(message);
  });
}

// ── Import after defining mock helpers ────────────────────────────────────────
const { getAIInsights } = await import('./vertexAI.js');

// ── getAIInsights — API success path ─────────────────────────────────────────
describe('getAIInsights — API success', () => {
  beforeEach(() => {
    globalThis.fetch = mockFetchOk({
      tips: [{ category: 'transport', tip: 'Take the train', priority: 'high', saving: 40 }],
      largestCategory: 'transport',
      potentialSaving: 140,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns an object with tips array when API responds', async () => {
    const result = await getAIInsights(mockFootprint());
    expect(result).toHaveProperty('tips');
    expect(Array.isArray(result.tips)).toBe(true);
  });

  it('returns largestCategory string', async () => {
    const result = await getAIInsights(mockFootprint());
    expect(typeof result.largestCategory).toBe('string');
  });

  it('returns potentialSaving as a number', async () => {
    const result = await getAIInsights(mockFootprint());
    expect(typeof result.potentialSaving).toBe('number');
  });
});

// ── getAIInsights — fallback (local insights) ─────────────────────────────────
describe('getAIInsights — local fallback (API fails)', () => {
  beforeEach(() => {
    // Force the API call to fail so local fallback runs
    globalThis.fetch = mockFetchError('Connection refused');
    // Speed up the artificial delay in fallback
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('still resolves (does not throw) when API is down', async () => {
    const promise = getAIInsights(mockFootprint());
    vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBeDefined();
  });

  it('returns tips array even in fallback', async () => {
    const promise = getAIInsights(
      mockFootprint({ transport: 300, diet: 100, energy: 50, shopping: 20 }),
    );
    vi.runAllTimersAsync();
    const result = await promise;
    expect(Array.isArray(result.tips)).toBe(true);
    expect(result.tips.length).toBeGreaterThan(0);
  });

  it('identifies transport as largest when transport dominates', async () => {
    const promise = getAIInsights(
      mockFootprint({
        total: 600,
        transport: 400,
        diet: 100,
        energy: 60,
        shopping: 40,
      }),
    );
    vi.runAllTimersAsync();
    const result = await promise;
    expect(result.largestCategory).toBe('transport');
  });

  it('identifies diet as largest when diet dominates', async () => {
    const promise = getAIInsights(
      mockFootprint({
        total: 600,
        transport: 80,
        diet: 400,
        energy: 60,
        shopping: 60,
      }),
    );
    vi.runAllTimersAsync();
    const result = await promise;
    expect(result.largestCategory).toBe('diet');
  });

  it('potentialSaving is ~35% of total', async () => {
    const total = 800;
    const promise = getAIInsights(
      mockFootprint({ total, transport: 300, diet: 300, energy: 100, shopping: 100 }),
    );
    vi.runAllTimersAsync();
    const result = await promise;
    // Should be Math.round(total * 0.35) = 280
    expect(result.potentialSaving).toBe(Math.round(total * 0.35));
  });

  it('adds bonus tip for meat_heavy diet', async () => {
    const promise = getAIInsights(
      mockFootprint({
        inputs: { dietType: 'meat_heavy' },
        diet: 500,
        transport: 100,
        energy: 50,
        shopping: 50,
      }),
    );
    vi.runAllTimersAsync();
    const result = await promise;
    const hasBonusDietTip = result.tips.some((t) => t.tip.toLowerCase().includes('veggi'));
    expect(hasBonusDietTip).toBe(true);
  });

  it('adds bonus tip for high car usage with no train', async () => {
    const promise = getAIInsights(
      mockFootprint({
        inputs: { kmCar: 500, kmTrain: 0 },
        transport: 400,
        diet: 100,
        energy: 50,
        shopping: 50,
      }),
    );
    vi.runAllTimersAsync();
    const result = await promise;
    const hasTransportBonusTip = result.tips.some(
      (t) => t.category === 'transport' && t.tip.toLowerCase().includes('train'),
    );
    expect(hasTransportBonusTip).toBe(true);
  });
});

// ── Edge cases ────────────────────────────────────────────────────────────────
describe('getAIInsights — edge cases', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('handles total = 0 without division by zero', async () => {
    globalThis.fetch = mockFetchError('fail');
    vi.useFakeTimers();
    const promise = getAIInsights({
      total: 0,
      breakdown: { transport: 0, diet: 0, energy: 0, shopping: 0 },
      inputs: {},
    });
    vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBeDefined();
    expect(result.potentialSaving).toBe(0);
  });

  it('handles missing breakdown fields gracefully', async () => {
    globalThis.fetch = mockFetchError('fail');
    vi.useFakeTimers();
    const promise = getAIInsights({ total: 200, breakdown: {}, inputs: {} });
    vi.runAllTimersAsync();
    // Should not throw
    await expect(promise).resolves.toBeDefined();
  });
});
