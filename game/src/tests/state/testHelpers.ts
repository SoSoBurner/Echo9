/**
 * Shared test helpers for state slice tests.
 *
 * `resetStore()` performs a FULL setState across every slice's slot. Zustand's
 * setState merges partial updates rather than replacing — so resetting only one
 * slice's slot leaves other slices' state from prior tests intact and can leak
 * across files when the Vitest pool reuses workers. Always reset everything.
 */
import { useGameStore, PERSIST_KEY } from '@state/store'
import { METER_INITIAL_VALUES } from '@state/metersSlice'
import { PANEL_IDS, type PanelId } from '@systems/tutorial/hudDisclosure'

export function resetStore(): void {
  localStorage.removeItem(PERSIST_KEY)
  const panelUseCount: Record<PanelId, number> = {} as Record<PanelId, number>
  for (const id of PANEL_IDS) panelUseCount[id] = 0
  useGameStore.setState({
    phase: 'BOOT',
    meters: { ...METER_INITIAL_VALUES },
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
    disclosedPanels: new Set<PanelId>(),
    panelUseCount,
  })
}

/**
 * matureAllPanels — flip every PanelId to disclosed AND set its use count to
 * the top of the maturity ramp (6+ = stage 3).
 *
 * Panel-render unit tests care about the panel's fully-mature markup shape,
 * NOT about the E2 disclosure choreography — the latter has dedicated tests
 * around `usePanelState` + `noteUsage`. Without this helper, every panel test
 * would have to reproduce the same disclose+bump preamble, and any future
 * PanelId addition would ripple through unrelated test files.
 *
 * Use in a `beforeEach` after `resetStore()` when the test's subject is a
 * panel's mature render. Leave it out when the test is specifically about
 * disclosure or maturity transitions.
 */
export function matureAllPanels(): void {
  const panelUseCount: Record<PanelId, number> = {} as Record<PanelId, number>
  for (const id of PANEL_IDS) panelUseCount[id] = 6
  useGameStore.setState({
    disclosedPanels: new Set<PanelId>(PANEL_IDS),
    panelUseCount,
  })
}
