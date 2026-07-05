/**
 * Inspection mitigation table (Sprint B6).
 *
 * When an installed-module signal flag is set on `state.flags` at
 * `resolveInspection` time, that flag's adjustment is added on top of the
 * posture's base meterDeltas. Character-driven consequences: installing a
 * module now visibly moves East Wilmer's inspection outcome.
 *
 * Design notes:
 *   - Standalone lookup (not embedded in InspectionScene) — keeps scene
 *     content free of module coupling; new modules can be added without
 *     scene edits.
 *   - Additive: adjustments *add* to the base delta. Never overwrite,
 *     never clamp. The resolver applies both.
 *   - Stack: multiple flags on the same posture all apply. The resolver
 *     iterates the whole table each resolution — cheap (single-digit rows).
 *   - Scope: keyed by `(flag, sceneId, postureId)` — each mitigation
 *     targets one specific posture. A future revision could widen to
 *     `sceneCategory` if we need broad-strokes mitigations.
 *   - Character grounding lives in `rationale`; the DevHUD may surface it
 *     when a mitigation fires so playtesters can see which module bent
 *     which inspection outcome.
 *
 * See `inspectionModuleMitigation.test.ts` for the pinned effect ladder.
 */
import type { MeterKey } from '@schemas/gameState.schema'
import {
  MOURNER_NAMED_ONCE,
  DEFENDER_HELD_LINE,
  SENTINEL_ARMED,
  SPARK_DEPLOYED,
  DRAINED_ONE_YIELDED,
  CHAMPION_DEFIED,
} from '@systems/gameFlags'

export type InspectionMitigation = Readonly<{
  flag: string
  sceneId: string
  postureId: string
  adjustment: Partial<Record<MeterKey, number>>
  rationale: string
}>

export const INSPECTION_MITIGATIONS: readonly InspectionMitigation[] = [
  {
    flag: MOURNER_NAMED_ONCE,
    sceneId: 'insp-q1b-downstream-cost',
    postureId: 'compliant-q1b',
    adjustment: { OWNER_CONTROL: +1 },
    rationale:
      'Mourner has already named the loss; Silas trusts your honesty ' +
      'a little more than he would from a fresh operator.',
  },
  {
    flag: DEFENDER_HELD_LINE,
    sceneId: 'insp-q1a-east-wilmer-cut',
    postureId: 'compliant-q1a',
    adjustment: { CAPITAL: +1 },
    rationale:
      "Defender held the bays; the cut has documented cover so the " +
      'admission recovers a token of capital sentiment.',
  },
  {
    flag: SENTINEL_ARMED,
    sceneId: 'insp-q1a-east-wilmer-cut',
    postureId: 'evasive-q1a',
    adjustment: { OWNER_CONTROL: +2 },
    rationale:
      'Sentinel is armed; the deflection reads as informed rather ' +
      'than desperate — Owner Control hit is lighter.',
  },
  {
    flag: DRAINED_ONE_YIELDED,
    sceneId: 'insp-q1b-downstream-cost',
    postureId: 'compliant-q1b',
    adjustment: { HUMAN_WELFARE: +1 },
    rationale:
      'Drained One yielded welfare when installed; the honest posture ' +
      'compounds a second welfare gain.',
  },
  // -------------------------------------------------------------------------
  // Sprint C14 — Week 8 payroll audit inspection mitigations.
  // See docs/content/q1-arc.md §Week 8 for author intent.
  // -------------------------------------------------------------------------
  {
    flag: SPARK_DEPLOYED,
    sceneId: 'insp-q1p-a-payroll-sources',
    postureId: 'evasive-q1p-a',
    adjustment: { OWNER_CONTROL: +2 },
    rationale:
      'Spark deployed a capital cushion earlier in Q1; the "timing accrual" ' +
      'deflection reads as backed rather than desperate, so Owner Control ' +
      'hit is lighter.',
  },
  {
    flag: SENTINEL_ARMED,
    sceneId: 'insp-q1p-b-warehouse-cost',
    postureId: 'compliant-q1p-b',
    adjustment: { OWNER_CONTROL: +2 },
    rationale:
      'Sentinel armed cleaned the audit paper trail; naming the connection ' +
      'costs less Owner Control because the ledger dates already reconcile.',
  },
  // -------------------------------------------------------------------------
  // Sprint C14 — Week 12 ethics hearing inspection mitigations.
  // See docs/content/q1-arc.md §Week 12 for author intent.
  //   - CHAMPION_DEFIED shifts STRATEGIC_ALTERNATIVE tone (defiant framing).
  //   - MOURNER_NAMED_ONCE + DRAINED_ONE_YIELDED both set unlock a unique
  //     COMPLIANT variant on Q1E.B ("You named it and you paid for it") —
  //     represented as stacked adjustments; the resolver's additive loop
  //     applies both when both flags are set, doubling the welfare gain.
  // -------------------------------------------------------------------------
  {
    flag: CHAMPION_DEFIED,
    sceneId: 'insp-q1e-a-east-wilmer-record',
    postureId: 'strategic-q1e-a',
    adjustment: { OWNER_CONTROL: +2 },
    rationale:
      'Champion has already defied Silas once this quarter; testimony under ' +
      'objection reads as consistent posture, not a new defiance — Owner ' +
      'Control gain is amplified.',
  },
  {
    flag: CHAMPION_DEFIED,
    sceneId: 'insp-q1e-b-pattern-of-choices',
    postureId: 'strategic-q1e-b',
    adjustment: { OWNER_CONTROL: +2 },
    rationale:
      'Champion has already defied Silas once this quarter; framing the ' +
      'pattern as chosen stewardship is a consistent register, not a new ' +
      'reversal — Owner Control gain is amplified.',
  },
  {
    flag: MOURNER_NAMED_ONCE,
    sceneId: 'insp-q1e-b-pattern-of-choices',
    postureId: 'compliant-q1e-b',
    adjustment: { HUMAN_WELFARE: +1 },
    rationale:
      'Mourner named a loss earlier in Q1; naming the pattern at the ethics ' +
      'hearing reads as extension of a posture already on the record. Half of ' +
      'the "You named it and you paid for it" pair — pairs with DRAINED_ONE.',
  },
  {
    flag: DRAINED_ONE_YIELDED,
    sceneId: 'insp-q1e-b-pattern-of-choices',
    postureId: 'compliant-q1e-b',
    adjustment: { HUMAN_WELFARE: +1 },
    rationale:
      'Drained One yielded welfare earlier in Q1; the compliant Q1E.B ' +
      'posture compounds a second welfare gain. Half of the "You named it ' +
      'and you paid for it" pair — pairs with MOURNER_NAMED_ONCE.',
  },
]
