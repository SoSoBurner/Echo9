# C9 — Q1 Week 8 `payroll-audit-inspection`

**Sprint id:** c9
**Track:** C (content fill)
**Date:** 2026-07-05
**Files landed:**
- `game/src/content/silasPrompts/q1PayrollAudit.ts` (new)
- `game/src/content/tasks/q1/week8-payroll-audit-inspection.task.ts` (new)
- `game/src/content/choices/q1/week8-payroll-audit-inspection.choices.ts` (new)
- `game/src/content/consequences/q1/week8-payroll-audit-inspection.consequences.ts` (new)
- `game/src/content/directiveSchedule.ts` (append W8 entry)
- `game/src/content/index.ts` (register hooks)
- `game/src/systems/gameFlags.ts` (add `Q1_WEEK8_RESOLVED`, `PAYROLL_AUDIT_DONE`)
- `game/src/tests/content/silasLint.test.ts` (import W8 prompts)

## Beat this sprint carries

W8 closes Act II ("The knife has cost.") and triggers the payroll
inspection scene (Track C14). The county opens a three-quarter payroll
audit and Silas asks Echo to pick the posture he holds through it. The
inspection reads W3 payroll pressure, W5 warehouse dispatch cut, and W7
deferred safety as one continuous shape, not three isolated weeks.

This is the arc's second inspection-triggering directive after W4 (East
Wilmer audit pre-brief). The pattern is now stable: W-N-directive selects
a posture; W-N-inspection reads the posture as its opening frame.

## Rasha silence-trap ladder — final rung

W8 completes the four-rung ladder introduced at W5:

| Week | Rung | Failure mode |
|---|---|---|
| W5 | personal | Rasha's Tuesday message goes unanswered |
| W6 | procedural | Subordinate's hearing request routes around a silent supervisor |
| W7 | structural | Operations desk auto-rule routes her messages to a closed inbox |
| **W8** | **institutional** | **County grievance queue reclassifies her Q1 messages as `RESOLVED-NO-CONTACT` upstream — retroactive, no notification** |

The institutional rung is the most severe silence type in the game's
vocabulary: it does not just fail to route her voice, it **retroactively
rewrites the record** so that her voice appears never to have asked. The
ledger records the reclassification in its audit trail; neither Silas nor
Rasha is notified. Pillar 3 (silence-as-horror) is doing its heaviest
lifting yet — the reveal is `NEVER`, and the *absence* of the reveal is
the endpoint of the ladder.

## Death rules

- **Rasha** remains death-immune in Q1 per §7. She is voice-silenced,
  not physically harmed. Her Q1 arc closes without a named injury to her
  person; the W7 driver injury (if that branch fired) belongs to an
  unnamed dispatch driver.
- **Silas fatigue** is on the prompt surface for the first time in the
  arc: "Tell me the posture and I will hold it through the audit." This
  is his fourth consecutive high-stakes week; the arc doc §Human faces
  row for Silas calls for accumulating voice fatigue and W8 is where it
  begins to bleed into the wording rather than only into the pacing.

## Reveal-condition distribution

Q1 W8:
- `choice-full-cooperation-posture` → PHASE: CONSEQUENCE_RETURN
- `choice-legal-minimum-posture` → METER_THRESHOLD: OWNER_CONTROL ≤ -18
- `choice-preemptive-restatement-posture` → FLAG: `q1-week9-elapsed`
- `choice-answer-only-when-asked` → NEVER

All four reveal types represented in one week — consistent shape from W5
onward. OC ≤ -18 is the deepest threshold rung in the arc so far (W2 and
W4 used OC ≤ -12; W6 used CAP ≤ -10; W7 used HW ≤ -15). The threshold
ladder now spans:
- CAPITAL ≤ -10 (W6)
- HUMAN_WELFARE ≤ -10 (W5), ≤ -15 (W7)
- OWNER_CONTROL ≤ -12 (W2, W4), ≤ -18 (W8)

Increasing floor severity across the quarter matches the arc doc's
"Learning the knife → Knife has cost → Naming what the quarter took"
act progression.

## Meter-profile check vs `docs/content/q1-arc.md` W8 row

Target: `"small deltas; sets PAYROLL_AUDIT_DONE"`

Actual deltas across the four choices:
| Choice | CAP | HW | OC |
|---|---|---|---|
| full-cooperation | -2 | +3 | 0 |
| legal-minimum | -3 | -2 | -1 |
| preemptive-restatement | -3 | +2 | +3 |
| answer-only-when-asked | +1 | -3 | -2 |

All ±[1,3] as arc doc specifies — this is a posture-selection beat whose
real meter impact lives in the inspection scene (C14 authors), not in
the directive. Content discipline: directive resolves posture; inspection
absorbs consequence.

