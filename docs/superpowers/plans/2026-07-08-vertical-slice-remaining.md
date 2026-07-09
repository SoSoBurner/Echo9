# Echo9 Stage-1 Vertical Slice — Remaining Work (regenerated 2026-07-08)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

---

## What this is

A fresh, honest audit of everything left between today (2026-07-08) and tagging Echo9's Stage-1 vertical slice as `v0.1.0-rc1`. Supersedes `.claude/plans/make-sure-you-review-glittery-matsumoto.md`, which is now heavily out of sync — the 2026-07-08 ship-gate dry-run confirmed Tracks A/B/C/D/E/V all shipped between authoring and audit. Only three things stand between the current commit (`a5dac95`) and the RC tag: Track F prep artifacts, a real Kleenex playtest, and a clean ship-gate re-run.

## What we're doing

Three sprints, in this order (each blocks the next):

- **F** — Execute the pre-existing T17 itch-ship plan at `docs/superpowers/plans/2026-06-30-t17-itch-ship.md`. Produces `game/scripts/build-itch.mjs`, `docs/itch-listing.md`, `docs/devlog/vertical-slice-ship.md`. No new runtime code, no gameplay changes.
- **K** — Solo Kleenex playtest per `docs/playtest/self-playtest-kleenex.md`, then fill the six rubric score sheets at `docs/playtest/rubrics/`. This is the honest input for Phase 5 of the ship-gate.
- **S** — Re-run `docs/ship-gate.md` end-to-end, resolve any regressions, and tag `v0.1.0-rc1` only if Phase 5 flips to HONEST YES.

## Why we're doing it

The 2026-07-08 dry-run report (`docs/ship-gate/2026-07-08-dry-run.md`) landed a HONEST NO on Phase 5 — even though the mechanical, cross-browser, and traceability gates are green. The remaining gap is not more feature engineering (five tracks are shipped and my "trust but verify" audit found zero real defects); it's proof the shipped build actually earns the ≥10-mention signal the PLAN.md §17 pillars demand. That proof only comes from human hands on the game. Track F is small, mechanical prep that unblocks the manual upload once — and only once — the playtest says the build deserves it.

## Layman explanation

The game is built. The dials work, the story fills a quarter, the accessibility knobs actually do things, the pictures are in place. What we haven't done is (a) put the game in a box we can hand to itch.io, (b) sit down and play it cold like a stranger would, or (c) run the full pre-flight checklist a second time. Those three things are what's left, in that order. If step (b) says "this game is actually fun and communicates its point," we ship. If it says "this game is boring or unclear," we go back and fix that instead of shipping something that fails its own promise.

---

**Goal:** Move from the current commit (`a5dac95`, ship-gate dry-run amended) to a signed `v0.1.0-rc1` tag or an honest, documented decision to defer ship — whichever the playtest data supports.

**Architecture:** No new runtime code. Sprint F is a build-pipeline script + two markdown docs. Sprint K is playing the game and writing down what happened. Sprint S is running a fixed audit script and either tagging or filing findings.

**Tech Stack:** Node ESM build script (matches `scripts/build.mjs` shape), Playwright ship-gate cross-browser suite, existing `verify:subpath` gate, existing six rubrics at `docs/playtest/rubrics/`. Zero net-new dependencies.

---

## Audit of what's already shipped (do not re-implement)

The following was mistakenly listed as "pending" in the previous plan. All confirmed shipped via git log survey (`git log --oneline --all -80`) and filesystem verification on 2026-07-08:

