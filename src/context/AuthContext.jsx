/**
 * @fileoverview Auth Context — provides Firebase anonymous auth state globally.
 *
 * WHY A CONTEXT?
 *  Without context, `userId` would need to be passed as a prop through:
 *  App → Dashboard → SurveySection / ResultsSection / InsightsSection
 *  That's "prop drilling" — messy and hard to maintain.
 *
 *  With context: any component calls `useAuthContext()` and gets `userId`
 *  directly, without touching intermediate components.
 *
 * WHAT DOES ANONYMOUS AUTH GIVE US?
 *  🔐 Firestore Security Rules:
 *     allow write: if request.auth != null
 *                  && request.auth.uid == request.resource.data.userId;
 *
 *  This means a user can ONLY write/read their own documents.
 *  Without auth, there are no rules — anyone could access any data.
 *
 * @module context/AuthContext
 */
import { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

// ── Context ──────────────────────────────────────────────────────────────────

export const AuthContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────────────────────

/**
 * Wraps the app and makes auth state available to all children.
 * Must be placed at the root level (in main.jsx).
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const authState = useAuth();
  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
}

// ── Consumer Hook ─────────────────────────────────────────────────────────────

/**
 * Access auth state from any component without prop drilling.
 *
 * @returns {import('@/hooks/useAuth').AuthState}
 * @throws {Error} If called outside of <AuthProvider>
 *
 * @example
 * function MyComponent() {
 *   const { userId, authMode, isAuthenticated } = useAuthContext();
 *   return <p>Logged in as: {userId}</p>;
 * }
 */
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within <AuthProvider>');
  }
  return ctx;
}
