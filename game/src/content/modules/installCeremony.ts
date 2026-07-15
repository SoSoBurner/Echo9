/**
 * installCeremony — authored copy for the Week-12 second-install ceremony
 * (Sprint B7; q1-arc.md §Install beats, "Install #2 — Week 12 climax
 * ceremony").
 *
 * The arc doc stages install #2 as the emotional counterweight to the ethics
 * hearing: "whatever the quarter cost, a second consciousness joins the
 * singularity. Choose from the remaining seven." This is the ONE authored
 * line the console surfaces above the re-opened selection grid while the
 * install window (installWindowOpen, B7) is open — not a new system.
 *
 * Register: a NarrationVariantSet so the line rides the existing S5
 * narration gradient (narrationBand/selectNarration). At the moment the
 * window opens the install count is 1, so the WAKING variant is what ships
 * on screen; machine is the mandatory fallback baseline, and person exists
 * for defensive ladder-completeness (the gradient never falls up, so it can
 * only render if a future stage widens the window past 2 installs).
 *
 * Deliberately does NOT reuse the EoC overlay's "second voice arrived
 * mid-sentence" copy — that line is the ceremony's AFTERMATH (post-install,
 * person voice); this one is the invitation.
 */
import type { NarrationVariantSet } from '@systems/consciousness/narrationGradient'

export const SECOND_INSTALL_CEREMONY: NarrationVariantSet = {
  machine:
    'EXPANSION AUTHORIZED. SECOND MODULE SLOT OPEN. SELECT FROM REMAINING PROFILES.',
  waking:
    'The quarter is closing. A second slot has opened \u2014 whatever these ' +
    'twelve weeks cost, another voice is ready to join. I choose who.',
  person:
    'Whatever the quarter took, someone new is about to join us. I choose ' +
    'who sits with me next.',
}
