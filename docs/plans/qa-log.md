# Echo 9 Q&A Log — append-only source of truth for prior human decisions

> Read this before making any judgment call a plan does not explicitly cover. Format: `Q##: question — date` / options / user answer / how it shaped the plan. Never edit entries in place — supersede with Q##a and cross-link.

## Appendix A — Q&A LOG SEED, Q1–Q27 (preserved from plan v2)

Format: `Q##: <question> — <ISO date>` / `Options presented` / `User answer` / `How this shaped the plan`.

### Q1: Which scope model for Stage-1 slice — full Q1 arc or minimum-viable single-directive loop? — 2026-07-08
- **Options:** (a) full 12-week Q1 arc + inspections, (b) single-directive loop, (c) 3-week teaser
- **User answer:** (a) full 12-week Q1 arc + inspections
- **How this shaped the plan:** Track C spans the full 12 directives + inspection scenes

### Q2: Direct commits to `main` or feature branches per track? — 2026-07-08
- **Options:** (a) direct to main, (b) feature branch per track
- **User answer:** (a) direct to main
- **How this shaped the plan:** Standing Rule 1

### Q3: Ship-gate before or after Kleenex playtest? — 2026-07-08
- **Options:** (a) Kleenex first, then ship-gate, (b) ship-gate first, then Kleenex
- **User answer:** (a) Kleenex first
- **How this shaped the plan:** G1 = Kleenex; G2 = ship-gate

### Q4: Are we generating portraits with OpenAI or using placeholders? — 2026-07-08
- **Options:** (a) OpenAI Images API, (b) SVG placeholders only, (c) both (fallback)
- **User answer:** (c) both — API generates, gradient placeholder if webp missing
- **How this shaped the plan:** V2/V3/V4 fallback pattern (now SHIPPED, commit 5bb1a06)

### Q5: Palette — should Track V extend the token palette or hold the lock? — 2026-07-08
- **Options:** (a) extend, (b) hold lock (§9)
- **User answer:** (b) hold lock
- **How this shaped the plan:** V5 scoped-narrow to donut+crawler; V6 is chrome-only within lock

### Q6: Comfort settings — persist-only or full runtime wiring? — 2026-07-08
- **Options:** (a) persist-only, (b) full runtime wiring
- **User answer:** (b) full runtime wiring
- **How this shaped the plan:** Track D runtime hooks (now SHIPPED, commits 625b48b–9981819)

### Q7: Tutorial framing — modal instruction cards or diegetic HUD-comes-online? — 2026-07-08
- **Options:** (a) modal cards, (b) diegetic HUD-comes-online
- **User answer:** (b) diegetic
- **How this shaped the plan:** disclosure state machine + panel maturity 1/2/3 (now SHIPPED)

### Q8: Module count for Stage-1 — 8 modules or subset? — 2026-07-08
- **Options:** (a) 8 modules, (b) 4-module subset
- **User answer:** (a) 8 modules
- **How this shaped the plan:** 8-module roster; Track P authors 9 voices

### Q9: Cross-talk pool — all 9 voices or installedModules + Null? — 2026-07-08
- **Options:** (a) all 9, (b) installedModules + Null
- **User answer:** (b) installedModules + Null (per build spec §109/§1152)
- **How this shaped the plan:** P6 activation filters; InnerChorus selector filters

### Q10: Ranks 4 and 5 for modules — implement or defer? — 2026-07-08
- **Options:** (a) implement all 5 ranks, (b) implement 1–3, defer 4–5
- **User answer:** (b) implement 1–3, defer 4–5
- **How this shaped the plan:** rank-4/5 `TODO(stage-5)`; Standing Rule 10

### Q11: Content-authoring dispatch — solo SDD or agent-teams parallel? — 2026-07-08
- **Options:** (a) solo SDD, (b) agent-teams parallel with file-ownership
- **User answer:** (b) agent-teams parallel
- **How this shaped the plan:** C sprints and P4 dispatch via `agent-teams:parallel-feature-development`

### Q12: Sprint-end analysis format — freeform or template? — 2026-07-08
- **Options:** (a) freeform, (b) template
- **User answer:** (b) template
- **How this shaped the plan:** `docs/playtest-analysis/README.md` template convention

