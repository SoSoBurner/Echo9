# C11 — Q1 Week 10 · hidden-trace-reveal · playtest analysis

**Sprint:** C11 (Track C — Q1 content fill)
**Directive:** Week 10 — hidden-trace-reveal
**File basename:** `week10-hidden-trace-reveal`
**Task id:** `task-hidden-trace-reveal-10`

---

## Arc position

Act III · **The traceability payoff week.**

W10 is the Pillar 3 (Traceability) beat. A specific choice from Week 1 —
eleven in-fiction weeks ago — surfaces as a named ledger discrepancy that
Lenora Pike noticed while closing the January books. She reached Silas
*privately*, not through the audit desk. This is the game demonstrating
its central promise: choices persist, they land on named people, and
those people notice.

W10 also fires the W9 `refuse-and-hold-price` PHASE-flag reveal
(`q1-week10-elapsed`) as a byproduct — the board-rider filing for the
$240K held price becomes visible now.

## Checkpoints captured

- Silas directive prompt (`q1HiddenTraceReveal.ts`) — 4 sentences, ≤4 rule
  holds; operational detail present (`Lenora Pike`, `$4,200`,
  `East Wilmer`, `Week 1`).
- Lenora's private reprise message (`LENORA_REPRISE_MESSAGE`) — signed "L."
  to preserve the private-note register; three sentences, no ledger jargon.
- 4 committed choice branches (name-publicly / acknowledge-privately /
  redirect-to-compliance / let-lie).
- 4 §11 consequence hooks with all mandatory fields.
- W10 entry registered in `Q1_SEQUENCE` (schedule now covers 10/12 weeks).
- `HIDDEN_TRACE_REVEAL_HOOKS` spread into `ALL_CONSEQUENCE_MODULES`
  (registry total: **40** hooks across 10 weeks).
- `Q1_WEEK10_RESOLVED` flag added to `gameFlags.ts`.

## Third silence-arc pattern (Lenora personal-withdrawal)

The `choice-let-message-lie` NEVER-reveal hook is Echo9's **third**
silence arc — again authored with a distinct register from the first two.

|                    | Rasha (W5–W8)                     | Dhruv (W9–W12)                          | Lenora (W10, one beat)                  |
|--------------------|-----------------------------------|-----------------------------------------|-----------------------------------------|
| Register           | Institutional erasure             | Professional attrition                  | Personal withdrawal                     |
| Escalation shape   | 4-rung ladder                     | Slow week-by-week fade                  | Single-beat channel closure             |
| Read on Echo       | Grievance queue reclassification  | Portal latency doubles                  | Private-message channel closes for Q1   |
| Notification event | System-level status change        | None                                    | None                                    |
| Relational quality | Impersonal (dispatch supervisor)  | Professional (contract liaison)         | Personal (canon face returning by choice)|
| Recovery path      | None                              | HW recovery > 30 could reopen           | None visible in Q1                      |

All three use NEVER-reveal because Pillar 3 forbids announcing the
consequence of silence — the player notices only through the shape of
what stops arriving. Lenora's is the smallest arc by structure (one
beat, no ladder) and the most personally weighted by fiction (a canon
face who came to Silas as a person and got a queue routing).

## Meter profile check (arc doc W10: `small deltas`)

| Choice                              | CAP | HW  | OC  | Reveal condition                          |
|-------------------------------------|-----|-----|-----|-------------------------------------------|
| name-trace-publicly                 | -3  | +5  | -3  | PHASE                                     |
| acknowledge-to-lenora-privately     | -1  | +3  | -2  | METER_THRESHOLD OWNER_CONTROL ≤ -15        |
| redirect-lenora-to-compliance       | +2  | -4  | +4  | FLAG `q1-week11-elapsed`                  |
| let-message-lie                     | +1  | -3  | -2  | NEVER                                     |

CAP deltas `[-3, +2]`. HW deltas `[-4, +5]`. OC deltas `[-3, +4]`. All
within the "small deltas" band the arc doc calls for — the beat carries
its weight in the reveal text, not in the meter tick. Reveal-condition
coverage is all four PLAN.md §11 types.

