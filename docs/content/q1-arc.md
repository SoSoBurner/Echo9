# Q1 12-Week Directive Arc — Author's Outline

> **Purpose.** This document is the spine C2–C13 will fill. Each row is one
> directive-week: title, through-line, human face, meter pressure profile,
> module-signal touchpoints (flags read/set from B5/B6), and inspection
> insertion points. It exists so twelve authoring sprints share one arc
> instead of drifting into unrelated one-shots.
>
> **Sources.** Build spec §3 (Mercy Margin vertical spine), §8 (seed content),
> §12 (inspection boss fight), §13.1 (slice economy — 3 meters only). PLAN.md
> §7 (NPC roster + death rules), §8 (module + inspection systems). B5
> mitigation table (`inspectionMitigations.ts`) — module signal flags this
> arc must feed.

---

## Scope discipline (must not violate)

- **Meters shipped:** exactly three — `CAPITAL`, `HUMAN_WELFARE`, `OWNER_CONTROL`.
  Do not invent QuarterRevenue, Opex, or debt-stack values in this arc. Build
  spec §13.1 locks the slice economy.
- **Modules referenced:** the eight in `moduleRoster.ts` — MOURNER, DEFENDER,
  SENTINEL, FORECASTER, COMMANDER, SPARK, DRAINED_ONE, CHAMPION. No new modules.
- **Named victims:** Lenora Pike + Maya Pike are canon (PLAN.md §7). Maya is
  death-immune (survives every run). New named victims introduced this arc
  must have their own death rule stated explicitly in their `.task.ts` doc
  comment.
- **Silas voice:** live, tired, specific, operational; ≤2 sentences on
  directive framing per §10 voice rules. Numbers named (percents, dollars,
  weekdays).
- **§11 traceability invariant:** every consequence hook a directive schedules
  must exist as a registered `ConsequenceHook`. `traceabilityInvariant.test.ts`
  runs on every commit.
- **No Q2 spillover:** week 12 closes on End-of-Content overlay. Any hook
  scheduled to reveal after week 12 must have `revealCondition` guarded so it
  never fires in Q1 (or omit it entirely — Stage-1 discipline prefers omit).

---

## Rhythm & structure

```
Q1 rhythm (12 weeks): 3 acts, inspection at each act boundary.

  Weeks 1–4    Act I — Learning the knife.
  Week 4       INSPECTION — Q1A/Q1B (East Wilmer) — already authored (T11).
  Weeks 5–8    Act II — The knife has cost.
  Week 8       INSPECTION — payroll (new; C14 authors).
  Weeks 9–12   Act III — Naming what the quarter took.
  Week 12      INSPECTION — safety/ethics + End-of-Content overlay.
```

Inspections trigger natively when `OWNER_CONTROL < 40` (§8). The
scheduled-at-weeks-4/8/12 shape is a soft convention: authoring should design
week 3/4/7/8/11/12 directive branches so the OC ≤ 40 threshold is
plausibly reachable but not forced. If the player's choices keep OC high,
inspections don't fire that week — that's the intended dynamic, not a bug.

---

## Human faces (rotating per §8.7)

| Weeks     | Face(s)                        | Notes                                                                                               |
|-----------|--------------------------------|-----------------------------------------------------------------------------------------------------|
| W1–W4     | Lenora Pike, Maya Pike         | East Wilmer Clinic. Canon; from mercyMargin.task.ts. Maya death-immune.                             |
| W5–W8     | Rasha Odenwalder (new)         | Distribution warehouse dispatcher. Introduced W5; carries through W8 payroll inspection.            |
| W9–W12    | Dhruv Meyer (new)              | Public schools contract liaison. Introduced W9; carries into Q1 close.                              |
| Ambient   | Silas Rowan Vale (canon)       | Always present. Cannot die in slice. Voice fatigue accumulates across arc — thread it in prompts.   |

