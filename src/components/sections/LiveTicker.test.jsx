/**
 * @file src/components/sections/LiveTicker.test.jsx
 * @description Unit tests for LiveTicker component
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LiveTicker from './LiveTicker';

const gradeA = { grade: 'A', label: 'Excellent', color: '#34d399', emoji: '🌟' };
const gradeF = { grade: 'F', label: 'High Impact', color: '#ef4444', emoji: '🔴' };

describe('LiveTicker — rendering', () => {
  it('shows "Live Monthly Estimate" label', () => {
    render(<LiveTicker total={300} gradeInfo={gradeA} />);
    expect(screen.getByText(/Live Monthly Estimate/i)).toBeInTheDocument();
  });

  it('displays the total kg value', () => {
    render(<LiveTicker total={300} gradeInfo={gradeA} />);
    expect(screen.getByText(/300/)).toBeInTheDocument();
  });

  it('displays the annual equivalent (total × 12)', () => {
    render(<LiveTicker total={300} gradeInfo={gradeA} />);
    // 300 × 12 = 3,600
    expect(screen.getByText(/3,600/)).toBeInTheDocument();
  });

  it('shows grade label when total > 0', () => {
    render(<LiveTicker total={300} gradeInfo={gradeA} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('shows "Awaiting Input" label when total is 0', () => {
    render(<LiveTicker total={0} gradeInfo={gradeA} />);
    expect(screen.getByText(/Awaiting Input/i)).toBeInTheDocument();
  });

  it('shows "?" grade when total is 0', () => {
    const { container } = render(<LiveTicker total={0} gradeInfo={gradeA} />);
    expect(container.textContent).toContain('?');
  });

  it('has aria-live="polite" for screen reader announcements', () => {
    const { container } = render(<LiveTicker total={300} gradeInfo={gradeA} />);
    expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
  });

  it('has aria-atomic="true" for complete announcement on change', () => {
    const { container } = render(<LiveTicker total={300} gradeInfo={gradeA} />);
    expect(container.firstChild).toHaveAttribute('aria-atomic', 'true');
  });

  it('renders correctly with high impact (F grade) footprint', () => {
    render(<LiveTicker total={1200} gradeInfo={gradeF} />);
    expect(screen.getByText(/1,200/)).toBeInTheDocument();
    expect(screen.getByText('High Impact')).toBeInTheDocument();
  });

  it('large numbers are formatted with locale commas', () => {
    render(<LiveTicker total={1500} gradeInfo={gradeA} />);
    expect(screen.getByText(/1,500/)).toBeInTheDocument();
  });
});
