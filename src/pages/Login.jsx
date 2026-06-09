import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconLeaf, IconArrowLeft, IconUser } from '@tabler/icons-react';
import { useAuthContext } from '@/context/AuthContext';

// Google Logo SVG inline
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function Login({ onBack }) {
  const { loginWithGoogle, loginAnonymously, authLoading } = useAuthContext();
  const [loading, setLoading] = useState(null); // 'google' | 'anon' | null

  const handleGoogle = async () => {
    setLoading('google');
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const handleAnon = async () => {
    // No anonymous auth in this build — redirect to Google sign-in
    setLoading('anon');
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="login-page">
      {/* Mesh bg */}
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" style={{ opacity: 0.7 }} />
        <div className="mesh-orb mesh-orb-2" style={{ opacity: 0.7 }} />
        <div className="mesh-orb mesh-orb-3" style={{ opacity: 0.6 }} />
      </div>
      <div className="noise-overlay" />

      {/* Back button */}
      <button className="login-back-btn" onClick={onBack}>
        <IconArrowLeft size={16} />
        Back to Home
      </button>

      {/* Login Card */}
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <motion.div
          className="login-logo animate-pulse-glow"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <IconLeaf size={36} color="#000" />
        </motion.div>

        <h1 className="login-title gradient-text">Welcome Back</h1>
        <p className="login-subtitle">
          Sign in to track your carbon footprint, access AI-powered insights, and join the EcoTrack
          community.
        </p>

        {/* Google Sign-In */}
        <motion.button
          className="btn-google"
          onClick={handleGoogle}
          disabled={loading !== null}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading === 'google' ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ animation: 'spin 1s linear infinite' }}
              >
                <circle cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="3" />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="#1f1f1f"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Signing in...
            </span>
          ) : (
            <>
              <GoogleLogo />
              Continue with Google
            </>
          )}
        </motion.button>

        <div className="login-divider">or</div>

        {/* Anonymous */}
        <motion.button
          className="btn-anonymous"
          onClick={handleAnon}
          disabled={loading !== null}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {loading === 'anon' ? (
            '⏳ Entering...'
          ) : (
            <>
              <IconUser size={16} />
              Continue as Guest
            </>
          )}
        </motion.button>

        {/* Trust indicators */}
        <div
          style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {[
              { icon: '🔐', text: 'Secure OAuth 2.0' },
              { icon: '🛡️', text: 'GDPR Compliant' },
              { icon: '🌱', text: '100% Free' },
            ].map((item) => (
              <div
                key={item.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: 'var(--text-tertiary)',
                }}
              >
                <span>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
