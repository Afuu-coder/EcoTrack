/**
 * @file src/test/setup.js
 * @description Global test setup — imported by vitest before every test file.
 *
 * - Imports jest-dom matchers (toBeInTheDocument, toHaveValue, etc.)
 * - Makes React available globally (needed for JSX transform in test env)
 */
import '@testing-library/jest-dom';
import * as React from 'react';

// Make React available globally — Vite's plugin-react handles this in app code
// but test files run outside Vite so they need the global set explicitly.
globalThis.React = React;
