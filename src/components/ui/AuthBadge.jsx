import { motion } from 'framer-motion';

export default function AuthBadge({ authLoading, isAuthenticated, user }) {
  if (authLoading) {
    return (
      <div className="btn-glass" style={{ cursor: 'default', padding: '6px 16px' }} role="status" aria-live="polite">
        <span className="shimmer-text" style={{ fontSize: 12 }}>Loading…</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <motion.img
          src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=10b981&color=000&bold=true`}
          alt={user.displayName || 'User'}
          style={{
            width: 34, height: 34,
            borderRadius: '50%',
            border: '2px solid rgba(16,185,129,0.5)',
            boxShadow: '0 0 12px rgba(16,185,129,0.25)',
          }}
          referrerPolicy="no-referrer"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div style={{ lineHeight: 1.3 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {user.displayName?.split(' ')[0] || 'User'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: 0 }}>Google Account</p>
        </div>
      </div>
    );
  }

  return null;
}
