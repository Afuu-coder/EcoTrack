/**
 * BreakdownBar — animated horizontal progress bar for emission categories
 * @param {{ label, kg, totalKg, color, icon }} props
 */
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function BreakdownBar({ label, kg, totalKg, color, icon }) {
  const pct = totalKg > 0 ? ((kg / totalKg) * 100).toFixed(1) : 0;

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
          fontSize: 13,
          color: 'var(--text-secondary)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden="true" style={{ fontSize: 16 }}>
            {icon}
          </span>
          <span className="font-display" style={{ fontWeight: 500 }}>
            {label}
          </span>
        </span>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {kg.toLocaleString()} kg <span style={{ opacity: 0.5, fontWeight: 400 }}>({pct}%)</span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${kg} kg CO₂e, ${pct}% of total`}
        style={{
          height: 10,
          background: 'var(--glass-base)',
          border: '1px solid var(--glass-border)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.1 }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            borderRadius: 10,
            boxShadow: `0 0 10px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

BreakdownBar.propTypes = {
  /** Category label (e.g. "Transport") */
  label: PropTypes.string.isRequired,
  /** CO₂e kg for this category */
  kg: PropTypes.number.isRequired,
  /** Total monthly CO₂e kg (used to compute percentage) */
  totalKg: PropTypes.number.isRequired,
  /** CSS color string for the bar fill */
  color: PropTypes.string.isRequired,
  /** Emoji icon for the category */
  icon: PropTypes.string.isRequired,
};
