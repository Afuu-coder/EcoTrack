/**
 * @fileoverview Pure calculation utilities — zero side effects, fully unit-testable.
 *
 * All functions are:
 *  - Deterministic: same input always → same output
 *  - Side-effect free: no DOM, no network, no state mutation
 *  - Type-safe: JSDoc typed for IDE autocomplete
 *
 * @module utils/calculations
 */

import {
  EMISSION_FACTORS,
  PARIS_TARGET_KG,
  MONTHLY_AVERAGE_KG,
  GRADE_CONFIG,
} from '@/constants/emissions';

// ─── Type Definitions ────────────────────────────────────────────────────────

/**
 * @typedef {Object} SurveyInputs
 * @property {number} [kmCar=0]           - Km driven by personal car per month
 * @property {number} [kmBus=0]           - Km by bus/coach per month
 * @property {number} [kmTrain=0]         - Km by train/metro per month
 * @property {number} [flightHours=0]     - Total flight hours per year (annualised ÷12)
 * @property {string} [dietType="average"]- One of: meat_heavy | average | vegetarian | vegan
 * @property {number} [kwhHome=0]         - kWh electricity consumed per month
 * @property {string} [energySource="kwh_gas"] - One of: kwh_coal | kwh_gas | kwh_renewable
 * @property {number} [clothingItems=0]   - New clothing items per year (annualised ÷12)
 * @property {number} [electronicsItems=0]- New electronic devices per year (annualised ÷12)
 */

/**
 * @typedef {Object} Breakdown
 * @property {number} transport
 * @property {number} diet
 * @property {number} energy
 * @property {number} shopping
 */

/**
 * @typedef {Object} GradeInfo
 * @property {string} grade   - Letter grade: A | B | C | D | F
 * @property {string} label   - Human-readable label e.g. "Excellent"
 * @property {string} color   - Hex colour for the grade e.g. "#34d399"
 * @property {string} emoji   - Status emoji e.g. "🌟"
 */

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Calculate total monthly carbon footprint from survey inputs.
 *
 * Formula sources:
 *  - Transport: DEFRA 2023 vehicle emission factors
 *  - Diet: Poore & Nemecek 2018 (Science), OurWorldInData
 *  - Energy: UK National Grid ESO 2023 carbon intensity
 *  - Shopping: Ellen MacArthur Foundation lifecycle analysis
 *
 * @param {SurveyInputs} inputs - Raw survey values (all optional, default to zero)
 * @returns {number} Monthly CO₂e in kg, rounded to integer
 *
 * @example
 * calculateMonthlyFootprint({ kmCar: 200, dietType: 'vegetarian' }) // → 244
 */
export function calculateMonthlyFootprint(inputs = {}) {
  const {
    kmCar = 0,
    kmBus = 0,
    kmTrain = 0,
    flightHours = 0,
    dietType = 'average',
    kwhHome = 0,
    energySource = 'kwh_gas',
    clothingItems = 0,
    electronicsItems = 0,
  } = inputs;

  const transport =
    kmCar   * EMISSION_FACTORS.transport.car   +
    kmBus   * EMISSION_FACTORS.transport.bus   +
    kmTrain * EMISSION_FACTORS.transport.train +
    // Flights: annual hours × avg speed (800 km/h) × kg/km ÷ 12 months
    (flightHours * 800 * EMISSION_FACTORS.transport.flight) / 12;

  // Diet: kg CO₂e per day × 30 days; fallback to 'average' for unknown keys
  const dietFactor = EMISSION_FACTORS.diet[dietType] ?? EMISSION_FACTORS.diet.average;
  const diet = dietFactor * 30;

  // Energy: monthly kWh × grid intensity factor
  const energyFactor = EMISSION_FACTORS.energy[energySource] ?? EMISSION_FACTORS.energy.kwh_gas;
  const energy = kwhHome * energyFactor;

  // Shopping: annual items amortised to monthly
  const shopping =
    (clothingItems    * EMISSION_FACTORS.shopping.clothing +
     electronicsItems * EMISSION_FACTORS.shopping.electronics) / 12;

  return Math.round(transport + diet + energy + shopping);
}

/**
 * Calculate per-category emission breakdown.
 * Each category is computed in isolation so bars show accurate relative contribution.
 *
 * @param {SurveyInputs} inputs
 * @returns {Breakdown}
 *
 * @example
 * calculateBreakdown({ kmCar: 300, dietType: 'vegan' })
 * // → { transport: 63, diet: 87, energy: 0, shopping: 0 }
 */