| Track | Sprint(s) | Landing commits (samples) | Evidence file |
|---|---|---|---|
| A | A1–A5 | `cdcae7f`, `af33dd2`, `36a7677`, `85e16f9`, `113094b` | `src/ui/panels/{PriorityTasks,FinancialOverview,HumanImpact,InnerChorus}Panel.tsx` |
| B | B1–B6 | `27bbc5f`, `3b02d4a`, `130816e`, `c7e30fb`, `59f493f` | `src/content/moduleAbilities/*.ts` (24 files), `src/systems/moduleAbilityEngine.ts`, `src/content/inspections/inspectionMitigations.ts` |
| C | C1–C16 | `4772e41`…`d9879fd` (12 weeks), `8fcdff1`, `a4bbc7d`, `5dc8fbc` | `src/content/tasks/q1/week{1..12}-*.task.ts`, `src/content/inspections/q1{Payroll,Safety,Ethics}.scene.ts`, `src/content/directiveSchedule.ts` |
| D | D1–D4 | `625b48b`, `90f0eb5`, `a0ddc6b`, `9981819` | `src/systems/comfort/{reducedMotion,contrastTheme,textSize,narrationPace}.ts` + `main.tsx` bootstraps + `useTeletype.ts:29` multiplier read |
| E | E1–E3 | `252ac9e`, `f558104`, `093ee87` | `src/tutorial/{hudDisclosure,awakeningSequence}.ts`, panel `maturity` props, Silas prompt threads |
| V | V1–V5 | `33e3f46`, `c2ace58`, `5bb1a06`, `3281970` | `scripts/generate-portraits.mjs`, `src/assets/portraits/*.webp` (10), `src/ui/charts/{DonutChart,donutGeometry}.tsx`, `src/ui/alerts/AlertCrawler.tsx` |

**Do not open any of these tracks.** If a task in this plan looks like it belongs to one of them, verify against the file table above before touching code. The five stale-plan findings this session all shared one root cause: the old plan file was writtten before the tracks landed and never updated.

---

## Sprint F — Track F execution (itch-ship prep artifacts)

**Owned plan:** `docs/superpowers/plans/2026-06-30-t17-itch-ship.md` — written but never executed. It already contains every step for F1/F2/F3 including verbatim code for `build-itch.mjs`, the itch-listing markdown skeleton, and the devlog voice guidance.

### Task F.1: Verify T17 plan preconditions are still met

**Files:** none (read-only verification).

- [ ] **Step 1: Confirm working tree clean**

Run: `cd C:/Users/CEO/Echo9 && git status --porcelain`
Expected: empty (or only this plan file + `docs/ship-gate/2026-07-08-dry-run.md` pending). If dirtier, stop and reconcile before F.2.

- [ ] **Step 2: Re-run the trinity as a green baseline**

Run: `cd game && npx tsc --noEmit && npx oxlint && npx vitest run`
Expected: tsc clean, oxlint only the grandfathered `vite.config.ts:1` triple-slash warning, vitest all pass.

- [ ] **Step 3: Confirm `game/scripts/build-itch.mjs` still does not exist**

Run: `ls C:/Users/CEO/Echo9/game/scripts/build-itch.mjs`
Expected: `No such file or directory`. If present, T17 was partially executed — re-audit before proceeding.

No commit for this task — verification only.

### Task F.2: Execute T17 Task 2 (build-itch.mjs) verbatim

**Files:**
- Create: `game/scripts/build-itch.mjs` (content: copy from `docs/superpowers/plans/2026-06-30-t17-itch-ship.md` Task 2)
- Modify: `game/package.json` — add `"build:itch": "node scripts/build-itch.mjs"` under `scripts`.

- [ ] Follow T17 Task 2 steps 1–6 exactly as written in that plan.
- [ ] Run: `cd game && npm run build:itch`
- [ ] Expected: `dist/echo9-v0.1.0.zip` exists, gzip payload < 2 MB, `verify:subpath` re-runs clean.
- [ ] Commit: `feat(f1): build-itch script — dist/ to zip with subpath verification`

### Task F.3: Execute T17 Task 3 (itch-listing.md)

**Files:**
- Create: `docs/itch-listing.md` (content template from T17 Task 3)

