# Sprint A5 — Playtest Analysis

**Date:** 2026-07-04
**Sprint scope:** Land `InnerChorusPanel` as the fourth left-column HUD panel — voice roster (Silas + installed modules), tone-driven visual weight, portrait slots keyed for V4 WebP drop-in.
**Commit range:** `85e16f9..HEAD` (A4 → A5)
**Screenshots:** `game/test-results/a5-inner-chorus/`

## Checkpoints captured

| # | Screenshot | State observation |
|---|---|---|
| 01 | comfort-panel.png | Landing screen unchanged from A4. |
| 02 | boot-screen.png | Initialize button visible. |
| 03 | hud-fresh.png | Fresh HUD: PriorityTasks + FinancialOverview visible in left column. HumanImpact + InnerChorus mounted but below fold at 1280×720. |
| 04 | module-confirm.png / module-installed.png | MOURNER install path works. Right console collapses to "USE MOURNER". Silas advances his line from "Ma..." → "Margins, Echo. Ea...". The InnerChorus panel is where the second row (MOURNER) would materialize, but the left column scroll container hides it. |
| 05 | directive-01.png / directive-02.png | Two directive cycles, then walker's identity guard fires. |
| 06 | choice-selected-01/02.png | Choice `2` (Reduce by 20%) highlighted. |
| 07 | result-01/02.png | RESULT card renders with §11 fields. |
| 08 | echo-toast-01/02.png | Echo-pending toast fires. |
| 09 | consequence-01/02.png | ConsequenceReturnPanel opens. |
| 10 | terminal-state.png | RESULT card visible; LogDock shows 4 ledger rows. |
| 11 | end-of-content.png | Not captured — Q1 content still sparse; identity guard fires first. |

## Mockup parity

- [x] Left column — Priority Tasks panel: PRESENT (A2 stub).
- [x] Left column — Financial Overview panel: PRESENT (A3, 6 rows).
- [x] Left column — Human Impact panel: **PRESENT below fold** (A4).
- [x] Left column — **Inner Chorus panel: PRESENT below fold** (A5 landed). Fresh boot: 1 row (Silas). After MOURNER install: 2 rows (Silas + Mourner). Tests confirm rank promotion flips `data-tone="dominant"`.
- [~] Center — Directive card: same as A4 baseline.
- [~] Center — Choice card: same as A4 baseline.
- [ ] Right rail — Silas portrait: not present. **A5 emits `portraitId: "silas"` so V2's WebP will drop into the InnerChorus row's `<div data-portrait-id="silas">` slot without a component change.**
- [ ] Right rail — Quarter goal / Recent communications / Inspection risk: not present.
- [ ] Bottom — Ledgers/donut/System Status/Alert crawler: LogDock only.

## Spec adherence

- **§Awakening (line 92, 140):** Inner Chorus renders fully-formed voices from turn 1; Track E1-E3 will handle the "voices don't exist yet" awakening state.
- **§Stage 1 discipline (line 1189):** No creep. The selector uses only real state — `silasApproval` (silasSlice) and `installedModules` (modulesSlice) — plus the frozen `MODULE_ROSTER`. No fictional rapport meter per module. Placeholder discipline: `currentLine` derived from `silasFraming` truncated at 60 chars so the row is never blank pre-content-authoring.
- **§Character silence pillar:** The chorus HAS a face now — Silas is always in row 0. When Track V2 lands the portrait, silence gets a physical presence in the HUD instead of a floating quote in the right column.
- **§Trace ledger pillar:** Not exercised by A5.

## Regressions

None. 465 tests pass. tsc + oxlint clean.

Layout: same below-fold issue as A4 — the four left-column panels don't fit at 1280×720 without scroll. Carrying the same V5 padding-compression carry-in forward.

## Carry-ins for next sprint

- [ ] **B5 (next):** Real ability effects (24 stubs → real deltas). Ties the Inner Chorus voices to a payoff — installing modules with rank promotion visibly moves the Human Impact KPI rows.
- [ ] **V5 layout compression (unchanged from A4):** the four left panels now sum to ~700-800px at their current padding; the left column's viewport is ~600px after TopBar + LogDock. Files: `HumanImpactPanel.tsx:79`, `InnerChorusPanel.tsx:63`, `FinancialOverviewPanel.tsx:111`, `PriorityTasksPanel.tsx`.
- [ ] **V2 portrait drop-in:** `data-portrait-id="silas"` slot exists on `InnerChorusPanel.tsx:47`. When Silas WebP lands at `game/src/assets/portraits/silas.webp`, add a `background-image` CSS rule keyed on the attribute — no component refactor needed.
- [ ] **V4 module portrait drop-in:** `data-portrait-id="module-<lowered-id>"` slots exist. Same drop-in pattern.

## Ship-gate signal check

Would this build earn ≥10 unsolicited comments about trace ledger or character silence?

**Answer:** NO — but A5 is the character-silence spine's first HUD anchor. Before A5, "silence" was just the SilasPromptPanel's typed-out lines in the right column. After A5, Silas is a *permanent row* in a chorus that grows with installed modules — the player sees his approval tone deepen (nascent → established → dominant) as they earn it. Track V2's Silas portrait + Track B5's real ability effects will make this row do meaningful visible work; A5 established the scaffold.
