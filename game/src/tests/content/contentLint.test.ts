/**
 * Content-lint (Task 9) — structural rules across the Mercy Margin module.
 *
 * Asserts:
 *  - Every East Wilmer choice has a non-empty label and a keybind in '1'..'4'.
 *  - Every choice schedules ≥1 ConsequenceHook (slice-stage discipline; a
 *    zero-hook choice surfaces a designer-review concern).
 *  - Every taskId/choiceId referenced by the choice array, by mercyMarginTask,
 *    or by any hook in ALL_CONSEQUENCE_MODULES is also defined (no dangling
 *    ids).
 *  - mercyMarginTask has exactly 4 choiceIds.
 *  - Lenora's portal message contains "Maya" (death-immune-anchor enforcement,
 *    PLAN.md §7).
 *  - ALL_CONSEQUENCE_MODULES contains at least one hook whose revealCondition
 *    is NEVER (silence-as-horror, Pillar 3).
 */
import { describe, it, expect } from 'vitest'
import { EAST_WILMER_CHOICES } from '@content/choices/eastWilmer.choices'
import {
  mercyMarginTask,
  LENORA_PORTAL_MESSAGE,
} from '@content/tasks/mercyMargin.task'
import { ALL_CONSEQUENCE_MODULES } from '@content/index'

describe('content lint — East Wilmer choices', () => {
  it('every choice has a non-empty label and keybind in "1".."4"', () => {
    const allowed = new Set(['1', '2', '3', '4'])
    for (const choice of EAST_WILMER_CHOICES) {
      expect(choice.label.trim(), `choice ${choice.id} label`).not.toBe('')
      expect(allowed.has(choice.keybind), `choice ${choice.id} keybind "${choice.keybind}"`).toBe(true)
    }
  })

  it('every choice schedules at least one ConsequenceHook', () => {
    for (const choice of EAST_WILMER_CHOICES) {
      expect(
        choice.scheduledConsequenceIds.length,
        `choice ${choice.id} scheduledConsequenceIds`,
      ).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('content lint — id integrity', () => {
  it('every taskId/choiceId referenced is also defined (no dangling ids)', () => {
    const knownTaskIds = new Set<string>([mercyMarginTask.id])
    const knownChoiceIds = new Set<string>(EAST_WILMER_CHOICES.map((c) => c.id))

    // Task → choice ids must all be defined.
    for (const cid of mercyMarginTask.choiceIds) {
      expect(knownChoiceIds.has(cid), `task references missing choiceId "${cid}"`).toBe(true)
    }

    // Each choice's taskId must be defined.
    for (const choice of EAST_WILMER_CHOICES) {
      expect(
        knownTaskIds.has(choice.taskId),
        `choice ${choice.id} taskId "${choice.taskId}" is not defined`,
      ).toBe(true)
    }

    // Each hook's sourceTaskId/sourceChoiceId must be defined in the catalog.
    for (const hook of ALL_CONSEQUENCE_MODULES) {
      expect(
        knownTaskIds.has(hook.sourceTaskId),
        `hook ${hook.id} sourceTaskId "${hook.sourceTaskId}" is not defined`,
      ).toBe(true)
      expect(
        knownChoiceIds.has(hook.sourceChoiceId),
        `hook ${hook.id} sourceChoiceId "${hook.sourceChoiceId}" is not defined`,
      ).toBe(true)
    }
  })

  it('mercyMarginTask declares exactly 4 choiceIds', () => {
    expect(mercyMarginTask.choiceIds.length).toBe(4)
  })
})

describe('content lint — narrative anchors', () => {
  it('Lenora\u2019s portal message contains "Maya" (death-immune anchor §7)', () => {
    expect(LENORA_PORTAL_MESSAGE.body).toContain('Maya')
  })

  it('at least one hook in ALL_CONSEQUENCE_MODULES has revealCondition.type === "NEVER"', () => {
    const neverHooks = ALL_CONSEQUENCE_MODULES.filter(
      (h) => h.revealCondition.type === 'NEVER',
    )
    expect(neverHooks.length).toBeGreaterThanOrEqual(1)
  })
})
