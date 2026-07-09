/**
 * usePanelState — hook the E2 disclosure choreography sits on top of.
 *
 * Every panel that participates in the diegetic HUD-comes-online tutorial
 * calls this hook to answer two questions:
 *
 *   1. "Am I disclosed yet?" — cold boot hides every panel until the
 *      awakening sequence (or a downstream `noteUsage`) discloses it.
 *      A hidden panel returns `null` from its render.
 *
 *   2. "At what maturity should I render?" — a disclosed panel walks up a
 *      three-stage ramp: silhouette / minimal at first use, expanded at 3+,
 *      full HUD-mockup parity at 6+.
 *
 * Wired via narrow zustand subscriptions — the hook only re-runs when EITHER
 * the panel's own disclosure flag OR its own use count changes. Other panels'
 * disclosure churn does not re-render.
 *
 * Why co-locate in a hook rather than a wrapper component:
 *   - Panels stay responsible for their own render shape (a gate wrapper
 *     would push maturity plumbing into props on every internal component).
 *   - `return null` when hidden is the simplest possible truthy gate — React
 *     already handles this pattern zero-cost.
 *   - Storybook / test can call the hook with a synthetic store and get a
 *     deterministic answer.
 */
import { useGameStore } from '@state/store'
import { panelMaturity, type Maturity, type PanelId } from './hudDisclosure'

export interface PanelState {
  /** True once the awakening sequence or `noteUsage` has disclosed the panel. */
  disclosed: boolean
  /** Panel's current maturity stage — always 1 when disclosed=false (unused). */
  maturity: Maturity
}

/**
 * Read a single panel's disclosure + maturity state.
 *
 * NOTE on subscription shape: we read the primitive (`has(id)` returns bool,
 * `panelUseCount[id]` returns number). Zustand default strict-equality means
 * both selectors are stable across unrelated store mutations, so a Silas
 * approval nudge won't re-render the Priority panel.
 */
export function usePanelState(id: PanelId): PanelState {
  const disclosed = useGameStore((s) => s.disclosedPanels.has(id))
  const useCount = useGameStore((s) => s.panelUseCount[id] ?? 0)
  return { disclosed, maturity: panelMaturity(useCount) }
}
