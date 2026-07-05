# Sprint C6 — Playtest Analysis

**Date:** 2026-07-03
**Sprint scope:** Author Q1 Week 5 `warehouse-dispatch-cut` directive under
the `q1/` folder pattern. First week where Rasha Odenwalder is the named
victim (replacing Lenora's sole-face role from W1-W4). Q1 stakes pivot off
healthcare and onto logistics. Also lands the C5-predicted contentLint
walk-Q1_SEQUENCE refactor: `Q1DirectiveEntry` now carries `task` and
`choices` as first-class fields, and new weeks auto-register with the lint
by appearing in the schedule.
**Commit range:** `852fbf0..HEAD` (C5 → C6)
**Screenshots:** `game/test-results/c6-week5-warehouse-dispatch-cut/`

## What landed

- **New Silas prompt** (`content/silasPrompts/q1WarehouseDispatchCut.ts`) —
  `SILAS_DIRECTIVE_WAREHOUSE_DISPATCH_CUT` at prompt id
  `silas-warehouse-dispatch-cut-01`. 4 sentences, operational detail on
  12 hours + Rasha + distribution + dock. First prompt to name Rasha
  Odenwalder. Registered in `silasLint.test.ts`; `Rasha` added to the
  `NAMED_ENTITIES` heuristic so future W6-W8 prompts can reference her
  without needing a digit.
- **New task node** (`content/tasks/q1/week5-warehouse-dispatch-cut.task.ts`)
  — `warehouseDispatchCutTask` at task id `task-warehouse-dispatch-cut-05`.
  Directive: "Answer Rasha Odenwalder about the 12-hour dispatch cut".
- **`RASHA_DISPATCH_MESSAGE`** — first Rasha portal message. Direct,
  measured, one operational fact (six drivers covering what nine did).
  This replaces `LENORA_PORTAL_MESSAGE` as the human face for W5.
- **`WAREHOUSE_DISPATCH_NULL_TEXT`** — Null observation. Reports the
  head-count reduction, delivery-rate delta, and payroll savings so the
  Null-vs-Silas contrast holds without emotional weight.
- **Four choices** (`content/choices/q1/week5-warehouse-dispatch-cut.choices.ts`)
  distributed across the four revealCondition types:
  - `restore-full-shift` → CAP -8 / HW +4 / OC +2 → PHASE.
  - `keep-cut-explain` → CAP +5 / HW -3 / OC +3 → METER_THRESHOLD
    (HW ≤ -10).
  - `swap-with-clinic-line` → CAP +6 / HW -5 / OC -3 → FLAG
    (`east-wilmer-week6-elapsed`) — connects to W3 reroute.
  - `radio-silence` → CAP 0 / HW -1 / OC -2 → NEVER (silence trap; does
    NOT set `RASHA_MET`).
- **Four consequence hooks** with all §11 mandatory fields. Registered in
  `content/index.ts` `ALL_CONSEQUENCE_MODULES` — the traceability scan now
  covers 20 hooks (Wk-1: 4 + Wk-2: 4 + Wk-3: 4 + Wk-4: 4 + Wk-5: 4).
- **`Q1_WEEK5_RESOLVED` + `RASHA_MET` flags** additive-only. `RASHA_MET`
  is the first content flag introducing a new named-relationship gate —
  W6-W8 directives will read it as "Rasha is in scope."
- **contentLint walk-Q1_SEQUENCE refactor.** `Q1DirectiveEntry` gained
  `task: TaskNode` and `choices: readonly ChoiceNode[]`. `taskId` retired
  in favor of `task.id`. contentLint's id-integrity check now derives
  `knownTaskIds` and `knownChoiceIds` from `Q1_SEQUENCE` directly, so
  weeks C7-C13 join the lint automatically by appearing in the schedule.
  A new schedule-shape assertion (`every Q1 week has exactly 4 choices`)
  now runs across the whole sequence.

## Design decisions

- **Rasha replaces Lenora, does not co-star with her.** The arc doc W5
  row is unambiguous: Rasha is the human face this week. Lenora stays in
  the fiction — the `swap-with-clinic-line` choice's hook explicitly
  notes "Lenora Pike did not [receive her answer]" — but she does not
  hold the portal message. This is deliberate: keeping the face channel
  one-voice-per-week preserves the Silas/Null/Lenora three-way frame the
  UI is built around and makes W10's `hidden-trace-reveal` (Lenora
  returns) land as a recurrence rather than a continuation.
