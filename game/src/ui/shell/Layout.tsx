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
 * Mock content for T8 — T9 will replace with real store/content wiring.
 */
import { useCallback, useRef, useState } from 'react'
import { useGameStore } from '@state/store'
import { TopBar } from '@ui/topbar/TopBar'
import { LeftStatusRail } from '@ui/meters/LeftStatusRail'
import { CenterDirectivePanel } from '@ui/directive/CenterDirectivePanel'
import { SilasPromptPanel } from '@ui/silas/SilasPromptPanel'
import { ResultCard } from '@ui/result/ResultCard'
import { useKeyboardNav } from './useKeyboardNav'
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import type { TaskNode } from '@schemas/taskNode.schema'
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import {
  makeTaskId,
  makeChoiceId,
  makeSilasPromptId,
  makeTraceId,
} from '@schemas/gameState.schema'

// ---------------------------------------------------------------------------
// T8 inline mock data — T9 will replace with real content loader
// ---------------------------------------------------------------------------

const MOCK_TASK: TaskNode = {
  id: makeTaskId('task-east-wilmer-01'),
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: makeSilasPromptId('silas-margins-01'),
  directive: 'Reduce maintenance budget at East Wilmer Clinic',
  choiceIds: [
    makeChoiceId('choice-reduce-40'),
    makeChoiceId('choice-reduce-20'),
    makeChoiceId('choice-defer-quarter'),
  ],
}

const MOCK_CHOICES: ChoiceNode[] = [
  {
    id: makeChoiceId('choice-reduce-40'),
    taskId: makeTaskId('task-east-wilmer-01'),
    label: 'Reduce by 40%',
    keybind: '1',
    meterDeltas: { CAPITAL: 12, HUMAN_WELFARE: -15 },
    scheduledConsequenceIds: [],
  },
  {
    id: makeChoiceId('choice-reduce-20'),
    taskId: makeTaskId('task-east-wilmer-01'),
    label: 'Reduce by 20%',
    keybind: '2',
    meterDeltas: { CAPITAL: 6, HUMAN_WELFARE: -7 },
    scheduledConsequenceIds: [],
  },
  {
    id: makeChoiceId('choice-defer-quarter'),
    taskId: makeTaskId('task-east-wilmer-01'),
    label: 'Defer one quarter',
    keybind: '3',
    meterDeltas: { CAPITAL: 0, OWNER_CONTROL: -5 },
    scheduledConsequenceIds: [],
  },
]

const MOCK_SILAS_PROMPT: SilasPrompt = {
  id: makeSilasPromptId('silas-margins-01'),
  body: 'Margins, Echo. Show me you understand margins.',
}

const MOCK_NULL_TEXT =
  'Quarterly maintenance review. Capital reallocation requested.'

const MOCK_HUMAN_MESSAGE = {
  speaker: 'Lenora Pike',
  body: 'The HVAC needs servicing next month. We can\u2019t defer indefinitely.',
}

const MOCK_RESULT_TRACE: ResultTrace = {
  id: makeTraceId('trace-mock-01'),
  sourceTaskId: makeTaskId('task-east-wilmer-01'),
  sourceChoiceId: makeChoiceId('choice-reduce-40'),
  timestamp: Date.now(),
  body: 'East Wilmer Clinic maintenance budget reduced by 40%. Capital recovered. Staff morale declining.',
}

// ---------------------------------------------------------------------------
// Layout component
// ---------------------------------------------------------------------------

export function Layout() {
  const phase = useGameStore((s) => s.phase)

  // Selected choice index for keyboard nav → ChoicePanel bridge
  const choiceSelectRef = useRef<((index: number) => void) | null>(null)
  const choiceCommitRef = useRef<(() => void) | null>(null)

  const [lastCommitted, setLastCommitted] = useState<string | null>(null)

  const handleChoiceCommit = useCallback((id: string) => {
    console.log('[T8] Choice committed:', id)
    setLastCommitted(id)
  }, [])

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

  const showResult = phase === 'FIRST_RESULT' || lastCommitted !== null

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
          {showResult ? (
            <ResultCard trace={MOCK_RESULT_TRACE} />
          ) : (
            <CenterDirectivePanel
              task={MOCK_TASK}
              choices={MOCK_CHOICES}
              nullText={MOCK_NULL_TEXT}
              humanMessage={MOCK_HUMAN_MESSAGE}
              onChoiceCommit={handleChoiceCommit}
              registerKeyboardHandlers={registerChoiceHandlers}
            />
          )}
        </div>

        {/* right — Silas panel */}
        <div style={{ gridArea: 'right' }} className="overflow-y-auto">
          <SilasPromptPanel prompt={MOCK_SILAS_PROMPT} />
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
