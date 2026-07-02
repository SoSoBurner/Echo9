/**
 * Spine-beat timestamp recorder (dev-only, tree-shaken from prod).
 *
 * Beats are the milestones PLAN.md §6/§17 care about: bootStart,
 * firstChoiceCommit, firstResultCard, firstEchoFired,
 * firstConsequenceReturnOpened, firstAcknowledge, moduleInstall,
 * inspectionEntered.
 *
 * On each beat, record { name, tSinceBoot_ms }. In DevHUD, show the delta
 * between consecutive beats so the author can spot pacing regressions
 * during a self-playtest.
 *
 * The `window.__ECHO9_BEATS__` binding is dev/test-only so a Playwright
 * spec can read it after a spine walk and log the pacing signature. Prod
 * builds tree-shake the binding (see the `import.meta.env.DEV` guard).
 */
export type BeatName =
  | 'bootStart'
  | 'firstChoiceCommit'
  | 'firstResultCard'
  | 'firstEchoFired'
  | 'firstConsequenceReturnOpened'
  | 'firstAcknowledge'
  | 'moduleInstall'
  | 'inspectionEntered'

interface BeatEvent { name: BeatName; tSinceBoot_ms: number }

const beats: BeatEvent[] = []
let bootT = 0
let bootStarted = false

export function markBoot(): void {
  if (bootStarted) return
  bootStarted = true
  bootT = performance.now()
  beats.push({ name: 'bootStart', tSinceBoot_ms: 0 })
}

export function markBeat(name: BeatName): void {
  if (!bootStarted) markBoot()
  if (beats.some((b) => b.name === name)) return // first occurrence only
  beats.push({ name, tSinceBoot_ms: performance.now() - bootT })
}

export function getBeats(): ReadonlyArray<BeatEvent> {
  return beats
}

export function resetBeats(): void {
  beats.length = 0
  bootStarted = false
}

if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
  ;(window as unknown as { __ECHO9_BEATS__?: unknown }).__ECHO9_BEATS__ = {
    getBeats,
    resetBeats,
  }
}
