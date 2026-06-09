/**
 * EcoTrack — Express Backend Server
 *
 * Routes:
 *   POST /api/insights   → Vertex AI (Gemini) personalised tips
 *   POST /api/analytics  → BigQuery footprint logging
 *   GET  /               → Health check
 *
 * Deployment: Cloud Run (see Dockerfile)
 * Local dev:  npm run server  (port 8080)
 *
 * Security hardening:
 *  - Request body size capped at 50 KB (prevents payload bombing)
 *  - All numeric inputs validated before forwarding to GCP services
 *  - userId length-checked to prevent log injection
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });
dotenv.config({ override: true });

import express from 'express';
import cors from 'cors';
import { getVertexInsights } from './vertex.js';
import { logAnalytics } from './bigquery.js';

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
// Limit request body to 50 KB — prevents payload bombing attacks
app.use(express.json({ limit: '50kb' }));

// ── Input Validation Helpers ───────────────────────────────────────────────────

/**
 * Validate that a value is a finite number in [min, max].
 * @param {*} val
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
function isValidNumber(val, min = 0, max = 100000) {
  const n = Number(val);
  return Number.isFinite(n) && n >= min && n <= max;
}

/**
 * Validate analytics request body fields.
 * Returns null if valid, or an error message string if invalid.
 *
 * @param {{ userId, total, breakdown }} body
 * @returns {string|null}
 */
function validateAnalyticsBody({ userId, total, breakdown, cohort }) {
  if (userId !== undefined && (typeof userId !== 'string' || userId.length > 128)) {
    return 'Invalid userId: must be a string under 128 characters';
  }
  if (cohort !== undefined && (typeof cohort !== 'string' || cohort.length > 64)) {
    return 'Invalid cohort: must be a string under 64 characters';
  }
  if (!isValidNumber(total, 0, 50000)) {
    return 'Invalid total: must be a number between 0 and 50,000';
  }
  if (breakdown && typeof breakdown !== 'object') {
    return 'Invalid breakdown: must be an object';
  }
  if (breakdown) {
    for (const [key, val] of Object.entries(breakdown)) {
      if (!isValidNumber(val, 0, 50000)) {
        return `Invalid breakdown.${key}: must be a number between 0 and 50,000`;
      }
    }
  }
  return null;
}

/**
 * Validate insights request body fields.
 * @param {{ total, breakdown, inputs }} body
 * @returns {string|null}
 */
function validateInsightsBody({ total, inputs }) {
  if (!isValidNumber(total, 0, 50000)) {
    return 'Invalid total: must be a number between 0 and 50,000';
  }
  if (inputs && typeof inputs !== 'object') {
    return 'Invalid inputs: must be an object';
  }
  return null;
}

// ── Routes ────────────────────────────────────────────────────────────────────

/** Health check */
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'EcoTrack API',
    version: '1.0.0',
    endpoints: ['POST /api/insights', 'POST /api/analytics'],
  });
});

/** Vertex AI — personalised carbon reduction tips */
app.post('/api/insights', async (req, res) => {
  // ── Input Validation ──
  const validationError = validateInsightsBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const insights = await getVertexInsights(req.body);
    res.json(insights);
  } catch (err) {
    console.error('[/api/insights]', err.message);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

/** BigQuery — log footprint analytics event */
app.post('/api/analytics', async (req, res) => {
  // ── Input Validation ──
  const validationError = validateAnalyticsBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const { userId, total, breakdown, cohort } = req.body;
    await logAnalytics(userId, total, breakdown, cohort);
    res.json({ success: true });
  } catch (err) {
    console.error('[/api/analytics]', err.message);
    res.status(500).json({ error: 'Failed to log analytics' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ EcoTrack API running on http://localhost:${PORT}`);
});
