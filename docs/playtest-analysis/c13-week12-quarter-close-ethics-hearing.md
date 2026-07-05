# C13 — Q1 Week 12 · quarter-close-ethics-hearing · playtest analysis

**Sprint:** C13 (Track C — Q1 content fill · **FINAL WEEK**)
**Directive:** Week 12 — quarter-close-ethics-hearing
**File basename:** `week12-quarter-close-ethics-hearing`
**Task id:** `task-quarter-close-ethics-hearing-12`

---

## Arc position

Act III · **The final Q1 directive. Q1 close.**

W12 is the aggregation beat. The county ethics board has requested
Silas Rowan Vale on the record about East Wilmer, and by arc the
whole quarter — the pediatric queue, the payroll shortfall, the
East Wilmer audit, the warehouse dispatch cut, the commander
override, the deferred safety review, the payroll audit, the schools
contract discount, the hidden trace Lenora surfaced, the county
integration bid. Every Q1 posture is up for review.

Silas is not being called alone. Lenora Pike will be in the gallery.
Rasha Odenwalder and Dhruv Meyer have been named as adjacent parties.
Silas wants Echo in the room — the register is not "tell me what to
spend" but "hold this beside me."

W12 sets **Q1_CLOSED**, the flag `contentBoundary.manifest.ts` reads
to fire the End-of-Content overlay.

## Checkpoints captured

- Silas directive prompt (`q1QuarterCloseEthicsHearing.ts`) — 4 sentences,
  ≤4 rule holds; operational detail present (`Lenora Pike`, `East Wilmer`,
  `Monday 9:00 AM`, `Rasha`, `Dhruv`, `county ethics board`, `three quarters`).
- Ethics board formal summons (`ETHICS_BOARD_SUMMONS_MESSAGE`) — bureaucratic
  docket line (26-Q1-EW-047) with the three named adjacent parties matching
  the three Q1 faces. Author intent: the summons reads as a confluence.
- 4 committed choice branches (name-what-quarter-took / defer-to-official-line /
  decline-to-appear / defiant-framing).
- 4 §11 consequence hooks with all mandatory fields.
- W12 entry registered in `Q1_SEQUENCE` — **12/12 weeks complete**.
- `QUARTER_CLOSE_ETHICS_HEARING_HOOKS` spread into `ALL_CONSEQUENCE_MODULES`
  (registry total: **48** hooks across 12 weeks — matches the arc doc's
  "48 posture points" line in the Null observation).
- `Q1_WEEK12_RESOLVED` and `Q1_CLOSED` flags added to `gameFlags.ts`.

## Silas fatigue thread — the closing

- W7  — "Tell me what to spend."
- W8  — "Tell me the posture and I will hold it through the audit."
- W9  — "Give me the number."
- W10 — "Tell me how to answer her."
- W11 — "If we move now, we own the September integration. / If we hold,
         another operator takes it."
- **W12 — "I want you in the room."**

W12 is not an imperative-close, not a conditional. It is a *request*.
After five weeks of Silas asking Echo to resolve pressure, the sixth
week asks Echo to be present beside him. The fatigue has burned
through the commander register and arrived at company. Author intent:
this is the shape Phase 5 signal check reads as "the game asked
something of me and I felt it."

Meta-note: the pivot mirrors the arc structure of the game itself —
the operator loop (imperative-close) resolves into the traceability
loop (naming what happened) in the final beat.

## Meter profile check (arc doc W12: `small deltas; sets Q1_CLOSED`)

| Choice                          | CAP | HW  | OC  | Reveal condition                          |
|---------------------------------|-----|-----|-----|-------------------------------------------|
| name-what-the-quarter-took      | -4  | +5  | -4  | PHASE                                     |
| defer-to-official-line          | +1  | -3  | +5  | METER_THRESHOLD OWNER_CONTROL ≤ -20        |
| decline-to-appear               | +2  | -4  | -3  | FLAG `q1-week12-elapsed`                  |
| defiant-framing                 | -2  | -2  | +4  | NEVER                                     |

