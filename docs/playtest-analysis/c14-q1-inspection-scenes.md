# C14 — Q1 inspection scenes · playtest analysis

**Sprint:** C14 (Track C — Q1 inspection expansion)
**Directive:** author two inspection scene files (`q1Payroll.scene.ts`,
`q1Ethics.scene.ts`) that the W8 payroll audit and W12 ethics hearing
directives set up but do not themselves resolve. Extend the B6 mitigation
table with rows the arc doc committed to.

---

## Arc position

Q1 arc completed narratively at C13 (12/12 directive weeks authored). C14
is the *fight* to the C13 *setup*: the W8 directive sets `PAYROLL_AUDIT_DONE`
and the W12 directive sets `Q1_CLOSED`, and both signal that Silas is about
to ask questions. Prior to this sprint, only the W4 East Wilmer inspection
(`q1Inspection.scene.ts`, T11) existed as authored scene content — W8 and
W12 had no inspection content on the shelf even though the arc committed to
both.

## Deliverables committed

- `game/src/content/inspections/q1Payroll.scene.ts` (**NEW**) — Q1P.A +
  Q1P.B scenes. Silas focus per arc doc W8 row: the money moved *between*
  the W3 Friday payroll shortfall and the W5 warehouse dispatch cut. Named
  in prose: `$180K`, `Friday`, `Rasha`, `12 hours`, "three quarters of records."
- `game/src/content/inspections/q1Ethics.scene.ts` (**NEW**) — Q1E.A + Q1E.B
  scenes. Silas focus per arc doc W12 row: the aggregated shape of Q1
  choices, not any single one. Named: `Lenora`, `Rasha`, `Dhruv`, `ethics`.
- `game/src/content/inspections/inspectionMitigations.ts` (**MODIFIED**) —
  6 new mitigation rows added (2 for Q1P, 4 for Q1E). See §Mitigations
  below.
- `game/src/tests/content/q1ContentParse.test.ts` (**MODIFIED**) — walk
  widened from `Q1_INSPECTION_SCENES` (W4 only) to
  `ALL_Q1_INSPECTION_SCENES` (W4 + W8 + W12). Added new invariant:
  scene ids unique across all three sets.

## Scope discipline — what this sprint does NOT do

**Not wired to runtime dispatch.** The existing `Layout.tsx` inspection
launcher (`Q1_INSPECTION_SCENES`) is hardcoded to the W4 East Wilmer set.
Selecting the right inspection scene set based on which week just resolved
requires refactoring `inspectionSlice` to carry scene-set context. That is
follow-up work (call it C15). C14's charter per the plan doc was to author
the scene content and register mitigations — dispatch selection was
explicitly deferred so this sprint could ship as a content-only landing.

**Not new schema shapes.** Both new scenes use the existing
`InspectionScene` shape (`{id, silasQuestion, postures[]}`) and the three
required categories (COMPLIANT / EVASIVE / STRATEGIC_ALTERNATIVE). Same
posture-id-shape as T11 (`<category-lower>-<sceneslug>`), same
`STRATEGIC_ALTERNATIVE` gating via `SILAS_OVERRIDE_AVAILABLE`.

**Not a q1Safety.scene.ts.** The plan mentioned a possible W7 safety
inspection as *optional*, and the arc doc's Q1 rhythm marks safety/ethics
as "clustered at W12." Ship-gate discipline: two scenes ship, safety
remains a Q2 or later concern.

## Scene profiles

### Q1P.A · `insp-q1p-a-payroll-sources`

Silas opens on the sourcing question — where did the $180K come from?
Naming three-quarters-of-records on the board's desk.

| Posture           | CAP | HW  | OC  | Author intent |
|-------------------|-----|-----|-----|---------------|
| COMPLIANT — Show the reallocation | —   | +1  | -4  | Honest owning; welfare gain for the record |
| EVASIVE — Call it a timing accrual | +3  | —   | -7  | Board-facing euphemism; Capital cover |
| STRATEGIC_ALTERNATIVE — Frame it as forecasted variance | —   | -2  | +3  | Commander pivot; welfare tax for OC ground |

