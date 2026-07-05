# C8 — Q1 Week 7 `deferred-safety-inspection`

**Sprint id:** c8
**Track:** C (content fill)
**Date:** 2026-07-05
**Files landed:**
- `game/src/content/silasPrompts/q1DeferredSafety.ts` (new)
- `game/src/content/tasks/q1/week7-deferred-safety-inspection.task.ts` (new)
- `game/src/content/choices/q1/week7-deferred-safety-inspection.choices.ts` (new)
- `game/src/content/consequences/q1/week7-deferred-safety-inspection.consequences.ts` (new)
- `game/src/content/directiveSchedule.ts` (append W7 entry)
- `game/src/content/index.ts` (register hooks)
- `game/src/systems/gameFlags.ts` (add `Q1_WEEK7_RESOLVED`)
- `game/src/tests/content/silasLint.test.ts` (import W7 prompts)

## Beat this sprint carries

W7 is the arc's first cross-branch convergence. Three prior weeks bind into one welfare-risk moment on the East Wilmer sector register:

- **W3 payroll pressure** (the overnight profile carried the shift-cost line)
- **W5 warehouse dispatch cut** (Rasha's roster shrank onto the same overnight)
- **W6 defer** (the safety review Echo could postpone last week)

Two nurses and one of Rasha Odenwalder's dispatch drivers are logged sharing the same operational risk profile in the East Wilmer sector. Silas asks Echo what to spend, nine days before the payroll audit.

## Rasha silence-trap ladder

W7 escalates the ladder from **procedural** (W6) to **structural** (W7):

- W5 `choice-radio-silence` → **personal** silence (Echo doesn't answer Rasha)
- W6 `choice-hold-both-open` → **procedural** silence (subordinate driver files a hearing request that never reaches Rasha)
- **W7 `choice-let-review-lapse` → structural silence** (the operations desk itself stops routing Rasha's messages under a lapsed-supervisor auto-rule; a driver is injured on the overnight; no notification reaches her, no notification reaches Silas)
- W8 will carry the final rung — **institutional**.

The W7 terminal-silence hook (`HOOK_REVIEW_LAPSED_STRUCTURAL_SILENCE`) is `revealCondition: { type: 'NEVER' }`. The county workers' log holds the injury; the ledger records the darkness without naming it to Silas. Pillar 3 (silence-as-horror) is doing real work here — the absence of the reveal *is* the escalation.

## Death rules

- **Rasha herself** remains death-immune in Q1 per §7. The injury lands on an unnamed dispatch driver (§7 Q1 protection: the driver is a nameable-but-not-named role slot).
- **Nurses** remain unnamed at prompt scope; they receive names only if promoted content lands in a future run.

## Reveal-condition distribution

Q1 W7:
- `choice-call-outside-inspectors` → PHASE: CONSEQUENCE_RETURN
- `choice-deploy-inhouse-training` → METER_THRESHOLD: HUMAN_WELFARE ≤ -15
- `choice-cut-shifts-for-safety` → FLAG: `q1-week8-elapsed`
- `choice-let-review-lapse` → NEVER

All four reveal types represented in one week — same shape as W5 and W6. HW ≤ -15 is a new threshold rung (W5 was HW ≤ -10, W3 was OC ≤ -12, W6 was CAP ≤ -10). The threshold ladder now has three distinct meter axes and increasing severity floors across the quarter.

## Module signal hooks

- **SPARK_DEPLOYED** (rank-2 fire flag) is READ narratively on `HOOK_INHOUSE_TRAINING_DEPLOYED` — if SPARK is installed, its training curriculum sources the in-house pass; otherwise the deck is assembled from prior audit findings. This is authored text, not runtime gating — same pattern as C7's COMMANDER acknowledgment on the override-confirmed hook.
- **CHAMPION_DEFIED** (from W6) is available as a downstream posture input but not read this week; W8's payroll audit will read it.

## Meter-profile check vs `docs/content/q1-arc.md` W7 row

Target: HW ±[4,8], CAP ±[3,6], OC ±[3,5]

Actual deltas across the four choices:
| Choice | CAP | HW | OC |
|---|---|---|---|
| call-outside-inspectors | -6 | +8 | +3 |
| deploy-inhouse-training | -3 | +4 | +4 |
| cut-shifts-for-safety | -5 | +5 | -5 |
| let-review-lapse | +6 | -8 | -4 |

All within the arc-doc target ranges. Human-Welfare carries the highest amplitude (matches the beat's stated focus on welfare risk).

## Cross-week text references

`HOOK_OUTSIDE_INSPECTORS_CALLED` and `HOOK_REVIEW_LAPSED_STRUCTURAL_SILENCE` both name W3 payroll + W5 warehouse dispatch as inputs to the shared-risk logs — the arc's first *authored* cross-branch convergence. Runtime doesn't need to know the causal chain; the ledger's authored text carries it.

## Registry integrity

- `ALL_CONSEQUENCE_MODULES` in `content/index.ts` now includes `DEFERRED_SAFETY_HOOKS` (W7 × 4 hooks) → 28 total.
- `Q1_SEQUENCE` in `directiveSchedule.ts` has W7 appended → 7 of 12 weeks now scheduled.
- `Q1_WEEK7_RESOLVED` flag exported from `gameFlags.ts`.
- `silasLint.test.ts` imports `Q1_DEFERRED_SAFETY_PROMPTS`; the schedule-walking lints (`contentLint`) picked up W7 automatically with no test-file edits thanks to the C6 refactor.

## Trinity

- `tsc --noEmit` → clean (exit 0)
- `oxlint` → clean (exit 0; only pre-existing `vite.config.ts:1` triple-slash warning)
- `vitest run` → **509 / 509 passing** (58 test files)

Same test count as C7 — the schedule-walking lints already covered W7 via the C6 registry refactor; no new bespoke assertions were needed.

## Next-sprint carry-ins for C9 (Week 8)

- Rasha silence-trap ladder's final rung: **institutional** silence. Draft: the county grievance queue reclassifies her messages as `RESOLVED-NO-CONTACT` when the payroll audit closes without her having been reached. Her authority as a first-line supervisor thins by four levels across the four-week ladder.
- W8 payroll audit reads: unresolved shared-risk logs from W7 (if `deploy-inhouse-training` or `let-review-lapse` fired), the driver injury on record (if `let-review-lapse` fired), CHAMPION_DEFIED from W6 (if defied), SILAS_OVERRIDE_AVAILABLE from Commander install state.
- W8 introduces the **first inspection scene proper** per arc doc W8 row. The scene lives at `game/src/content/inspections/q1Payroll.scene.ts` and is referenced by C14 (Q1 inspection scenes). C9 should ship the W8 directive plus the payroll inspection touchpoint that reads it — the two are one beat.

## Mockup-parity findings

Not applicable this sprint — Track C is content-only. Visual parity work continues in Track V per the vertical-slice plan.

## Regressions

None. Trinity green, all previously-shipped weeks (W1–W6) still resolve correctly through Q1_SEQUENCE walk.
