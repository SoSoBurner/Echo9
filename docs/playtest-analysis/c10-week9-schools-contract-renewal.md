# C10 — Q1 Week 9 · schools-contract-renewal · playtest analysis

**Sprint:** C10 (Track C — Q1 content fill)
**Directive:** Week 9 — schools-contract-renewal
**File basename:** `week9-schools-contract-renewal`
**Task id:** `task-schools-contract-renewal-09`

---

## Arc position

Act III opens: **"Naming what the quarter took."**

Weeks 1–4 established the East Wilmer + payroll + audit spine.
Weeks 5–8 walked the **Rasha institutional-erasure ladder**:
- W5 personal silence (radio-silence)
- W6 procedural silence (redirect-to-legal)
- W7 structural silence (let-review-lapse)
- W8 institutional silence (answer-only-when-asked → `PAYROLL_AUDIT_DONE`)

W9 introduces **Dhruv Meyer** as the W9–W12 face — public schools contract
liaison. He is not another named victim. He is a professional counterparty
whom Echo is transacting with, whose read on Echo shapes future business.

The Rasha arc is closed at W8. Dhruv's arc opens fresh at W9 with a
**parallel** silence-arc — professional attrition — which is deliberately
distinct from Rasha's institutional erasure.

## Checkpoints captured

- Silas directive prompt (`q1SchoolsContractRenewal.ts`) — 4 sentences, ≤4 rule
  holds; operational detail present (`Dhruv Meyer`, `8%`, `$240,000`, named
  entity + digit + digit).
- 4 committed choice branches (approve-full / counter-partial / refuse-hold /
  delay) with §5 six-verb ledger meter deltas.
- 4 consequence hooks (`ConsequenceHook`) with all §11 fields.
- W9 entry registered in `Q1_SEQUENCE` (schedule now covers 9/12 weeks).
- `SCHOOLS_CONTRACT_RENEWAL_HOOKS` spread into `ALL_CONSEQUENCE_MODULES`
  (registry total: 36 hooks across 9 weeks).
- `Q1_WEEK9_RESOLVED` flag added to `gameFlags.ts`.

## Second silence-arc pattern

The `choice-delay-response` NEVER-reveal hook is Echo9's **second** silence
arc. Design discipline: it is deliberately shaped differently from Rasha's.

|                    | Rasha (W5–W8)                     | Dhruv (W9+)                             |
|--------------------|-----------------------------------|-----------------------------------------|
| Register           | Institutional erasure             | Professional attrition                  |
| Escalation shape   | 4-rung ladder (personal → institutional) | Slow one-week-at-a-time fade      |
| Read on Echo       | Grievance queue reclassification  | Portal-response latency doubles         |
| Notification event | System-level status change        | None (attrition produces no event by definition) |
| Recovery path      | None once institutional erasure lands | Could reopen if HW recovers > 30    |
| Fictional weight   | A person the county has stopped seeing | A person who stops being interested |

Both use NEVER-reveal because Pillar 3 says the game does not announce the
consequence of silence — you notice by absence. But Dhruv's absence is
quieter: he simply stops replying at his old cadence, and the ledger records
the latency shift only in the audit trail.

## Meter profile check (arc doc W9 row: `CAP ±[10,20]`, `HW ±[2,4]`, `OC ±[2,4]`)

| Choice                     | CAP  | HW  | OC  | Reveal condition                          |
|----------------------------|------|-----|-----|-------------------------------------------|
| approve-discount-full      | -18  | +3  | -2  | PHASE                                     |
| counter-partial-discount   | -9   | -3  | +2  | METER_THRESHOLD HW ≤ -20                  |
| refuse-and-hold-price      | +16  | -4  | +4  | FLAG `q1-week10-elapsed`                  |
| delay-response             |  0   | -3  | -1  | NEVER (Dhruv attrition path opens)        |

CAP delta band `[-18, +16]` sits inside arc-doc `±[10,20]` for the three
substantive branches; delay is a `0` CAP branch by design (the money doesn't
move — the relationship thins). HW deltas are `[-4, +3]`; OC deltas are
`[-2, +4]`. Reveal-condition coverage is all four PLAN.md §11 types.

## Cross-week signal reads authored into ledger text

- `HOOK_DISCOUNT_APPROVED_FULL` reads:
  - `MOURNER_NAMED_ONCE` (module signal from earlier in Q1) — if raised,
    Silas's cover letter is shorter because he's drawing on warmth already
    spent.
  - HW < 30 W7 cluster-hook carry — schools board reclassifies renewal from
    "partnership renewed" to "extends existing operator."
- `HOOK_PRICE_HELD_FULL` reads the W8 payroll-audit posture and attaches it
  to the county contract file as a rider. This is the first W9 hook that
  reaches back into the W8 audit posture explicitly — the Q1-close inspection
  will read the rider as one of its inputs.

## Registry integrity

- `Q1_SEQUENCE`: 9/12 entries (W1–W9 populated; W10–W12 pending)
- `ALL_CONSEQUENCE_MODULES`: 36 hooks total (4 × 9 weeks)
- `ALL_SILAS_PROMPTS`: 10 prompt files including W9
- `NAMED_ENTITIES` in silasLint: `Dhruv` added — W9–W12 prompts can now name
  him operationally without needing a digit for §10 heuristic pass.

## Silas fatigue thread (arc doc §Human faces Silas row)

W7 opened Silas's fatigue (`Tell me what to spend.`).
W8 continued (`Tell me the posture and I will hold it through the audit.`).
W9 lands the shortest command yet: `Give me the number.`

This is not a bug in the voice; it is the voice compressing under strain.
Author intent for W10 is to let the fatigue break — Silas surfaces a named
trace from earlier in the quarter (if `DRAINED_ONE_YIELDED` is on the run,
via SPARK/DRAINED-ONE modules), a first Act III breath.

## Verification

- `npx tsc --noEmit` → clean
- `npx oxlint` → 1 pre-existing warning at `vite.config.ts:1` (per CLAUDE.md,
  leave alone)
- `npx vitest run` → **509 / 509** passing across 58 test files
- No new tests needed: C6 refactor's `Q1_SEQUENCE`-walk lint automatically
  covers W9; §11 traceability test walks `ALL_CONSEQUENCE_MODULES`; §10
  silasLint walks `ALL_SILAS_PROMPTS` with `Dhruv` now registered.

## Next-sprint carry-ins (C11 · W10 · hidden-trace-reveal)

- W10 is the traceability payoff week. Lenora Pike returns; Silas surfaces
  a named trace from W1–W6. Author must decide whether the trace text is
  the same Silas-line whether or not `DRAINED_ONE_YIELDED` is raised (vaguer
  vs. named branch).
- Dhruv's attrition status at W10 depends on whether `choice-delay-response`
  fired at W9 AND whether HW stays below 30. If both hold, W10 opens with
  Dhruv already at 8-hour latency.
- W10 elapsing raises `q1-week10-elapsed` — the `HOOK_PRICE_HELD_FULL`
  reveal from W9 fires now.

## Regressions

None. C6 refactor kept the schedule additive; W9 slotted cleanly into
`Q1_SEQUENCE`.
