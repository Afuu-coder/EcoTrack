/**
 * Emission Factors & Platform Constants
 * Source: IPCC AR6, DEFRA 2023, OurWorldInData
 * @module constants/emissions
 */

/** @type {Object} CO₂e kg per unit — all factors peer-reviewed */
export const EMISSION_FACTORS = {
  transport: {
    car:    0.21,   // kg CO₂e per km (avg petrol car, DEFRA 2023)
    bus:    0.089,  // kg CO₂e per km (diesel coach)
    train:  0.041,  // kg CO₂e per km (UK average rail)
    flight: 0.255,  // kg CO₂e per passenger-km (short-haul, incl. RFI)
    bike:   0,
    walk:   0,
  },
  diet: {
    meat_heavy:  7.19,  // kg CO₂e per day
    average:     5.63,
    vegetarian:  3.81,
    vegan:       2.89,
    none:        0,
  },
  energy: {
    kwh_coal:      0.82,  // kg CO₂e per kWh
    kwh_gas:       0.44,
    kwh_renewable: 0.02,
    none:          0,
  },
  shopping: {
    clothing:    33.4,  // kg CO₂e per item (avg garment lifecycle)
    electronics: 70,    // kg CO₂e per device (avg smartphone/tablet)
    furniture:   44,    // kg CO₂e per item
  },
};

/** Paris Agreement 1.5°C target: 2.5t/yr per person → monthly */
export const PARIS_TARGET_KG = 208;

/** Global average monthly footprint ~10t/yr */
export const MONTHLY_AVERAGE_KG = 833;

/** Grade thresholds and display config */
export const GRADE_CONFIG = {
  A: { color: '#34d399', label: 'Excellent',   emoji: '🌟' },
  B: { color: '#6ee7b7', label: 'Good',         emoji: '✅' },
  C: { color: '#facc15', label: 'Average',      emoji: '⚠️' },
  D: { color: '#f97316', label: 'Above Avg',    emoji: '📈' },
  F: { color: '#ef4444', label: 'High Impact',  emoji: '🔴' },
};

/** Category display metadata */
export const CATEGORIES = {
  transport: { icon: '🚗', color: '#60a5fa', label: 'Transport' },
  diet:      { icon: '🥗', color: '#a78bfa', label: 'Diet' },
  energy:    { icon: '⚡', color: '#fbbf24', label: 'Energy' },
  shopping:  { icon: '🛍️', color: '#f87171', label: 'Shopping' },
};

/** GCP Architecture services */
export const GCP_SERVICES = [
  { icon: '🔐', name: 'Firebase Auth',    role: 'Identity',   desc: 'Anonymous + social login, JWT token validation' },
  { icon: '🗄️', name: 'Cloud Firestore', role: 'Database',   desc: 'Real-time NoSQL, user footprint time-series' },
  { icon: '🤖', name: 'Vertex AI',        role: 'Insights',   desc: 'Gemini Pro, fine-tuned on emissions datasets' },
  { icon: '📊', name: 'BigQuery',         role: 'Analytics',  desc: 'Aggregate analytics, cohort & trend analysis' },
  { icon: '🚀', name: 'Cloud Run',        role: 'Backend',    desc: 'Containerised Express API, auto-scales to zero' },
  { icon: '🌐', name: 'Firebase Hosting', role: 'CDN',        desc: 'Global CDN, HTTPS enforced, HTTP/2 push' },
];
