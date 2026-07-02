# Echo9 Review Cadence Runbook

This runbook governs when review skills fire during normal development. It is the operational counterpart to the "Testing skill cadence" table in `Echo9/CLAUDE.md`. The ship-gate audit (`docs/ship-gate.md`) is a separate, stricter chain used pre-RC only.

## Daily

- Pre-commit hook (already installed): `tsc --noEmit` + `oxlint` + `vitest run`.
- `superpowers:verification-before-completion` before any "done" claim.

## Per feature (any diff ≥3 files or 1 new schema/mechanic)

1. `traceability-invariant` if content or resolver/queue touched.
2. `perf-baseline-check` if state/render/persist touched.
3. `parallel-review-fanout` if 2+ review dimensions apply.
4. `mechanics-review` if a new mechanic is introduced.
5. `feedback-loop-review` if a new meter cascade / loop is introduced.

## Weekly

- One Deep self-playtest session (rotating skill in focus per week — see `docs/playtest/self-playtest-deep.md` for the rotation).
- Update `docs/playtest/sessions/YYYY-MM-DD-deep.md`.

## Monthly

- One Kleenex self-playtest session (mandatory 24h code break beforehand — see `docs/playtest/self-playtest-kleenex.md`).
- `fun-review` skill against Kleenex notes.
- Skim `docs/test-flakes.md` — any test with 3+ appearances gets triaged.

## Per quarter of content (Q1 done, Q2 lands, etc.)

- `tutorial-review` — does new content teach itself?
- `traceability-invariant` full audit against the new quarter's hooks.
- Multi-quarter test suite scaffold (`game/src/tests/systems/multiQuarter.test.ts.todo`) activated with real assertions.

## Pre-release-candidate (see `docs/ship-gate.md`)

- Full audit chain in fixed order. See the ship-gate runbook — skipping steps is grounds for reverting the RC tag.
