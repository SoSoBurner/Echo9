import { describe, it, expect } from 'vitest'
import {
  SilasPromptSchema,
  type SilasPrompt,
} from '@schemas/silasPrompt.schema'
import { fxSilasPromptId } from './fixtures'

const valid: SilasPrompt = {
  id: fxSilasPromptId(),
  body: 'Echo. Listen. Do as I say.',
}

describe('SilasPromptSchema', () => {
  it('parses a valid prompt', () => {
    expect(() => SilasPromptSchema.parse(valid)).not.toThrow()
  })
  it('fails when id is missing', () => {
    const { id: _id, ...rest } = valid
    expect(() => SilasPromptSchema.parse(rest)).toThrow()
  })
  it('fails when body is empty', () => {
    expect(() => SilasPromptSchema.parse({ ...valid, body: '' })).toThrow()
  })
})
