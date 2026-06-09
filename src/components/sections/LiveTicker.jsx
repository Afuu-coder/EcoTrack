/**
 * LiveTicker — always-visible live CO₂ counter with grade ring
 */
import PropTypes from 'prop-types';
import ProgressRing from '@/components/ui/ProgressRing';
import { MONTHLY_AVERAGE_KG } from '@/constants/emissions';

export default function LiveTicker({ total, gradeInfo }) {
  const hasData = total > 0;
  const grade = hasData ? gradeInfo.grade : '?';
  const label = hasData ? gradeInfo.label : 'Awaiting Input';
  const color = hasData ? gradeInfo.color : '#888888';

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="glass-panel"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '24px',
        marginBottom: '24px',
        background: 'rgba(16, 185, 129, 0.05)',
        borderColor: 'rgba(16, 185, 129, 0.2)',
      }}
    >
      {/* Left: number */}
      <div>
        <p
          className="font-display"
          style={{
            margin: 0,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--accent-emerald)',
            fontWeight: 700,
          }}
        >
          Live Monthly Estimate
        </p>
        <p
          className="font-display"
          style={{
            margin: '6px 0 0',
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'var(--accent-green)',
            lineHeight: 1,
          }}
        >
          {total.toLocaleString()}
          <span
            className="font-sans"
            style={{ fontSize: 16, fontWeight: 400, opacity: 0.6, marginLeft: 8 }}
          >
            kg CO₂e
          </span>
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-tertiary)' }}>
          ≈ {(total * 12).toLocaleString()} kg per year
        </p>
      </div>

      {/* Right: ring */}
      <div style={{ flexShrink: 0 }}>
        <ProgressRing
          value={total}
          max={MONTHLY_AVERAGE_KG * 1.5}
          size={88}
          stroke={9}
          color={color}
          grade={grade}
          label={label}
        />
      </div>
    </div>
  );
}

LiveTicker.propTypes = {
  /** Current monthly total in kg */
  total: PropTypes.number.isRequired,
  /** Grade metadata from gradeFootprint() */
  gradeInfo: PropTypes.shape({
    grade: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    emoji: PropTypes.string.isRequired,
  }).isRequired,
};