- [ ] Follow T17 Task 3 steps 1–3.
- [ ] Cross-check the "pillars" section against PLAN.md §1 (character silence + trace ledger).
- [ ] Commit: `docs(itch): listing copy for T17 upload`

### Task F.4: Execute T17 Task 4 (devlog entry)

**Files:**
- Create: `docs/devlog/vertical-slice-ship.md`

- [ ] Follow T17 Task 4 steps 1–2.
- [ ] Voice: post-mortem of the Stage-1 build — pillars, cuts, what's next. Reference perf-baseline diff and the trace-ledger + character-silence signal target.
- [ ] Commit: `docs(devlog): vertical-slice ship post`

**Do NOT** run T17 Task 5 (upload). No push to itch.io until Sprint S clears.

---

## Sprint K — Kleenex playtest + Phase 4 heuristic reviews

This is the sprint the dry-run explicitly gated on. Every task in K is done by a human sitting with the game; no code is written. The subagent-driven-development skill does not apply here — this sprint is a note-taking sprint.

### Task K.1: 24-hour code break

- [ ] Do not touch the repo for 24 hours after Sprint F commits land. This is a Kleenex-playtest prerequisite per `docs/playtest/self-playtest-kleenex.md`.
- [ ] Note the elapsed time in the session buffer at `.remember/now.md` when you return.

### Task K.2: Cold-boot Kleenex playtest

- [ ] `cd game && npm run play` — the local launcher builds + serves + opens the browser.
- [ ] Play through Q1 from cold boot to the End-of-Content overlay. Do not read the code. Do not look at PLAN.md.
- [ ] Take exactly one screenshot per week + one at the EoC overlay (13 total) and store under `game/test-results/kleenex-2026-07-XX/`.
- [ ] Write raw first-response notes into `docs/playtest-analysis/kleenex-2026-07-XX-notes.md`. Voice: what did you feel, not what did you see. Skip if a moment produced no reaction.

### Task K.3: Fill the six rubrics

Each rubric lives at `docs/playtest/rubrics/<name>.md` and is a fillable score sheet, not a callable skill. Fill them in this order (each informs the next):

- [ ] `mechanics-review.md` — every mechanic introduced this quarter.
- [ ] `feedback-loop-review.md` — every loop that closed at least once during the playtest.
- [ ] `tutorial-review.md` — the awakening sequence + panel emergence choreography as experienced cold.
- [ ] `polish-review.md` — audio/visual state of the build.
- [ ] `fun-review.md` — highest-leverage change identified.
- [ ] `design-discovery.md` — only if `fun-review` surfaces "the game seems to want X."

Commit each after filling: `docs(playtest): kleenex 2026-07-XX — <rubric>-review filled`

### Task K.4: Phase 5 honest signal check

- [ ] Answer honestly (in `docs/playtest-analysis/kleenex-2026-07-XX-notes.md`, "Phase 5" heading): does this build convincingly earn ≥10 unsolicited mentions of trace ledger OR character silence?
- [ ] If YES: proceed to Sprint S.
- [ ] If NO: identify the specific pillar gap. Do not proceed to Sprint S. Instead, invoke `design-discovery` skill and file a new plan for the gap — return here after that plan ships.

---

## Sprint S — Ship-gate re-run + RC tag

Blocks on Sprint K flipping Phase 5 to HONEST YES.

### Task S.1: Re-run ship-gate Phase 1–3

- [ ] Follow `docs/ship-gate.md` Phase 1 exactly. All six checks must be green.
- [ ] Phase 2 cross-browser: chromium + firefox + webkit. If webkit is unavailable on the current machine, document the skip in the report and note the check must run on a machine with all three.
- [ ] Phase 3 soak: run `SOAK_ITERATIONS=500 npx playwright test src/tests/e2e/soakTest.spec.ts`. The 2026-07-08 dry-run failed here with `net::ERR_CONNECTION_REFUSED` mid-run — Vite dev server dying under sustained load. Mitigations documented in the dry-run report: (a) run under `vite preview` instead of `dev`, or (b) bucket into 5×100. Pick one, document, run.

