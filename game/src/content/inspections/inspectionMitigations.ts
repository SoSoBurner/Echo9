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
  DRAINED_ONE_YIELDED,
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
]
