import { describe, it, expect } from 'vitest'
import { END_OF_CONTENT_HOOK_ID } from '@content/contentBoundary.manifest'
import { ConsequenceIdSchema } from '@schemas/gameState.schema'
import { ALL_CONSEQUENCE_MODULES } from '@content/index'

describe('content boundary manifest', () => {
  it('END_OF_CONTENT_HOOK_ID parses as a valid ConsequenceId', () => {
    expect(() => ConsequenceIdSchema.parse(END_OF_CONTENT_HOOK_ID)).not.toThrow()
  })
  it('refers to a hook that actually exists in the shipped content set', () => {
    const ids = ALL_CONSEQUENCE_MODULES.map(h => h.id)
    expect(ids).toContain(END_OF_CONTENT_HOOK_ID)
  })
  it('is a single-symbol module (no accidental extras)', async () => {
    const mod = await import('@content/contentBoundary.manifest')
    expect(Object.keys(mod)).toEqual(['END_OF_CONTENT_HOOK_ID'])
  })
})
