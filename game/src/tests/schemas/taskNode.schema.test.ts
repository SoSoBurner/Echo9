import { describe, it, expect } from 'vitest'
import {
  TaskNodeSchema,
  type TaskNode,
} from '@schemas/taskNode.schema'

const valid: TaskNode = {
  id: 'task-001' as TaskNode['id'],
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: 'silas-001' as TaskNode['silasPromptId'],
  directive: 'Maximize output this quarter.',
  choiceIds: [
    'choice-001' as TaskNode['choiceIds'][number],
    'choice-002' as TaskNode['choiceIds'][number],
  ],
}

describe('TaskNodeSchema', () => {
  it('parses a valid task with 2 choices', () => {
    expect(() => TaskNodeSchema.parse(valid)).not.toThrow()
  })

  it('parses a task with 4 choices (upper bound)', () => {
    expect(() =>
      TaskNodeSchema.parse({
        ...valid,
        choiceIds: ['c1', 'c2', 'c3', 'c4'],
      }),
    ).not.toThrow()
  })

  it('rejects fewer than 2 choices', () => {
    expect(() =>
      TaskNodeSchema.parse({ ...valid, choiceIds: ['c1'] }),
    ).toThrow()
  })

  it('rejects more than 4 choices', () => {
    expect(() =>
      TaskNodeSchema.parse({
        ...valid,
        choiceIds: ['c1', 'c2', 'c3', 'c4', 'c5'],
      }),
    ).toThrow()
  })

  it('fails when directive is empty', () => {
    expect(() =>
      TaskNodeSchema.parse({ ...valid, directive: '' }),
    ).toThrow()
  })

  it('fails when phase is unknown', () => {
    expect(() =>
      TaskNodeSchema.parse({ ...valid, phase: 'CREDITS' }),
    ).toThrow()
  })
})
