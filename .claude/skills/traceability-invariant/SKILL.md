---
name: traceability-invariant
description: Verify Echo9's PLAN.md §11 Traceability Invariant across content, schemas, and state. Every scheduled ConsequenceHook must resolve to a real source task/choice; every ledger trace must be reachable from committed content; every hook must have a revealCondition that CAN fire. Use after any change under game/src/content/, game/src/systems/consequenceEngine.ts, or the ledger/eventQueue slices.
---

# traceability-invariant

Echo9's §11 contract is unique enough to deserve a dedicated audit path. Generic reviewers grade code quality; this skill grades whether the round-trip promise ("every delayed consequence returns, and every returned consequence can be traced back to its source choice") holds.

## When to invoke

- Any file added or modified under `game/src/content/`.
- Any change to `game/src/systems/consequenceEngine.ts`, `game/src/state/eventQueueSlice.ts`, or `game/src/state/ledgerSlice.ts`.
- Before closing any task that adds new `ConsequenceHook` fixtures.
- Before any release-candidate tag or itch.io ship.

## The invariant (verbatim from PLAN.md §11)

Every `ConsequenceHook` that enters `scheduledConsequences` MUST eventually either (a) fire — remove from scheduled, append trace to ledger, push to `pendingFiredHooks` — or (b) be provably unreachable (its `revealCondition` is `NEVER`, documented as intentional dead scheduling). No hook may leak: no scheduled hook can disappear from state without either a materialized ledger trace or an explicit `clearPending()` call in a testing/quarter-rollover context.

## Procedure

### 1. Schema round-trip check

Run `cd game && npx vitest run src/tests/content/q1ContentParse.test.ts` and require exit 0. This gates the content-Zod contract.

### 2. Cross-reference resolution

For each `ConsequenceHook` in `game/src/content/**/*.ts` (via `ALL_CONSEQUENCE_MODULES`):
- `sourceTaskId` MUST match a `TaskNode.id` in `game/src/content/tasks/**`.
- `sourceChoiceId` MUST match a `ChoiceNode.id` under that task's `choiceIds`.
- `revealCondition.meter` (when `type: 'METER_THRESHOLD'`) MUST match a `MeterKey` enum member in `game/src/schemas/gameState.schema.ts`.
- `revealCondition.phase` (when `type: 'PHASE'`) MUST match a `SlicePhase` enum member.

### 3. Reachability audit

For each hook, verify its `revealCondition` CAN fire from the current game shape:
- `PHASE` — the target phase MUST appear in a real transition path (check `bootSlice.ts` transitions + resolver dispatches).
- `METER_THRESHOLD` — some content path MUST push the meter across the threshold sign (positive/negative deltas exist in `ChoiceNode.meterDeltas`).
- `FLAG` — some content path MUST call `setFlag(flag)`.
- `NEVER` — REQUIRED comment above the hook definition documenting why intentional. If missing → flag Critical.

### 4. Ledger backfill audit

For each `ResultTrace` shape in state (via `game/src/systems/consequenceEngine.ts` `materialize()`), verify the 7 §11 fields all map to a real property on `ConsequenceHookSchema`:
- `whyNow`, `whatChanged`, `traceHint`, `ledgerEntry`, `sourceTaskId`, `sourceChoiceId`, `revealCondition`.

### 5. Atomic-mutation guard

Grep `game/src/state/eventQueueSlice.ts` for the `evaluateAndEnqueue` producer. The `scheduledConsequences.splice(...)` and `pendingFiredHooks.push(...)` calls MUST live in a SINGLE `set((state) => {...})` block. Split mutations = §11 leak on mid-flow throw.

## Output format

```
## PASS/FAIL — Traceability Invariant

### Schema round-trip
[PASS | FAIL — vitest exit code + failing path]

### Cross-reference resolution
- Hooks scanned: N
- Broken sourceTaskId: [list file:line or "none"]
- Broken sourceChoiceId: [list or "none"]
- Broken revealCondition.meter: [list or "none"]

### Reachability
- Unreachable hooks (no path can fire): [list or "none"]
- NEVER hooks lacking rationale comment: [list or "none"]

### Ledger backfill
- materialize() field coverage: [7/7 or list missing]

### Atomic-mutation guard
- evaluateAndEnqueue atomic: [YES | NO — cite file:line]

## Verdict
[CLEAR to merge | BLOCK — N issues]
```

## Do not

- Do NOT modify files. Read-only audit.
- Do NOT propose new hook content — that's the content-author skill's job.
- Do NOT auto-fix schema errors. Surface them, hand back to the author.
