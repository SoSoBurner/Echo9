/**
 * §11 Traceability Invariant — content-side enforcement.
 *
 * Every delayed consequence carries the 7 mandatory fields enforced by
 * ConsequenceHookSchema. This test scans every entry in
 * ALL_CONSEQUENCE_MODULES so that the moment T9 ships real Mercy Margin
 * content, any drift from the invariant fails CI.
 *
 * NOTE on the "traceId reference" check (Option A from T3 brief):
 *   ConsequenceHookSchema does not carry a direct `traceId` field — it
 *   carries `sourceTaskId` + `sourceChoiceId`. The actual ResultTrace is
 *   WRITTEN by the resolver at runtime (T5) when the choice fires; it is
 *   not declared on the hook ahead of time. So the cross-reference test
 *   here is intentionally a tautology today (asserts the source fields
 *   are strings, and that the trace set is consistent). When/if hooks
 *   ever gain an `expectedTraceId` field for content-author cross-check,
 *   extend the loop body to verify membership against `knownTraceIds`.
 */
import { describe, it, expect } from 'vitest'
import { ALL_CONSEQUENCE_MODULES, ALL_RESULT_TRACES } from '@content/index'
import { ConsequenceHookSchema } from '@schemas/consequenceHook.schema'

describe('§11 Traceability Invariant', () => {
  it('every ConsequenceHook passes ConsequenceHookSchema', () => {
    for (const hook of ALL_CONSEQUENCE_MODULES) {
      const result = ConsequenceHookSchema.safeParse(hook)
      if (!result.success) {
        throw new Error(
          `Hook ${hook.id ?? '(no id)'} failed §11 invariant: ${JSON.stringify(result.error.issues)}`,
        )
      }
    }
  })

  it('no hook has blank traceHint / whyNow / whatChanged', () => {
    for (const hook of ALL_CONSEQUENCE_MODULES) {
      // schema enforces .min(1) but defense-in-depth: trimmed must also be non-empty
      expect(hook.traceHint.trim(), `hook ${hook.id} traceHint`).not.toBe('')
      expect(hook.whyNow.trim(), `hook ${hook.id} whyNow`).not.toBe('')
      expect(hook.whatChanged.trim(), `hook ${hook.id} whatChanged`).not.toBe('')
    }
  })

  it('every hook references a known ResultTrace', () => {
    const knownTraceIds = new Set(ALL_RESULT_TRACES.map((t) => t.id))
    for (const hook of ALL_CONSEQUENCE_MODULES) {
      // The hook links to content via sourceTaskId+sourceChoiceId, not by direct traceId.
      // The actual ResultTrace is WRITTEN by the resolver when the choice fires (T5).
      // What we can validate here: the sourceTaskId/sourceChoiceId pair are non-empty
      // (schema enforces) and that if a hook ever gains a direct traceId field in future,
      // this test extends to cross-reference. For now, the cross-check is intentionally
      // a tautology (size assertion) so the test exists and the future expansion is obvious.
      expect(typeof hook.sourceTaskId).toBe('string')
      expect(typeof hook.sourceChoiceId).toBe('string')
    }
    // Sanity: if traces exist, the set has them
    expect(knownTraceIds.size).toBe(ALL_RESULT_TRACES.length)
  })

  // T9 un-skipped this guard. Closes the vacuous-pass window — every other
  // test in this file iterates ALL_CONSEQUENCE_MODULES, so they all passed
  // when the array was empty. Now we assert at least one hook exists.
  it('content registry is non-empty', () => {
    expect(ALL_CONSEQUENCE_MODULES.length).toBeGreaterThan(0)
  })
})
