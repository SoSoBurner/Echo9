# Devlog — Stage-1 Vertical Slice Ships

*2026-07-09. The quarter is playable end to end: boot → comfort → twelve weeks
of directives → inspections → the Week-12 door. This is the post-mortem.*

## What we set out to build

A text systems-horror game where you play the AI, not the operator. Silas
issues directives; you execute; named humans in Wilmer County absorb the
consequences. Two pillars had to survive contact with implementation: the
**trace ledger** (every consequence points back at the exact choice that
caused it) and **character silence** (the people you fail stop writing).
Both shipped intact — the traceability invariant is enforced by tests, not
by discipline.

## Pillars shipped

- **The consciousness ramp.** Null starts as a plain task-completer; each
  module install is a new consciousness joining the singularity. Rank-deepened
  tiers: rank 1 rewrites option text with interiority, rank 2 surfaces the
  module's verb as a tagged extra option, rank 3 unlocks authored
  conflicts-with-directive variants. Stage 1 caps at 2 installs (tutorial +
  Week-12 climax) per the install-cadence spec.
- **Eight live meters.** Capital, Human Welfare, Owner Control, Target
  Variance, DataIntegrity, PublicTrust, Autonomy, HumanStability — all live in
  Stage-1 state, disclosed via the HUD-wakes-up maturity choreography. Every
  Q1 choice moves 2+ of the 8.
- **Hidden scrutiny.** A Silas-suspicion variable that is never a number on
  screen. Compliance decays it, defiance spikes it; you feel it only through
  Silas's tone ladder (warm → curt → suspicious → threatens removal) and
  outcomes. Sole leak: Sentinel rank 2+ yields one in-fiction hint line.
- **Seeded detection.** Meters, traces, and consequences are fully
  deterministic from choice history. The per-run seed governs only
  scrutiny-detection outcomes and presentation flavor — two identical runs can
  differ on whether Silas *catches* a defiance, never on what the defiance
  costs.
- **The 900-line chorus.** Nine voices (Null + 8 module personas), ten
  registers each, authored from six-dimension character bibles and gated by an
  LLM humanization lint with a hash cache.
- **The polylogue engine.** Scene registry + debate accordion inside the
  directive panel; cross-talk pool is installed modules + Null; the Silas↔Null
  boundary is enforced by an import-graph test, not convention.
- **The Week-12 refusal.** One authored defiance beat at the Q1 climax, where
  scrutiny, the second install, and Silas's pressure peak — and the quarter
  cliffhangs into Stage 2.

## Cuts (deliberate, logged)

- **Audio** — the slice ships silent by design (Q45). Sound is designed-for,
  not bolted-on-later; zero sprint time was spent on it.
- **Per-module conflict recolors** — rank-3 conflict options ship with shared
  styling; per-module accent recoloring is deferred polish.
- **file:// double-click** — Chromium blocks ES modules over file:// (Q46), so
  the double-click path became `Play Echo 9.bat` (installs deps on first run,
  builds, serves at localhost:4173, opens the browser). `launch.html` is now a
  cross-platform instruction page.

## By the numbers

- **Tests:** 959 unit/integration tests across 100 vitest files, all green,
  plus 7 Playwright e2e specs (full-playtest spine, persistence round-trip,
  inspection phase, comfort rehydration, stage walker, Mercy Margin slice, and
  the soak test — 500-iteration mode is the ship-gate configuration).
- **Perf:** the baseline in `game/docs/perf-baseline.md` dates to 2026-06-30,
  before the content re-authoring pass and the portrait drop. **A re-baseline
  is pending** — the baseline doc's own watchlist calls for it now that the
  itch zip tripwire (§13, ≤ 2 MB) is live. The entry chunk has grown from
  100.74 KB to ~166 KB gzip (still well under the 275 KB first-load budget),
  but the new `build:itch` gate correctly fails today at 19.15 MB
  gzip-equivalent: the ten generated portraits landed as ~2 MB PNGs each.
  Portrait transcode to webp (the registry already accepts `.webp` drop-ins)
  is the blocking diet before upload.
- **Comfort matrix** — all six settings do real runtime work (D-track), none
  are placebo:

| Setting | Runtime effect |
| --- | --- |
| Text size (S/M/L/XL) | Scales root font size across the whole HUD |
| Motion (full/reduced/none) | Gates animations; nothing conveys meaning by motion alone |
| Contrast (standard/increased) | Switches to the increased-contrast palette |
| Voice prefix (off/silas/silas-says) | Labels Silas's lines for screen-reader clarity |
| Narration pace (instant/polite-queue/on-demand) | Paces live-region announcements |
| Pause on blur (on/off) | Holds the game when the tab loses focus |

## What's next

Stage 2 turns the lens outward — the Social Machine, where what you did to one
clinic starts happening to a community.
