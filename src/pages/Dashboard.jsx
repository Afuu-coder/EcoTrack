/**
 * Dashboard — main page orchestrating survey → results → insights flow
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFootprint }     from '@/hooks/useFootprint';
import { useAuthContext }   from '@/context/AuthContext';
import { saveFootprint }    from '@/services/firestore';
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

  const {
    transport, diet, energy, shopping,
    setTransport, setDiet, setEnergy, setShopping,
    inputs, total, breakdown, gradeInfo,
  } = useFootprint();

  const { userId, user } = useAuthContext();

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
      saveFootprint(userId, { total, breakdown, inputs }).catch(console.error);
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
    </div>
  );
}
