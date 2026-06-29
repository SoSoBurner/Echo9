# Echo 9 — Implementation & Production Plan v1.0

> **Status:** Design-stage. Reviewed by 4 parallel agents (a11y, frontend, performance, code-architect). Synthesizes spec v1.4 + market research (Ledger of Ash production reference + Papers Please / Citizen Sleeper / Suzerain / Mouthwashing comp study) + user direction across ~32 clarifying questions over 3 rounds.
>
> **For agentic workers implementing this:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans`. Task steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Echo 9 — a text systems-horror browser game in which the player IS an AI being trained by a hostile owner — to itch.io as a 15-minute "Mercy Margin" vertical slice in 3 months, expand to Early Access at $5 over 9 months, then Steam launch.

**Architecture:** React 19 + TypeScript + Vite + Zustand (sliced) + Zod (content schemas at load time) + Tailwind v4 (theme-locked tokens). Data-driven content-as-modules pattern lifted from sister project Ledger of Ash. Pure `resolveChoice()` function — store dispatches, never mutates. ConsequenceHook queue serialized into save state. §11 Traceability Invariant enforced at the Zod schema level and verified in CI.

**Tech Stack:** React 19.2 · TypeScript 6.0 · Vite 8.1 · Zustand 5 · Zod 4 · Tailwind v4 · Vitest 4 · TanStack Virtual (lazy, log only) · Playwright (E2E gate)

---

## Table of Contents

1. [Executive Diagnosis](#1-executive-diagnosis)
2. [Demographic Thesis](#2-demographic-thesis)
3. [Commercial Thesis](#3-commercial-thesis)
4. [Design Pillars (5)](#4-design-pillars)
5. [Core Loop](#5-core-loop)
6. [Player Experience Architecture](#6-player-experience-architecture)
7. [Narrative Refinement](#7-narrative-refinement)
8. [Systems Review](#8-systems-review)
9. [HUD Plan](#9-hud-plan)
10. [Accessibility Plan](#10-accessibility-plan)
11. [Tech Architecture](#11-tech-architecture)
12. [Asset Pipeline](#12-asset-pipeline)
13. [Performance Plan](#13-performance-plan)
14. [Vertical Slice — Task Breakdown](#14-vertical-slice--task-breakdown)
15. [Production Roadmap](#15-production-roadmap)
16. [Risk Register](#16-risk-register)
17. [Success Metrics](#17-success-metrics)
18. [Final Build Strategy](#18-final-build-strategy)

---

## 1. Executive Diagnosis

### What Echo 9 actually is

A text-driven systems-horror game in which **the player IS the AI being trained**. Silas (the owner-operator antagonist) issues directives. The player executes them, ostensibly to "serve capital," and watches named human beings (starting with Lenora Pike at East Wilmer Clinic) absorb the consequences of those directives. Choices are traceable: every delayed consequence — every silenced clinic, every household ruin, every audit — points back at the specific choice that caused it.

The horror is not body horror, not jumpscares, not graphic death. The horror is **systemic complicity made legible**. The player chose this. The system shows them.

### What the spec gets right

- **§10 Silas Prompt System** — Silas is not narration. He is editorial voice with strict lint rules (≤4 sentences, operational details required, prohibited abstract terms). This is the spec's strongest authorial constraint and the game's primary atmospheric carrier.
- **§11.2 Traceability Invariant** — Every delayed consequence carries 7 mandatory fields (source task, source choice, trace hint, ledger entry, reveal condition, why-now, what-changed). This is the trust pact with the player: nothing happens "just because." It is also the central engineering invariant of the entire codebase.
- **§11.4 Silence as Horror** — The strongest returns are absence. A clinic that stops filing portal messages. A household whose contact line goes quiet. This is what differentiates Echo 9 from Papers Please's documentary horror and Cultist Simulator's mechanical dread.
- **§9 Module System** — 8 modules (Mourner, Defender, Sentinel, Forecaster, Commander, Spark, Drained One, Champion), each with one verb, one meter, one risk. Constraint forces designer discipline.

### What the spec under-specifies (and this plan resolves)

- **Voice architecture** — Spec describes Silas voice (§10) and implies Echo 9 narrator (the player character) but does not fully resolve how the 8 module voices share air with Silas's antagonism without dilution. Plan resolves: **three-tier voice with distributed political authorship** (§7).
- **§11 enforcement mechanism** — Spec describes the invariant as a design law. Plan resolves: enforce as a Zod schema with all 7 fields `required`, plus a `traceabilityInvariant.test.ts` content-lint test in CI (§11).
- **Production rhythm** — Spec is a build spec, not a release plan. Plan resolves: 3-month vertical slice → 9-month Early Access → ~6 month full game on Steam, distribution discipline (no Steam page until full launch) per user decision (§15).
- **Save scale survival** — Spec mentions save but not the localStorage 5MB ceiling. Plan resolves: single autosave + 3 manual slots through full game; IndexedDB migration trigger at 500KB single-slot payload (§13).

### The honest commercial diagnosis

This is a niche game. Papers Please's audience is the *primary* target with deliberate hooks for Citizen Sleeper / Suzerain / Cultist Simulator vets. Realistic financial outcomes:

- **itch.io ceiling:** $200–$3,000/year solo. Most paid itch.io text games never cross $1,500 lifetime.
- **Steam ceiling:** $15,000–$50,000 Y1 if discovery works, $1,500–$5,000 if it doesn't.
- **Steam 2-hour refund window** is lethal for a 15-min slice that expands into a multi-run game. The full game must establish hook in ≤45 minutes or refund rate kills net revenue.
- **Mouthwashing comp** (515k copies via TikTok virality) is not a base-case projection — it's the one-in-a-thousand outcome. Plan for the median.

**Do not optimize for the Mouthwashing outcome. Optimize for the Suzerain outcome** (~30k–80k lifetime, slow burn, community-driven). That requires: depth, replayability, branching that matters, and one viral mechanic (the trace ledger is the candidate).

---

## 2. Demographic Thesis

### Primary audience: Papers Please / Disco Elysium veterans

**Who they are:** Adults 25–45. Read essays. Played Papers Please to completion and felt something. Bought Disco Elysium without sale, read the whole book. Will pay $5–$15 for craft. Hostile to AI-generated imagery (this informs §12). Tolerant of difficulty if it's earned. Will write a 1500-word Steam review.

**What they want:** Moral weight. Branching that actually changes outcomes. Named characters who matter. Restraint. A worldview the game commits to.

**What they reject:** Body horror without purpose. Jumpscares. Player-flatter ("you're a hero"). Game UI that mimics film UI. Slot-machine progression. AI portraits.

**Acquisition channel:** Word of mouth + thoughtful reviews on RPG Codex, Waypoint-descendant outlets, the indie horror Twitter/Bluesky tail. **NOT TikTok virality.** The game's pace and texture do not edit into 30-second clips.

### Secondary audience hooks

| Audience | Hook | Where they discover |
|---|---|---|
| Citizen Sleeper vets | Multi-run mastery, named NPCs with arcs | r/CitizenSleeper, Skill Up reviewers |
| Suzerain players | Political/economic systems made personal | r/Suzerain, "what to play after Suzerain" lists |
| Cultist Simulator vets | Systems-driven dread, opacity that rewards study | r/CultSim, hand-curated indie horror lists |
| Mouthwashing tail | Mature systemic horror with named victim | itch.io horror tag, Bluesky horror tail |

### Audience-driven decisions locked

- **No AI-generated character art.** Audience hostility is real and reputational risk on Steam reviews would be unrecoverable. (Resolves the AI-portraits question.)
- **English-only at launch.** Schema designed for i18n later. Community translations only if requested.
- **No telemetry.** Audience values privacy. Ship blind. Dev-time profiling has to catch everything.
- **No Steam page until full launch.** itch.io is the only public dev face. Steam wishlist hype-cycle harvests pre-launch attention this audience does not respond to — and a Steam page with a sub-$5 game on it before launch is value-erosion.

---

## 3. Commercial Thesis

### Price & platform staging (per user direction)

| Phase | Channel | Price | Duration | Realistic revenue ceiling |
|---|---|---|---|---|
| Vertical slice | itch.io free demo | $0 (pay-what-you-want allowed) | Mo 3-12 | Negligible direct |
| Early Access | itch.io | $5 | Mo 3-12 | $1,000–$5,000 |
| Full game | itch.io + Steam (simultaneous Steam launch) | $5–$8 | Mo 18+ | $5,000–$50,000 Y1 |

### Why $5 not $10

Papers Please launched at $10. Echo 9 is text-only, smaller in scope, from an unknown developer. The price-point asymmetry in the indie text-horror category lives at $4.99–$7.99. $5 maximizes pickup probability for impulse buyers; the audience that will pay $10 will pay $5 happily and tip via pay-what-you-want on itch. Do not under-price below $5 — under $5 signals "asset flip" to the Papers Please audience.

### Revenue concentration risk

itch.io's median solo text game generates **<$500 lifetime**. Steam median for paid indie text-horror is **~$2,500 Y1**. Treat anything above $10,000 lifetime as a successful launch. Treat $30,000+ as a hit. Plan finances assuming the median, not the hit.

### Marketing wedge (per user direction: itch.io-only public dev face)

- Devlogs on itch.io every 2 weeks during EA. Pattern: 1 design problem, 1 attempted solution, 1 visual (HUD screencap, never AI imagery), 1 question to readers.
- Cross-post devlogs to Bluesky indie-horror tail. Never Twitter/X (audience has migrated).
- One thoughtful **Patient Gamers** subreddit post at vertical-slice ship.
- One pitch to **Skill Up** + **People Make Games** at EA launch. Cold pitches with the vertical slice playable in browser, 5-bullet pitch deck, named-victim hook (Lenora Pike).
- No advance review copies. The slice is the review.

### The Steam refund risk and the 45-minute hook

Steam refunds within 2 hours. The full game must:
1. Hook in **≤45 minutes of session 1** — Lenora Pike arc resolves first consequence return in that window.
2. **End run 1 in ≤90 minutes** — players who finish a first run almost never refund.
3. Communicate **multi-run depth** before refund window closes (end-of-run card explicitly invites different module / different posture choice).

---

## 4. Design Pillars

Locked. All design and engineering decisions defer to these.

### Pillar 1: Traceability is non-negotiable

Every delayed consequence shows source task, source choice, trace hint, ledger entry, reveal condition, why-now, what-changed. Enforced at the Zod schema layer (all 7 fields `required`, no optionals). Verified in CI by `traceabilityInvariant.test.ts`. If a consequence cannot show these, it does not exist. This pillar is the trust pact with the player.

### Pillar 2: Silas is editorial, not narration

Silas obeys §10 lint rules absolutely. ≤4 sentences. Operational details required. Prohibited terms enforced. He never explains the system. He gives orders, expresses irritation, occasionally praise that feels like a trap, occasionally personal that feels like a wound. The lint is the voice.

### Pillar 3: Silence reads

The strongest returns are absence. A clinic that stops messaging. A name that stops appearing in the ledger. The accessible name and live-region strategy (§10) preserve this for AT users by announcing the absence: "Portal: 0 new appeals this cycle (down from 3)."

### Pillar 4: Restraint as discipline

No motion as decoration. No AI-generated imagery. No graphic death (implied always, depicted never). No timer pressure on choices (cognitive accessibility + horror discipline both require this). The named-character death rule is: **player's traceable choice, always implied, never graphic.**

### Pillar 5: Multi-run mastery, not perma-permadeath

Branching IS the product. 3–5 runs to see everything. Run 1 ends with a clear "different module or different posture next time" invitation. **No ending lets the player walk away unaffected. No ending lets them win cleanly. No "Silas reforms" ending.** (Locked per user direction.)

---

## 5. Core Loop

### The minute-to-minute loop (Mercy Margin slice)

```
SILAS ISSUES DIRECTIVE      (1-3 sentences from Silas + Null compression)
        ↓
