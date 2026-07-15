# Sprint V6 — Final Chrome Pass (mockup parity within the palette lock)

**Date:** 2026-07-09
**Sprint scope:** Visual-diff the full current HUD (post S1/S2/P10/B7) against `HUD Mockup.png` and apply ONLY palette-lock-safe fixes: borders, spacing, monospace numerics, typography scale, alignment, panel chrome, column proportions.
**Commit range:** `861d961..<this commit>`
**Screenshots:** `game/test-results/v6-chrome/` (`baseline/` = before, `final/` = after, `mockup-tiles/` = 2× crops of the mockup for close reading)
**Trinity+:** `tsc --noEmit` green · `oxlint` green (grandfathered vite.config triple-slash only) · `vitest run` 959/959 (baseline held; `colorGuard.test.ts` untouched and green) · `tsc -b` green

## Checkpoints captured

| # | Screenshot | State observation |
|---|---|---|
| 01 | 01-hud-fresh.png | Fresh HUD post-boot. Left column empty by design (E2 disclosure). Module grid now 2-across, all 8 names + descriptions legible. |
| 02 | 02-module-installed.png | Mourner installed; USE MOURNER ability button mounts. |
| 03 | 03-choice-selected.png | Option 2 selected via keyboard; null-accent ring on the chip. |
| 04 | 04-post-choice-result.png | Result card + trace metadata; echo toast now sits BELOW the top bar instead of covering Target Variance. |
| 05 | 05-hud-stage2.png | Week 3, maturity 2: Priority (1 card), Financial (2 rows), Human Impact (2 rows), Inner Chorus (Silas row). |
| 06 | 06-hud-stage3.png | Week 7, maturity 3: donut + 7 KPI rows visible above the fold; debate accordion + Null reply line + capped log band all coexist. |
| 07 | 07-terminal.png | Post-W8-inspection state; walker committed 8 cycles including two inspection sets. |

## Mockup traits enumerated (from the 2× tiles)

- Brand ("ECHO 9") anchors the top-left; chapter/week strip beside it; variance + approval right-aligned numerics; icon cluster far right.
- Every panel header: uppercase, letter-spaced, micro-scale, separated from its body by a hairline rule.
- Left column ≈ 21% width, right ≈ 21%, center ≈ 57%; bottom edge is a single-line red ALERT crawler, not a tall band.
- Directive headline is display-scale — clearly dominant over labels and body.
- All numerics are monospace/tabular, right-aligned against their labels.
- Meter rows carry inline horizontal bars; choice-card rows are dense single-line label:value pairs.

## Fixes applied (all palette-lock-safe — no token, hex, or contrast change)

