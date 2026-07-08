# Echo9 — Claude Working Notes

React 19 + Vite 8 + TypeScript narrative game. Client-only, no backend.

## Layout

- Repo root: `Echo9/` — `PLAN.md`, art assets, this file.
- App code: `Echo9/game/` — **run all npm/npx from here**.
- `PLAN.md` is the locked 18-section design contract. **Do not edit without explicit authorization.**
- `.remember/now.md` is the session-state checkpoint buffer — read on resume, append on stop.

## Commands (run from `game/`)

```bash
npm run dev          # vite dev server
npm run build        # scripts/build.mjs wrapper; --report for bundle viz
npm run test:run     # vitest single-shot
npm run test:e2e     # playwright (all e2e specs in src/tests/e2e/)
npm run test:soak    # playwright soakTest; set env SOAK_ITERATIONS=500 for 500-cycle release gate
npx oxlint           # lint — NOT ESLint
npx tsc --noEmit     # typecheck
```

Verification trinity before declaring done: `tsc --noEmit` → `oxlint` → `vitest run`.

## Stack quirks

- Lint is **oxlint** (`.oxlintrc.json`). Never propose ESLint configs.
- TS ~6 / Vite 8 / Vitest 4 / React 19 / Zustand 5 / Zod 4 / Immer 11 / Tailwind v4 — bleeding-edge majors; prefer `context7` MCP for API lookups over memory.
- Persist middleware writes `echo9:autosave` to localStorage. Comfort settings under `echo9:comfort`.
- Pre-existing oxlint warning on `vite.config.ts:1` (triple-slash) — leave it alone.

## Perf gate (PLAN.md §13)

Baselines in `game/docs/perf-baseline.md`. Re-verify on any state/render change. DevHUD (`game/src/ui/debug/DevHUD.tsx`) is dev-only, tree-shaken from prod.

## Review cycle

Default to **superpowers:subagent-driven-development**: implementer → spec-reviewer → code-quality-reviewer → fix loop. Spec gate runs before code quality.

## Plan header standard

