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
npm run test:e2e     # playwright (mercyMarginSlice + soakTest)
npm run test:soak    # SOAK_ITERATIONS=500 for release gate
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

## Gotchas

- Never `Read` a `local_agent` task `.output` file — it is a JSONL transcript symlink that will overflow context. Use the Agent tool result.
- Don't push to `origin/main` without explicit user request.
- Don't run npm/npx from `Echo9/` — it has no package.json. Always `cd game/` (or use absolute paths).
- No database, no backend — don't recommend DB mocks or migrations.
