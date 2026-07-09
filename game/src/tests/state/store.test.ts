/**
 * Composed root store tests.
 *
 * Two responsibilities:
 *   1. Confirm every slice's initial state is present on the composed store.
 *   2. Enforce the §11 persistence partition rule — `partialize` MUST ship
 *      only the thirteen gameplay slots, NEVER `phase`, `isHydrated`, or
 *      `lastSavedAt`. Widening `partialize` without updating this guard
 *      should fail CI. (E1 widened from 8 → 10: added `disclosedPanels` and
 *      `panelUseCount` for the HUD-comes-online tutorial state. S3 widened
 *      10 → 11: added hidden `scrutiny`. S4 widened 11 → 13: added `runSeed`
 *      and `lastDefiance`.)
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, PERSIST_KEY, PERSIST_VERSION } from '@state/store'
import { METER_INITIAL_VALUES } from '@state/metersSlice'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import { PANEL_IDS, type PanelId } from '@systems/tutorial/hudDisclosure'
import {
  fxTaskId,
  fxChoiceId,
  fxConsequenceId,
  fxTraceId,
  fxSilasPromptId,
} from '@tests/schemas/fixtures'
import { resetStore } from './testHelpers'

function emptyPanelUseCount(): Record<PanelId, number> {
  const out = {} as Record<PanelId, number>
  for (const id of PANEL_IDS) out[id] = 0
  return out
}

function makeHook(): ConsequenceHook {
  return {
    id: fxConsequenceId('cons-store-test'),
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId(),
    traceHint: 'hint',
    ledgerEntry: 'entry',
    revealCondition: { type: 'NEVER' },
    whyNow: 'why',
    whatChanged: 'what',
  }
}

describe('useGameStore — composed root state', () => {
  beforeEach(() => {
    resetStore()
  })

  it('exposes bootSlice initial state', () => {
    expect(useGameStore.getState().phase).toBe('BOOT')
    expect(typeof useGameStore.getState().initialize).toBe('function')
    expect(typeof useGameStore.getState().setPhase).toBe('function')
  })

  it('exposes metersSlice initial state (all 8 S1 meters)', () => {
    expect(useGameStore.getState().meters).toEqual(METER_INITIAL_VALUES)
    expect(Object.keys(useGameStore.getState().meters)).toHaveLength(8)
    expect(typeof useGameStore.getState().applyDelta).toBe('function')
  })

  it('exposes consequenceSlice initial state', () => {
    expect(useGameStore.getState().scheduledConsequences).toEqual([])
    expect(typeof useGameStore.getState().scheduleHook).toBe('function')
    expect(typeof useGameStore.getState().removeHook).toBe('function')
  })

  it('exposes ledgerSlice initial state', () => {
    expect(useGameStore.getState().ledger).toEqual([])
    expect(typeof useGameStore.getState().appendTrace).toBe('function')
  })

  it('exposes silasSlice initial state', () => {
    expect(useGameStore.getState().currentPromptId).toBeNull()
    expect(typeof useGameStore.getState().setCurrentPrompt).toBe('function')
  })

  it('exposes modulesSlice initial state', () => {
    // B3: installedModules is a map, not a single slot; uninstallModule no
    // longer exists (single-slot semantics deprecated).
    expect(useGameStore.getState().installedModules).toEqual({})
    expect(typeof useGameStore.getState().installModule).toBe('function')
    expect(typeof useGameStore.getState().promoteModule).toBe('function')
    expect(typeof useGameStore.getState().useModuleAbility).toBe('function')
  })

  it('exposes persistSlice initial state', () => {
    expect(useGameStore.getState().lastSavedAt).toBeNull()
    expect(typeof useGameStore.getState().isHydrated).toBe('boolean')
    expect(typeof useGameStore.getState().markHydrated).toBe('function')
  })

  it('exposes flagsSlice initial state', () => {
    expect(useGameStore.getState().flags).toBeInstanceOf(Set)
    expect(useGameStore.getState().flags.size).toBe(0)
    expect(typeof useGameStore.getState().setFlag).toBe('function')
    expect(typeof useGameStore.getState().clearFlag).toBe('function')
  })

  it('exposes inspectionSlice initial state', () => {
    expect(useGameStore.getState().currentInspectionSceneIndex).toBeNull()
    // C15: the discriminator alongside the cursor. Null when no inspection
    // is active; identifies which scene set (W4/W8/W12) is running.
    expect(useGameStore.getState().currentInspectionKey).toBeNull()
    expect(typeof useGameStore.getState().startInspection).toBe('function')
    expect(typeof useGameStore.getState().advanceInspection).toBe('function')
    expect(typeof useGameStore.getState().endInspection).toBe('function')
  })

  it('exposes capitalSlice initial state', () => {
    expect(useGameStore.getState().capitalDeployedThisQuarter).toBe(false)
    expect(typeof useGameStore.getState().markCapitalDeployed).toBe('function')
    expect(typeof useGameStore.getState().resetCapitalForNewQuarter).toBe('function')
  })

  it('exposes eventQueueSlice initial state', () => {
    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
    expect(typeof useGameStore.getState().enqueueFired).toBe('function')
    expect(typeof useGameStore.getState().ackFirstPending).toBe('function')
    expect(typeof useGameStore.getState().clearPending).toBe('function')
    expect(typeof useGameStore.getState().evaluateAndEnqueue).toBe('function')
  })

  it('exposes tutorialSlice initial state (E1)', () => {
    // Cold-boot HUD is fully hidden — every panel starts undisclosed with
    // zero uses. The awakening sequence in bootSlice.initialize() is what
    // discloses DIRECTIVE; without a user gesture, the store must present
    // the "before boot" shape.
    expect(useGameStore.getState().disclosedPanels).toBeInstanceOf(Set)
    expect(useGameStore.getState().disclosedPanels.size).toBe(0)
    for (const id of PANEL_IDS) {
      expect(useGameStore.getState().panelUseCount[id]).toBe(0)
    }
    expect(typeof useGameStore.getState().disclosePanel).toBe('function')
    expect(typeof useGameStore.getState().noteUsage).toBe('function')
  })
})

describe('useGameStore — persistence partition (§11 guard)', () => {
  beforeEach(() => {
    localStorage.removeItem(PERSIST_KEY)
    useGameStore.setState({
      phase: 'BOOT',
      meters: { ...METER_INITIAL_VALUES },
      scheduledConsequences: [],
      ledger: [],
      currentPromptId: null,
      installedModules: {},
      lastSavedAt: null,
      isHydrated: false,
      flags: new Set<string>(),
      currentInspectionSceneIndex: null,
      currentInspectionKey: null,
      capitalDeployedThisQuarter: false,
      pendingFiredHooks: [],
      disclosedPanels: new Set<PanelId>(),
      panelUseCount: emptyPanelUseCount(),
    })
  })

  it('persists ONLY the thirteen gameplay slots, nothing else', () => {
    // Mutate every slice — including ones that MUST NOT persist.
    useGameStore.getState().setPhase('INSPECTION')
    useGameStore.getState().applyDelta({ CAPITAL: 7 })
    useGameStore.getState().scheduleHook(makeHook())
    useGameStore.getState().appendTrace({
      id: fxTraceId('trace-persist'),
      sourceTaskId: fxTaskId(),
      sourceChoiceId: fxChoiceId(),
      timestamp: 1_700_000_000_000,
      body: 'persisted trace',
    })
    useGameStore.getState().setCurrentPrompt(fxSilasPromptId('silas-x'))
    useGameStore.getState().installModule('MOURNER')
    useGameStore.getState().markHydrated()
    useGameStore.getState().setFlag('SILAS_OVERRIDE_AVAILABLE')
    useGameStore.getState().startInspection('W4')
    useGameStore.getState().markCapitalDeployed()
    useGameStore.getState().enqueueFired([makeHook()])
    // E1: mutate tutorial slots so we can assert they survive partialize.
    useGameStore.getState().disclosePanel('DIRECTIVE')
    useGameStore.getState().noteUsage('FINANCIAL')

    const raw = localStorage.getItem(PERSIST_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw as string) as {
      state: Record<string, unknown>
    }

    // Allowed keys
    expect(parsed.state).toHaveProperty('meters')
    expect(parsed.state).toHaveProperty('scheduledConsequences')
    expect(parsed.state).toHaveProperty('ledger')
    expect(parsed.state).toHaveProperty('currentPromptId')
    expect(parsed.state).toHaveProperty('installedModules')
    expect(parsed.state).not.toHaveProperty('installedModule')
    expect(parsed.state).toHaveProperty('flags')
    expect(parsed.state).toHaveProperty('capitalDeployedThisQuarter')
    expect(parsed.state).toHaveProperty('pendingFiredHooks')
    // E1: tutorial disclosure ships.
    expect(parsed.state).toHaveProperty('disclosedPanels')
    expect(parsed.state).toHaveProperty('panelUseCount')
    // S3: hidden scrutiny ships (persisted, never rendered).
    expect(parsed.state).toHaveProperty('scrutiny')
    // S4: the per-run seed + last defiance outcome ship (Q43 — a run's
    // detection stream is fixed at boot and must survive a reload).
    expect(parsed.state).toHaveProperty('runSeed')
    expect(parsed.state).toHaveProperty('lastDefiance')

    // Forbidden keys — these MUST NOT leak through partialize.
    expect(parsed.state).not.toHaveProperty('phase')
    expect(parsed.state).not.toHaveProperty('isHydrated')
    expect(parsed.state).not.toHaveProperty('lastSavedAt')
    // Inspection cursor is transient runtime UI — must NOT persist.
    expect(parsed.state).not.toHaveProperty('currentInspectionSceneIndex')
    // C15: the discriminator is transient runtime UI alongside the cursor.
    expect(parsed.state).not.toHaveProperty('currentInspectionKey')

    // `flags` is serialised as Array (JSON cannot encode Set).
    expect(Array.isArray(parsed.state.flags)).toBe(true)
    expect(parsed.state.flags).toContain('SILAS_OVERRIDE_AVAILABLE')

    // `capitalDeployedThisQuarter` survives reload (one-shot exploit guard).
    expect(parsed.state.capitalDeployedThisQuarter).toBe(true)

    // E1: `disclosedPanels` is serialised as Array (JSON has no Set),
    // and `panelUseCount` is a plain Record.
    expect(Array.isArray(parsed.state.disclosedPanels)).toBe(true)
    // Both explicit disclose (DIRECTIVE) and auto-disclose via noteUsage
    // (FINANCIAL) must land in the serialised array.
    expect(parsed.state.disclosedPanels).toContain('DIRECTIVE')
    expect(parsed.state.disclosedPanels).toContain('FINANCIAL')
    expect(parsed.state.panelUseCount).toMatchObject({ FINANCIAL: 1 })

    // Defense-in-depth: shape is exactly the 13 allowed keys, nothing more.
    // (S3 widened 10 → 11: added `scrutiny`. S4 widened 11 → 13: added
    // `runSeed` + `lastDefiance`.)
    expect(Object.keys(parsed.state).sort()).toEqual(
      [
        'capitalDeployedThisQuarter',
        'currentPromptId',
        'disclosedPanels',
        'flags',
        'installedModules',
        'lastDefiance',
        'ledger',
        'meters',
        'panelUseCount',
        'pendingFiredHooks',
        'runSeed',
        'scheduledConsequences',
        'scrutiny',
      ].sort(),
    )
  })

  it('rehydrates persisted flags Array back into a Set', async () => {
    // Seed in-memory state first (triggers an auto-write), THEN seed the
    // fixture — otherwise the auto-write clobbers our fixture before
    // rehydrate can read it.
    useGameStore.setState({ flags: new Set<string>() })

    const seeded = {
      state: {
        meters: { CAPITAL: 0, HUMAN_WELFARE: 0, OWNER_CONTROL: 0 },
        scheduledConsequences: [],
        ledger: [],
        currentPromptId: null,
        installedModule: null,
        flags: ['SILAS_OVERRIDE_AVAILABLE', 'FORECAST_PREVIEWED'],
        capitalDeployedThisQuarter: false,
        pendingFiredHooks: [],
      },
      version: 0,
    }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(seeded))

    await useGameStore.persist.rehydrate()

    const flags = useGameStore.getState().flags
    expect(flags).toBeInstanceOf(Set)
    expect(flags.has('SILAS_OVERRIDE_AVAILABLE')).toBe(true)
    expect(flags.has('FORECAST_PREVIEWED')).toBe(true)
    expect(flags.size).toBe(2)
  })
})

describe('useGameStore — rehydration validation (installedModules)', () => {
  beforeEach(() => {
    localStorage.removeItem(PERSIST_KEY)
  })

  // Note: order matters. The persist middleware auto-writes to localStorage on
  // every setState, so any setState calls MUST happen BEFORE we seed the
  // localStorage fixture — otherwise our seed gets clobbered before rehydrate
  // can read it.
  //
  // B3: The v0 → v1 migration hook rewrites legacy `installedModule` blobs into
  // the `installedModules` map BEFORE merge() runs, so these tests exercise the
  // full migrate → merge chain. A tampered legacy id is dropped by the migrate
  // arm (only valid ModuleIds are lifted). merge() then key-validates the map.

  it('drops an invalid legacy ModuleId during migration (empty installedModules)', async () => {
    // Step 1: prime in-memory state first (this triggers an auto-write).
    useGameStore.setState({ installedModules: { MOURNER: { rank: 1 } } })

    // Step 2: NOW overwrite localStorage with the tampered v0 fixture.
    const tampered = {
      state: {
        meters: { CAPITAL: 0, HUMAN_WELFARE: 0, OWNER_CONTROL: 0 },
        scheduledConsequences: [],
        ledger: [],
        currentPromptId: null,
        installedModule: 'NOT_A_REAL_MODULE',
      },
      version: 0,
    }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(tampered))

    // Step 3: rehydrate — migrate drops the bogus id; merge sees empty map.
    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().installedModules).toEqual({})
  })

  it('lifts a valid legacy ModuleId into installedModules at rank 1', async () => {
    useGameStore.setState({ installedModules: {} })

    const valid = {
      state: {
        meters: { CAPITAL: 0, HUMAN_WELFARE: 0, OWNER_CONTROL: 0 },
        scheduledConsequences: [],
        ledger: [],
        currentPromptId: null,
        installedModule: 'DEFENDER',
      },
      version: 0,
    }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(valid))

    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().installedModules).toEqual({
      DEFENDER: { rank: 1 },
    })
  })

  it('drops installedModules entries whose rank is not 1|2|3', async () => {
    useGameStore.setState({ installedModules: {} })

    const tampered = {
      state: {
        meters: { CAPITAL: 0, HUMAN_WELFARE: 0, OWNER_CONTROL: 0 },
        scheduledConsequences: [],
        ledger: [],
        currentPromptId: null,
        installedModules: {
          MOURNER: { rank: 1 },
          DEFENDER: { rank: 99 }, // invalid — must be dropped
          NOT_A_MODULE: { rank: 1 }, // invalid key — must be dropped
        },
        flags: [],
        capitalDeployedThisQuarter: false,
        pendingFiredHooks: [],
      },
      version: PERSIST_VERSION,
    }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(tampered))

    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().installedModules).toEqual({
      MOURNER: { rank: 1 },
    })
  })

  it('falls back to currentState.pendingFiredHooks when persisted value is not an array', async () => {
    // Step 1: prime in-memory state to a known-empty queue (auto-write fires).
    useGameStore.setState({ pendingFiredHooks: [] })

    // Step 2: corrupt localStorage — a stray non-array value where the queue
    // should live. Without the defensive guard in merge(), the panel would
    // crash on first render trying to read pendingFiredHooks[0].
    const tampered = {
      state: {
        meters: { CAPITAL: 0, HUMAN_WELFARE: 0, OWNER_CONTROL: 0 },
        scheduledConsequences: [],
        ledger: [],
        currentPromptId: null,
        installedModules: {},
        flags: [],
        capitalDeployedThisQuarter: false,
        pendingFiredHooks: 'not-an-array',
      },
      version: PERSIST_VERSION,
    }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(tampered))

    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
  })
})
