/**
 * hookReachability — static §11 guard: every non-NEVER ConsequenceHook's
 * revealCondition must be SATISFIABLE by the shipped runtime.
 *
 * This is the test that would have caught the ship-gate leak fixed in the
 * week-elapse-returns commit: 24 of 49 hooks entered scheduledConsequences
 * on choice commit but could never fire —
 *   - 12 keyed PHASE:'CONSEQUENCE_RETURN', a phase no runtime code ever
 *     enters, and
 *   - 12 keyed on FLAG names (`east-wilmer-week<N>-elapsed`,
 *     `east-wilmer-quarter-elapsed`, `q1-week<N>-elapsed`) that had no
 *     setter anywhere.
 * A scheduled hook that can never return silently breaks the §11 invariant
 * ("every delayed consequence returns" — PLAN.md §11.2 trust pact).
 *
 * Reachability rules enforced here:
 *   FLAG  — the flag must appear in the union of every runtime flag-raising
 *           surface: gameFlags constants (raised by Layout/modules/engines),
 *           the week-elapse table (raised at the weekly commit seam),
 *           module-ability flagsSet, capital-card flagsAdded, and
 *           inspection-mitigation signal flags.
 *   PHASE — the phase must be one the runtime actually enters (see
 *           RUNTIME_ENTERED_PHASES below).
 *   METER_THRESHOLD — always satisfiable (meters move continuously); the
 *           meter KEY is already schema-validated.
 *   NEVER — reachability is intentionally void (silence-as-horror, Pillar 3).
 */
import { describe, it, expect } from 'vitest'
import type { SlicePhase } from '@schemas/gameState.schema'
import { ALL_CONSEQUENCE_MODULES } from '@content/index'
import { elapsedFlagsForWeek } from '@systems/weekElapse'
import * as GAME_FLAGS from '@systems/gameFlags'
import { ALL_MODULE_ABILITIES } from '@content/moduleAbilities'
import { Q1_CAPITAL_CARDS } from '@content/capitalDeployments/q1CapitalPower.cards'
import { INSPECTION_MITIGATIONS } from '@content/inspections/inspectionMitigations'
import { END_OF_CONTENT_TERMINAL_FLAG } from '@content/contentBoundary.manifest'

// ---------------------------------------------------------------------------
// RUNTIME_ENTERED_PHASES — the set of SlicePhase values runtime code actually
// transitions into. Derived from the exhaustive list of phase-entry sites:
//   - 'BOOT'            initial state (bootSlice initial + testHelpers reset)
//   - 'FIRST_DIRECTIVE' bootSlice.ts completeBoot(); Layout handleContinue()
//   - 'INSPECTION'      Layout handleChoiceCommit() W4/W8/W12 dispatch
// If you add a `setPhase('X')` call anywhere in src/ (outside tests), add 'X'
// here — this list IS the contract that PHASE-keyed content can rely on.
// ---------------------------------------------------------------------------
const RUNTIME_ENTERED_PHASES: ReadonlySet<SlicePhase> = new Set<SlicePhase>([
  'BOOT',
  'FIRST_DIRECTIVE',
  'INSPECTION',
])

// ---------------------------------------------------------------------------
// The union of every flag the runtime can raise.
// ---------------------------------------------------------------------------
function raisableFlags(): ReadonlySet<string> {
  const flags = new Set<string>()

  // 1. gameFlags constants — the shared cross-engine flag names. Every
  //    export from @systems/gameFlags is a string constant with a runtime
  //    setter (Layout resolution/Q1_CLOSED seams, module abilities, week
  //    task fan-outs).
  for (const value of Object.values(GAME_FLAGS)) {
    if (typeof value === 'string') flags.add(value)
  }

  // 2. Week-elapse table — raised by Layout at the weekly commit seam.
  for (let week = 1; week <= 12; week++) {
    for (const flag of elapsedFlagsForWeek(week)) flags.add(flag)
  }

  // 3. Module abilities — flagsSet fan-out via modulesSlice.
  for (const ability of ALL_MODULE_ABILITIES) {
    for (const flag of ability.ability.flagsSet) flags.add(flag)
  }

  // 4. Capital cards — flagsAdded fan-out via resolveCapital + Layout.
  for (const card of Q1_CAPITAL_CARDS) {
    for (const flag of card.flagsAdded) flags.add(flag)
  }

  // 5. Inspection mitigation signal flags (module-signal flags read AND part
  //    of the raisable surface via rank-2/3 module fires).
  for (const mitigation of INSPECTION_MITIGATIONS) {
    flags.add(mitigation.flag)
  }

  // 6. End-of-content terminal flag (mirrors Q1_CLOSED; set by Layout).
  flags.add(END_OF_CONTENT_TERMINAL_FLAG)

  return flags
}

describe('hookReachability — every non-NEVER hook can actually fire', () => {
  const raisable = raisableFlags()

  it('every FLAG-keyed hook waits on a flag some runtime surface can raise', () => {
    const flagHooks = ALL_CONSEQUENCE_MODULES.filter(
      (h) => h.revealCondition.type === 'FLAG',
    )
    expect(flagHooks.length).toBeGreaterThan(0)
    for (const hook of flagHooks) {
      if (hook.revealCondition.type !== 'FLAG') continue
      expect(
        raisable.has(hook.revealCondition.flag),
        `hook ${hook.id} waits on FLAG "${hook.revealCondition.flag}" but no ` +
          `runtime surface ever raises it — the hook would sit in ` +
          `scheduledConsequences forever (§11 leak). Add the flag to a ` +
          `setter surface (weekElapse table / gameFlags / content flagsSet) ` +
          `or re-key the hook.`,
      ).toBe(true)
    }
  })

  it('every PHASE-keyed hook waits on a phase the runtime actually enters', () => {
    const phaseHooks = ALL_CONSEQUENCE_MODULES.filter(
      (h) => h.revealCondition.type === 'PHASE',
    )
    for (const hook of phaseHooks) {
      if (hook.revealCondition.type !== 'PHASE') continue
      expect(
        RUNTIME_ENTERED_PHASES.has(hook.revealCondition.phase),
        `hook ${hook.id} waits on PHASE "${hook.revealCondition.phase}" but ` +
          `no runtime code ever enters that phase — the hook would sit in ` +
          `scheduledConsequences forever (§11 leak). Either add a real ` +
          `transition (and extend RUNTIME_ENTERED_PHASES) or re-key the hook ` +
          `to the week-elapse FLAG mechanism.`,
      ).toBe(true)
    }
  })

  it('catalog sanity — the full 49-hook Q1 surface is under guard', () => {
    // Pinned so a refactor that empties/splits the aggregate cannot silently
    // shrink the guard's coverage. Update deliberately when content grows.
    expect(ALL_CONSEQUENCE_MODULES.length).toBeGreaterThanOrEqual(49)
  })
})
