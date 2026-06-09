/**
 * @fileoverview ErrorBoundary — React class component that catches rendering errors.
 *
 * Why a class component?
 * React only supports error boundaries as class components via
 * componentDidCatch / getDerivedStateFromError. There is no Hook equivalent.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 * @module components/ui/ErrorBoundary
 */
import { Component } from 'react';
import PropTypes from 'prop-types';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
    this.handleReset = this.handleReset.bind(this);
  }

  /**
   * Called when a descendant component throws during rendering.
   * Updates state so the next render shows the fallback UI.
   *
   * @param {Error} error - The thrown error
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message ?? 'Unknown error' };
  }

  /**
   * Called after an error is caught. Used for logging.
   * In production this could send to an error reporting service.
   *
   * @param {Error}  error - The thrown error
   * @param {Object} info  - Component stack trace
   */
  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught rendering error:', error.message);
      console.error('[ErrorBoundary] Component stack:', info.componentStack);
    }
  }

  /** Allow the user to retry after an error */
  handleReset() {
    this.setState({ hasError: false, errorMessage: '' });
  }

  render() {
    const { hasError, errorMessage } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // If a custom fallback was provided, render that
      if (fallback) return fallback;

      // Default fallback UI — styled to match the app's dark theme
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 16,
            padding: 32,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48 }} aria-hidden="true">
            ⚠️
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--text-primary, #f1f5f9)',
              fontFamily: 'var(--font-display, sans-serif)',
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--text-tertiary, #64748b)',
              maxWidth: 400,
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred. Please try reloading the page.
            {import.meta.env.DEV && errorMessage && (
              <>
                <br />
                <code style={{ color: 'var(--accent-red, #ef4444)', fontSize: 12 }}>
                  {errorMessage}
                </code>
              </>
            )}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              id="error-boundary-retry"
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: '1px solid var(--glass-border, rgba(255,255,255,0.1))',
                background: 'var(--glass-bg, rgba(255,255,255,0.05))',
                color: 'var(--text-primary, #f1f5f9)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Try again
            </button>
            <button
              id="error-boundary-reload"
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--accent-emerald, #34d399)',
                color: '#000',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  /** Content to protect */
  children: PropTypes.node.isRequired,
  /** Optional custom fallback UI to render on error */
  fallback: PropTypes.node,
};

ErrorBoundary.defaultProps = {
  fallback: null,
};
