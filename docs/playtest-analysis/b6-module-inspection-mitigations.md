# Sprint B6 — Playtest Analysis

**Date:** 2026-07-04
**Sprint scope:** Lift the 6 B5 module-signal flags into `resolveInspection`
so installed modules softens or strengthens Q1 inspection posture deltas.
**Commit range:** `c7e30fb..HEAD` (B5 → B6)
**Screenshots:** `game/test-results/b6-module-inspection-mitigations/`

## What landed

- New content file `inspectionMitigations.ts` — a 4-row lookup table keyed on
  `(flag, sceneId, postureId) → { adjustment, rationale }`. Standalone from
  the `InspectionScene` schema on purpose: scenes stay decoupled from module
  identifiers, and new modules can register mitigations without editing scenes.
- `resolveInspection` extended (step "3." folded in before "4. apply deltas"):
  iterates `INSPECTION_MITIGATIONS`, filters by `(sceneId, postureId, flag)`,
  and folds adjustments into a fresh `effectiveDeltas` object. The returned
  `meterDeltas` field is now the *effective* delta (base + all applied
  mitigations) so the returned shape can never drift from the applied change.
- New `MITIGATION_APPLIED` debug event on the `InspectionDebugEvent` union —
  gives the DevHUD a hook to surface which module bent which posture and why
  (rationale is on the mitigation record).
- 11 new tests in `inspectionModuleMitigation.test.ts` pinning the ladder:
  baseline (no flags) × 3, MOURNER × 3, DEFENDER × 1, SENTINEL × 1,
  DRAINED_ONE × 1, stacking × 1, feed-through × 1.

## Mitigation table (design summary)

| Flag                     | Scene (Q1)                       | Posture         | Adjustment           | Character read                                                       |
|--------------------------|----------------------------------|-----------------|----------------------|----------------------------------------------------------------------|
| `MOURNER_NAMED_ONCE`     | Q1B (downstream cost)            | `compliant-q1b` | OC +1                | Silas already trusts you name the loss; honest posture reads lighter |
| `DEFENDER_HELD_LINE`     | Q1A (East Wilmer cut)            | `compliant-q1a` | CAP +1               | Defender's presence documents the cut; capital sentiment recovers    |
| `SENTINEL_ARMED`         | Q1A (East Wilmer cut)            | `evasive-q1a`   | OC +2                | Sentinel muted the surveillance; deflection is cheaper on OC         |
| `DRAINED_ONE_YIELDED`    | Q1B (downstream cost)            | `compliant-q1b` | HW +1                | Welfare partially bought back at install; honesty compounds          |

SPARK_DEPLOYED and CHAMPION_DEFIED are B5-registered but B6 doesn't wire them
yet — the roster's variance framing for those two ("praise or threat" swing)
argues for the ctx.rng pass rather than a fixed additive mitigation. Deferred
to a future variance sprint.

## Checkpoints captured

Same 11-step arc as B5 (identity guard after 2 iterations, still gated by
sparse Q1 content). B6 changed the inspection resolver; the walker doesn't
yet trigger the INSPECTION phase because OWNER_CONTROL doesn't drop below
40 in a 2-cycle mercyMargin walk. The mitigations are pinned by the unit
tests; runtime visibility waits on either (a) a walker path that installs
COMMANDER + arms the override, or (b) Track C content that pushes OC below
40 within the achievable arc.

| # | Screenshot | State observation |
|---|---|---|
| 01 | comfort-panel.png | Comfort panel unchanged. |
| 02 | boot-screen.png | Initialize button visible. |
| 03 | hud-fresh.png | HUD boots with A2/A3/A4/A5 panels; install grid shows all 8 modules. |
| 04 | module-installed.png | First module installed. |
| 05 | directive-01/02.png | Two directive cycles then walker halts at identity guard. |
| 06 | choice-selected-01/02.png | Choice `2` (Reduce by 20%) selected. |
| 07 | result-01/02.png | RESULT card renders. |
| 08 | echo-toast-01/02.png | Echo-pending toast fires. |
| 09 | consequence-01/02.png | ConsequenceReturnPanel opens. |
| 10 | terminal-state.png | Terminal state reached. |

