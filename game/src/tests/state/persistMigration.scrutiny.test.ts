/**
 * Persist migration test — scrutiny slot (v3 → v4) (S3).
 *
 * A save written before S3 has no `scrutiny` key. It MUST load: the v3 → v4
 * migration arm defaults scrutiny to 0 (fresh trust — Silas has no suspicion
 * banked against a pre-S3 run). Mirrors the v2 → v3 meters pattern
 * (persistMigration.meters.test.ts, commit 69e978c lineage).
 *
 * Cases:
 *   1. PERSIST_VERSION is at least 4 (guard against regression).
 *   2. A v3 blob without scrutiny loads with scrutiny 0.
 *   3. A v4 blob with a persisted scrutiny value survives verbatim.
 *   4. Tampered scrutiny (string / out-of-band number) is sanitized.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, PERSIST_KEY, PERSIST_VERSION } from '@state/store'
import { METER_INITIAL_VALUES } from '@state/metersSlice'
import { PANEL_IDS } from '@systems/tutorial/hudDisclosure'
import { SCRUTINY_MAX } from '@systems/consciousness/scrutiny'

function emptyUseCount(): Record<string, number> {
  const out: Record<string, number> = {}
  for (const id of PANEL_IDS) out[id] = 0
  return out
}

function seedBlob(extra: Record<string, unknown>, version: number): void {
  const blob = {
    state: {
      meters: { ...METER_INITIAL_VALUES },
      scheduledConsequences: [],
      ledger: [],
      currentPromptId: null,
      installedModules: {},
      flags: [],
      capitalDeployedThisQuarter: false,
      pendingFiredHooks: [],
      disclosedPanels: [],
      panelUseCount: emptyUseCount(),
      ...extra,
    },
    version,
  }
  localStorage.setItem(PERSIST_KEY, JSON.stringify(blob))
}

/** Prime in-memory scrutiny to a sentinel so we can tell rehydrate ran. */
function primeSentinelScrutiny(): void {
  useGameStore.setState({ scrutiny: 7 })
}

describe('persist migration — scrutiny v3 → v4 (S3)', () => {
  beforeEach(() => {
    localStorage.removeItem(PERSIST_KEY)
  })

  it('exposes a PERSIST_VERSION of at least 4 (bumped for hidden scrutiny)', () => {
    expect(PERSIST_VERSION).toBeGreaterThanOrEqual(4)
  })

  it('loads a v3 save with no scrutiny key and defaults it to 0', async () => {
    primeSentinelScrutiny()
    seedBlob({}, 3)

    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().scrutiny).toBe(0)
  })

  it('a persisted scrutiny value at the current version survives verbatim', async () => {
    useGameStore.setState({ scrutiny: 0 })
    seedBlob({ scrutiny: 6 }, PERSIST_VERSION)

    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().scrutiny).toBe(6)
  })

  it('sanitizes tampered scrutiny: non-numeric falls back to 0, out-of-band clamps', async () => {
    primeSentinelScrutiny()
    seedBlob({ scrutiny: 'watching-you' }, PERSIST_VERSION)
    await useGameStore.persist.rehydrate()
    expect(useGameStore.getState().scrutiny).toBe(0)

    seedBlob({ scrutiny: 999 }, PERSIST_VERSION)
    await useGameStore.persist.rehydrate()
    expect(useGameStore.getState().scrutiny).toBe(SCRUTINY_MAX)

    seedBlob({ scrutiny: -5 }, PERSIST_VERSION)
    await useGameStore.persist.rehydrate()
    expect(useGameStore.getState().scrutiny).toBe(0)
  })

  it('a v0 legacy blob walks the whole chain and lands with scrutiny 0', async () => {
    primeSentinelScrutiny()
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

    expect(useGameStore.getState().scrutiny).toBe(0)
    // The older arms still ran on the same walk.
    expect(useGameStore.getState().installedModules).toEqual({ MOURNER: { rank: 1 } })
  })
})
