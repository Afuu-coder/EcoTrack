/**
 * ResultsSection — displays grade, breakdown bars, comparisons, and AI CTA
 */
import { useRef, useEffect } from 'react';
import BreakdownBar from '@/components/ui/BreakdownBar';
import { PARIS_TARGET_KG, MONTHLY_AVERAGE_KG, CATEGORIES } from '@/constants/emissions';

export default function ResultsSection({ total, breakdown, gradeInfo, onGetInsights }) {
  const headingRef = useRef(null);
  const { grade, label, color, emoji } = gradeInfo;

  // Focus management: focus section when it mounts
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const comparisons = [
    { label: 'vs Paris Agreement target', value: total - PARIS_TARGET_KG, unit: 'kg' },
    { label: 'vs Global average',         value: MONTHLY_AVERAGE_KG - total, unit: 'kg below' },
    { label: 'Annual equivalent',         value: total * 12, unit: 'kg/year', neutral: true },
  ];

  return (
    <section aria-labelledby="results-heading">
      <h2
        id="results-heading"
        className="section-title"
        tabIndex={-1}
        ref={headingRef}
        style={{ outline: 'none' }}
      >
        Your Results
      </h2>

      {/* ── Score Card ──────────────────────────────────────── */}
      <div
        className="glass-panel"
        style={{
          textAlign: 'center',
          padding: '36px 24px',
          background: `linear-gradient(135deg, ${color}1A, rgba(255,255,255,0.02))`,
          borderColor: `${color}40`,
          boxShadow: `0 8px 32px ${color}20`
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }} aria-hidden="true">{emoji}</div>
        <p className="font-display" style={{ margin: 0, fontSize: 52, fontWeight: 700, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {total.toLocaleString()}
          <span className="font-sans" style={{ fontSize: 18, fontWeight: 400, marginLeft: 8, opacity: 0.6 }}>kg CO₂e/mo</span>
        </p>
        <p style={{ margin: '10px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
          Grade{' '}
          <strong style={{ color, fontSize: 16 }}>{grade}</strong>
          {' '}— {label}
        </p>

        {/* Three-way comparison */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 24, flexWrap: 'wrap' }}>
          {[
            { lbl: '🟢 Paris target', val: PARIS_TARGET_KG, col: 'var(--accent-emerald)' },
            { lbl: `${emoji} You`,     val: total,              col: color },
            { lbl: '🌍 World avg',    val: MONTHLY_AVERAGE_KG, col: 'var(--accent-orange)' },
          ].map(({ lbl, val, col }) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <p className="font-display" style={{ margin: 0, fontSize: 22, fontWeight: 700, color: col }}>{val.toLocaleString()}</p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--text-tertiary)' }}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Emissions Breakdown ─────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '24px', margin: '24px 0' }}>
        <h3 className="section-title font-display" style={{ margin: '0 0 18px', fontSize: 18 }}>Emissions Breakdown</h3>
        {Object.entries(CATEGORIES).map(([key, { icon, color: catColor, label: catLabel }]) => (
          <BreakdownBar
            key={key}
            label={catLabel}
            kg={breakdown[key] || 0}
            totalKg={total}
            color={catColor}
            icon={icon}
          />
        ))}
      </div>

      {/* ── Comparisons ─────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '24px', margin: '24px 0' }}>
        <h3 className="section-title font-display" style={{ margin: '0 0 12px', fontSize: 18 }}>How You Compare</h3>
        {comparisons.map(({ label, value, unit, neutral }) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '11px 0', borderBottom: '1px solid var(--glass-border)',
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{
              fontSize: 14, fontWeight: 600,
              color: neutral ? 'var(--text-primary)' : value < 0 ? 'var(--accent-emerald)' : value > 0 ? 'var(--accent-red)' : 'var(--text-primary)',
            }}>
              {!neutral && value > 0 ? '+' : ''}{value.toLocaleString()}
              <span style={{ fontWeight: 400, opacity: 0.45, fontSize: 11, marginLeft: 4 }}>{unit}</span>
            </span>
          </div>
        ))}
      </div>

      {/* ── AI CTA ──────────────────────────────────────────── */}
      <button 
        className="btn-glass" 
        style={{ 
          width: '100%', 
          justifyContent: 'center', 
          padding: '14px', 
          fontSize: '16px',
          background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.4), rgba(139, 92, 246, 0.4))',
          boxShadow: 'var(--glow-purple)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          color: '#fff',
          fontWeight: 600
        }} 
        onClick={onGetInsights}
      >
        <span style={{ fontSize: 20 }}>🤖</span> Get Vertex AI Personalised Insights
      </button>
    </section>
  );
}
