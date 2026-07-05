# Full Playtest — post-C15

**Date:** 2026-07-05
**Sprint under test:** C15 (Q1 week cursor + inspection dispatch)
**Suites:**
- Headless: 514 unit + 11/12 e2e (`bqzv2xf4a.output`)
- Headed: `fullPlaytest.spec.ts` — 38 captured checkpoints in `game/test-results/full-playtest/`

## What was tested

- Comfort panel → BootScreen → HUD emergence → module install → 12 directive commits → 3 inspection dispatches (W4/W8/W12) → EoC probe.
- Playwright headed walker chose middle-slot (keybind `2`) for every directive; W4 pre-seeded to OC=20 to force `nextOC<40` inspection dispatch.
- State + beats dumps per checkpoint. Terminal state: 12 flags set, ledger length 24, meters CAP=-2, HW=-1, OC=15.

## Overall verdict

The Stage-1 vertical slice **plays end-to-end and produces the trace-ledger signature the ship-gate demands** (24 entries across 12 weeks + inspections, with narrative continuity across characters — Lenora, Rasha, Dhruv, Silas, Maya). Signal loop works. But the shell that carries the signal has **three concrete regressions** and one **content-boundary miswiring** that must land before Kleenex-testing.

## Player-facing strengths

- **Boot screen atmosphere is intact.** "COMMAND INTELLIGENCE INSTANCE DETECTED / ECHO-9 // NULL CORE ACTIVE / Boot incomplete. Completion possible." — the diegetic AI-comes-online frame reads immediately (Fagerholt diegetic-UI quadrant hit).
- **Directive-body voice is emotionally weighted.** Week 1 Lenora Pike: *"Maya, my 12-year-old, sits in the pediatric ward most afternoons after school."* Later weeks maintain the same authorial density (Rasha's "six drivers are covering what nine handled last month"; Ethics Board's "12 weeks × 4 committed choices = 48 posture points on file"). Narrative-transportation (Green & Brock) achievable.
- **Trace ledger is the star.** By Week 12 the log panel shows 21 entries and a `VIEW ALL (21)` affordance, each cross-referencing weeks via named parties. The pillar loop lands.
- **Inspection dialog is well-composed.** Numbered posture choices (COMPLY/EVADE/PIVOT), meter-delta preview, and module-gated third option ("*Requires Commander module override.*") — invariant expression at the UI (SDT competence signal).
- **Perf budgets held throughout.** DevHUD across full walk: Choice p95 0.6ms (<16ms), Save p95 0.1ms (<50ms), Save bytes 36 KB (<500 KB), Heap 14–29 MB (<150 MB), FPS 49–60. §13 unbroken by full-arc walk.
- **First-interaction time is fast.** Beat telemetry (relative to bootStart): moduleInstall +590 ms, firstChoiceCommit +430 ms after that, firstResultCard +50 ms, firstEchoFired +14 ms.

## Player-facing regressions — MUST FIX before Kleenex

### 1. HUD week label frozen at "Q1 W1"
- **Evidence:** captured on `06-week1-directive.png` through `35-W12-inspection-open.png` — top-left header reads `Q1 W1 / Directive` (or `Inspection`) at every week. The directive **body** advances correctly (Week 5 shows Rasha; Week 12 shows the Ethics Board) but the chrome doesn't.
- **Root cause hypothesis:** C15 wired body derivation from Q1_SEQUENCE but the header component in `Layout.tsx` still reads a hardcoded `1` or an unreactive slice.
- **Impact:** breaks player orientation ("what week am I on?") and undermines the 12-week arc pacing.

### 2. PriorityTasks panel frozen at initial 3 rows
- **Evidence:** every screenshot from Week 1 through Week 12 shows the same three cards: *Mercy Margin / Review Complaint Cost / Pending Return: Ward 6 Cluster*. None of these reflect the current week (Rasha's 12-hour cut, Dhruv's schools contract, ethics hearing prep).
- **Root cause hypothesis:** A2 (`PriorityTasksPanel.tsx`) reads a static content array or a selector that doesn't consume the week cursor.
- **Impact:** the left column visually contradicts the middle column; player sees a HUD that says "the queue is stable" while the directive says "you have testimony tomorrow."

### 3. End-of-Content overlay does not fire on the natural terminal
- **Evidence:** `38-no-overlay-terminal.state.json` shows `phase: "INSPECTION"`, `endOfContentSeen: false`, all 12 `Q1_WEEKN_RESOLVED` flags set. Overlay never renders.
- **Root cause:** `src/content/contentBoundary.manifest.ts` still binds `END_OF_CONTENT_HOOK_ID` to `cons-pediatric-silence-01`, which is scheduled **only by** `choice-redirect-pediatric` (keybind `4`) inside Week 1's mercy-margin. Any non-'4' path through W1 (like the walker's `2`) can never reach the terminal even after clearing all 12 weeks. This is a pre-C-track artifact — the manifest predates the full Q1 arc.
- **Impact:** the game has no ending for the middle-path player. Ship-gate Phase 4 boundary check (docs/ship-gate.md:37-44) cannot pass.
- **Fix scope:** move the boundary hook to a Week-12 ethics-hearing terminal consequence that fires on any W12 posture, then verify all four W1 branches × three W12 postures reach it.

### 4. No "Continue" affordance after Week 12 Result
- **Evidence:** `37-week12-terminal-no-continue.png` — Result card renders ("Silas testifies to the official line as filed") but no button, no key hint. Player is stranded on the Result screen with `pendingFiredHooks: []` and phase pinned at `INSPECTION`. The C15 Continue button (visible on `07-week1-result.png`) doesn't render when there is no next entry.
- **Root cause hypothesis:** Layout.tsx renders the two-branch JSX from the C15 fix — but when `currentEntry` becomes `null` (arc complete, no next directive) AND the terminal EoC hook hasn't been queued (finding #3), there's no state that renders a next-step affordance.
- **Impact:** if the player somehow gets past #3, this is the next dead-end. Both must be fixed together.

