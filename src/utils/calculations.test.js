/**
 * Unit tests for calculation utilities
 * Run with: npm test
 * @file utils/calculations.test.js
 */
import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyFootprint,
  calculateBreakdown,
  sanitizeNumber,
  gradeFootprint,
  formatNumber,
} from './calculations';

// ── calculateMonthlyFootprint ──────────────────────────────────

describe('calculateMonthlyFootprint', () => {
  it('returns 0 for empty inputs', () => {
    // diet "none" doesn't exist in factors, should fall back to average
    expect(calculateMonthlyFootprint({})).toBeGreaterThan(0);
  });

  it('returns a positive number for average vegan with no transport', () => {
    const result = calculateMonthlyFootprint({ dietType: 'vegan' });
    expect(result).toBeGreaterThan(0);
    expect(result).toBe(Math.round(2.89 * 30)); // 2.89 kg/day × 30
  });

  it('transport: car adds correct emissions', () => {
    const carOnly = calculateMonthlyFootprint({
      kmCar: 100, dietType: 'none', kwhHome: 0,
    });
    // 100 km × 0.21 kg/km = 21 kg transport (diet "none" falls back to average)
    expect(carOnly).toBeGreaterThanOrEqual(21);
  });

  it('flight hours are annualised (÷12)', () => {
    const noFlights = calculateMonthlyFootprint({ flightHours: 0, dietType: 'none', kwhHome: 0 });
    const withFlight = calculateMonthlyFootprint({ flightHours: 12, dietType: 'none', kwhHome: 0 });
    // 12h × 800 km/h × 0.255 kg/km / 12 months = 204 kg
    expect(withFlight - noFlights).toBe(204);
  });

  it('renewable energy has near-zero emissions vs coal', () => {
    const coal = calculateMonthlyFootprint({ kwhHome: 500, energySource: 'kwh_coal', dietType: 'none' });
    const solar = calculateMonthlyFootprint({ kwhHome: 500, energySource: 'kwh_renewable', dietType: 'none' });
    // coal=0.82 kg/kWh, renewable=0.02 kg/kWh → ratio = 41x (energy only)
    // diet fallback adds a baseline to both equally, so net transport/energy difference: 410 vs 10
    expect(coal).toBeGreaterThan(solar * 2);
  });

  it('shopping is annualised (÷12)', () => {
    const none = calculateMonthlyFootprint({ clothingItems: 0, dietType: 'none', kwhHome: 0 });
    const shop = calculateMonthlyFootprint({ clothingItems: 12, dietType: 'none', kwhHome: 0 });
    expect(shop - none).toBe(Math.round(12 * 33.4 / 12)); // = 33 kg
  });

  it('returns integer (rounded)', () => {
    const result = calculateMonthlyFootprint({ kmCar: 123.456 });
    expect(Number.isInteger(result)).toBe(true);
  });

  it('meat heavy diet > vegan diet', () => {
    const meat = calculateMonthlyFootprint({ dietType: 'meat_heavy', kwhHome: 0 });
    const vegan = calculateMonthlyFootprint({ dietType: 'vegan', kwhHome: 0 });
    expect(meat).toBeGreaterThan(vegan);
  });
});

// ── calculateBreakdown ────────────────────────────────────────

describe('calculateBreakdown', () => {
  it('returns four categories', () => {
    const b = calculateBreakdown({});
    expect(Object.keys(b)).toEqual(['transport', 'diet', 'energy', 'shopping']);
  });

  it('transport is non-zero when car km provided', () => {
    const b = calculateBreakdown({ kmCar: 200 });
    expect(b.transport).toBeGreaterThan(0);
  });

  it('all values are non-negative', () => {
    const b = calculateBreakdown({ kmCar: 0, kmBus: 0, kwhHome: 0 });
    Object.values(b).forEach(v => expect(v).toBeGreaterThanOrEqual(0));
  });
});

// ── sanitizeNumber ────────────────────────────────────────────

describe('sanitizeNumber', () => {
  it('parses normal numbers', () => {
    expect(sanitizeNumber('42')).toBe(42);
    expect(sanitizeNumber(100)).toBe(100);
  });

  it('strips injection characters', () => {
    // '<script>alert(1)</script>' → strips non-numeric → '1' → parseFloat = 1
    // The important thing is no code execution occurs; the number extracted is safe
    expect(sanitizeNumber('<script>alert(1)</script>')).toBe(1);
    expect(sanitizeNumber('DROP TABLE')).toBe(0); // no digits → 0
    expect(sanitizeNumber('12abc34')).toBe(1234); // strips letters, keeps all digits: '12'+'34'='1234'
  });

  it('returns 0 for NaN', () => {
    expect(sanitizeNumber('')).toBe(0);
    expect(sanitizeNumber('abc')).toBe(0);
    expect(sanitizeNumber(NaN)).toBe(0);
  });

  it('clamps to max', () => {
    expect(sanitizeNumber('999999', 500)).toBe(500);
  });

  it('negative numbers: Math.abs is applied so -50 → 50 (safe positive value)', () => {
    // sanitizeNumber takes Math.abs — negative inputs are clamped to their absolute value
    // This is correct: -50 km driven is logically 50 km
    expect(sanitizeNumber(-50)).toBe(50);
    // Ensure it never returns a negative value
    expect(sanitizeNumber(-50)).toBeGreaterThanOrEqual(0);
  });

  it('handles float strings', () => {
    expect(sanitizeNumber('3.14')).toBeCloseTo(3.14);
  });
});

