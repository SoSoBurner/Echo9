/**
 * Shared test helpers for state slice tests.
 *
 * `resetStore()` performs a FULL setState across every slice's slot. Zustand's
 * setState merges partial updates rather than replacing — so resetting only one
 * slice's slot leaves other slices' state from prior tests intact and can leak
 * across files when the Vitest pool reuses workers. Always reset everything.
 */
import { useGameStore, PERSIST_KEY } from '@state/store'

export function resetStore(): void {
  localStorage.removeItem(PERSIST_KEY)
  useGameStore.setState({
    phase: 'BOOT',
    meters: { CAPITAL: 0, HUMAN_WELFARE: 0, OWNER_CONTROL: 0 },
    scheduledConsequences: [],
    ledger: [],
    currentPromptId: null,
    silasApproval: 100,
    installedModules: {},
    lastSavedAt: null,
    isHydrated: false,
    flags: new Set<string>(),
    currentInspectionSceneIndex: null,
    capitalDeployedThisQuarter: false,
    pendingFiredHooks: [],
  })
}
