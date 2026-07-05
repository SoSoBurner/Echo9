# C12 — Q1 Week 11 · capital-deployment-attempt · playtest analysis

**Sprint:** C12 (Track C — Q1 content fill)
**Directive:** Week 11 — capital-deployment-attempt
**File basename:** `week11-capital-deployment-attempt`
**Task id:** `task-capital-deployment-attempt-11`

---

## Arc position

Act III · **The capital moment of Q1.**

W11 is the largest Capital-swing week of Q1 by design. The Q1 savings
have accumulated ($58K in reserves). Dhruv Meyer forwards a competitive
county integration seat-award bid — $52K reserve fee, three bidders on
record, closes at Q1-close (Sunday 11:59 PM). Silas surfaces the number
and asks Echo to deploy, hedge, hold, or lowball. Full-size Capital
returns after W10's small-delta recognition beat.

W11 also fires W10's `redirect-lenora-to-compliance` FLAG reveal
(`q1-week11-elapsed`) — the East Wilmer inquiry summary lands on
Silas's desk as a byproduct.

## Checkpoints captured

- Silas directive prompt (`q1CapitalDeploymentAttempt.ts`) — 4 sentences,
  ≤4 rule holds; operational detail present (`Dhruv Meyer`, `$58,000`,
  `$52,000`, `3:20`, `Q2`, `Echo`, `September integration`).
- Dhruv's forwarded bid message (`DHRUV_BID_MESSAGE`) — signed "D.",
  terse procedural forward with reserve fee + deadline + bidder count.
  Different tone from his W9 discount ask — this is a competitive
  process forward, not a negotiation.
- 4 committed choice branches (deploy-full / deploy-half-hedge /
  hold-savings / counter-with-lowball).
- 4 §11 consequence hooks with all mandatory fields.
- W11 entry registered in `Q1_SEQUENCE` (schedule now covers 11/12 weeks).
- `CAPITAL_DEPLOYMENT_ATTEMPT_HOOKS` spread into `ALL_CONSEQUENCE_MODULES`
  (registry total: **44** hooks across 11 weeks).
- `Q1_WEEK11_RESOLVED` flag added to `gameFlags.ts`.

## Meter profile check (arc doc W11: `CAP ±[15,25]`)

| Choice                              | CAP | HW  | OC  | Reveal condition                          |
|-------------------------------------|-----|-----|-----|-------------------------------------------|
| deploy-full-lock-bid                | -22 | +4  | +5  | PHASE                                     |
| deploy-half-hedge                   | -11 | +2  | -3  | METER_THRESHOLD OWNER_CONTROL ≤ -18        |
| hold-savings-let-bid-pass           | +18 | -5  | -4  | FLAG `q1-week12-elapsed`                  |
| counter-with-lowball                | -3  | -3  | +5  | NEVER                                     |
| **absolute CAP range**              | **[-22, +18]** | | | |

CAP deltas span `[-22, +18]` — the arc doc calls for `±[15,25]`.
`hold-savings-let-bid-pass` at +18 and `deploy-full` at -22 both land
inside the band. `deploy-half-hedge` at -11 is a deliberate partial
posture; the lowball at -3 is the intake fee only. HW deltas `[-5, +4]`,
OC deltas `[-4, +5]` — both inside `±[3,6]`. Reveal-condition coverage
is all four PLAN.md §11 types.

## Cross-week signal reads authored into ledger text

- `HOOK_INTEGRATION_BID_LOCKED` reads **SPARK_DEPLOYED** at rank ≥ 2 —
  if on the run, the deployment unlocks a variance branch (contract
  cross-sell to East Wilmer clinic queue, seat reallocation across
  September–December window, market re-entry on county food-services
  line). Without SPARK, base execution only.
- `HOOK_INTEGRATION_BID_LOCKED` also reads **CAP > 80 at deployment**
  — full six-verb counterplay space named in ledger prose. If below
  80, only the base two-verb execution posts. This is the arc doc's
  "6-verb counterplay" note realized in reveal prose rather than
  schema gating.
- `HOOK_DHRUV_UNRESPONDED_TO_LOWBALL` reads **DRAINED_ONE_YIELDED** —
  if on the run, Silas explicitly notes the W9 8-hour portal latency
  as first beat and W11 silence as second. Without, the shape of the
  non-response is quieter and less named.

Every one of these is authored prose in the ledger entry, not schema
gating. Same Stage-1 discipline as C7/C8/C10/C11.

## Cross-week timing (W11 → W12 pipe)

- `HOOK_INTEGRATION_BID_PASSED` reveals at Q1-close
  (`q1-week12-elapsed`). Its ledger names Dhruv's next-quarter forecast
  to the schools board marking the operator's account as "out of scope
  for September integration" — a public-record read that carries into
  W12 and into Track C14 ethics inspection scenes (Q1E.A/Q1E.B).
