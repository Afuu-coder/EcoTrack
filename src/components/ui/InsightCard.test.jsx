/**
 * @file src/components/ui/InsightCard.test.jsx
 * @description Unit tests for InsightCard component
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InsightCard from './InsightCard';

const defaultProps = {
  tip:      'Take public transit twice a week',
  category: 'transport',
  priority: 'high',
  saving:   34,
};

describe('InsightCard — rendering', () => {
  it('renders the tip text', () => {
    render(<InsightCard {...defaultProps} />);
    expect(screen.getByText('Take public transit twice a week')).toBeInTheDocument();
  });

  it('renders the saving amount when saving > 0', () => {
    render(<InsightCard {...defaultProps} saving={34} />);
    expect(screen.getByText(/Saves ~34 kg/i)).toBeInTheDocument();
  });

  it('does NOT render saving line when saving is 0', () => {
    render(<InsightCard {...defaultProps} saving={0} />);
    expect(screen.queryByText(/Saves/i)).not.toBeInTheDocument();
  });

  it('does NOT render saving line when saving is null', () => {
    render(<InsightCard {...defaultProps} saving={null} />);
    expect(screen.queryByText(/Saves/i)).not.toBeInTheDocument();
  });

  it('renders the priority badge in uppercase', () => {
    render(<InsightCard {...defaultProps} priority="high" />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('renders medium priority badge', () => {
    render(<InsightCard {...defaultProps} priority="medium" />);
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('has role="listitem" for accessibility', () => {
    render(<InsightCard {...defaultProps} />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('renders correct icon for transport category', () => {
    const { container } = render(<InsightCard {...defaultProps} category="transport" />);
    expect(container.textContent).toContain('🚗');
  });

  it('renders correct icon for diet category', () => {
    const { container } = render(<InsightCard {...defaultProps} category="diet" />);
    expect(container.textContent).toContain('🥗');
  });

  it('renders correct icon for energy category', () => {
    const { container } = render(<InsightCard {...defaultProps} category="energy" />);
    expect(container.textContent).toContain('⚡');
  });

  it('renders correct icon for shopping category', () => {
    const { container } = render(<InsightCard {...defaultProps} category="shopping" />);
    expect(container.textContent).toContain('🛍️');
  });

  it('falls back to 💡 icon for unknown category', () => {
    const { container } = render(<InsightCard {...defaultProps} category="unknown" />);
    expect(container.textContent).toContain('💡');
  });
});
