# Sprint C3 — Playtest Analysis

**Date:** 2026-07-04
**Sprint scope:** Author Q1 Week 2 `queue-triage-followup` directive from
scratch under the `q1/` folder pattern the C2 rename established. First C-track
sprint that adds directive content (not a migration). Introduces the
Null-vs-Silas tension beat: "the queue you tightened is back to 14% — someone
reallocated staff to absorb the compounding cost."
**Commit range:** `4772e41..HEAD` (C2 → C3)
**Screenshots:** `game/test-results/c3-week2-queue-triage-followup/`

## What landed

- **New Silas prompt** (`content/silasPrompts/q1QueueTriage.ts`) —
  `SILAS_DIRECTIVE_QUEUE_TRIAGE` at prompt id `silas-queue-triage-01`.
  4 sentences, operational detail on 14% + Lenora + Friday + East Wilmer;
  no forbidden MBA abstractions. Registered in `silasLint.test.ts` so future
  edits to the prompt get lint feedback automatically.
- **New task node** (`content/tasks/q1/week2-queue-triage-followup.task.ts`)
  — `queueTriageFollowupTask` at task id `task-queue-triage-02`. Directive
  text ("Reduce East Wilmer queue congestion — return the 14% to spec")
  ties to Silas's prompt naming a concrete measure and a Friday deadline.
- **Lenora Wk-2 portal message** — shorter than Wk-1's mercy-margin note;
  she is tired and running the floor. Contains "Maya" per §7 death-immune
  anchor rule; extended by contentLint if the file drifts.
- **`QUEUE_TRIAGE_NULL_TEXT`** — the compressed numeric-only variant of the
  same event, drained of human stakes. Pairs against Lenora's message in
  the CenterDirectivePanel to seed the Null-vs-Silas contrast beat.
- **Four choices** (`content/choices/q1/week2-queue-triage-followup.choices.ts`)
  distributed across the four revealCondition types (same Wk-1 discipline):
  - `cover-overtime` → CAP -6 / OC +2 / HW +1 → PHASE reveal.
  - `freeze-reallocation` → CAP +5 / HW -4 / OC -2 → METER_THRESHOLD (HW ≤ -8).
  - `name-pediatric-gap` → CAP -3 / HW +4 / OC -3 → FLAG (`east-wilmer-week3-elapsed`).
  - `redirect-claims-cover` → CAP +3 / HW -1 / OC +1 → NEVER (silence trap).
- **Four consequence hooks** (`content/consequences/q1/week2-queue-triage-followup.consequences.ts`)
  match the four choices id-for-id. §11 traceability invariant already
  gates their 7-field completeness. Registered in `content/index.ts`
  `ALL_CONSEQUENCE_MODULES` — the traceabilityInvariant test now scans 8
  hooks (Wk-1's 4 + Wk-2's 4).
- **`Q1_WEEK2_RESOLVED` flag** exported from `@systems/gameFlags`. Additive-only.
  Registered in Wk-2's `Q1_SEQUENCE` entry so the schedule-shape test asserts
  it is a real exported constant, not a typo.
- **`Q1_SEQUENCE` gained Week 2 entry.** Weeks-monotonic and slugs-unique tests
  now assert against 2 entries instead of 1. Same additive-only contract.
- **`contentLint.test.ts` extended** — id-integrity check now walks both
  Wk-1 and Wk-2 tasks/choices so hook `sourceTaskId` and `sourceChoiceId`
  references resolve for the enlarged catalog. This is the first C-track
  extension of the lint's known-id set; a general "walk Q1_SEQUENCE"
  refactor is deferred to C4+ when a third week joins the schedule.

## Design decisions

- **Silence trap moved from "obvious pediatric touch" to a bookkeeping cut.**
  Wk-1's NEVER hook (redirect-pediatric) reads unambiguously as a moral
  cost — the player pulls from Maya's monitoring line. Wk-2's silence trap
  is subtler: `redirect-claims-cover` sounds procedural (moving a temp line
  inside admin overhead) and only bites when the *next* rebound lands with
  no one at Claims to file the incident report. Progression discipline: the
  silence trap should be harder to spot each week, not the same shape re-skinned.
