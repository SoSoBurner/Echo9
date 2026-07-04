/**
 * ModuleAbilityButton — renders the "Use {moduleName}" action for the
 * currently installed module (§6, Task 10).
 *
 * On activation (B4 refactor — registry-driven):
 *   1. Reads the installed rank from `installedModules[id]`.
 *   2. Calls `runModuleAbility(id, rank, ctx)` to look up the registry entry
 *      (single source of truth) — handlers are pure given ctx so this is
 *      replay-safe.
 *   3. Dispatches applyDelta(result.meterDeltas) to update the meters.
 *   4. Raises any `result.flagsSet` via setFlag (was dev-console.debug pre-B4).
 *   5. Dispatches appendTrace(...) with a synthetic ResultTrace built from the
 *      registry `verb` — the ledger entry now reads directly from content.
 *
 * `hookIdsScheduled` is left inert until the resolver-side wiring lands in
 * later T-tasks; treating it here would double-fire once the queue picks up.
 *
 * Accessibility:
 *   - role="button" via native <button>.
 *   - aria-keyshortcuts="M" — §10 keymap binds M to "Focus module ability".
 *   - Forwarded ref so useKeyboardNav (via Layout) can call .focus() on M.
 *
 * Visual: uses bg-silas-accent / text-background — both are existing palette
 * tokens (no arbitrary hex; colorGuard.test.ts enforces).
 */
import { useCallback, type Ref } from 'react'
import type { ModuleId } from '@schemas/gameState.schema'
import { makeTaskId, makeChoiceId, makeTraceId } from '@schemas/gameState.schema'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import { useGameStore } from '@state/store'
import {
  runModuleAbility,
  type AbilityCtx,
} from '@systems/moduleAbilityEngine'
import { MODULE_ROSTER } from '@content/modules/moduleRoster'

interface ModuleAbilityButtonProps {
  moduleId: ModuleId
  /** Optional ref for global keyboard focus (Layout wires M → focus). */
  ref?: Ref<HTMLButtonElement>
}

// crypto.randomUUID() is secure-context only — fall back for plain-HTTP staging.
function freshTraceIdString(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

export function ModuleAbilityButton({ moduleId, ref }: ModuleAbilityButtonProps) {
  const applyDelta = useGameStore((s) => s.applyDelta)
  const appendTrace = useGameStore((s) => s.appendTrace)
  const setFlag = useGameStore((s) => s.setFlag)
  const installedModules = useGameStore((s) => s.installedModules)

  const mod = MODULE_ROSTER.find((m) => m.id === moduleId)

  const handleUse = useCallback(() => {
    const installed = installedModules[moduleId]
    if (!installed) return
    const ctx: AbilityCtx = { now: Date.now(), rng: Math.random }
    const result = runModuleAbility(moduleId, installed.rank, ctx)

    // 1. Meter side-effects (no-op when meterDeltas is {}).
    if (Object.keys(result.meterDeltas).length > 0) {
      applyDelta(result.meterDeltas)
    }

    // 2. Flags — registry-authored `flagsSet` entries raised via flagsSlice.
    for (const flag of result.flagsSet) {
      setFlag(flag)
    }

    // 3. Ledger entry — synthetic ids mark this as a module-action trace.
    // Body reads from the registry `verb`; content owns the wording.
    const trace: ResultTrace = {
      id: makeTraceId(freshTraceIdString()),
      sourceTaskId: makeTaskId('module-action'),
      sourceChoiceId: makeChoiceId(`module-${moduleId.toLowerCase()}`),
      timestamp: ctx.now,
      body: `${mod?.name ?? moduleId} — ${result.verb}`,
    }
    appendTrace(trace)
  }, [moduleId, installedModules, applyDelta, appendTrace, setFlag, mod])

  if (!mod) return null

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleUse}
      aria-keyshortcuts="M"
      className="
        w-full px-4 py-3
        bg-silas-accent text-background
        text-sm font-mono uppercase tracking-widest
        border border-silas-accent
        hover:opacity-90
        focus:outline-none focus:ring-2 focus:ring-null-accent
      "
    >
      Use {mod.name}
    </button>
  )
}
