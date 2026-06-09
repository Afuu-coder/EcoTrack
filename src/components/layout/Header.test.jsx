/**
 * @file src/components/layout/Header.test.jsx
 * @description Unit tests for Header component.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from './Header';
import { AuthContext } from '@/context/AuthContext';

const mockAuth = {
  authLoading: false,
  authMode: 'login',
  isAuthenticated: true,
  user: { displayName: 'John Doe', photoURL: '', email: 'john@example.com' },
  loginWithGoogle: () => {},
  logout: () => {},
};

describe('Header', () => {
  it('renders the application title', () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <Header />
      </AuthContext.Provider>
    );
    expect(screen.getByText('EcoTrack')).toBeInTheDocument();
  });
});