- Every hook cites the Q1-close ethics hearing as one of its inputs.
  The seat-award posture (locked / hedged / passed / lowballed) is
  the largest single input W12 will read.

## Dhruv attrition arc — beat 2

The `counter-with-lowball` NEVER-reveal hook is the second beat of
Dhruv's professional-attrition arc:

| Beat | Week | Latency | Trigger |
|------|------|---------|---------|
| First  | W9  | 8 hours  | `choice-delay-response` on discount ask (silent path) |
| **Second** | **W11** | **16 hours** | **`choice-counter-with-lowball` on procurement forward** |

Doubling is the pattern (arc doc §Dhruv). No notification event
fires; the escalation is only visible in the portal audit trail. The
hook's `revealCondition` is `NEVER` — Pillar 3 silence-as-horror in
the professional-attrition key.

Compare against the three silence-arc registers now on the run:

|                    | Rasha (W5–W8)                 | Dhruv (W9, W11)                       | Lenora (W10)                            |
|--------------------|-------------------------------|---------------------------------------|-----------------------------------------|
| Register           | Institutional erasure         | Professional attrition                | Personal withdrawal                     |
| Beat cadence       | 4-rung ladder over 4 weeks    | Latency doubles per silent choice     | Single-beat channel closure             |
| Recovery path      | None                          | HW recovery > 30 could reopen         | None visible in Q1                      |

All three use NEVER-reveal because Pillar 3 forbids announcing the
consequence of silence — the player notices only through the shape of
what stops arriving.

## Silas fatigue thread

- W7 — "Tell me what to spend."
- W8 — "Tell me the posture and I will hold it through the audit."
- W9 — "Give me the number."
- W10 — "Tell me how to answer her."
- **W11 — "If we move now, we own the September integration. / If we hold, another operator takes it."**

W11 is not a fifth imperative-close. It's a conditional — Silas has
real money and a real countdown, and the fatigue accepts the binary
rather than fighting it. The prompt names the deadline (3:20 this
afternoon → Sunday 11:59 PM) inside the same sentence structure that
carried the previous four weeks. Author intent: this is the week
where the fatigue stops asking Echo to close and starts admitting
the deadline is already halfway through.

## Registry integrity

- `Q1_SEQUENCE`: 11/12 entries (W1–W11 populated; W12 pending)
- `ALL_CONSEQUENCE_MODULES`: **44** hooks total (4 × 11 weeks)
- `ALL_SILAS_PROMPTS`: 12 prompt files including W11
- `NAMED_ENTITIES` in silasLint: unchanged — Dhruv Meyer is already
  registered (added at C10 for W9–W12 coverage).

## Verification

- `npx tsc --noEmit` → clean
- `npx oxlint` → 1 pre-existing warning at `vite.config.ts:1` (per
  CLAUDE.md, leave alone)
- `npx vitest run` → **509 / 509** passing across 58 test files
- No new tests needed: C6 refactor's `Q1_SEQUENCE`-walk lint automatically
  covers W11; §11 traceability test walks `ALL_CONSEQUENCE_MODULES`; §10
  silasLint walks `ALL_SILAS_PROMPTS`.

## Next-sprint carry-ins (C13 · W12 · quarter-close-ethics-hearing)

- W12 is the Q1-close ethics hearing directive — the final Q1 week.
  Track C14 inspection scenes (Q1E.A/Q1E.B) will be authored to read
  every posture on the run (seat-award outcome, Rasha silence-arc
  end-state, Dhruv attrition depth, Lenora's inquiry, W8 payroll-audit
  posture, W4 East Wilmer pre-brief posture).
- W11's `HOOK_INTEGRATION_BID_PASSED` fires at W12 elapsing via
  `q1-week12-elapsed`. If the player chose `hold-savings`, the ethics
  hearing prompt should acknowledge the competitor-awarded outcome.
- End-of-Content overlay hook: W12 sets `Q1_CLOSED` which the
  end-of-content overlay reads to know the vertical slice has run its
  full length.
- All six module signal flags (MOURNER_NAMED_ONCE, DEFENDER_HELD_LINE,
  SENTINEL_ARMED, SPARK_DEPLOYED, DRAINED_ONE_YIELDED, CHAMPION_DEFIED)
  should be read at least once in W12 ledger prose — the ethics
  hearing is the natural place to name the modules Silas has been
  watching all quarter.

## Regressions

None. C6 refactor kept the schedule additive; W11 slotted cleanly into
`Q1_SEQUENCE`. Test suite held at 509/509 — no drift from lint or
traceability walkers.
