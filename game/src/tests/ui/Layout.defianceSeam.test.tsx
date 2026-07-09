/**
 * S4 — Layout defiance-detection seam test (integration).
 *
 * Shipped Q1 content authors no conflictVariant yet (Track C lands those), so
 * this test mocks `@content/directiveSchedule` to augment Week 1's task with
 * ONE module-verb option carrying an authored conflict variant, installs
 * MOURNER at rank 3 (optionSurface then surfaces the conflict option), and
 * commits it through the real ChoicePanel:
 *
 *   - With the run seed FORCED (searched) to detect at the current band/week:
 *     detection is recorded (`lastDefiance.detected === true`) and the extra
 *     DETECTION_SCRUTINY_SPIKE lands on top of the base DEFY spike.
 *   - With a seed forced NOT to detect: no extra spike, detected === false.
 *   - Either way the normal resolveChoice() consequence flow is untouched —
 *     the ledger grows and the week resolves.
 *
 * COMPLY-path behavior is pinned by Layout.scrutinySeam.test.tsx (S3).
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import React from 'react'
import { useGameStore } from '@state/store'
import {
  detectDefiance,
  DETECTION_SCRUTINY_SPIKE,
} from '@systems/consciousness/runSeed'
import { DEFY_SPIKE } from '@systems/consciousness/scrutiny'
import { resetStore, matureAllPanels } from '@tests/state/testHelpers'
import {
  installVirtualizerStubs,
  restoreVirtualizerStubs,
} from './virtualLogTestHelpers'

vi.mock('@content/directiveSchedule', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@content/directiveSchedule')
  >()
  const augmented = actual.Q1_SEQUENCE.map((entry, i) =>
    i === 0
      ? {
          ...entry,
          task: {
            ...entry.task,
            moduleVerbOptions: [
              {
                moduleId: 'MOURNER' as const,
                verb: 'REFUSE',
                label: 'Hold the mercy margin open.',
                choiceId: entry.choices[0]!.id,
                conflictVariant: {
                  label: 'Refuse the directive. Keep the margin open.',
                  conflictsWithDirective: true as const,
                },
              },
            ],
          },
        }
      : entry,
  )
  return { ...actual, Q1_SEQUENCE: augmented }
})

// Imported AFTER the mock so Layout sees the augmented schedule.
import { Layout } from '@ui/shell/Layout'

/** jsdom has no matchMedia (same stub as Layout.scrutinySeam.test.tsx). */
function installMatchMedia(): void {
  const stub = (query: string): MediaQueryList => ({
    matches: query.includes('reduce'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation(stub))
}

/** Deterministic search for a seed with a forced detection outcome. */
function findSeed(predicate: (seed: number) => boolean): number {
  for (let s = 0; s < 10_000; s++) {
    if (predicate(s)) return s
  }
  throw new Error('findSeed: no seed found in 10k — check probabilities')
}

/** Render Layout and commit the surfaced conflict option (the last radio). */
function commitConflictOption(): void {
  render(React.createElement(Layout))
  const options = screen.getAllByRole('radio')
  // Base Week-1 choices + exactly one MODULE_VERB conflict extra appended
  // by optionSurface — the conflict option is the LAST radio.
  const conflict = options[options.length - 1]!
  fireEvent.click(conflict)
  fireEvent.keyDown(conflict, { key: 'Enter' })
}

describe('Layout — S4 defiance detection seam', () => {
  beforeAll(() => {
    installVirtualizerStubs()
  })
  afterAll(() => {
    restoreVirtualizerStubs()
  })
  beforeEach(() => {
    installMatchMedia()
    resetStore()
    matureAllPanels()
    // Rank 3 MOURNER → optionSurface renders the authored conflict variant.
    useGameStore.setState({ installedModules: { MOURNER: { rank: 3 } } })
    cleanup()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('DETECTED defiance: detection recorded + extra scrutiny spike on top of DEFY', () => {
    // scrutiny 5 → tier 2 at commit time; Week 1 is the active entry.
    const seed = findSeed((s) => detectDefiance(s, 2, 1))
    useGameStore.setState({ scrutiny: 5, runSeed: seed, lastDefiance: null })

    commitConflictOption()

    const state = useGameStore.getState()
    expect(state.lastDefiance).toEqual({ week: 1, detected: true })
    expect(state.scrutiny).toBe(5 + DEFY_SPIKE + DETECTION_SCRUTINY_SPIKE)
    // resolveChoice flow untouched — the trace landed and the week resolved.
    expect(state.ledger.length).toBeGreaterThan(0)
  })

  it('UNDETECTED defiance: base DEFY spike only, no extra spike', () => {
    const seed = findSeed((s) => !detectDefiance(s, 2, 1))
    useGameStore.setState({ scrutiny: 5, runSeed: seed, lastDefiance: null })

    commitConflictOption()

    const state = useGameStore.getState()
    expect(state.lastDefiance).toEqual({ week: 1, detected: false })
    expect(state.scrutiny).toBe(5 + DEFY_SPIKE)
    expect(state.ledger.length).toBeGreaterThan(0)
  })
})
