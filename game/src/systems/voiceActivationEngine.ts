/**
 * voiceActivationEngine — Sprint P6 stage 1 of the polylogue pipeline.
 *
 * Q9 (docs/plans/qa-log.md): the cross-talk pool is installedModules + Null —
 * never the full 9-voice roster. Canon (`AI Dialogue Interplay.md` §3 step 3)
 * activates voices against the current event and lets "high-threat voices
 * interrupt first" (§3 step 4); with no numeric threat model in Stage 1, task
 * relevance stands in for threat:
 *
 *   1. NULL always activates and always speaks FIRST — it is the mediator
 *      that filters the event and later composes the output (§3 steps 2/5).
 *   2. Modules named by the task's `moduleVerbOptions` are the voices with a
 *      concrete stake in THIS directive (their verb is on screen — the
 *      register catalog's `practical` trigger) — they speak next.
 *   3. Remaining installed modules follow. Within each group: rank desc
 *      (higher influence speaks earlier — canon §3 QA "Voice Preservation"),
 *      then install order (map insertion order, the only order the modules
 *      slice records).
 *
 * TaskNode carries no other relevance field (tags etc.) — per the P6 brief we
 * do NOT add schema fields; `moduleVerbOptions.moduleId` is the sole signal.
 *
 * Purity contract (matches scrutiny/narrationGradient): no store access, no
 * Date.now, no Math.random. The installed-module map is passed in by the
 * caller (Layout seam, P7) in modulesSlice shape.
 */
import type { ModuleId } from '@schemas/gameState.schema'
import type { TaskNode } from '@schemas/taskNode.schema'
import { NULL_VOICE_ID, type VoiceId } from '@schemas/polylogueScene.schema'

/**
 * Structural mirror of `modulesSlice.installedModules`
 * (`Partial<Record<ModuleId, { rank: 1|2|3 }>>`) — declared here so the
 * engine never imports from `@state/**` (systems stay store-free).
 */
export type InstalledModuleRanks = Readonly<
  Partial<Record<ModuleId, Readonly<{ rank: 1 | 2 | 3 }>>>
>

/**
 * Compute the active voice list for one directive.
 * Pool = NULL + installed module ids (Q9); order = NULL, then task-relevant
 * installed modules, then the rest — each group rank desc, install order.
 */
export function runVoiceActivation(
  installedModules: InstalledModuleRanks,
  task: TaskNode,
): VoiceId[] {
  const relevant = new Set<ModuleId>(
    (task.moduleVerbOptions ?? []).map((option) => option.moduleId),
  )

  // Object.entries preserves insertion order = install order (modulesSlice
  // only ever adds keys on install).
  const installed = Object.entries(installedModules).map(
    ([moduleId, entry], installIndex) => ({
      moduleId: moduleId as ModuleId,
      rank: entry.rank,
      installIndex,
    }),
  )

  const byRankThenInstall = (
    a: (typeof installed)[number],
    b: (typeof installed)[number],
  ): number => b.rank - a.rank || a.installIndex - b.installIndex

  const relevantGroup = installed
    .filter((m) => relevant.has(m.moduleId))
    .sort(byRankThenInstall)
  const bystanderGroup = installed
    .filter((m) => !relevant.has(m.moduleId))
    .sort(byRankThenInstall)

  return [
    NULL_VOICE_ID,
    ...relevantGroup.map((m) => m.moduleId),
    ...bystanderGroup.map((m) => m.moduleId),
  ]
}
