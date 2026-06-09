/**
 * Vertex AI / Gemini insights service
 * In production: calls a Cloud Run Express proxy (API key stays server-side)
 * In demo mode: generates deterministic local insights
 * @module services/vertexAI
 */

const CLOUD_RUN_URL = import.meta.env.VITE_CLOUD_RUN_API_URL;

/**
 * Get AI-powered reduction recommendations.
 * SECURITY: The actual Vertex AI API key lives in Cloud Run env vars.
 *           Client only calls our own Cloud Run endpoint.
 *
 * @param {{ total: number, breakdown: Object, inputs: Object }} footprintData
 * @returns {Promise<{ tips: Array, largestCategory: string, potentialSaving: number }>}
 */
export async function getAIInsights(footprintData) {
  try {
    const url = CLOUD_RUN_URL ? `${CLOUD_RUN_URL}/api/insights` : '/api/insights';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(footprintData),
      signal: AbortSignal.timeout(15000), // 15s timeout
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Vertex AI] Backend call failed, using local fallback:', err.message);
    // Simulate network latency for realistic UX if fallback happens instantly
    await new Promise(r => setTimeout(r, 1400));
    return generateLocalInsights(footprintData);
  }
}

/**
 * Generate deterministic insights locally (demo mode fallback).
 * Used when Cloud Run is not configured or unreachable.
 *
 * @param {{ total: number, breakdown: Object, inputs: Object }} param0
 * @returns {{ tips: Array, largestCategory: string, potentialSaving: number }}
 */
function generateLocalInsights({ total, breakdown, inputs }) {
  const tips = [];
  // Defensive: breakdown may be empty or missing in edge cases
  const safeBreakdown = breakdown && typeof breakdown === 'object' ? breakdown : {};
  const { transport = 0, diet = 0, energy = 0 } = safeBreakdown;

  // Find biggest emission category — fallback to 'energy' if breakdown is empty
  const entries = Object.entries(safeBreakdown).filter(([, v]) => typeof v === 'number');
  const sorted  = entries.sort(([, a], [, b]) => b - a);
  const largest = sorted.length > 0 ? sorted[0][0] : 'energy';

  const tipMap = {
    transport: [
      { tip: 'Switch 2 car trips/week to public transit — save ~34 kg CO₂/month', saving: 34 },
      { tip: 'Carpooling 3 days/week cuts transport emissions by up to 40%', saving: Math.round(transport * 0.4) },
      { tip: 'Try cycling or walking for trips under 5 km — zero emissions & free fitness!', saving: 18 },
    ],
    diet: [
      { tip: 'Going meat-free 2 days/week can save ~30 kg CO₂ monthly', saving: 30 },
      { tip: 'Buying locally-grown produce cuts food transport emissions by ~15%', saving: Math.round(diet * 0.15) },
      { tip: 'Plant-based swaps for breakfast alone can save 8 kg CO₂/month', saving: 8 },
    ],
    energy: [
      { tip: 'Switching to a renewable energy tariff cuts home emissions by ~90%', saving: Math.round(energy * 0.9) },
      { tip: 'LED bulbs + a smart thermostat reduce energy costs by up to 20%', saving: Math.round(energy * 0.2) },
      { tip: `Your home is ${Math.round((energy / (total || 1)) * 100)}% of your footprint — insulation helps most`, saving: Math.round(energy * 0.3) },
    ],
    shopping: [
      { tip: 'Buy second-hand clothing — fashion industry = 10% of global CO₂', saving: 22 },
      { tip: 'Extending your phone/laptop lifetime by 1 year saves ~35 kg CO₂', saving: 35 },
      { tip: 'Swap 2 new clothing items for vintage alternatives this month', saving: 12 },
    ],
  };

  // Primary tips for largest category
  const primaryTips = tipMap[largest] || tipMap.energy;
  primaryTips.forEach(t =>
    tips.push({ category: largest, tip: t.tip, priority: 'high', saving: t.saving })
  );

  // Bonus tip if meat-heavy diet
  if (inputs?.dietType === 'meat_heavy') {
    tips.push({ category: 'diet', tip: 'Even one veggie day/week = ~15 kg saved monthly', priority: 'medium', saving: 15 });
  }

  // Bonus tip if driving and also has short public transit option
  if ((inputs?.kmCar || 0) > 200 && (inputs?.kmTrain || 0) === 0) {
    tips.push({ category: 'transport', tip: 'You drive a lot but use no train — check if rail is available for regular routes', priority: 'medium', saving: 40 });
  }

  return {
    tips,
    largestCategory: largest,
    potentialSaving: Math.round(total * 0.35),
  };
}