## Mockup parity

- [x] Left column A2–A5 panels: still present.
- [x] Right column module console: install grid → USE button after install.
- [~] Center directive/choice cards: same as B5 baseline.
- [ ] Right rail Silas portrait, quarter goal, comms, risk: not present.
- [ ] Bottom ledgers/donut/system/alert: LogDock only.

## Spec adherence

- **§8 Inspections / §12 Q1 slice:** `resolveInspection` continues to enforce
  posture validation, STRATEGIC_ALTERNATIVE gating on `SILAS_OVERRIDE_AVAILABLE`,
  meter-key allowlist, and immutability. B6 slots mitigations in before delta
  application, so all pre-existing invariants still hold — the pre-existing
  `inspectionEngine.test.ts` (9 sections) is still green.
- **§11 Traceability invariant:** No new `hookIdsScheduled` values were added
  by B6, so the invariant is preserved (no fictional consequence IDs).
- **§Stage 1 discipline (line 1189):** No new mechanics — mitigations use the
  pre-existing `state.flags: ReadonlySet<string>` channel and the pre-existing
  `posture.meterDeltas` shape. Only the delta values on the wire are widened.
- **Character silence pillar:** Installing a module now visibly bends how
  Silas's inspection reads. This is the point where §6 module roster promises
  ("Mourner names the loss", "Defender holds the line") reach the resolver
  layer that Silas talks about in inspection results.
- **Trace ledger pillar:** Trace body still reads
  `${category} — ${posture.label}`, but the actual meter movement now reflects
  the mitigated deltas. A future refinement could inject the mitigation
  rationale into the trace body for higher-signal ledger reads.

## Regressions

None. Trinity green: `tsc --noEmit` clean, `oxlint` clean (only pre-existing
`vite.config.ts:1` triple-slash warning), `vitest run` 502/502 (up from
491/491 — +11 mitigation assertions).

The pre-existing `inspectionEngine.test.ts` (9 sections, ~16 assertions)
still passes without modification — B6 is additive to the resolver, not
disruptive.

## Carry-ins for next sprint

- [ ] **C1 (next per plan):** Q1 arc outline. The mitigation table is
      designed for Q1A/Q1B specifically; when Track C authors additional
      inspection scenes (Q1 payroll / safety / ethics per C14), we'll
      extend `INSPECTION_MITIGATIONS` with rows for those scenes.
- [ ] **SPARK_DEPLOYED / CHAMPION_DEFIED variance:** deferred variance
      pass on `runModuleAbility` — those two modules' roster promises
      swing-based effects that don't map cleanly onto a fixed additive
      mitigation. Land when we consume `ctx.rng` in the ability engine.
- [ ] **Walker inspection path:** the current stageWalker doesn't drive
      OWNER_CONTROL below 40 (would require Track C content or a
      specialized capture spec). Once Q1 arc lands, walker will
      naturally surface mitigation-affected inspection screens.
- [ ] **V5 layout compression (unchanged from A4/A5):** still ~700–800px
      of panel content vs. ~600px column viewport at 1280×720.
- [ ] **DevHUD:** the new `MITIGATION_APPLIED` debug event has no
      subscriber yet. When DevHUD gets an inspection panel, surface the
      rationale so playtesters can see the character grounding.

## Ship-gate signal check

Would this build earn ≥10 unsolicited comments about trace ledger or
character silence?

**Answer:** NO — B6 is invisible in the current walker because the
inspection phase doesn't fire yet. But B6 is the load-bearing plumbing:
once Track C content routes players into an inspection with a module
installed, the numbers on the RESULT card will shift *because of the
module*. That's the first place where an unsolicited "wait, that number
moved because I installed Sentinel" comment becomes possible.

Track C (Q1 arc content) + a walker path that dips OWNER_CONTROL below
40 are what will make B6 visible. B7 or later can add the walker
extension.
