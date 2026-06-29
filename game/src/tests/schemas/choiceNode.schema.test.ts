import { describe, it, expect } from 'vitest'
import {
  ChoiceNodeSchema,
  type ChoiceNode,
} from '@schemas/choiceNode.schema'

const valid: ChoiceNode = {
  id: 'choice-001' as ChoiceNode['id'],
  taskId: 'task-001' as ChoiceNode['taskId'],
  label: 'Push the workers harder',
  keybind: '1',
  meterDeltas: { CAPITAL: 2, HUMAN_WELFARE: -3 },
  scheduledConsequenceIds: ['cons-001' as ChoiceNode['scheduledConsequenceIds'][number]],
}

describe('ChoiceNodeSchema', () => {
  it('parses a valid choice', () => {
    expect(() => ChoiceNodeSchema.parse(valid)).not.toThrow()
  })

  it('accepts empty meterDeltas', () => {
    expect(() =>
      ChoiceNodeSchema.parse({ ...valid, meterDeltas: {} }),
    ).not.toThrow()
  })

  it('accepts empty scheduledConsequenceIds (no consequence yet)', () => {
    expect(() =>
      ChoiceNodeSchema.parse({ ...valid, scheduledConsequenceIds: [] }),
    ).not.toThrow()
  })

  it('rejects invalid keybind', () => {
    expect(() =>
      ChoiceNodeSchema.parse({ ...valid, keybind: '5' }),
    ).toThrow()
    expect(() =>
      ChoiceNodeSchema.parse({ ...valid, keybind: 'a' }),
    ).toThrow()
  })

  it('rejects unknown meter key in deltas', () => {
    expect(() =>
      ChoiceNodeSchema.parse({
        ...valid,
        meterDeltas: { RESILIENCE: 1 },
      }),
    ).toThrow()
  })

  it('fails when label is empty', () => {
    expect(() => ChoiceNodeSchema.parse({ ...valid, label: '' })).toThrow()
  })
})