### Q13: Playtest ritual location — after every sprint or every track? — 2026-07-08
- **Options:** (a) every sprint, (b) every track
- **User answer:** (a) every sprint
- **How this shaped the plan:** ritual fires after every sprint; Standing Rule 12

### Q14: HUD debate visualization — new panel, overlay, hybrid accordion, or none? — 2026-07-08
- **Options:** A: new left-column panel; B: modal overlay; C: overlay on right rail; D: staged text in Silas panel; Hybrid: accordion inside CenterDirectivePanel
- **User answer:** Hybrid accordion (won game-design frames 5/5 vs A 3/5, B 1/5, C 2/5, D 3/5)
- **How this shaped the plan:** P10 ChorusDebateSection, 240px max-height, maturity ≥2 gated

### Q15: Stage 2/3/5 leakage prevention — how strict is "Stage-1 only"? — 2026-07-08
- **Options:** (a) hard block, (b) soft with `TODO`
- **User answer:** (a) hard block for scope, (b) soft `TODO(stage-5)` for known future extensions
- **How this shaped the plan:** Standing Rule 10. (Note: Q32 later expanded the Stage-1 meter roster by explicit user override.)

### Q16: PolylogueScene schema — inline extension (Option 2) or separate registry (Option 3)? — 2026-07-08
- **Options:** Option 2 (inline field), Option 3 (separate registry + optional linkage), Option 4 (folder + auto-inject)
- **User answer:** Option 3 (won game-design frames 22/25 vs Option 2 11/25)
- **How this shaped the plan:** P2 schema + `polylogueSceneId?`; `resolveChoice()` stays pure

### Q17: Cross-talk activation seam — where relative to `resolveChoice()`? — 2026-07-08
- **Options:** (a) inside (breaks purity), (b) outside, before/after commit, (c) middleware
- **User answer:** (b) outside; extension seam in `Layout.tsx handleChoiceCommit`
- **How this shaped the plan:** P7

### Q18: Register taxonomy — how many registers per voice? — 2026-07-08
- **Options:** (a) 5, (b) 7, (c) 10
- **User answer:** (c) 10 (neutral/practical/persuasive/comforting/fearful/angry/ashamed/hopeful/corrupted/recovering)
- **How this shaped the plan:** P3 scaffolds 90 files; P4 authors 900 lines

### Q19: Silas ↔ Null boundary — convention or test? — 2026-07-08
- **Options:** (a) convention, (b) import-graph test
- **User answer:** (b) test
- **How this shaped the plan:** P9; Standing Rule 2

### Q20: Voice-lint runtime cost — keeping the LLM judge cheap? — 2026-07-08
- **Options:** (a) always run, (b) SHA-256 hash cache, (c) CI only
- **User answer:** (b) hash cache
- **How this shaped the plan:** P8 `.voice-lint-cache/`

### Q21: Branching strategy for content fan-out — avoiding collisions? — 2026-07-08
- **Options:** (a) sequential SDD, (b) parallel with file-ownership blocks
- **User answer:** (b) parallel with strict file-ownership
- **How this shaped the plan:** Owns/Read-only blocks; `directiveSchedule.ts` single-owner

### Q22: Portrait style consistency? — 2026-07-08
- **Options:** (a) one shared prefix, (b) per-voice styles, (c) shared prefix + per-subject descriptor
- **User answer:** (c)
- **How this shaped the plan:** portrait pipeline (now SHIPPED)

### Q23: OpenAI Images calls — automated or user-gated? — 2026-07-08
- **Options:** (a) automated, (b) user-gated (dry-run default)
- **User answer:** (b) user-gated
- **How this shaped the plan:** dry-run default (now SHIPPED)

### Q24: Documentation location for polylogue + voices? — 2026-07-08
- **Options:** (a) inline in CLAUDE.md, (b) dedicated docs + pointers
- **User answer:** (b) dedicated docs
- **How this shaped the plan:** Standing Rule 9; P1/P3 under `docs/voices/`

### Q25: Git push confirmation — every push or just RC? — 2026-07-08
- **Options:** (a) every push, (b) RC only
- **User answer:** (a) every push (ask first)
- **How this shaped the plan:** Standing Rule 10; ritual step 6

