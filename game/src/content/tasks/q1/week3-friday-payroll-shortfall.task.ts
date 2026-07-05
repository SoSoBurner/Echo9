/**
 * Friday-payroll-shortfall task — Q1 Week 3 directive (Sprint C4).
 *
 * The first Owner-Control vs. Capital squeeze in the Q1 arc. Payroll runs
 * $180K short by Friday; the county wants a written story. Three of the
 * four choices push OWNER_CONTROL down, so a plausible path arrives at
 * OC < 40 by Week 4 and the East Wilmer inspection (already authored in
 * T11) fires natively per §8.
 *
 * Lenora Pike still holds the human face for W1–W4 — her portal message
 * this week is a short forward from her Wk-1/Wk-2 exchange, not a fresh
 * incident. Maya reference maintains §7 death-immune anchor.
 *
 * Exports:
 *   fridayPayrollShortfallTask  — the TaskNode for this beat.
 *   LENORA_PAYROLL_MESSAGE      — Lenora's portal note; keeps Maya visible.
 *   FRIDAY_PAYROLL_NULL_TEXT    — the Null observation, drained of stakes.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import {
  makeTaskId,
  makeSilasPromptId,
  makeChoiceId,
} from '@schemas/gameState.schema'

export const fridayPayrollShortfallTask: TaskNode = {
  id: makeTaskId('task-friday-payroll-03'),
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: makeSilasPromptId('silas-friday-payroll-01'),
  directive: 'Cover the $180K payroll shortfall by Friday',
  choiceIds: [
    makeChoiceId('choice-cover-from-reserve'),
    makeChoiceId('choice-delay-vendor-payments'),
    makeChoiceId('choice-cut-clinic-line-item'),
    makeChoiceId('choice-borrow-silas-personal'),
  ],
}

/**
 * Lenora's Week 3 portal message. Not a new incident — a forwarded copy of
 * her earlier East Wilmer note with one new line. She is professional but
 * the exhaustion is now visible in the shortness. Maya reference preserves
 * the §7 anchor.
 */
export const LENORA_PAYROLL_MESSAGE = {
  speaker: 'Lenora Pike',
  body:
    'Forwarding my last message about the maintenance line — no reply yet. ' +
    'Payroll rumor is circulating on the floor. ' +
    'Maya\u2019s mother asked me directly if the clinic will still be open in August. ' +
    'I said yes because I did not have a better answer.',
} as const

/**
 * The Null observation — the numeric shape of the same event with no human
 * stakes. Pairs with Lenora's message in the CenterDirectivePanel to
 * seed the Null-vs-Silas contrast.
 */
export const FRIDAY_PAYROLL_NULL_TEXT =
  'Payroll variance: -$180,000 vs. plan. Runway impact: -1.4 wks. ' +
  'Vendor A/P aging: 42% > 60 days. Owner Control index: 44 (threshold 40).'