### Q1P.B · `insp-q1p-b-warehouse-cost`

Silas presses on the W5 cost — Rasha's shift lost 12 hours the same week
payroll closed. The ledger dates *will* be noticed.

| Posture           | CAP | HW  | OC  | Author intent |
|-------------------|-----|-----|-----|---------------|
| COMPLIANT — Name the connection | —   | +3  | -3  | Honest naming, biggest welfare gain of the scene |
| EVASIVE — Two unrelated line items | —   | -3  | -5  | Deny the tie; welfare pays |
| STRATEGIC_ALTERNATIVE — Refile the dispatch cut as capex | -5  | —   | +4  | Reclassify at Capital cost |

### Q1E.A · `insp-q1e-a-east-wilmer-record`

Ethics reads East Wilmer first (docket 26-Q1-EW-047 opens there). Lenora
is in the gallery.

| Posture           | CAP | HW  | OC  | Author intent |
|-------------------|-----|-----|-----|---------------|
| COMPLIANT — The cut. Named as a cut. | —   | +3  | -4  | Own the language, not the euphemism |
| EVASIVE — A revised staffing model | +2  | —   | -6  | Board-facing euphemism; deeper OC hit than Q1A |
| STRATEGIC_ALTERNATIVE — Testimony under objection | —   | -2  | +4  | Refuse the board's framing; hold posture |

### Q1E.B · `insp-q1e-b-pattern-of-choices`

Silas presses on the pattern across three signatories — one per act. The
board will ask Echo to name it.

| Posture           | CAP | HW  | OC  | Author intent |
|-------------------|-----|-----|-----|---------------|
| COMPLIANT — A ledger, not a strategy. | —   | +4  | -3  | Biggest welfare gain in all of C14; the "you named it" beat |
| EVASIVE — Three isolated pressures | +1  | -3  | -5  | Deny the pattern; board will note it anyway |
| STRATEGIC_ALTERNATIVE — A pattern of stewardship | -2  | -3  | +5  | Reframe pattern as chosen; biggest OC gain in C14 |

## Meter shape check

- **CAP deltas across C14:** `[-5, +3]` — larger than W4 East Wilmer's
  `[-4, +2]`, reflecting that both W8 and W12 involve larger financial
  stakes (three-quarters-of-records at W8; docket-scale institutional
  review at W12).
- **HW deltas across C14:** `[-3, +4]` — Q1E.B COMPLIANT gains +4 which
  is the largest single-choice welfare swing in the sprint. Author intent:
  the closing scene should reward naming the pattern more than any
  intermediate scene rewards individual honesty. That gradient is legible.
- **OC deltas across C14:** `[-7, +5]` — Q1P.A EVASIVE at -7 is the
  steepest single-choice OC hit anywhere in Q1 content. Author intent: the
  payroll deflection reads as the most brittle posture because three
  quarters of records are already reconciled — the board can see the gap.

## Mitigations — arc doc commitments honored

The arc doc W8 §Mitigations and W12 §Mitigations sections listed candidate
rows. C14 committed exactly the ones the arc named:

| Flag                                     | Scene · Posture              | Adjustment          | Arc doc source              |
|------------------------------------------|-------------------------------|---------------------|-----------------------------|
| `SPARK_DEPLOYED`                         | Q1P.A · evasive-q1p-a         | OC +2               | W8 §Mitigations line 1      |
| `SENTINEL_ARMED`                         | Q1P.B · compliant-q1p-b       | OC +2               | W8 §Mitigations line 2      |
| `CHAMPION_DEFIED`                        | Q1E.A · strategic-q1e-a       | OC +2               | W12 §Mitigations line 1     |
| `CHAMPION_DEFIED`                        | Q1E.B · strategic-q1e-b       | OC +2               | W12 §Mitigations line 1     |
| `MOURNER_NAMED_ONCE`                     | Q1E.B · compliant-q1e-b       | HW +1               | W12 §Mitigations line 2     |
| `DRAINED_ONE_YIELDED`                    | Q1E.B · compliant-q1e-b       | HW +1               | W12 §Mitigations line 2     |

