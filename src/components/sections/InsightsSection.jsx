/**
 * InsightsSection — Vertex AI recommendations + 30-day challenge
 */
import { useState } from 'react';
import PropTypes from 'prop-types';
import InsightCard from '@/components/ui/InsightCard';
import { savePledge } from '@/services/firestore';
import { useAuthContext } from '@/context/AuthContext';

const CHALLENGES = [
  '🚌 Replace 2 car trips/week with public transit',
  '🥗 Try meat-free Mondays this month',
  '💡 Switch to a renewable energy tariff',
  '🚲 Cycle for trips under 5 km',
  '♻️ Buy second-hand instead of new clothing',
];

export default function InsightsSection({ insights, loadingAI }) {
  const { userId, authMode } = useAuthContext();
  const [selected, setSelected] = useState([]);
  const [pledgeSaved, setPledgeSaved] = useState(false);
  const [pledgeSaving, setPledgeSaving] = useState(false);

  const togglePledge = (action) => {
    setSelected((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action],
    );
  };

  const handleSavePledge = async () => {
    if (!selected.length) return;
    setPledgeSaving(true);
    await savePledge(userId, selected);
    setPledgeSaving(false);
    setPledgeSaved(true);
  };

  if (loadingAI) {
    return (
      <section aria-labelledby="insights-heading">
        <h2 id="insights-heading" className="section-title font-display" style={{ fontSize: 18 }}>
          AI-Powered Insights
        </h2>
        <div
          role="status"
          aria-live="polite"
          className="glass-panel"
          style={{ textAlign: 'center', padding: 48 }}
        >
          <div
            style={{ fontSize: 36, marginBottom: 14, animation: 'pulse-ring 2s ease infinite' }}
            aria-hidden="true"
          >
            🤖
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px' }}>
            Calling <strong style={{ color: 'var(--accent-purple)' }}>Vertex AI</strong> for
            personalised recommendations…
          </p>
          <div
            className="shimmer"
            style={{
              background:
                'linear-gradient(90deg, var(--accent-purple), var(--accent-blue), var(--accent-purple))',
              backgroundSize: '200%',
            }}
          />
        </div>
      </section>
    );
  }

  if (!insights) return null;

  return (
    <section aria-labelledby="insights-heading">
      <h2 id="insights-heading" className="section-title font-display" style={{ fontSize: 18 }}>
        AI-Powered Insights
      </h2>

      {/* Summary */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '24px',
          background: 'rgba(139, 92, 246, 0.08)',
          borderColor: 'rgba(139, 92, 246, 0.2)',
        }}
      >
        <p style={{ margin: 0, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Your biggest impact area is{' '}
          <strong style={{ color: 'var(--accent-purple)', textTransform: 'capitalize' }}>
            {insights.largestCategory}
          </strong>
          . By acting on the tips below, you could save up to{' '}
          <strong style={{ color: 'var(--accent-emerald)' }}>
            {insights.potentialSaving} kg CO₂e/month
          </strong>{' '}
          — roughly a{' '}
          <strong>
            {Math.round(
              (insights.potentialSaving / (insights.total || insights.potentialSaving + 1)) * 100,
            )}
            %
          </strong>{' '}
          reduction.
        </p>
      </div>

      {/* Tip cards */}
      <div role="list" aria-label="Personalised AI recommendations">
        {insights.tips.map((t, i) => (
          <InsightCard key={i} {...t} />
        ))}
      </div>

      {/* 30-day Challenge */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '24px',
          background: 'rgba(16, 185, 129, 0.05)',
          borderColor: 'rgba(16, 185, 129, 0.2)',
        }}
      >
        <h3
          className="font-display"
          style={{
            margin: '0 0 10px',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--accent-emerald)',
          }}
        >
          📅 30-Day Challenge
        </h3>
        <p
          style={{
            margin: '0 0 16px',
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          Pick actions to commit to this month. Your pledge will be saved to{' '}
          <strong style={{ color: 'var(--accent-blue)' }}>Cloud Firestore</strong> and tracked via{' '}
          <strong style={{ color: 'var(--accent-blue)' }}>BigQuery</strong> dashboards.
        </p>

        <div role="group" aria-label="30-day challenge actions">
          {CHALLENGES.map((action, i) => (
            <label
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: selected.includes(action)
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'var(--glass-base)',
                border: `1px solid ${selected.includes(action) ? 'rgba(16, 185, 129, 0.3)' : 'var(--glass-border)'}`,
                marginBottom: 8,
                fontSize: 14,
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(action)}
                onChange={() => togglePledge(action)}
                aria-label={action}
              />
              {action}
            </label>
          ))}
        </div>

        {pledgeSaved ? (
          <div
            style={{
              marginTop: 16,
              padding: '14px 16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              fontSize: 14,
              color: 'var(--accent-emerald)',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {authMode === 'firebase'
              ? '✅ Pledge saved to Firestore! Your UID is secured via Firebase Anonymous Auth.'
              : '✅ Pledge saved to session! Add Firebase credentials to persist across devices.'}
          </div>
        ) : (
          <button
            className="btn-glass"
            style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
            onClick={handleSavePledge}
            disabled={pledgeSaving || selected.length === 0}
            aria-busy={pledgeSaving ? 'true' : 'false'}
            aria-disabled={selected.length === 0 ? 'true' : 'false'}
          >
            {pledgeSaving
              ? '⏳ Saving…'
              : `✅ Save ${selected.length || ''} Pledge${selected.length !== 1 ? 's' : ''} to ${authMode === 'firebase' ? 'Firestore' : 'Session'}`}
          </button>
        )}
      </div>

      {/* Architecture note */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: 'rgba(96, 165, 250, 0.05)',
          borderColor: 'rgba(96, 165, 250, 0.2)',
        }}
      >
        <h3
          className="font-display"
          style={{
            margin: '0 0 16px',
            fontSize: 13,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--accent-blue)',
            fontWeight: 700,
          }}
        >
          ☁️ Google Cloud Architecture
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            ['Firebase Auth', 'Anonymous + social login, JWT tokens'],
            ['Cloud Firestore', 'Real-time NoSQL, footprint time-series'],
            ['Vertex AI', 'Gemini Pro fine-tuned on emissions data'],
            ['BigQuery', 'Aggregate analytics, cohort trends'],
            ['Cloud Run', 'Containerised Express API, scales to zero'],
            ['Firebase Hosting', 'Global CDN, HTTPS enforced, HTTP/2'],
          ].map(([svc, desc]) => (
            <div
              key={svc}
              style={{
                padding: '12px',
                background: 'var(--glass-base)',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
              }}
            >
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--accent-blue)' }}>
                {svc}
              </p>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

InsightsSection.propTypes = {
  /** AI-generated insights object (null while loading or before first call) */
  insights: PropTypes.shape({
    tips: PropTypes.arrayOf(
      PropTypes.shape({
        tip: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        priority: PropTypes.string.isRequired,
        saving: PropTypes.number,
      }),
    ).isRequired,
    largestCategory: PropTypes.string.isRequired,
    potentialSaving: PropTypes.number.isRequired,
    total: PropTypes.number,
  }),
  /** True while the Vertex AI request is in-flight */
  loadingAI: PropTypes.bool.isRequired,
};

InsightsSection.defaultProps = {
  insights: null,
};
