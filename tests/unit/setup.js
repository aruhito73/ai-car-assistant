import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver (required for Recharts)
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { afterEach } from 'vitest';

// JSDOM native storage auto-cleared after each test block
afterEach(() => {
  localStorage.clear();
});
