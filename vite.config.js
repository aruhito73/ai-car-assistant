/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/unit/setup.js',
    include: ['tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}', 'src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['tests/e2e/**/*', 'node_modules/**/*'],
  },
});
