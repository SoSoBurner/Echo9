/**
 * Q1 inspection scene-set registry (Sprint C15).
 *
 * The Q1 arc has three inspection insertion points:
 *   W4  — East Wilmer field visit (T11-authored, gated on OWNER_CONTROL < 40).
 *   W8  — Payroll audit hearing (C14-authored, gated on
 *         OWNER_CONTROL < 40 || flags.has(PAYROLL_AUDIT_DONE)).
 *   W12 — Ethics hearing (C14-authored, unconditional at Q1 close).
 *
 * The `inspectionSlice` cursor (`currentInspectionSceneIndex`) does not know
 * WHICH scene list it is indexing — that is the discriminator this registry
 * provides. Layout stores `currentInspectionKey` alongside the index and
 * resolves the active scene list via `Q1_INSPECTION_SETS[key]`.
 *
 * Design notes:
 *   - Frozen record: adding a fourth insertion point requires a new key +
 *     `Q1InspectionKey` union widening, which the type system enforces at
 *     every call site.
 *   - Scene id uniqueness across all three sets is asserted by
 *     `q1ContentParse.test.ts` (invariant added in C14).
 *   - Not persisted: mid-inspection reload rewinds to the first scene of
 *     the active set (inspectionSlice doc comment). The discriminator
 *     joins the cursor in that same non-persist rule.
 */
import type { InspectionScene } from '@schemas/inspectionScene.schema'
import { Q1_INSPECTION_SCENES } from './q1Inspection.scene'
import { Q1_PAYROLL_INSPECTION_SCENES } from './q1Payroll.scene'
import { Q1_ETHICS_INSPECTION_SCENES } from './q1Ethics.scene'

export type Q1InspectionKey = 'W4' | 'W8' | 'W12'

export const Q1_INSPECTION_KEYS: readonly Q1InspectionKey[] = ['W4', 'W8', 'W12']

export const Q1_INSPECTION_SETS: Readonly<
  Record<Q1InspectionKey, readonly InspectionScene[]>
> = {
  W4: Q1_INSPECTION_SCENES,
  W8: Q1_PAYROLL_INSPECTION_SCENES,
  W12: Q1_ETHICS_INSPECTION_SCENES,
}
