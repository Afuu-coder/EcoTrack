import { GCP_SERVICES } from '@/constants/emissions';

export default function GCPBanner() {
  return (
    <div
      role="complementary"
      aria-label="Google Cloud services powering EcoTrack"
      style={{
        background: 'var(--glass-base)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'nowrap',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      <div style={{
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        borderRight: '1px solid var(--glass-border)',
        paddingRight: '24px'
      }}>
        Deployed on <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>Google Cloud</span>
      </div>
      {GCP_SERVICES.map(({ icon, name, role }) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 16 }} aria-hidden="true">{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)' }}>{name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>· {role}</span>
        </div>
      ))}
    </div>
  );
}
