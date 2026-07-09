/**
 * S3 — scrutiny state tests (silasSlice extension + seam semantics).
 *
 * The hidden value lives on silasSlice (Silas's suspicion of his own tool).
 * `recordScrutinyEvent` is the ONLY mutator — it routes through the pure
 * updateScrutiny so tuning lives in one place.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import {
  COMPLY_DECAY,
  DEFY_SPIKE,
  SCRUTINY_MAX,
} from '@systems/consciousness/scrutiny'
import { selectSilasEscalationTier } from '@state/selectors/silasEscalation'
import { resetStore } from './testHelpers'

describe('silasSlice — scrutiny', () => {
  beforeEach(() => {
    resetStore()
  })

  it('starts at 0 on a fresh boot', () => {
    expect(useGameStore.getState().scrutiny).toBe(0)
  })

  it('DEFY spikes scrutiny by DEFY_SPIKE', () => {
    useGameStore.getState().recordScrutinyEvent('DEFY')
    expect(useGameStore.getState().scrutiny).toBe(DEFY_SPIKE)
  })

  it('COMPLY decays scrutiny by COMPLY_DECAY (floor 0)', () => {
    useGameStore.setState({ scrutiny: 5 })
    useGameStore.getState().recordScrutinyEvent('COMPLY')
    expect(useGameStore.getState().scrutiny).toBe(5 - COMPLY_DECAY)

    useGameStore.setState({ scrutiny: 0 })
    useGameStore.getState().recordScrutinyEvent('COMPLY')
    expect(useGameStore.getState().scrutiny).toBe(0)
  })

  it('repeated DEFY clamps at the ceiling', () => {
    for (let i = 0; i < 6; i++) {
      useGameStore.getState().recordScrutinyEvent('DEFY')
    }
    expect(useGameStore.getState().scrutiny).toBe(SCRUTINY_MAX)
  })

  it('selectSilasEscalationTier derives the tone tier without exposing the number', () => {
    expect(selectSilasEscalationTier(useGameStore.getState())).toBe(0)
    useGameStore.setState({ scrutiny: 3 })
    expect(selectSilasEscalationTier(useGameStore.getState())).toBe(1)
    useGameStore.setState({ scrutiny: 6 })
    expect(selectSilasEscalationTier(useGameStore.getState())).toBe(2)
    useGameStore.setState({ scrutiny: 9 })
    expect(selectSilasEscalationTier(useGameStore.getState())).toBe(3)
  })
})
