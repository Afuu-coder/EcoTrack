/**
 * Dashboard — main page orchestrating survey → results → insights flow
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFootprint }      from '@/hooks/useFootprint';
import { useAuthContext }    from '@/context/AuthContext';
import { saveFootprint, getFootprintHistory } from '@/services/firestore';
import { getAIInsights }    from '@/services/vertexAI';
import LiveTicker           from '@/components/sections/LiveTicker';
import SurveySection        from '@/components/sections/SurveySection';
import ResultsSection       from '@/components/sections/ResultsSection';
import InsightsSection      from '@/components/sections/InsightsSection';


const TABS = [
  { id: 'survey',   label: 'Calculate',   emoji: '📝' },
  { id: 'results',  label: 'Results',     emoji: '📊' },
  { id: 'insights', label: 'AI Insights', emoji: '💡' },
];

export default function Dashboard() {
  const [step, setStep]                   = useState('survey');
  const [isSaving, setIsSaving]           = useState(false);
  const [insights, setInsights]           = useState(null);
  const [loadingAI, setLoadingAI]         = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [hasInsights, setHasInsights]     = useState(false);
  /** History of past footprint calculations for this user */
  const [history, setHistory]             = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);


  const {
    transport, diet, energy, shopping,
    setTransport, setDiet, setEnergy, setShopping,
    inputs, total, breakdown, gradeInfo,
  } = useFootprint();

  const { userId, user } = useAuthContext();

  /** Load footprint history once we have a userId */
  useEffect(() => {
    if (!userId || historyLoaded) return;
    getFootprintHistory(userId)
      .then(records => {
        setHistory(records);
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [userId, historyLoaded]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && step !== 'survey') setStep('survey');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step]);

  const handleCalculate = useCallback(async () => {
    setIsSaving(true);
    if (userId) {
      saveFootprint(userId, { total, breakdown, inputs })
        .then(() => {
          // Refresh history after new save
          return getFootprintHistory(userId);
        })
        .then(records => setHistory(records))
        .catch(console.error);
    }
    fetch('/api/analytics', {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, total, breakdown }),
    }).catch(err => console.error('Analytics error:', err));

    await new Promise(r => setTimeout(r, 600));
    setIsSaving(false);
    setHasCalculated(true);
    setStep('results');
  }, [userId, total, breakdown, inputs]);

  const handleGetInsights = useCallback(async () => {
    setLoadingAI(true);
    setInsights(null);
    setStep('insights');
    const data = await getAIInsights({ total, breakdown, inputs });
    setInsights({ ...data, total });
    setLoadingAI(false);
    setHasInsights(true);
  }, [total, breakdown, inputs]);

  const handleTabClick = (tabId) => {
    if (tabId === 'results'  && !hasCalculated) return;
    if (tabId === 'insights' && !hasInsights)   return;
    setStep(tabId);
  };

  const isTabDisabled = (tabId) => {
    if (tabId === 'results')  return !hasCalculated;
    if (tabId === 'insights') return !hasInsights;
    return false;
  };

  return (
    <div className="dashboard-container">

      {/* ── User Greeting ─────────────────────────────────── */}
      {user?.displayName && (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 32px 0' }}>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14, fontFamily: 'var(--font-sans)' }}>
            Welcome back,{' '}
            <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
              {user.displayName.split(' ')[0]}
            </span>{' '}
            👋
          </p>
        </div>
      )}

      {/* ── Tab Navigation ────────────────────────────────── */}
      <nav role="tablist" aria-label="Platform sections" className="dashboard-tabs">
        {TABS.map(({ id, label, emoji }) => {
          const isSelected = step === id;
          const disabled   = isTabDisabled(id);
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`panel-${id}`}
              id={`tab-${id}`}
              className={`dashboard-tab${isSelected ? ' active' : ''}`}
              style={{ opacity: disabled ? 0.35 : 1 }}
              onClick={() => handleTabClick(id)}
              disabled={disabled}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeTabBg"
                  className="dashboard-tab-bg"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>
                {emoji} {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Main Content ──────────────────────────────────── */}
      <main id="main-content" className="main-layout">

        <LiveTicker total={total} gradeInfo={gradeInfo} />

        <AnimatePresence mode="wait">
          {step === 'survey' && (
            <motion.div
              key="survey"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SurveySection
                transport={transport}  setTransport={setTransport}
                diet={diet}            setDiet={setDiet}
                energy={energy}        setEnergy={setEnergy}
                shopping={shopping}    setShopping={setShopping}
                onCalculate={handleCalculate}
                isSaving={isSaving}
              />
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResultsSection
                total={total}
                breakdown={breakdown}
                gradeInfo={gradeInfo}
                onGetInsights={handleGetInsights}
              />
            </motion.div>
          )}

          {step === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InsightsSection
                insights={insights}
                loadingAI={loadingAI}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footprint History Panel ─────────────────────────────── */}
      {history.length > 0 && (
        <section
          aria-labelledby="history-heading"
          style={{ maxWidth: 860, margin: '0 auto', padding: '0 32px 48px' }}
        >
          <h2
            id="history-heading"
            className="section-title font-display"
            style={{ fontSize: 18, marginBottom: 16 }}
          >
            📅 Your Footprint History
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
            }}
          >
            {history.slice(0, 6).map((record, idx) => {
              const date = record.ts
                ? new Date(record.ts?.seconds ? record.ts.seconds * 1000 : record.ts)
                    .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : `Entry ${history.length - idx}`;
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="glass-panel"
                  style={{ padding: '14px 16px', textAlign: 'center' }}
                  aria-label={`Footprint on ${date}: ${record.total} kg CO₂e`}
                >
                  <p
                    className="font-display"
                    style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--accent-emerald)' }}
                  >
                    {(record.total ?? 0).toLocaleString()}
                  </p>
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--text-tertiary)' }}>
                    kg CO₂e/mo
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {date}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
