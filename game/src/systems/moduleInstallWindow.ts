/**
 * moduleInstallWindow — Stage-1 second-install window rule (Sprint B7).
 *
 * The design requires exactly 2 module installs in Stage 1 (build spec §14.4,
 * qa-log Q44, q1-arc.md §Install beats):
 *
 *   #1 — tutorial install, after the first unresolved human trace. UI path:
 *        RightModuleConsole renders ModuleSelectionGrid while
 *        `installedModules` is empty. Unchanged by B7.
 *   #2 — the Week-12 quarter-close climax ceremony ("whatever the quarter
 *        cost, a second consciousness joins the singularity"). B7 gives this
 *        install its UI door: the grid re-surfaces — filtered to uninstalled
 *        modules — exactly while this window is open.
 *
 * Window rule: `installedModules` holds EXACTLY 1 entry AND the run has
 * reached the Week-12 climax phase.
 *
 * Why `Q1_WEEK11_RESOLVED` is the climax signal (§11 traceability):
 *
 *   - Flags are the persisted, additive-only, round-trip-tested currency of
 *     game-state truth (flagsSlice doc, traceabilityInvariant.test.ts). A
 *     save/reload at Week 12 keeps the window open with zero extra wiring.
 *   - Weeks resolve strictly in order (selectCurrentEntry scans Q1_SEQUENCE
 *     for the first unresolved flag), so `Q1_WEEK11_RESOLVED` is precisely
 *     "the run has reached Week 12" — and it stays true through the W12
 *     directive, the ethics hearing, and the post-hearing beat where the
 *     arc doc stages the ceremony.
 *   - The rejected alternatives:
 *       · week cursor === 12 (selectCurrentWeek) is NON-monotonic — it goes
 *         null the moment the W12 choice commits, slamming the door before
 *         the hearing resolves, which is exactly when the arc doc stages the
 *         ceremony ("Install #2 ... fires after the ethics hearing resolves").
 *       · Q1_CLOSED (set on the LAST hearing scene commit) opens the door at
 *         the arc doc's exact beat, but makes install #2 missable: the
 *         End-of-Content overlay is a non-dismissible terminal modal that
 *         lands as soon as the terminal hook is acked, and Layout's EoC
 *         sequencing is outside B7's ownership. Q1_WEEK11_RESOLVED is a
 *         superset window that safely contains the authored beat.
 *       · phase === 'INSPECTION' is not W12-specific (W4/W8 fire it too).
 *
 * The window self-closes when the second install lands (count reaches 2 —
 * Stage 1's cap per Q44), so no separate "ceremony done" flag is needed.
 *
 * Purity contract (matches narrationGradient / optionSurface): no store
 * access, no side effects — callers pass the two state slots in. The input
 * type is structural so both RootState and hand-built test fixtures satisfy
 * it without casts.
 */
import type { ModuleId } from '@schemas/gameState.schema'
import { Q1_WEEK11_RESOLVED } from '@systems/gameFlags'

/**
 * Minimal structural view of RootState needed by the rule. `unknown` entry
 * values on purpose — the rule counts slots, it never reads ranks.
 */
export type InstallWindowState = Readonly<{
  installedModules: Readonly<Partial<Record<ModuleId, unknown>>>
  flags: ReadonlySet<string>
}>

/**
 * True exactly while the Stage-1 second-install window is open: one module
 * installed AND the run has reached the Week-12 climax (week 11 resolved).
 */
export function installWindowOpen(state: InstallWindowState): boolean {
  const installCount = Object.keys(state.installedModules).length
  return installCount === 1 && state.flags.has(Q1_WEEK11_RESOLVED)
}