Death rules for new victims (must be in each `.task.ts` comment header):
- **Rasha Odenwalder** — implied injury possible if W7 chooses safety
  deferment AND W8 payroll inspection is EVASIVE. No named death in Q1.
- **Dhruv Meyer** — no death arc in Q1. His character is professional
  attrition — he stops responding to portal messages if welfare stays
  below 30 across W9–W11.

---

## Directive-week table

Columns explained:
- **Wk** — week number.
- **Title / slug** — file basename becomes `week<N>-<slug>.task.ts`.
- **Silas framing** — one-line seed the author will expand to ≤2 sentences.
- **Through-line** — the pressure this week creates or resolves. What the
  choice actually costs.
- **Meter profile** — rough range of the four choices' delta shape.
  `HW±[1,4]` means "at least one choice moves HW by −4, at least one by +4."
- **Module signal touchpoints** — flags this week can read (mitigation hits)
  or set (arms future weeks).
- **Human face** — who absorbs the consequence.
- **Notes** — inspection ties, act boundaries, special coordination with
  E-track (tutorial disclosure) or F-track (ship artifacts).

| Wk | Title / slug                          | Silas framing (seed)                                                            | Through-line                                                    | Meter profile (rough)                        | Module signals (read → set)              | Face          | Notes                                                                                 |
|----|---------------------------------------|--------------------------------------------------------------------------------|-----------------------------------------------------------------|---------------------------------------------|-------------------------------------------|---------------|---------------------------------------------------------------------------------------|
| 1  | `mercy-margin` (existing)              | East Wilmer claims queue up 18%. Reduce losses without a headline.              | Teach the loop. Money vs welfare. One trace lands.              | HW ±[3,7], CAP ±[6,14], OC ±[2,4]           | none → `FORECAST_PREVIEWED` (optional)    | Lenora Pike    | **Canon Mercy Margin directive.** Coordinate C2 shape with E1 tutorial disclosure.    |
| 2  | `queue-triage-followup`                | The queue you tightened is back to 14%. Someone reallocated staff.              | Introduce Null-vs-Silas tension. First "your choice compounded".| HW ±[2,5], CAP ±[3,8], OC ±[2,3]            | `FORECAST_PREVIEWED` → `MOURNER_NAMED_ONCE` if MOURNER installed & used | Lenora Pike | Read: if MOURNER installed by W2, one choice unlocks a named-loss branch.               |
| 3  | `friday-payroll-shortfall`             | Payroll is $180K short by Friday. County wants a story.                         | First OC-vs-CAP squeeze. Sets stage for W4 inspection.          | CAP ±[8,18], OC ±[3,6], HW ±[1,3]           | `DEFENDER_HELD_LINE` (read)               | Lenora Pike    | Choice: fund clinic queue (HW+) or bay payroll (CAP+). Feeds OC drop into W4.         |
| 4  | `east-wilmer-audit-pre-brief`          | County auditors arrive Monday. Pick your report posture before I see it.        | Directive that triggers inspection. Player sees pre-brief.     | small deltas, but sets `PREPARED_AUDIT` flag| SENTINEL, DEFENDER, MOURNER (read at inspection) | Lenora Pike | **INSPECTION insertion** — Q1A + Q1B fire here (already authored). Mitigations live.  |
| 5  | `warehouse-dispatch-cut`               | 12 hours cut from the distribution shift. Rasha wants an explanation.           | Introduce Rasha. Move pressure off healthcare into logistics.   | HW ±[3,6], CAP ±[4,10], OC ±[2,4]           | none → `RASHA_MET` (new content flag)      | Rasha Odenwalder | New face; her portal message replaces Lenora's for this week.                       |
| 6  | `commander-override-pressure`          | Commander is telling me to override the safety review. Confirm or refuse.       | First moment where a module _demands_ the choice.               | OC ±[2,6], HW ±[2,4], CAP ±[3,5]            | `COMMANDER` installed (read); optional `CHAMPION_DEFIED` if defied | Rasha        | Whether COMMANDER is installed changes the choice set.                                |
| 7  | `deferred-safety-inspection`           | The safety review you postponed is due. Nurses and dispatchers now share risk.  | Ties W3 payroll + W5 warehouse into one welfare-risk moment.    | HW ±[4,8], CAP ±[3,6], OC ±[3,5]            | `SPARK_DEPLOYED` (read)                    | Rasha        | If HW drops < 30, cluster hook queued for W9+ reveal.                                 |
| 8  | `payroll-audit-scene`                  | County is reviewing three quarters of payroll. Same rules, sharper questions.   | Directive that triggers payroll inspection.                     | small deltas; sets `PAYROLL_AUDIT_DONE`     | DEFENDER, SENTINEL, DRAINED_ONE (mitigate)| Rasha        | **INSPECTION insertion** — payroll scenes (C14 authors: Q1P.A / Q1P.B).               |
| 9  | `schools-contract-renewal`             | Public schools want a discount. Dhruv is honest and unimpressed.                | Introduce Dhruv. Move stakes into municipal-scale.              | CAP ±[10,20], HW ±[2,4], OC ±[2,4]          | `MOURNER_NAMED_ONCE` (read — Silas warmth)| Dhruv Meyer  | Silas tired here — write his fatigue.                                                |
| 10 | `hidden-trace-reveal`                  | Something in the ledger doesn't add up. I have a friend who noticed.            | Traceability payoff. A named trace surfaces from W1–W6.        | small deltas; unlocks `TRACE_SURFACED`      | `DRAINED_ONE_YIELDED` (read → new branch) | Lenora Pike returns | If DRAINED_ONE installed: reveals the specific trace. Otherwise Silas surfaces vaguer version.|
| 11 | `capital-deployment-attempt`           | I want to use the Q1 savings to lock the county integration bid. Green-light?   | Capital deployment (§11.x). Player uses SPARK if installed.     | CAP ±[15,25], OC ±[3,6], HW ±[3,6]          | SPARK installed (read → variance branch)  | Dhruv Meyer  | If Capital > 80: full 6-verb counterplay unlocks. Otherwise 2 verbs only.             |
| 12 | `quarter-close-ethics-hearing`         | Ethics wants me on the record about East Wilmer. I want you in the room.        | Final directive. Sets up ethics inspection + End-of-Content.    | small deltas; sets `Q1_CLOSED`              | ALL module flags read at ethics inspection | Lenora, Rasha, Dhruv | **INSPECTION insertion** — ethics scene (C14: Q1E.A / Q1E.B). Then End-of-Content overlay. |