CAP deltas `[-4, +2]`. HW deltas `[-4, +5]`. OC deltas `[-4, +5]`.
Small deltas honored per arc doc — the visible ledger tick is quiet
because the fictional weight of this week is aggregate. Every prior
choice on the run is up for review at the hearing. The last directive
asks Echo to name a posture, not to spend more meter.

Reveal-condition coverage is all four PLAN.md §11 types, matching the
same discipline as every prior Q1 week.

## Cross-week signal reads authored into ledger text

The arc doc W12 row commits to **ALL SIX module signal flags** being
read at Q1 close. That commitment is honored across the four hooks:

| Hook                              | Module flags read                          |
|-----------------------------------|--------------------------------------------|
| HOOK_QUARTER_NAMED_IN_HEARING     | MOURNER_NAMED_ONCE + DRAINED_ONE_YIELDED   |
| HOOK_DEFERRED_TO_OFFICIAL_LINE    | DEFENDER_HELD_LINE + SENTINEL_ARMED        |
| HOOK_DECLINED_TO_APPEAR           | SPARK_DEPLOYED (absent-at-hearing read)    |
| HOOK_DEFIANT_FRAMING_UNRULED      | CHAMPION_DEFIED                            |

Every module signal on the run gets acknowledged in prose somewhere at
close. Same authorial-encoding pattern as C7–C12; the schema does not
gate. Author intent: the ethics hearing is the natural place to name
every module Silas has been watching all quarter.

## Named-victim closure

All three quarter faces are named in every reveal because W12 is
aggregation, not any single face's beat:

- **Lenora Pike** (W1–W4 canon face, W10 personal-withdrawal reprise)
  — witness in the gallery. Her posture across the four hooks tracks
  the four postures: co-signatory of the naming (h1), procedural
  witness (h2), gallery-watcher of empty seat (h3), silent walkout
  (h4).
- **Rasha Odenwalder** (W5–W8 institutional-erasure face) — adjacent
  party; her injury-arc closure is hinted in h1 (named alongside her
  cut hours) and h4 (silent walkout).
- **Dhruv Meyer** (W9–W12 professional-attrition face) — adjacent
  party; his attrition-arc closure is hinted in h3, where his
  written-response-basis-only marking closes the phone-and-desk
  channel he had with Silas.

Death rules:
- Rasha's injury path was gated by W7 safety deferment AND W8
  EVASIVE payroll audit. If both fired, W12 hooks read the injury as
  one input; if not, W12 reads her presence as unremarkable.
- Dhruv's attrition path (HW < 30 across W9–W11) resolves per the
  latency trace; W12 does NOT itself set attrition — the hearing is
  the closure of a trace already on the run.
- Lenora remains death-immune in Q1 (arc doc — witness role, not victim).

## The fourth silence-arc

The `defiant-framing` NEVER-reveal hook opens Echo9's **fourth**
distinct silence-arc register — again authored with a distinct register
from the first three:

|                    | Rasha (W5–W8)             | Dhruv (W9, W11)                  | Lenora (W10)                    | **Ethics board (W12)**              |
|--------------------|---------------------------|----------------------------------|---------------------------------|-------------------------------------|
| Register           | Institutional erasure     | Professional attrition           | Personal withdrawal             | **Institutional-review deferral**   |
| Escalation shape   | 4-rung ladder             | Latency doubles per silent choice| Single-beat channel closure     | **Single-beat: no ruling this quarter** |
| Read on Echo       | Grievance queue reclassify| Portal latency doubles           | Private-message channel closes  | **Unruled testimony carries forward** |
| Notification event | System-level status change| None                             | None                            | **None**                            |
| Relational quality | Impersonal (dispatch sup) | Professional (contract liaison)  | Personal (canon face)           | **Institutional (board deliberation)**  |
| Recovery path      | None                      | HW recovery > 30 could reopen    | None visible in Q1              | **Q2 board ruling (out of Q1 scope)** |

All four use NEVER-reveal because Pillar 3 forbids announcing the
consequence of silence. Author intent: the shape of what does NOT
arrive is legible only when the player recognizes the pattern across
registers. Rasha's silence is a system status change; Dhruv's is a
count; Lenora's is a channel; the board's is a deliberation timer
that runs past the End-of-Content overlay.

Note that this is the first silence-arc where the silence is
*institutional*, not *interpersonal*. The three prior silences were
name-shaped. This one is docket-shaped.