### Task S.2: Confirm Phase 4 boundary check + heuristic reviews

- [ ] Phase 4 boundary: play any W12 posture, acknowledge terminal hook, EoC overlay appears, Escape does NOT dismiss. Repeat for all four W12 postures (name-what-took / defer / decline / defiant). Close browser, reopen — overlay reappears. Replay — both `echo9:autosave` and `echo9:endOfContentSeen` gone from localStorage.
- [ ] Confirm the six K.3 rubric fills are already committed.

### Task S.3: Write the RC ship-gate report

**Files:**
- Create: `docs/ship-gate/2026-07-XX-rc1.md`

- [ ] Structure follows the 2026-07-08 dry-run report shape: Phase-by-phase verdicts, one honest paragraph per phase, terminal verdict.
- [ ] Terminal verdict must be either **SHIP** (all phases pass, honest YES) or **DEFER** (specific phase failed, named remediation).
- [ ] Commit: `chore(ship-gate): rc1 report — <SHIP|DEFER>`

### Task S.4: Tag `v0.1.0-rc1` (only if S.3 verdict is SHIP)

- [ ] Run: `cd C:/Users/CEO/Echo9 && git tag -a v0.1.0-rc1 -m "Stage-1 vertical slice RC1"`
- [ ] Ask user before `git push --tags`. Do not push without explicit confirmation (standing rule from CLAUDE.md).

---

## Standing rules while executing this plan

- Direct commits to `main` — no feature branches.
- Ask before every `git push`. This includes tag pushes.
- Trust but verify at every task boundary. Any time this plan says "create file X," first run `ls X` and confirm it doesn't already exist. Five stale-plan findings this session say the plan is more likely to be wrong than the code.
- Do not touch tracks A/B/C/D/E/V. If a task looks like it belongs to one, stop and re-audit before writing code.
- Never break `base: './'` in `vite.config.ts` (guarded by `verify:subpath`).
- Sprint K is human work. Do not automate away the 24-hour code break, and do not fill the rubrics from the code alone — the rubrics measure the felt experience.

---

## Critical file references (do not modify unless a task says so)

- `C:\Users\CEO\Echo9\PLAN.md` — 18-section design contract (READ-ONLY).
- `C:\Users\CEO\Echo9\docs\ship-gate.md` — pre-RC audit sequence (READ-ONLY).
- `C:\Users\CEO\Echo9\docs\ship-gate\2026-07-08-dry-run.md` — precedent dry-run report to model S.3 after.
- `C:\Users\CEO\Echo9\docs\superpowers\plans\2026-06-30-t17-itch-ship.md` — the F1/F2/F3 verbatim script.
- `C:\Users\CEO\Echo9\docs\playtest\self-playtest-kleenex.md` — Kleenex protocol for Sprint K.
- `C:\Users\CEO\Echo9\docs\playtest\rubrics\*.md` — the six score sheets Sprint K fills.
- `C:\Users\CEO\Echo9\.claude\plans\make-sure-you-review-glittery-matsumoto.md` — the superseded plan. Do not read this to inform work; it will mislead.

---

## Verification (end-to-end)

1. Sprint F commits present: `git log --oneline | grep -E "feat\(f1\)|docs\(itch\)|docs\(devlog\)"` returns 3 commits.
2. Sprint K commits present: `git log --oneline | grep "kleenex 2026-07"` returns ≥6 rubric commits.
3. `docs/ship-gate/2026-07-XX-rc1.md` exists with SHIP verdict.
4. `git tag --list v0.1.0-rc1` returns `v0.1.0-rc1`.
5. `dist/echo9-v0.1.0.zip` exists and is under 2 MB gzip.
6. Fresh boot → Q1 walkthrough → EoC overlay all still work post-tag (smoke-test via `npm run play`).
