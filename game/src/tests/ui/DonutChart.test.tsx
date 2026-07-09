/**
 * DonutChart tests (Sprint V5).
 *
 * Split into two blocks:
 *   1. `computeArcGeometry` — pure arithmetic. Pinned so a future refactor of
 *      the ring formula (e.g. moving to a stroke-based angular sweep) fails
 *      loudly instead of drifting the ring silently.
 *   2. `<DonutChart>` — render tests. Screen-reader label, background ring,
 *      progress arc, and the color rule (silas vs null accent) are the four
 *      surfaces the mockup relies on.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import { DonutChart } from '@ui/charts/DonutChart'
import { computeArcGeometry } from '@ui/charts/donutGeometry'

describe('computeArcGeometry', () => {
  it('produces a matching center for a square SVG', () => {
    const g = computeArcGeometry(0, 100, 96)
    expect(g.center).toBe(48)
  })

  it('clamps fraction into [0, 1] so an overshoot never wraps past the top', () => {
    const overshoot = computeArcGeometry(80, 50, 96)
    expect(overshoot.fraction).toBe(1)
    // dashOffset == 0 means the full ring is drawn (arc completes).
    expect(overshoot.dashOffset).toBe(0)
  })

  it('collapses fraction to 0 when max is non-positive (guard against div-by-zero)', () => {
    const zero = computeArcGeometry(50, 0, 96)
    expect(zero.fraction).toBe(0)
    expect(zero.dashOffset).toBe(zero.circumference)
  })

  it('computes fraction correctly for the mockup case (Q1 cash $40M / $50M target)', () => {
    const g = computeArcGeometry(40, 50, 96)
    expect(g.fraction).toBeCloseTo(0.8, 5)
    // dashOffset == circumference * (1 - 0.8) = circumference * 0.2.
    expect(g.dashOffset).toBeCloseTo(g.circumference * 0.2, 5)
  })

  it('never lets strokeWidth drop below 6 px, even at small sizes', () => {
    const tiny = computeArcGeometry(10, 100, 40)
    expect(tiny.strokeWidth).toBeGreaterThanOrEqual(6)
  })
})

describe('<DonutChart>', () => {
  afterEach(cleanup)

  it('exposes an aria-label combining the label and percent-of-target', () => {
    render(
      React.createElement(DonutChart, {
        value: 40,
        max: 50,
        label: 'Q1 CASH',
      }),
    )
    const img = screen.getByRole('img', { name: /Q1 CASH.*80% of target/i })
    expect(img).toBeInTheDocument()
  })

  it('honors an ariaLabel override when supplied', () => {
    render(
      React.createElement(DonutChart, {
        value: 40,
        max: 50,
        label: 'Q1 CASH',
        ariaLabel: '82% of quarterly cash target',
      }),
    )
    expect(
      screen.getByRole('img', { name: '82% of quarterly cash target' }),
    ).toBeInTheDocument()
  })

  it('uses null-accent stroke when the goal is not yet met', () => {
    render(
      React.createElement(DonutChart, {
        value: 40,
        max: 50,
        label: 'Q1 CASH',
      }),
    )
    const progress = screen.getByTestId('donut-progress')
    expect(progress.getAttribute('stroke')).toContain('null-accent')
  })

  it('uses silas-accent stroke once the goal is met (fraction >= 1)', () => {
    render(
      React.createElement(DonutChart, {
        value: 60,
        max: 50,
        label: 'Q1 CASH',
      }),
    )
    const progress = screen.getByTestId('donut-progress')
    expect(progress.getAttribute('stroke')).toContain('silas-accent')
  })

  it('renders the formatted center value when a formatter is supplied', () => {
    render(
      React.createElement(DonutChart, {
        value: 40,
        max: 50,
        label: 'Q1 CASH',
        formatValue: (v) => `$${v}M`,
      }),
    )
    expect(screen.getByText('$40M')).toBeInTheDocument()
  })
})
