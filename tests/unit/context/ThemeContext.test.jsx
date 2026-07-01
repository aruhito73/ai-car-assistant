import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../../../src/context/ThemeContext.jsx';
import { storage } from '../../../src/services/storage.js';

const TestComponent = () => {
  const {
    theme,
    setTheme,
    toggleTheme,
    glassmorphism,
    setGlassmorphism,
    toggleGlassmorphism
  } = useTheme();

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="glassmorphism">{glassmorphism ? 'enabled' : 'disabled'}</span>
      <button data-testid="btn-toggle-theme" onClick={toggleTheme}>Toggle Theme</button>
      <button data-testid="btn-toggle-glass" onClick={toggleGlassmorphism}>Toggle Glass</button>
      <button data-testid="btn-set-light" onClick={() => setTheme('light')}>Set Light</button>
      <button data-testid="btn-set-glass-false" onClick={() => setGlassmorphism(false)}>Disable Glass</button>
    </div>
  );
};

describe('ThemeContext Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    // Clear root document classes
    document.documentElement.className = '';
  });

  it('should initialize with default storage values (dark/enabled)', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('glassmorphism').textContent).toBe('enabled');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('glassmorphism')).toBe(true);
  });

  it('should initialize with values from storage if present', () => {
    storage.saveTheme('light');
    storage.saveGlassmorphism(false);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(screen.getByTestId('glassmorphism').textContent).toBe('disabled');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('glassmorphism')).toBe(false);
  });

  it('should update theme and storage when setTheme/toggleTheme is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByTestId('btn-toggle-theme');
    const setLightBtn = screen.getByTestId('btn-set-light');

    // Toggle theme: dark -> light
    act(() => {
      toggleBtn.click();
    });
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(storage.getTheme()).toBe('light');

    // Set light again (no change)
    act(() => {
      setLightBtn.click();
    });
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(storage.getTheme()).toBe('light');

    // Toggle theme: light -> dark
    act(() => {
      toggleBtn.click();
    });
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(storage.getTheme()).toBe('dark');
  });

  it('should update glassmorphism and storage when setGlassmorphism/toggleGlassmorphism is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByTestId('btn-toggle-glass');
    const setFalseBtn = screen.getByTestId('btn-set-glass-false');

    // Toggle glassmorphism: true -> false
    act(() => {
      toggleBtn.click();
    });
    expect(screen.getByTestId('glassmorphism').textContent).toBe('disabled');
    expect(document.documentElement.classList.contains('glassmorphism')).toBe(false);
    expect(storage.getGlassmorphism()).toBe(false);

    // Disable glassmorphism again (no change)
    act(() => {
      setFalseBtn.click();
    });
    expect(screen.getByTestId('glassmorphism').textContent).toBe('disabled');
    expect(document.documentElement.classList.contains('glassmorphism')).toBe(false);
    expect(storage.getGlassmorphism()).toBe(false);

    // Toggle glassmorphism: false -> true
    act(() => {
      toggleBtn.click();
    });
    expect(screen.getByTestId('glassmorphism').textContent).toBe('enabled');
    expect(document.documentElement.classList.contains('glassmorphism')).toBe(true);
    expect(storage.getGlassmorphism()).toBe(true);
  });

  it('should throw an error when useTheme is called outside ThemeProvider', () => {
    const BadComponent = () => {
      useTheme();
      return null;
    };

    // Suppress console.error output for the boundary tests
    const originalError = console.error;
    console.error = () => {};

    expect(() => render(<BadComponent />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );

    console.error = originalError;
  });
});
