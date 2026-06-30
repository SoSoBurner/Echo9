---
name: perf-baseline-check
description: Re-run the §13 performance budgets (build size, choice p95, save p95, save bytes, heap, FPS, soak heap drift) and diff results against game/docs/perf-baseline.md. Surface any budget regression with a one-line summary per metric.
---

# perf-baseline-check

Verifies PLAN.md §13 perf budgets after a meaningful state, render, or persist change.

## When to invoke

- After any change to `game/src/state/`, `game/src/systems/`, or `game/src/ui/shell/Layout.tsx`.
- Before claiming a vertical-slice task complete.
- Before any release-candidate tag.

## Budgets (from PLAN.md §13)

| Metric | Budget | Source |
|---|---|---|
| Prod gzip size | < 275 KB | `npm run build` output |
| Choice commit p95 | < 16 ms | DevHUD `devMetrics.choiceP95` |
| Save serialize p95 | < 50 ms | DevHUD `devMetrics.saveP95` |
| Save bytes | < 500 KB | `JSON.stringify(getSnapshot()).length` |
| Heap (steady-state) | < 150 MB | `performance.memory.usedJSHeapSize` |
| FPS | > 50 | DevHUD `devMetrics.fps` |
| Long tasks | 0 steady-state | DevHUD `devMetrics.longTasks` |
| Soak heap drift (500 iter) | < 5 MB | `npm run test:soak` |
| Soak save p95 | < 250 ms | `npm run test:soak` |

## Procedure

1. Run `cd game && npm run build` and parse gzip size from the rollup-visualizer JSON.
2. Run `cd game && npm run dev` in the background; open the DevHUD via `?devhud=1` query param.
3. Sample `devMetrics` after 30 seconds of idle + 10 choice commits + 5 save round-trips.
4. Run `cd game && SOAK_ITERATIONS=500 npm run test:soak`.
5. Diff every metric against `game/docs/perf-baseline.md`. For each regression: produce a one-line entry of the form `METRIC: BUDGET (prev: PREV, now: NOW, delta: ΔX)`.
6. Report PASS if all budgets hold; FAIL listing only the regressed metrics.

## Output format

```
PASS — 9/9 budgets hold (vs 2026-06-30 baseline)
```

or

```
FAIL — 2/9 budgets regressed:
  choice_p95: 16ms (prev: 0.4ms, now: 18.2ms, delta: +17.8ms)
  heap_steady: 150MB (prev: 22MB, now: 161MB, delta: +139MB)
```

## Do not

- Do NOT update `game/docs/perf-baseline.md` automatically. Baselines are author-locked; updating them requires explicit user authorization via AskUserQuestion.
- Do NOT skip the soak run for any change touching persist middleware or the ledger.