Every plan file — whether written under `docs/superpowers/plans/`, `C:\Users\CEO\.claude\plans\`, or elsewhere — MUST open with these four sections, in order, above the standard `**Goal:** / **Architecture:** / **Tech Stack:**` block:

1. **What this is** — plain-English deliverable (what the user will have when this lands).
2. **What we're doing** — the tasks/tracks/sprints structure (the shape of the work).
3. **Why we're doing it** — motivation, constraint, or higher-level goal being served.
4. **Layman explanation** — one paragraph a non-developer stakeholder could nod along to.

**Exemplar:** `C:\Users\CEO\.claude\plans\make-sure-you-review-glittery-matsumoto.md` (the Stage-1 vertical slice ship plan).

Rationale: plans are read cold by future-you, fresh subagents, and human stakeholders. The four-section header serves all three audiences before the engineering handoff begins. Never omit a section — if a section feels redundant, the plan is probably too narrow to warrant a plan file at all.

## Dispatch heuristics — when to reach for which agent/skill

| Trigger | Reach for | Why |
|---|---|---|
| Task touches ≥3 files with distinct owners (panel + slice + toast) | `agent-teams:parallel-feature-development` + fan-out `team-implementer` per owner | Solo SDD serializes what should run in parallel. |
| UI/dialog/focus/live-region change | `a11y-architect` (design) or `.claude/agents/a11y-reviewer` (review) | Comfort pillar is first-class; generic reviewer misses WCAG 2.2 AA. |
| New Zod schema or branded ID | `type-design-analyzer` before merge | Encapsulation + invariant expression grading matches Echo9's schema surface. |
| Resolver / persist / catch-block change | `silent-failure-hunter` | Suppressed errors hide §11 invariant leaks. |
| ≥2 review dimensions apply (a11y + types + content) | `.claude/skills/parallel-review-fanout` | Dispatches all applicable reviewers in one fan-out instead of serial gates. |
| Content file added/changed under `game/src/content/` | `.claude/agents/content-schema-reviewer` + `.claude/skills/traceability-invariant` | Zod parse + cross-reference integrity + §11 round-trip. |
| Test additions ≥5 files or ≥30 cases | `pr-test-analyzer` | Behavioural coverage audit (not line coverage). |
| Before claiming "done" | `superpowers:verification-before-completion` | Reconciles claim against git + tests. |
| State/render/persist change | `.claude/skills/perf-baseline-check` | §13 budget gate. |
| API question about React 19 / Zustand 5 / Zod 4 / Tailwind v4 | `context7` MCP | Bleeding-edge majors — training data is stale. |
| E2E flake or Playwright layout drift | `chrome-devtools-mcp` (screenshot/console) + `playwright` MCP | Live browser state beats guessing. |

## Testing skill cadence — when each skill fires

| Skill | Cadence | Trigger |
|---|---|---|
| `verification-before-completion` | Per-task | Before any "done" claim; ALWAYS. |
| `traceability-invariant` | Per-content-change | Every commit touching `game/src/content/**` or the resolver/queue slices. |
| `perf-baseline-check` | Per-feature | Every state/render/persist change; must re-diff baseline. |
| `content-schema-reviewer` | Per-content-change | Automatic via review-fanout when content diffs. |
| `a11y-reviewer` | Per-UI-change | Every `game/src/ui/**` diff touching dialog/focus/aria. |
| `parallel-review-fanout` | Per-feature | Diff spans ≥2 dimensions (UI + schema + content). |
| `mechanics-review` | Per-feature | Every new mechanic (module, inspection scene, capital card). |
| `fun-review` | Per Kleenex session | Monthly. After every solo Kleenex playtest. |
| `feedback-loop-review` | Per new loop | Every time a new meter cascade / module effect / inspection outcome lands. |
| `tutorial-review` | Per-quarter of content | Before every Q_N ships; onboarding is quarter-scoped. |
| `polish-review` | Pre-RC only | Once before each release candidate; not per-feature. |
| `design-discovery` | Every 4th Deep session | Or when a self-playtest surfaces "the game seems to want X." |
| `playtest-plan` | Per protocol update | When the Kleenex/Deep protocol needs a new rubric or method. |
| `playtesting-strategy` | Semi-annually | Or when Kleenex+Deep are missing something (e.g., balance testing). |
| `e2e-testing-patterns` | On flake | When flakes appear in `docs/test-flakes.md`. |
| `playwright-expert` | On new E2E infra | Adding cross-browser, visual regression, or new fixtures. |

## Gotchas

- Never `Read` a `local_agent` task `.output` file — it is a JSONL transcript symlink that will overflow context. Use the Agent tool result.
- Don't push to `origin/main` without explicit user request.
- Don't run npm/npx from `Echo9/` — it has no package.json. Always `cd game/` (or use absolute paths).
- No database, no backend — don't recommend DB mocks or migrations.
- `vite.config.ts` must keep `base: './'`. Vite's default (`/`) breaks file:// double-click, itch.io subpath hosting, and any static host that serves from a subdirectory. Guarded by `npm run verify:subpath` (Playwright 3-way boot) and `src/tests/subpath/subpathAssetPaths.test.ts` (static dist scan).
- `tsc --noEmit` (trinity) is looser than `tsc -b` (build.mjs): the build enforces `exactOptionalPropertyTypes`, so a commit can be trinity-green and still break `npm run build`. When touching JSX props that may be `undefined`, run `npx tsc -b` before pushing.
- `useStore.getState().flags` is a `Set<string>`. In Playwright specs, do the `[...flags]` conversion **inside** `page.evaluate` — structured-clone returns after `evaluate()` drop Set-ness and a bare spread in Node throws "not iterable".
- `SOAK_ITERATIONS=500` (ship-gate Phase 3): soakTest.spec.ts now budgets `max(15min, ITERATIONS * 8s)` — 100 iter → 15 min, 500 iter → ~67 min. Empirical rate is ~7 s/iter under 4× CPU throttle (measured 2026-07-07). The full ship-gate soak needs a ~70-min CI slot. Follow-up work to speed up the boot path (store-construction cost) would let us tighten this.
