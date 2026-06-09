/**
 * Vitest configuration
 * - Uses jsdom for browser-like environment (required for React hooks + components)
 * - setupFiles loads @testing-library/jest-dom matchers globally
 * - plugin-react handles JSX transform (same as Vite production build)
 * - Collects coverage from all src files
 * - Path alias @/ → src/ (mirrors vite.config.js)
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/test/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
