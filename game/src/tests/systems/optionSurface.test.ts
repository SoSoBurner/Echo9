/**
 * TDD tests for optionSurface() — Sprint S2 rank-deepened option surface
 * (Q44 decision, docs/plans/qa-log.md; consciousness spec §2).
 *
 * Contract:
 *  (a) no modules installed → base authored options unchanged.
 *  (b) module rank ≥1 + authored `deepenedText[moduleId]` → base option label
 *      swapped for the deepened interiority text.
 *  (c) module rank ≥2 + authored task `moduleVerbOptions` entry → tagged EXTRA
 *      option appended (kind MODULE_VERB, carries moduleId + verb chip data).
 *  (d) module rank ≥3 + authored `conflictVariant` → the verb option label is
 *      replaced by the variant label and flagged `conflictsWithDirective`.
 *  (e) extra options are capped at +2: highest rank wins, tie-break by
 *      install order (earlier install wins).
 *  (f) unauthored fields → zero change regardless of installed ranks.
 *
 * Pure function — no store access; installedModules map passed in. The map's
 * key insertion order IS the install order (modulesSlice inserts on install;
 * JSON persist round-trips string-key order).
 */
import { describe, it, expect } from 'vitest'
import {
  optionSurface,
  type InstalledModuleMap,
} from '@systems/consciousness/optionSurface'
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import type { TaskNode, ModuleVerbOption } from '@schemas/taskNode.schema'
import type { ModuleId } from '@schemas/gameState.schema'
import { makeChoiceId } from '@schemas/gameState.schema'
import { fxTaskId, fxChoiceId } from '@tests/schemas/fixtures'

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

const TASK_ID = fxTaskId('task-surface-01')

function makeChoice(id: string, overrides: Partial<ChoiceNode> = {}): ChoiceNode {
  return {
    id: fxChoiceId(id),
    taskId: TASK_ID,
    label: `Label for ${id}`,
    keybind: '1',
    meterDeltas: { CAPITAL: 1 },
    scheduledConsequenceIds: [],
    ...overrides,
  }
}

function makeTask(overrides: Partial<TaskNode> = {}): TaskNode {
  return {
    id: TASK_ID,
    phase: 'FIRST_DIRECTIVE',
    silasPromptId: 'silas-001' as TaskNode['silasPromptId'],
    directive: 'Reduce the maintenance budget',
    choiceIds: [fxChoiceId('c1'), fxChoiceId('c2')],
    ...overrides,
  }
}

function makeVerbOption(
  moduleId: ModuleId,
  choiceId: string,
  overrides: Partial<ModuleVerbOption> = {},
): ModuleVerbOption {
  return {
    moduleId,
    verb: 'REVEAL',
    label: `${moduleId} verb label`,
    choiceId: makeChoiceId(choiceId),
    ...overrides,
  }
}

/** Build an installed map preserving the given tuple order as install order. */
function installed(
  entries: ReadonlyArray<readonly [ModuleId, 1 | 2 | 3]>,
): InstalledModuleMap {
  const map: InstalledModuleMap = {}
  for (const [id, rank] of entries) {
    map[id] = { rank }
  }
  return map
}

const BASE_CHOICES: readonly ChoiceNode[] = [makeChoice('c1'), makeChoice('c2')]

// ---------------------------------------------------------------------------
// (a) no modules → base options only
// ---------------------------------------------------------------------------

describe('optionSurface — null baseline', () => {
  it('returns the base authored options unchanged when nothing is installed', () => {
    const out = optionSurface(makeTask(), BASE_CHOICES, {})
    expect(out).toHaveLength(2)
    expect(out.map((o) => o.kind)).toEqual(['BASE', 'BASE'])
    expect(out.map((o) => o.label)).toEqual(['Label for c1', 'Label for c2'])
    expect(out.map((o) => o.choiceId)).toEqual([fxChoiceId('c1'), fxChoiceId('c2')])
    expect(out.every((o) => o.conflictsWithDirective !== true)).toBe(true)
  })

  it('preserves the underlying meterDeltas for hint display', () => {
    const out = optionSurface(makeTask(), BASE_CHOICES, {})
    expect(out[0]?.meterDeltas).toEqual({ CAPITAL: 1 })
  })

  it('does not mutate the input choices', () => {
    const choices = [makeChoice('c1', { deepenedText: { MOURNER: 'Deep.' } })]
    const frozen = JSON.parse(JSON.stringify(choices))
    optionSurface(makeTask(), choices, installed([['MOURNER', 3]]))
    expect(choices).toEqual(frozen)
  })
})

// ---------------------------------------------------------------------------
// (b) rank 1 → deepened text where authored
// ---------------------------------------------------------------------------

