# Sprint B5 — Playtest Analysis

**Date:** 2026-07-04
**Sprint scope:** Replace 24 `ModuleAbility` stubs (8 modules × ranks 1-3) with
real, character-driven effects — meter deltas + module-signal flags — derived
from `MODULE_ROSTER` descriptions.
**Commit range:** `113094b..HEAD` (A5 → B5)
**Screenshots:** `game/test-results/b5-real-module-effects/`

## What landed

- New `moduleAbilityEffects.test.ts` (26 assertions): table-driven
  `(moduleId, rank) → { meterDeltas, flagsSet }` pinning all 24 pairs plus
  two coverage checks (24-entry length, meter-key allowlist).
- 24 ability data files rewritten with balanced numbers and character-appropriate
  flags. Prior B2 stubs had several roster-inversions fixed:
  - `COMMANDER_R3` — `OWNER_CONTROL: +3` → `-3` (roster: "costs OWNER_CONTROL")
  - `DRAINED_ONE_R2` — `HUMAN_WELFARE: +2` → `-2` (roster: "welfare pays")
  - `DRAINED_ONE_R3` — `CAPITAL: -3` → `HUMAN_WELFARE: -3` (roster: "welfare pays")
  - `CHAMPION_R2` — `HUMAN_WELFARE: +2` → `OWNER_CONTROL: -2` (roster: "OC swings")
  - `CHAMPION_R3` — `OWNER_CONTROL: -3` → `-4` (roster: "4 points")
- Six new flag constants in `@systems/gameFlags`:
  `MOURNER_NAMED_ONCE`, `DEFENDER_HELD_LINE`, `SENTINEL_ARMED`,
  `SPARK_DEPLOYED`, `DRAINED_ONE_YIELDED`, `CHAMPION_DEFIED`.
  These join the pre-existing `SILAS_OVERRIDE_AVAILABLE` and `FORECAST_PREVIEWED`
  as the module-signal channel Track C content will read against.
- Updated pinned MOURNER assertions in `moduleAbilityEngine.rank.test.ts`.

## Effect ladder (design summary)

| Module | r1 | r2 | r3 |
|---|---|---|---|
| MOURNER | HW +1 | HW +2, OC -1, flag | HW +4, OC -2, flag |
| DEFENDER | CAP +1 | CAP +2, HW -1, flag | CAP +4, HW -2, flag |
| SENTINEL | OC +1 | OC +2, HW -1, flag | OC +4, HW -2, flag |
| FORECASTER | — flag | — flag | — flag |
| COMMANDER | OC -1, flag | OC -2, flag | OC -3, flag |
| SPARK | CAP +1 | CAP +3, HW -1, flag | CAP +6, HW -2, flag |
| DRAINED_ONE | HW -1 | HW -2, flag | HW -3, flag |
| CHAMPION | OC -1 | OC -2, flag | OC -4, flag |

## Checkpoints captured

| # | Screenshot | State observation |
|---|---|---|
| 01 | comfort-panel.png | Comfort panel unchanged. |
| 02 | boot-screen.png | Initialize button visible. |
| 03 | hud-fresh.png | HUD boots with A2/A3/A4/A5 panels; install grid shows all 8 modules. |
| 04 | module-installed.png | MOURNER installed. Silas approval 100%. `USE MOURNER` button visible. Silas speaking "East Wilmer is bleeding 12…" — new content threading. |
| 05 | directive-01/02.png | Two directive cycles then walker halts at identity guard. |
| 06 | choice-selected-01/02.png | Choice `2` (Reduce by 20%) selected. |
| 07 | result-01/02.png | RESULT card renders. |
| 08 | echo-toast-01/02.png | Echo-pending toast fires. |
| 09 | consequence-01/02.png | ConsequenceReturnPanel opens. |
| 10 | terminal-state.png | Terminal state reached; ledger has 4 rows. |

Same walker terminal (identity guard after 2 iterations, still gated by
sparse Q1 content) — B5 changed runtime effect data, not the walkable arc.

## Mockup parity

- [x] Left column A2–A5 panels: still present per prior sprints (below fold at
      1280×720 — V5 layout carry-in unchanged).
