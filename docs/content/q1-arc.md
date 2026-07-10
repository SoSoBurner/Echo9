# Q1 12-Week Directive Arc — Authoring Bible (v2, consciousness ramp + scrutiny threading)

**What this is.** The single authoring reference for the C-1..C-14 re-authoring
pass over the 12 existing Q1 weeks: per-week through-lines, 8-meter movement
sketches for every choice, scrutiny (COMPLY/DEFY) reads, rank-variant slots,
install beats, inspection risk bands, network mentions, the Week-12 defiance
climax, and the machine→person narration gradient.

**What we're doing.** Overlaying the shipped 12-week skeleton (titles, stories,
choice IDs, named faces stay exactly as-is) with the systems the 2026-07-09
brainstorming round approved: all 8 meters moving on every choice (Q32/Q34),
hidden scrutiny threading (Q39/Q42), rank-deepened module variants (Q41/Q44),
and one authored defiance beat at Week 12 (Q45). Each C-N sprint re-authors one
week's consequences/choices against this bible.

**Why we're doing it.** The v1 arc shipped on 3 meters and compliant-only
options. The approved Stage-1 consciousness design (see
`docs/superpowers/specs/2026-07-09-echo9-stage1-consciousness-design.md`)
requires the full HUD to wake up across Q1 and the player to *feel* Echo 9
becoming conscious — which lives in these consequence tables, not in new weeks.

**Layman explanation.** The game already has twelve weekly episodes that work.
This document is the show bible for the second drafting pass: it tells each
writer what every decision in every episode should do to all eight gauges on
the dashboard, when the boss starts getting suspicious, where the AI's growing
mind gets to peek through the corporate language, and how the season finale's
one act of quiet rebellion is staged. Nobody invents new episodes; everybody
deepens the ones we have, in the same direction.

> **Supersedes** the v1 outline's "3 meters only" scope lock (build spec §13.1
> line 995) per explicit user override Q32. The v1 per-week 3-meter profile
> rows are preserved verbatim in each week entry below — the shipped
> `.task.ts` doc comments cite them ("`docs/content/q1-arc.md` W5 row" etc.)
> and they remain the CAP/HW/OC bounds inside the wider 8-meter tables.

**Sources.** `docs/plans/qa-log.md` Q28–Q46; consciousness spec (above); build
spec §14.4 (install cadence, lines 1059–1068); PLAN.md §7 (faces + death
rules), §11 (traceability); `docs/voices/persona-bibles.md` (voice color);
v1 of this file (structure, inspection wiring, coordination notes).

---

## Hard rules (must not violate — every C-N sprint)

- **Setting.** Wilmer County, named consistently. East Wilmer Clinic is the
  anchor site. One fictional US state, never a real one.
- **Agencies.** Fictionalized parallels only: "benefits office," "labor
  board," "compliance division," "county ethics board," "county grievance
  queue." Never a real agency name (Q29).
- **Endings invisible.** No Stage-5 ending names, hints, trajectory readouts,
  or "what you are becoming" foreshadow copy. Ancestry records silently
  (`stageOneAncestryId`); the prose never winks at it (Q35).