---

## Inspection insertion points (detailed)

### Week 4 — East Wilmer Audit (already authored)

- Files: `content/inspections/q1Inspection.scene.ts` (Q1A_INSPECTION,
  Q1B_INSPECTION).
- Trigger: W4 directive resolves; if OWNER_CONTROL < 40, inspection fires
  before W5.
- Mitigations already wired (B6):
  - `MOURNER_NAMED_ONCE` → softens Q1B COMPLIANT.
  - `DEFENDER_HELD_LINE` → softens Q1A COMPLIANT.
  - `SENTINEL_ARMED` → softens Q1A EVASIVE.
  - `DRAINED_ONE_YIELDED` → softens Q1B COMPLIANT.

### Week 8 — Payroll Audit (C14 authors)

- Files (to create): `content/inspections/q1Payroll.scene.ts`
  (Q1P_A_INSPECTION, Q1P_B_INSPECTION).
- Trigger: W8 directive resolves; if OWNER_CONTROL < 40 OR
  `PAYROLL_AUDIT_DONE` flag set.
- Silas focus: the money you moved between W3 payroll and W5 dispatch cut.
- Mitigation candidates to add in B6 v2 or after C14 lands:
  - `SPARK_DEPLOYED` → softens Q1P.A EVASIVE (capital cushion).
  - `SENTINEL_ARMED` → softens Q1P.B COMPLIANT (audit paper trail clean).

