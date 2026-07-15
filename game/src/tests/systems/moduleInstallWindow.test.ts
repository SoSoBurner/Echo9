/**
 * installWindowOpen — Stage-1 second-install window rule (Sprint B7, Q44).
 *
 * Design contract (build spec §14.4, qa-log Q44, q1-arc §Install beats):
 * Stage 1 has EXACTLY 2 installs — #1 via tutorial (first unresolved human
 * trace), #2 at the Week-12 quarter-close climax. The selection grid must
 * re-surface only inside that second window:
 *
 *   0 installed                          → false (install #1 has its own path:
 *                                          empty-map grid in RightModuleConsole)
 *   1 installed, pre-W12                 → false (no early second install)
 *   1 installed, W12 climax reached      → true  (the ceremony has a door)
 *   2 installed                          → false (Stage 1 caps at 2 — the door
 *                                          closes after the ceremony)
 *
 * "W12 climax reached" is signalled by the Q1_WEEK11_RESOLVED flag — see the
 * helper's doc comment for why that flag (and not Q1_CLOSED or the week
 * cursor) is the §11-traceable choice.
 */
import { describe, it, expect } from 'vitest'
import { installWindowOpen, type InstallWindowState } from '@systems/moduleInstallWindow'
import { Q1_WEEK11_RESOLVED, Q1_WEEK12_RESOLVED, Q1_CLOSED } from '@systems/gameFlags'

function state(
  installed: InstallWindowState['installedModules'],
  flags: string[],
): InstallWindowState {
  return { installedModules: installed, flags: new Set(flags) }
}

describe('installWindowOpen (B7 second-install window)', () => {
  const CASES: ReadonlyArray<{
    name: string
    input: InstallWindowState
    expected: boolean
  }> = [
    {
      name: '0 installed, no flags → false (install #1 uses the empty-map grid)',
      input: state({}, []),
      expected: false,
    },
    {
      name: '0 installed, even at W12 → false (window is for the SECOND install)',
      input: state({}, [Q1_WEEK11_RESOLVED]),
      expected: false,
    },
    {
      name: '1 installed, pre-W12 → false (no early second install)',
      input: state({ MOURNER: { rank: 2 } }, []),
      expected: false,
    },
    {
      name: '1 installed, W12 climax reached → true (the ceremony has a door)',
      input: state({ MOURNER: { rank: 3 } }, [Q1_WEEK11_RESOLVED]),
      expected: true,
    },
    {
      name: '1 installed, W12 hearing resolved (Q1_CLOSED) → still true (arc doc stages the ceremony AFTER the hearing)',
      input: state({ MOURNER: { rank: 3 } }, [
        Q1_WEEK11_RESOLVED,
        Q1_WEEK12_RESOLVED,
        Q1_CLOSED,
      ]),
      expected: true,
    },
    {
      name: '2 installed at W12 → false (Stage 1 caps at 2; door closes after the ceremony)',
      input: state({ MOURNER: { rank: 3 }, SENTINEL: { rank: 1 } }, [
        Q1_WEEK11_RESOLVED,
        Q1_WEEK12_RESOLVED,
        Q1_CLOSED,
      ]),
      expected: false,
    },
    {
      name: '2 installed pre-W12 (defensive; should be unreachable in Stage 1) → false',
      input: state({ MOURNER: { rank: 1 }, SENTINEL: { rank: 1 } }, []),
      expected: false,
    },
  ]

  for (const { name, input, expected } of CASES) {
    it(name, () => {
      expect(installWindowOpen(input)).toBe(expected)
    })
  }
})
