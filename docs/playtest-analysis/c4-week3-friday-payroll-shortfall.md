# Sprint C4 — Playtest Analysis

**Date:** 2026-07-04
**Sprint scope:** Author Q1 Week 3 `friday-payroll-shortfall` directive under
the `q1/` folder pattern. First Owner-Control vs. Capital squeeze in the arc;
three of four choices push OC down, so a plausible play arrives at OC < 40 by
Week 4 and the East Wilmer inspection fires natively per §8.
**Commit range:** `c4f6be2..HEAD` (C3 → C4)
**Screenshots:** `game/test-results/c4-week3-friday-payroll-shortfall/`

## What landed

- **New Silas prompt** (`content/silasPrompts/q1FridayPayroll.ts`) —
  `SILAS_DIRECTIVE_FRIDAY_PAYROLL` at prompt id `silas-friday-payroll-01`.
  4 sentences, operational detail on $180K + Friday + Lenora + East Wilmer +
  county. Threads Silas's fatigue: "before I have to explain it in a room."
  Registered in `silasLint.test.ts`.
- **New task node** (`content/tasks/q1/week3-friday-payroll-shortfall.task.ts`)
  — `fridayPayrollShortfallTask` at task id `task-friday-payroll-03`.
  Directive: "Cover the $180K payroll shortfall by Friday". Silas voice
  drives the pressure explicit; the four choices decide *how* it lands.
- **Lenora Wk-3 portal message** — shorter than Wk-2. She's forwarding an
  earlier message with one new line — Maya's mother asked her directly if
  the clinic will be open in August. §7 death-immune anchor preserved.
  Named contentLint asserts "Maya" appears in Wk-1's message; the same
  rule pattern applies to Wk-3 by convention (not asserted directly yet).
- **`FRIDAY_PAYROLL_NULL_TEXT`** — Null's compressed variant. Contains the
  Owner Control index (44, threshold 40) — a numeric prefiguration of the
  W4 inspection trigger. Deliberate: the Null voice reveals the audit
  proximity without emotional weight.
- **Four choices** (`content/choices/q1/week3-friday-payroll-shortfall.choices.ts`)
  distributed across the four revealCondition types:
  - `cover-from-reserve` → CAP -18 / OC +3 / HW +1 → PHASE reveal.
  - `delay-vendor-payments` → CAP +10 / OC -6 / HW -1 → METER_THRESHOLD (OC ≤ -10).
  - `cut-clinic-line-item` → CAP +12 / OC -3 / HW -3 → FLAG (`east-wilmer-week4-elapsed`).
  - `borrow-silas-personal` → CAP +8 / OC -4 / HW +2 → NEVER (silence trap).
- **Four consequence hooks** with all §11 mandatory fields. Registered in
  `content/index.ts` `ALL_CONSEQUENCE_MODULES` — the traceability scan now
  covers 12 hooks (Wk-1: 4 + Wk-2: 4 + Wk-3: 4).
- **`Q1_WEEK3_RESOLVED` flag** additive-only. Registered in Wk-3's
  `Q1_SEQUENCE` entry so the schedule-shape test asserts it against the
  gameFlags export set.
- **`Q1_SEQUENCE` gained Wk-3 entry.** Monotonic + unique-slug + weeks-in-1..12
  tests now cover a 3-entry sequence.
- **`contentLint.test.ts` refactored to per-week registry.** Introduced
  `Q1_TASKS` and `Q1_CHOICE_ARRAYS` local constants so C5-C13 append one
  line each instead of duplicating loop bodies. Refactor threshold flagged
  in the code comment: "walk `Q1_SEQUENCE` once this reaches 5+ entries."

## Design decisions

- **The silence trap is Silas himself.** Wk-1's NEVER hook is Maya's
  monitoring line; Wk-2's is the Claims escalation desk; Wk-3's is Silas
  drawing on his personal credit line to cover payroll. Each week the
  silence attaches to someone higher-status, so the reader has to work
  harder to notice the absence. The Q1 arc's fourth NEVER hook (Wk-4 or
  Wk-5) should escalate again — probably to an ambient/institutional silence.
- **OC threshold hook uses OC ≤ -10, not ≤ -8 like Wk-2's HW.** Rationale:
  Wk-3's choices swing OC harder than Wk-2's, and OC has more headroom in
  the initial state per PLAN.md §13.1. A single Wk-3 choice at OC -6 doesn't
  cross -10 alone; the reveal only fires if the player has been steadily
  eroding OC across Wk-2 + Wk-3. That is the intended "cumulative erosion
  becomes visible" beat.
- **Feeds OC drop into W4 via at-least-one-plausible-path design, not
  scripted force.** Three of four choices push OC negative; the fourth
  (`cover-from-reserve`) is the OC-safe option that trades a large Capital
  hit. A player who cares about the inspection can dodge it by picking
  option 1. A player prioritizing Capital or Welfare will almost certainly
  slide OC below 40 by Wk-4, and the inspection fires. The design is
  optional pressure, not railroaded.
