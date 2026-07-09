# E2 — Panel emergence choreography (sprint-end analysis)

**Sprint:** E2 (Track E — diegetic HUD-comes-online tutorial)
**Commit:** `f558104 feat(e2): panel emergence choreography — progressive HUD reveal`
**Capture:** `game/test-results/e2/*.png` (10 checkpoints)
**Trinity:** `tsc -b` green · `oxlint` green (pre-existing vite.config warning only) · `vitest run` 625/625 green

---

## What shipped

- Every A-track panel now consults `usePanelState(PanelId)` and self-gates on disclosure + maturity.
- Maturity stages clip content:
  - **Priority Tasks** — 1 = active row only, 2 = three rows, 3 = full roster
  - **Financial Overview** — 1 = Actual Cash only, 2 = + Runway, 3 = all six KPIs
  - **Human Impact** — 1 = Welfare only, 2 = + Approval, 3 = all four rows
  - **Inner Chorus** — 1 = Silas only, 2 = + one module, 3 = full roster
- `Layout.tsx` calls `noteUsage(id)` per panel inside `handleChoiceCommit` so directive resolution both discloses (first-touch) and advances the maturity ramp.
- New `matureAllPanels()` test helper flips every `PanelId` disclosed + `useCount=6` so panel unit tests keep asserting mature markup without duplicating a disclosure preamble per file.

## Mockup-parity findings

**Working as intended:**
- `03-hud-fresh.png` — cold-boot left column is dark (only DIRECTIVE surfaced by awakening sequence). This is the HUD-comes-online pillar landing correctly.
- `07-result-01.png` — after the first choice commit, all four A-panels emerge at Stage 1 with the plan-specified minimum content.
- Silas portrait renders in the right rail via the placeholder registry (initials `SV` on the accent-ringed silhouette) — real WebP can drop in later with zero code change.

**Deltas from `HUD Mockup.png`:**
- Legacy STATUS block (CAPITAL / HUMAN WELFARE / OWNER CONTROL meter bars) still renders below the new A-panels. Should be retired once the new panels are load-bearing.
- Panels currently use plain-Tailwind chrome; V5 (typography, tokens, borders, donut) still owed.
- No maturity-transition motion yet — panels blink in / rows blink in. Deferred to V-track polish.

## Spec-adherence findings

- E1 disclosure state machine untouched — E2 rides on top of the existing `disclosedPanels` / `panelUseCount` slice.
- `noteUsage` fires exactly once per panel per choice commit — no double-bump risk because dispatch happens inside the same `handleChoiceCommit` transaction.
- Panel unit tests (129 total) all render mature markup via the shared helper; E2/disclosure choreography still owns its own dedicated tests under `tests/systems/` and `tests/state/`.

## Regressions

- None. Full suite 625/625.
- No perf-baseline concerns: panels short-circuit on `!disclosed` (returns `null`) so undisclosed panels cost one hook read + one comparison — cheaper than pre-E2 unconditional render.

## Carry-ins to E3

1. E3 (Silas narrates HUD emergence diegetically) — thread one-line acknowledgments into `awakeningSequence.ts` and per-maturity bumps in `Layout.tsx`.
2. V5 (chrome + typography + tokens) — will visually finish what E2 structurally exposed.
3. Follow-up: remove legacy STATUS meter bars once the new panels are canonical.
