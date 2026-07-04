# Playtest Analysis Reports

Sprint-end capture reports. One file per sprint, filed as `<sprint-id>.md`
(e.g. `a4-human-impact-panel.md`, `c3-week3-directive.md`).

## Purpose

Every sprint in the Stage-1 vertical slice plan
(`C:\Users\CEO\.claude\plans\make-sure-you-review-glittery-matsumoto.md`)
ends with:

1. `ECHO9_SPRINT=<sprint-id> npx playwright test stageWalker --headed` —
   captures ~20 screenshots + state dumps to
   `game/test-results/<sprint-id>/`
2. Claude reads those screenshots inline and cross-references vs.
   `HUD Mockup.png` + `Echo9_LLM_Code_Writer_Build_Spec_v1_4.md`
3. Claude writes the analysis report to this directory
4. Claude asks the user before `git push`

The report is the durable artifact of that ritual. Screenshots live in
`test-results/` and are gitignored; the analysis is what survives.

## Report Template

Copy this into a new `<sprint-id>.md`:

````markdown
# Sprint <sprint-id> — Playtest Analysis

**Date:** YYYY-MM-DD
**Sprint scope:** <one sentence — what this sprint was meant to land>
**Commit range:** `<sha-before>..<sha-after>`
**Screenshots:** `game/test-results/<sprint-id>/`

## Checkpoints captured

| # | Screenshot | State observation |
|---|---|---|
| 01 | comfort-panel.png | <what's on screen; is it correct?> |
| 02 | boot-screen.png | <…> |
| 03 | hud-fresh.png | <…> |
| 04 | module-confirm.png / module-installed.png | <…> |
| 05 | directive-NN.png | <…> |
| 06 | choice-selected-NN.png | <…> |
| 07 | result-NN.png | <…> |
| 08 | echo-toast-NN.png | <…> |
| 09 | consequence-NN.png | <…> |
| 10 | terminal-state.png | <how far did we get?> |
| 11 | end-of-content.png (if present) | <did overlay fire?> |

## Mockup parity

Compare each captured HUD panel against `HUD Mockup.png`. List every
visible delta — colors, typography, layout, missing panels, spacing.

- [ ] Left column — Priority Tasks panel: <status vs mockup>
- [ ] Left column — Financial Overview panel: <…>
- [ ] Left column — Human Impact panel: <…>
- [ ] Left column — Inner Chorus panel: <…>
- [ ] Center — Directive card: <…>
- [ ] Center — Choice card (8 fields): <…>
- [ ] Right rail — Silas portrait: <…>
- [ ] Right rail — Quarter goal: <…>
- [ ] Right rail — Recent communications: <…>
- [ ] Right rail — Inspection risk: <…>
- [ ] Bottom — Ledgers, donut chart, System Status: <…>
- [ ] Bottom — Alert crawler: <…>

## Spec adherence

Cross-reference vs. the build spec:

- **§Awakening (line 92, 140):** Does the HUD read as "AI coming online"?
- **§Stage 1 discipline (line 1189):** Any scope creep into Stage 2 territory?
- **§Character silence pillar:** Is silence load-bearing this sprint?
- **§Trace ledger pillar:** Are §11 traceability fields intact on
  ConsequenceReturnPanel?

## Regressions

Anything worse than the previous sprint. Reference the prior report.

## Carry-ins for next sprint

Concrete items to fix. Should feed the next sprint's task list.

- [ ] <specific fix, with file path>
- [ ] <…>

## Ship-gate signal check

Would this build earn ≥10 unsolicited comments about trace ledger or
character silence? (Ship-gate §17.)

**Answer:** <YES / NO — with one line why>
````

## Filing convention

- One file per sprint. Never merge sprints into one report.
- Sprint id matches the plan's sprint id (`A4`, `B5`, `C3`, etc.) plus
  a slug: `a4-human-impact-panel.md`.
- Do not delete old reports — they show progression.
- Screenshots in `test-results/` are gitignored; the report should
  quote key observations in prose so the report stands alone.
