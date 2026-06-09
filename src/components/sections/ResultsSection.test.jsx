/**
 * @file src/components/sections/ResultsSection.test.jsx
 * @description Integration tests for ResultsSection component
 *
 * Tests verify the full rendered output: grade card, breakdown bars,
 * comparison rows, Paris target bar, and the AI CTA button.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResultsSection from './ResultsSection';

const defaultProps = {
  total: 350,
  breakdown: { transport: 100, diet: 150, energy: 60, shopping: 40 },
  gradeInfo: { grade: 'B', label: 'Good', color: '#6ee7b7', emoji: '✅' },
  onGetInsights: vi.fn(),
};

describe('ResultsSection — rendering', () => {
  it('renders the "Your Results" heading', () => {
    render(<ResultsSection {...defaultProps} />);
    expect(screen.getByText('Your Results')).toBeInTheDocument();
  });

  it('displays total CO₂e value', () => {
    render(<ResultsSection {...defaultProps} />);
    // "350" appears in both the hero total and the comparison row ("You") — either is valid
    const matches = screen.getAllByText(/350/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('displays the grade letter', () => {
    render(<ResultsSection {...defaultProps} />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('displays the grade label', () => {
    render(<ResultsSection {...defaultProps} />);
    expect(screen.getByText(/Good/)).toBeInTheDocument();
  });

  it('renders "Emissions Breakdown" section heading', () => {
    render(<ResultsSection {...defaultProps} />);
    expect(screen.getByText(/Emissions Breakdown/i)).toBeInTheDocument();
  });

  it('renders all 4 breakdown category bars', () => {
    render(<ResultsSection {...defaultProps} />);
    const bars = screen.getAllByRole('progressbar');
    // At least 4 bars (breakdown) + 1 paris target bar
    expect(bars.length).toBeGreaterThanOrEqual(4);
  });

  it('renders "How You Compare" section', () => {
    render(<ResultsSection {...defaultProps} />);
    expect(screen.getByText(/How You Compare/i)).toBeInTheDocument();
  });

  it('renders "Paris Agreement target" in comparisons', () => {
    render(<ResultsSection {...defaultProps} />);
    expect(screen.getByText(/Paris target/i)).toBeInTheDocument();
  });

  it('renders Paris 1.5°C Pathway bar', () => {
    render(<ResultsSection {...defaultProps} />);
    expect(screen.getByText(/Paris 1\.5°C Pathway/i)).toBeInTheDocument();
  });

  it('renders AI insights CTA button', () => {
    render(<ResultsSection {...defaultProps} />);
    expect(screen.getByText(/Vertex AI/i)).toBeInTheDocument();
  });

  it('calls onGetInsights when CTA button is clicked', () => {
    const onGetInsights = vi.fn();
    render(<ResultsSection {...defaultProps} onGetInsights={onGetInsights} />);
    const btn = screen.getByText(/Vertex AI/i);
    fireEvent.click(btn);
    expect(onGetInsights).toHaveBeenCalledTimes(1);
  });

  it('shows correct global average value', () => {
    render(<ResultsSection {...defaultProps} />);
    // MONTHLY_AVERAGE_KG = 833
    expect(screen.getByText(/833/)).toBeInTheDocument();
  });

  it('shows correct Paris target value', () => {
    render(<ResultsSection {...defaultProps} />);
    // PARIS_TARGET_KG = 208
    expect(screen.getByText(/208/)).toBeInTheDocument();
  });
});

describe('ResultsSection — accessibility', () => {
  it('has aria-labelledby on the section', () => {
    const { container } = render(<ResultsSection {...defaultProps} />);
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-labelledby', 'results-heading');
  });

  it('results heading has id="results-heading"', () => {
    render(<ResultsSection {...defaultProps} />);
    expect(document.getElementById('results-heading')).toBeInTheDocument();
  });

  it('Paris target progressbar has descriptive aria-label', () => {
    render(<ResultsSection {...defaultProps} />);
    const bars = screen.getAllByRole('progressbar');
    const parisBar = bars.find((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('paris'),
    );
    expect(parisBar).toBeDefined();
  });
});

describe('ResultsSection — grade thresholds', () => {
  it('renders grade A for low footprint', () => {
    render(
      <ResultsSection
        {...defaultProps}
        total={100}
        gradeInfo={{ grade: 'A', label: 'Excellent', color: '#34d399', emoji: '🌟' }}
      />,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders grade F for very high footprint', () => {
    const { container } = render(
      <ResultsSection
        {...defaultProps}
        total={1200}
        gradeInfo={{ grade: 'F', label: 'High Impact', color: '#ef4444', emoji: '🔴' }}
      />,
    );
    expect(screen.getByText('F')).toBeInTheDocument();
    // 'High Impact' may be split across elements — use container.textContent
    expect(container.textContent).toContain('High Impact');
  });
});
