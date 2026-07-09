/**
 * Persist migration test — 3-meter economy (≤v2) → 8-meter economy (v3) (S1).
 *
 * A player whose `echo9:autosave` predates the 8-meter expansion has a
 * `meters` record with only CAPITAL / HUMAN_WELFARE / OWNER_CONTROL. That save
 * MUST load: the v2 → v3 migration arm fills the 5 new meters with their
 * cold-boot starting values while preserving the persisted values of the
 * original 3.
 *
 * Cases:
 *   1. PERSIST_VERSION is at least 3 (guard against regression).
 *   2. A v2 blob with 3 meters loads with all 8, defaults filled.
 *   3. Persisted values of the original 3 meters survive migration verbatim.
 *   4. A blob already at v3 with 8 meters passes through untouched.
 *   5. Tampered meters (non-numeric value / unknown key) are sanitized.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, PERSIST_KEY, PERSIST_VERSION } from '@state/store'
import { METER_INITIAL_VALUES } from '@state/metersSlice'
import { PANEL_IDS } from '@systems/tutorial/hudDisclosure'

function emptyUseCount(): Record<string, number> {
  const out: Record<string, number> = {}
  for (const id of PANEL_IDS) out[id] = 0
  return out
}

function seedBlob(meters: Record<string, unknown>, version: number): void {
  const blob = {
    state: {
      meters,
      scheduledConsequences: [],
      ledger: [],
      currentPromptId: null,
      installedModules: {},
      flags: [],
      capitalDeployedThisQuarter: false,
      pendingFiredHooks: [],
      disclosedPanels: [],
      panelUseCount: emptyUseCount(),
    },
    version,
  }
  localStorage.setItem(PERSIST_KEY, JSON.stringify(blob))
}

/** Prime in-memory meters to a sentinel so we can tell rehydrate ran. */
function primeSentinelMeters(): void {
  useGameStore.setState({
    meters: { ...METER_INITIAL_VALUES, CAPITAL: -999 },
  })
}

describe('persist migration — meters v2 → v3 (3 → 8 meters)', () => {
  beforeEach(() => {
    localStorage.removeItem(PERSIST_KEY)
  })

  it('exposes a PERSIST_VERSION of at least 3 (bumped for the 8-meter economy)', () => {
    expect(PERSIST_VERSION).toBeGreaterThanOrEqual(3)
  })

  it('loads a v2 save with only 3 meters and fills the 5 new meters with defaults', async () => {
    primeSentinelMeters()
    seedBlob({ CAPITAL: 12, HUMAN_WELFARE: -4, OWNER_CONTROL: 55 }, 2)

    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().meters).toEqual({
      CAPITAL: 12,
      HUMAN_WELFARE: -4,
      OWNER_CONTROL: 55,
      TARGET_VARIANCE: METER_INITIAL_VALUES.TARGET_VARIANCE,
      DATA_INTEGRITY: METER_INITIAL_VALUES.DATA_INTEGRITY,
      PUBLIC_TRUST: METER_INITIAL_VALUES.PUBLIC_TRUST,
      AUTONOMY: METER_INITIAL_VALUES.AUTONOMY,
      HUMAN_STABILITY: METER_INITIAL_VALUES.HUMAN_STABILITY,
    })
  })

  it('passes an already-v3 blob with 8 meters through untouched', async () => {
    primeSentinelMeters()
    seedBlob(
      {
        ...METER_INITIAL_VALUES,
        CAPITAL: 33,
        AUTONOMY: 80,
        PUBLIC_TRUST: -6,
      },
      PERSIST_VERSION,
    )

    await useGameStore.persist.rehydrate()

    const m = useGameStore.getState().meters
    expect(m.CAPITAL).toBe(33)
    expect(m.AUTONOMY).toBe(80)
    expect(m.PUBLIC_TRUST).toBe(-6)
    expect(m.DATA_INTEGRITY).toBe(METER_INITIAL_VALUES.DATA_INTEGRITY)
  })

  it('sanitizes tampered meters: non-numeric values fall back to defaults, unknown keys dropped', async () => {
    primeSentinelMeters()
    seedBlob(
      {
        CAPITAL: 'not-a-number',
        HUMAN_WELFARE: 7,
        RESILIENCE: 99, // unknown key — must be dropped
      },
      PERSIST_VERSION,
    )

    await useGameStore.persist.rehydrate()

    const m = useGameStore.getState().meters as Record<string, number>
    expect(m.CAPITAL).toBe(METER_INITIAL_VALUES.CAPITAL)
    expect(m.HUMAN_WELFARE).toBe(7)
    expect(m).not.toHaveProperty('RESILIENCE')
    expect(Object.keys(m)).toHaveLength(8)
  })

  it('a v0 legacy blob (3 meters + installedModule) walks the whole chain to 8 meters', async () => {
    primeSentinelMeters()
    const legacy = {
      state: {
        meters: { CAPITAL: 5, HUMAN_WELFARE: 0, OWNER_CONTROL: 41 },
        scheduledConsequences: [],
        ledger: [],
        currentPromptId: null,
        installedModule: 'MOURNER',
        flags: [],
        capitalDeployedThisQuarter: false,
        pendingFiredHooks: [],
      },
      version: 0,
    }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(legacy))

    await useGameStore.persist.rehydrate()

    const state = useGameStore.getState()
    expect(state.meters).toEqual({
      ...METER_INITIAL_VALUES,
      CAPITAL: 5,
      HUMAN_WELFARE: 0,
      OWNER_CONTROL: 41,
    })
    // v0 → v1 arm still runs on the same walk.
    expect(state.installedModules).toEqual({ MOURNER: { rank: 1 } })
  })
})
