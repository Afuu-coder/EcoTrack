/**
 * App root — multi-page shell: Landing → Login → Dashboard
 *
 * Wrapped in ErrorBoundary so any unexpected rendering error shows a
 * friendly fallback UI rather than a blank screen.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header        from '@/components/layout/Header';
import Dashboard     from '@/pages/Dashboard';
import Landing       from '@/pages/Landing';
import Login         from '@/pages/Login';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { useAuthContext } from '@/context/AuthContext';

export default function App() {
  const { isAuthenticated, authLoading } = useAuthContext();
  const [page, setPage] = useState('landing');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setPage('dashboard');
    }
    if (!authLoading && !isAuthenticated && page === 'dashboard') {
      setPage('landing');
    }
  }, [authLoading, isAuthenticated]);

  // ── Loading spinner ────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100vh', gap: 16,
        background: 'var(--bg-deep)',
      }}>
        <div className="mesh-bg">
          <div className="mesh-orb mesh-orb-1" />
          <div className="mesh-orb mesh-orb-2" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 48, height: 48,
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--accent-emerald)',
            borderRadius: '50%',
          }}
        />
        <p style={{ color: 'var(--text-tertiary)', fontSize: 14, fontFamily: 'var(--font-sans)' }}>
          Loading EcoTrack…
        </p>
      </div>
    );
  }

  // ── Page Renderer ──────────────────────────────────────────
  const renderPage = () => {
    // If authenticated, always show dashboard regardless of page state
    if (isAuthenticated) {
      return (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Header />
          <Dashboard />
        </motion.div>
      );
    }

    if (page === 'login') {
      return (
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Login onBack={() => setPage('landing')} />
        </motion.div>
      );
    }

    // Default: landing
    return (
      <motion.div
        key="landing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Landing onGetStarted={() => setPage('login')} />
      </motion.div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