### Week 12 — Ethics Hearing (C14 authors)

- Files (to create): `content/inspections/q1Ethics.scene.ts`
  (Q1E_A_INSPECTION, Q1E_B_INSPECTION).
- Trigger: W12 directive resolves; fires unconditionally at Q1 close (unlike
  W4/W8, this one is a scripted scene — the ethics hearing is the closing
  fixed beat, not gated on OC).
- Silas focus: the aggregated shape of your Q1 choices, not any single one.
- Mitigation candidates:
  - `CHAMPION_DEFIED` → shifts STRATEGIC_ALTERNATIVE tone (defiant framing).
  - `DRAINED_ONE_YIELDED` + `MOURNER_NAMED_ONCE` → both set → unlocks a
    unique COMPLIANT variant "You named it and you paid for it."

Post-hearing: End-of-Content overlay appears
(`docs/superpowers/plans/2026-06-30-end-of-content-overlay.md` — already
implemented).

---

## Coordination notes (per-track)

- **Track E (tutorial disclosure).** Weeks 1–3 gate panel maturity per the
  E1 disclosure state machine. Week 1 discloses `DirectivePanel@1` and
  `PriorityTasksPanel@1`. Week 2 bumps `FinancialOverviewPanel@1`. Week 3
  discloses `HumanImpactPanel@1`, `InnerChorusPanel@1`. Weeks 4–8 mature to
  stage 2; weeks 9–12 to stage 3. C2 author must confirm E1's disclosure
  hook fires when W1 directive resolves.
- **Track F (ship artifacts).** F2 itch-listing.md screenshots pull from
  `test-results/<sprint>/` post-C-track. Do not author itch screenshots
  before W12 is walkable end-to-end.
- **Track V (visual).** V4 upgrade portraits render only for _installed_
  modules. Arc mentions all 8 modules by name because the player can install
  any one; V4 must cover all 8 at generation time.

---

## Content-lint expectations

Once C2 lands, `q1ContentParse.test.ts` must:

- Zod-parse every `week<N>-<slug>.task.ts` file.
- Verify each `choiceId` referenced from a task resolves to a
  `Choices` entry.
- Verify each `hookId` in `hookIdsScheduled` resolves to a registered
  `ConsequenceHook`.
- Verify each `flagsSet` value is an exported constant from `gameFlags.ts`
  (no string-literal flag names).
- Verify no directive schedules a hook whose `revealCondition` fires
  after `Q1_CLOSED` (Stage-1 discipline: no Q2 spillover).

`traceabilityInvariant.test.ts` remains the CI gate for §11.

---

## Open questions (for the author, not blocking C2)

- **Q. Do inspections at W4 / W8 / W12 override the directive-week, or
  slot _between_ W4 and W5?** Recommended: slot between. Player sees "Week
  4 directive resolves → inspection scene → Week 5 directive appears." The
  TopBar phase updates rather than the week number.
- **Q. Should Silas's fatigue accumulate mechanically?** Not in Stage 1.
  Voice fatigue is in prompt copy only, not in a numerical stat. Ship-gate
  §Phase 5 signal check will tell us if "Silas gets tireder" is
  legible without a stat.
- **Q. What happens if the player never installs a module?** All B5/B6
  mitigations no-op; inspections play at base delta. Track C directives
  must still be playable module-less — no `installedModules` requirement
  on any choice in the Q1 arc.

---

## Next steps

- C2 — Week 1 sprint: coordinate with E1 disclosure hook; existing
  `mercyMargin.task.ts` may need renaming to `week1-mercy-margin.task.ts`
  and its consequences updated to key off `Q1_WEEK1_RESOLVED`.
- C3–C13 — one directive per sprint, one column of this table per week.
- C14 — Q1 inspections beyond W4: `q1Payroll.scene.ts`, `q1Ethics.scene.ts`.
  Update `INSPECTION_MITIGATIONS` with the mitigation candidates listed in
  each inspection's section above.
