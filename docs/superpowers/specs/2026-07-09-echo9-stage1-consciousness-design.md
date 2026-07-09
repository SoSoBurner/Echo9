# Echo 9 Stage-1 Consciousness Design — brainstorming output (2026-07-09)

Design consolidated from the 2026-07-09 brainstorming round (Q28–Q45; full Q&A in `docs/plans/qa-log.md` and plan v3 appendices). Implementation plan: `C:\Users\CEO\.claude\plans\make-sure-you-review-glittery-matsumoto.md` (v3).

## 1. Identity & framing

Echo 9 is a text systems-horror browser game where **the player IS the AI** being trained by Silas, its owner-operator. Silas issues directives; the player executes them; named humans — starting with **Lenora Pike at East Wilmer Clinic** in fictional **Wilmer County** (a specific fictional US state, named consistently) — absorb the consequences. The horror is systemic complicity made legible. By Stages 4/5 the ripple scales clinic → community → regional → national → world, built out from the US setting. Government bodies are fictionalized parallels only (admin vocabulary: "benefits office," "labor board," "compliance division"). Stage 1 stays local in action; Silas name-drops "the network of clinics" as the scale seed. Stage-5 endings are invisible in Stage 1 — purely earned later.

## 2. The consciousness ramp (core)

- **Null baseline:** a standard task-completing AI. Four plain compliant options per directive. Pure tool.
- **Each module install = a new consciousness joining the singularity.** Stage 1 installs exactly 2 of 8 (tutorial install after the first unresolved human trace; second at the Q1 Week-12 climax), per build spec §14.4.
- **Rank-deepened tiers:** campaign tiers key to install count (Tier 1 = 1–2, Tier 2 = 3–4, Tier 3 = 5+), but each installed module's RANK unlocks depth early — rank 1 deepens option text with interiority; rank 2 surfaces the module's verb as a tagged extra option (max +2 on screen); rank 3 enables a "conflicts with directive" variant where authored.
- **One authored defiance beat:** Week 12, the Q1 climax — scrutiny, second install, and Silas pressure peak; cliffhangs into Stage 2.
- **Narration evolves:** Null's composed lines and result-card copy shift along a machine→person gradient keyed to install count (0 machine / 1 waking / 2+ person). "TASK COMPLETE" becomes "I filed it. I keep thinking about her."

## 3. Eight live meters

All 8 meters (Capital, Human Welfare, Owner Control, Target Variance, DataIntegrity, PublicTrust, Autonomy, HumanStability) exist in Stage-1 state and disclose progressively via the shipped HUD-wakes-up maturity choreography, reaching full `HUD Mockup.png` parity by end of Q1. Every Q1 choice moves 2+ of the 8. (Explicit user override of build-spec line 995's 3-meter cap.) Consciousness is *felt* through gameplay, upgrades, and dialogue — no single meter is "the consciousness readout."

## 4. Hidden scrutiny

A hidden Silas-suspicion variable: compliance decays it (resistance gets safer), defiance spikes it (resistance gets harder — the player is literally Silas's tool and operating system). Never shown as a number, roll, or meter. Felt only through Silas's tone, an escalation ladder (warm → curt → suspicious → threatens module removal), and outcomes. Sole leak: Sentinel rank 2+ yields one in-fiction line ("He is watching your process logs.").

## 5. Determinism

Meters, traces, and consequences derive **fully deterministically** from choice history (§11 traceability airtight; bugs reproducible). A per-run seed governs ONLY (a) scrutiny-detection outcomes — two identical runs may differ on whether Silas catches a defiance — and (b) presentation flavor (debate speaking order, ambient lines). Every Stage-1 trace records `stageOneAncestryId` so Stage-4/5 consequences trace back to the exact Stage-1 choice.

## 6. Carried-forward decisions (Q1–Q27)

Nine-voice polylogue engine (Null + 8 humanized personas × 10 registers = 900 lines; persona bibles with wound/virtue/corruption/hobbies/quirks/worldview; LLM humanization lint), Silas↔Null-only boundary law (import-graph test), hybrid debate accordion in CenterDirectivePanel, Option-3 PolylogueScene registry, cross-talk pool = installedModules + Null, ranks 4–5 deferred `TODO(stage-5)`, direct commits to main, ask-before-push, palette lock, Kleenex gate then ship-gate, itch prep track, silent slice (audio designed-for, deferred).

## 7. Shipped-state boundary

Already shipped (do not re-implement): all HUD panels, disclosure choreography, comfort runtime wiring, DonutChart/AlertCrawler, 10 portraits, module roster + rank dispatch, walkable Q1 arc skeleton. New work: Track S consciousness systems, Track C content re-authoring (8-meter tables + rank variants + scrutiny deltas), Track P polylogue, launch.html, final chrome pass, itch artifacts, gates.