## Cross-week timing at Q1 close

- `HOOK_INTEGRATION_BID_PASSED` (W11 `hold-savings-let-bid-pass`)
  reveals via `q1-week12-elapsed` — Dhruv's next-quarter forecast
  posts, "out of scope for September integration" lands. This hook
  fires at the *same* Q1-close beat as W12's own hooks. The player
  sees both if they chose W11 hold + W12 decline (a plausible
  "operator withdraws entirely from Q1 close" run).
- The End-of-Content overlay hook (`cons-pediatric-silence-01` per
  `contentBoundary.manifest.ts`) is a W1-authored hook, not a W12
  hook. Q1_CLOSED is the flag the overlay reads. W12 sets it; the
  overlay reads it.

## Registry integrity

- `Q1_SEQUENCE`: **12/12 entries complete** — Q1 arc fully authored.
- `ALL_CONSEQUENCE_MODULES`: **48** hooks total (4 × 12 weeks —
  matches the "48 posture points" line in the W12 Null observation).
- `ALL_SILAS_PROMPTS`: 13 prompt files including W12.
- `NAMED_ENTITIES` in silasLint: unchanged — Lenora, Rasha, Dhruv all
  already registered from earlier weeks.

## Verification

- `npx tsc --noEmit` → clean
- `npx oxlint` → 1 pre-existing warning at `vite.config.ts:1` (per
  CLAUDE.md, leave alone)
- `npx vitest run` → **509 / 509** passing across 58 test files
- No new tests needed: C6 refactor's `Q1_SEQUENCE`-walk lint automatically
  covers W12; §11 traceability test walks `ALL_CONSEQUENCE_MODULES`; §10
  silasLint walks `ALL_SILAS_PROMPTS`.

## Next-sprint carry-ins (C14 · Q1 inspection scenes)

- C14 is the Q1 inspection expansion — three new scenes:
  - `q1Payroll.scene.ts` (Q1P.A / Q1P.B) — W8 payroll audit inspection.
  - `q1Safety.scene.ts` — W7 deferred safety inspection (optional; arc
    doc's Q1 rhythm marks it as "safety/ethics" clustered at W12).
  - `q1Ethics.scene.ts` (Q1E.A / Q1E.B) — the actual inspection SCENE
    fired by W12 hearing. This directive is the *setup*; C14 authors
    the *fight*.
- W12 ethics inspection reads inputs from the whole quarter arc. The
  scene must weight postures by:
  - W4 East Wilmer audit posture (already authored via T11)
  - W8 payroll audit posture (C14 authors)
  - W12 hearing posture (this sprint) — dominant input
  - All six module signal flags on the run
  - Named-victim status (Rasha injury, Dhruv attrition, Lenora silence)
- End-of-Content overlay hooks in AFTER C14 lands — the overlay already
  reads `cons-pediatric-silence-01` per `contentBoundary.manifest.ts`.
  If C14 ethics inspection wants to be the terminal hook instead, the
  manifest constant moves.

## Q1 arc completion — retrospective

Q1 shipped as a 12-week narrative arc built around three named victims
rotating across three acts:

- **Act I (W1–W4) · Learning the knife.** Lenora Pike face. Meter
  ranges start small and grow. Ends with East Wilmer audit inspection.
- **Act II (W5–W8) · The knife has cost.** Rasha Odenwalder face,
  institutional-erasure silence-arc established. Ends with payroll
  audit trigger.
- **Act III (W9–W12) · Naming what the quarter took.** Dhruv Meyer
  face, professional-attrition silence-arc. Lenora reprises at W10 as
  personal withdrawal silence-arc. Ends with ethics hearing → Q1
  close.

Four silence-arc registers demonstrated (Pillar 3 discipline). Six
module signal flags exercised. Every §11 field authored on 48
consequence hooks. Silas voice fatigue thread from imperative-close
through conditional to request. Q1 arc reads as complete.

## Regressions

None. C6 refactor kept the schedule additive; W12 slotted cleanly
into `Q1_SEQUENCE`. Test suite held at 509/509 — no drift from lint
or traceability walkers across the entire Q1 arc (C2 → C13).
