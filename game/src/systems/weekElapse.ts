/**
 * weekElapse — pure week→elapse-flag table (§11 week-elapse returns).
 *
 * THE PROBLEM THIS SOLVES (ship-gate leak, 2026-07): Q1 content authors
 * delayed consequences whose revealConditions wait on flags like
 * `east-wilmer-week4-elapsed` and `q1-week9-elapsed` — "when week N arrives,
 * the delayed consequence returns" (see the hooks' whyNow text and
 * docs/playtest-analysis/c10–c12). No runtime code ever raised those flags,
 * so 24 of 49 hooks entered `scheduledConsequences` and could never fire —
 * a silent breach of the §11 invariant ("every delayed consequence
 * returns"). This table is the missing setter surface.
 *
 * SEMANTICS: `elapsedFlagsForWeek(N)` returns the flags that raise at the
 * moment week N's directive COMMITS (the same seam that sets the week's
 * resolutionFlag in Layout.handleChoiceCommit). "week N elapsed" therefore
 * reads as "week N's decision is on the record":
 *   - `q1-week<N>-elapsed`           — uniform elapse clock, every week 1–12.
 *   - `east-wilmer-week<N>-elapsed`  — legacy aliases used by W2–W5 content
 *                                      (weeks 3–6 only; pinned to the exact
 *                                      strings in content/consequences/q1).
 *   - `east-wilmer-quarter-elapsed`  — raises on the W12 commit (Q1 close);
 *                                      W1's one-quarter deferral hook keys
 *                                      on it.
 *
 * Flags are additive-only, matching the flagsSlice contract — once a week
 * has elapsed it stays elapsed for the run.
 *
 * Reachability contract: `hookReachability.test.ts` statically asserts that
 * every FLAG-keyed hook in content waits on a flag from this table or from
 * another runtime flag-raising surface. Add new elapse flags HERE (never as
 * loose literals in Layout) so the guard test keeps seeing them.
 */

/** First/last week of the shipped Q1 arc (mirrors Q1Week in directiveSchedule). */
export const Q1_FIRST_WEEK = 1
export const Q1_LAST_WEEK = 12

/**
 * Legacy alias flags authored by early Q1 sprints (C3–C6) before the uniform
 * `q1-week<N>-elapsed` scheme existed. Keys are the WEEK THAT RAISES the
 * alias (i.e. the week whose commit makes the waiting hook return).
 */
const LEGACY_ELAPSE_ALIASES: Readonly<Record<number, readonly string[]>> = {
  3: ['east-wilmer-week3-elapsed'],
  4: ['east-wilmer-week4-elapsed'],
  5: ['east-wilmer-week5-elapsed'],
  6: ['east-wilmer-week6-elapsed'],
  12: ['east-wilmer-quarter-elapsed'],
}

/**
 * Flags that raise when week `weekIndexJustResolved` commits.
 * Pure and total: out-of-range or non-integer input returns `[]`.
 */
export function elapsedFlagsForWeek(
  weekIndexJustResolved: number,
): readonly string[] {
  if (
    !Number.isInteger(weekIndexJustResolved) ||
    weekIndexJustResolved < Q1_FIRST_WEEK ||
    weekIndexJustResolved > Q1_LAST_WEEK
  ) {
    return []
  }
  return [
    `q1-week${weekIndexJustResolved}-elapsed`,
    ...(LEGACY_ELAPSE_ALIASES[weekIndexJustResolved] ?? []),
  ]
}
