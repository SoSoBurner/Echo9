/**
 * awakeningSequence — "the AI comes online" boot-time choreography (E1).
 *
 * When the player initialises a fresh run, the HUD is dark. The awakening
 * sequence is what turns lights on: it discloses the DIRECTIVE panel first
 * (so the very first directive has a container to land in), then leaves the
 * rest of the panels to disclose themselves lazily via `noteUsage` at their
 * mount sites.
 *
 * Why the DIRECTIVE special-case: the FIRST_DIRECTIVE phase transition
 * happens before any panel has been "used" — there is no interaction from the
 * player yet. Without a proactive disclose, the DirectivePanel would be
 * hidden at the exact moment the player is supposed to read a directive from
 * it, and the resulting user experience would be "I clicked Start and
 * nothing happened."
 *
 * Why this is a plain function, not a slice action: it composes multiple
 * slice actions (disclosePanel here; future beats might touch silasSlice for
 * a first-line, or ledgerSlice for a boot narration entry). Anything that
 * spans slices belongs at the systems layer, not on any single slice.
 *
 * The function takes its dependencies as an `actions` object rather than
 * importing the store directly. That keeps the module test-friendly (no
 * localStorage side effects, no store singleton) and avoids the circular
 * import that would happen if bootSlice.ts imported this file which then
 * imported useGameStore which itself is composed by bootSlice.
 */
import type { PanelId } from './hudDisclosure'

export type AwakeningActions = {
  disclosePanel: (id: PanelId) => void
}

/**
 * Runs the cold-boot awakening. Right now this is a single beat (disclose
 * DIRECTIVE). Later E-track sprints will add more beats — a Silas silhouette
 * appearing, a boot-log entry landing in the ledger, comfort-setting-aware
 * dwell timing on each reveal. Keep the additions here rather than sprinkled
 * across slices so the whole "boot sequence" is inspectable in one file.
 */
export function runAwakeningSequence(actions: AwakeningActions): void {
  actions.disclosePanel('DIRECTIVE')
}
