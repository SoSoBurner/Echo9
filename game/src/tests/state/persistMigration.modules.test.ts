/**
 * Persist migration test — legacy `installedModule: ModuleId | null` (v0)
 * → new `installedModules: { [id]: { rank: 1 } }` (v1) (Task B3).
 *
 * Load a v0 blob into localStorage BEFORE the store hydrates, then trigger
 * `useGameStore.persist.rehydrate()` and assert the shape rewrites correctly.
 *
 * Three cases:
 *   1. Legacy `installedModule: 'MOURNER'` → `installedModules: { MOURNER: { rank: 1 } }`
 *   2. Legacy `installedModule: null`      → `installedModules: {}`
 *   3. Already-new blob (v1) is passed through untouched.
 *
 * Rehydration validation for invalid legacy ModuleIds is verified in
 * store.test.ts alongside the other rehydration guards.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, PERSIST_KEY, PERSIST_VERSION } from '@state/store'

function seedLegacyBlob(installedModule: string | null): void {
  const legacy = {
    state: {
      meters: { CAPITAL: 0, HUMAN_WELFARE: 0, OWNER_CONTROL: 0 },
      scheduledConsequences: [],
      ledger: [],
      currentPromptId: null,
      installedModule,
      flags: [],
      capitalDeployedThisQuarter: false,
      pendingFiredHooks: [],
    },
    version: 0,
  }
  localStorage.setItem(PERSIST_KEY, JSON.stringify(legacy))
}

describe('persist migration — modulesSlice v0 → v1', () => {
  beforeEach(() => {
    localStorage.removeItem(PERSIST_KEY)
  })

  it('exposes a PERSIST_VERSION at least 1 (bumped for the modules shape)', () => {
    // Guard: if a later task ever regresses the version bump, this test loudly
    // flags it before the migration silently stops running.
    expect(PERSIST_VERSION).toBeGreaterThanOrEqual(1)
  })

  it('migrates legacy installedModule: "MOURNER" to installedModules: { MOURNER: { rank: 1 } }', async () => {
    // Prime in-memory state to a known-empty shape (this triggers an auto-write,
    // which we then clobber with our legacy fixture).
    useGameStore.setState({ installedModules: {} })
    seedLegacyBlob('MOURNER')

    await useGameStore.persist.rehydrate()

    const installedModules = useGameStore.getState().installedModules
    expect(installedModules).toEqual({ MOURNER: { rank: 1 } })
  })

  it('migrates legacy installedModule: null to installedModules: {}', async () => {
    useGameStore.setState({ installedModules: { MOURNER: { rank: 2 } } })
    seedLegacyBlob(null)

    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().installedModules).toEqual({})
  })

  it('passes through a blob already at the new v1 shape untouched', async () => {
    useGameStore.setState({ installedModules: {} })

    const v1 = {
      state: {
        meters: { CAPITAL: 0, HUMAN_WELFARE: 0, OWNER_CONTROL: 0 },
        scheduledConsequences: [],
        ledger: [],
        currentPromptId: null,
        installedModules: { DEFENDER: { rank: 2 } },
        flags: [],
        capitalDeployedThisQuarter: false,
        pendingFiredHooks: [],
      },
      version: PERSIST_VERSION,
    }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(v1))

    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().installedModules).toEqual({
      DEFENDER: { rank: 2 },
    })
  })

  it('strips invalid legacy ModuleIds during migration (returns empty map)', async () => {
    useGameStore.setState({ installedModules: {} })
    seedLegacyBlob('NOT_A_REAL_MODULE')

    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().installedModules).toEqual({})
  })
})
