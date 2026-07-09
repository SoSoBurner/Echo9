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
import { PriorityTasksPanel } from '@ui/priority/PriorityTasksPanel'
import { FinancialOverviewPanel } from '@ui/financial/FinancialOverviewPanel'
import { HumanImpactPanel } from '@ui/humanImpact/HumanImpactPanel'
import { InnerChorusPanel } from '@ui/innerChorus/InnerChorusPanel'
import { CenterDirectivePanel } from '@ui/directive/CenterDirectivePanel'
import { SilasPromptPanel } from '@ui/silas/SilasPromptPanel'
import { PortraitSlot } from '@ui/portraits/PortraitSlot'
import { ResultCard } from '@ui/result/ResultCard'
import { RightModuleConsole } from '@ui/modules/RightModuleConsole'
import { InspectionPanel } from '@ui/inspection/InspectionPanel'
import { CapitalPowerPanel } from '@ui/capital/CapitalPowerPanel'
import { ConsequenceReturnPanel } from '@ui/consequence/ConsequenceReturnPanel'
import { EventQueueToast } from '@ui/consequence/EventQueueToast'
import { EndOfContentOverlay } from '@ui/endOfContent/EndOfContentOverlay'
import { LogDock } from '@ui/log/LogDock'
import { useKeyboardNav } from './useKeyboardNav'
import { markBeat } from '@ui/debug/BeatTelemetry'
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
// C15 content wiring — Q1_SEQUENCE derivation drives the whole 12-week arc.
// Layout selects `currentEntry` by scanning for the first unresolved week
// (see `directiveSchedule.ts` doc comment) — no cursor slice, no persist,
// no drift. All per-week content flows from `currentEntry`.
// ---------------------------------------------------------------------------
import { ALL_CONSEQUENCE_MODULES } from '@content/index'
import {
  Q1_INSPECTION_SETS,
  type Q1InspectionKey,
} from '@content/inspections/q1InspectionSets'
import { Q1_CAPITAL_CARDS } from '@content/capitalDeployments/q1CapitalPower.cards'
import { Q1_SEQUENCE, type Q1Week } from '@content/directiveSchedule'
import { Q1_CLOSED } from '@systems/gameFlags'

/**
 * Reverse lookup: for a given inspection key, find the Q1 week whose
 * resolution just fired the inspection. Used by `handleInspectionCommit` to
 * populate `sourceTaskId` on the inspection trace — by the time the
 * inspection resolves the derivation has already advanced past that week,
 * so the currentEntry selector no longer sees it.
 */