- **Choice #3 (`name-pediatric-gap`) uses a FLAG reveal on a lifecycle
  string (`east-wilmer-week3-elapsed`), not a module signal.** The arc doc
  reserves `MOURNER_NAMED_ONCE` for a module-set signal that later weeks
  (Wk-9 `schools-contract-renewal` per arc doc) will read. Wk-2's FLAG
  reveal is a natural progression flag (Wk-3 elapses), not a module signal —
  this preserves `MOURNER_NAMED_ONCE`'s semantics as "the player installed
  and used MOURNER" rather than "the player named a gap once."
- **Meter deltas fit `HW ±[2,5], CAP ±[3,8], OC ±[2,3]` per arc doc W2 row.**
  Max HW swing is 4 (name-pediatric-gap); max CAP swing is 6 (cover-overtime);
  max OC swing is 3 (name-pediatric-gap). All choices strictly inside the
  arc-defined envelope.
- **`Q1_WEEK2_RESOLVED` set on any choice commit, not a specific one.**
  Same semantics as `Q1_WEEK1_RESOLVED` from C2 — the flag records
  "player advanced past Week 2" without gating on which choice landed.
  Choice-specific reactions still key off ChoiceIds through the existing
  consequence hook system.
- **contentLint scoped extension, not generalization.** Rather than
  refactoring the id-integrity test to walk `Q1_SEQUENCE`, C3 minimally
  extends the known-id sets to include Wk-2. Rationale: two weeks is not
  enough repetition to justify the refactor, and the extension is
  additive-mechanical. C4 or C5 will hit the "three copies is now DRY"
  threshold and refactor to walk the schedule.

## Checkpoints captured

Same 11-step arc as C2 / B5 / B6 (identity guard after 2 iterations — the
walker still doesn't know Week 2 exists at runtime because there's no
scheduler yet; C3's contribution is data + schedule shape, not runtime
walking). All checkpoints render identically to C2.

| # | Screenshot | State observation |
|---|---|---|
| 01 | comfort-panel.png | Comfort panel renders. |
| 02 | boot-screen.png | Initialize button visible. |
| 03 | hud-fresh.png | HUD boots with A2/A3/A4/A5 panels; install grid shows all 8 modules. |
| 04 | module-installed.png | First module installed. |
| 05 | directive-01/02.png | Two mercyMargin cycles then walker halts at identity guard. |
| 06 | choice-selected-01/02.png | Choice `2` (Reduce by 20%) selected. |
| 07 | result-01/02.png | RESULT card renders. |
| 08 | echo-toast-01/02.png | Echo-pending toast fires. |
| 09 | consequence-01/02.png | ConsequenceReturnPanel opens. |
| 10 | terminal-state.png | Terminal state reached. |

## Spec adherence

- **§11 Traceability invariant:** Preserved. `QUEUE_TRIAGE_HOOKS` exports 4
  hooks (overtime-drag, shift-lead-turnover, honest-flag, claims-cover-silence);
  `ALL_CONSEQUENCE_MODULES` spreads them alongside `MERCY_MARGIN_HOOKS`.
  `traceabilityInvariant.test.ts` remains green with 8 registered hooks.
- **§Stage 1 discipline (line 1189):** No new mechanics. No new meters. Only
  the 3 shipped meters used (CAPITAL, HUMAN_WELFARE, OWNER_CONTROL). No new
  systems. Wk-2 is content atop the Wk-1 seam.
- **§7 Named victim rules:** `LENORA_QUEUE_MESSAGE` contains "Maya" (contentLint
  extension coverage extends via reused pattern). Lenora and Maya carried
  from Wk-1 arc; no new named victims until Wk-5 (Rasha).
