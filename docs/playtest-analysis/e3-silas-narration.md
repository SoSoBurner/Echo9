# E3 — Silas narrates HUD panel emergence diegetically (sprint-end analysis)

**Sprint:** E3 (Track E — diegetic HUD-comes-online tutorial)
**Capture:** `game/test-results/e3/*.png`
**Trinity:** `tsc -b` green · `oxlint` green (pre-existing vite.config triple-slash warning only) · `vitest run` 632/632 green (+7 new E3 selector tests)

---

## What shipped

- New content module `game/src/content/silasPrompts/tutorialAwakening.ts` with 15 Silas lines: 5 disclose lines (one per E2-gated panel — DIRECTIVE, PRIORITY_TASKS, FINANCIAL, HUMAN_IMPACT, INNER_CHORUS) and 10 maturity lines (each of those 5 at stages 2 and 3).
- `pickSilasTutorialLine(disclosedPanels, panelUseCount)` — deterministic picker. Iterates stages 3 → 2 → 1 (disclose). Within each stage, walks `PANEL_IDS` in reverse so the most-recently-disclosed panel wins on ties. Falls through to `null` when no disclosed panel has a line, letting Silas resting-state to `'Listening.'`.
- `selectInnerChorusVoices` gained two OPTIONAL inputs (`disclosedPanels`, `panelUseCount`) and threads them through the picker to derive Silas's `currentLine` at render time. Optionality keeps every A5-era test fixture flowing without changes.
- `InnerChorusPanel.tsx` subscribes to `disclosedPanels` + `panelUseCount` via narrow Zustand selectors and passes them to the selector.
- `silasLint.test.ts` now imports `TUTORIAL_AWAKENING_PROMPTS` so every one of the 15 lines is enforced under the §10 owner-voice rules (≤4 sentences, one operational detail, no MBA-abstractions).
- 7 new derivation tests in `innerChorusVoices.test.ts` cover: cold-boot fallback, DIRECTIVE disclose, INNER_CHORUS disclose priority under mixed disclosure, stage-2 promotion at 3 uses, stage-3 promotion at 6 uses, stage-precedence-over-recency, and the reverse-walk tiebreak.

## Mockup-parity findings

**Working as intended:**
- `03-hud-fresh.png` — cold boot with only DIRECTIVE disclosed. Left column is dark (correct — the awakening sequence has not yet revealed the A-panels). Silas's right-column teletype is the directive prompt, not the tutorial line.
- `07-result-01.png` — after first choice commit, all four A-panels emerge at Stage 1 as designed. The INNER CHORUS row now reads "The chorus is here, Echo — every voice you file, I read too." (truncated in the screenshot; see below). This is the E3 pattern landing: the panel that most recently entered the roster gets Silas's voice.
- Right-column `SilasPromptPanel` continues to drive the directive teletype independently. The two Silas surfaces (left = ambient roster, right = directive) stay cleanly separated — no competition for the same text slot.

**Deltas from `HUD Mockup.png`:**
- Silas's ambient line is CSS-truncated in the narrow left column (A5-era `truncate` class on the row text). Meaningful content ("every voice you file, I read too") is cut. This is a V-track polish concern; the full line reaches AT users via `role="listitem"`. Options for V5: widen the left column, wrap the line, or scroll on hover.
- No maturity-transition motion — Silas's line pops rather than crossfades. Deferred to V-track motion polish.

## Spec-adherence findings

- §10 voice rules honored: all 15 lines carry an operational detail (named entities Echo/Lenora/Maya/Capital/Welfare or digits 3/6, or concrete verbs `reduce`/`defer`/`file`/`audit`), none carry a forbidden MBA-abstraction, all are ≤4 sentences. Enforced by the extended `silasLint.test.ts`.
- Fourth-wall unbroken: no reference to "HUD," "panel," or "stage" — Silas speaks about the work each surface represents ("Directive is on…", "Your queue is showing…", "Capital is on the board…").
- Determinism: the picker is a pure `(state) → line` function. Re-renders never flicker Silas's line because there is no event queue and no random choice.
- Selector purity kept — `selectInnerChorusVoices` remains `(input) => voices`; no `useMemo` needed at the panel because the picker is O(panels × stages) with 5 disclosed panels × 3 stages worst case.

## Regressions

- None. Full suite 632/632 (was 625; +7 new E3 tests).
- No perf-baseline concerns: the picker is a small deterministic scan over at most 5 disclosed panels and 3 stages. InnerChorusPanel's narrow subscriptions (both driven by immer producers) do not spuriously re-render.

## Carry-ins to next sprints

1. **V5 (chrome + typography + tokens)** — decide the treatment for long Silas lines in the narrow left column. Wrap vs. widen vs. hover-scroll is a visual design call.
2. **E4-ish follow-up (not on the plan today but flagged)** — the "Directive is on, Echo — read it, pick one, file the reason." disclose line is currently overridden by higher-stage lines from other panels the moment their use counts climb. For deeper Q1 arcs (Week 6+), the DIRECTIVE stage-2 and stage-3 lines will resurface as the walker earns 3+ uses on DIRECTIVE. If we want a directive-anchored "first line ever" moment, that's a separate one-shot slot in the awakening sequence itself. Not in scope here.
3. **C2+** — as Q1 content fills in, the walker's screenshot cadence will show more variety in which panel wins Silas's voice. Watch the disclosure order and use counts to confirm the reverse-walk tiebreak still feels right (i.e., that Silas seems to comment on the panel the player just used, not one they used ten choices ago).
