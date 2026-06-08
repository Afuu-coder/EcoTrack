/**
 * App entry point — wraps the entire app in AuthProvider
 * so Firebase anonymous auth is initialised once at the root
 * and available everywhere via useAuthContext().
 */
import { StrictMode }   from 'react';
import { createRoot }   from 'react-dom/client';
import { AuthProvider } from '@/context/AuthContext';
import App              from '@/App.jsx';
import '@/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*
      AuthProvider wraps the entire tree.
      Firebase anonymous sign-in happens once here.
      All components access userId via useAuthContext() — no prop drilling.
    */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
