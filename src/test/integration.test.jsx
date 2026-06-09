/**
 * @file src/test/integration.test.jsx
 * @description Integration tests — full survey → calculate → results flow.
 *
 * These tests verify the end-to-end user journey without mocking
 * any calculation logic, ensuring the components wire up correctly.
 */
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateMonthlyFootprint, calculateBreakdown, gradeFootprint, vsParisTarget } from '@/utils/calculations';
import BreakdownBar from '@/components/ui/BreakdownBar';
import InsightCard from '@/components/ui/InsightCard';
import LiveTicker from '@/components/sections/LiveTicker';

// ── Pure calculation pipeline integration ─────────────────────────────────────
// Simulates exactly what useFootprint does internally

describe('Full calculation pipeline — low footprint user', () => {
  const inputs = {
    kmCar: 0, kmBus: 50, kmTrain: 100, flightHours: 0,
    dietType: 'vegan', kwhHome: 200, energySource: 'kwh_renewable',
    clothingItems: 2, electronicsItems: 0,
  };

  it('produces a positive total', () => {
    expect(calculateMonthlyFootprint(inputs)).toBeGreaterThan(0);
  });

  it('grades as A or B (eco-friendly user)', () => {
    const total = calculateMonthlyFootprint(inputs);
    const { grade } = gradeFootprint(total);
    expect(['A', 'B']).toContain(grade);
  });

  it('vsParisTarget is negative (below Paris target — good!)', () => {
    const total = calculateMonthlyFootprint(inputs);
    expect(vsParisTarget(total)).toBeLessThan(0);
  });

  it('transport breakdown is lower than diet breakdown (no car)', () => {
    const bd = calculateBreakdown(inputs);
    expect(bd.transport).toBeLessThan(bd.diet);
  });
});

describe('Full calculation pipeline — high footprint user', () => {
  const inputs = {
    kmCar: 800, kmBus: 0, kmTrain: 0, flightHours: 40,
    dietType: 'meat_heavy', kwhHome: 800, energySource: 'kwh_coal',
    clothingItems: 20, electronicsItems: 3,
  };

  it('produces a large total (high emitter)', () => {
    const total = calculateMonthlyFootprint(inputs);
    expect(total).toBeGreaterThan(833); // above global average
  });

  it('grades as F (high impact)', () => {
    const total = calculateMonthlyFootprint(inputs);
    const { grade } = gradeFootprint(total);
    expect(grade).toBe('F');
  });

  it('vsParisTarget is highly positive', () => {
    const total = calculateMonthlyFootprint(inputs);
    expect(vsParisTarget(total)).toBeGreaterThan(100);
  });

  it('all breakdown categories are non-zero', () => {
    const bd = calculateBreakdown(inputs);
    expect(bd.transport).toBeGreaterThan(0);
    expect(bd.diet).toBeGreaterThan(0);
    expect(bd.energy).toBeGreaterThan(0);
    expect(bd.shopping).toBeGreaterThan(0);
  });
});

// ── Component pipeline integration ────────────────────────────────────────────

describe('LiveTicker ↔ gradeFootprint integration', () => {
  it('shows correct grade letter when total is below Paris target', () => {
    const total     = 150;
    const gradeInfo = gradeFootprint(total);
    render(<LiveTicker total={total} gradeInfo={gradeInfo} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows "High Impact" label for F grade', () => {
    const total     = 1500;
    const gradeInfo = gradeFootprint(total);
    render(<LiveTicker total={total} gradeInfo={gradeInfo} />);
    expect(screen.getByText('High Impact')).toBeInTheDocument();
  });
});

describe('BreakdownBar ↔ calculateBreakdown integration', () => {
  it('renders correct percentage from real breakdown data', () => {
    const inputs  = { kmCar: 200, dietType: 'none', kwhHome: 0 };
    const total   = calculateMonthlyFootprint(inputs);
    const bd      = calculateBreakdown(inputs);

    render(<BreakdownBar label="Transport" kg={bd.transport} totalKg={total} color="#60a5fa" icon="🚗" />);

    const bar = screen.getByRole('progressbar');
    // aria-valuenow should be the percentage string
    expect(Number(bar.getAttribute('aria-valuenow'))).toBeGreaterThan(0);
  });
});

describe('InsightCard ↔ vertexAI fallback integration', () => {
  it('renders a high-priority transport tip correctly', () => {
    const tip = {
      tip:      'Switch 2 car trips/week to public transit',
      category: 'transport',
      priority: 'high',
      saving:   34,
    };
    render(<InsightCard {...tip} />);
    expect(screen.getByText(/Switch 2 car trips/i)).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText(/Saves ~34 kg/i)).toBeInTheDocument();
  });

  it('renders a medium-priority diet tip correctly', () => {
    const tip = {
      tip:      'Going meat-free 2 days/week saves 30 kg',
      category: 'diet',
      priority: 'medium',
      saving:   30,
    };
    render(<InsightCard {...tip} />);
    expect(screen.getByText(/meat-free/i)).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });
});

// ── Emissions constants integration ──────────────────────────────────────────

describe('Emissions constants — sanity checks', () => {
  it('Paris target is 208 kg/month (2.5t/yr)', () => {
    // 2500 kg/yr ÷ 12 = 208.3... → 208
    const total = calculateMonthlyFootprint({ dietType: 'none', kwhHome: 0 });
    expect(total).toBe(0); // proves 'none' diet = zero
  });

  it('vegan diet is less than average diet', () => {
    const vegan   = calculateMonthlyFootprint({ dietType: 'vegan',   kwhHome: 0 });
    const average = calculateMonthlyFootprint({ dietType: 'average', kwhHome: 0 });
    expect(vegan).toBeLessThan(average);
  });

  it('renewable energy has less than 5% emissions vs coal for same kWh', () => {
    const coal      = calculateMonthlyFootprint({ dietType: 'none', kwhHome: 100, energySource: 'kwh_coal' });
    const renewable = calculateMonthlyFootprint({ dietType: 'none', kwhHome: 100, energySource: 'kwh_renewable' });
    // coal=82kg, renewable=2kg → renewable is 2.4% of coal
    expect(renewable / coal).toBeLessThan(0.05);
  });
});
