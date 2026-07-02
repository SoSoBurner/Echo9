# Echo9 Ship-Gate — Pre-RC Mandatory Audit Sequence

Run this sequence in EXACT ORDER before tagging any release candidate. Each step blocks the next. Skipping a step is grounds for reverting the RC tag.

The gate is stricter than the daily/weekly cadence in `docs/review-cadence.md`. Do not treat it as a checklist you can pick from — it is a chain, and a failure at step N invalidates every "pass" recorded at N-1 for this RC.

## Phase 1 — Mechanical

1. `npx tsc --noEmit` — must exit 0.
2. `npx oxlint` — no new warnings.
3. `npx vitest run` — all pass.
4. `npx playwright test` (chromium only) — all pass.
5. Invoke `traceability-invariant` skill — verdict CLEAR.
6. Invoke `perf-baseline-check` skill — no regressions past §13 hard tripwires.

## Phase 2 — Cross-browser

7. `RELEASE_GATE=1 npx playwright test src/tests/e2e/mercyMarginSlice.spec.ts` — pass in chromium + firefox + webkit.
8. `RELEASE_GATE=1 npx playwright test src/tests/e2e/persistenceRoundTrip.spec.ts` — pass in all three.
9. Skim `docs/test-flakes.md` — anything appearing 2× in the last 30 days must be triaged.

## Phase 3 — Soak

10. `SOAK_ITERATIONS=500 npx playwright test src/tests/e2e/soakTest.spec.ts` — heap growth <5MB.

## Phase 4 — Heuristic + solo playtest

11. Fresh Kleenex playtest (`docs/playtest/self-playtest-kleenex.md`) — 24h code break beforehand.
12. `fun-review` skill against the Kleenex session — highest-leverage change identified.
13. `tutorial-review` skill against a fresh cold-boot playthrough.
14. `polish-review` skill against the current build's audio/visual state.
15. `mechanics-review` skill against every mechanic introduced since previous RC.
16. `feedback-loop-review` skill against every loop touched since previous RC.

## Phase 5 — Ship-gate signal check

17. Answer honestly: does this build convincingly earn ≥10 unsolicited comments mentioning the **trace ledger** or **character silence**? If NO, do not ship — return to `design-discovery` skill and identify what's missing.

## Phase 6 — Ship

18. Only if 1–17 pass: proceed with the T17 itch-ship plan (whatever its current path may be).
