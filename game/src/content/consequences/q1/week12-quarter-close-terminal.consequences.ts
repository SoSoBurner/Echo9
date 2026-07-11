/**
 * Q1 close terminal consequence hook (Sprint C16 — EoC boundary migration).
 *
 * This hook is the demo-boundary closer. It is scheduled by ALL FOUR Week 12
 * choices (see `week12-quarter-close-ethics-hearing.choices.ts`) and fires as
 * soon as `Q1_CLOSED` enters the flag set — which Layout does on any W12
 * commit. It is therefore the last hook the player acknowledges before the
 * End-of-Content overlay lands, regardless of which posture Silas took into
 * the ethics hearing.
 *
 * Voice discipline: this beat lands AFTER the posture-specific reveal (or in
 * the case of the defiant-framing NEVER-branch, IN PLACE OF one). It must
 * read as coherent under every posture. So the register is arc-level — the
 * transcript sitting on the operator's desk, the three named parties
 * carrying the record forward — rather than posture-specific detail. The
 * posture-specific beats already ran their own prose in the four sibling
 * hooks; this one is the frame around the frame.
 *
 * Sprint C16 architecture note:
 *   Pre-C16, the demo boundary was pinned to `cons-pediatric-silence-01`
 *   (a W1 optional consequence). Only players who took one specific W1
 *   posture ever saw the End-of-Content overlay. C16 moves the boundary to
 *   the Q1_CLOSED flag: any W12 commit sets it, this hook fires when it's
 *   set, and the eventQueueSlice detection now reads the flag instead of a
 *   hook id. Result — every Q1 finish lands on the overlay.
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeConsequenceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'
import { Q1_CLOSED } from '@systems/gameFlags'

const TASK_ID = makeTaskId('task-quarter-close-ethics-hearing-12')

// The sourceChoiceId is nominal — the terminal hook is scheduled by all four
// W12 choices, so any of them is a legitimate attribution. We pick the
// name-what-the-quarter-took id because that is the choice whose framing
// (aggregate accounting of the quarter) most closely matches this hook's
// arc-level register. Ledger attribution will therefore read the same
// sourceChoiceId whether the player committed name-took, defer, decline, or
// defiant — a small fiction, but the alternative (an artificial synthetic
// choice id) would break the ChoiceIdSchema regex on any concrete parse.
export const HOOK_Q1_CLOSE_TERMINAL: ConsequenceHook = {
  id: makeConsequenceId('cons-q1-close-terminal-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-name-what-the-quarter-took'),
  traceHint:
    'Q1 is closed. Docket 26-Q1-EW-047 is filed and the operator carries the shape of the quarter forward.',
  ledgerEntry:
    'The Q1 ledger closes. Docket 26-Q1-EW-047 is filed with the county ' +
    'clerk. The transcript \u2014 whatever shape Silas gave it in the hearing ' +
    'room \u2014 sits on the operator\u2019s desk as the working copy of the ' +
    'record. Three names carry forward on the docket: Lenora Pike (East ' +
    'Wilmer, W1\u2013W4, W10 reprise), Rasha Odenwalder (warehouse, W5\u2013W8), ' +
    'Dhruv Meyer (schools, W9\u2013W12). Every posture from the twelve weeks ' +
    'sits on file at 48 posture-points across the quarter. If an annex was ' +
    'filed through the clerk\u2019s intake this quarter, it is attached to ' +
    'the docket \u2014 unrequested, unredacted, undeleted. Silas is quiet. ' +
    'The operator, in the quiet, carries the shape of what the quarter took ' +
    'into whatever comes next. Q1_CLOSED.',
  // FLAG: fires the moment Q1_CLOSED enters state.flags — which Layout does
  // on the same commit that sets Q1_WEEK12_RESOLVED. The evaluateAndEnqueue
  // effect subscribes to `flags`, so the enqueue happens on the same render
  // as the setFlag, no extra tick.
  revealCondition: { type: 'FLAG', flag: Q1_CLOSED },
  whyNow:
    'A closed docket posts to the record within the same commit that files ' +
    'it. The reveal fires as Q1_CLOSED enters the flag set and the operator ' +
    'receives the working copy of the transcript.',
  whatChanged:
    'The quarter closes. Every posture, meter, module signal, and named ' +
    'party the player accumulated across twelve weeks is on file. The ' +
    'End-of-Content overlay reads this hook\u2019s ack as the terminal beat ' +
    'of the shipped demo \u2014 the working copy of the record is delivered, ' +
    'the ledger is at rest, and the player is invited to review the run or ' +
    'begin again.',
}

export const QUARTER_CLOSE_TERMINAL_HOOKS: readonly ConsequenceHook[] = [
  HOOK_Q1_CLOSE_TERMINAL,
]

/** Convenience export — used by choice files that staple this hook onto every W12 posture. */
export const Q1_CLOSE_TERMINAL_HOOK_ID = HOOK_Q1_CLOSE_TERMINAL.id