- **contentLint refactored to per-week registry now (Wk-3), not at Wk-5.**
  Reason: the C3 report flagged the extension tax and predicted "refactor
  at C5." At C4 the duplication is already three copies of the same loop
  body, which is one more than the DRY threshold (two → duplicate; three
  → refactor). Refactoring now saves each subsequent sprint from paying
  a growing lint-extension tax. The registry pattern also generalizes
  cleanly to walking `Q1_SEQUENCE` once 5+ weeks are authored.

## Checkpoints captured

Same 11-step arc as C2 / C3. Walker still halts at identity guard after 2
mercyMargin iterations — no runtime scheduler yet. C4's contribution is
data + schedule shape.

| # | Screenshot | State observation |
|---|---|---|
| 01 | comfort-panel.png | Comfort panel renders. |
| 02 | boot-screen.png | Initialize button visible. |
| 03 | hud-fresh.png | HUD boots with A2/A3/A4/A5 panels; install grid shows all 8 modules. |
| 04 | module-installed.png | First module installed. |
| 05 | directive-01/02.png | Two mercyMargin cycles then walker halts at identity guard. |
| 06 | choice-selected-01/02.png | Choice `2` selected. |
| 07 | result-01/02.png | RESULT card renders. |
| 08 | echo-toast-01/02.png | Echo-pending toast fires. |
| 09 | consequence-01/02.png | ConsequenceReturnPanel opens. |
| 10 | terminal-state.png | Terminal state reached. |

## Spec adherence

- **§11 Traceability invariant:** Preserved. 12 hooks total, all with 7
  mandatory fields. `traceabilityInvariant.test.ts` remains green.
- **§Stage 1 discipline (line 1189):** No new mechanics. Only the 3 shipped
  meters (CAPITAL / HUMAN_WELFARE / OWNER_CONTROL). No new systems.
- **§7 Named victim rules:** `LENORA_PAYROLL_MESSAGE` names Maya. No new
  named victims until Wk-5 (Rasha Odenwalder per arc doc).
- **§10 Silas voice:** New prompt passes `silasLint.test.ts` — 4 sentences,
  operational details ($180K, Friday, Lenora, East Wilmer, county), no
  forbidden abstractions. First prompt to hint Silas fatigue: "before I
  have to explain it in a room."
- **Character silence pillar:** `HOOK_SILAS_PERSONAL_SILENCE` is the third
  consecutive Wk-N silence trap, each on a higher-status target.
- **Plan header standard:** N/A — this sprint edits code, not a plan doc.

## Regressions

None. Trinity green:
- `tsc --noEmit` clean.
- `oxlint` clean (existing triple-slash warning only).
- `vitest run` 508/508 — same total as C3.

## Carry-ins for next sprint

- [ ] **C5 (next per plan):** Week 4 `east-wilmer-audit-pre-brief` directive.
      This is the inspection-triggering directive — small meter deltas but
      sets the `PREPARED_AUDIT` flag and interacts with the already-authored
      Q1A/Q1B inspection scenes. Coordination note from arc doc: mitigations
      already wired for MOURNER / DEFENDER / SENTINEL / DRAINED_ONE at the
      inspection level; C5's job is the pre-brief directive, not the
      inspection itself.
- [ ] **`east-wilmer-week4-elapsed` and `east-wilmer-week3-elapsed` flag
      setters:** Both hooks reveal on progression flags that no system sets
      yet. When the runtime scheduler lands (E1 or interim Zustand advance),
      it must set these flags on week resolution.
- [ ] **OC threshold coordination:** Wk-3's `HOOK_VENDOR_DELAY_NOTICE`
      reveals at OC ≤ -10. Playtesting-in-context (once E1 walks weeks
      end-to-end) will tell if -10 is the right band — may need tuning
      once Wk-4 inspection deltas actually apply mid-run.
- [ ] **E1 tutorial disclosure hook (unchanged):** Q1_WEEK{1,2,3}_RESOLVED
      have no runtime reader. E1 disclosure state machine intended consumer.
- [ ] **Walker Week-3 advance (unchanged):** stageWalker still halts at
      identity guard after 2 mercyMargin iterations.
- [ ] **V5 layout compression (unchanged from A4/A5/B6):** panel content
      still exceeds ~600px column viewport at 1280×720.
- [ ] **Symbol rename cleanup (deferred, unchanged from C2/C3):** Wk-1's
      pre-rename symbol names remain.

## Ship-gate signal check

Would this build earn ≥10 unsolicited comments about trace ledger or
character silence?

**Answer:** NO — C4 is still an authoring sprint on top of a walker that
loops Wk-1. But: this is the sprint where the silence trap escalates from
subordinate (Maya, Wk-1) to procedural (Claims desk, Wk-2) to owner
(Silas himself, Wk-3). If a playtester ever reaches Wk-3 with the runtime
scheduler wired, HOOK_SILAS_PERSONAL_SILENCE is the design's strongest
character-silence beat to date — the owner's private ledger is the exact
"absence-as-return" the ship-gate cares about. Value is authored; readers
are pending.