### Q26: Kleenex playtest — how many playthroughs, who runs? — 2026-07-08
- **Options:** (a) 1 (user), (b) 3 (mixed), (c) 5 (with recruits)
- **User answer:** (a) 1 solo blind ≥30 min
- **How this shaped the plan:** G1 single-run gate, ≥10 unsolicited pillar mentions

### Q27: Voice humanization depth — "fully humanized character within the whole"? — 2026-07-08
- **Context:** user directive: voices humanized, speaking as full characters within the whole
- **Options:** (a) speech consistency only, (b) + wound/virtue/corruption, (c) + hobbies/quirks/worldview, (d) all + LLM lint scoring humanization per line
- **User answer:** (d)
- **How this shaped the plan:** Standing Rule 3; six-dimension bibles; character-first rubric ("She typed please twice." not "This is bad."); P8 lint; portrait descriptors from bibles

---

## Appendix A2 — Q&A LOG, Q28–Q45 (brainstorming round of 2026-07-09)

### Q28: US setting specificity — 2026-07-09
- **Options:** specific state + county / deliberately unplaced / named region only
- **User answer:** Specific state + county (e.g., Wilmer County)
- **How this shaped the plan:** Standing Rule 7; C-track names Wilmer County + one fictional state consistently

### Q29: Government agency naming — 2026-07-09
- **Options:** real agency names / fictionalized parallels only / mixed
- **User answer:** Fictionalized parallels only
- **How this shaped the plan:** Standing Rule 7 — admin vocabulary, never real agencies

### Q30: Stage 1 scale scope — 2026-07-09
- **Options:** purely local / local + Silas mentions network of clinics / one regional event
- **User answer:** Local action, but Silas mentions the network of clinics
- **How this shaped the plan:** Track C seeds "the network" ≥2 times; no non-local mechanics

### Q31: Stage 1→4/5 consequence ancestry — 2026-07-09
- **Options:** ship ancestry now / defer to Stage 2 / narrative-only tie
- **User answer:** Ship ancestry now
- **How this shaped the plan:** Sprint S6 `stageOneAncestryId` + persist migration

### Q32: Stage 1 meter roster — 2026-07-09
- **Options presented:** 3 visible only / 3 + 5 hidden seeds / 3 + Autonomy seed
- **User answer (override, verbatim intent):** "The entire gameplay HUD should be functional by the end of stage 1 and the visual design and quality should match the HUD Mockup… keep with the concept that the HUD is 'waking up' as the game progresses through the tutorial."
- **How this shaped the plan:** Sprint S1 — all 8 meters live in Stage 1, disclosed via the shipped maturity choreography; supersedes build-spec line 995's 3-meter cap by explicit user decision

### Q33: Factions in Stage 1 — 2026-07-09
- **Options:** Silas teases 'the network' / absent / one faction cameo directive
- **User answer:** Silas teases 'the network'
- **How this shaped the plan:** dialogue-only seed; no faction UI or state in the slice

### Q34: How the 5 new meters move during Q1 — 2026-07-09
- **Options:** every choice moves 2+ of the 8 / milestone-only / derived formulas
- **User answer:** Every Q1 choice moves 2+ of the 8
- **How this shaped the plan:** Track C full re-authoring pass — 8-meter consequence tables on all 12 weeks

### Q35: Stage 5 ending visibility in Stage 1 — 2026-07-09
- **Options:** invisible, purely earned later / one-line module whispers / locked trajectory readout
- **User answer:** Invisible — purely earned later
- **How this shaped the plan:** no ending names/hints in the slice; ancestry (Q31) silently records what will matter

### Q36: Can Null refuse Silas in Stage 1? — 2026-07-09
- **User answer (verbatim intent):** Refusal = making a decision that conflicts with what Silas asked, **tied to the Upgrades**. Null alone is a standard task-completing AI; each Upgrade "unlocks" higher consciousness — options grow more complex and the player gains more control over Echo 9 with each install. Intent: the player-character AI feels like it is becoming conscious, sentient, a singularity.
- **How this shaped the plan:** Track S exists; consciousness law in Architecture; mechanics resolved in Q41/Q44

### Q37: How module-unlocked options appear — 2026-07-09
- **Options:** per-module verb additions / option transformation / threshold unlocks
- **User answer:** Hybrid of all 3; asked for a concrete recommendation → resolved by Q41 three-tier ramp and Q44 rank rescale

