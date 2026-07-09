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

## §content-depth (Sprint Q2)

_Pending — filled by the Q2 census._
