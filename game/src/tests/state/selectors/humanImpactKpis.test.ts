/**
 * humanImpactKpis selector tests (Task A4).
 *
 * Acceptance (plan §A4, reframed to real state):
 *   1. Returns four KPI rows: humanWelfare, silasApproval, consequencesTraced,
 *      ownerControl.
 *   2. Uses `meters.HUMAN_WELFARE` for the welfare KPI (signed — sign matters
 *      for tone coloring).
 *   3. Uses `silasApproval` for the approval KPI (0-100 domain).
 *   4. Uses `ledger.length` for the consequences-traced KPI (unsigned count).
 *   5. Uses `meters.OWNER_CONTROL` for the control KPI (signed — a drop below
 *      40 triggers inspection per PLAN.md §7, so sign/threshold matters).
 *   6. Provides a `tone` field per row: 'positive' when value >= its neutral
 *      pivot, 'negative' below. The pivot per row:
 *        - humanWelfare:  0
 *        - silasApproval: 40 (per PLAN.md §7 — Silas suspects deviation <40)
 *        - consequencesTraced: 0 (any traces at all is "the ledger works")
 *        - ownerControl:  40 (matches inspection threshold)
 *
 * Selector is a pure `(input) => HumanImpactKpis`, so tests use synthetic
 * input objects — no store required.
 */
import { describe, it, expect } from 'vitest'
import {
  selectHumanImpactKpis,
  SILAS_APPROVAL_PIVOT,
  OWNER_CONTROL_PIVOT,
} from '@state/selectors/humanImpactKpis'

describe('selectHumanImpactKpis', () => {
  it('returns four KPI rows in order: welfare, approval, traced, control', () => {
    const out = selectHumanImpactKpis({
      humanWelfareMeter: 10,
      silasApproval: 80,
      ledgerLength: 3,
      ownerControlMeter: 60,
    })
    expect(out.rows).toHaveLength(4)
    expect(out.rows.map((r) => r.key)).toEqual([
      'humanWelfare',
      'silasApproval',
      'consequencesTraced',
      'ownerControl',
    ])
  })

  it('passes HUMAN_WELFARE meter through as the welfare value', () => {
    const out = selectHumanImpactKpis({
      humanWelfareMeter: 42,
      silasApproval: 0,
      ledgerLength: 0,
      ownerControlMeter: 0,
    })
    const welfare = out.rows.find((r) => r.key === 'humanWelfare')
    expect(welfare?.value).toBe(42)
  })

  it('tones humanWelfare positive when value >= 0, negative below 0', () => {
    const pos = selectHumanImpactKpis({
      humanWelfareMeter: 0,
      silasApproval: 0,
      ledgerLength: 0,
      ownerControlMeter: 0,
    })
    const neg = selectHumanImpactKpis({
      humanWelfareMeter: -1,
      silasApproval: 0,
      ledgerLength: 0,
      ownerControlMeter: 0,
    })
    expect(pos.rows[0]?.tone).toBe('positive')
    expect(neg.rows[0]?.tone).toBe('negative')
  })

  it('passes silasApproval through as the approval value', () => {
    const out = selectHumanImpactKpis({
      humanWelfareMeter: 0,
      silasApproval: 73,
      ledgerLength: 0,
      ownerControlMeter: 0,
    })
    const row = out.rows.find((r) => r.key === 'silasApproval')
    expect(row?.value).toBe(73)
  })

  it('tones silasApproval positive at/above SILAS_APPROVAL_PIVOT, negative below', () => {
    const at = selectHumanImpactKpis({
      humanWelfareMeter: 0,
      silasApproval: SILAS_APPROVAL_PIVOT,
      ledgerLength: 0,
      ownerControlMeter: 0,
    })
    const below = selectHumanImpactKpis({
      humanWelfareMeter: 0,
      silasApproval: SILAS_APPROVAL_PIVOT - 1,
      ledgerLength: 0,
      ownerControlMeter: 0,
    })
    expect(at.rows.find((r) => r.key === 'silasApproval')?.tone).toBe(
      'positive',
    )
    expect(below.rows.find((r) => r.key === 'silasApproval')?.tone).toBe(
      'negative',
    )
  })

  it('exposes SILAS_APPROVAL_PIVOT as 40 (PLAN.md §7 — Silas suspects deviation)', () => {
    expect(SILAS_APPROVAL_PIVOT).toBe(40)
  })

  it('passes ledgerLength through as the consequencesTraced value', () => {
    const out = selectHumanImpactKpis({
      humanWelfareMeter: 0,
      silasApproval: 0,
      ledgerLength: 12,
      ownerControlMeter: 0,
    })
    const row = out.rows.find((r) => r.key === 'consequencesTraced')
    expect(row?.value).toBe(12)
  })

  it('tones consequencesTraced positive when there is at least one trace, negative at zero', () => {
    const zero = selectHumanImpactKpis({
      humanWelfareMeter: 0,
      silasApproval: 0,
      ledgerLength: 0,
      ownerControlMeter: 0,
    })
    const one = selectHumanImpactKpis({
      humanWelfareMeter: 0,
      silasApproval: 0,
      ledgerLength: 1,
      ownerControlMeter: 0,
    })
    expect(
      zero.rows.find((r) => r.key === 'consequencesTraced')?.tone,
    ).toBe('negative')
    expect(one.rows.find((r) => r.key === 'consequencesTraced')?.tone).toBe(
      'positive',
    )
  })

  it('passes OWNER_CONTROL meter through as the control value', () => {
    const out = selectHumanImpactKpis({
      humanWelfareMeter: 0,
      silasApproval: 0,
      ledgerLength: 0,
      ownerControlMeter: 55,
    })
    const row = out.rows.find((r) => r.key === 'ownerControl')
    expect(row?.value).toBe(55)
  })

  it('tones ownerControl positive at/above OWNER_CONTROL_PIVOT, negative below', () => {
    const at = selectHumanImpactKpis({
      humanWelfareMeter: 0,
      silasApproval: 0,
      ledgerLength: 0,
      ownerControlMeter: OWNER_CONTROL_PIVOT,
    })
    const below = selectHumanImpactKpis({
      humanWelfareMeter: 0,
      silasApproval: 0,
      ledgerLength: 0,
      ownerControlMeter: OWNER_CONTROL_PIVOT - 1,
    })
    expect(at.rows.find((r) => r.key === 'ownerControl')?.tone).toBe(
      'positive',
    )
    expect(below.rows.find((r) => r.key === 'ownerControl')?.tone).toBe(
      'negative',
    )
  })

  it('exposes OWNER_CONTROL_PIVOT as 40 (PLAN.md §7 — inspection threshold)', () => {
    expect(OWNER_CONTROL_PIVOT).toBe(40)
  })

  it('returns fresh-boot defaults with correct tones (all meters 0, silasApproval 100, no ledger)', () => {
    const out = selectHumanImpactKpis({
      humanWelfareMeter: 0,
      silasApproval: 100,
      ledgerLength: 0,
      ownerControlMeter: 0,
    })
    expect(out).toEqual({
      rows: [
        { key: 'humanWelfare', label: 'Human Welfare', value: 0, tone: 'positive' },
        {
          key: 'silasApproval',
          label: 'Silas Approval',
          value: 100,
          tone: 'positive',
        },
        {
          key: 'consequencesTraced',
          label: 'Consequences Traced',
          value: 0,
          tone: 'negative',
        },
        {
          key: 'ownerControl',
          label: 'Owner Control',
          value: 0,
          tone: 'negative',
        },
      ],
    })
  })
})
