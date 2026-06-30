/**
 * ModuleAbilityButton — renders the "Use {moduleName}" action for the
 * currently installed module (§6, Task 10).
 *
 * On activation:
 *   1. Calls MODULE_ABILITY_DISPATCH[id]({ now, rng }) to compute an
 *      AbilityResult — handlers are pure given ctx so this is replay-safe.
 *   2. Dispatches applyDelta(result.meterDeltas) to update the 3 meters.
 *   3. Dispatches appendTrace(...) with a synthetic ResultTrace whose
 *      sourceTaskId / sourceChoiceId mark it as a module-action trace.
 *
 * Flags (result.flagsAdded / flagsRemoved) are observed via console.debug for
 * now — T11+ wires a real flags slice and the consequence engine reacts to
 * FORECAST_PREVIEWED / SILAS_OVERRIDE_AVAILABLE.
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
  MODULE_ABILITY_DISPATCH,
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

  const mod = MODULE_ROSTER.find((m) => m.id === moduleId)

  const handleUse = useCallback(() => {
    const handler = MODULE_ABILITY_DISPATCH[moduleId]
    if (!handler) return
    const ctx: AbilityCtx = { now: Date.now(), rng: Math.random }
    const result = handler(ctx)

    // 1. Meter side-effects (no-op when meterDeltas is {}).
    applyDelta(result.meterDeltas)

    // 2. Ledger entry — synthetic ids mark this as a module-action trace.
    const trace: ResultTrace = {
      id: makeTraceId(freshTraceIdString()),
      sourceTaskId: makeTaskId('module-action'),
      sourceChoiceId: makeChoiceId(`module-${moduleId.toLowerCase()}`),
      timestamp: ctx.now,
      body: result.ledgerEntry,
    }
    appendTrace(trace)

    // 3. T11+: wire flags slice. For now, surface flag intent in dev so the
    // path is observable without adding state we don't yet read.
    if (import.meta.env.DEV && (result.flagsAdded.length || result.flagsRemoved.length)) {
      console.debug(
        '[ModuleAbilityButton] flags',
        { added: result.flagsAdded, removed: result.flagsRemoved },
      )
    }
    if (import.meta.env.DEV && result.revealsHiddenTrace) {
      console.debug('[ModuleAbilityButton] revealsHiddenTrace=true (T11+ wires reveal)')
    }
  }, [moduleId, applyDelta, appendTrace])

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
