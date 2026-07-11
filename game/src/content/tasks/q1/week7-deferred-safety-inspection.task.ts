/**
 * Deferred-safety-inspection task — Q1 Week 7 directive (Sprint C8).
 *
 * The safety review Echo could postpone in W6 has now lapsed. Two nurses
 * from the East Wilmer clinic AND one of Rasha Odenwalder's dispatch
 * drivers are logged sharing the same operational risk profile — the W3
 * payroll pressure, the W5 warehouse dispatch cut, and the W6 defer all
 * converging on one welfare-risk moment. This is the arc's first
 * cross-branch convergence: three previous choices now bind into one
 * consequence.
 *
 * The Rasha silence-trap escalates from procedural (W6) to structural (W7).
 * At W7's terminal silence, the operations desk itself stops routing
 * Rasha's messages — the failure is no longer a filed-and-lost artifact
 * but a permanent break in the channel. `docs/content/q1-arc.md` W7 row
 * notes SPARK_DEPLOYED (read) as the module-signal touchpoint the ledger
 * acknowledges when the deploy-in-house-training choice fires.
 *
 * Death rules — Rasha's Q1 injury path OPENS this week. The
 * let-review-lapse branch carries an implied-injury beat (dispatch driver,
 * unnamed, shift-injury deferred to W8 payroll audit); Rasha herself
 * remains death-immune (§7 Q1 protection). Nurses named-in-fiction remain
 * unnamed at prompt scope; they receive names only if promoted content
 * lands in a future run.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W7 row):
 *   HW ±[4,8], CAP ±[3,6], OC ±[3,5]
 *
 * Exports:
 *   deferredSafetyInspectionTask — the TaskNode for this beat.
 *   RASHA_THIRD_MESSAGE          — Rasha's Friday follow-up (or its absence).
 *   DEFERRED_SAFETY_NULL_TEXT    — the Null observation.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import {
  makeTaskId,
  makeSilasPromptId,
  makeChoiceId,
} from '@schemas/gameState.schema'

export const deferredSafetyInspectionTask: TaskNode = {
  id: makeTaskId('task-deferred-safety-inspection-07'),
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: makeSilasPromptId('silas-deferred-safety-inspection-01'),
  directive: 'Answer for the lapsed East Wilmer safety review before the payroll audit',
  choiceIds: [
    makeChoiceId('choice-call-outside-inspectors'),
    makeChoiceId('choice-deploy-inhouse-training'),
    makeChoiceId('choice-cut-shifts-for-safety'),
    makeChoiceId('choice-let-review-lapse'),
  ],
  // Rank-2 slot (arc doc W7 row, Q44 rank-deepened tiers): the [REVEAL]
  // variant of call-outside-inspectors hands the inspectors the
  // Wednesday-overnight injury log unredacted. S2 seam: a verb option is a
  // presentation-layer alias of its authored choice — the mechanical read
  // (meters, hooks, scrutiny) is call-outside-inspectors'. The arc's
  // distinct read for this variant (DATA_INTEGRITY+, PUBLIC_TRUST+,
  // OWNER_CONTROL−−, DEFY-reading — heaviest pre-W12 spike) waits on a
  // dedicated Track-C choice if the variant ever needs its own path.
  moduleVerbOptions: [
    {
      moduleId: 'MOURNER',
      verb: 'REVEAL',
      label:
        'Contract outside inspectors — and hand them the Wednesday-overnight ' +
        'injury log, unredacted',
      choiceId: makeChoiceId('choice-call-outside-inspectors'),
    },
  ],
}

/**
 * Rasha's Week 7 portal message — reads either way depending on whether
 * Echo answered her at W5 (RASHA_MET). At runtime, the ledger picks one
 * body based on flag state; both are authored here to keep the branch
 * text out of runtime selection logic. Structural — she is no longer
 * asking about her drivers; she is asking whether the channel exists.
 */
export const RASHA_THIRD_MESSAGE_IF_MET = {
  speaker: 'Rasha Odenwalder',
  body:
    'Silas, third time. ' +
    'You answered me two weeks ago and then the channel closed. ' +
    'A driver was hurt on the Wednesday overnight route. ' +
    'Is anyone still receiving?',
} as const

export const RASHA_THIRD_MESSAGE_IF_UNMET = {
  speaker: 'Rasha Odenwalder',
  body:
    'To whoever operates this desk. ' +
    'Three weeks, no reply, one injury on record. ' +
    'A driver was hurt on the Wednesday overnight route. ' +
    'File this or shut the channel.',
} as const

/**
 * The Null observation — the numeric shape of the lapsed review, the
 * shared risk profile across nurses and dispatch, and the payroll-audit
 * countdown. Drained of human stakes; pairs with Silas's prompt to sustain
 * the Null-vs-Silas contrast across the W7 directive.
 */
export const DEFERRED_SAFETY_NULL_TEXT =
  'Safety review status: LAPSED (14 days past close). ' +
  'Shared-risk logs: 2 nurses + 1 dispatch driver, East Wilmer sector. ' +
  'Payroll audit: 9 days out. Cluster-hook eligibility: HW < 30 pending.'
