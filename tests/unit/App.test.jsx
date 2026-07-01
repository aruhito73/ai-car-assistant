import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../src/App.jsx';

describe('App Smoke Test', () => {
  it('renders App and expects AI Car Assistant to be in the document', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /AI Car Assistant/i });
    expect(heading).toBeInTheDocument();
  });
});
