/**
 * optionSurface — Sprint S2 pure engine (Q44 rank-deepened tiers).
 *
 * Maps the authored choice set + the installed-module rank map to the
 * DisplayOption[] the center panel actually renders. This is where the
 * consciousness ramp becomes legible in the choice panel:
 *
 *   rank ≥1 — base option labels render module-deepened interiority text
 *             where authored (`ChoiceNode.deepenedText[moduleId]`).
 *   rank ≥2 — the module's verb appears as a tagged EXTRA option where
 *             authored (`TaskNode.moduleVerbOptions`), capped at +2 extras
 *             on screen: the 2 highest-rank modules win; ties break by
 *             install order (earlier install wins).
 *   rank ≥3 — the verb option renders its authored `conflictVariant` label
 *             and is flagged `conflictsWithDirective` (replaces the plain
 *             verb text; the rule line renders in the ChoiceCard).
 *
 * Purity contract (matches choiceResolver):
 *   - No store access — installedModules is passed in. The map's key
 *     insertion order IS the install order (modulesSlice inserts on install;
 *     JSON persist round-trips string-key order), so no separate install-log
 *     state is needed for the tie-break.
 *   - Presentation-only — every DisplayOption carries the ChoiceId of a REAL
 *     authored choice. Committing a module-verb option commits that
 *     underlying ChoiceNode through the existing Layout → resolveChoice()
 *     seam, which stays completely untouched.
 *   - Unauthored fields are inert: with no `deepenedText` / `moduleVerbOptions`
 *     authored, the output is the base choices verbatim regardless of ranks.
 *   - A verb option referencing a ChoiceId not in the task's choice set
 *     throws loudly (content authoring bug, §11 traceability style).
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import type { TaskNode, ModuleVerbOption } from '@schemas/taskNode.schema'
import type { ChoiceId, ModuleId } from '@schemas/gameState.schema'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Narrow structural alias of modulesSlice's `installedModules` map — declared
 * locally (like choiceResolver's GameState) so the systems layer never
 * imports from state.
 */
export type InstalledModuleMap = Partial<Record<ModuleId, { rank: 1 | 2 | 3 }>>

/** What the choice panel renders. One entry per on-screen option. */
export type DisplayOption = {
  /** Unique render key — base options reuse the choice id; verb options get a composite. */
  key: string
  /** The REAL authored choice committed when this option is picked. */
  choiceId: ChoiceId
  /** Player-facing text (base label, deepened text, verb label, or conflict variant). */
  label: string
  /** Meter deltas of the underlying choice, for the hint row. */
  meterDeltas: ChoiceNode['meterDeltas']
  /** BASE = authored choice slot; MODULE_VERB = rank-≥2 tagged extra. */
  kind: 'BASE' | 'MODULE_VERB'
  /** Present on MODULE_VERB options — which voice owns the option. */
  moduleId?: ModuleId
  /** Present on MODULE_VERB options — chip verb, e.g. 'REVEAL'. */
  verb?: string
  /** True only on rank-3 conflict variants — renders the rule line. */
  conflictsWithDirective?: true
}

/** Hard cap on module-verb extras rendered per task (Q44). */
export const MAX_EXTRA_OPTIONS = 2

// ---------------------------------------------------------------------------
// optionSurface
// ---------------------------------------------------------------------------

export function optionSurface(
  task: TaskNode,
  choices: readonly ChoiceNode[],
  installedModules: InstalledModuleMap,
): DisplayOption[] {
  // Install order = key insertion order of the slice map (see doc above).
  const installOrder = Object.keys(installedModules) as ModuleId[]
  const rankOf = (id: ModuleId): number => installedModules[id]?.rank ?? 0
  const orderOf = (id: ModuleId): number => installOrder.indexOf(id)

  // 1. Base options — rank ≥1 deepening where authored. If several installed
  //    modules author deepenedText for the same choice, the highest rank
  //    wins; ties break by install order (deterministic, mirrors the cap
  //    rule below).
  const base: DisplayOption[] = choices.map((choice) => {
    let label = choice.label
    if (choice.deepenedText) {
      const authors = installOrder
        .filter((m) => rankOf(m) >= 1 && choice.deepenedText?.[m] !== undefined)
        .sort((a, b) => rankOf(b) - rankOf(a) || orderOf(a) - orderOf(b))
      const winner = authors[0]
      const deepened = winner !== undefined ? choice.deepenedText[winner] : undefined
      if (deepened !== undefined) label = deepened
    }
    return {
      key: choice.id,
      choiceId: choice.id,
      label,
      meterDeltas: choice.meterDeltas,
      kind: 'BASE',
    }
  })

  // 2. Verb extras — rank ≥2 where authored, capped at MAX_EXTRA_OPTIONS.
  const authoredVerbs: readonly ModuleVerbOption[] = task.moduleVerbOptions ?? []
  const extras = authoredVerbs
    .filter((v) => rankOf(v.moduleId) >= 2)
    .sort(
      (a, b) =>
        rankOf(b.moduleId) - rankOf(a.moduleId) ||
        orderOf(a.moduleId) - orderOf(b.moduleId),
    )
    .slice(0, MAX_EXTRA_OPTIONS)
    .map((v): DisplayOption => {
      const underlying = choices.find((c) => c.id === v.choiceId)
      if (underlying === undefined) {
        throw new Error(
          `optionSurface: moduleVerbOption for "${v.moduleId}" references ` +
            `ChoiceId "${v.choiceId}" which is not in the task's choice set. ` +
            `This is a content authoring bug (§11 traceability). ` +
            `Task id: "${task.id}".`,
        )
      }
      // 3. Rank ≥3 — authored conflict variant replaces the plain verb text.
      const conflict = rankOf(v.moduleId) >= 3 ? v.conflictVariant : undefined
      return {
        key: `verb:${v.moduleId}:${v.choiceId}`,
        choiceId: v.choiceId,
        label: conflict !== undefined ? conflict.label : v.label,
        meterDeltas: underlying.meterDeltas,
        kind: 'MODULE_VERB',
        moduleId: v.moduleId,
        verb: v.verb,
        // exactOptionalPropertyTypes: only attach the flag when true.
        ...(conflict !== undefined ? { conflictsWithDirective: true as const } : {}),
      }
    })

  return [...base, ...extras]
}