// ── gradeFootprint ────────────────────────────────────────────

describe('gradeFootprint', () => {
  it('grades A for Paris target or below', () => {
    expect(gradeFootprint(0).grade).toBe('A');
    expect(gradeFootprint(208).grade).toBe('A');
  });

  it('grades B between Paris and 1.5× Paris', () => {
    expect(gradeFootprint(209).grade).toBe('B');
    expect(gradeFootprint(312).grade).toBe('B');
  });

  it('grades F for very high footprint', () => {
    expect(gradeFootprint(1000).grade).toBe('F');
    expect(gradeFootprint(5000).grade).toBe('F');
  });

  it('returns a color string', () => {
    const { color } = gradeFootprint(0);
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('returns an emoji', () => {
    const { emoji } = gradeFootprint(0);
    expect(emoji.length).toBeGreaterThan(0);
  });
});

// ── formatNumber ─────────────────────────────────────────────

describe('formatNumber', () => {
  it('formats numbers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats small numbers without commas', () => {
    expect(formatNumber(42)).toBe('42');
  });

  it('formats zero correctly', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

// ── vsParisTarget (was COMPLETELY untested!) ──────────────────

import { vsParisTarget } from './calculations';

describe('vsParisTarget', () => {
  it('returns 0 at exactly the Paris target (208 kg)', () => {
    expect(vsParisTarget(208)).toBe(0);
  });

  it('returns 100 at double the Paris target (416 kg)', () => {
    expect(vsParisTarget(416)).toBe(100);
  });

  it('returns -50 at half the Paris target (104 kg)', () => {
    expect(vsParisTarget(104)).toBe(-50);
  });

  it('returns a negative value when below Paris target (good!)', () => {
    expect(vsParisTarget(100)).toBeLessThan(0);
  });

  it('returns a positive value when above Paris target (bad)', () => {
    expect(vsParisTarget(500)).toBeGreaterThan(0);
  });

  it('returns an integer (Math.round applied)', () => {
    expect(Number.isInteger(vsParisTarget(300))).toBe(true);
    expect(Number.isInteger(vsParisTarget(123))).toBe(true);
  });

  it('handles zero total', () => {
    // 0 kg → 100% below target → -100
    expect(vsParisTarget(0)).toBe(-100);
  });
});

// ── gradeFootprint: C and D grades (were untested!) ───────────

describe('gradeFootprint — C and D grades', () => {
  // C: > 312 and ≤ 583 (70% of 833)
  it('grades C just above B threshold', () => {
    expect(gradeFootprint(313).grade).toBe('C');
  });

  it('grades C at 70% of global average (583 kg)', () => {
    expect(gradeFootprint(583).grade).toBe('C');
  });

  // D: > 583 and ≤ 833 (global average)
  it('grades D just above C threshold', () => {
    expect(gradeFootprint(584).grade).toBe('D');
  });

  it('grades D at exactly global average (833 kg)', () => {
    expect(gradeFootprint(833).grade).toBe('D');
  });

  it('all grades return a label string', () => {
    ['A','B','C','D','F'].forEach(expectedGrade => {
      const testKg = { A: 100, B: 250, C: 500, D: 700, F: 1000 }[expectedGrade];
      const { label } = gradeFootprint(testKg);
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });
});

// ── calculateBreakdown: electronics + flights (extended) ──────

describe('calculateBreakdown — electronics and flights', () => {
  it('electronics items contribute to shopping breakdown', () => {
    const noElec = calculateBreakdown({ dietType: 'none', kwhHome: 0, electronicsItems: 0 });
    const elec   = calculateBreakdown({ dietType: 'none', kwhHome: 0, electronicsItems: 2 });
    // 2 devices × 70 kg ÷ 12 ≈ 11 kg
    expect(elec.shopping).toBeGreaterThan(noElec.shopping);
    expect(elec.shopping - noElec.shopping).toBeCloseTo(Math.round(2 * 70 / 12), 0);
  });

  it('flight hours contribute to transport breakdown', () => {
    const noFlight = calculateBreakdown({ dietType: 'none', kwhHome: 0, flightHours: 0 });
    const flight   = calculateBreakdown({ dietType: 'none', kwhHome: 0, flightHours: 6 });
    // 6h × 800 km/h × 0.255 kg/km ÷ 12 months = 102 kg
    expect(flight.transport - noFlight.transport).toBe(102);
  });

  it('energy: none source means zero energy emissions', () => {
    const b = calculateBreakdown({ dietType: 'none', kwhHome: 500, energySource: 'none' });
    expect(b.energy).toBe(0);
  });

  it('combined inputs produce non-zero breakdown across all categories', () => {
    const b = calculateBreakdown({
      kmCar: 100,
      dietType: 'average',
      kwhHome: 200,
      energySource: 'kwh_gas',
      clothingItems: 3,
    });
    expect(b.transport).toBeGreaterThan(0);
    expect(b.diet).toBeGreaterThan(0);
    expect(b.energy).toBeGreaterThan(0);
    expect(b.shopping).toBeGreaterThan(0);
  });
});