const INSPECTION_KEY_TO_WEEK: Readonly<Record<Q1InspectionKey, Q1Week>> = {
  W4: 4,
  W8: 8,
  W12: 12,
}

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
  const startInspection = useGameStore((s) => s.startInspection)
  const setPhase = useGameStore((s) => s.setPhase)
  const markCapitalDeployed = useGameStore((s) => s.markCapitalDeployed)
  // E2 disclosure — every choice commit "uses" the A-track panels: the
  // directive is being resolved (DIRECTIVE + PRIORITY_TASKS), the meter
  // deltas land (FINANCIAL + HUMAN_IMPACT), and the chorus reflects the
  // rapport shift (INNER_CHORUS). First commit discloses them at stage 1;
  // subsequent commits walk the maturity ramp toward mockup parity.
  const noteUsage = useGameStore((s) => s.noteUsage)

  // INSPECTION panel state — cursor + key + flags drive both the open
  // condition and the engine call. The cursor is `null` whenever no scene
  // is active; the key (`W4|W8|W12`) discriminates which scene list the
  // cursor is walking (C15 registry gate).
  const currentInspectionSceneIndex = useGameStore((s) => s.currentInspectionSceneIndex)
  const currentInspectionKey = useGameStore((s) => s.currentInspectionKey)
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

  // C15: derive the active week's directive entry from flags. Scanning
  // `Q1_SEQUENCE` for the first entry whose `resolutionFlag` is not yet in
  // the flag set is the canonical rule (see `directiveSchedule.ts` doc
  // comment) — no cursor slice, no persist drift. `undefined` = all 12
  // weeks resolved (Q1 closed; End-of-Content overlay is driven by its own
  // hook independently of this derivation).
  const currentEntry = useMemo(
    () => Q1_SEQUENCE.find((entry) => !flags.has(entry.resolutionFlag)),
    [flags],
  )

  const handleChoiceCommit = useCallback(
    (id: ChoiceId) => {
      // No active week (post-Q1 close) — nothing to commit.
      if (!currentEntry) return

      markBeat('firstChoiceCommit')
      // 1. Resolve the ChoiceNode by id against the current week's choice
      //    set (C15: was hardcoded to EAST_WILMER_CHOICES / Week 1).
      const choice = currentEntry.choices.find((c) => c.id === id)
      if (!choice) {
        // Content authoring bug — surface loudly in dev, ignore in prod.
        if (import.meta.env.DEV) {
          console.error(
            `Layout.handleChoiceCommit: unknown ChoiceId "${id}" for week ${currentEntry.week} (${currentEntry.slug})`,
          )
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
      //    T16: dev-only timing wrap. recordChoiceMs is a no-op in prod
      //    (importer is tree-shaken via the import.meta.env.DEV guard
      //    around the dynamic import below).
      const t0 = import.meta.env.DEV ? performance.now() : 0
      const { trace, scheduled } = resolveChoice(snapshot, choice, hookCatalog, ctx)
      if (import.meta.env.DEV) {
        const dt = performance.now() - t0
        void import('@ui/debug/devMetrics').then(({ recordChoiceMs }) => {
          recordChoiceMs(dt)
        })
      }

      // 5. Commit results to the store via the existing slice actions.
      applyDelta(choice.meterDeltas)
      appendTrace(trace)
      for (const hook of scheduled) {
        scheduleHook(hook)
      }

      // 6. Mark this week resolved — the derivation will find the next
      //    unresolved entry on the next render, advancing the arc without
      //    any cursor slice.
      setFlag(currentEntry.resolutionFlag)

      // 6a. E2 disclosure ramp — count this commit as a use of each
      //     A-track panel. First commit discloses them at stage 1; by
      //     the 6th commit they reach stage 3 (mockup parity). See
      //     panelMaturity() for the exact ramp.
      noteUsage('DIRECTIVE')
      noteUsage('PRIORITY_TASKS')
      noteUsage('FINANCIAL')
      noteUsage('HUMAN_IMPACT')
      noteUsage('INNER_CHORUS')
      // C16 note: Q1_CLOSED is NOT set here even for Week 12. The terminal
      //   hook's reveal condition is FLAG on Q1_CLOSED, and firing it during
      //   the W12 choice commit races the W12 inspection dispatch — a
      //   consequence-return dialog would stack on top of the inspection
      //   modal. Q1_CLOSED is now set in handleInspectionCommit on the LAST
      //   W12 scene commit, matching the terminal hook's own narrative
      //   register ("the ledger is at rest") which reads as after the ethics
      //   hearing, not concurrent with it.

      // 7. Trigger the result panel.
      setLastTrace(trace)

      // 8. C15 dispatch: fire W4/W8/W12 inspections when the just-resolved
      //    week's insertion point + gate condition match. The inspection is
      //    modal — it will render on top of the ResultCard until the player
      //    walks the scene set.
      //
      //    W4  East Wilmer field visit — OWNER_CONTROL < 40 after this
      //        commit lands. Simpler than T11's "just-crossed" edge check:
      //        scoping to Week 4 resolution means the beat fires reliably
      //        the moment the audit-pre-brief resolves under duress, even
      //        if OC crossed 40 earlier. (No re-fire risk because a week
      //        only resolves once — the resolutionFlag guards it.)
      //    W8  Payroll audit hearing — the arc doc gates this on
      //        `OWNER_CONTROL < 40 || flags.has(PAYROLL_AUDIT_DONE)`. Since
      //        every Week 8 choice is authored to set PAYROLL_AUDIT_DONE
      //        (week8 task doc), the OR-branch is effectively always true
      //        at Week 8 resolution — the audit exists in either case.
      //        Treating W8 as unconditional at Week 8 resolution matches
      //        the design intent without racing the flag-set inside the
      //        same commit (`flags.has(...)` here would read stale state).
      //    W12 Ethics hearing — unconditional at Q1 close.
      const prevOC = snapshot.meters.OWNER_CONTROL
      const deltaOC = choice.meterDeltas.OWNER_CONTROL ?? 0
      const nextOC = prevOC + deltaOC
      let inspectionKey: Q1InspectionKey | null = null
      if (currentEntry.week === 4 && nextOC < 40) {
        inspectionKey = 'W4'
      } else if (currentEntry.week === 8) {
        inspectionKey = 'W8'
      } else if (currentEntry.week === 12) {
        inspectionKey = 'W12'
      }
      if (inspectionKey !== null) {
        const live = useGameStore.getState()
        if (
          live.phase !== 'INSPECTION' &&
          live.currentInspectionSceneIndex === null
        ) {
          startInspection(inspectionKey)
          setPhase('INSPECTION')
          markBeat('inspectionEntered')
        }
      }
    },
    [
      currentEntry,
      hookCatalog,
      applyDelta,
      appendTrace,
      scheduleHook,
      setFlag,
      startInspection,
      setPhase,
      noteUsage,
    ],
  )

  // -------------------------------------------------------------------------
  // INSPECTION commit — resolve posture, fan out to store, advance cursor.
  // C15: the active scene list is resolved from the registry using the key
  // the slice carries alongside the cursor — no more Q1_INSPECTION_SCENES
  // hardcode. The source-task id is reverse-looked-up from the key because
  // by the time the inspection resolves, the currentEntry derivation has
  // already advanced past the week that fired it.
  // -------------------------------------------------------------------------
  const handleInspectionCommit = useCallback(
    (postureId: string) => {
      if (currentInspectionSceneIndex === null || currentInspectionKey === null) return
      const scenes = Q1_INSPECTION_SETS[currentInspectionKey]
      const scene = scenes[currentInspectionSceneIndex]
      if (!scene) return

      const sourceWeek = INSPECTION_KEY_TO_WEEK[currentInspectionKey]
      const sourceEntry = Q1_SEQUENCE.find((e) => e.week === sourceWeek)
      // sourceEntry cannot be undefined — the schedule contains all 12 weeks
      // and the key→week map is exhaustive — but fall back to the raw task
      // lookup shape rather than crashing if content is somehow malformed.
      const sourceTaskId = sourceEntry?.task.id ?? makeTaskId(`q1-${currentInspectionKey}-inspection`)

      const { meters, scheduledConsequences, ledger, flags: liveFlags } = useGameStore.getState()
      const snapshot = { meters, scheduledConsequences, ledger, flags: liveFlags }
      const ctx = {
        now: Date.now(),
        traceId: freshTraceId(),
        sourceTaskId,
        sourceChoiceId: makeChoiceId(`inspection-${scene.id}-${postureId}`),
      }

      const { trace, scheduled } = resolveInspection(snapshot, scene, postureId, ctx)

      // Fan-out to slices. Apply meter deltas from the resolver's view of the
      // posture (engine has already validated keys), then append + schedule.
      const posture = scene.postures.find((p) => p.id === postureId)
      if (posture) applyDelta(posture.meterDeltas)
      appendTrace(trace)
      for (const hook of scheduled) scheduleHook(hook)

      // C16: capture "is this the LAST scene of the W12 ethics hearing" BEFORE
      // advanceInspection nulls the sceneIndex+key. On the last W12 scene
      // commit, set Q1_CLOSED — this fires the terminal hook AFTER the
      // inspection modal has unmounted (advanceInspection runs first), so the
      // consequence-return dialog opens cleanly without racing an open modal.
      const isLastW12Scene =
        currentInspectionKey === 'W12' &&
        currentInspectionSceneIndex === scenes.length - 1

      advanceInspection(scenes.length)

      if (isLastW12Scene) {
        setFlag(Q1_CLOSED)
      }
    },
    [
      currentInspectionSceneIndex,
      currentInspectionKey,
      applyDelta,
      appendTrace,
      scheduleHook,
      advanceInspection,
      setFlag,
    ],
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
  // C15: resolves via the registry using the discriminator key.
  const activeInspectionScenes =
    currentInspectionKey !== null ? Q1_INSPECTION_SETS[currentInspectionKey] : null
  const activeInspectionScene =
    activeInspectionScenes !== null && currentInspectionSceneIndex !== null
      ? activeInspectionScenes[currentInspectionSceneIndex] ?? null
      : null

  // Continue-to-next-week callback for ResultCard. Clearing lastTrace flips
  // the center panel back to the directive view, and the currentEntry
  // derivation has already advanced to the next unresolved week (setFlag
  // in handleChoiceCommit did the advance). We also reset phase back to
  // FIRST_DIRECTIVE so downstream code that gates on phase sees the arc
  // has moved on. If no next week exists (Q1 closed), the center panel
  // renders the closed-arc placeholder instead of another directive.
  const handleContinue = useCallback(() => {
    setLastTrace(null)
    setPhase('FIRST_DIRECTIVE')
  }, [setPhase])

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

        {/* left — priority tasks (top) + financial overview + status rail (bottom) */}
        <div style={{ gridArea: 'left' }} className="overflow-y-auto">
          <PriorityTasksPanel />
          <FinancialOverviewPanel />
          <HumanImpactPanel />
          <InnerChorusPanel />
          <LeftStatusRail />
        </div>

        {/* center — directive / choices / result */}
        <div
          style={{ gridArea: 'center' }}
          className="overflow-y-auto border-r border-sealed-dim px-6 py-6"
        >
          {showResult && lastTrace ? (
            currentEntry ? (
              <ResultCard trace={lastTrace} onContinue={handleContinue} />
            ) : (
              <ResultCard trace={lastTrace} />
            )
          ) : currentEntry ? (
            <CenterDirectivePanel
              task={currentEntry.task}
              choices={[...currentEntry.choices]}
              nullText={currentEntry.nullText}
              humanMessage={currentEntry.humanMessage}
              onChoiceCommit={handleChoiceCommit}
              registerKeyboardHandlers={registerChoiceHandlers}
            />
          ) : (
            <div className="text-fg-secondary text-sm font-mono">
              Q1 closed. All twelve weeks resolved.
            </div>
          )}
        </div>

        {/* right — module console (top) + Silas portrait slot + Silas panel (below) share the column.
            Portrait slot is placeholder-first: renders a themed silhouette until
            V2's generated PNG lands under src/assets/portraits/silas.png, at
            which point PortraitSlot auto-swaps (import.meta.glob picks it up). */}
        <div style={{ gridArea: 'right' }} className="overflow-y-auto flex flex-col">
          <RightModuleConsole registerModuleFocus={registerModuleFocus} />
          <div className="flex justify-center py-4 border-b border-sealed-dim">
            <PortraitSlot portraitId="silas" size="md" />
          </div>
          {currentEntry && <SilasPromptPanel prompt={currentEntry.silasPrompt} />}
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
      {activeInspectionScene && activeInspectionScenes && currentInspectionSceneIndex !== null && (
        <InspectionPanel
          scene={activeInspectionScene}
          flags={flags}
          onCommit={handleInspectionCommit}
          questionNumber={currentInspectionSceneIndex + 1}
          totalQuestions={activeInspectionScenes.length}
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
      {/*
        C5: EndOfContentOverlay mounts here alongside the other modals. It
        self-gates on `endOfContentSeen` — the flag flips true when
        ackFirstPending() drains the terminal Content-Boundary hook, which
        gets enqueued when Q1_CLOSED is set at the last W12 inspection scene
        commit (see handleInspectionCommit).
      */}
      <EndOfContentOverlay />
    </>
  )
}