- [x] Right column module console: shows install grid → USE MOURNER after
      install; effect fires would now apply real deltas + flags at runtime.
- [~] Center directive/choice cards: same as A5 baseline.
- [ ] Right rail Silas portrait, quarter goal, comms, risk: not present.
- [ ] Bottom ledgers/donut/system/alert: LogDock only.

## Spec adherence

- **§6 Module roster:** All 24 effects derive from the roster silasFraming
  and description; 5 prior B2 stubs that inverted roster semantics (Commander,
  DrainedOne x2, Champion x2) were corrected in B5.
- **§8 Modules & flags:** Six new module-signal flags land in `gameFlags.ts`
  as the single-owner registry, per that file's own convention. Track C
  content will consume these on the reader side.
- **§11 Traceability invariant:** `traceabilityInvariant.test.ts` still
  passes (4/4). `hookIdsScheduled` deliberately left `[]` in every ability
  because per-module consequence hooks aren't authored yet — scheduling
  fictional IDs would fail the invariant. When Track C authors module
  consequence hooks, `hookIdsScheduled` can be populated.
- **§Stage 1 discipline (line 1189):** No new mechanics — the deltas fan
  through the pre-existing resolver + flagsSlice. Rank-scaled magnitude
  is the only signal we vary.
- **Character silence pillar:** Modules now have measurable, character-
  appropriate consequences. Mourner *costs* the operator's cover to name
  the loss; Drained One *drains* human welfare to open the sealed trace.
  The trades match the fiction.
- **Trace ledger pillar:** Not directly exercised by B5 — the module signals
  are additive-only flags read by Track C content, not new ledger rows.

## Regressions

None. Trinity green: `tsc --noEmit` clean, `oxlint` clean (only pre-existing
`vite.config.ts:1` triple-slash warning), `vitest run` 491/491 (up from
465/465 — +24 pair assertions + 2 coverage assertions).

`traceabilityInvariant.test.ts` still 4/4 — no new consequence IDs were
introduced, so the invariant is preserved.

Layout: no change from A5 (V5 padding-compression still outstanding for the
four left-column panels at 1280×720).

## Carry-ins for next sprint

- [ ] **B6 (next):** module × inspection consequence hooks. B6 will lift
      the new signal flags into the inspection resolver so, e.g.,
      `SENTINEL_ARMED` reduces payroll-inspection risk bands. That's where
      the module deltas start showing up on the Human Impact panel visibly.
- [ ] **V5 layout compression (unchanged from A4/A5):** still ~700-800px
      of panel content vs. ~600px column viewport at 1280×720. Files:
      `HumanImpactPanel.tsx:79`, `InnerChorusPanel.tsx:63`,
      `FinancialOverviewPanel.tsx:111`, `PriorityTasksPanel.tsx`.
- [ ] **Variance for SPARK/CHAMPION:** roster promises high-variance
      swings ("sometimes it bleeds", "praise or threat"). B5 encodes the
      threat/deploy side deterministically as the rank ladder. A future
      pass on `runModuleAbility` can consume `ctx.rng` to add ±swing;
      that requires either a ctx-consuming ability record or a resolver
      variance wrapper.
- [ ] **Rank 3 scheduled consequences:** the plan says "rank 3 → strong +
      scheduled consequence." B5 delivered strong deltas + module flags
      but not per-module hooks. Landing per-module consequence hooks
      (say `HOOK_MOURNER_NAMED`) is a natural Track C pairing when a
      directive references the flag.

## Ship-gate signal check

Would this build earn ≥10 unsolicited comments about trace ledger or
character silence?

**Answer:** NO — but B5 is the point where the character-silence pillar
starts to be *earnable*. Before B5 the modules were verbose stubs: labels
promising cost/reward that resolvers ignored. After B5, installing MOURNER
means the operator's `OWNER_CONTROL` actually drops when they promote it,
Silas's approval-tone gets moved by the real HW deltas (feeding A5's
InnerChorusPanel tone), and Track C directives can *finally* react to
"you installed a module and it did what its framing said." That's the
substrate for the ledger's traces to feel deserved.

Track B6 (inspection consequences) + Track C (content that references the
new flags) are what will turn this into a Kleenex-visible dial.