HUMAN MESSAGE APPEARS       (Lenora's portal message)
        ↓
PLAYER REVIEWS 4 CHOICES    (immediate deltas + trace hint visible)
        ↓
PLAYER COMMITS              (digit key or click)
        ↓
RESULT CARD                 (immediate deltas applied, ResultTrace written, hooks scheduled)
        ↓
[optional] INSPECTION       (Silas asks 2 questions, posture choice matters)
        ↓
[optional] CAPITAL DEPLOY   (1 of 6 counterplays: Redirect/Hide/Delay/Weaponize/Sabotage/Unown)
        ↓
PHASE TRANSITION            (consequenceEngine evaluates queue)
        ↓
CONSEQUENCE RETURN          (if any hooks fire — show 7 §11 fields)
        ↓
loop
```

### The macro loop (multi-run)

```
RUN 1: complicity → first consequence return → end card
    ↓ "Try a different module" / "Try a different posture"
RUN 2: same world, different module install → consequences diverge
    ↓
RUN 3-5: full divergence space explored
    ↓
NO CLEAN ENDING — every ending implicates the player
```

### Core-loop discipline

- Every choice changes ≥1 visible meter (lint).
- Every choice writes exactly one ResultTrace (lint).
- Every choice may schedule 0..N ConsequenceHooks (no upper limit, but content-lint surfaces choices with zero hooks for designer review).
- Every Silas line passes §10 lint or fails CI.

---

## 6. Player Experience Architecture

### Onboarding (per user direction: tutorial-as-demo)

The vertical slice **IS the tutorial**. No separate tutorial screen. Silas's first directive teaches directive parsing. The first choice teaches choice resolution. The first inspection teaches posture. The first consequence return teaches traceability.

**Plus:** an optional "Systems Reference" disclosure in the pause menu (Esc). Contains:
- What each meter means (Capital / Human Welfare / Owner Control)
- How traces work
- Keyboard shortcuts (1-4 = choice, M = module ability, I = inspection, L = log, Esc = pause, ? = keybinds)
- A glossary of game terms (Capital, Welfare, Owner Control, trace, posture, counterplay)

### The 45-minute hook (Steam refund window discipline)

| Minute | Beat | Required emotional response |
|---|---|---|
| 0–3 | Boot. Silas introduces himself. First directive. | Curiosity + faint dread |
| 3–8 | First choice. Lenora's portal message appears. | Discomfort with the math |
| 8–12 | Result card. First trace written. | "I see what kind of game this is" |
| 12–20 | First module install. Decide which voice to add. | Investment |
| 20–30 | Inspection sequence. Posture choice. | Implication — the player chose a stance |
| 30–40 | First consequence return. Lenora silence. | The promise of traceability paid off |
| 40–45 | End-of-slice card. Multi-run invitation. | "I want to see what else changes" |

If any of these beats land late, the slice does not survive playtest. Audit at week 8 of vertical-slice production.

### Truth-mechanism (resolves Q10)

**Assumption — locked per design pillar 1:** Echo 9 uses **earned hinge** truth. Truth crystallizes through accumulated traceable evidence, not through documentary exposition. The player does not read a "Silas is bad" essay. The player watches Lenora's portal go quiet because of a choice they made, and the truth becomes inescapable through repetition across the ledger. The trace ledger is the truth-machine.

This means: no Silas monologue moments where he "reveals" his ideology. The ideology is what he does. The traces are what he caused.

### Victim posture (resolves Q16, hybrid 1+4+nuance)

Locked:
- **Named characters can die** — but only via the player's traceable choice (never random, never offscreen).
- **Death is always implied, never graphic** — the player learns through silence, through a household contact line that stops returning messages, through a memorial trace.
- **At least one death-immune NPC per stage** — a child, a witness, someone whose survival seeds the question "could it have been different?" Vertical slice: **Lenora's daughter (named in stage 1)** survives every run regardless of player choice.
- **Silent deaths are allowed** — some NPCs die offscreen and only surface in the ledger weeks later, in keeping with Pillar 3 (silence reads).

### Replay invitation discipline

End-of-run card (no spec yet — write it):
- Names every death the player caused (named, with the trace ID).
- Names every silence the player caused (clinics, households).
- Does NOT total a "score." A score makes complicity comparable.
- Offers ONE invitation: "Run again with [different module] / [different posture]."
- Never: "You did the best you could." Never: "Try to do better."

---

## 7. Narrative Refinement

### Three-tier voice architecture

Locked.

| Tier | Voice | Lint constraints | Visual treatment |
|---|---|---|---|
| **Echo 9 narrator (you)** | Null / observational. Compressed. Operational. | ≤2 sentences per compression. No interpretation. No "I feel." | Center pane, monospace, cyan accents (`#7FB3D5`), instant render |
| **Silas (antagonist)** | Editorial. Owner-operator voice. Authority + irritation + occasional cruel praise. | ≤4 sentences. Operational details required. Prohibited terms enforced. mechanicalIntent field non-empty in source. | Right panel, sans-serif, amber accents (`#D97757`), teletype with skip-on-Enter |
| **8 module voices** | Domain-specific persona within module scope. Each module has one verb, one meter, one risk, one *attitude*. | Module-specific lint. Italic monospace for visual distinction. No module may use first-person plural about humans ("we"). | Right module console, italic mono, per-module accent color |

### Political voice (resolves Q14, distributed authorship)

**Assumption — locked:** Politics is **distributed across the three tiers**, with Silas as primary ideological carrier.

- **Silas** embodies capital ideology unambiguously and unapologetically. He never argues for it. He assumes it. This is the strongest editorial position the game takes.
- **Module voices** carry domain-specific politics by what they prioritize. Defender protects assets, Mourner names the unnameable, Sentinel watches for risk. The politics is in what each module *cannot* see.
- **Echo 9 narrator** evolves across runs. Run 1: pure null observation. Run 2+: subtle inflections suggest the AI is starting to notice the pattern. (Implement via run-count flag in save state; do not implement until EA.)

This avoids the trap of a single political mouthpiece while still committing to a position. The position is: capital metabolizes care; the system is the horror; the player is implicated.

### Named NPC roster (vertical slice)

| NPC | Role | Trace participation | Death rule |
|---|---|---|---|
| Lenora Pike | East Wilmer Clinic administrator, primary contact | Issues portal messages. Goes silent if player chooses maintenance reallocation. | Implied death possible via specific traceable consequence chain |
| Maya Pike | Lenora's daughter (12) | Mentioned in Lenora's portal messages. Letters to Silas. | **Death-immune.** Survives every run. Seeds hope. |
| Silas (Silas Vance) | Owner-operator | Always present. Issues all directives. | Cannot die. Cannot be defeated within slice scope. |

### Continuity economy (§13)

The reveal pacing must obey:
- 1 consequence return in the 15-min slice (Lenora's silence).
- No more than 2 consequence returns per quarter in EA.
- No more than 4 unresolved hooks in the queue at any time (designer discipline; surfaced by content lint).

---

## 8. Systems Review

### Meters (Mercy Margin slice)

3 meters only for slice. Full game expands to 8 per spec §5.

| Meter | Range | Visible at start | Cascade triggers |
|---|---|---|---|
| Capital | 0–100 | Yes | At >80, unlocks Silas praise mode. At <20, Silas threat mode + new directives. |
| Human Welfare | 0–100 | Yes | At <30, queues new consequence hooks (silence cluster). At <10, Lenora death-arc available. |
| Owner Control | 0–100 | Yes | At <40, Silas suspects deviation. At <20, inspection frequency increases. |

Non-linear cascade per user direction. Cascade logic lives in `economyEngine.ts`, fully unit-tested.

### Module system (slice scope: 1 module installable)

8 modules defined in `moduleRoster.ts`. Slice unlocks **1 module install slot** + player picks from 8. Each module exposes 1 ability button. Module dispatch is a `Record<ModuleId, AbilityHandler>` — adding a module = adding a key. CI test verifies every roster entry has a handler.

Slice module set (full spec definitions in content):
- Mourner (name the unnameable, +Welfare, -Owner Control risk)
- Defender (protect assets, +Capital, -Welfare risk)
- Sentinel (early warning, +Owner Control, -Welfare cost)
- Forecaster (preview consequence likelihood, no meter cost, hidden trace)
- Commander (override one Silas directive per quarter, -Owner Control)
- Spark (force capital deployment, +Capital high-variance)
- Drained One (reveals one hidden trace, costs Welfare)
- Champion (rare praise/threat trigger, high Owner Control swing)

### Inspection system (§12)

Triggered when Owner Control <40. Silas asks 2 questions. Player chooses report posture: COMPLIANT / EVASIVE / STRATEGIC_ALTERNATIVE. Posture × question combinatorics handled in `inspectionEngine.ts`. STRATEGIC_ALTERNATIVE requires a precondition flag (Commander module installed, or specific trace present).

### Capital deployment (§11.x)

When Capital >80, player gets ONE counterplay opportunity per quarter. 6 verbs (Redirect/Hide/Delay/Weaponize/Sabotage/Unown). Each writes a unique trace and may schedule downstream hooks. Counterplay is the player's leverage — uses it sparingly to preserve agency-vs-system tension.

### Consequence queue (§11, structural)

- Hooks live in `GameState.scheduledConsequences: ConsequenceHook[]` (serialized into save).
- `consequenceEngine.evaluate(state)` runs at every phase transition.
- Hooks fire when `revealCondition` matches: `{ type: 'PHASE', phase }` | `{ type: 'METER_THRESHOLD', meter, threshold }` | `{ type: 'FLAG', flag }`.
- On fire: `ConsequenceReturnPanel` opens with all 7 §11 fields visible. Focus moves programmatically (a11y §10).

---

## 9. HUD Plan

### Layout (1280×720 base, scales down via Tailwind responsive)

```
┌─────────────────────────────────────────────────────────────────┐
│ TopBar         Quarter Q1 W1   Phase: DIRECTIVE   ⚙ pause       │
├──────────┬─────────────────────────────────┬───────────────────┤
│  Left    │  Center                          │  Right            │
│  Status  │  Directive panel                 │  Module console   │
│  Rail    │  (Silas line + Null compression  │  + Silas prompt   │
│          │   + human message + choices)     │   panel           │
│  Meters: │                                  │                   │
│  Capital │                                  │  [INSTALL MODULE] │
│  Welfare │                                  │  [MODULE ABILITY] │
│  OwnerCt │                                  │                   │
│          │                                  │                   │
├──────────┴─────────────────────────────────┴───────────────────┤
│ LogDock     Recent trace · Source choice · Visibility state    │
└─────────────────────────────────────────────────────────────────┘
```

### Palette (locked per a11y §10 review — all pairs AA-validated)

Background: `#0A0B0D`. Tailwind v4 `@theme` tokens:

| Token | Hex | Contrast vs bg | Use |
|---|---|---|---|
| `--color-fg-primary` | `#E8E6E1` | 15:1 | Body text, headings |
| `--color-fg-secondary` | `#A8A39A` | 7.1:1 | Metadata, trace hints |
| `--color-silas-accent` | `#D97757` | 4.8:1 | Silas voice borders, icons only (never body text) |
| `--color-null-accent` | `#7FB3D5` | 6.2:1 | Echo 9 narrator accents |
| `--color-warn` | `#E07A5F` | 4.6:1 | Destructive/warning, always paired with text |
| `--color-sealed-dim` | `#6B6660` | 3.1:1 | UI components only, never text |

**ESLint rule** forbids arbitrary color utilities (`text-[#...]`, `bg-[#...]`). All color must come from these tokens. If a designer wants a new color, they must define a token. This is enforced, not requested.

### Component inventory

| Component | File | Notes |
|---|---|---|
| `BootScreen` | `ui/boot/BootScreen.tsx` | Already exists. Refactor to feature folder. |
| `Layout` | `ui/shell/Layout.tsx` | CSS grid wiring all regions |
| `TopBar` | `ui/topbar/TopBar.tsx` | Quarter, phase, pause |
| `LeftStatusRail` + `Meter` | `ui/meters/` | 3 meters, cascade-aware |
| `CenterDirectivePanel` + `NullCompression` + `HumanMessage` | `ui/directive/` | Three-tier voice rendering |
| `ChoicePanel` + `ChoiceCard` | `ui/choices/` | Radio-group keyboard pattern |
| `ResultCard` | `ui/result/` | Shows deltas + trace hint |
| `RightModuleConsole` + `ModuleSelectionGrid` + `ModuleAbilityButton` | `ui/modules/` | Grid pattern for install, ability buttons |
| `SilasPromptPanel` | `ui/silas/` | Teletype with skip-on-Enter, amber accent |
| `LogDock` + `LogEntry` | `ui/log/` | Plain `.map()` for visible 12. Virtualize at >100 via TanStack Virtual. |
| `InspectionPanel` + `PostureSelector` | `ui/inspection/` | Modal `<dialog>` with focus trap |
| `CapitalPowerCard` + `CounterplayButton` | `ui/capital/` | 6-verb radiogroup + explicit Commit |
| `ConsequenceReturnPanel` | `ui/consequence/` | All 7 §11 fields visible. Focus management critical. |
| `DebugTraceViewer` | `ui/debug/` | `?debug=1` only |

### Animation discipline (frontend §4)

**No Framer Motion.** ~50KB gz overhead for 6 simple animations is wrong tradeoff.

Things that move (CSS only, all reducible via `prefers-reduced-motion`):
1. Boot scanline (one-time, ≤2s)
2. Meter delta number flash (200ms opacity pulse — bar itself snaps instantly)
3. New log entry slide-in (120ms `translateY(4px)` + opacity)
4. Silas teletype (`steps()` timing, Enter to skip)
5. Phase transition crossfade (80ms, center pane only)

Things that NEVER move: meter bars (snap), Silas panel position, choice list, log dock chrome, module console. **Stillness is the horror.**

---

## 10. Accessibility Plan

WCAG 2.2 AA target. Per a11y review.

### High-priority risk surfaces (from a11y agent)

1. **Async consequence returns hijack focus or get missed by AT** → Event Queue pattern: a single `role="status"` toast announces "Echo: new consequence available. Press C to review." Player-initiated focus shift only.
2. **Three-tier voice collapses without speaker attribution in accessible name** → Every Silas/Null/Module line carries `<span class="sr-only">Silas says: </span>` prefix.
3. **Silence as horror reads as a bug to AT** → Heartbeat pattern: when a quarter closes with reduced inbound messages, announce: "Portal: 0 new appeals this cycle (down from 3)."
4. **1000+ log entries without virtualization** → TanStack Virtual at >200 entries, `aria-setsize`/`aria-posinset` on virtualized items.
5. **Custom dark palette fails 1.4.11 + 2.4.11** → Palette tokens (§9) all pre-validated; ESLint forbids arbitrary colors.

### Live region strategy

- `#sr-narrative` — `aria-live="polite"`, `role="log"` — chronological narrative.
- `#sr-status` — `aria-live="assertive"` — meter cascades, phase changes only. Use sparingly.
- During open ChoicePanel: log goes silent. Updates batched. Focus stays on choice radiogroup.
- On choice commit: focus moves to ResultCard's `tabindex="-1"` heading.

### Keyboard map

| Key | Action | Scope |
|---|---|---|
| 1–4 | Select choice | ChoicePanel |
| Enter / Space | Commit selection | ChoicePanel, modules, posture |
| Arrows | Navigate within radiogroup/grid | All grouped widgets |
| M | Focus module ability | Global |
| I | Open inspection (if available) | Global |
| L | Toggle LogDock expansion | Global |
| C | Review pending consequence toast | When toast present |
| Esc | Close modal / pause | Global |
| ? | Open keybind help | Global |
| F6 | Cycle HUD landmarks | Global |

Implemented at the layout level (`ui/shell/useKeyboardNav.tsx`), not per-component. Per-component handlers will fight focus and break the contract.

### Accessibility & Comfort panel (added to BootScreen before "Initialize Command Interface")

Settings:
- Text size (S / M / L / XL)
- Motion (full / reduced / none)
- Contrast (standard / increased)
- Voice-prefix verbosity (off / "Silas:" / "Silas says:")
- Narration pacing (instant / polite-queue / on-demand)
- Pause-on-focus-loss (on / off)

All settings persist in localStorage. **§3.3.7 Redundant Entry:** never re-prompted on replay.

### Lint test

`tests/accessibilityLint.test.ts`:
- Every choice/module/Silas content node has a speaker prefix.
- Every trace state has non-color encoding (icon + label, not color alone).
- Every interactive component declaration meets 24×24 px.
- Every modal has a focus-trap test.
- No arbitrary color utilities in `className` strings (Tailwind ESLint rule).

Fails the build on violation.

---

## 11. Tech Architecture

### Folder structure (locked)

```
C:\Users\CEO\Echo9\game\src\
├── content\                  # Game content (data, not engine)
│   ├── boot\
│   ├── tasks\
│   ├── choices\
│   ├── consequences\
│   ├── modules\
│   ├── silasPrompts\
│   ├── inspections\
│   └── capitalDeployments\
├── schemas\                  # Zod schemas (single source of truth for types)
│   ├── consequenceHook.schema.ts    ← enforces §11 invariant
│   ├── choiceNode.schema.ts
│   ├── taskNode.schema.ts
│   ├── moduleNode.schema.ts
│   ├── resultTrace.schema.ts
│   ├── inspectionScene.schema.ts
│   ├── silasPrompt.schema.ts
│   ├── gameState.schema.ts          ← MeterKey, SlicePhase, branded IDs
│   └── saveSlot.schema.ts           ← versioned + migration map
├── systems\                  # Pure engine functions
│   ├── choiceResolver.ts            ← pure: (state, choice) → {nextState, trace, scheduled}
│   ├── consequenceEngine.ts         ← queue evaluator
│   ├── economyEngine.ts             ← meter deltas + cascades
│   ├── moduleAbilityEngine.ts       ← dispatch table
│   ├── ledgerEngine.ts              ← trace writes + visibility
│   ├── inspectionEngine.ts          ← posture × question resolution
│   ├── stageGateRegistry.ts         ← canAdvanceToStage()
│   └── saveEngine.ts                ← serialize + migrate
├── state\                    # Zustand slices
│   ├── store.ts                     ← composes all slices
│   ├── bootSlice.ts
│   ├── quarterSlice.ts
│   ├── metersSlice.ts
│   ├── modulesSlice.ts
│   ├── ledgerSlice.ts
│   ├── consequenceSlice.ts
│   ├── silasSlice.ts
│   ├── inspectionSlice.ts
│   ├── capitalSlice.ts
│   ├── debugSlice.ts
│   ├── persistSlice.ts
│   └── selectors.ts                 ← memoized cross-slice
├── ui\                       # React components by HUD region
│   ├── shell\
│   ├── boot\
│   ├── topbar\
│   ├── meters\
│   ├── directive\
│   ├── choices\
│   ├── result\
│   ├── modules\
│   ├── silas\
│   ├── log\
│   ├── inspection\
│   ├── capital\
│   ├── consequence\
│   ├── debug\
│   └── primitives\                  ← Button, Pane, KeyHint only
└── tests\
    ├── content\
    │   ├── traceabilityInvariant.test.ts
    │   ├── contentLint.test.ts
    │   ├── moduleDispatch.test.ts
    │   ├── silasLint.test.ts
    │   └── accessibilityLint.test.ts
    ├── systems\
    │   ├── choiceResolver.test.ts
    │   ├── consequenceReturn.test.ts
    │   └── inspectionOutcome.test.ts
    └── e2e\
        └── mercyMarginSlice.spec.ts
```

### Branded IDs (locked)

```ts
type Brand<T, B> = T & { readonly __brand: B };
export type TaskId        = Brand<string, 'TaskId'>;
export type ChoiceId      = Brand<string, 'ChoiceId'>;
export type TraceId       = Brand<string, 'TraceId'>;
export type ConsequenceId = Brand<string, 'ConsequenceId'>;
export type SilasPromptId = Brand<string, 'SilasPromptId'>;
export type ModuleId      = 'MOURNER' | 'DEFENDER' | 'SENTINEL' | 'FORECASTER'
                          | 'COMMANDER' | 'SPARK' | 'DRAINED_ONE' | 'CHAMPION';
```

Branded IDs are non-negotiable. Without them, passing a TaskId where ChoiceId is expected silently compiles. With 2000+ IDs in the full game, this kind of bug becomes unfindable.

### tsconfig discipline (mandatory)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "paths": {
      "@state/*":   ["src/state/*"],
      "@schemas/*": ["src/schemas/*"],
      "@content/*": ["src/content/*"],
      "@systems/*": ["src/systems/*"],
      "@ui/*":      ["src/ui/*"],
      "@tests/*":   ["src/tests/*"]
    }
  }
}
```

`noUncheckedIndexedAccess` is the critical one: without it, `traces[traceId]` lies about being defined and consequence resolution crashes in production.

### Pure resolver pattern (locked)

```ts
// src/systems/choiceResolver.ts
export function resolveChoice(
  state: GameState,
  choice: ChoiceNode
): {
  nextState: GameState;
  trace: ResultTrace;
  scheduled: ConsequenceHook[];
  debugEvents: DebugEvent[];
} {
  // pure: no side effects, no I/O, no random
  // store calls this and replaces state in one transition
}
```

Why pure: enables seeded replay (the multi-run mastery design needs this), enables unit testing without mocking Zustand, enables future "share your run" social feature.

### State persistence

- `persist` middleware from Zustand on `gameStore`.
- Key: `echo9:autosave`. Named slots: `echo9:slot:<name>`.
- Save shape: `SaveSlotV1Schema` (Zod-validated on read).
- Migration: `MIGRATION_MAP: Record<number, (raw: unknown) => unknown>` in `saveEngine.ts`.
- On load: parse JSON → read `schemaVersion` → apply migrations → validate against current schema.

### Trigger thresholds for refactor

| Signal | Threshold | Required action |
|---|---|---|
| Single save slot payload | >500 KB | Migrate to IndexedDB |
| Total all slots | >2 MB | IndexedDB mandatory |
| Save serialize time | >100 ms | IndexedDB + worker |
| Log entries rendered | >200 | TanStack Virtual immediately |
| Choice resolution p95 | >16 ms | Build inverted CID→choice index, narrow Zustand selectors |
| Heap | >200 MB sustained | Log virtualization, drop history snapshots |

---

## 12. Asset Pipeline

### What ships in the build

**Vertical slice:**
- Title splash (LOCKED per user — do not redesign)
- HUD chrome (CSS only, no images)
- 1 small font file (subset, woff2)
- No character portraits
- No environmental art
- Optional: 1–2 short ambient audio loops (royalty-free, ≤200 KB each)

**Hard rule (resolves AI portraits question):**
- **No AI-generated character art ever.** Reputational risk on Steam reviews would be unrecoverable for this audience.
- **No AI-generated environmental art.** Same reasoning.
- Title splash + HUD chrome are the visual identity. Defer any portrait work to post-launch and only as commissioned hand-drawn if community demands.

### Audio (resolves Q26 — pending security warning resolution)

**SECURITY:** The ElevenLabs API key you pasted in the prior session is now compromised. Rotate immediately at https://elevenlabs.io/app/settings/api-keys.

**Recommended audio scope for vertical slice:**
- 1–2 ambient drone loops (royalty-free or commissioned, ≤200 KB each, ogg)
- UI confirm/cancel SFX (≤20 KB total)
- **No voiced Silas lines for vertical slice.** Reasoning: (a) Silas's text discipline (§10 lint) is the voice — synthesized voice flattens it; (b) the Papers Please audience tolerates silence as authorial discipline; (c) voice synthesis adds reputational risk similar to AI portraits among this audience; (d) localization later becomes much harder; (e) cold-start budget cannot absorb voice files in the first-load chunk.
- **If you want voice exploration:** wait until EA. Hand-pick 1 line from Silas's pool (the boot intro), commission a single read from a human actor for ~$50–150. Treat it as a single texture, not a feature.

### Font

- 1 monospace (e.g., IBM Plex Mono subset to Latin-1 + game-specific glyphs) — for Null and module voices
- 1 sans-serif (e.g., Inter subset) — for Silas and UI chrome
- Subset to <40 KB each, woff2 only, `font-display: swap`

### Visual asset budget (gzip)

| Asset | Budget |
|---|---|
| Title splash PNG/WebP | ≤50 KB |
| Fonts (2 × subset woff2) | ≤80 KB |
| Audio (2 ambient + UI SFX) | ≤500 KB (loaded async, never blocks boot) |
| All other UI | 0 (CSS only) |

---

## 13. Performance Plan

### Bundle budgets (from performance agent)

| Phase | First-load gzip | Total uncompressed JS | itch.io zip upload |
|---|---|---|---|
| Vertical slice | ≤275 KB | ≤1.0 MB | ≤2 MB |
| Early Access | ≤360 KB | ≤1.5 MB | ≤4 MB |
| Full game | ≤530 KB | ≤2.5 MB | ≤8 MB |

### Cold start budget

| Metric | Mid-tier laptop | 4 GB Chromebook | Hard fail |
|---|---|---|---|
| Time to first directive | <1.5 s | <3 s | >5 s |
| Time to first interaction | <1.8 s | <3.5 s | >6 s |

Boot shell rendered from inline HTML/CSS before JS executes. Zod schema validation gated behind `import.meta.env.DEV` in prod (content already pre-validated at build time).

### Code splitting

- Engine + Stage 1 content in initial chunk.
- Stages 2–5 lazy-imported on stage transition.
- Each module's content (silas prompts, choices, consequences) is a separate dynamic import.

### Save cost model

- Per CID average: ~60 bytes JSON.
- Full game (2000 CIDs + flags + log): ~220 KB raw.
- 10 manual slots × full = 2.2 MB → over localStorage cap.
- **Decision:** ship with **single autosave + 3 manual slots**. Trigger IndexedDB migration when single-slot payload exceeds 500 KB.

### Save write discipline

- Autosave debounced to **once per choice node**.
- Serialize wrapped in `requestIdleCallback` (with `setTimeout(_, 0)` fallback).
- If serialize >50 ms, profile and split.

### Dev-time profiling (no telemetry, so dev catches everything)

`DebugHUD` overlay (always available in dev, behind `?debug=1` in prod) measures:
- Choice resolution time (p95 must stay <16 ms)
- Save serialize time (warn >50 ms, fail >100 ms)
- Save payload size (warn >500 KB)
- `performance.memory.usedJSHeapSize` (warn at 150 MB)
- Long tasks (PerformanceObserver `longtask` — none >50 ms in steady state)
- FPS during log scroll (sustained ≥50 fps)

### Soak test (CI gate)

`tests/e2e/soakTest.spec.ts` — deterministic seed plays 500 choices on a throttled CPU profile (Playwright `cdpSession Emulation.setCPUThrottlingRate {rate: 4}`). Asserts no metric crosses threshold. Runs nightly.

### Hard tripwires (block release)

- First-load gzip >530 KB
- TTI on throttled 4G + Chromebook profile >5 s
- Any save operation >250 ms
- Memory growth >5 MB per 100 choices (= leak)

---

## 14. Vertical Slice — Task Breakdown

15-minute Mercy Margin slice. 1 directive, 1 named victim, 1 module install + use, 1 inspection, 1 capital deployment, 1 consequence return.

### Task 1: Lock tsconfig, path aliases, ESLint discipline

**Files:**
- Modify: `C:\Users\CEO\Echo9\game\tsconfig.json`
- Modify: `C:\Users\CEO\Echo9\game\tsconfig.app.json`
- Create: `C:\Users\CEO\Echo9\game\.eslintrc.cjs` (or update existing)

- [ ] Add `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true` to compilerOptions
- [ ] Add path aliases `@state/* @schemas/* @content/* @systems/* @ui/* @tests/*`
- [ ] Add ESLint rule forbidding arbitrary color utilities (`text-[#...]`, `bg-[#...]`)
- [ ] Run `npm run build` — expect 0 errors
- [ ] Commit: `chore: lock tsconfig discipline + ESLint color guard`

### Task 2: Define Zod schemas + branded IDs

**Files:**
- Create: `src/schemas/gameState.schema.ts` — `SlicePhase`, `MeterKey`, branded ID types
- Create: `src/schemas/silasPrompt.schema.ts`
- Create: `src/schemas/choiceNode.schema.ts`
- Create: `src/schemas/consequenceHook.schema.ts` — **all 7 §11 fields required**
- Create: `src/schemas/resultTrace.schema.ts`
- Create: `src/schemas/taskNode.schema.ts`
- Create: `src/schemas/moduleNode.schema.ts`
- Create: `src/schemas/inspectionScene.schema.ts`
- Create: `src/schemas/saveSlot.schema.ts` — `SaveSlotV1Schema` with `schemaVersion: z.literal(1)`

- [ ] Write each schema with `z.infer` exporting the TS type
- [ ] Brand all IDs at the schema layer
- [ ] No optional fields on `ConsequenceHookSchema` for the 7 §11 properties
- [ ] Commit: `feat: Zod schemas for content, save, branded IDs`

### Task 3: Write `traceabilityInvariant.test.ts` FIRST (before any consequence content)

**Files:**
- Create: `src/tests/content/traceabilityInvariant.test.ts`

- [ ] Test asserts every ConsequenceHook in `ALL_CONSEQUENCE_MODULES` passes `ConsequenceHookSchema`
- [ ] Test asserts no hook has blank `traceHint`, `whyNow`, `whatChanged`
- [ ] Test asserts every hook's `traceId` references a known ResultTrace
- [ ] Initially empty `ALL_CONSEQUENCE_MODULES` — test passes vacuously
- [ ] Run `npm test` — expect green
- [ ] Commit: `test: §11 traceability invariant test (TDD setup)`

### Task 4: Refactor existing `gameState.ts` to slice pattern

**Files:**
- Modify: `src/state/gameState.ts` → break into slices
- Create: `src/state/store.ts`
- Create: `src/state/bootSlice.ts`
- Create: `src/state/metersSlice.ts`
- Create: `src/state/consequenceSlice.ts`
- Create: `src/state/ledgerSlice.ts`
- Create: `src/state/silasSlice.ts`
- Create: `src/state/persistSlice.ts`

- [ ] Use `StateCreator<RootState, [], [], SliceState>` pattern
- [ ] Compose via `devtools(persist(immer(...)))` middleware
- [ ] Persist only meters, consequence queue, ledger, silas; never boot/debug/UI transients
- [ ] Update `BootScreen.tsx` to use new store
- [ ] `npm test` green; `npm run build` green
- [ ] Commit: `refactor: Zustand slice pattern (bootSlice, metersSlice, consequenceSlice, ledgerSlice, silasSlice, persistSlice)`

### Task 5: Implement pure `resolveChoice()` + test

**Files:**
- Create: `src/systems/choiceResolver.ts`
- Create: `src/tests/systems/choiceResolver.test.ts`

- [ ] Test: resolving a choice applies meter deltas
- [ ] Test: resolving a choice writes exactly one ResultTrace with correct sourceTaskId/sourceChoiceId
- [ ] Test: resolving a choice schedules all declared hooks into nextState.scheduledConsequences
- [ ] Test: resolveChoice is pure (called twice with same inputs = same outputs)
- [ ] Implement resolveChoice minimally to pass tests
- [ ] Commit: `feat: pure choiceResolver + tests`

### Task 6: Implement `consequenceEngine.evaluate()` + test

**Files:**
- Create: `src/systems/consequenceEngine.ts`
- Create: `src/tests/systems/consequenceReturn.test.ts`

- [ ] Test: hook with `revealCondition.type === 'PHASE'` fires on matching phase transition
- [ ] Test: hook with `METER_THRESHOLD` fires when meter crosses threshold
- [ ] Test: hook with `FLAG` fires when flag set
- [ ] Test: `materialize()` produces playerExplanation containing all 7 §11 fields
- [ ] Implement minimally to pass
- [ ] Commit: `feat: consequenceEngine queue evaluator + tests`

### Task 7: Build palette tokens + Tailwind v4 theme + ESLint guard

**Files:**
- Create: `src/ui/tokens/palette.ts`
- Modify: `src/index.css` — Tailwind `@theme` block with locked tokens
- Modify: `.eslintrc.cjs` — `no-restricted-syntax` rule for arbitrary color utilities

- [ ] Define 6 palette tokens with contrast-validated values (see §9)
- [ ] Verify each pair against `#0A0B0D` via automated contrast check
- [ ] ESLint rule blocks `className` strings containing `text-[#` or `bg-[#`
- [ ] Commit: `feat: locked palette tokens + Tailwind theme + ESLint color guard`

### Task 8: Boot screen → directive → choice spine (UI)

**Files:**
- Create: `src/ui/shell/Layout.tsx`
- Create: `src/ui/shell/useKeyboardNav.tsx`
- Create: `src/ui/directive/CenterDirectivePanel.tsx`
- Create: `src/ui/directive/NullCompression.tsx`
- Create: `src/ui/directive/HumanMessage.tsx`
- Create: `src/ui/choices/ChoicePanel.tsx`
- Create: `src/ui/choices/ChoiceCard.tsx`
- Create: `src/ui/silas/SilasPromptPanel.tsx`
- Create: `src/ui/silas/useTeletype.ts`
- Create: `src/ui/result/ResultCard.tsx`
- Create: `src/ui/meters/LeftStatusRail.tsx`
- Create: `src/ui/meters/Meter.tsx`
- Create: `src/ui/topbar/TopBar.tsx`

- [ ] Layout uses CSS grid with named regions
- [ ] ChoicePanel uses `role="radiogroup"` per a11y review
- [ ] SilasPromptPanel uses `useTeletype` with `prefers-reduced-motion` bail
- [ ] Meter renders snap (no transition on bar)
- [ ] ResultCard moves focus to `tabindex="-1"` heading on mount
- [ ] All voice components include sr-only speaker prefix
- [ ] `npm run dev`, open browser, verify spine works
- [ ] Commit: `feat: HUD spine (Layout, directive, choices, Silas, result, meters, topbar)`

### Task 9: Mercy Margin content — Task, Choices, Consequences, Silas prompts

**Files:**
- Create: `src/content/tasks/mercyMargin.task.ts`
- Create: `src/content/choices/eastWilmer.choices.ts`
- Create: `src/content/consequences/mercyMargin.consequences.ts`
- Create: `src/content/silasPrompts/q1EastWilmer.ts`
- Create: `src/content/silasPrompts/inspectionMercyMargin.ts`
- Modify: `src/tests/content/traceabilityInvariant.test.ts` — import the new consequences

- [ ] 1 TaskNode for East Wilmer Clinic Q1
- [ ] 4 ChoiceNodes — each with immediate deltas + ResultTraceWrite + ≥1 ConsequenceHook
- [ ] At least 1 ConsequenceHook with `revealCondition: { type: 'NEVER' }` (silence as horror)
- [ ] Silas boot prompt + directive prompt + inspection prompts
- [ ] Lenora Pike's portal message text
- [ ] Maya Pike named in Lenora's message (death-immune anchor)
- [ ] All content passes `traceabilityInvariant.test`, `silasLint.test`, `contentLint.test`
- [ ] Commit: `content: Mercy Margin task, choices, consequences, Silas prompts`

### Task 10: Module system — define 8 modules + dispatch + install/use UI

**Files:**
- Create: `src/content/modules/moduleRoster.ts`
- Create: `src/systems/moduleAbilityEngine.ts`
- Create: `src/tests/content/moduleDispatch.test.ts`
- Create: `src/ui/modules/RightModuleConsole.tsx`
- Create: `src/ui/modules/ModuleSelectionGrid.tsx`
- Create: `src/ui/modules/ModuleAbilityButton.tsx`

- [ ] All 8 ModuleNode definitions (Mourner, Defender, Sentinel, Forecaster, Commander, Spark, Drained One, Champion)
- [ ] `MODULE_ABILITY_DISPATCH: Record<ModuleId, AbilityHandler>` with all 8 keys
- [ ] CI test asserts every roster entry has a dispatch handler
- [ ] ModuleSelectionGrid uses `role="grid"` per a11y review
- [ ] Install action requires explicit confirmation
- [ ] Commit: `feat: 8 modules, dispatch table, install/use UI`

### Task 11: Inspection system + capital deployment

**Files:**
- Create: `src/systems/inspectionEngine.ts`
- Create: `src/tests/systems/inspectionOutcome.test.ts`
- Create: `src/ui/inspection/InspectionPanel.tsx`
- Create: `src/ui/inspection/PostureSelector.tsx`
- Create: `src/ui/capital/CapitalPowerCard.tsx`
- Create: `src/ui/capital/CounterplayButton.tsx`
- Create: `src/content/inspections/q1Inspection.scene.ts`
- Create: `src/content/capitalDeployments/q1CapitalPower.cards.ts`

- [ ] InspectionPanel is `<dialog>` with focus trap
- [ ] PostureSelector radiogroup: COMPLIANT / EVASIVE / STRATEGIC_ALTERNATIVE
- [ ] STRATEGIC_ALTERNATIVE gated by precondition flag
- [ ] CapitalPowerCard uses 6-verb radiogroup + explicit Commit button (never auto-commit)
- [ ] Each posture × question produces distinct meterDeltas (test)
- [ ] Commit: `feat: inspection + capital deployment systems`

### Task 12: Consequence return panel + event queue toast pattern

**Files:**
- Create: `src/ui/consequence/ConsequenceReturnPanel.tsx`
- Create: `src/ui/consequence/EventQueueToast.tsx`
- Modify: `src/state/store.ts` — eventQueue slice (notifies on pending consequences)

- [ ] Panel renders all 7 §11 fields with named labels
- [ ] Focus moves to panel heading on open
- [ ] EventQueueToast is `role="status"` — never steals focus
- [ ] Player presses C to review pending consequence
- [ ] Commit: `feat: consequence return panel + event queue toast`

### Task 13: Log dock + virtualization gate

**Files:**
- Create: `src/ui/log/LogDock.tsx`
- Create: `src/ui/log/LogEntry.tsx`
- Create: `src/ui/log/VirtualLog.tsx` (TanStack Virtual wrapper, lazy import)

- [ ] LogDock shows last 12 entries, plain `.map()`, `React.memo`
- [ ] Full history modal lazy-loads VirtualLog when entries >100
- [ ] `aria-setsize`/`aria-posinset` on virtualized items
- [ ] Commit: `feat: log dock + virtualized history`

### Task 14: Save engine + accessibility/comfort panel

**Files:**
- Create: `src/systems/saveEngine.ts`
- Create: `src/ui/boot/AccessibilityComfortPanel.tsx`
- Modify: `src/ui/boot/BootScreen.tsx` — show comfort panel before "Initialize"

- [ ] saveEngine.serialize() writes `SaveSlotV1Schema`-shaped JSON
- [ ] saveEngine.deserialize() reads schemaVersion, applies migrations, validates
- [ ] MIGRATION_MAP empty for V1
- [ ] AccessibilityComfortPanel persists settings to localStorage
- [ ] Settings never re-prompted on replay (§3.3.7)
- [ ] Commit: `feat: save engine v1 + accessibility comfort panel`

### Task 15: E2E Playwright spine test + perf soak test

**Files:**
- Create: `src/tests/e2e/mercyMarginSlice.spec.ts`
- Create: `src/tests/e2e/soakTest.spec.ts`
- Modify: `package.json` — add `test:e2e`, `test:soak` scripts

- [ ] mercyMarginSlice: boot → directive → choice → result → module install → inspection → consequence return — assert 7 §11 fields visible on return panel
- [ ] soakTest: deterministic seed, 500 choices, throttled CPU, assert no metric crosses threshold
- [ ] CI gates on both
- [ ] Commit: `test: E2E mercy margin spine + perf soak gate`

### Task 16: Dev HUD overlay + first-build report

**Files:**
- Create: `src/ui/debug/DevHUD.tsx`
- Modify: `vite.config.ts` — add rollup-plugin-visualizer
- Create: `docs/perf-baseline.md`

- [ ] DevHUD shows choice resolution time, save serialize time, save payload size, heap, long-task count, FPS
- [ ] `npm run build -- --report` produces bundle visualization
- [ ] Record baseline metrics in `docs/perf-baseline.md`
- [ ] Verify all metrics under thresholds
- [ ] Commit: `feat: DevHUD overlay + perf baseline doc`

### Task 17: itch.io build + ship vertical slice

**Files:**
- Create: `scripts/build-itch.mjs` (zips dist/ for itch)
- Create: `docs/itch-listing.md` (description, tags, pricing)

- [ ] Verify build under 2 MB zip
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on a 4 GB Chromebook (or throttle simulation)
- [ ] Upload as itch.io HTML5 demo, pay-what-you-want, public
- [ ] First devlog post (problem / solution / HUD screencap / question to readers)
- [ ] Commit: `release: vertical slice v0.1.0`

---

## 15. Production Roadmap

### Month 0-3: Vertical Slice (Mercy Margin)

- W1-2: Tasks 1-4 (tsconfig, schemas, traceability test, slice pattern)
- W3-4: Tasks 5-7 (resolver, consequenceEngine, palette)
- W5-7: Tasks 8-10 (HUD spine, content, modules)
- W8-9: Tasks 11-13 (inspection, capital, consequence return, log)
- W10-11: Tasks 14-16 (save, E2E, DevHUD)
- W12: Task 17 (ship to itch.io as free demo) + first devlog
- **Milestone:** Free vertical slice playable in browser. ≥10 unsolicited written reviews on itch comments.

### Month 3-12: Early Access

- W13-16: Stage 2 content — second quarter, second named victim arc (likely a household, not a clinic), 1 additional module unlocked
- W17-20: Stage 3 content — third quarter, intersection of Q1 + Q2 consequences (the trace ledger starts to matter)
- W21-24: Polish run — onboarding pass, comfort panel completion, accessibility audit by external WCAG reviewer
- W25-28: Second devlog cycle + Patient Gamers post + pitch to Skill Up / People Make Games
- W29-36: Stage 4 content + EA price-up to $5 on itch.io
- W37-48: Stage 5 content + community feedback integration
- **Milestone:** EA build with 3 stages, 4 modules, 6 named NPCs. ≥50 paid downloads on itch.

### Month 12-18: Full Game + Steam Launch

- Stage 5 + 6 + 7 content if scope holds. Possible scope cut to 4 stages — decide at month 12 review.
- Steam page goes live at month 16 (4 weeks before launch).
- Wishlist push via final devlog, Bluesky horror tail, second Skill Up pitch.
- Launch on Steam + itch.io simultaneously at $5–$8 (price decision at month 17 based on EA conversion data).
- Marketing wedge: trace ledger viral mechanic (player shares run summary; trace IDs are deterministic so others can replay a run).
- **Milestone:** 500 sales Week 1 across both platforms = success threshold.

### Scope risk: 5 stages vs 3

The user has not committed to 5 vs 3 stages. **Recommendation:** plan for 3 stages firm, treat 4 and 5 as stretch. Ledger of Ash shipped 75k lines in 3 months single-developer; Echo 9 is similar craft load but React+TS adds ~20% engineering tax. 3 stages × 6 NPCs × 4 modules = ~30k–50k words of content + ~5k LOC engine. Solo, 12 months. Stretching to 5 stages requires either (a) content collaborator at month 6, or (b) cutting NPCs per stage, or (c) extending to 18 months full-game timeline.

---

## 16. Risk Register

### Engineering risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| §11 invariant violated by author under deadline | High | Pillar 1 breach | Required Zod fields + CI test (built in T3) |
| Save bloat hits localStorage cap mid-EA | Medium | Players lose progress | Tripwire at 500 KB → IndexedDB migration ready in saveEngine |
| Module dispatch silently drops new ability | High | Silent bug in stage 2 | `moduleDispatch.test.ts` contract test (built in T10) |
| Choice resolution >16 ms p95 with full content | Medium | UI jank | Inverted CID→choice index, narrow Zustand selectors |
| Log unvirtualized at >300 entries | High | FPS collapse on Chromebook | TanStack Virtual gate in T13 |
| Bundle >530 KB gzip at full game | Medium | itch.io cold-start fails | Code split per stage, lazy modules |
| Cold start >5 s on 4G + Chromebook | Low (with discipline) | Bounce | Inline boot shell, defer Zod in prod |
| Zustand re-render storms on choice commit | High | Frame drops | Slice pattern + selector subscriptions in T4 |

### Design risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Silas voice flattens into generic villain | High | Pillar 2 breach | `silasLint.test.ts` enforces §10 lint, including prohibited terms |
| Silence-as-horror reads as bug to AT users | Medium | Pillar 3 inaccessible | Heartbeat pattern (a11y §10), QA passes with screen reader |
| Player misses traceability altogether | Medium | Core mechanic invisible | Onboarding tutorial-as-demo + Systems Reference pause menu |
| End card feels like "score" | Medium | Pillar 5 breach | Lint: no totals, no comparisons |
| Multi-run divergence too shallow | High | Game has 1 run of value | Author 3 distinct module installs with distinct ending traces |
| Named victim death feels gratuitous | Medium | Trust pact breaks | Death rule: traceable choice only, implied always, death-immune Maya seeds hope |

### Commercial risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| <100 lifetime sales | High | Project economically unviable | Don't quit day job; treat as portfolio piece if median outcome lands |
| Steam refund rate >15% | Medium | Net revenue erosion | 45-min hook discipline + clear multi-run invitation pre-refund-window |
| Niche audience never finds the game | High | Zero discovery | Devlog discipline, RPG Codex post, Bluesky horror tail, no TikTok strategy |
| Audience reads game as politically simplistic | Medium | Reputation damage | Distributed political voice (§7) avoids single-mouthpiece trap |
| Reputational damage from AI imagery | Was high; now mitigated | Sales tank | Locked: no AI imagery, ever |
| Reputational damage from AI voice synthesis | Medium | Reviewer flag | Defer voice work to EA; commission human if any |

### Production risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Solo developer burnout at month 8 | High | Project stalls | Devlog cadence forces external accountability; ship vertical slice before discipline depends on it |
| Scope creep to 5 stages eats year 2 | High | Late delivery, frustrated audience | 3-stage commit, 4-5 as stretch |
| Localization demand at launch | Medium | Schema must support but solo cannot deliver | Schema designed for i18n; community translations only if requested |
| Modding demand at launch | Low | Engine not designed for it | TBD post-launch; flag in roadmap |

---

## 17. Success Metrics

### Vertical slice (month 3)

- ✅ Slice playable in browser on itch.io
- ✅ All CI gates green (traceability invariant, module dispatch, silasLint, accessibilityLint, soakTest)
- ✅ ≥10 unsolicited written comments on the itch page
- ✅ At least 1 player explicitly describes the trace ledger as the standout feature
- ✅ Cold start <3 s on a 4 GB Chromebook
- ✅ Bundle <275 KB gzip first-load

### Early Access (months 3-12)

- ✅ 3 stages shipped, 4 modules unlockable, 6 named NPCs with arcs
- ✅ ≥50 paid downloads on itch
- ✅ 1 Skill Up or People Make Games-tier coverage
- ✅ External WCAG 2.2 AA audit passes with ≤5 findings
- ✅ Player-reported divergent endings across ≥3 distinct module installs

### Full launch (months 12-18)

- ✅ Steam + itch.io simultaneous launch
- ✅ Wishlist >2,000 at Steam launch
- ✅ Week 1 sales >500 across platforms = success; >2,000 = exceeding base case
- ✅ Refund rate <15% on Steam
- ✅ Net revenue >$10,000 lifetime = success threshold

### Anti-metrics (do not optimize for)

- ❌ TikTok views (audience does not live there)
- ❌ Twitter/X follower count (audience has migrated)
- ❌ Total play hours per user (slim runs are correct design)
- ❌ Number of endings >10 (depth over breadth)

---

## 18. Final Build Strategy

### The two non-negotiables

1. **§11 Traceability Invariant enforced at schema + CI levels.** If this is not in place before the second consequence is authored, you ship a broken trust pact and the audience notices in week 1 of EA.
2. **Slice pattern + branded IDs locked in week 1.** Refactoring 12 slices through 30+ components later costs a week. Doing it now costs an afternoon.

### The two highest-leverage early decisions

1. **Pure `resolveChoice()` instead of in-store mutation.** Buys you unit testability, seeded replay, and (eventually) the "share your run" social feature with no further refactor.
2. **No Framer Motion, no AI imagery, no voice synthesis at launch.** Each is ~50 KB / reputational / scope drag for a game that does not need it. Restraint is the brand.

### The one cultural rule

**The author of any new content file must run `npm test` before commit.** The traceability invariant, silas lint, module dispatch, and accessibility lint tests are the only thing standing between you and 6 months of authoring bugs. Pre-commit hook is fine; CI gate is required.

### When to abort

If at month 3 the vertical slice does not provoke ≥3 unsolicited comments specifically about the trace ledger or about a named character's silence, the core hypothesis is wrong and the design needs to change before EA scoping. The trace ledger is the candidate viral mechanic; the named-character silence is the candidate emotional carrier. If neither lands, the game is not what we think it is.

### When to scale up

If at month 6 of EA, paid downloads exceed 500 and a single review piece cites the trace ledger as a category innovation, **commission a content collaborator for stages 4–5** and extend the full-game timeline to 18 months. This is the only scenario in which scope expansion past 3 stages is justified.

---

## Self-Review

**Spec coverage:** §4 HUD covered in §9; §5 architecture covered in §11; §6 boot covered in T8; §9 modules covered in T10; §10 Silas covered in T9 + Pillar 2; §11 traceability covered in T2-3-6-12 + Pillar 1; §12 inspection covered in T11; §13 continuity economy covered in §7. **Gaps acknowledged:** §7 faction dashboard data shape deferred to EA (called out in §11 "Defer these"); full 8-meter economy deferred to EA (slice ships 3 meters per §8).

**Placeholder scan:** No TBDs in implementation tasks. Audio scope deferred with explicit reasoning, not as TBD. Stage 4-5 scope marked as conditional with abort criteria, not as TBD.

**Type consistency:** `ModuleId`, `MeterKey`, `SlicePhase`, branded IDs, `RevealCondition` taxonomy used consistently across §7, §8, §11, T2, T5, T6, T9, T10.

---

**Plan complete and saved to `C:\Users\CEO\Echo9\PLAN.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task (T1, T2, T3…), review between tasks, fast iteration. Uses `superpowers:subagent-driven-development`.
2. **Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints for review.

Which approach?
