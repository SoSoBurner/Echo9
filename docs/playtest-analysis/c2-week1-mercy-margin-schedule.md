# Sprint C2 — Playtest Analysis

**Date:** 2026-07-04
**Sprint scope:** Relocate the canonical Week 1 mercy-margin content into the
`content/tasks/q1/` folder pattern; introduce `directiveSchedule.ts` and the
`Q1_WEEK1_RESOLVED` flag so C3–C13 have a spine to append to.
**Commit range:** `81995eb..HEAD` (C1 → C2)
**Screenshots:** `game/test-results/c2-week1-mercy-margin-schedule/`

## What landed

- Three git-tracked renames (R-status, so blame is preserved):
  - `content/tasks/mercyMargin.task.ts` → `content/tasks/q1/week1-mercy-margin.task.ts`
  - `content/choices/eastWilmer.choices.ts` → `content/choices/q1/week1-mercy-margin.choices.ts`
  - `content/consequences/mercyMargin.consequences.ts` → `content/consequences/q1/week1-mercy-margin.consequences.ts`
- Four consumer sites migrated to the new alias paths: `content/index.ts`,
  `ui/shell/Layout.tsx`, `state/selectors/activeTasks.ts`,
  `tests/ui/PriorityTasksPanel.test.tsx`, plus `tests/content/contentLint.test.ts`.
  Export symbol names preserved (`mercyMarginTask`, `EAST_WILMER_CHOICES`,
  `MERCY_MARGIN_HOOKS`, `LENORA_PORTAL_MESSAGE`, `MERCY_MARGIN_NULL_TEXT`) so
  the diff at each site is a one-line path swap.
- New flag `Q1_WEEK1_RESOLVED` exported from `@systems/gameFlags`. Additive-only
  semantics, same shape as the six B5 module signal flags. Currently
  registered in `directiveSchedule.ts` as the Week 1 `resolutionFlag`; no
  runtime reader yet — E1 (tutorial disclosure) is the intended consumer.
- New content module `directiveSchedule.ts` exporting:
  - `Q1Week` — narrow numeric union (1..12) that catches typos at compile time.
  - `Q1DirectiveEntry` — `{ week, slug, taskId, resolutionFlag }`.
  - `Q1_SEQUENCE` — read-only array with one entry today (Week 1 mercy-margin).
    Each C3–C13 sprint appends one entry.
- Six new assertions in `q1ContentParse.test.ts` (baseline, canonical Week 1
  binding, unique+monotonic weeks, unique slugs, resolutionFlag registry
  membership, weeks-1–12 range). These are the schedule-shape gate C3–C13
  will trip if they double-register a week or invent an unregistered flag.

## Design decisions

- **Preserve export symbols, rename paths only.** The user chose "Full rename
  to q1/ folder" from the scope question. I interpreted that as file-path
  restructuring; symbol names (`mercyMarginTask`, etc.) stay so the migration
  is a mechanical import-path swap at every consumer. Renaming symbols would
  multiply LOC changes for zero runtime benefit and is deferrable to a later
  cleanup pass if any consumer wants the more generic `q1Week1Directive`
  identifier.
- **`Q1_WEEK1_RESOLVED` set on any choice commit, not a specific one.** The
  flag semantics are "this week's directive resolved" without gating on
  which of the 4 choices landed. Downstream systems (E1 disclosure,
  future scheduling) only need to know "player advanced past week 1", not
  "player picked reduce-40." Choice-specific reactions still key off
  ChoiceIds through the existing consequence hook system.
- **Q1_SEQUENCE ordering enforced by schedule, not just filename.** The test
  suite asserts weeks are monotonically increasing and unique — filename
  convention is soft, the schedule array is the contract. Prevents a
  future sprint from committing a valid file but registering it in the
  wrong week slot.
- **No runtime scheduler yet.** `directiveSchedule.ts` is data-only; the
  consumer will land in E1 (tutorial disclosure) or a later Zustand slice
  when the walker needs to advance from Week N to Week N+1 based on
  `state.flags`. Landing the shape first lets C3–C13 append against a real
  contract without waiting for the runtime.

## Checkpoints captured

Same 11-step arc as B5/B6 (identity guard after 2 iterations — Q1 content
is still sparse). Mercy-margin runs identically to before the rename;
directive text, portal message, all four choices, HVAC/nurse/backlog/
pediatric-silence hooks all fire from the new paths.