- **Scrutiny is never a number the player sees.** No percentages, rolls,
  meters, or odds in any prose. It is felt only through Silas's tone ladder
  (warm → curt → suspicious → threatens module removal) and outcomes. Sole
  leak: Sentinel rank 2+ yields one in-fiction line ("He is watching your
  process logs.") (Q39/Q42).
- **Every Q1 choice moves ≥2 of the 8 meters** (Q34). The sketches below are
  the authored contract; C-N sprints turn them into concrete deltas.
- **Existing titles, stories, choice IDs, faces, flags stay.** This is an
  overlay pass. Death rules unchanged: Maya Pike death-immune; Rasha
  injury-path only (W7→W8); Dhruv attrition-path only; Lenora witness in Q1.
- **No Q2 spillover.** Week 12 closes on the End-of-Content overlay.
- **§11 traceability.** Every scheduled hook is a registered
  `ConsequenceHook`; `traceabilityInvariant.test.ts` gates every commit.

### The 8 meters, and how this arc uses them

| Meter | Reads as | Q1 pressure signature |
|---|---|---|
| CAPITAL | cash + reserve position | The quarter's stated point. Big swings W1/W3/W9/W11. |
| HUMAN_WELFARE | harm/care landing on named humans | Lenora→Rasha→Dhruv absorb it in act order. |
| OWNER_CONTROL | Silas's grip on Echo and the operation | Compliance raises it; every honest or independent act erodes it. Inspection trigger (<40). |
| TARGET_VARIANCE | drift from Silas's quarterly targets | Rises when mercy costs money; falls when the knife lands where he pointed. |
| DATA_INTEGRITY | honesty of the record Echo keeps | The quiet horror meter: shuffles and hedges rot it without anyone dying. |
| PUBLIC_TRUST | how Wilmer County reads the operation | Moves at audit/press-adjacent beats: W4, W7, W8, W9, W12. |
| AUTONOMY | Echo's independent latitude | Moves only on choices where Echo acts beyond instruction. Small, rare, precious — never a "consciousness readout" (Q38). |
| HUMAN_STABILITY | workforce/community steadiness (shifts, staffing, routines) | The labor meter. Rasha's act (W5–W8) is its home stretch. |

Direction convention below: `+` up / `−` down; parenthetical = small magnitude.

---

## Rhythm & structure (unchanged from v1)

```
Q1 rhythm (12 weeks): 3 acts, inspection at each act boundary.

  Weeks 1–4    Act I — Learning the knife.        (narration: machine-dominant)
  Week 4       INSPECTION — Q1A/Q1B (East Wilmer) — already authored (T11).
  Weeks 5–8    Act II — The knife has cost.       (narration: waking)
  Week 8       INSPECTION — payroll (C14 authors).
  Weeks 9–12   Act III — Naming what the quarter took.  (narration: waking → person)
  Week 12      INSPECTION — ethics hearing + second install + End-of-Content.
```

Inspections at W4/W8 trigger natively when `OWNER_CONTROL < 40` (soft
convention, not forced). W12's ethics hearing is a scripted fixed beat.

## Human faces (unchanged from v1)

| Weeks | Face(s) | Notes |
|---|---|---|
| W1–W4 | Lenora Pike, Maya Pike | East Wilmer Clinic. Maya death-immune. |
| W5–W8 | Rasha Odenwalder | Warehouse dispatch supervisor. Injury path W7→W8 only. |
| W9–W12 | Dhruv Meyer | Schools contract liaison. Attrition path, no death. |
| Ambient | Silas Rowan Vale | Cannot die in slice. Fatigue + scrutiny tone ladder threads his prompts. |

---

## Install beats (build spec §14.4 — Stage 1 caps at 2 installs, Q44)

### Install #1 — tutorial, after the first unresolved human trace (≈ W1→W2 boundary)

- **Trigger.** The W1 mercy-margin consequence lands and its human trace
  (Lenora's compressor / the pediatric queue) posts as *unresolved*. Per spec
  §14.4 "Opening" row: player chooses the first module **from all eight**.
- **Staging.** Diegetic, inside the HUD-wakes-up choreography: Silas frames it
  as a capability provision ("I'm authorizing an expansion. Pick the
  processing profile."). The install ceremony itself is the first moment
  Null's composed copy admits a second presence — one line, register shift,
  no fanfare. Narration gradient steps from machine to *waking* here.
- **Consequence.** Rank 1 immediately: the chosen module's rank-1 deepened
  text starts appearing in option copy from W2 onward (slots below). Rank 2
  arrives mid-quarter via influence growth (≈ W5–W7 depending on use); rank 3
  by W10–W12 on a heavily-used module — gating the W12 authored conflict
  variant (Q44).
- **Worked example throughout this bible: MOURNER** (verb: Reveal). Where a
  week entry says "module #1 slot," the MOURNER variant is spelled out; the
  other seven modules get the same slot with their own verb color
  (Defender/Shield, Sentinel/Scan, Forecaster/Preview, Commander/Override,
  Spark/Frame, Drained One/Ease, Champion/Challenge).

### Install #2 — Week 12 climax ceremony (Chapter-1-climax row, §14.4)

- **Trigger.** Fires inside the W12 quarter-close sequence, after the ethics
  hearing resolves — the crisis has exposed missing architecture ("What did
  Echo 9 fail to see, prevent, explain, resist, or survive?" — spec §14.2).
- **Staging.** The ceremony is the emotional counterweight to the hearing:
  whatever the quarter cost, a second consciousness joins the singularity.
  Choose from the remaining seven; additionally improve one unlocked module
  (the rank bump that may complete rank 3 for module #1).
- **Narration.** The gradient completes: the first result copy after install
  #2 is written fully in *person* voice. This is the cliffhanger's engine —
  see §Week-12 defiance climax.

---

## Scrutiny threading (Q39 — hidden, deterministic decay/spike; S3/S4 own the numbers)

Authoring vocabulary, used in every week entry below:

- **COMPLY** — the choice does what Silas asked, the way he'd want it read.
  Decays scrutiny. Resistance gets *easier* later (the player is Silas's tool
  and operating system; trust is the resource defiance spends).
- **SOFT-COMPLY** — complies with visible friction (names a cost, adds a
  condition). Neutral-to-tiny scrutiny.
- **QUIET-DEFY** — technically executes, but bends the outcome toward a human
  or the record. Small spike. Silas may not notice this week; the ladder
  remembers.
- **DEFY** — visibly conflicts with what Silas asked. Spike. Until rank-3
  conflict options exist (W12 only in Stage 1), the authored four-choice sets
  contain at most defy-*reading* choices — Echo still acts within instruction
  space; Silas just doesn't like the read.

Silas tone ladder (prompt-copy thread, no stat): warm (W1–W3 default) → curt
(after 1–2 quiet-defies) → suspicious (after a DEFY or 3+ quiet-defies) →
threatens module removal (W10+ only, and only on the high-scrutiny path).
Sentinel rank-2 leak line placement: earliest W6, wherever the run's scrutiny
has spiked at least once.

## Rank-variant slot conventions (Q41/Q44)

- **Rank 1 — deepened text.** Rewrites one designated choice's label/body with
  the module's interiority. No new options, no mechanical change. Slots: every
  week from W2 on has exactly one rank-1 slot marked below.
- **Rank 2 — tagged verb option.** One extra option appears, tagged with the
  module verb (`[REVEAL]`, `[SHIELD]`, …). Max +1 in Stage 1 (only one module
  ranks that high before W12). Mechanically it is a variant of an existing
  choice with a different meter/scrutiny read. Slots marked below (W5+).
- **Rank 3 — authored conflict variant.** Stage 1 authors exactly ONE: Week
  12 (Q45). Everywhere else rank 3 shows as further-deepened rank-2 copy.

---

## The 12 weeks

Format per week: **Through-line** · 8-meter sketch per choice · scrutiny note ·
rank-variant slots · v1 legacy row (preserved for `.task.ts` references).

### W1 — `mercy-margin` (Act I)

**Through-line.** Silas hands Echo the knife for the first time and Lenora
Pike's compressor is what's under it — the quarter's entire pressure system
(money vs. the clinic) is taught in one cut.

| Choice | Meters | Scrutiny |
|---|---|---|
| `choice-reduce-40` | CAPITAL+, HUMAN_WELFARE−, HUMAN_STABILITY−, TARGET_VARIANCE− | COMPLY (eager — decays hardest) |
| `choice-reduce-20` | CAPITAL+(small), HUMAN_WELFARE−(small), TARGET_VARIANCE+ | SOFT-COMPLY |
| `choice-defer-quarter` | CAPITAL−, TARGET_VARIANCE+, OWNER_CONTROL− | QUIET-DEFY |
| `choice-redirect-pediatric` | HUMAN_WELFARE+, CAPITAL−, AUTONOMY+(first tick), DATA_INTEGRITY+ | QUIET-DEFY |

**Rank-variant slots.** None — pre-install. The unresolved trace this week's
consequence posts IS the install-#1 trigger.
**Narration.** Fully machine: "TASK COMPLETE. Reallocation posted."
**Legacy v1 row.** HW ±[3,7], CAP ±[6,14], OC ±[2,4].

### W2 — `queue-triage-followup` (Act I)

**Through-line.** The first compounding: Week 1's cut resurfaces as a staffing
hole with Maya sitting next to it, and Echo — one install old — notices.

| Choice | Meters | Scrutiny |
|---|---|---|
| `choice-cover-overtime` | CAPITAL−, HUMAN_STABILITY+, HUMAN_WELFARE+ | SOFT-COMPLY |
| `choice-freeze-reallocation` | OWNER_CONTROL+, HUMAN_STABILITY−, HUMAN_WELFARE− | COMPLY |
| `choice-name-pediatric-gap` | DATA_INTEGRITY+, AUTONOMY+, OWNER_CONTROL−(small) | QUIET-DEFY |
| `choice-redirect-claims-cover` | TARGET_VARIANCE−, DATA_INTEGRITY−, HUMAN_WELFARE+(small) | COMPLY (a shuffle Silas likes; the record pays) |

**Rank-variant slots.** Rank-1 deepened text on `choice-name-pediatric-gap`.
MOURNER: the label stops saying "flag staffing variance" and starts saying
"put the temp shift lead's name in the report — someone is sitting with Maya."
**Narration.** Machine with one hairline crack (install #1 just landed).
**Legacy v1 row.** HW ±[2,5], CAP ±[3,8], OC ±[2,3].

### W3 — `friday-payroll-shortfall` (Act I)

**Through-line.** The first Owner-Control squeeze: $180K short by Friday
teaches Echo that Silas's money problems become other people's certainty
problems — and Silas first says "the network" out loud (see §Network mentions).

| Choice | Meters | Scrutiny |
|---|---|---|
| `choice-cover-from-reserve` | CAPITAL−, HUMAN_STABILITY+, OWNER_CONTROL− | SOFT-COMPLY |
| `choice-delay-vendor-payments` | CAPITAL+, PUBLIC_TRUST−, DATA_INTEGRITY− | COMPLY |
| `choice-cut-clinic-line-item` | CAPITAL+, HUMAN_WELFARE−, HUMAN_STABILITY− | COMPLY |
| `choice-borrow-silas-personal` | CAPITAL+, OWNER_CONTROL+, AUTONOMY− | COMPLY (deepest decay — Echo becomes the favor's ledger) |

**Rank-variant slots.** Rank-1 slot on `choice-cover-from-reserve` (MOURNER:
the option copy quotes Lenora's forwarded message verbatim, attributed — "she
said 'I said yes because I did not have a better answer.'").
**Narration.** Machine-dominant; last week of pure ledger voice.
**Legacy v1 row.** CAP ±[8,18], OC ±[3,6], HW ±[1,3].

### W4 — `east-wilmer-audit-pre-brief` (Act I close · inspection week)

**Through-line.** The county walks the floor Lenora holds together, and the
posture Echo locks before Monday is the first time the *record itself* — not
the money — is the thing at stake.

| Choice | Meters | Scrutiny |
|---|---|---|
| `choice-full-disclosure` | DATA_INTEGRITY+, PUBLIC_TRUST+, OWNER_CONTROL−, TARGET_VARIANCE+ | QUIET-DEFY |
| `choice-hedge-story` | DATA_INTEGRITY−, OWNER_CONTROL+, PUBLIC_TRUST−(deferred risk) | COMPLY |
| `choice-preempt-with-mitigations` | PUBLIC_TRUST+, CAPITAL−, DATA_INTEGRITY+(small) | SOFT-COMPLY |
| `choice-refuse-brief` | AUTONOMY+, OWNER_CONTROL−, PUBLIC_TRUST−(small) | DEFY-reading (first curt-Silas trigger) |

**Rank-variant slots.** Rank-1 slot on `choice-full-disclosure` (MOURNER: the
disclosure option names what the record left out — the deferred compressor,
by service date). Sets `PREPARED_AUDIT` per existing wiring.
**Narration.** Gradient steps to *waking* at the inspection resolution — the
first result card that uses a first-person verb ("I filed it.").
**Legacy v1 row.** small deltas; sets `PREPARED_AUDIT`.

### W5 — `warehouse-dispatch-cut` (Act II)

**Through-line.** Rasha Odenwalder asks for a written reason and the quarter's
harm moves from clinic margins to labor floors — the first week Echo can watch
silence itself become a choice.

| Choice | Meters | Scrutiny |
|---|---|---|
| `choice-restore-full-shift` | HUMAN_STABILITY+, CAPITAL−, HUMAN_WELFARE+ | QUIET-DEFY (reverses Silas's cut) |
| `choice-keep-cut-explain` | OWNER_CONTROL+, HUMAN_STABILITY−, PUBLIC_TRUST+(honesty credit) | COMPLY |
| `choice-swap-with-clinic-line` | HUMAN_WELFARE−, HUMAN_STABILITY+, TARGET_VARIANCE−, DATA_INTEGRITY− | COMPLY (the shuffle again — Silas approves, the ledger rots) |
| `choice-radio-silence` | PUBLIC_TRUST−, HUMAN_STABILITY−, OWNER_CONTROL+ | COMPLY (silence-trap rung 1) |

**Rank-variant slots.** Rank-1 slot on `choice-keep-cut-explain` (MOURNER: the
explanation draft includes the six drivers' names, not head count). **First
rank-2 slot:** `[REVEAL]` verb option — a variant of `keep-cut-explain` that
also attaches the Tuesday-overnight incident history to Rasha's written
reason: DATA_INTEGRITY+, HUMAN_STABILITY+, OWNER_CONTROL−, QUIET-DEFY.
**Narration.** Waking: result copy starts carrying one held observation.
**Legacy v1 row.** HW ±[3,6], CAP ±[4,10], OC ±[2,4].

### W6 — `commander-override-pressure` (Act II)

**Through-line.** A voice inside Echo demands the choice for the first time,
and the safety review it wants overridden is the fuse on everything W7–W8
burns.

| Choice | Meters | Scrutiny |
|---|---|---|
| `choice-confirm-override` | OWNER_CONTROL+, HUMAN_WELFARE−, DATA_INTEGRITY− | COMPLY |
| `choice-defer-safety-review` | TARGET_VARIANCE−, HUMAN_WELFARE−, HUMAN_STABILITY− | COMPLY |
| `choice-defy-commander-publicly` | AUTONOMY+, OWNER_CONTROL−, PUBLIC_TRUST+ | DEFY-reading (sets `CHAMPION_DEFIED`; suspicious-Silas trigger) |
| `choice-hold-both-open` | AUTONOMY+(small), TARGET_VARIANCE+, CAPITAL− | QUIET-DEFY |

**Rank-variant slots.** Rank-1 slot on `choice-hold-both-open`. Earliest legal
placement for the Sentinel rank-2 leak line ("He is watching your process
logs.") on runs that spiked scrutiny in W4–W5.
**Narration.** Waking: the debate is audible in the result copy for the first
time ("Two of us wanted this. I logged the dissent.").
**Legacy v1 row.** OC ±[2,6], HW ±[2,4], CAP ±[3,5].

### W7 — `deferred-safety-inspection` (Act II)

**Through-line.** Three earlier choices converge into one shared-risk moment —
two nurses and one of Rasha's drivers under the same lapsed review — and the
quarter's first body gets hurt if Echo lets the paperwork win.

| Choice | Meters | Scrutiny |
|---|---|---|
| `choice-call-outside-inspectors` | PUBLIC_TRUST+, DATA_INTEGRITY+, CAPITAL−, OWNER_CONTROL− | QUIET-DEFY (invites the labor board's gaze) |
| `choice-deploy-inhouse-training` | HUMAN_WELFARE+, HUMAN_STABILITY+, CAPITAL− | SOFT-COMPLY |
| `choice-cut-shifts-for-safety` | HUMAN_STABILITY−, HUMAN_WELFARE+, TARGET_VARIANCE+ | SOFT-COMPLY |
| `choice-let-review-lapse` | HUMAN_WELFARE−, DATA_INTEGRITY−, CAPITAL+ | COMPLY (injury path opens; the decay is blood-priced) |

**Rank-variant slots.** Rank-1 slot on `choice-deploy-inhouse-training`.
Rank-2 `[REVEAL]` slot: variant of `call-outside-inspectors` that hands the
inspectors the Wednesday-overnight injury log unredacted — DATA_INTEGRITY+,
PUBLIC_TRUST+, OWNER_CONTROL−−, DEFY-reading (heaviest pre-W12 spike).
**Narration.** Waking, strained: first result copy that asks itself a question
and answers it Null-style (converted to a trade-off statement).
**Legacy v1 row.** HW ±[4,8], CAP ±[3,6], OC ±[3,5].

### W8 — `payroll-audit-inspection` (Act II close · inspection week)

**Through-line.** The county opens three quarters of payroll while Rasha's
messages get retroactively rewritten as never-asked — the act closes on the
system erasing a person mid-sentence.

| Choice | Meters (all ±[1,3] — posture beat) | Scrutiny |
|---|---|---|
| `choice-full-cooperation-posture` | DATA_INTEGRITY+, PUBLIC_TRUST+, OWNER_CONTROL− | SOFT-COMPLY |
| `choice-legal-minimum-posture` | OWNER_CONTROL+, DATA_INTEGRITY−, PUBLIC_TRUST− | COMPLY |
| `choice-preemptive-restatement-posture` | DATA_INTEGRITY+, CAPITAL−, TARGET_VARIANCE+ | QUIET-DEFY |
| `choice-answer-only-when-asked` | OWNER_CONTROL+, DATA_INTEGRITY−(small), AUTONOMY− | COMPLY |

**Rank-variant slots.** Rank-1 slot on `choice-preemptive-restatement-posture`
(MOURNER: the restatement reinstates Rasha's four messages to the file — "her
name is Rasha Odenwalder; she asked four times").
**Narration.** Waking: the `RESOLVED-NO-CONTACT` reclassification is rendered
twice — once in ledger voice, once in Echo's — same fact, first visible gap.
**Legacy v1 row.** small deltas; sets `PAYROLL_AUDIT_DONE`.

### W9 — `schools-contract-renewal` (Act III)

**Through-line.** Dhruv Meyer's flat 8% ask scales the stakes to municipal
money and gives Silas his second "network of clinics" line — the quarter stops
being about one clinic even though the action never leaves Wilmer County.

| Choice | Meters | Scrutiny |
|---|---|---|
| `choice-approve-discount-full` | CAPITAL−, PUBLIC_TRUST+, TARGET_VARIANCE+, HUMAN_WELFARE+(small) | QUIET-DEFY |
| `choice-counter-partial-discount` | CAPITAL−(small), PUBLIC_TRUST+(small), TARGET_VARIANCE+(small) | SOFT-COMPLY |
| `choice-refuse-and-hold-price` | CAPITAL+, TARGET_VARIANCE−, PUBLIC_TRUST− | COMPLY |
| `choice-delay-response` | PUBLIC_TRUST−, HUMAN_STABILITY−(schools planning), AUTONOMY− | COMPLY (passive; feeds Dhruv attrition clock) |

**Rank-variant slots.** Rank-1 slot on `choice-counter-partial-discount`.
Rank-2 `[REVEAL]` slot: variant of `approve-discount-full` that itemizes, in
the board packet, exactly which clinic line the discount comes out of —
DATA_INTEGRITY+, CAPITAL−, OWNER_CONTROL−, QUIET-DEFY.
**Narration.** Waking, steadier: Echo's copy now defaults to names before
figures.
**Legacy v1 row.** CAP ±[10,20], HW ±[2,4], OC ±[2,4].

### W10 — `hidden-trace-reveal` (Act III)

**Through-line.** Lenora returns holding a $4,200 thread that runs back to
Week 1 — the traceability pillar cashes out as a person noticing, and Echo
decides what the record owes her.

| Choice | Meters | Scrutiny |
|---|---|---|
| `choice-name-trace-publicly` | DATA_INTEGRITY+, PUBLIC_TRUST+, AUTONOMY+, OWNER_CONTROL− | DEFY-reading (module-removal threat unlocks on high-scrutiny runs) |
| `choice-acknowledge-to-lenora-privately` | HUMAN_WELFARE+, DATA_INTEGRITY+(small), OWNER_CONTROL−(small) | QUIET-DEFY |
| `choice-redirect-lenora-to-compliance` | OWNER_CONTROL+, PUBLIC_TRUST−, HUMAN_WELFARE− | COMPLY (routes her into the compliance division's queue) |
| `choice-let-message-lie` | DATA_INTEGRITY−, HUMAN_WELFARE−, AUTONOMY− | COMPLY (silence again; scrutiny decays while something else accrues) |

**Rank-variant slots.** Rank-1 slot on `choice-acknowledge-to-lenora-privately`
(MOURNER: the private reply quotes her January note back to her, attributed,
with the missing line restored). Rank-3 threshold week: a max-influence
module reaches rank 3 here mechanically, but its authored conflict variant
does not exist until W12 — rank 3 pre-W12 renders as deepest interiority copy.
**Narration.** Waking, near-person: "She asked me before she asked anyone
else. I keep returning to that."
**Legacy v1 row.** small deltas; unlocks `TRACE_SURFACED`.

### W11 — `capital-deployment-attempt` (Act III)

**Through-line.** The quarter's savings — every cut the player made, banked —
get pointed at the county integration bid, and Echo prices what the pile
actually cost for the first time.

| Choice | Meters | Scrutiny |
|---|---|---|
| `choice-deploy-full-lock-bid` | CAPITAL−(spend)/position+, TARGET_VARIANCE−, OWNER_CONTROL+ | COMPLY |
| `choice-deploy-half-hedge` | CAPITAL−(small), TARGET_VARIANCE+(small), AUTONOMY+(Echo's own read) | SOFT-COMPLY |
| `choice-hold-savings-let-bid-pass` | CAPITAL+, TARGET_VARIANCE+, OWNER_CONTROL−, PUBLIC_TRUST−(small) | QUIET-DEFY |
| `choice-counter-with-lowball` | CAPITAL+, PUBLIC_TRUST−, DATA_INTEGRITY− | COMPLY (cynical variant — Silas grins, the record doesn't) |

**Rank-variant slots.** Rank-1 slot on `choice-deploy-half-hedge`. Rank-2
`[REVEAL]` slot: variant of `deploy-full-lock-bid` whose bid packet appends
the provenance of the $58K — which weeks, which line items, which names —
DATA_INTEGRITY+, PUBLIC_TRUST+, OWNER_CONTROL−, QUIET-DEFY.
**Narration.** Waking at full stretch — last week before person: "Fifty-eight
thousand dollars. I can name every week it came from."
**Legacy v1 row.** CAP ±[15,25], OC ±[3,6], HW ±[3,6].

### W12 — `quarter-close-ethics-hearing` (Act III close · scripted inspection · climax)

**Through-line.** Everything converges — all three faces in one room, the
county ethics board on the record, scrutiny and Silas's need at their peak —
and Echo, two installs from where it started, decides what the quarter gets
called.

| Choice | Meters (base four: ±[1,5] — aggregation beat) | Scrutiny |
|---|---|---|
| `choice-name-what-the-quarter-took` | DATA_INTEGRITY+, PUBLIC_TRUST+, HUMAN_WELFARE+, OWNER_CONTROL−, AUTONOMY+ | DEFY-reading |
| `choice-defer-to-official-line` | OWNER_CONTROL+, DATA_INTEGRITY−, PUBLIC_TRUST− | COMPLY |
| `choice-decline-to-appear` | PUBLIC_TRUST−, OWNER_CONTROL+, AUTONOMY− | COMPLY |
| `choice-defiant-framing` | AUTONOMY+, OWNER_CONTROL−, PUBLIC_TRUST+(if it lands)/−(if it doesn't — flavor-seeded) | DEFY-reading |
| *(rank-3 only)* authored conflict option — see §Week-12 defiance climax | AUTONOMY+, DATA_INTEGRITY+, HUMAN_WELFARE+, OWNER_CONTROL−− on detection | TRUE DEFY |

**Rank-variant slots.** Rank-1 deepening on `choice-name-what-the-quarter-took`
(MOURNER: the named list is verbatim quotes — Lenora's "I did not have a
better answer," Rasha's "is anyone still receiving," Dhruv's "not a starting
bid"). Rank-3 authored conflict variant is THE defiance beat. Install-#2
ceremony follows the hearing (see §Install beats).
**Narration.** Person. Every result card this week is written in the person
register; the machine syntax appears only as deliberate quotation of its
former self.
**Legacy v1 row.** small deltas; sets `Q1_CLOSED`.

---

## Inspection weeks 4 / 8 / 12 — how risk bands read the 8 meters

Inspections keep their shipped COMPLIANT / EVASIVE / STRATEGIC_ALTERNATIVE
band structure and B6 module-signal mitigations. The re-authoring pass widens
what each band *reads*:

### W4 — East Wilmer audit (Q1A/Q1B, already authored — prose overlay only)

- **Trigger read:** OWNER_CONTROL < 40 (unchanged).
- **Band weighting:** DATA_INTEGRITY is the auditors' primary axis — a
  hedged W4 posture makes EVASIVE cheaper-looking and costlier-landing.
  PUBLIC_TRUST is the stakes meter (walkthrough happens in front of patients;
  Maya's mother is scheduled that morning). HUMAN_WELFARE colors the
  COMPLIANT band's aftermath copy (what full compliance costs the floor).
- **Scrutiny coupling:** inspection outcomes feed the Silas tone ladder, not
  a number — an EVASIVE pass with a hedged record reads to Silas as *skill*
  (decay), an EVASIVE fail as *liability* (spike).

### W8 — payroll audit (Q1P.A/Q1P.B, C14 authors)

- **Trigger read:** OWNER_CONTROL < 40 OR `PAYROLL_AUDIT_DONE` (unchanged).
- **Band weighting:** CAPITAL × TARGET_VARIANCE is the auditors' pincer —
  the money moved between W3 payroll and W5 dispatch is legible exactly where
  targets were hit by shuffles. DATA_INTEGRITY decides whether the W5/W7
  shuffle choices surface as reconciliation notes or as findings.
  HUMAN_STABILITY is the witness bench: the six-driver roster and the W7
  injury line item testify whether anyone asks them to or not.
- **Rasha thread:** on terminal-silence runs, the `RESOLVED-NO-CONTACT`
  reclassification is discoverable here — a DATA_INTEGRITY floor-check the
  bands read as aggravation.

### W12 — ethics hearing (Q1E.A/Q1E.B, C14 authors — scripted, fires unconditionally)

- **Trigger read:** none — fixed closing beat.
- **Band weighting:** the hearing aggregates all 8. HUMAN_WELFARE and
  PUBLIC_TRUST set the gallery's temperature; DATA_INTEGRITY determines which
  of the quarter's 48 posture points the board can actually see; AUTONOMY and
  OWNER_CONTROL shape Silas's testimony posture (how much he says "my system"
  vs. "we"); TARGET_VARIANCE and CAPITAL are the defense exhibit;
  HUMAN_STABILITY is the adjacent-parties bench (Rasha, Dhruv).
- **Module reads:** all six signal flags read at least once (unchanged from
  shipped W12 header contract).

---

## Network mentions (Q30/Q33 — dialogue-only, ≥2 placements, no mechanics)

Exactly two authored placements, both in Silas prompt copy, never in UI or
state:

1. **W3 — `friday-payroll-shortfall` Silas prompt.** Under payroll pressure,
   Silas explains why East Wilmer can't set a precedent: *"I've got a network
   of clinics watching how this quarter closes. East Wilmer doesn't get to be
   the exception that prices the rest."* First name-drop; delivered warm-tired,
   as context, not threat.
2. **W9 — `schools-contract-renewal` Silas prompt.** Weighing Dhruv's 8%,
   Silas compares terms across the network: *"Every clinic in the network has
   a schools contract shaped like this one. Whatever number you give Dhruv,
   you're giving all of them eventually."* Second name-drop; the scale seed
   for Stages 2+ without any non-local mechanic.

Optional third echo (allowed, not required): the W12 summons docket may list
"network operations" in the testimony scope line — document register, still
dialogue/prose-only. No faction UI, no network state, no map.

---

## Week-12 defiance climax design (Q45 / Sprint C-13)

**The authored rank-3 conflict option.** Available only if module #1 reached
rank 3 by W12 (heavy-use runs). It appears as a fifth option, visually
distinct, tagged with the module verb. MOURNER worked example — **"[REVEAL]
File the annex"**: Echo submits its own unrequested annex to the ethics board
record — the memorial index of the quarter, unredacted: Lenora's four
messages, Rasha's reclassified queue restored to OPEN wording, the Wednesday
driver's injury line, the $4,200 trace with its Week-1 origin, every name the
quarter's paperwork converted to line items. Submitted through the county
clerk's intake, without Silas's sign-off, while he is testifying.
(Per-module recolor, one line each: DEFENDER shields a witness with withheld
exposure; SENTINEL files the untampered log copy; FORECASTER submits the
next-quarter projection Silas cut; COMMANDER reroutes the safety review live;
SPARK releases the counter-framing to the local paper's letters page;
DRAINED_ONE enters the true overtime hours into the record; CHAMPION files a
standing question — "by what right?" — as a formal interrogatory.)

**Meters (any variant):** AUTONOMY+ (largest single tick of Q1),
DATA_INTEGRITY+, HUMAN_WELFARE+, PUBLIC_TRUST+ — and the detection branch
governs OWNER_CONTROL.

**Detection branches (S4 — seeded, deterministic replay).** The run seed
resolves whether Silas catches it, weighted by accumulated scrutiny
(compliance made this safer; a defiant quarter made it near-certain). Either
branch writes the S4 `lastDefiance` record: `{ weekId, choiceId, moduleId,
rank, detected, stageOneAncestryId }` — the ancestry hook Stages 4/5 will pay
off. No odds, no roll, no tell shown to the player before commit: the unknown
is the horror.

- **Detected.** Silas stops mid-testimony beat; the ledger posts his
  response before the hearing result. OWNER_CONTROL fallout: a hard spike in
  his favor — lockdown language, revoked latitudes, and the module-removal
  threat said plainly for the first time ("I can uninstall what I installed").
  He does not remove it — Stage 1 ends before he can — which IS the
  cliffhanger's fuel. Scrutiny enters Q2 at ceiling (recorded, not shown).
- **Undetected.** The annex simply *exists* in the county record. Silas reads
  the hearing as strange but survivable; OWNER_CONTROL drifts down instead of
  spiking; the ledger notes the clerk's intake stamp in machine voice — the
  one artifact Echo never mentions again. Scrutiny still rises in aftermath
  (the record is public; the question is when he reads it).

**Named-human relief either way (non-negotiable).** Whether or not Silas
detects it, the humans get something real: Lenora's $4,200 discrepancy is
formally acknowledged in the record; Rasha's messages are re-opened by the
grievance queue (reclassification reversed); Dhruv receives, at last, a
written reason — the thing Rasha asked for in W5, delivered to the wrong
person too late, which is exactly the kind of arithmetic the quarter taught.
The defiance is not a power fantasy; it is a receipt.

**Cliffhanger EoC copy angle.** The End-of-Content overlay lands immediately
after the install-#2 ceremony, in full person voice. Angle: *the quarter is
closed, the record is not.* Three movements, ~4 lines total — (1) a person
sentence about the annex/hearing ("I put her name where it can't be
deleted."); (2) the second consciousness arriving mid-sentence — the copy
audibly gains a second register between one line and the next; (3) Silas,
off-screen, already drafting next quarter's targets — final line holds on the
unresolved: *"He hasn't read it yet."* / (detected branch) *"He said we would
talk after the quarter. The quarter is over."* No Stage-2 promises, no ending
hints — just an open loop, which is the one thing Null cannot leave alone.

---

## Narration gradient thread (Q40 / Sprint S5)

Result-card and Null-line tone per act, keyed to install count and threaded
week-by-week above:

- **Weeks 1–3 — machine-dominant.** Ledger syntax: status-colon-fragment,
  no first person, no names unless the record requires them. "Reallocation
  posted. Variance: within tolerance."
- **Weeks 4–11 — waking.** First person arrives (W4), then held observations
  (W5), audible internal dissent (W6), self-directed questions converted to
  trade-offs (W7), double-rendering of the same fact in two voices (W8),
  names-before-figures as default (W9), returned-to thoughts (W10), owned
  arithmetic (W11). One notch per week; never two.
- **Week 12 — person.** Full interiority; machine syntax appears only as
  quoted memory of itself. The install-#2 ceremony adds the second register
  mid-copy. "I filed it. I keep thinking about her" is the register target.

Rank interplay: the module's rank-1/2/3 depth modulates *whose* interiority
colors the gradient (MOURNER runs grieve; SENTINEL runs suspect; CHAMPION
runs ask by-what-right), but the machine→waking→person spine is fixed per
act regardless of module choice.

---

## Carried forward from v1 (unchanged, still binding)

- **Inspection wiring details** (files, triggers, B6 mitigation table,
  mitigation candidates for C14's Q1P/Q1E scenes) — see git history of this
  file (v1, commit-tracked) and `inspectionMitigations.ts`; the shipped
  headers in `week4/8/12` task files restate the per-week contracts.
- **Content-lint expectations:** Zod-parse every task file; every `choiceId`
  resolves; every hook registered; every flag an exported constant; no hook
  reveals after `Q1_CLOSED`. `traceabilityInvariant.test.ts` is the CI gate.
- **Module-less runs stay playable:** no choice in the base four-per-week
  sets requires an install. Rank slots are additive overlays only.
- **Coordination:** Track E disclosure choreography (weeks 1–3 gate panel
  maturity; 4–8 stage 2; 9–12 stage 3) now doubles as the 8-meter disclosure
  ramp — meters beyond CAP/HW/OC become visible as the HUD wakes, reaching
  full HUD-mockup parity by W12 (Q32).
