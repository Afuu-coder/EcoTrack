/**
 * @file src/App.test.jsx
 * @description Unit tests for the main App component.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { AuthContext } from '@/context/AuthContext';

const mockAuth = {
  authLoading: false,
  authMode: 'login',
  isAuthenticated: true,
  user: { displayName: 'John Doe', photoURL: '', email: 'john@example.com' },
  loginWithGoogle: () => {},
  logout: () => {},
};

describe('App', () => {
  it('renders without crashing and shows the main layout', () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
