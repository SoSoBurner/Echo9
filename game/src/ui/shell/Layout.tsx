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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGameStore } from '@state/store'
import { TopBar } from '@ui/topbar/TopBar'
import { LeftStatusRail } from '@ui/meters/LeftStatusRail'
import { CenterDirectivePanel } from '@ui/directive/CenterDirectivePanel'
import { SilasPromptPanel } from '@ui/silas/SilasPromptPanel'
import { ResultCard } from '@ui/result/ResultCard'
import { RightModuleConsole } from '@ui/modules/RightModuleConsole'
import { InspectionPanel } from '@ui/inspection/InspectionPanel'
import { CapitalPowerPanel } from '@ui/capital/CapitalPowerPanel'
import { ConsequenceReturnPanel } from '@ui/consequence/ConsequenceReturnPanel'
import { EventQueueToast } from '@ui/consequence/EventQueueToast'
import { LogDock } from '@ui/log/LogDock'
import { useKeyboardNav } from './useKeyboardNav'
import { resolveChoice } from '@systems/choiceResolver'
import { resolveInspection } from '@systems/inspectionEngine'
import { resolveCapital } from '@systems/capitalResolver'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeTraceId,
  makeChoiceId,
  makeTaskId,
  type TraceId,
  type ChoiceId,
  type ConsequenceId,
} from '@schemas/gameState.schema'

// crypto.randomUUID() is secure-context only — plain-HTTP staging would throw.
function freshTraceId(): TraceId {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  return makeTraceId(id)
}

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
import { Q1_INSPECTION_SCENES } from '@content/inspections/q1Inspection.scene'
import { Q1_CAPITAL_CARDS } from '@content/capitalDeployments/q1CapitalPower.cards'

// ---------------------------------------------------------------------------
// Layout component
// ---------------------------------------------------------------------------

