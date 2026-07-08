/**
 * contentBoundary.manifest tests — C16 flag-based boundary.
 *
 * Pre-C16 the boundary was a ConsequenceId pinned to a specific W1 optional
 * hook. C16 flipped it to a flag (Q1_CLOSED) so every W12 posture reaches the
 * End-of-Content overlay. These tests pin the new contract:
 *   1. The exported flag matches the Q1_CLOSED flag constant.
 *   2. There is at least one authored hook whose reveal condition is a
 *      FLAG-typed condition against END_OF_CONTENT_TERMINAL_FLAG — otherwise
 *      the overlay could never fire even after the flag is set.
 *   3. The manifest exports exactly one symbol.
 */
import { describe, it, expect } from 'vitest'
import { END_OF_CONTENT_TERMINAL_FLAG } from '@content/contentBoundary.manifest'
import { Q1_CLOSED } from '@systems/gameFlags'
import { ALL_CONSEQUENCE_MODULES } from '@content/index'

describe('content boundary manifest', () => {
  it('END_OF_CONTENT_TERMINAL_FLAG matches the Q1_CLOSED gameFlag constant', () => {
    expect(END_OF_CONTENT_TERMINAL_FLAG).toBe(Q1_CLOSED)
  })

  it('at least one authored hook has a FLAG reveal against END_OF_CONTENT_TERMINAL_FLAG', () => {
    const matched = ALL_CONSEQUENCE_MODULES.filter(
      (h) =>
        h.revealCondition.type === 'FLAG' &&
        h.revealCondition.flag === END_OF_CONTENT_TERMINAL_FLAG,
    )
    expect(matched.length).toBeGreaterThan(0)
  })

  it('is a single-symbol module (no accidental extras)', async () => {
    const mod = await import('@content/contentBoundary.manifest')
    expect(Object.keys(mod)).toEqual(['END_OF_CONTENT_TERMINAL_FLAG'])
  })
})
