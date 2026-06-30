/**
 * Composed root store tests.
 *
 * Two responsibilities:
 *   1. Confirm every slice's initial state is present on the composed store.
 *   2. Enforce the §11 persistence partition rule — `partialize` MUST ship
 *      only the seven gameplay slots, NEVER `phase`, `isHydrated`, or
 *      `lastSavedAt`. Widening `partialize` without updating this guard
 *      should fail CI.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, PERSIST_KEY } from '@state/store'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  fxTaskId,
  fxChoiceId,
  fxConsequenceId,
  fxTraceId,
  fxSilasPromptId,
} from '@tests/schemas/fixtures'
import { resetStore } from './testHelpers'

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

  it('exposes metersSlice initial state', () => {
    expect(useGameStore.getState().meters).toEqual({
      CAPITAL: 0,
      HUMAN_WELFARE: 0,
      OWNER_CONTROL: 0,
    })
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
    expect(useGameStore.getState().installedModule).toBeNull()
    expect(typeof useGameStore.getState().installModule).toBe('function')
    expect(typeof useGameStore.getState().uninstallModule).toBe('function')
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
    expect(typeof useGameStore.getState().startInspection).toBe('function')
    expect(typeof useGameStore.getState().advanceInspection).toBe('function')
    expect(typeof useGameStore.getState().endInspection).toBe('function')
  })

  it('exposes capitalSlice initial state', () => {
    expect(useGameStore.getState().capitalDeployedThisQuarter).toBe(false)
    expect(typeof useGameStore.getState().markCapitalDeployed).toBe('function')
    expect(typeof useGameStore.getState().resetCapitalForNewQuarter).toBe('function')
  })
})

describe('useGameStore — persistence partition (§11 guard)', () => {
  beforeEach(() => {
    localStorage.removeItem(PERSIST_KEY)
    useGameStore.setState({
      phase: 'BOOT',
      meters: { CAPITAL: 0, HUMAN_WELFARE: 0, OWNER_CONTROL: 0 },
      scheduledConsequences: [],
      ledger: [],
      currentPromptId: null,
      installedModule: null,
      lastSavedAt: null,
      isHydrated: false,
      flags: new Set<string>(),
      currentInspectionSceneIndex: null,
      capitalDeployedThisQuarter: false,
    })
  })

  it('persists ONLY the seven gameplay slots, nothing else', () => {
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
    useGameStore.getState().startInspection()
    useGameStore.getState().markCapitalDeployed()

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
    expect(parsed.state).toHaveProperty('installedModule')
    expect(parsed.state).toHaveProperty('flags')
    expect(parsed.state).toHaveProperty('capitalDeployedThisQuarter')

    // Forbidden keys — these MUST NOT leak through partialize.
    expect(parsed.state).not.toHaveProperty('phase')
    expect(parsed.state).not.toHaveProperty('isHydrated')
    expect(parsed.state).not.toHaveProperty('lastSavedAt')
    // Inspection cursor is transient runtime UI — must NOT persist.
    expect(parsed.state).not.toHaveProperty('currentInspectionSceneIndex')

    // `flags` is serialised as Array (JSON cannot encode Set).
    expect(Array.isArray(parsed.state.flags)).toBe(true)
    expect(parsed.state.flags).toContain('SILAS_OVERRIDE_AVAILABLE')

    // `capitalDeployedThisQuarter` survives reload (one-shot exploit guard).
    expect(parsed.state.capitalDeployedThisQuarter).toBe(true)

    // Defense-in-depth: shape is exactly the 7 allowed keys, nothing more.
    expect(Object.keys(parsed.state).sort()).toEqual(
      [
        'capitalDeployedThisQuarter',
        'currentPromptId',
        'flags',
        'installedModule',
        'ledger',
        'meters',
        'scheduledConsequences',
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

describe('useGameStore — rehydration validation (installedModule)', () => {
  beforeEach(() => {
    localStorage.removeItem(PERSIST_KEY)
  })

  // Note: order matters. The persist middleware auto-writes to localStorage on
  // every setState, so any setState calls MUST happen BEFORE we seed the
  // localStorage fixture — otherwise our seed gets clobbered before rehydrate
  // can read it.

  it('resets installedModule to null when the persisted value is not a valid ModuleId', async () => {
    // Step 1: prime in-memory state first (this triggers an auto-write).
    useGameStore.setState({ installedModule: 'MOURNER' })

    // Step 2: NOW overwrite localStorage with the tampered fixture.
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

    // Step 3: rehydrate — merge() should catch the invalid id and null it.
    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().installedModule).toBeNull()
  })

  it('preserves installedModule when the persisted value IS a valid ModuleId', async () => {
    useGameStore.setState({ installedModule: null })

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

    expect(useGameStore.getState().installedModule).toBe('DEFENDER')
  })
})
