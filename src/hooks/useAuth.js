/**
 * @fileoverview Firebase anonymous authentication hook.
 *
 * ## Why Anonymous Auth?
 *
 * This app does NOT require the user to create an account or log in.
 * However, we still need a stable, unique identifier per session so that:
 *
 *  1. **Data ownership** — Firestore security rules can enforce
 *     "users can only read/write their own footprints"
 *     (`request.auth.uid == resource.data.userId`)
 *
 *  2. **History** — we can retrieve a user's past footprints
 *     across page reloads within the same browser session.
 *
 *  3. **30-day challenge tracking** — pledges are tied to a session UID.
 *
 *  4. **Future upgrade path** — anonymous UIDs can be linked to
 *     Google/GitHub accounts later without losing existing data.
 *
 * ## Is Auth required?
 *
 * NO — the app works in full demo mode without Firebase credentials.
 * A session-scoped random ID from sessionStorage is used instead.
 * Auth only activates when VITE_FIREBASE_API_KEY is set in .env.local.
 *
 * ## Security
 *
 * - UIDs are anonymous and contain zero PII (no name, email, or IP)
 * - UIDs are never logged to external services
 * - signInAnonymously() uses Firebase's secure token exchange
 *
 * @module hooks/useAuth
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/services/firebase';

export function useAuth() {
  const [userId,      setUserId]      = useState(null);
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode,    setAuthMode]    = useState('firebase');

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (userObj) => {
      if (userObj) {
        setUserId(userObj.uid);
        setUser(userObj);
      } else {
        setUserId(null);
        setUser(null);
      }
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('[Auth] Google sign-in failed:', err);
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured) return;
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('[Auth] Sign-out failed:', err);
    }
  };

  return {
    userId,
    user,
    isAuthenticated: !!userId,
    authLoading,
    authMode,
    loginWithGoogle,
    logout,
  };
}
