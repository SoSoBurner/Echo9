# E2E Flake Log

Append-only quarantine log for Playwright tests that pass only after a retry.
Populated automatically by `scripts/analyze-flakes.mjs` after every CI run of
`npm run test:e2e`.

## Triage rule

Any test title appearing 3+ times within a 30-day rolling window is a real
timing bug, not a coincidence. Response options, in order of preference:

1. Fix the timing assumption at the source (usually a `waitFor`, `findByRole`,
   or `expect(...).toBeVisible()` that races the render pipeline).
2. Mark the offending test `test.fixme(...)` with an issue id, so the suite
   keeps building green while the bug stays visible in the CI output.

If the count grows past ~10 entries with no triage, invoke
`playwright-expert` — the E2E infra itself is fragile and needs redesign.

---