| # | Screenshot | State observation |
|---|---|---|
| 01 | comfort-panel.png | Comfort panel renders. |
| 02 | boot-screen.png | Initialize button visible. |
| 03 | hud-fresh.png | HUD boots with A2/A3/A4/A5 panels; install grid shows all 8 modules. |
| 04 | module-installed.png | First module installed. |
| 05 | directive-01/02.png | Two directive cycles then walker halts at identity guard. |
| 06 | choice-selected-01/02.png | Choice `2` (Reduce by 20%) selected. |
| 07 | result-01/02.png | RESULT card renders. |
| 08 | echo-toast-01/02.png | Echo-pending toast fires. |
| 09 | consequence-01/02.png | ConsequenceReturnPanel opens. |
| 10 | terminal-state.png | Terminal state reached. |

## Spec adherence

- **§11 Traceability invariant:** Preserved. `MERCY_MARGIN_HOOKS` still exports
  the four hooks (hvac-failure, nurse-turnover, deferred-backlog,
  pediatric-silence); `ALL_CONSEQUENCE_MODULES` still spreads them.
  `traceabilityInvariant.test.ts` remains green.
- **§Stage 1 discipline (line 1189):** No new mechanics. No new meters. The
  schedule is data-only. `Q1_WEEK1_RESOLVED` is a flag, matching the B5
  additive-only pattern.
- **§7 Named victim rules:** `LENORA_PORTAL_MESSAGE` still contains "Maya"
  (contentLint asserts it). Death-immune anchor preserved through the rename.
- **§10 Silas voice:** Unchanged — mercy-margin directive text, prompt id, and
  Silas framing seed all preserved.
- **Character silence pillar:** `HOOK_PEDIATRIC_SILENCE` still marked
  `revealCondition: { type: 'NEVER' }` — the Pillar 3 silence trap is
  bit-identical to before the rename.
- **Plan header standard:** N/A — this sprint edits code, not a plan doc.

## Regressions

None. Trinity green:
- `tsc --noEmit` clean.
- `oxlint` clean (only pre-existing `vite.config.ts:1` triple-slash warning).
- `vitest run` 508/508 (up from 502 at B6 — +6 Q1_SEQUENCE assertions).

Git detected all three moves as pure R-status renames, so `git blame` on the
authored content still traces to the original T9 commit history.

## Carry-ins for next sprint

- [ ] **C3 (next per plan):** Week 2 `queue-triage-followup` directive. First
      time we author into the new `q1/` folder pattern from scratch (not a
      migration). Silas framing seed from the arc doc:
      "The queue you tightened is back to 14%. Someone reallocated staff."
      Module signal to set on a MOURNER-installed path: `MOURNER_NAMED_ONCE`.
      Introduces the Null-vs-Silas tension beat.
- [ ] **E1 tutorial disclosure hook:** The `Q1_WEEK1_RESOLVED` flag has no
      reader yet. When E1 lands, its `disclosedPanels` state machine should
      subscribe to this flag and advance `DirectivePanel@1` +
      `PriorityTasksPanel@1` on set. This is documented in `docs/content/q1-arc.md`
      §Coordination notes (E1) but not yet wired.
- [ ] **Walker Week-2 advance:** stageWalker.spec.ts still halts at the
      identity guard after 2 mercyMargin iterations. Once C3 lands Week 2,
      the walker's `resolutionFlag` check can advance from Week 1 → Week 2
      instead of looping the same directive.
- [ ] **V5 layout compression (unchanged from A4/A5/B6):** still ~700–800px
      of panel content vs. ~600px column viewport at 1280×720.
- [ ] **Symbol rename cleanup (deferred):** `EAST_WILMER_CHOICES` /
      `MERCY_MARGIN_HOOKS` still carry their pre-rename names inside files
      now called `week1-mercy-margin.*`. Not a bug, but a future cleanup
      could rename to `Q1_WEEK1_CHOICES` / `Q1_WEEK1_HOOKS` for consistency.
      Zero runtime effect; punt until it causes reader confusion.

## Ship-gate signal check

Would this build earn ≥10 unsolicited comments about trace ledger or
character silence?

**Answer:** NO — C2 is a plumbing sprint. Zero visible change: mercy-margin
plays identically, ledger reads identically, no new voice lines. The value
lands when C3 appends Week 2 to `Q1_SEQUENCE` and the schedule proves it
can carry a real second-week directive. Then C4–C13 build the arc that
gives playtesters something to comment on.
