/**
 * ProgressRing — animated SVG ring for grade display
 * @param {{ value, max, size, stroke, color, grade, label }} props
 */
export default function ProgressRing({ value, max, size = 120, stroke = 10, color, grade, label }) {
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const ratio  = Math.min(value / max, 1);
  const offset = circ - ratio * circ;

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        role="img"
        aria-label={`${grade} grade — ${Math.round(ratio * 100)}% of max`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {/* Center label */}
      {grade && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: size * 0.26, fontWeight: 900, color, lineHeight: 1 }}>{grade}</span>
          {label && <span style={{ fontSize: size * 0.11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{label}</span>}
        </div>
      )}
    </div>
  );
}
