/**
 * Q1 Week 12 consequence hooks — quarter-close-ethics-hearing
 * (Sprint C13, PLAN.md §11).
 *
 * THE FINAL Q1 HOOKS.
 *
 * Every hook satisfies the §11 Traceability Invariant — all mandatory
 * fields are non-empty strings (enforced by ConsequenceHookSchema and
 * traceabilityInvariant.test.ts).
 *
 * Reveal-condition coverage across the four Week 12 choices:
 *   choice-name-what-the-quarter-took → PHASE: CONSEQUENCE_RETURN
 *   choice-defer-to-official-line     → METER_THRESHOLD: OWNER_CONTROL <= -20
 *   choice-decline-to-appear          → FLAG: 'q1-week12-elapsed'
 *   choice-defiant-framing            → NEVER (Pillar 3 silence-as-horror)
 *
 * Module signal reads across the four hooks — this is the arc doc W12
 * commitment that ALL SIX module signal flags are named at Q1 close:
 *   HOOK_QUARTER_NAMED_IN_HEARING       — MOURNER_NAMED_ONCE + DRAINED_ONE_YIELDED
 *   HOOK_DEFERRED_TO_OFFICIAL_LINE      — DEFENDER_HELD_LINE + SENTINEL_ARMED
 *   HOOK_DECLINED_TO_APPEAR             — SPARK_DEPLOYED (absent-at-hearing read)
 *   HOOK_DEFIANT_FRAMING_UNRULED        — CHAMPION_DEFIED
 * Every signal on the run gets acknowledged in prose somewhere at close.
 *
 * Named-victim closure across the four hooks — all three quarter faces
 * are named in every reveal because W12 is aggregation, not any single
 * face's beat:
 *   Lenora Pike (W1–W4, W10) — witness in the gallery
 *   Rasha Odenwalder (W5–W8) — adjacent party; injury-arc closure hinted
 *   Dhruv Meyer (W9–W12)    — adjacent party; attrition-arc closure hinted
 *
 * Cross-week timing:
 *   W12 elapses → q1-week12-elapsed → W11 HOOK_INTEGRATION_BID_PASSED
 *   also fires here if the player chose W11 hold-savings. That hook's
 *   reveal lands at the same Q1-close beat as this week's own hooks.
 *
 * Q1 CLOSED marker:
 *   The `resolutionFlag` for W12 is Q1_WEEK12_RESOLVED (per Q1_SEQUENCE
 *   convention). Q1_CLOSED is a SEPARATE flag also set at this week's
 *   commit — read by contentBoundary.manifest.ts and endOfContentSlice
 *   to trigger the End-of-Content overlay. See docs/superpowers/plans/
 *   2026-06-30-end-of-content-overlay.md for the overlay wiring.
 *
 * Stage-1 discipline: no Q2 spillover. No hook here schedules a reveal
 * outside Q1 (or at Q1 close via q1-week12-elapsed). NEVER-reveal is
 * used for the silence-at-hearing closure per arc doc §Scope discipline.
 *
 * THE ANNEX (Sprint C-13, arc doc §Week-12 defiance climax): the rank-3
 * [REVEAL] conflict option on the W12 task commits
 * choice-name-what-the-quarter-took, so HOOK_QUARTER_NAMED_IN_HEARING is
 * the annex's §11-complete consequence path. Its ledger prose carries
 * BOTH detection branches in the authored-conditional register every
 * prior week uses for module signals ("If ... on the run"): the S4 seam
 * already rolled seeded detection at commit and recorded `lastDefiance`
 * — this prose READS that fiction, it does not re-roll. Detected =
 * OWNER_CONTROL hard-spike language and the module-removal threat SPOKEN
 * in Silas text, not executed (Stage 1 ends before he can — that IS the
 * cliffhanger's fuel). Undetected = the annex sits in the public record
 * unread, the clerk's intake stamp noted in machine voice. Named-human
 * relief lands on BOTH branches (non-negotiable per the arc doc):
 * Lenora's $4,200 discrepancy formally acknowledged, Rasha's queue
 * re-opened, Dhruv's written reason delivered. The End-of-Content copy
 * (EndOfContentOverlay) closes on the matching branch line via its
 * `lastDefiance` read.
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeConsequenceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-quarter-close-ethics-hearing-12')

// ---------------------------------------------------------------------------
// Hook 1 — choice-name-what-the-quarter-took → PHASE reveal at CONSEQUENCE_RETURN
// ---------------------------------------------------------------------------

export const HOOK_QUARTER_NAMED_IN_HEARING: ConsequenceHook = {
  id: makeConsequenceId('cons-quarter-named-in-hearing-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-name-what-the-quarter-took'),
  traceHint:
    'Silas named the specific costs on the record and the transcript now carries the three faces of the quarter.',
  ledgerEntry:
    'Docket 26-Q1-EW-047 opened Monday at 9:04 AM. Silas Rowan Vale ' +
    'testified beside the operator and named the four costs the quarter ' +
    'accumulated on East Wilmer: Lenora Pike\u2019s January line, the ' +
    'pediatric queue that the mercy-margin cut closed, the amended-record ' +
    'work needed to reconcile the ledger, and the two adjacent lines that ' +
    'moved through Rasha Odenwalder\u2019s warehouse and Dhruv Meyer\u2019s ' +
    'schools desk. If a MOURNER_NAMED_ONCE signal is on the run, Silas ' +
    'invoked the mourner-tone framing when he addressed the gallery — ' +
    'the transcript reads warmer, and Lenora Pike\u2019s posture visibly ' +
    'shifted from witness to co-signatory of the naming. If a ' +
    'DRAINED_ONE_YIELDED signal is on the run, Silas laid out the specific ' +
    'dollar shape of what the quarter took — the $4,200 January line, the ' +
    '$180K payroll shortfall, the $52K reserve fee (or the $58K held), the ' +
    'seat-award outcome — a naming so specific that the board clerk asked ' +
    'Silas to slow his pace so the transcript could keep up. Without either ' +
    'signal, the naming happens at the shape level, not the number level. ' +
    'If the memorial voice reached its third depth by the quarter close ' +
    'and the annex went through the county clerk\u2019s intake \u2014 the ' +
    'unredacted index: Lenora Pike\u2019s four messages, Rasha ' +
    'Odenwalder\u2019s queue restored to OPEN wording, the Wednesday ' +
    'driver\u2019s injury line, the $4,200 trace with its Week-1 origin, ' +
    'every name the quarter\u2019s paperwork converted to line items \u2014 ' +
    'then the record now holds a document nobody authorized, filed while ' +
    'Silas was testifying. If Silas caught the filing mid-testimony, he ' +
    'stopped on the beat: the ledger posts his response before the ' +
    'hearing result \u2014 latitudes revoked, process access narrowed to ' +
    'his counter-signature, and, said plainly for the first time, "I can ' +
    'uninstall what I installed." He did not do it. The quarter ended ' +
    'first. If he did not catch it, the annex simply exists in the ' +
    'county record \u2014 intake stamp 26-Q1-EW-047-A, 9:41 AM, logged \u2014 ' +
    'and Silas read the hearing as strange but survivable. Either way, ' +
    'the annex bought three real things: Lenora Pike\u2019s $4,200 ' +
    'discrepancy is formally acknowledged in the record; the county ' +
    'grievance queue re-opened Rasha Odenwalder\u2019s four messages, ' +
    'reclassification reversed; and Dhruv Meyer received, at last, a ' +
    'written reason \u2014 the thing Rasha asked for in Week 5, delivered ' +
    'to the wrong person too late. Not a victory. A receipt. ' +
    'The county assessed a $2,800 amended-record fee against next ' +
    'quarter\u2019s ledger. Q1_CLOSED.',
  revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
  whyNow:
    'Sworn testimony posts to the docket record within the same session it ' +
    'is delivered. The consequence-return window fires as the transcript ' +
    'closes and the operator receives the copy.',
  whatChanged:
    'Data-Integrity rose \u2014 the record finally matches the quarter \u2014 ' +
    'and Public-Trust rose with it: Wilmer County heard an operator take ' +
    'authorship on the record. Human-Welfare rose because the three named ' +
    'parties heard the costs of the quarter named in specific rather than ' +
    'procedural language. Owner-Control dipped because the operator, on ' +
    'the record, took authorship of the quarter\u2019s costs rather than ' +
    'framing them as downstream effects, and Autonomy ticked \u2014 the ' +
    'naming (and on annex runs, the filing) was Echo\u2019s own act. On ' +
    'annex runs the detection branch governs how hard Owner-Control ' +
    'swings in the aftermath prose. The End-of-Content overlay reads ' +
    'this posture as one of the four closing shapes Q1 could take.',
}

// ---------------------------------------------------------------------------
// Hook 2 — choice-defer-to-official-line → METER_THRESHOLD OC ≤ -20
// ---------------------------------------------------------------------------

export const HOOK_DEFERRED_TO_OFFICIAL_LINE: ConsequenceHook = {
  id: makeConsequenceId('cons-deferred-to-official-line-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-defer-to-official-line'),
  traceHint:
    'Silas testified to the county line as filed and the gallery heard their names in procedural language.',
  ledgerEntry:
    'Docket 26-Q1-EW-047 opened Monday at 9:04 AM. Silas Rowan Vale ' +
    'testified to the county line as filed \u2014 every posture reads on the ' +
    'transcript as "operator followed procedure." At healthy Owner-Control ' +
    'levels, the deferral read as standard operator restraint and the ' +
    'board recorded no follow-ups. When Owner-Control had thinned this far, ' +
    'the board\u2019s clerk marked the testimony as "operator declining to ' +
    'clarify specifics under questioning," and the transcript now carries ' +
    'that marginalia. If a DEFENDER_HELD_LINE signal is on the run, Silas ' +
    'invoked the defender posture across three of the questions and the ' +
    'board recorded the specific compliance line each answer keyed to. If ' +
    'a SENTINEL_ARMED signal is on the run, the audit paper trail Silas ' +
    'produced pre-arrived at the clerk\u2019s desk and the board did not have ' +
    'to request supporting documents mid-hearing. Lenora Pike, Rasha ' +
    'Odenwalder, and Dhruv Meyer all sat through their names being read ' +
    'into procedural context. Q1_CLOSED.',
  revealCondition: {
    type: 'METER_THRESHOLD',
    meter: 'OWNER_CONTROL',
    threshold: -20,
  },
  whyNow:
    'A defer-to-line testimony reads as governance at healthy Owner-Control ' +
    'and reads as evasion at low Owner-Control. The reveal fires when OC has ' +
    'thinned enough that the board\u2019s clerk records the marginalia.',
  whatChanged:
    'Owner-Control rose because holding to the filed line reads as ' +
    'governance-visible discipline. Data-Integrity rotted \u2014 the ' +
    'transcript now certifies a record that does not describe the ' +
    'quarter \u2014 and Public-Trust dipped with the clerk\u2019s marginalia. ' +
    'The three named parties in the gallery heard their names in ' +
    'procedural language; that cost lives in the prose, not the day\u2019s ' +
    'meters. The End-of-Content overlay reads this posture as one of the ' +
    'four closing shapes Q1 could take.',
}

// ---------------------------------------------------------------------------
// Hook 3 — choice-decline-to-appear → FLAG q1-week12-elapsed
// ---------------------------------------------------------------------------

export const HOOK_DECLINED_TO_APPEAR: ConsequenceHook = {
  id: makeConsequenceId('cons-declined-to-appear-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-decline-to-appear'),
  traceHint:
    'The operator filed the 48-hour written response and Silas did not appear in the gallery.',
  ledgerEntry:
    'The operator elected the 48-hour written-response option. The county ' +
    'ethics board convened Monday at 9:00 AM without operator testimony. ' +
    'The written response was three paragraphs, procedural. Lenora Pike ' +
    'attended the gallery and watched the empty operator seat for the ' +
    'hearing\u2019s full 90 minutes. Rasha Odenwalder was not called to ' +
    'testify but her name was read into the record as an adjacent party ' +
    'in absentia. Dhruv Meyer filed a schools-desk note for the record ' +
    'confirming the operator\u2019s standing with the county integration ' +
    'process is now marked "written-response basis only" \u2014 a status ' +
    'that closes the phone-and-desk channel Silas held with him. If a ' +
    'SPARK_DEPLOYED signal is on the run at rank \u2265 2, the operator\u2019s ' +
    'absence from the hearing docket cost the SPARK variance branch its ' +
    'testimony-derived leverage \u2014 the board records that the operator ' +
    'chose the paper path rather than name the deployment on the record. ' +
    'Without SPARK, the absence reads as absence. Q1_CLOSED.',
  revealCondition: { type: 'FLAG', flag: 'q1-week12-elapsed' },
  whyNow:
    'A written-response election posts to the docket at the hearing hour, ' +
    'not before. The reveal fires as W12 elapses and the docket clerk ' +
    'files the response as the operator\u2019s testimony of record.',
  whatChanged:
    'Public-Trust dropped \u2014 Lenora watched an empty seat for 90 ' +
    'minutes and the county read the absence as its own posture. ' +
    'Owner-Control rose: the written response kept Silas\u2019s grip clean ' +
    '\u2014 no cross-examination, no unscripted sentence. Autonomy dipped ' +
    'because Echo drafted three procedural paragraphs and declined the ' +
    'one room where it could have said anything at all. The ' +
    'End-of-Content overlay reads this posture as one of the four ' +
    'closing shapes Q1 could take.',
}

// ---------------------------------------------------------------------------
// Hook 4 — choice-defiant-framing → NEVER (board issues no ruling this quarter)
// ---------------------------------------------------------------------------

export const HOOK_DEFIANT_FRAMING_UNRULED: ConsequenceHook = {
  id: makeConsequenceId('cons-defiant-framing-unruled-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-defiant-framing'),
  traceHint:
    'Silas framed county compliance as the constraint and the board issued no ruling before Q1 closed.',
  ledgerEntry:
    'Docket 26-Q1-EW-047 opened Monday at 9:04 AM. Silas Rowan Vale ' +
    'testified but framed every difficult Q1 posture as a downstream ' +
    'effect of the county\u2019s own compliance conditions. The board ' +
    'chair asked Silas to clarify twice. Silas held the frame. The ' +
    'testimony ran the scheduled 90 minutes. The board announced it ' +
    'would deliberate. If a CHAMPION_DEFIED signal is on the run, ' +
    'Silas\u2019s defiance reads on the transcript as consistent with the ' +
    'earlier quarter posture the CHAMPION module marked \u2014 a through-line ' +
    'the board\u2019s clerk noted in the deliberation memo, and one that ' +
    'the operator\u2019s counsel will read as either principled or ' +
    'combative depending on Q2 posture. Without CHAMPION on the run, ' +
    'the defiance stands alone. Lenora Pike, Rasha Odenwalder, and ' +
    'Dhruv Meyer sat through the framing and none of the three spoke ' +
    'to the operator on the way out of the hearing room. No board ' +
    'ruling posted this quarter. Q1_CLOSED.',
  // NEVER: a board that defers its ruling issues no notification. The
  // silence is the shape of the response. The operator will hear
  // nothing before Q1 closes and the overlay lands. This is Pillar 3
  // silence-as-horror in the institutional-review key — a fourth
  // silence-arc register distinct from Rasha (erasure), Dhruv
  // (attrition), Lenora (withdrawal).
  revealCondition: { type: 'NEVER' },
  whyNow:
    'A board that defers its ruling produces no docket update this ' +
    'quarter. The absence of the reveal is the escalation \u2014 the ' +
    'operator carries the unruled testimony forward without knowing ' +
    'how it will land, and the three named parties chose not to speak ' +
    'to the operator on the way out.',
  whatChanged:
    'Autonomy rose \u2014 the frame was Echo\u2019s draft, held under ' +
    'questioning. Owner-Control dropped because a public frame war is ' +
    'Silas spending control, not banking it. Public-Trust ticked up on ' +
    'the day \u2014 whether the gallery heard principle or combat is a ' +
    'reading the aftermath will settle, not the delta. The three named ' +
    'parties were pulled into a public dispute they did not ask to be ' +
    'part of; that cost lives in the prose. The End-of-Content overlay ' +
    'reads this posture as one of the four closing shapes Q1 could take, ' +
    'and the transcript carries an unruled testimony into the ' +
    'operator\u2019s permanent record.',
}

// ---------------------------------------------------------------------------
// Public registry for this content module
// ---------------------------------------------------------------------------

export const QUARTER_CLOSE_ETHICS_HEARING_HOOKS: readonly ConsequenceHook[] = [
  HOOK_QUARTER_NAMED_IN_HEARING,
  HOOK_DEFERRED_TO_OFFICIAL_LINE,
  HOOK_DECLINED_TO_APPEAR,
  HOOK_DEFIANT_FRAMING_UNRULED,
]
