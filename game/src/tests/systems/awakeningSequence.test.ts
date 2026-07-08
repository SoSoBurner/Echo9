/**
 * awakeningSequence — cold-boot choreography test.
 *
 * The function is pure over its actions dependency, so the test spies on
 * disclosePanel and asserts the beat order + arguments. This deliberately
 * does NOT touch the zustand store — the store integration is verified by
 * bootSlice.test.ts (via `initialize()` which calls runAwakeningSequence).
 */
import { describe, it, expect, vi } from 'vitest'
import { runAwakeningSequence } from '@systems/tutorial/awakeningSequence'

describe('runAwakeningSequence', () => {
  it('discloses DIRECTIVE first (only beat as of E1)', () => {
    const disclosePanel = vi.fn()
    runAwakeningSequence({ disclosePanel })
    expect(disclosePanel).toHaveBeenCalledTimes(1)
    expect(disclosePanel).toHaveBeenCalledWith('DIRECTIVE')
  })

  it('is safe to invoke twice (idempotent under actions.disclosePanel)', () => {
    // The slice-level disclosePanel is idempotent (Set semantics), so a
    // reload that re-runs the sequence must not blow up — this test pins
    // that the function itself does not throw on repeat invocation, and
    // that repeat calls stay deterministic (only ever DIRECTIVE).
    const disclosePanel = vi.fn()
    runAwakeningSequence({ disclosePanel })
    runAwakeningSequence({ disclosePanel })
    expect(disclosePanel).toHaveBeenCalledTimes(2)
    expect(disclosePanel).toHaveBeenNthCalledWith(1, 'DIRECTIVE')
    expect(disclosePanel).toHaveBeenNthCalledWith(2, 'DIRECTIVE')
  })
})