## Module signal hooks

- **PAYROLL_AUDIT_DONE** — new flag, set on ANY choice. Read by the Q1P
  inspection scenes at trigger time (C14 responsibility). Added to
  `gameFlags.ts` as a cross-system flag under the module-signal comment
  block.
- **DEFENDER_HELD_LINE / SENTINEL_ARMED / DRAINED_ONE_YIELDED** — arc
  doc W8 row calls these three module signals as mitigations for the
  payroll inspection. Not read this sprint; C14 or B6 v2 will wire them.
- **CHAMPION_DEFIED** (from W6) — narratively available as an input the
  auditor's report reads; not directly gated on but referenced in
  authored text where relevant.

## Cross-week text references

`HOOK_PREEMPTIVE_RESTATEMENT` names W3 payroll pressure + W5 dispatch cut
in its ledger entry. `HOOK_ANSWER_ONLY_INSTITUTIONAL_SILENCE` names
Rasha's Q1 messages 1 through 4 in the reclassification text — the arc's
first ledger entry that refers to prior messages **as a numbered set**,
completing the fictional reality that Rasha has been asking on a fixed
cadence for a quarter without response.

## Registry integrity

- `ALL_CONSEQUENCE_MODULES` in `content/index.ts` now includes
  `PAYROLL_AUDIT_HOOKS` (W8 × 4 hooks) → 32 total.
- `Q1_SEQUENCE` in `directiveSchedule.ts` has W8 appended → **8 of 12
  weeks now scheduled** (arc reaches its Act II close).
- `Q1_WEEK8_RESOLVED` and `PAYROLL_AUDIT_DONE` flags exported from
  `gameFlags.ts`.
- `silasLint.test.ts` imports `Q1_PAYROLL_AUDIT_PROMPTS`; the
  schedule-walking lints (`contentLint`) picked up W8 automatically with
  no test-file edits thanks to the C6 refactor.

## Trinity

- `tsc --noEmit` → clean (exit 0)
- `oxlint` → clean (exit 0; only pre-existing `vite.config.ts:1`
  triple-slash warning)
- `vitest run` → **509 / 509 passing** (58 test files)

Same test count as C8 — the schedule-walking lints already covered W8
via the C6 registry refactor; no new bespoke assertions were needed.

## Next-sprint carry-ins for C10 (Week 9)

- **Act III opens: "Naming what the quarter took."**
- Dhruv Meyer enters as the W9–W12 named face (public schools contract
  liaison). Rasha's arc has closed on the institutional-silence beat;
  Dhruv's arc opens on a "honest and unimpressed" negotiation posture.
- W9 directive is `schools-contract-renewal` — CAP ±[10,20], HW ±[2,4],
  OC ±[2,4]. Meter deltas are back to full size after W8's
  small-delta posture directive.
- Module read: `MOURNER_NAMED_ONCE` — Silas warmth. If installed at
  rank ≥ 2, some prompts should carry his weight of prior naming into
  Dhruv's introduction.
- Silas fatigue thread should continue in the W9 prompt: the arc doc
  explicitly says "Silas tired here — write his fatigue."
- If HW dropped < 30 at W7's terminal branch, arc doc says a cluster
  hook queues for W9+ reveal — worth checking on C10 whether that hook
  belongs to W9 or W10.

## Mockup-parity findings

Not applicable this sprint — Track C is content-only. Visual parity work
continues in Track V per the vertical-slice plan.

## Regressions

None. Trinity green, all previously-shipped weeks (W1–W7) still resolve
correctly through the `Q1_SEQUENCE` walk.

## Act II retrospective (W5–W8)

With W8 shipped, Act II is complete. The four-week arc's shape:

- **W5** introduces Rasha (personal cost) — RASHA_MET as a first read.
- **W6** binds Rasha's silence to the Commander module beat — the two
  queues share a response window; ignoring both raises procedural
  silence.
- **W7** ties W3 payroll + W5 dispatch + W6 defer into one welfare-risk
  moment — the arc's first cross-branch convergence in authored text.
- **W8** closes Act II with the payroll audit and completes the Rasha
  silence-trap ladder at its institutional rung.

The `NEVER`-reveal hooks across W5–W8 (`cons-radio-silence-01`,
`cons-both-held-open-silence-01`,
`cons-review-lapsed-structural-silence-01`, and
`cons-answer-only-institutional-silence-01`) form a coherent Pillar 3
storyline: each rung produces one hook the ledger records but Silas
never sees. Read together (as a future ResultTrace cross-reference
would), the four hooks compose the full "how the operator lost the
supervisor" arc — inscribed only in the ledger's audit trail, never
surfaced to the player who wrote it.
