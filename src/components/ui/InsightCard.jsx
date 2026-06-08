/**
 * InsightCard — AI recommendation card with priority colour coding
 * @param {{ tip, category, priority, saving }} props
 */
const PRIORITY_COLORS = { high: '#f97316', medium: '#facc15', low: '#34d399' };
const CAT_ICONS = { transport: '🚗', diet: '🥗', energy: '⚡', shopping: '🛍️' };

export default function InsightCard({ tip, category, priority, saving }) {
  const borderColor = PRIORITY_COLORS[priority] || PRIORITY_COLORS.low;
  const icon = CAT_ICONS[category] || '💡';

  return (
    <div
      role="listitem"
      className="glass-panel"
      style={{
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${borderColor}33`,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 12,
        marginBottom: 10,
        animation: 'slideIn 0.3s ease both',
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }} aria-hidden="true">
          {icon}
        </span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>
            {tip}
          </p>
          {saving != null && saving > 0 && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#34d399', fontWeight: 600 }}>
              ↓ Saves ~{saving} kg CO₂e/month
            </p>
          )}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          color: borderColor, background: `${borderColor}18`,
          padding: '2px 7px', borderRadius: 20, flexShrink: 0, alignSelf: 'flex-start',
        }}>
          {priority?.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