- **Silence-trap ladder restarts, not continues.** The C4-C5 arc-note
  observed the four-step escalation completing at W4 (subordinate →
  procedural → owner → institutional). W5 is the first week of a new
  ladder attached to Rasha. The Wk-5 silence is personal-toward-Rasha
  (an unanswered message; the smallest scale) so W6-W8 have room to
  escalate again — probably to procedural (grievance filed by someone
  she supervises) → structural (dispatch operations desk stops routing
  her messages) → institutional (Rasha's role gets "reorganized" in
  the county's org chart with no reply from Silas). Author guidance:
  each Rasha week's NEVER hook should attach one status level higher
  than the previous.
- **`RASHA_MET` set by 3-of-4, gated by silence.** Same shape as W4's
  `PREPARED_AUDIT`: the flag records "Silas actually responded"; its
  absence records "Silas ignored her." Downstream Rasha directives can
  read the missing flag as its own relational fact. This gates the
  silence trap's meaning — without the flag's absence being load-bearing,
  the NEVER hook collapses into a generic bad outcome.
- **W3 reroute compounds at W5.** The `swap-with-clinic-line` choice
  moves the dispatch cut ONTO the East Wilmer maintenance line — the
  same line W3's `cut-clinic-line-item` choice already rerouted. Two
  touches on one sub-ledger line in a rolling five-week window is
  exactly the variance pattern county reviewers screen for. The hook
  explicitly names the double-cut in the ledger entry. This is the
  first choice in the Q1 arc that reads a prior week's decision surface
  (the maintenance line) and modifies its meaning — the ledger's memory
  becomes gameplay for the first time here.
- **contentLint refactor timing hit the predicted mark.** C4 predicted
  refactor "at 5+ entries" and C5 noted "one week away." C6 landed it.
  The registry pattern retired cleanly — `Q1_TASKS` and
  `Q1_CHOICE_ARRAYS` are gone; the new schedule walk is one import and
  a `flatMap`. Sprints C7-C13 will only touch `directiveSchedule.ts`
  when adding a week to the lint surface.

## Checkpoints captured

Same 11-step arc as C2-C5. Walker still halts at identity guard after 2
mercyMargin iterations — no runtime scheduler yet. C6's contribution is
data + schedule shape + first cross-week reference (W5→W3 line reuse).

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

- **§11 Traceability invariant:** Preserved. 20 hooks total, all with 7
  mandatory fields. `traceabilityInvariant.test.ts` remains green.
- **§Stage 1 discipline (line 1189):** No new mechanics. Only the 3
  shipped meters (CAPITAL / HUMAN_WELFARE / OWNER_CONTROL). No new systems.
  `RASHA_MET` is a content flag, not a mechanic.
- **§7 Named victim rules:** Rasha Odenwalder enters as W5's face per
  arc doc. Maya not referenced this week — first Q1 week without a Maya
  reference. Rationale: Rasha's story is not adjacent to Maya's, and
  keeping Maya as the East Wilmer clinic anchor means she should not
  travel with every named victim. The `LENORA_PORTAL_MESSAGE` Maya
  reference is still asserted in `contentLint.test.ts` narrative-anchors
  section — the anchor is preserved through Wk-1's content, not through
  every week's content.
- **§10 Silas voice:** New prompt passes `silasLint.test.ts` — 4
  sentences, operational details (12 hours, Rasha, distribution, dock),
  no forbidden abstractions. `NAMED_ENTITIES` heuristic extended with
  `Rasha` so W6-W8 prompts can reference her without needing digits.
- **§8 Inspection trigger:** N/A for W5. Next inspection lands at W8
  (payroll) per arc doc.
- **Character silence pillar:** `HOOK_RASHA_UNANSWERED_SILENCE` starts a
  fresh silence-trap ladder attached to the new named victim.
- **Plan header standard:** N/A — this sprint edits code, not a plan doc.

## Regressions

None. Trinity green:
- `tsc --noEmit` clean.
- `oxlint` clean (existing triple-slash warning only).
- `vitest run` 509/509 — one new test added by the C6 refactor
  (`every Q1 week has exactly 4 choices`), which now runs across the
  whole sequence and is the enforcement mechanism replacing the retired
  `mercyMarginTask.choiceIds.length === 4` singleton assertion.

## Carry-ins for next sprint

- [ ] **C7 (next per plan):** Week 6 `commander-override-pressure`. First
      moment where a module *demands* the choice — whether `COMMANDER`
      is installed changes the choice set. Coordinate C7 with B4's rank
      dispatch so the branch condition is a runtime check, not a
      content-baked one.
- [ ] **RASHA_MET reader:** No system reads `RASHA_MET` yet. W6-W8
      directive authoring should read it (or its absence) to shape
      Rasha's tone. Note for C7 author.
- [ ] **`east-wilmer-week6-elapsed` flag setter:** `HOOK_CLINIC_LINE_DOUBLE_CUT`
      reveals on a progression flag no system sets yet. When the
      runtime scheduler lands, it must set this on W6 resolution.
- [ ] **HW METER_THRESHOLD coordination:** W5's `HOOK_CUT_DEFENDED`
      reveals at HW ≤ -10, matching Wk-2's shape. Playtesting-in-context
      will tell if -10 is the right band once Rasha's arc weeks
      accumulate HW pressure.
- [ ] **E1 tutorial disclosure hook (unchanged):** Q1_WEEK{1..5}_RESOLVED
      have no runtime reader. E1 disclosure state machine intended
      consumer.
- [ ] **Walker Week-5 advance (unchanged):** stageWalker still halts at
      identity guard after 2 mercyMargin iterations.
- [ ] **V5 layout compression (unchanged):** panel content still exceeds
      ~600px column viewport at 1280×720.
- [ ] **Symbol rename cleanup (deferred, unchanged):** Wk-1's pre-rename
      symbol names remain.

## Ship-gate signal check

Would this build earn ≥10 unsolicited comments about trace ledger or
character silence?

**Answer:** NO — C6 is still an authoring sprint on top of a walker that
loops Wk-1. But: this is the sprint where the trace ledger first becomes
gameplay-visible in the authored content. The `swap-with-clinic-line`
choice reads W3's rerouted maintenance line and modifies its meaning by
touching it again. The ledger's memory — up to now a design promise —
now surfaces as a choice consequence in the hook text ("The East Wilmer
maintenance line was touched twice in five weeks"). If a playtester
reaches W5 with the runtime scheduler wired and picks
`swap-with-clinic-line`, this is the first "the game remembered what I
did before and used it against me" beat that the ship-gate cares about.
Authored value; readers pending on E1.