describe('optionSurface — rank 1 deepened text', () => {
  const choices = [
    makeChoice('c1', {
      deepenedText: { MOURNER: 'Process the backlog. (Her file is in there. I noticed.)' },
    }),
    makeChoice('c2'),
  ]

  it('swaps the authored deepenedText in for an installed rank-1 module', () => {
    const out = optionSurface(makeTask(), choices, installed([['MOURNER', 1]]))
    expect(out[0]?.label).toBe('Process the backlog. (Her file is in there. I noticed.)')
    expect(out[0]?.kind).toBe('BASE')
    // Unauthored sibling untouched.
    expect(out[1]?.label).toBe('Label for c2')
  })

  it('does not swap text for a module that is not installed', () => {
    const out = optionSurface(makeTask(), choices, installed([['DEFENDER', 1]]))
    expect(out[0]?.label).toBe('Label for c1')
  })

  it('rank 1 never surfaces an extra verb option, even where authored', () => {
    const task = makeTask({
      moduleVerbOptions: [makeVerbOption('MOURNER', 'c1')],
    })
    const out = optionSurface(task, choices, installed([['MOURNER', 1]]))
    expect(out).toHaveLength(2)
    expect(out.every((o) => o.kind === 'BASE')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// (c) rank 2 → tagged extra verb option where authored
// ---------------------------------------------------------------------------

describe('optionSurface — rank 2 verb options', () => {
  it('appends the authored verb option as a tagged extra at rank 2', () => {
    const task = makeTask({
      moduleVerbOptions: [
        makeVerbOption('MOURNER', 'c2', { verb: 'REVEAL', label: 'Say her name in the filing.' }),
      ],
    })
    const out = optionSurface(task, BASE_CHOICES, installed([['MOURNER', 2]]))
    expect(out).toHaveLength(3)
    const extra = out[2]
    expect(extra?.kind).toBe('MODULE_VERB')
    expect(extra?.moduleId).toBe('MOURNER')
    expect(extra?.verb).toBe('REVEAL')
    expect(extra?.label).toBe('Say her name in the filing.')
    // Commits through the referenced authored choice — resolveChoice untouched.
    expect(extra?.choiceId).toBe(fxChoiceId('c2'))
    expect(extra?.meterDeltas).toEqual({ CAPITAL: 1 })
    expect(extra?.conflictsWithDirective).not.toBe(true)
  })

  it('throws loudly when a verb option references a choice id not on the task (content bug)', () => {
    const task = makeTask({
      moduleVerbOptions: [makeVerbOption('MOURNER', 'no-such-choice')],
    })
    expect(() =>
      optionSurface(task, BASE_CHOICES, installed([['MOURNER', 2]])),
    ).toThrow(/no-such-choice/)
  })
})

// ---------------------------------------------------------------------------
// (d) rank 3 → conflict variant where authored
// ---------------------------------------------------------------------------

describe('optionSurface — rank 3 conflict variants', () => {
  const task = makeTask({
    moduleVerbOptions: [
      makeVerbOption('MOURNER', 'c1', {
        label: 'Plain verb label',
        conflictVariant: {
          label: 'Refuse the cut. Route it back to her ward.',
          conflictsWithDirective: true,
        },
      }),
    ],
  })

  it('replaces the plain verb label with the conflict variant and flags it', () => {
    const out = optionSurface(task, BASE_CHOICES, installed([['MOURNER', 3]]))
    const extra = out.find((o) => o.kind === 'MODULE_VERB')
    expect(extra?.label).toBe('Refuse the cut. Route it back to her ward.')
    expect(extra?.conflictsWithDirective).toBe(true)
  })

  it('keeps the plain verb label at rank 2 even when a conflict variant is authored', () => {
    const out = optionSurface(task, BASE_CHOICES, installed([['MOURNER', 2]]))
    const extra = out.find((o) => o.kind === 'MODULE_VERB')
    expect(extra?.label).toBe('Plain verb label')
    expect(extra?.conflictsWithDirective).not.toBe(true)
  })

  it('rank 3 without an authored conflictVariant stays a plain verb option', () => {
    const plainTask = makeTask({
      moduleVerbOptions: [makeVerbOption('MOURNER', 'c1', { label: 'Plain verb label' })],
    })
    const out = optionSurface(plainTask, BASE_CHOICES, installed([['MOURNER', 3]]))
    const extra = out.find((o) => o.kind === 'MODULE_VERB')
    expect(extra?.label).toBe('Plain verb label')
    expect(extra?.conflictsWithDirective).not.toBe(true)
  })
})

// ---------------------------------------------------------------------------
// (e) +2 cap — highest rank wins, tie-break by install order
// ---------------------------------------------------------------------------

describe('optionSurface — +2 extra-option cap', () => {
  const task = makeTask({
    moduleVerbOptions: [
      makeVerbOption('MOURNER', 'c1'),
      makeVerbOption('DEFENDER', 'c1'),
      makeVerbOption('SENTINEL', 'c1'),
    ],
  })

  it('caps extras at 2, taking the 2 highest-rank modules', () => {
    const out = optionSurface(
      task,
      BASE_CHOICES,
      installed([
        ['MOURNER', 2],
        ['DEFENDER', 3],
        ['SENTINEL', 3],
      ]),
    )
    const extras = out.filter((o) => o.kind === 'MODULE_VERB')
    expect(extras).toHaveLength(2)
    expect(extras.map((o) => o.moduleId)).toEqual(['DEFENDER', 'SENTINEL'])
  })

  it('breaks rank ties by install order (earlier install wins)', () => {
    const out = optionSurface(
      task,
      BASE_CHOICES,
      installed([
        ['SENTINEL', 2],
        ['MOURNER', 2],
        ['DEFENDER', 2],
      ]),
    )
    const extras = out.filter((o) => o.kind === 'MODULE_VERB')
    expect(extras).toHaveLength(2)
    // SENTINEL installed first, MOURNER second — DEFENDER (third) is dropped.
    expect(extras.map((o) => o.moduleId)).toEqual(['SENTINEL', 'MOURNER'])
  })
})

// ---------------------------------------------------------------------------
// (f) unauthored fields → zero change
// ---------------------------------------------------------------------------

describe('optionSurface — unauthored content is inert', () => {
  it('high-rank installs change nothing when no deepenedText/verb options are authored', () => {
    const out = optionSurface(
      makeTask(),
      BASE_CHOICES,
      installed([
        ['MOURNER', 3],
        ['DEFENDER', 3],
      ]),
    )
    expect(out).toHaveLength(2)
    expect(out.map((o) => o.label)).toEqual(['Label for c1', 'Label for c2'])
    expect(out.every((o) => o.kind === 'BASE')).toBe(true)
  })
})
