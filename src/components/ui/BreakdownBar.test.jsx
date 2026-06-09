/**
 * @file src/components/ui/BreakdownBar.test.jsx
 * @description Unit tests for BreakdownBar component
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BreakdownBar from './BreakdownBar';

describe('BreakdownBar — rendering', () => {
  it('renders the category label', () => {
    render(<BreakdownBar label="Transport" kg={150} totalKg={500} color="#60a5fa" icon="🚗" />);
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('renders the kg value', () => {
    render(<BreakdownBar label="Diet" kg={200} totalKg={500} color="#a78bfa" icon="🥗" />);
    expect(screen.getByText(/200/)).toBeInTheDocument();
  });

  it('renders correct percentage (200/500 = 40%)', () => {
    render(<BreakdownBar label="Diet" kg={200} totalKg={500} color="#a78bfa" icon="🥗" />);
    expect(screen.getByText(/40\.0%/)).toBeInTheDocument();
  });

  it('shows 0% when totalKg is 0 (no division by zero crash)', () => {
    render(<BreakdownBar label="Energy" kg={0} totalKg={0} color="#fbbf24" icon="⚡" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('has role="progressbar" for accessibility', () => {
    render(<BreakdownBar label="Shopping" kg={50} totalKg={500} color="#f87171" icon="🛍️" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
  });

  it('progressbar has aria-valuenow set', () => {
    render(<BreakdownBar label="Transport" kg={100} totalKg={500} color="#60a5fa" icon="🚗" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow');
  });

  it('progressbar has aria-label describing the category', () => {
    render(<BreakdownBar label="Transport" kg={100} totalKg={500} color="#60a5fa" icon="🚗" />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-label')).toContain('Transport');
  });

  it('renders the category icon (aria-hidden)', () => {
    const { container } = render(<BreakdownBar label="Transport" kg={100} totalKg={500} color="#60a5fa" icon="🚗" />);
    expect(container.textContent).toContain('🚗');
  });
});