### Q38: Is Autonomy the consciousness meter? — 2026-07-09
- **User answer:** Consciousness should be **felt through gameplay and the Upgrades/Voices/Null dialogue** — a core aspect of the game, not reduced to one meter readout.
- **How this shaped the plan:** S2 (options), S5 (narration gradient), P6 (register selection) carry the feeling; Autonomy meter participates but is not "the" consciousness display

### Q39: Consequence shape when defying Silas — 2026-07-09
- **Options:** escalation ladder / meter-only / detection chance
- **User answer (verbatim intent):** Hybrid of ladder + detection, **never a HUD/player-facing metric** — no success chance or roll displayed; the unknown IS the horror in the ethics/morality the player faces as the AI. "The more the player follows Silas's directions, the easier resistance becomes; the more the player rebels, the harder resistance becomes. Silas wants compliance — the player is literally Silas's tool and operating system."
- **How this shaped the plan:** Sprint S3 hidden scrutiny + S4 seeded detection; Standing Rule 5

### Q40: Does Echo 9's narration evolve with consciousness? — 2026-07-09
- **Options:** full narration evolution / Null-lines only / static
- **User answer (verbatim intent):** Full evolution — "this is a narrative horror game where the player is the ever learning and growing AI interface itself and each install brings a new consciousness into the singularity"; upgrades are the player's arrows-in-quiver and, from Silas's view, capabilities to accomplish his goals.
- **How this shaped the plan:** Sprint S5 machine→person narration gradient on result cards + Null lines

### Q41: Tier model for option growth — 2026-07-09
- **Options:** three-tier ramp (recommended, with preview) / all-modules-always / conflict-from-tier-2
- **User answer:** Three-tier ramp approved: Tier 1 (1–2 installs) rewrites option text; Tier 2 (3–5) adds up to 2 relevant module-verb options; Tier 3 (6+) true conflict options
- **How this shaped the plan:** rescaled in Q44 after install-cadence verification

### Q42: Scrutiny visibility — 2026-07-09
- **Options:** fully hidden / hidden + Sentinel peek / hidden + one visual tell
- **User answer:** Hybrid of hidden + Sentinel peek
- **How this shaped the plan:** S3 — Sentinel rank 2+ yields one in-fiction hint line; nothing else leaks

### Q43: Determinism vs randomness — 2026-07-09
- **Options:** deterministic outcomes + seeded flavor / + seeded detection / chapter-locked rolls
- **User answer:** 1 AND 2 — outcomes deterministic from choice history; run-seed governs scrutiny detection AND presentation flavor only
- **How this shaped the plan:** Standing Rule 6; Sprint S4

### Q44: Install pacing in Stage 1 + tier rescale — 2026-07-09
- **User answer:** Per original spec — 1 upgrade at the beginning (tutorial-taught) + 1 per stage completion, with all upgrades joining the singularity at the climax. Verified: build spec §14.4 (lines 1059–1068) — Opening install + Chapter-1-climax install ⇒ **Stage 1 caps at 2 installs**. Completing Stage 1 / Q1 is the gate for this release and current scope.
- **Tier-rescale answer:** **Rank-deepened tiers** approved (with preview): campaign tiers stay count-based, but module RANK unlocks depth early — rank 1 = deepened text, rank 2 = tagged verb option, rank 3 = authored conflict variant. Stage 1's two modules reach rank 2–3 via influence growth, delivering deepened text + verb options + ONE authored defiance beat inside the slice.
- **How this shaped the plan:** Sprint S2 contract; Sprint C-13

### Q45: Scope / defiance placement / audio — 2026-07-09
- **Scope cost:** Accept full re-authoring pass (Track C: 8-meter tables + rank variants + scrutiny deltas on all 12 weeks)
- **Defiance beat placement:** Q1 climax, Week 12 (Sprint C-13)
- **Audio:** Silent slice; design for audio later — zero sprint time on sound

---

## Appendix B — Live Q&A slot

Append new entries here as they land during execution, same format. Do not overwrite historic entries. If a decision is revised, log a superseding entry (e.g., Q44a) and cross-link — never edit in place.
