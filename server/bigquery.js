// env loaded by server/index.js via dotenv
import { BigQuery } from '@google-cloud/bigquery';

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'ecotrack-carbon-platform';
let bigquery;

try {
  bigquery = new BigQuery({ projectId });
} catch (err) {
  console.warn('[BigQuery] Initialization failed:', err.message);
}

const DATASET_ID = 'carbon_metrics';
const TABLE_ID = 'footprint_logs';

/**
 * Ensures the dataset and table exist. Creates them if they don't.
 */
async function ensureSchema() {
  if (!bigquery) return;

  try {
    const dataset = bigquery.dataset(DATASET_ID);
    const [datasetExists] = await dataset.exists();
    if (!datasetExists) {
      await dataset.create({ location: 'US' });
      console.log(`[BigQuery] Created dataset ${DATASET_ID}`);
    }

    const table = dataset.table(TABLE_ID);
    const [tableExists] = await table.exists();
    if (!tableExists) {
      const schema = [
        { name: 'userId', type: 'STRING', mode: 'REQUIRED' },
        { name: 'total', type: 'INTEGER', mode: 'REQUIRED' },
        { name: 'transport', type: 'INTEGER', mode: 'REQUIRED' },
        { name: 'diet', type: 'INTEGER', mode: 'REQUIRED' },
        { name: 'energy', type: 'INTEGER', mode: 'REQUIRED' },
        { name: 'shopping', type: 'INTEGER', mode: 'REQUIRED' },
        { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
      ];
      await table.create({ schema });
      console.log(`[BigQuery] Created table ${TABLE_ID}`);
    }
  } catch (err) {
    console.error('[BigQuery] Error ensuring schema:', err);
  }
}

// Call once on startup
ensureSchema();

export async function logAnalytics(userId, total, breakdown) {
  if (!bigquery) {
    console.log('[BigQuery - DEMO] Logging analytics:', { userId, total, breakdown });
    return;
  }

  try {
    const row = {
      userId: userId || 'anonymous',
      total: total,
      transport: breakdown.transport,
      diet: breakdown.diet,
      energy: breakdown.energy,
      shopping: breakdown.shopping,
      timestamp: bigquery.timestamp(new Date()),
    };

    await bigquery.dataset(DATASET_ID).table(TABLE_ID).insert([row]);
    console.log(`[BigQuery] Inserted 1 row for user ${userId}`);
  } catch (err) {
    console.error('[BigQuery] Insert failed:', err);
  }
}
