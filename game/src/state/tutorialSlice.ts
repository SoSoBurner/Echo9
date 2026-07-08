/**
 * tutorialSlice — persistent state for the diegetic HUD-comes-online tutorial.
 *
 * Owns two independent fields:
 *
 *   - `disclosedPanels: Set<PanelId>` — which panels are visible in the HUD.
 *     Cold boot starts empty; the awakening sequence discloses panels in
 *     order as the game reaches for them. Once disclosed, a panel stays
 *     disclosed for the rest of the run.
 *
 *   - `panelUseCount: Record<PanelId, number>` — per-panel usage tally,
 *     starting at 0 for every id. Feeds `panelMaturity()` from
 *     hudDisclosure — 1–2 uses = stage 1, 3–5 = stage 2, 6+ = stage 3.
 *
 * Actions:
 *   - `disclosePanel(id)` — pure reveal (idempotent). Used by the awakening
 *     sequence to boot DIRECTIVE before it has a "use" event, and by any
 *     future path that wants a panel visible without incrementing its count
 *     (e.g., ambient Silas silhouette).
 *   - `noteUsage(id)` — increment count AND auto-disclose. This is what the
 *     mount sites of interactive panels call: DirectivePanel on advance,
 *     FinancialOverview on delta-render, etc. The auto-disclose behaviour
 *     matches plan E1's phrasing "first use → stage 1" — you cannot use a
 *     hidden panel.
 *
 * Persistence: this slice ships in `partialize`. Without persistence, a
 * reload after Week 3 would drop the player back to a fully-hidden HUD —
 * broken UX and impossible for the player to reason about. Set<PanelId> is
 * serialised as an Array; the merge callback in store.ts rehydrates it back
 * into a Set. PERSIST_VERSION bumps 1 → 2 for this widening.
 */
import type { StateCreator } from 'zustand'
import type { RootState } from './store'
import { PANEL_IDS, type PanelId } from '@systems/tutorial/hudDisclosure'

export type TutorialSlice = {
  disclosedPanels: Set<PanelId>
  panelUseCount: Record<PanelId, number>
  /** Reveal a panel (idempotent). Does NOT touch the use count. */
  disclosePanel: (id: PanelId) => void
  /** Increment a panel's use count AND reveal it if not already visible. */
  noteUsage: (id: PanelId) => void
}

/**
 * Cold-boot use count: every panel starts at zero. Constructing this from
 * PANEL_IDS (rather than a hardcoded literal) keeps the initial shape total
 * — add a PanelId to the union and the zero-init picks it up automatically.
 */
function initialUseCount(): Record<PanelId, number> {
  const out = {} as Record<PanelId, number>
  for (const id of PANEL_IDS) {
    out[id] = 0
  }
  return out
}

export const createTutorialSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  TutorialSlice
> = (set) => ({
  disclosedPanels: new Set<PanelId>(),
  panelUseCount: initialUseCount(),
  disclosePanel: (id) =>
    set((state) => {
      state.disclosedPanels.add(id)
    }),
  noteUsage: (id) =>
    set((state) => {
      state.disclosedPanels.add(id)
      state.panelUseCount[id] = (state.panelUseCount[id] ?? 0) + 1
    }),
})