export function Layout() {
  const phase = useGameStore((s) => s.phase)

  // Real store actions (composed from slices).
  const applyDelta = useGameStore((s) => s.applyDelta)
  const appendTrace = useGameStore((s) => s.appendTrace)
  const scheduleHook = useGameStore((s) => s.scheduleHook)
  const setFlag = useGameStore((s) => s.setFlag)
  const advanceInspection = useGameStore((s) => s.advanceInspection)
  const markCapitalDeployed = useGameStore((s) => s.markCapitalDeployed)

  // INSPECTION panel state — cursor + flags drive both the open-condition
  // and the engine call. The cursor is `null` whenever no scene is active.
  const currentInspectionSceneIndex = useGameStore((s) => s.currentInspectionSceneIndex)
  const flags = useGameStore((s) => s.flags)
  // CAPITAL panel — opens when CAPITAL > 80 AND not yet deployed this quarter.
  // `showCapital` is local UI state so the player can defer (ESC) without
  // losing the >80 threshold; reopens next time the player chooses to.
  const capitalMeter = useGameStore((s) => s.meters.CAPITAL)
  const capitalDeployedThisQuarter = useGameStore((s) => s.capitalDeployedThisQuarter)
  const [showCapital, setShowCapital] = useState(false)
  // T12: consequence return panel — open state is local UI; the queue itself
  // lives in eventQueueSlice. Player presses C to open iff pendingFiredHooks
  // is non-empty (count guard lives in onConsequenceReview below).
  const [showConsequencePanel, setShowConsequencePanel] = useState(false)
  // Narrow subscriptions used to drive evaluateAndEnqueue's dep array — any
  // change to phase/meters/flags can change a revealCondition match.
  // (capitalMeter, flags, phase are already subscribed above; reuse those.)
  const meterHumanWelfare = useGameStore((s) => s.meters.HUMAN_WELFARE)
  const meterOwnerControl = useGameStore((s) => s.meters.OWNER_CONTROL)
  const pendingCount = useGameStore((s) => s.pendingFiredHooks.length)
  // Narrow selector: subscribe to length only (not the array reference) so
  // the dep change fires exactly when a hook is scheduled or removed. Needed
  // because a choice resolver can call scheduleHook() without any concurrent
  // phase/meter/flag change — without this dep, evaluateAndEnqueue would not
  // run and the §11 invariant would silently leak.
  const scheduledCount = useGameStore((s) => s.scheduledConsequences.length)
  const evaluateAndEnqueue = useGameStore((s) => s.evaluateAndEnqueue)
  // Auto-open when threshold first crossed and not yet shown this session.
  // (T11 intentional: simple one-shot open per cross — quarter rollover
  // reset is a later task.)
  const capitalShouldShow = capitalMeter > 80 && !capitalDeployedThisQuarter

  // Selected choice index for keyboard nav → ChoicePanel bridge
  const choiceSelectRef = useRef<((index: number) => void) | null>(null)
  const choiceCommitRef = useRef<(() => void) | null>(null)

  // Module ability focus bridge (T10 — M key focuses the ability button)
  const moduleFocusRef = useRef<(() => void) | null>(null)

  // LogDock history-modal toggle bridge (T13 — L key toggles the modal).
  // LogDock calls registerLogToggle once with its toggle function; the
  // L key callback below routes through this ref.
  const logToggleRef = useRef<(() => void) | null>(null)
  const registerLogToggle = useCallback((toggle: () => void) => {
    logToggleRef.current = toggle
  }, [])

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
      //    Read live state from the store (not render-time selectors) so
      //    rapid/programmatic commits never feed resolveChoice a stale view.
      const { meters, scheduledConsequences, ledger } = useGameStore.getState()
      const snapshot = {
        meters,
        scheduledConsequences,
        ledger,
      }

      // 3. Inject non-deterministic ctx (now + fresh trace id).
      const ctx = {
        now: Date.now(),
        traceId: freshTraceId(),
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
    [hookCatalog, applyDelta, appendTrace, scheduleHook],
  )

  // -------------------------------------------------------------------------
  // INSPECTION commit — resolve posture, fan out to store, advance cursor.
  // -------------------------------------------------------------------------
  const handleInspectionCommit = useCallback(
    (postureId: string) => {
      if (currentInspectionSceneIndex === null) return
      const scene = Q1_INSPECTION_SCENES[currentInspectionSceneIndex]
      if (!scene) return

      const { meters, scheduledConsequences, ledger, flags: liveFlags } = useGameStore.getState()
      const snapshot = { meters, scheduledConsequences, ledger, flags: liveFlags }
      const ctx = {
        now: Date.now(),
        traceId: freshTraceId(),
        sourceTaskId: mercyMarginTask.id,
        sourceChoiceId: makeChoiceId(`inspection-${scene.id}-${postureId}`),
      }

      const { trace, scheduled } = resolveInspection(snapshot, scene, postureId, ctx)

      // Fan-out to slices. Apply meter deltas from the resolver's view of the
      // posture (engine has already validated keys), then append + schedule.
      const posture = scene.postures.find((p) => p.id === postureId)
      if (posture) applyDelta(posture.meterDeltas)
      appendTrace(trace)
      for (const hook of scheduled) scheduleHook(hook)

      advanceInspection(Q1_INSPECTION_SCENES.length)
    },
    [currentInspectionSceneIndex, applyDelta, appendTrace, scheduleHook, advanceInspection],
  )

  // -------------------------------------------------------------------------
  // CAPITAL commit — resolve card, fan out, lock the quarter, close panel.
  // -------------------------------------------------------------------------
  const handleCapitalCommit = useCallback(
    (cardId: string) => {
      const card = Q1_CAPITAL_CARDS.find((c) => c.id === cardId)
      if (!card) return

      const { meters, scheduledConsequences, ledger, flags: liveFlags } = useGameStore.getState()
      const snapshot = { meters, scheduledConsequences, ledger, flags: liveFlags }
      const ctx = {
        now: Date.now(),
        traceId: freshTraceId(),
        sourceTaskId: makeTaskId('capital-deployment'),
        sourceChoiceId: makeChoiceId(`capital-${card.verb}-${card.id}`),
      }

      const { trace, scheduled, flagsAdded } = resolveCapital(snapshot, card, hookCatalog, ctx)

      applyDelta(card.meterDeltas)
      appendTrace(trace)
      for (const hook of scheduled) scheduleHook(hook)
      for (const flag of flagsAdded) setFlag(flag)

      markCapitalDeployed()
      setShowCapital(false)
    },
    [hookCatalog, applyDelta, appendTrace, scheduleHook, setFlag, markCapitalDeployed],
  )

  // Register keyboard callbacks from ChoicePanel
  const registerChoiceHandlers = useCallback(
    (selectFn: (index: number) => void, commitFn: () => void) => {
      choiceSelectRef.current = selectFn
      choiceCommitRef.current = commitFn
    },
    [],
  )

  // Register module-focus callback from RightModuleConsole
  const registerModuleFocus = useCallback((focusFn: () => void) => {
    moduleFocusRef.current = focusFn
  }, [])

  // T12: re-evaluate the scheduled-consequence queue whenever something that
  // could change a revealCondition match changes (PLAN.md §8: "evaluate runs
  // at every phase transition"). Narrow subscriptions above keep this
  // effect from running on every render.
  useEffect(() => {
    evaluateAndEnqueue()
  }, [
    phase,
    capitalMeter,
    meterHumanWelfare,
    meterOwnerControl,
    flags,
    scheduledCount,
    evaluateAndEnqueue,
  ])

  // Auto-open CapitalPowerPanel on the first false→true transition of
  // `capitalShouldShow`. Tracked by a ref so deferring (which sets
  // showCapital=false while the threshold stays true) does not re-trigger
  // a re-open on the next render. Quarter rollover (future task) re-arms
  // by setting capitalDeployedThisQuarter=false; the threshold check then
  // flips false→true again and the panel re-opens.
  const capitalAutoOpenedRef = useRef(false)
  useEffect(() => {
    if (capitalShouldShow && !capitalAutoOpenedRef.current) {
      capitalAutoOpenedRef.current = true
      setShowCapital(true)
    }
    if (!capitalShouldShow) {
      capitalAutoOpenedRef.current = false
    }
  }, [capitalShouldShow])

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
    onModuleFocus: useCallback(() => {
      moduleFocusRef.current?.()
    }, []),
    onConsequenceReview: useCallback(() => {
      // Open the panel only if the queue is non-empty AND the panel isn't
      // already open. The panel reads pendingFiredHooks[0] itself.
      if (pendingCount > 0) {
        setShowConsequencePanel(true)
      }
    }, [pendingCount]),
    onLogToggle: useCallback(() => {
      logToggleRef.current?.()
    }, []),
  })

  const showResult = phase === 'FIRST_RESULT' || lastTrace !== null

  // Active inspection scene — null whenever the panel should not render.
  const activeInspectionScene =
    currentInspectionSceneIndex !== null
      ? Q1_INSPECTION_SCENES[currentInspectionSceneIndex] ?? null
      : null

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

        {/* right — module console (top) + Silas panel (below) share the column */}
        <div style={{ gridArea: 'right' }} className="overflow-y-auto flex flex-col">
          <RightModuleConsole registerModuleFocus={registerModuleFocus} />
          <SilasPromptPanel prompt={SILAS_DIRECTIVE_EAST_WILMER} />
        </div>

        {/* logdock — T13: rolling ledger view + lazy virtualized history */}
        <div
          style={{ gridArea: 'logdock' }}
          className="border-t border-sealed-dim px-4 py-2 overflow-hidden"
        >
          <LogDock registerToggle={registerLogToggle} />
        </div>
      </div>

      {/*
        Modal panels — rendered after the grid so they sit at the end of the
        DOM. Native <dialog> goes to the top layer regardless of position,
        but this keeps the JSX readable.
      */}
      {activeInspectionScene && currentInspectionSceneIndex !== null && (
        <InspectionPanel
          scene={activeInspectionScene}
          flags={flags}
          onCommit={handleInspectionCommit}
          questionNumber={currentInspectionSceneIndex + 1}
          totalQuestions={Q1_INSPECTION_SCENES.length}
        />
      )}
      {showCapital && (
        <CapitalPowerPanel
          cards={Q1_CAPITAL_CARDS}
          onCommit={handleCapitalCommit}
          onDefer={() => setShowCapital(false)}
        />
      )}
      {/*
        T12: ConsequenceReturnPanel + EventQueueToast. The toast is always
        mounted (it self-hides when the queue is empty). The panel is always
        mounted too — the `open` prop controls its visible state so the
        close-effect can run `dlg.close()` on transition.
      */}
      <EventQueueToast />
      <ConsequenceReturnPanel
        open={showConsequencePanel}
        onClose={() => setShowConsequencePanel(false)}
      />
    </>
  )
}
