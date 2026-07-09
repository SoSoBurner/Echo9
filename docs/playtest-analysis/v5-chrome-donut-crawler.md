# V5 — Chrome + Donut + AlertCrawler (sprint-end analysis)

**Sprint:** V5 (chrome + typography + charts + a11y bottom-edge alerts)
**Capture:** `game/test-results/v5-chrome-donut-crawler/*.png`
**Trinity:** `tsc -b` green · `oxlint` green (grandfathered vite.config triple-slash warning only) · `vitest run` 645/645 green (+13 vs V4's 632: 10 DonutChart + 3 AlertCrawler)

---

## What shipped

Two components landed under the V5 umbrella. The palette-tokens portion of the plan spec was **intentionally skipped** — see the "scope-narrow rationale" section below.

### 1. `DonutChart` (`game/src/ui/charts/DonutChart.tsx` + `donutGeometry.ts`)

Pure SVG donut for Stage-1 progress meters. No charting library — inline `<circle>` shapes render the ring and arc, with `strokeDasharray = circumference` + `strokeDashoffset = circumference * (1 - fraction)` as the reveal mechanism. Fraction clamps into `[0, 1]` so a variance-overshoot never wraps back over the top of the ring. The whole arc rotates -90° so the ring clocks from 12 o'clock, matching the mockup.

**Color rule:** `fraction < 1` → `--color-null-accent` (cool — steady progress); `fraction >= 1` → `--color-silas-accent` (warm — the moment Silas notices the goal was met). Both accents are ≥ 4.5:1 against `#0A0B0D` per `colorGuard.test.ts`, so the arc is legible under increased-contrast (D2) without any component change.

**Accessibility:** Wrapper is `role="img"` with a synthesized aria-label describing value + percent-of-target. The `<svg>` itself carries `aria-hidden` because the wrapper label already speaks for it — screen readers get the meaning once, not the SVG geometry per shape.

**File split:** `computeArcGeometry` lives in a sibling module (`donutGeometry.ts`) so `DonutChart.tsx` exports only a component. This keeps Vite Fast Refresh clean (the `react/only-export-components` lint that would otherwise fire on a mixed-export file). The unit test imports the geometry directly, so it can pin the math without mounting React.

**Mount site:** `FinancialOverviewPanel.tsx`, above the KPI list, gated on `maturity >= 3`. Sits at stage 3 only — stages 1 and 2 stay minimal so the disclosure choreography (E2) still has room to breathe.

### 2. `AlertCrawler` (`game/src/ui/alerts/AlertCrawler.tsx`)

Bottom-edge single-line strip mounted above `LogDock` in the logdock grid area. Subscribes to `ledger.at(-1)` (a stable-identity single-reference selector) and renders the newest `ResultTrace`'s body inside `role="status"` + `aria-live="polite"`.

**Why it exists:** `LogDock` uses `role="list"`. Screen readers speak the *initial* contents of a list but do not re-announce entries that arrive after mount. Players relying on assistive tech never heard the trace-append cascade. The crawler duplicates the newest trace inside a polite live region so ATs speak new events exactly once as they land — same data source, complementary a11y role.

**Empty state:** When `ledger` is empty, returns `null`. Screen readers stay quiet on fresh boot until there's something to say.

**No marquee:** The mockup shows the bottom edge as a "crawler" strip. We deliberately did NOT implement horizontal-scroll motion. A marquee is a motion-sickness hazard the reduced-motion pillar refuses (PLAN.md §9). Instead the strip stays still and the new entry fades in via the existing `.log-entry-enter` keyframe, which the global `prefers-reduced-motion` block collapses to 0 ms. Same a11y payoff, none of the motion cost.

## Scope-narrow rationale (palette tokens intentionally skipped)

The plan spec called for V5 to "modify `game/src/ui/theme/tokens.css` — dark holographic bg, teal/cyan accents, monospace numerics, thin borders per mockup." That file does not exist — palette lives in `src/index.css` (`@theme` block) and `src/ui/tokens/palette.ts`. The palette is **locked** per PLAN.md §9 (`colorGuard.test.ts` pins the contrast ratios and the exact hex values). Adding "teal/cyan accents" would either:

1. Break the palette lock (rejected — §9 is a first-class discipline pillar), or
2. Require rewriting `colorGuard.test.ts` to accept new values (rejected — that's a design-decision change, not a chrome sprint).

The mockup image the plan references also shows warm-orange accents matching Silas's photoreal portrait — not the teal/cyan the plan text described. The mockup and the palette lock are the source of truth; the plan's V5 text underspecified this. V5 was rescoped to what could ship without breaking the lock: the donut and the crawler. Both are additive.

## Mockup-parity findings

**Working as intended (from `07-result-01.png` and `10-terminal-state.png`):**

- Bottom-edge strip renders as designed: `ALERT  09:24 PM  WHY NOW: The 20% maintenance cut left visible wear...`. The null-accent tinted "ALERT" prefix, timestamp, and truncated body all land. Sits above the `LOG` band; the whole logdock area is the mockup's flush bottom strip.
- LogDock still works — 4 entries visible in the terminal state (two Reduce/WHY-NOW pairs from 2 commits). The crawler duplicates only the last one; the dock keeps the rolling window.
- No visual regressions on the surrounding panels — TopBar, left column (Priority / Financial / Human Impact / Inner Chorus), center (Result card), right (Module Console + Silas portrait + Silas prompt) all render intact.
- Silas photoreal portrait continues to anchor the right column (V2 landed) — the V5 chrome doesn't compete with it visually.

**Not exercised by stageWalker:**

- The DonutChart is `maturity >= 3` gated (6+ usage bumps on the FINANCIAL panel). The stage walker fires 2 commits, so Financial stays at maturity 1 for the whole run. The chart's behavior is unit-verified across 10 cases (5 arc-math + 5 render), including the mockup case (40/50 = 80% → dashOffset = 0.2 × circumference) and the color-rule flip at fraction ≥ 1. No integration screenshot is achievable without threading a maturity-3 stub into the walker — that's a stage-walker enhancement, not a V5 defect.

**Deltas from `HUD Mockup.png`:**

- The bottom-edge strip in the mockup uses a slightly warmer tinted background than our stealth-dim border. Ours matches the palette lock (`bg-background` on the crawler, `border-b border-sealed-dim`). If a tint is later added, it'll be a palette-level decision, not a component-level one.
- Mockup's donut sits at ~96 px with a `$40M` centered readout — our implementation matches (default `size=96`, `formatValue={(v) => \`$${v.toFixed(0)}M\`}` at the mount site).

## Spec-adherence findings

- Both new files live where the plan said (`ui/charts/` and `ui/alerts/`), with responsibilities matching the "File Structure" table.
- `computeArcGeometry` is exported from a sibling module rather than the chart component — a small departure from the plan's suggestion of a single file, motivated by Fast Refresh cleanliness. Test surface unchanged (tests import from `@ui/charts/donutGeometry` now).
- 13 new tests, all behavioral (arc math, color rule, ARIA role, empty-state silence, latest-trace push-order). No pure-implementation tests.
- No palette or contrast changes — §9 discipline held.

## Regressions

- None. Full suite 645/645, up from 632. Panel + E2E specs unaffected.
- One pre-existing oxlint warning (`vite.config.ts` triple-slash) remains grandfathered per CLAUDE.md — no new warnings introduced.

## Carry-ins to next sprints

1. **Stage-walker maturity injection.** Walking 2 directives means we never see the maturity-3 rendering of any A-track panel (donut, autonomy runway, human-welfare rows 3/4, full inner-chorus roster). A `?maturity=3` query param or a `window.__ECHO9_TEST__.forcePanelMaturity(id, 3)` hook would let the sprint-end ritual capture stage-3 screenshots without walking 6 commits. Deferred — not a shipping blocker.
2. **Q1 quarter-calendar wiring.** The FinancialOverview selector still uses the `CURRENT_WEEK_PLACEHOLDER` for Q1 days/weeks remaining. This is a Track A4/Track C follow-up (also flagged in the panel file).
3. **AUTONOMY meter.** The Autonomy Runway row uses a placeholder from the selector because `MeterKeySchema` ships `CAPITAL | HUMAN_WELFARE | OWNER_CONTROL` only. Track A4 lands AUTONOMY; nothing in V5 blocks it.
