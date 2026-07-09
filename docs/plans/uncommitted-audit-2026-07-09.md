# Uncommitted-artifact audit — 2026-07-09 (Sprint Q1, plan v3)

Snapshot taken at start of plan-v3 execution. Note: the artifacts listed in the plan's authoring-time git status (`game/index.html` M, `soakTest.spec.ts` M, `game/assets/`, `game/favicon.svg`, `game/icons.svg`, `game/scripts/file-open-test.mjs`, `game/scripts/itch-smoke.mjs`) **no longer exist in the tree or are clean vs HEAD** — they were resolved in a prior session's cleanup. Current untracked set:

| Artifact | Size | Classification | Action |
|---|---|---|---|
| `.claude/scheduled_tasks.lock` | — | Runtime noise | `.gitignore` |
| `AI Dialogue Interplay.md` | 40K | Voice canon source doc (Track P1 reads it) | `git add` |
| `docs/art/Echo9_Upgrade_Portraits.zip` | 18M | Bulk source-art archive; extracted webp portraits already shipped (commit `5bb1a06`) | `.gitignore` (`docs/art/*.zip`) — keep local |
| `docs/art/Silas Portait.png` | 2.0M | Source portrait art (filename typo preserved as-is) | `git add` |
| `docs/superpowers/plans/2026-07-02-itch-subpath-launch-fix.md` | 24K | Historical plan, already implemented (T1–T6 committed) | `git add` |
| `docs/superpowers/plans/2026-07-08-vertical-slice-remaining.md` | 16K | Historical plan, superseded by plan v3 | `git add` |
| `docs/superpowers/plans/enchanted-spinning-dijkstra.md` | 32K | Stage-1 convergence plan (HUD escalation / 8-upgrade scaffold / EoC) — largely executed per commits `252ac9e`–`3281970` | `git add` |

## §content-depth (Sprint Q2 census, 2026-07-09)

All 12 Q1 weeks exist as full task/choices/consequences triples under `game/src/content/{tasks,choices,consequences}/q1/` (plus a `week12-quarter-close-terminal.consequences.ts` extra). All 12 consequence files move only the 3 opening meters (CAPITAL / HUMAN_WELFARE / OWNER_CONTROL).

**Track C scoping consequence:** every C-N sprint is a **re-authoring pass** on an existing week (8-meter consequence tables, scrutiny deltas, rank-deepened variants) — no author-new weeks. Week titles on disk:
W1 mercy-margin · W2 queue-triage-followup · W3 friday-payroll-shortfall · W4 east-wilmer-audit-pre-brief · W5 warehouse-dispatch-cut · W6 commander-override-pressure · W7 deferred-safety-inspection · W8 payroll-audit-inspection · W9 schools-contract-renewal · W10 hidden-trace-reveal · W11 capital-deployment-attempt · W12 quarter-close-ethics-hearing.