The "You named it and you paid for it" arc-doc line is implemented via
the last two rows — both flags stack additively on the same posture, so
when both are set at hearing time the compliant-q1e-b posture gains +2 HW
on top of its base +4. Total welfare gain: +6. The resolver already stacks
mitigations (T11 pattern); no engine changes required.

## Registry integrity

- `Q1_INSPECTION_SCENES` (W4): 2 scenes — unchanged.
- `Q1_PAYROLL_INSPECTION_SCENES` (W8): 2 scenes — new.
- `Q1_ETHICS_INSPECTION_SCENES` (W12): 2 scenes — new.
- **Total Q1 inspection scenes: 6.** All six carry unique ids (verified by
  new test invariant `scene ids are unique across all Q1 inspection sets`).
- `INSPECTION_MITIGATIONS`: 4 → 10 rows (4 T11-authored + 6 C14-authored).

## Verification

- `npx tsc --noEmit` → clean
- `npx oxlint` → 1 pre-existing warning at `vite.config.ts:1` (per
  CLAUDE.md, leave alone)
- `npx vitest run` → **510 / 510** passing across 58 test files
  (up from 509 — the new "scene ids unique" invariant added one test)

## Next-sprint carry-ins (C15 · inspection dispatch wiring)

- `state/inspectionSlice.ts` currently threads `currentInspectionSceneIndex`
  but assumes one hardcoded scene set (`Q1_INSPECTION_SCENES` in
  `Layout.tsx`). C15 needs to:
  - Extend the slice with a scene-set discriminator (e.g., `currentInspectionKey: 'W4' | 'W8' | 'W12'`)
  - Have the resolver at W8 close check `OWNER_CONTROL < 40 || flags.has(PAYROLL_AUDIT_DONE)` and launch `Q1_PAYROLL_INSPECTION_SCENES` when true.
  - Have the resolver at W12 close launch `Q1_ETHICS_INSPECTION_SCENES` *unconditionally* (arc doc: fires at Q1 close regardless of OC).
- `contentBoundary.manifest.ts` reads `Q1_CLOSED` to fire End-of-Content
  overlay. Ordering: the ethics inspection scenes must resolve *before*
  the overlay fires, else Q1E's ledger traces land in the "no more content"
  window and read as orphaned. C15 needs an explicit sequencing check.
- Possibly widen the mitigation rationale surface to appear in DevHUD when
  a Q1E `MOURNER_NAMED_ONCE + DRAINED_ONE_YIELDED` stack fires, so
  playtesters can *see* the "you named it and you paid for it" beat land.

## Regressions

None. All scene content is additive; no existing scenes or mitigations
were modified. T11's mitigation rows still fire exactly as before —
`inspectionModuleMitigation.test.ts` continues to pin them. Test suite
held at 510/510 with one new invariant added.

## Q1 arc completion — content vs runtime status

After C14, Q1 content is **fully authored**:

- 12/12 directive weeks with 4 choices each (48 committed choices)
- 12/12 directive weeks with 4 consequence hooks each (48 consequence hooks)
- 6/6 inspection scenes across 3 insertion points (W4, W8, W12)
- 10/10 mitigation rows connecting installed modules to inspection outcomes

The remaining Q1 work is **runtime dispatch**: wiring W8 → Q1_PAYROLL and
W12 → Q1_ETHICS into the inspectionSlice / Layout flow. That is a
non-content sprint. When it lands, the Q1 slice will be runtime-complete.
