/**
 * END-OF-CONTENT BOUNDARY — single source of truth for "the demo has ended."
 *
 * Sprint C16 rewrite: pre-C16 this was pinned to a specific ConsequenceId
 * (`cons-pediatric-silence-01`, a W1 optional consequence). The boundary
 * therefore only fired for the one W1 posture that scheduled that hook — every
 * other path through Q1 finished on the last W12 ack with no overlay.
 *
 * The boundary is now a FLAG. Layout sets `Q1_CLOSED` on any Week 12 commit
 * (mirroring `resolutionFlag` at week === 12), and the end-of-content terminal
 * hook (`week12-quarter-close-terminal.consequences.ts`) uses a FLAG reveal
 * against the same flag so it fires the moment Q1 is closed. Move this one
 * line to move the ending.
 */
import { Q1_CLOSED } from '@systems/gameFlags'

export const END_OF_CONTENT_TERMINAL_FLAG: string = Q1_CLOSED