export function calculateBreakdown(inputs = {}) {
  /** Baseline with all categories zeroed out */
  const zero = {
    kmCar: 0, kmBus: 0, kmTrain: 0, flightHours: 0,
    dietType: 'none', kwhHome: 0, clothingItems: 0, electronicsItems: 0,
  };

  return {
    transport: calculateMonthlyFootprint({
      ...zero,
      kmCar: inputs.kmCar,
      kmBus: inputs.kmBus,
      kmTrain: inputs.kmTrain,
      flightHours: inputs.flightHours,
    }),
    diet: calculateMonthlyFootprint({
      ...zero,
      dietType: inputs.dietType,
    }),
    energy: calculateMonthlyFootprint({
      ...zero,
      kwhHome: inputs.kwhHome,
      energySource: inputs.energySource,
    }),
    shopping: calculateMonthlyFootprint({
      ...zero,
      clothingItems: inputs.clothingItems,
      electronicsItems: inputs.electronicsItems,
    }),
  };
}

/**
 * Sanitise a user-supplied value into a safe non-negative number.
 *
 * Security rationale: strips all non-numeric characters before parsing,
 * preventing injection of script tags, SQL fragments, or negative values
 * into downstream arithmetic operations.
 *
 * @param {string|number} val - Raw input (may contain injection chars)
 * @param {number} [max=99999] - Upper bound clamp
 * @returns {number} Safe value in range [0, max]
 *
 * @example
 * sanitizeNumber('<script>alert(1)</script>') // → 1 (safe, just the digit)
 * sanitizeNumber('DROP TABLE')               // → 0
 * sanitizeNumber(-500)                       // → 500 (abs value)
 * sanitizeNumber('99999999', 5000)           // → 5000 (clamped)
 */
export function sanitizeNumber(val, max = 99999) {
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed  = parseFloat(cleaned);

  if (isNaN(parsed)) return 0;
  return Math.min(Math.abs(parsed), max);
}

/**
 * Map a monthly CO₂e total to a letter grade with display metadata.
 *
 * Grade thresholds are based on the Paris Agreement 1.5°C pathway:
 *  A  ≤ 208 kg/month  (Paris 2.5 t/yr target)
 *  B  ≤ 312 kg/month  (1.5× Paris target)
 *  C  ≤ 583 kg/month  (70% of global average)
 *  D  ≤ 833 kg/month  (global average)
 *  F  >  833 kg/month (above global average)
 *
 * @param {number} kg - Monthly CO₂e in kg
 * @returns {GradeInfo}
 *
 * @example
 * gradeFootprint(169)  // → { grade: 'A', label: 'Excellent', color: '#34d399', emoji: '🌟' }
 * gradeFootprint(1200) // → { grade: 'F', label: 'High Impact', color: '#ef4444', emoji: '🔴' }
 */
export function gradeFootprint(kg) {
  if (kg <= PARIS_TARGET_KG)           return { grade: 'A', ...GRADE_CONFIG.A };
  if (kg <= PARIS_TARGET_KG * 1.5)    return { grade: 'B', ...GRADE_CONFIG.B };
  if (kg <= MONTHLY_AVERAGE_KG * 0.7) return { grade: 'C', ...GRADE_CONFIG.C };
  if (kg <= MONTHLY_AVERAGE_KG)       return { grade: 'D', ...GRADE_CONFIG.D };
  return                                      { grade: 'F', ...GRADE_CONFIG.F };
}

/**
 * Format a number with locale-aware thousand separators.
 *
 * @param {number} n
 * @returns {string} e.g. 1234567 → "1,234,567"
 */
export function formatNumber(n) {
  return n.toLocaleString('en-US');
}

/**
 * Calculate how many percent over/under the Paris Agreement target.
 * Negative = below target (good). Positive = above target (bad).
 *
 * @param {number} total - Monthly CO₂e in kg
 * @returns {number} Signed percentage
 *
 * @example
 * vsParisTarget(208)  // →  0
 * vsParisTarget(416)  // → 100  (double the target)
 * vsParisTarget(104)  // → -50  (half the target — great!)
 */
export function vsParisTarget(total) {
  return Math.round(((total - PARIS_TARGET_KG) / PARIS_TARGET_KG) * 100);
}
