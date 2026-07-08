/**
 * currentWeek selector tests (Sprint C15b).
 *
 * Acceptance:
 *   1. Fresh state (no flags) → week 1.
 *   2. Setting Q1_WEEK1_RESOLVED → week 2.
 *   3. All 12 resolution flags set → currentWeek is null (Q1 closed).
 *   4. selectCurrentEntry returns the same directive entry TopBar/PriorityTasks
 *      will consume (verified by slug/id round-trip).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import { selectCurrentWeek, selectCurrentEntry } from './currentWeek'
import { Q1_SEQUENCE } from '@content/directiveSchedule'
import {
  Q1_WEEK1_RESOLVED,
  Q1_WEEK2_RESOLVED,
  Q1_WEEK3_RESOLVED,
  Q1_WEEK4_RESOLVED,
  Q1_WEEK5_RESOLVED,
  Q1_WEEK6_RESOLVED,
  Q1_WEEK7_RESOLVED,
  Q1_WEEK8_RESOLVED,
  Q1_WEEK9_RESOLVED,
  Q1_WEEK10_RESOLVED,
  Q1_WEEK11_RESOLVED,
  Q1_WEEK12_RESOLVED,
} from '@systems/gameFlags'

const ALL_Q1_FLAGS = [
  Q1_WEEK1_RESOLVED,
  Q1_WEEK2_RESOLVED,
  Q1_WEEK3_RESOLVED,
  Q1_WEEK4_RESOLVED,
  Q1_WEEK5_RESOLVED,
  Q1_WEEK6_RESOLVED,
  Q1_WEEK7_RESOLVED,
  Q1_WEEK8_RESOLVED,
  Q1_WEEK9_RESOLVED,
  Q1_WEEK10_RESOLVED,
  Q1_WEEK11_RESOLVED,
  Q1_WEEK12_RESOLVED,
]

describe('selectCurrentWeek / selectCurrentEntry', () => {
  beforeEach(() => {
    resetStore()
  })

  it('returns week 1 on a fresh state', () => {
    expect(selectCurrentWeek(useGameStore.getState())).toBe(1)
  })

  it('returns the Week 1 entry on a fresh state (slug = mercy-margin)', () => {
    const entry = selectCurrentEntry(useGameStore.getState())
    expect(entry?.slug).toBe('mercy-margin')
    expect(entry?.week).toBe(1)
  })

  it('advances to week 2 when Week 1 is resolved', () => {
    useGameStore.getState().setFlag(Q1_WEEK1_RESOLVED)
    expect(selectCurrentWeek(useGameStore.getState())).toBe(2)
  })

  it('advances week-by-week as each Q1 flag is added', () => {
    const store = useGameStore.getState()
    for (let i = 0; i < ALL_Q1_FLAGS.length - 1; i += 1) {
      store.setFlag(ALL_Q1_FLAGS[i]!)
      expect(selectCurrentWeek(useGameStore.getState())).toBe(i + 2)
    }
  })

  it('returns null once all 12 weeks are resolved', () => {
    const store = useGameStore.getState()
    for (const flag of ALL_Q1_FLAGS) store.setFlag(flag)
    expect(selectCurrentWeek(useGameStore.getState())).toBeNull()
    expect(selectCurrentEntry(useGameStore.getState())).toBeUndefined()
  })

  it('matches the same first-unresolved-entry rule Layout uses', () => {
    // The canonical derivation in Layout.tsx.
    const state = useGameStore.getState()
    const layoutEntry = Q1_SEQUENCE.find((e) => !state.flags.has(e.resolutionFlag))
    expect(selectCurrentEntry(state)).toBe(layoutEntry)
  })
})