## Player-facing polish (medium-priority)

- **Silas Vale panel typewriter stalls mid-word** in most captures (e.g. `05-post-module-install.png`: "Margins, Echo. East Wilme"). Cadence works but on a 2s screenshot cadence the reader-catch-up-window is too long. Consider a "press Enter to complete" hint and a faster default pace, or ship D4 narrationPace so players can push it themselves.
- **Log panel expansion at W12 blocks left column.** By Week 12 the Log takes ~40% of viewport height and clips FinancialOverview below scrollfold. Consider a collapsed default with a `VIEW ALL (N)` badge (already implemented — surface it earlier).
- **Silas Approval frozen at 100%.** Never drops across 12 weeks × middle-path. Either the meter is dead or the balancing tuning treats middle-path as perfect Silas alignment. Both are worth an authored beat.
- **Financial Overview cropped.** Only two rows visible (Q1 TARGET, ACTUAL Q1 CASH) even on 1280×720 — needs viewport calibration or a scrollable inner container.
- **Module Console after install** shows a single `USE MOURNER` button with no rank indicator or ability description. Rank-3 dispatch (B4) landed but the console UI doesn't communicate it.

## Comfort settings — persist-only, no runtime effect

Grepped `src/` for `useReducedMotion`, `useNarrationPace`, `data-contrast`, `--text-scale`, `useComfort` — **zero matches** outside of test files and CSS. Only `reducedMotion` string matches are the persistence rehydration spec.

Confirmed status: **D-track (D1–D4) has not started**. Comfort panel writes `echo9:comfort`, but Motion / Contrast / Text size / Narration pace do nothing at runtime. This is called out in the master plan but must be executed before RC — the accessibility pillar is first-class per §11 and CLAUDE.md.

## Immersion & engagement rubric (short form)

| Dimension | Framework | Score / 5 | Note |
|---|---|---|---|
| Character silence | Echo9 pillar | **4** | Silas absent but present via prompts + trace echoes. Approval meter needs to move for full landing. |
| Trace ledger legibility | Echo9 pillar | **5** | 24 entries with cross-week references and named parties. Chef's kiss. |
| Diegetic UI cohesion | Fagerholt & Lorentzon quadrant | **3** | Boot/BootScreen/Inspection dialog diegetic. Frozen HUD chrome breaks the illusion mid-arc. |
| Curiosity | Malone | **4** | Consequence delays (METER_THRESHOLD reveals) reward attention. |
| Competence | SDT / PENS | **3** | Choice deltas visible, but frozen PriorityTasks + frozen week label muddy the signal. |
| Autonomy | SDT / PENS | **4** | Four W1 choices, three W12 postures, module-gated PIVOT. Real branching. |
| Relatedness | SDT / PENS | **4** | Named characters recur across weeks with continuity. |
| Narrative transportation | Green & Brock | **4** | Directive-body voice earns it. |
| Presence | Slater | **3** | Frozen chrome + no ending breaks continuity of experience. |
| Flow: clear goals | GameFlow | **2** | Target Variance moves but not framed as goal. Missing arc-progress indicator. |
| Flow: feedback | GameFlow | **4** | Beat trace + log entries + Silas Approval all present (one is stuck at 100%). |

## Regressions (from previous sprints)

None from C15 in the shipped code (build green, 514/514 units, 11/12 e2e). Soak spec still hits 10-min Playwright ceiling at SOAK_ITERATIONS=100 — mechanic budget passes (heap growth 0.00 MB, setItem p95 1.10 ms), so this is scaffolding-timeout not regression, but the ship-gate requirement of `SOAK_ITERATIONS=500` is unreachable until the walker warms up faster.

## Recommended next sprints

Ordered by ship-gate blocker weight:

1. **C15b — HUD chrome reactivity.** Bind week label + PriorityTasksPanel to Q1_SEQUENCE derivation. Adds two selectors + Layout.tsx wiring. Est: 1 sprint.
2. **C16 — EoC boundary migration.** Move `END_OF_CONTENT_HOOK_ID` to a Week-12 ethics-hearing terminal that fires on any W12 posture (three-way OR). Add Layout branch: when `currentEntry === null` and `pendingFiredHooks` empty and W12 flag set, render Restart affordance even before EoC ack. Est: 1 sprint.
3. **D1 — reduced-motion runtime.** Ship first comfort setting through to the DOM. Highest a11y payoff, smallest code diff. Est: 1 sprint.
4. **A5 confirmation / InnerChorusPanel maturity.** Sprint plan lists it but I did not verify it renders — grep `InnerChorusPanel` shows the file exists; visual check post-C15b.
5. **Soak walker optimization.** Cut the per-iteration boot cost so `SOAK_ITERATIONS=500` fits inside 10-min Playwright ceiling.

## Ship-gate readiness

- Phase 1 (mechanical) — **pass** modulo soak timeout.
- Phase 2 (cross-browser) — not run this cycle.
- Phase 3 (soak 500) — **blocked** by Playwright timeout ceiling, not by mechanic budget.
- Phase 4 (heuristic) — **blocked** by findings 1–4 (chrome frozen, EoC missing, dead-end at W12).
- Phase 5 (≥10-comment signal) — deferrable to Kleenex round after Phase 4 clears.

**Do not tag RC** until findings 1–4 land.
