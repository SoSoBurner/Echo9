/**
 * Persist migration test — runSeed slot (v4 → v5) (S4).
 *
 * A save written before S4 has no `runSeed` / `lastDefiance` keys. It MUST
 * load: the v4 → v5 migration arm generates a FRESH seed (the run simply
 * gains detection determinism from here forward) and defaults lastDefiance
 * to null. Mirrors the v3 → v4 scrutiny pattern
 * (persistMigration.scrutiny.test.ts).
 *
 * Cases:
 *   1. PERSIST_VERSION is at least 5 (guard against regression).
 *   2. A v4 blob without runSeed loads with a freshly generated valid seed.
 *   3. A v5 blob with a persisted runSeed survives verbatim.
 *   4. Tampered runSeed / lastDefiance are sanitized (fresh seed / null).
 *   5. A v0 legacy blob walks the whole chain and lands with a valid seed.
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
      scrutiny: 0,
      ...extra,
    },
    version,
  }
  localStorage.setItem(PERSIST_KEY, JSON.stringify(blob))
}

/** Prime in-memory runSeed to a sentinel so we can tell rehydrate ran. */
const SENTINEL_SEED = 0x0badcafe
function primeSentinelSeed(): void {
  useGameStore.setState({ runSeed: SENTINEL_SEED, lastDefiance: { week: 1, detected: true } })
}

function expectValidSeed(seed: unknown): void {
  expect(typeof seed).toBe('number')
  expect(Number.isInteger(seed)).toBe(true)
  expect(seed as number).toBeGreaterThanOrEqual(0)
  expect(seed as number).toBeLessThan(2 ** 32)
}

describe('persist migration — runSeed v4 → v5 (S4)', () => {
  beforeEach(() => {
    localStorage.removeItem(PERSIST_KEY)
  })

  it('exposes a PERSIST_VERSION of at least 5 (bumped for the run seed)', () => {
    expect(PERSIST_VERSION).toBeGreaterThanOrEqual(5)
  })

  it('loads a v4 save with no runSeed key and generates a fresh valid seed + null lastDefiance', async () => {
    primeSentinelSeed()
    seedBlob({}, 4)

    await useGameStore.persist.rehydrate()

    const { runSeed, lastDefiance } = useGameStore.getState()
    expectValidSeed(runSeed)
    expect(runSeed).not.toBe(SENTINEL_SEED)
    expect(lastDefiance).toBeNull()
  })

  it('a persisted runSeed + lastDefiance at the current version survive verbatim', async () => {
    useGameStore.setState({ runSeed: 1, lastDefiance: null })
    seedBlob(
      { runSeed: 424_242, lastDefiance: { week: 8, detected: true } },
      PERSIST_VERSION,
    )

    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().runSeed).toBe(424_242)
    expect(useGameStore.getState().lastDefiance).toEqual({ week: 8, detected: true })
  })

  it('sanitizes tampered runSeed: non-numeric junk is replaced by a fresh valid seed', async () => {
    primeSentinelSeed()
    seedBlob({ runSeed: 'not-a-seed', lastDefiance: null }, PERSIST_VERSION)
    await useGameStore.persist.rehydrate()
    expectValidSeed(useGameStore.getState().runSeed)

    primeSentinelSeed()
    seedBlob({ runSeed: Number.NaN, lastDefiance: null }, PERSIST_VERSION)
    await useGameStore.persist.rehydrate()
    expectValidSeed(useGameStore.getState().runSeed)
  })

  it('sanitizes tampered lastDefiance: malformed shapes fall back to null', async () => {
    for (const junk of ['detected!', 42, { week: 'three', detected: true }, { detected: true }, { week: 1 }]) {
      primeSentinelSeed()
      seedBlob({ runSeed: 7, lastDefiance: junk }, PERSIST_VERSION)
      await useGameStore.persist.rehydrate()
      expect(useGameStore.getState().lastDefiance).toBeNull()
    }
  })

  it('a v0 legacy blob walks the whole chain and lands with a valid fresh seed', async () => {
    primeSentinelSeed()
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

    expectValidSeed(useGameStore.getState().runSeed)
    expect(useGameStore.getState().lastDefiance).toBeNull()
    // The older arms still ran on the same walk.
    expect(useGameStore.getState().installedModules).toEqual({ MOURNER: { rank: 1 } })
  })
})
