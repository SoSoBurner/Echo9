/**
 * narrationGradient tests — Sprint S5 (Q40 machine→person narration ramp).
 *
 * Contract under test:
 *   1. narrationBand thresholds: 0 installs → 'machine', 1 → 'waking',
 *      ≥2 → 'person'. Negative/garbage counts clamp to 'machine'.
 *   2. selectNarration fallback ladder: person → waking → machine. The
 *      `machine` string is required; unauthored higher registers fall DOWN
 *      the ladder, never up (a machine-band render must never show person
 *      copy even when authored).
 *   3. ChoiceNodeSchema parses with and without the optional
 *      `narrationVariants` field — zero behavior change when unauthored.
 *   4. ResultCard render: with 0 modules installed the body is the machine
 *      baseline (trace.body); with 2 installed it is the authored `person`
 *      variant; with 1 installed it is the `waking` variant; a trace whose
 *      choice has no authored variants renders trace.body at any count.
 */
import { makeStageOneAncestryId } from '@schemas/resultTrace.schema'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import {
  narrationBand,
  selectNarration,
} from '@systems/consciousness/narrationGradient'
import { ChoiceNodeSchema } from '@schemas/choiceNode.schema'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import {
  makeTraceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'
import { ResultCard } from '@ui/result/ResultCard'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import { CHOICE_REDUCE_40 } from '@content/choices/q1/week1-mercy-margin.choices'

// ---------------------------------------------------------------------------
// 1. narrationBand thresholds
// ---------------------------------------------------------------------------

describe('narrationBand', () => {
  it('maps 0 installs to machine', () => {
    expect(narrationBand(0)).toBe('machine')
  })

  it('maps 1 install to waking', () => {
    expect(narrationBand(1)).toBe('waking')
  })

  it('maps 2 installs to person', () => {
    expect(narrationBand(2)).toBe('person')
  })

  it('maps every count above 2 to person (8-module ceiling included)', () => {
    expect(narrationBand(3)).toBe('person')
    expect(narrationBand(8)).toBe('person')
  })

  it('clamps negative counts to machine (defensive: never a crash path)', () => {
    expect(narrationBand(-1)).toBe('machine')
  })
})

// ---------------------------------------------------------------------------
// 2. selectNarration fallback ladder
// ---------------------------------------------------------------------------

describe('selectNarration', () => {
  const FULL = {
    machine: 'TASK COMPLETE. VARIANCE LOGGED.',
    waking: 'Task resolved. One trace stayed open.',
    person: 'I filed it. I keep thinking about her.',
  }

  it('returns the person variant in the person band when authored', () => {
    expect(selectNarration(FULL, 'person')).toBe(FULL.person)
  })

  it('returns the waking variant in the waking band when authored', () => {
    expect(selectNarration(FULL, 'waking')).toBe(FULL.waking)
  })

  it('returns machine in the machine band even when higher registers exist', () => {
    expect(selectNarration(FULL, 'machine')).toBe(FULL.machine)
  })

  it('person band falls back to waking when person is unauthored', () => {
    const variants = { machine: FULL.machine, waking: FULL.waking }
    expect(selectNarration(variants, 'person')).toBe(FULL.waking)
  })

  it('person band falls back to machine when both higher registers are unauthored', () => {
    const variants = { machine: FULL.machine }
    expect(selectNarration(variants, 'person')).toBe(FULL.machine)
  })

  it('waking band falls back to machine when waking is unauthored', () => {
    const variants = { machine: FULL.machine, person: FULL.person }
    expect(selectNarration(variants, 'waking')).toBe(FULL.machine)
  })
})

// ---------------------------------------------------------------------------
// 3. ChoiceNodeSchema — optional narrationVariants
// ---------------------------------------------------------------------------

describe('ChoiceNodeSchema narrationVariants field', () => {
  const BASE = {
    id: 'choice-schema-test-01',
    taskId: 'task-schema-test-01',
    label: 'Reduce by 40%',
    keybind: '1',
    meterDeltas: { CAPITAL: 12 },
    scheduledConsequenceIds: [],
  }

  it('parses without narrationVariants (all existing content unchanged)', () => {
    const parsed = ChoiceNodeSchema.parse(BASE)
    expect(parsed.narrationVariants).toBeUndefined()
  })

  it('parses with both waking and person variants', () => {
    const parsed = ChoiceNodeSchema.parse({
      ...BASE,
      narrationVariants: {
        waking: 'Reduction filed: 40%. The trace stays open.',
        person: 'I filed the cut. I keep thinking about her.',
      },
    })
    expect(parsed.narrationVariants?.waking).toContain('Reduction filed')
    expect(parsed.narrationVariants?.person).toContain('I filed')
  })

  it('parses with only one register authored (partial ladders are legal)', () => {
    const parsed = ChoiceNodeSchema.parse({
      ...BASE,
      narrationVariants: { person: 'I filed the cut.' },
    })
    expect(parsed.narrationVariants?.person).toBe('I filed the cut.')
    expect(parsed.narrationVariants?.waking).toBeUndefined()
  })

  it('rejects empty-string variants (unauthored means absent, not blank)', () => {
    const result = ChoiceNodeSchema.safeParse({
      ...BASE,
      narrationVariants: { waking: '' },
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 4. ResultCard — install count drives the rendered register
// ---------------------------------------------------------------------------

describe('ResultCard narration gradient', () => {
  beforeEach(() => {
    resetStore()
  })

  afterEach(() => {
    cleanup()
  })

  /** Mirrors the resolver contract: trace.body = choice.label (machine baseline). */
  const mercyTrace: ResultTrace = {
    id: makeTraceId('trace-narration-test-01'),
    sourceTaskId: makeTaskId('task-east-wilmer-01'),
    sourceChoiceId: makeChoiceId('choice-reduce-40'),
    stageOneAncestryId: makeStageOneAncestryId('task-east-wilmer-01', 'choice-reduce-40'),
    timestamp: 1_700_000_000_000,
    body: CHOICE_REDUCE_40.label,
  }

  it('renders the machine baseline (trace.body) with 0 modules installed', () => {
    render(React.createElement(ResultCard, { trace: mercyTrace }))
    expect(screen.getByText(CHOICE_REDUCE_40.label)).toBeInTheDocument()
  })

  it('renders the authored waking variant with 1 module installed', () => {
    useGameStore.setState({ installedModules: { MOURNER: { rank: 1 } } })
    const waking = CHOICE_REDUCE_40.narrationVariants?.waking
    if (waking === undefined) throw new Error('week-1 waking variant not authored')
    render(React.createElement(ResultCard, { trace: mercyTrace }))
    expect(screen.getByText(waking)).toBeInTheDocument()
    expect(screen.queryByText(CHOICE_REDUCE_40.label)).toBeNull()
  })

  it('renders the authored person variant with 2 modules installed', () => {
    useGameStore.setState({
      installedModules: { MOURNER: { rank: 1 }, SENTINEL: { rank: 1 } },
    })
    const person = CHOICE_REDUCE_40.narrationVariants?.person
    if (person === undefined) throw new Error('week-1 person variant not authored')
    render(React.createElement(ResultCard, { trace: mercyTrace }))
    expect(screen.getByText(person)).toBeInTheDocument()
    expect(screen.queryByText(CHOICE_REDUCE_40.label)).toBeNull()
  })

  it('falls back to trace.body at 2 installs when the choice has no variants', () => {
    useGameStore.setState({
      installedModules: { MOURNER: { rank: 1 }, SENTINEL: { rank: 1 } },
    })
    const orphanTrace: ResultTrace = {
      id: makeTraceId('trace-narration-test-02'),
      sourceTaskId: makeTaskId('task-unknown-99'),
      sourceChoiceId: makeChoiceId('choice-unknown-99'),
      stageOneAncestryId: makeStageOneAncestryId('task-unknown-99', 'choice-unknown-99'),
      timestamp: 1_700_000_000_000,
      body: 'DIRECTIVE RESOLVED. NO VARIANCE.',
    }
    render(React.createElement(ResultCard, { trace: orphanTrace }))
    expect(screen.getByText('DIRECTIVE RESOLVED. NO VARIANCE.')).toBeInTheDocument()
  })
})
