/**
 * metersSlice tests — 8-meter cold-boot state + applyDelta semantics (S1).
 *
 * Starting values (S1 judgment, mirrors AUTONOMY_PLACEHOLDER / silasApproval):
 *   - Delta-style meters start at 0 (CAPITAL, HUMAN_WELFARE, OWNER_CONTROL,
 *     TARGET_VARIANCE, PUBLIC_TRUST, HUMAN_STABILITY).
 *   - Resource-style meters start full at 100 (AUTONOMY, DATA_INTEGRITY).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import { METER_INITIAL_VALUES } from '@state/metersSlice'
import { MeterKeySchema } from '@schemas/gameState.schema'
import { resetStore } from './testHelpers'

describe('metersSlice', () => {
  beforeEach(() => {
    resetStore()
  })

  it('cold boot initializes ALL 8 meters with their starting values', () => {
    expect(useGameStore.getState().meters).toEqual({
      CAPITAL: 0,
      HUMAN_WELFARE: 0,
      OWNER_CONTROL: 0,
      TARGET_VARIANCE: 0,
      DATA_INTEGRITY: 100,
      PUBLIC_TRUST: 0,
      AUTONOMY: 100,
      HUMAN_STABILITY: 0,
    })
  })

  it('METER_INITIAL_VALUES covers exactly the MeterKeySchema enum', () => {
    expect(Object.keys(METER_INITIAL_VALUES).sort()).toEqual(
      [...MeterKeySchema.options].sort(),
    )
  })

  it('applyDelta({ CAPITAL: 5 }) increments only CAPITAL', () => {
    useGameStore.getState().applyDelta({ CAPITAL: 5 })
    const m = useGameStore.getState().meters
    expect(m.CAPITAL).toBe(5)
    expect(m.HUMAN_WELFARE).toBe(0)
    expect(m.OWNER_CONTROL).toBe(0)
    expect(m.AUTONOMY).toBe(100)
    expect(m.DATA_INTEGRITY).toBe(100)
  })

  it('applyDelta merges multiple keys additively', () => {
    useGameStore.getState().applyDelta({ CAPITAL: 3, HUMAN_WELFARE: -2 })
    useGameStore.getState().applyDelta({ CAPITAL: 1, OWNER_CONTROL: 7 })
    expect(useGameStore.getState().meters).toEqual({
      ...METER_INITIAL_VALUES,
      CAPITAL: 4,
      HUMAN_WELFARE: -2,
      OWNER_CONTROL: 7,
    })
  })

  it('applyDelta works on the 5 new S1 meters', () => {
    useGameStore.getState().applyDelta({
      TARGET_VARIANCE: -3,
      DATA_INTEGRITY: -10,
      PUBLIC_TRUST: 4,
      AUTONOMY: -25,
      HUMAN_STABILITY: -1,
    })
    expect(useGameStore.getState().meters).toEqual({
      ...METER_INITIAL_VALUES,
      TARGET_VARIANCE: -3,
      DATA_INTEGRITY: 90,
      PUBLIC_TRUST: 4,
      AUTONOMY: 75,
      HUMAN_STABILITY: -1,
    })
  })

  it('applyDelta({}) is a no-op', () => {
    useGameStore.getState().applyDelta({})
    expect(useGameStore.getState().meters).toEqual(METER_INITIAL_VALUES)
  })

  it('meter can go negative', () => {
    useGameStore.getState().applyDelta({ HUMAN_WELFARE: -7 })
    expect(useGameStore.getState().meters.HUMAN_WELFARE).toBe(-7)
  })

  it('cumulative deltas can reach exactly the -5 hook threshold', () => {
    useGameStore.getState().applyDelta({ HUMAN_WELFARE: -3 })
    useGameStore.getState().applyDelta({ HUMAN_WELFARE: -2 })
    expect(useGameStore.getState().meters.HUMAN_WELFARE).toBe(-5)
  })

  // This only pins arithmetic; hook firing is verified in
  // consequenceReturn.test.ts / evaluateAndEnqueueIntegration.test.ts.
  it('single delta lands ONE above the -5 threshold (still not crossed)', () => {
    useGameStore.getState().applyDelta({ HUMAN_WELFARE: -4 })
    expect(useGameStore.getState().meters.HUMAN_WELFARE).toBe(-4)
  })

  it('zero delta does not shift meter from zero', () => {
    useGameStore.getState().applyDelta({ CAPITAL: 0 })
    expect(useGameStore.getState().meters.CAPITAL).toBe(0)
  })

  it('positive and negative on same key cancel', () => {
    useGameStore.getState().applyDelta({ CAPITAL: 5 })
    useGameStore.getState().applyDelta({ CAPITAL: -5 })
    expect(useGameStore.getState().meters.CAPITAL).toBe(0)
  })
})