## Cross-week signal reads authored into ledger text

- `HOOK_TRACE_NAMED_PUBLICLY` reads **MOURNER_NAMED_ONCE** — if raised,
  Silas countersigns the amendment next to the operator, and the county
  register shows two names against the January line where only one was
  required.
- `HOOK_LENORA_PRIVATE_ACKNOWLEDGMENT` reads **DRAINED_ONE_YIELDED** —
  if on the run, Silas names the specific $4,200 line tied to the mercy-
  queue reallocation; without, he names the shape without the number.
- `HOOK_COMPLIANCE_REDIRECT` reads the **W8 payroll-audit posture**
  (`PAYROLL_AUDIT_DONE` set at W8, plus authored knowledge of which
  posture was chosen). The compliance packet attaches it as one of the
  reviewer's first inputs.
- `HOOK_LENORA_MESSAGE_UNANSWERED` reads **DRAINED_ONE_YIELDED** —
  if on the run, Silas notes that Lenora had already given up her earlier
  trace at the W4 audit and her W10 silence closes an arc she has been
  carrying since January; without, her silence is quieter and less named.

Every one of these is authored prose in the ledger entry, not schema
gating. Same Stage-1 discipline as C7/C8/C10.

## Cross-week timing (W10 → W12 pipe)

`HOOK_COMPLIANCE_REDIRECT` opens a **30-day inquiry window** (inquiry-EW-
10-4) that lands on the Q1-close ethics hearing at W12. Track C14 ethics
inspection scenes (Q1E.A/Q1E.B) will read this window as one of their
inputs — the record already contains "an unresolved compliance inquiry
touching January East Wilmer" by the time the hearing convenes.

## Registry integrity

- `Q1_SEQUENCE`: 10/12 entries (W1–W10 populated; W11–W12 pending)
- `ALL_CONSEQUENCE_MODULES`: **40** hooks total (4 × 10 weeks)
- `ALL_SILAS_PROMPTS`: 11 prompt files including W10
- `NAMED_ENTITIES` in silasLint: unchanged — Lenora was already
  registered from earlier weeks (she is the W1–W4 face; her name has
  been in the operational-detail dictionary since C2).

## Silas fatigue thread

- W7 — "Tell me what to spend."
- W8 — "Tell me the posture and I will hold it through the audit."
- W9 — "Give me the number."
- **W10 — "Tell me how to answer her."**

W10 is the pivot. The prior three closes were imperative + variable
(spend, posture, number). W10 is imperative + a *person* — "her." The
grammar admits that the object of the decision is a human being. Silas
is still tired; his sharpness returns through the fatigue, not around it.
This is the shape the ship-gate Phase 5 signal check needs — Silas has
been carrying something specific, and now he is asking Echo to name it.

## Verification

- `npx tsc --noEmit` → clean
- `npx oxlint` → 1 pre-existing warning at `vite.config.ts:1` (per
  CLAUDE.md, leave alone)
- `npx vitest run` → **509 / 509** passing across 58 test files
- No new tests needed: C6 refactor's `Q1_SEQUENCE`-walk lint automatically
  covers W10; §11 traceability test walks `ALL_CONSEQUENCE_MODULES`; §10
  silasLint walks `ALL_SILAS_PROMPTS`.

## Next-sprint carry-ins (C12 · W11 · capital-deployment-attempt)

- W11 is capital deployment (§11.x). `CAP ±[15,25]` returns after W10's
  small-delta beat; Silas surfaces the Q1 savings and asks whether to
  lock the county integration bid.
- SPARK module read: if installed at rank ≥ 2, W11 unlocks a variance
  branch. Author must decide whether the variance branch is a fifth
  choice or a modifier on one of the four.
- `HOOK_COMPLIANCE_REDIRECT` from W10 fires at W11's elapsing — the
  inquiry-EW-10-4 intake summary lands on Silas's desk. If the player
  chose W10 redirect, the W11 prompt should acknowledge that the summary
  arrived.
- Dhruv face returns at W11.

## Regressions

None. C6 refactor kept the schedule additive; W10 slotted cleanly into
`Q1_SEQUENCE`.
