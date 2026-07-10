import { makeStageOneAncestryId } from '@schemas/resultTrace.schema'
import { describe, it, expect } from 'vitest'
import {
  ResultTraceSchema,
  type ResultTrace,
} from '@schemas/resultTrace.schema'
import { fxTraceId, fxTaskId, fxChoiceId } from './fixtures'

const valid: ResultTrace = {
  id: fxTraceId(),
  sourceTaskId: fxTaskId(),
  sourceChoiceId: fxChoiceId(),
  stageOneAncestryId: makeStageOneAncestryId('task', 'choice'),
  timestamp: Date.now(),
  body: 'You pushed the workers; one of them broke down crying.',
}

describe('ResultTraceSchema', () => {
  it('parses a valid trace', () => {
    expect(() => ResultTraceSchema.parse(valid)).not.toThrow()
  })

  it('fails when body is empty', () => {
    expect(() => ResultTraceSchema.parse({ ...valid, body: '' })).toThrow()
  })

  it('fails when timestamp is not a number', () => {
    expect(() =>
      ResultTraceSchema.parse({ ...valid, timestamp: 'now' }),
    ).toThrow()
  })

  it('fails when sourceTaskId is missing', () => {
    const { sourceTaskId: _x, ...rest } = valid
    expect(() => ResultTraceSchema.parse(rest)).toThrow()
  })
})
