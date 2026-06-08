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
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });
dotenv.config({ override: true });

import express from 'express';
import cors    from 'cors';
import path    from 'path';
import { fileURLToPath } from 'url';
import { getVertexInsights } from './vertex.js';
import { logAnalytics }      from './bigquery.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────

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
  try {
    const { userId, total, breakdown } = req.body;
    await logAnalytics(userId, total, breakdown);
    res.json({ success: true });
  } catch (err) {
    console.error('[/api/analytics]', err.message);
    res.status(500).json({ error: 'Failed to log analytics' });
  }
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ EcoTrack API running on http://localhost:${PORT}`);
});