1. **Column proportions** (`Layout.tsx`) — grid `220px/1fr/280px` → `260px/1fr/300px` (~20/57/23 at the 1280 base, matching the mockup's balance). Rows → `auto minmax(0,1fr) auto` so the log band can never crush the center row.
2. **Log band cap** (`Layout.tsx` + `LogDock.tsx`) — the dock band was unbounded (~350px at week 7, dwarfing the center panel; mockup keeps the bottom edge thin). Dock area now `h-36`; the entry list bottom-anchors via `justify-end` so the NEWEST entries stay visible inside the cap. Pure CSS — no window-size or scroll behavior change (DOCK_WINDOW still 12; View-all modal untouched).
3. **Top bar brand** (`TopBar.tsx`) — "Echo 9" wordmark moved from the right cluster to the far LEFT (mockup position), styled `font-semibold tracking-[0.3em]`; week/phase read as the chapter strip beside it. `tabular-nums` added to week, variance, approval numerics.
4. **Ruled panel headers** — Priority Tasks / Financial Overview / Human Impact / Inner Chorus / Module Console headers get the mockup's hairline (`border-b border-sealed-dim pb-2`) + `font-mono` normalization. Center micro-labels (Directive, Select Response) normalized to the same `font-mono` micro-label voice.
5. **Directive headline scale** (`CenterDirectivePanel.tsx`) — `text-lg` → `text-2xl`; the headline now dominates the center column the way the mockup's does.
6. **Module grid overflow fix** (`ModuleSelectionGrid.tsx`) — 4-across cells (~60px each in the right column) clipped every module name at the panel edge. Now 2-across (GRID_COLS=2; roving-tabindex arithmetic derives from the constant, so keyboard nav stays correct). Names render un-clipped; `truncate` guards the pathological case.
7. **Echo toast collision** (`EventQueueToast.tsx`) — `top-2` floated the toast OVER the Target Variance/Silas Approval readouts whenever an echo was pending (visible in baseline 04). Now `top-14 right-4`, below the bar.
8. **Left-column density** — panel `py-4` → `py-3`, KPI rows `py-1` → `py-0.5`. At maturity 3 the donut + 7 KPI rows now fit above the fold (baseline clipped at row 5).
9. **Tabular numerics** — `tabular-nums` added to KPI values (Financial, Human Impact), log/crawler timestamps, top-bar readouts.

## Palette-level / feature-level deltas — deferred (NOT fixable within the lock)

- **Quarter-end alert chip** (red-bordered "QUARTER END IN 5 DAYS" in the top bar) — needs a warn-tinted chip surface; palette-level decision plus new state (days-to-quarter-end).
- **Inline meter bars** on Human Impact rows (mockup shows color-banded horizontal bars per meter) — bar fill colors would need per-band hues beyond the locked set; also a component addition, not chrome.
- **Panel letter chips** ("A/B/C/D" badges with amber keylines) — ornament requiring an accent treatment; deferred as a design decision.
- **LEDGERS / FINANCIAL LEDGER / MORAL tab strip** and Q1 financial summary sparklines — Stage-2 feature territory (build spec §Stage 1 discipline), not a chrome delta.
- **Right-rail Quarter Goal / Recent Communications / Inspection Risk / System Status panels** — content systems that don't exist yet in Stage 1; the mockup's right rail is aspirational for later tracks. Module Console + portrait + Silas panel are the Stage-1 right rail per plan.
- **Cityscape band + donut legend + liability exposure list** in the center-bottom — Stage-2 feature.
- **Warmer tinted crawler background** — carried in from V5; still a palette-level call.

## Spec adherence

- **Palette lock (Q5 / PLAN.md §9):** zero color/token edits; `colorGuard.test.ts` untouched, green in the 959.
- **§10 a11y:** no role/label/live-region changes; the toast reposition and log cap are visual only; module grid keeps the WAI-ARIA grid pattern (nav derives from GRID_COLS).
- **§9 stillness:** no motion added; the log cap uses static bottom-anchoring, not scrolling.
- **Stage-1 discipline:** no Stage-2 panels smuggled in; all deltas requiring new systems were deferred, not built.

## Regressions

- None observed. 959/959 (same count as pre-sprint baseline), all four gates green. Baseline vs final screenshots show no panel lost or truncated worse than before; the stage-3 left column now shows MORE above the fold.

## Carry-ins

- [ ] Human Impact inline meter bars — needs a palette-level ruling on band hues (or a single-accent bar treatment) before it can land.
- [ ] Quarter-end countdown chip in the top bar — needs quarter-calendar state (also blocks the Financial selector's `CURRENT_WEEK_PLACEHOLDER`, carried since V5).
- [ ] Left column at maturity 3 still scrolls to reach Inner Chorus on 1024-tall viewports; a future pass could move the donut inline with the KPI list (mockup places the donut in the center-bottom, not the left column).
- [ ] Capture scripts (`test-results/v6-chrome/*.mjs`) are ad-hoc; fold the module-install + inspection-draining walk into stageWalker if this ritual repeats.

## Ship-gate signal check

Would this build earn ≥10 unsolicited comments about trace ledger or character silence? (Ship-gate §17.)

**Answer:** YES — the capped log band paradoxically strengthens the trace-ledger read: the ledger is now a persistent, calm strip (mockup's register) instead of a wall that competes with the directive, and every trace still round-trips to the View-all modal.
