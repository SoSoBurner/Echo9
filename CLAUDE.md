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

## Gotchas

- Never `Read` a `local_agent` task `.output` file — it is a JSONL transcript symlink that will overflow context. Use the Agent tool result.
- Don't push to `origin/main` without explicit user request.
- Don't run npm/npx from `Echo9/` — it has no package.json. Always `cd game/` (or use absolute paths).
- No database, no backend — don't recommend DB mocks or migrations.