- **§10 Silas voice:** New prompt passes `silasLint.test.ts` — 4 sentences,
  operational details (14%, Lenora, Friday, East Wilmer), no forbidden
  MBA-abstractions.
- **Character silence pillar:** `HOOK_CLAIMS_COVER_SILENCE` marked
  `revealCondition: { type: 'NEVER' }` — the Pillar 3 silence trap now
  appears at Wk-1 AND Wk-2, establishing the recurring shape.
- **Plan header standard:** N/A — this sprint edits code, not a plan doc.

## Regressions

None. Trinity green:
- `tsc --noEmit` clean.
- `oxlint` clean (only pre-existing `vite.config.ts:1` triple-slash warning).
- `vitest run` 508/508 — same total as C2, no new tests added this sprint.
  The existing `Q1_SEQUENCE` shape assertions catch the added Wk-2 entry
  automatically (weeks unique + monotonic, slugs unique, resolutionFlag
  registered, weeks in 1–12 range).

## Carry-ins for next sprint

- [ ] **C4 (next per plan):** Week 3 `friday-payroll-shortfall` directive.
      First OC-vs-CAP squeeze that sets the stage for the Wk-4 East Wilmer
      inspection (already authored in T11 — mitigations must key off Wk-3's
      choices via new flags or `DEFENDER_HELD_LINE`/`SENTINEL_ARMED` reads).
      Silas framing seed: "Payroll is $180K short by Friday. County wants a
      story." Meter profile: CAP ±[8,18], OC ±[3,6], HW ±[1,3].
- [ ] **contentLint refactor threshold (C4/C5):** The id-integrity test now
      hardcodes both Wk-1 and Wk-2 known sets. When Wk-3 lands, refactor to
      walk `Q1_SEQUENCE` + a small per-week `{choices, task}` registry so
      C4-C13 don't each pay a lint-extension tax.
- [ ] **E1 tutorial disclosure hook (unchanged from C2):** Both
      `Q1_WEEK1_RESOLVED` and now `Q1_WEEK2_RESOLVED` have no runtime reader.
      When E1 lands, `disclosedPanels` state machine should subscribe to
      these flags and advance panel maturity per week.
- [ ] **Walker Week-2 advance (unchanged from C2):** stageWalker still halts
      at identity guard after 2 mercyMargin iterations. Once the runtime
      scheduler lands (E1 or a Zustand slice), the walker's `resolutionFlag`
      check will advance from Week 1 → Week 2 → Week 3.
- [ ] **`east-wilmer-week3-elapsed` flag reader:** The Wk-2 FLAG hook
      (`cons-honest-flag-01`) reveals on this string flag. The setter is
      deferred to whatever slice registers "Wk-3 has resolved" — likely
      the same E1 disclosure state machine, or an interim Zustand advance.
- [ ] **V5 layout compression (unchanged from A4/A5/B6):** still ~700–800px
      of panel content vs. ~600px column viewport at 1280×720.
- [ ] **Symbol rename cleanup (deferred, unchanged from C2):** Wk-1's
      `EAST_WILMER_CHOICES` / `MERCY_MARGIN_HOOKS` still carry pre-rename
      names. Wk-2 shipped with generic names (`QUEUE_TRIAGE_CHOICES`,
      `QUEUE_TRIAGE_HOOKS`) — the future rename will only touch Wk-1.

## Ship-gate signal check

Would this build earn ≥10 unsolicited comments about trace ledger or
character silence?

**Answer:** NO — C3 is still an authoring sprint on top of a walker that
loops Wk-1. Playtesters can't reach the Null-vs-Silas beat because the
runtime scheduler doesn't advance yet. The value lands when either (a) the
runtime scheduler advances at Wk-1 resolution to Wk-2, or (b) C4-C13 finish
Q1 authoring so the eventual scheduler wire-up covers the full arc. Until
then, Wk-2 is CI-tested content waiting for a reader.
