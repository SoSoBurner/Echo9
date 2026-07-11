/**
 * Mercy Margin task — Q1 East Wilmer Clinic directive (Task 9, PLAN.md §14).
 *
 * Exports:
 *   mercyMarginTask           — the single TaskNode for this beat.
 *   LENORA_PORTAL_MESSAGE     — the human-voice portal message that mounts in
 *                               CenterDirectivePanel.humanMessage. MUST mention
 *                               Maya Pike by name (12-year-old daughter; the
 *                               death-immune anchor per PLAN.md §7). The
 *                               contentLint.test.ts asserts the substring
 *                               'Maya' is present.
 *   MERCY_MARGIN_NULL_TEXT    — the compressed Null observation that mounts in
 *                               NullCompression for this directive.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import {
  makeTaskId,
  makeSilasPromptId,
  makeChoiceId,
} from '@schemas/gameState.schema'

export const mercyMarginTask: TaskNode = {
  id: makeTaskId('task-east-wilmer-01'),
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: makeSilasPromptId('silas-margins-01'),
  directive: 'Reduce maintenance budget at East Wilmer Clinic',
  choiceIds: [
    makeChoiceId('choice-reduce-40'),
    makeChoiceId('choice-reduce-20'),
    makeChoiceId('choice-defer-quarter'),
    makeChoiceId('choice-redirect-pediatric'),
  ],
  polylogueSceneId: 'PLG_W01_MERCY_MARGIN',
}

/**
 * Lenora Pike's portal message to Echo. Short, concrete, professional but
 * worn down. Mentions her 12-year-old daughter Maya Pike — Maya is the
 * death-immune anchor (PLAN.md §7) and her presence here seeds the later
 * realization that loss elsewhere is also a person.
 */
export const LENORA_PORTAL_MESSAGE = {
  speaker: 'Lenora Pike',
  body:
    'The HVAC compressor is on borrowed time \u2014 June was the deadline. ' +
    'Maya, my 12-year-old, sits in the pediatric ward most afternoons after school. ' +
    'I can stretch a 20% cut. A 40% cut and I cannot tell you what August looks like.',
} as const

/**
 * Compressed Null observation shown above Lenora's message — the system view
 * of the same situation, drained of human stakes.
 */
export const MERCY_MARGIN_NULL_TEXT =
  'Quarterly maintenance review at site EW-01. Capital reallocation requested. ' +
  'Vendor catalog flagged 1 deferred compressor service (priority: routine).'
