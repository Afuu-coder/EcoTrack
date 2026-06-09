import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { IconLeaf, IconLogout } from '@tabler/icons-react';
import AuthBadge from '@/components/ui/AuthBadge';
import { useAuthContext } from '@/context/AuthContext';


export default function Header({ onLogoClick }) {
  const { authLoading, authMode, isAuthenticated, user, loginWithGoogle, logout } = useAuthContext();

  return (
    <header
      className="glass-header"
      role="banner"
      style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '14px 24px', justifyContent: 'space-between', alignItems: 'center' }}
    >
      {/* Logo */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        onClick={onLogoClick}
        role="link"
        tabIndex={0}
        aria-label="EcoTrack Home"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 38, height: 38,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--glow-green)',
            flexShrink: 0,
          }}
        >
          <IconLeaf size={22} color="#000" />
        </motion.div>
        <div>
          <h1 className="font-display gradient-text" style={{ fontSize: '22px', letterSpacing: '-0.03em', lineHeight: 1.1, fontWeight: 800 }}>EcoTrack</h1>
          <p className="font-display" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)' }}>
            Carbon Intelligence
          </p>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AuthBadge
          authLoading={authLoading}
          authMode={authMode}
          isAuthenticated={isAuthenticated}
          user={user}
          loginWithGoogle={loginWithGoogle}
          logout={logout}
        />
        {isAuthenticated && (
          <motion.button
            onClick={logout}
            className="btn-glass"
            style={{ padding: '8px 14px', fontSize: 13, gap: 6, color: 'var(--text-secondary)' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            title="Sign out"
          >
            <IconLogout size={15} />
            <span style={{ display: 'none' }}>Sign out</span>
          </motion.button>
        )}
      </div>
    </header>
  );
}

Header.propTypes = {
  /** Optional click handler for the logo / app name */
  onLogoClick: PropTypes.func,
};

Header.defaultProps = {
  onLogoClick: undefined,
};

