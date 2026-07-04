# Sprint A4 — Playtest Analysis

**Date:** 2026-07-04
**Sprint scope:** Land `HumanImpactPanel` as the third left-column HUD panel — four KPI rows (Human Welfare, Silas Approval, Consequences Traced, Owner Control) driven by real state, following the A3 pure-selector pattern.
**Commit range:** `6c186dd..HEAD` (Track ∞ baseline → A4)
**Screenshots:** `game/test-results/a4-human-impact/`

## Checkpoints captured

| # | Screenshot | State observation |
|---|---|---|
| 01 | comfort-panel.png | Comfort/accessibility landing screen renders cleanly at fresh boot. Continue button visible. |
| 02 | boot-screen.png | "Initialize Command Interface" button visible; awakening tone not yet layered on (Track E). |
| 03 | hud-fresh.png | Post-boot HUD: PriorityTasks (3 rows) + FinancialOverview (5 visible rows: Q1 TARGET $50M, ACTUAL $0M, VARIANCE -$50M, AUTONOMY RUNWAY 20wk, Q1 DAYS REMAINING). HumanImpact panel is mounted but sits below the left column's fold. Center directive card = Mercy Margin. Right column has MODULE CONSOLE grid + SILAS VALE line. |
| 04 | module-confirm.png / module-installed.png | Mourner module install path works. After install: right console collapses to a "USE MOURNER" button. Silas line advances. |
| 05 | directive-01.png / directive-02.png | Two directive cycles captured. The walker's identity guard stops the loop after mercyMargin re-shows (Q1 content is still just this one directive). |
| 06 | choice-selected-01/02.png | Choice `2` (Reduce by 20%) highlighted correctly. Choice-card visual style matches the current stub aesthetic (no V5 polish yet). |
| 07 | result-01/02.png | RESULT card renders with task-id / choice-id / timestamp — traceability spine intact. |
| 08 | echo-toast-01/02.png | Echo-pending toast fires; walker drains via `c`. |
| 09 | consequence-01/02.png | ConsequenceReturnPanel opens; §11 fields present. |
| 10 | terminal-state.png | RESULT card is last visible state; LogDock shows 4 ledger rows (2 chorus lines × 2 cycles). |
| 11 | end-of-content.png | Not captured — Q1 has only one directive, so the walker's identity guard fires before end-of-content overlay can trigger. Expected once Track C fills weeks 2-12. |

## Mockup parity

Compared 03-hud-fresh + 10-terminal-state against `HUD Mockup.png`.

- [x] Left column — Priority Tasks panel: **PRESENT** (Task A2 stub, 3 rows visible).
- [x] Left column — Financial Overview panel: **PRESENT** (Task A3, 6 rows but only 5 fit in the visible viewport at 1280×720; scroll required).
- [x] Left column — **Human Impact panel: PRESENT (A4 landed)**, but sits BELOW the fold at 1280×720. The `overflow-y-auto` on the left grid area allows it to be reached via scroll — but the mockup shows all four panels visible without scroll. **Carry-in: V5 needs to tighten row padding OR reduce Priority Tasks stub height so the four A-track panels fit vertically.**
- [ ] Left column — Inner Chorus panel: **MISSING** (A5, next sprint).
- [~] Center — Directive card: renders with heading + humanMessage + choices list. Missing mockup's visual chrome (panel border, chip styles). V-track.
- [~] Center — Choice card (8 fields): Currently 3 fields visible (label + meter deltas). Missing Silas prep line, echo hint, cost callout. C-track (choice authoring) + V5 (visual chrome).
- [ ] Right rail — Silas portrait: not present (V2).
- [ ] Right rail — Quarter goal: partially present in TopBar (TARGET VARIANCE reading); mockup has dedicated Quarter Goal box.
- [ ] Right rail — Recent communications: not present (Track later).
- [ ] Right rail — Inspection risk: not present (B6).
- [ ] Bottom — Ledgers, donut chart, System Status: LogDock present, donut/SystemStatus missing (V5).
- [ ] Bottom — Alert crawler: not present (V5).

## Spec adherence

Cross-referenced vs. `Echo9_LLM_Code_Writer_Build_Spec_v1_4.md`:

- **§Awakening (line 92, 140):** HUD does not yet read as "AI coming online" — panels appear fully formed. Track E1-E3 owns this. A4 does not regress this axis.
- **§Stage 1 discipline (line 1189):** No scope creep. Selector uses only the three real meters (CAPITAL / HUMAN_WELFARE / OWNER_CONTROL) + real state (silasApproval, ledger.length). No fictional 4-facet decomposition. Pivots (40 for Silas + Owner Control) mirror PLAN.md §7's inspection threshold.
- **§Character silence pillar:** Not exercised by A4 (no dialog changes).
- **§Trace ledger pillar:** Actively surfaced — "Consequences Traced" KPI row makes the ledger.length a first-class HUD field. This is the ship-gate §17 signal materialising in the HUD: a player who fires one choice sees the row flip red→green. **This is a Kleenex-signal-quality change.**

## Regressions

None. All 446 pre-existing tests still pass. TypeScript + oxlint green.

Layout note: the panel below the fold is a *pre-existing* layout limitation of the left column at 1280×720 — Financial Overview also loses rows to scroll. A4 makes it slightly more visible because there is one more panel competing for vertical space. Not a regression, but the carry-in below elevates it.

## Carry-ins for next sprint

- [ ] **A5 (next):** InnerChorusPanel + `innerChorusVoices.ts` selector. Same pattern.
- [ ] **V5 layout compression:** left column `padding y-4` per panel × 4 panels ≈ 128px of chrome overhead. Tighten to `py-2` or fold panel labels into the first row so all four fit at 1280×720 without scroll. File: `game/src/ui/humanImpact/HumanImpactPanel.tsx:79` (and the three sibling panels).
- [ ] **A5 pattern reuse:** InnerChorus should reuse the tone-pivot idiom from `humanImpactKpis.ts:33-45` — the "positive-at-or-above-pivot" idiom is the emerging left-column KPI vocabulary.
- [ ] **Q1 content sparsity (Track C):** stageWalker's identity guard fires after 2 iterations because only mercyMargin exists. This will resolve naturally as C2-C13 fill in.

## Ship-gate signal check

Would this build earn ≥10 unsolicited comments about trace ledger or character silence? (Ship-gate §17.)

**Answer:** NO, not yet — but "Consequences Traced" is the first HUD element that makes the trace ledger a *live number that changes as you play*. Before A4 the ledger existed only in the LogDock. After A4 the player sees a KPI row flip red→green the moment they commit their first choice. That's the trace-ledger pillar getting a public-facing surface. Two more moves — (V2 Silas portrait so silence has a face; B5 module effects so the KPI row visibly moves when abilities fire) — and this axis has a genuine chance at ship-gate §17.
