// env loaded by server/index.js via dotenv
import { VertexAI } from '@google-cloud/vertexai';

// Determine the GCP project ID. In Cloud Run, this is automatically available via default credentials,
// but we can also fall back to the env var if provided.
const projectId =
  process.env.VITE_FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  'ecotrack-carbon-platform';
const location = 'us-central1';

let vertexAI;
let generativeModel;

try {
  vertexAI = new VertexAI({ project: projectId, location });
  generativeModel = vertexAI.preview.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });
} catch (err) {
  console.warn('[Vertex AI] Initialization failed, will use fallback locally:', err.message);
}

export async function getVertexInsights(footprintData) {
  if (!generativeModel) {
    // If Vertex AI isn't configured, fall back to simple local logic
    return generateLocalInsights(footprintData);
  }

  const { total, breakdown } = footprintData;

  const prompt = `
You are an expert sustainability consultant analyzing a user's monthly carbon footprint.
User's total footprint: ${total} kg CO2e / month.
Breakdown:
- Transport: ${breakdown.transport} kg CO2e
- Diet: ${breakdown.diet} kg CO2e
- Energy: ${breakdown.energy} kg CO2e
- Shopping: ${breakdown.shopping} kg CO2e

Based on this breakdown, return a JSON response with exactly this structure:
{
  "tips": [
    { "category": "category_name", "tip": "Actionable specific advice", "priority": "high/medium/low", "saving": estimated_kg_saved_as_number }
  ],
  "largestCategory": "name_of_largest_category",
  "potentialSaving": total_estimated_savings_as_number
}
Provide 3 highly specific, realistic tips focused mostly on the largest categories.
`;

  try {
    const resp = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText = resp.response.candidates[0].content.parts[0].text;
    const jsonStr = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('[Vertex AI] Gemini generation error, using fallback:', err);
    return generateLocalInsights(footprintData);
  }
}

// Fallback logic for when GCP credentials are not available locally
function generateLocalInsights({ total, breakdown }) {
  const tips = [];
  const { energy } = breakdown;
  const sorted = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
  const largest = sorted[0][0];

  const tipMap = {
    transport: [{ tip: 'Switch 2 car trips/week to public transit', saving: 34 }],
    diet: [{ tip: 'Going meat-free 2 days/week', saving: 30 }],
    energy: [{ tip: 'Switching to a renewable energy tariff', saving: Math.round(energy * 0.9) }],
    shopping: [{ tip: 'Buy second-hand clothing', saving: 22 }],
  };

  const primaryTips = tipMap[largest] || tipMap.energy;
  primaryTips.forEach((t) =>
    tips.push({ category: largest, tip: t.tip, priority: 'high', saving: t.saving }),
  );

  return {
    tips,
    largestCategory: largest,
    potentialSaving: Math.round(total * 0.35),
  };
}
