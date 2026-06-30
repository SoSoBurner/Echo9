/**
 * Layout — top-level CSS grid shell for the Echo 9 HUD.
 *
 * Named grid areas: topbar, left, center, right, logdock.
 * 1280×720 base, scales via Tailwind responsive utilities.
 *
 * Live regions mounted here (PLAN.md §10):
 *   #sr-narrative — polite, for chronological narrative
 *   #sr-status    — assertive, for meter cascades and phase changes
 *
 * Keyboard nav mounted once here via useKeyboardNav.
 *
 * T9 wired the real content modules + the resolveChoice commit path
 * (replacing T8's console.log + mock data placeholders).
 */
import { useCallback, useMemo, useRef, useState } from 'react'
import { useGameStore } from '@state/store'
import { TopBar } from '@ui/topbar/TopBar'
import { LeftStatusRail } from '@ui/meters/LeftStatusRail'
import { CenterDirectivePanel } from '@ui/directive/CenterDirectivePanel'
import { SilasPromptPanel } from '@ui/silas/SilasPromptPanel'
import { ResultCard } from '@ui/result/ResultCard'
import { useKeyboardNav } from './useKeyboardNav'
import { resolveChoice } from '@systems/choiceResolver'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import { makeTraceId, type ChoiceId, type ConsequenceId } from '@schemas/gameState.schema'

// ---------------------------------------------------------------------------
// T9 content wiring — real modules replace T8's MOCK_* constants.
// ---------------------------------------------------------------------------
import {
  mercyMarginTask,
  LENORA_PORTAL_MESSAGE,
  MERCY_MARGIN_NULL_TEXT,
} from '@content/tasks/mercyMargin.task'
import { EAST_WILMER_CHOICES } from '@content/choices/eastWilmer.choices'
import { SILAS_DIRECTIVE_EAST_WILMER } from '@content/silasPrompts/q1EastWilmer'
import { ALL_CONSEQUENCE_MODULES } from '@content/index'

// ---------------------------------------------------------------------------
// Layout component
// ---------------------------------------------------------------------------

export function Layout() {
  const phase = useGameStore((s) => s.phase)

  // Real store actions (composed from slices).
  const meters = useGameStore((s) => s.meters)
  const scheduledConsequences = useGameStore((s) => s.scheduledConsequences)
  const ledger = useGameStore((s) => s.ledger)
  const applyDelta = useGameStore((s) => s.applyDelta)
  const appendTrace = useGameStore((s) => s.appendTrace)
  const scheduleHook = useGameStore((s) => s.scheduleHook)

  // Selected choice index for keyboard nav → ChoicePanel bridge
  const choiceSelectRef = useRef<((index: number) => void) | null>(null)
  const choiceCommitRef = useRef<(() => void) | null>(null)

  const [lastTrace, setLastTrace] = useState<ResultTrace | null>(null)

  // Build the hook catalog once per render — the registry is module-frozen,
  // so this map could be hoisted to module scope; keeping it inside the
  // component leaves a single seam for T11+ when content becomes dynamic.
  const hookCatalog = useMemo(() => {
    const m = new Map<ConsequenceId, ConsequenceHook>()
    for (const hook of ALL_CONSEQUENCE_MODULES) {
      m.set(hook.id, hook)
    }
    return m
  }, [])

  const handleChoiceCommit = useCallback(
    (id: ChoiceId) => {
      // 1. Resolve the ChoiceNode by id.
      const choice = EAST_WILMER_CHOICES.find((c) => c.id === id)
      if (!choice) {
        // Content authoring bug — surface loudly in dev, ignore in prod.
        if (import.meta.env.DEV) {
          console.error(`Layout.handleChoiceCommit: unknown ChoiceId "${id}"`)
        }
        return
      }

      // 2. Build a fresh GameState snapshot for the pure resolver.
      const snapshot = {
        meters,
        scheduledConsequences,
        ledger,
      }

      // 3. Inject non-deterministic ctx (now + fresh trace id).
      const ctx = {
        now: Date.now(),
        traceId: makeTraceId(crypto.randomUUID()),
      }

      // 4. Run the pure resolver — throws on missing hook id (content bug).
      const { trace, scheduled } = resolveChoice(snapshot, choice, hookCatalog, ctx)

      // 5. Commit results to the store via the existing slice actions.
      applyDelta(choice.meterDeltas)
      appendTrace(trace)
      for (const hook of scheduled) {
        scheduleHook(hook)
      }

      // 6. Trigger the result panel.
      setLastTrace(trace)
    },
    [meters, scheduledConsequences, ledger, hookCatalog, applyDelta, appendTrace, scheduleHook],
  )

  // Register keyboard callbacks from ChoicePanel
  const registerChoiceHandlers = useCallback(
    (selectFn: (index: number) => void, commitFn: () => void) => {
      choiceSelectRef.current = selectFn
      choiceCommitRef.current = commitFn
    },
    [],
  )

  useKeyboardNav({
    onChoiceKey: useCallback((index: number) => {
      choiceSelectRef.current?.(index)
    }, []),
    onCommit: useCallback(() => {
      choiceCommitRef.current?.()
    }, []),
    onEscape: useCallback(() => {
      // T-later: pause / close modal
    }, []),
  })

  const showResult = phase === 'FIRST_RESULT' || lastTrace !== null

  return (
    <>
      {/* Live regions — PLAN.md §10. Mounted once here, written to by T11+. */}
      <div
        id="sr-narrative"
        aria-live="polite"
        role="log"
        className="sr-only"
      />
      <div
        id="sr-status"
        aria-live="assertive"
        className="sr-only"
      />

      {/*
        CSS grid layout — named areas: topbar, left, center, right, logdock.
        Grid uses Tailwind grid utilities with inline template for named areas.
      */}
      <div
        className="grid h-screen bg-background"
        style={{
          gridTemplateAreas: `
            "topbar topbar topbar"
            "left   center right"
            "logdock logdock logdock"
          `,
          gridTemplateRows: 'auto 1fr auto',
          gridTemplateColumns: '220px 1fr 280px',
        }}
      >
        {/* topbar */}
        <div style={{ gridArea: 'topbar' }}>
          <TopBar />
        </div>

        {/* left — status rail with meters */}
        <div style={{ gridArea: 'left' }} className="overflow-y-auto">
          <LeftStatusRail />
        </div>

        {/* center — directive / choices / result */}
        <div
          style={{ gridArea: 'center' }}
          className="overflow-y-auto border-r border-sealed-dim px-6 py-6"
        >
          {showResult && lastTrace ? (
            <ResultCard trace={lastTrace} />
          ) : (
            <CenterDirectivePanel
              task={mercyMarginTask}
              choices={[...EAST_WILMER_CHOICES]}
              nullText={MERCY_MARGIN_NULL_TEXT}
              humanMessage={LENORA_PORTAL_MESSAGE}
              onChoiceCommit={handleChoiceCommit}
              registerKeyboardHandlers={registerChoiceHandlers}
            />
          )}
        </div>

        {/* right — Silas panel */}
        <div style={{ gridArea: 'right' }} className="overflow-y-auto">
          <SilasPromptPanel prompt={SILAS_DIRECTIVE_EAST_WILMER} />
        </div>

        {/* logdock — T13 builds this; empty placeholder */}
        <div
          style={{ gridArea: 'logdock' }}
          className="border-t border-sealed-dim px-4 py-2"
          aria-label="Log dock (coming soon)"
        >
          <span className="text-fg-secondary text-xs uppercase tracking-widest">
            Log Dock — T13
          </span>
        </div>
      </div>
    </>
  )
}
