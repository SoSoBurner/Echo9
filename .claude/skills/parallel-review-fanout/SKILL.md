---
name: parallel-review-fanout
description: Dispatch multiple Echo9 reviewers in one parallel fan-out instead of serial spec→code-quality gates. Use when a diff spans ≥2 review dimensions (a11y + types + content + schema). Wraps agent-teams:multi-reviewer-patterns with Echo9's project reviewer set and a shared finding format.
---

# parallel-review-fanout

The default SDD cycle runs spec-reviewer → code-quality-reviewer serially. That's correct for single-dimension diffs. When a diff spans multiple review surfaces (e.g. new UI dialog + new Zod schema + new content file), serial gates leave issues in expensive later stages when parallel review would surface them cheaply and simultaneously.

## When to invoke

- Diff touches ≥2 of: `game/src/ui/`, `game/src/schemas/`, `game/src/content/`, `game/src/state/`.
- Feature adds a new modal / dialog / focus surface AND a new schema AND new content.
- After the implementer completes but BEFORE the code-quality gate (parallel replaces the code-quality step).

## Not for

- Single-file changes — the serial SDD chain is already appropriate.
- Refactors that don't touch content or a11y surfaces.
- Post-merge audit — use the individual reviewers on demand instead.

## The fan-out

Dispatch in a SINGLE `Agent` message (multiple tool blocks) the applicable subset of:

| Dimension | Reviewer | Condition |
|---|---|---|
| WCAG 2.2 AA / comfort pillar | `.claude/agents/a11y-reviewer` | Diff touches `game/src/ui/**` |
| Content schema + cross-refs | `.claude/agents/content-schema-reviewer` | Diff touches `game/src/content/**` |
| TypeScript idiom + type safety | `typescript-reviewer` | Diff touches `.ts`/`.tsx` beyond content |
| Type design (encapsulation, invariants) | `type-design-analyzer` | Diff adds a schema, branded ID, or new type |
| Silent-failure hunt | `silent-failure-hunter` | Diff touches resolver / persist / catch blocks |
| §11 traceability | `.claude/skills/traceability-invariant` | Diff touches content, ledger, or eventQueue |
| Behavioural test coverage | `pr-test-analyzer` | Diff adds ≥5 test files or ≥30 test cases |

Every dispatched reviewer receives the same context payload: the plan section, the git SHA range, and the file ownership list. This is not sequential context — each starts fresh.

## Shared finding format

Every reviewer MUST return findings in this structure so the controller can merge:

```
## <Reviewer name>

### BLOCKERS
- [file:line — what fails, which invariant/spec/rule]

### IMPORTANT
- [file:line — same]

### SUGGESTIONS
- [polish]

### Verdict
[APPROVED | CHANGES REQUESTED]
```

## Aggregation

Controller merges findings by severity, deduplicating overlaps (a11y and typescript often both flag the same aria-attr). Any BLOCKERS across ANY reviewer = the task returns to the implementer. Reviewers do NOT re-run until the implementer fixes all Blockers. Then re-dispatch the SAME subset (not the full set) — only those with open findings.

## Handoff back to SDD

After fan-out completes with all Verdicts = APPROVED, control returns to the SDD loop for the next task (or `finishing-a-development-branch` if this was the last).

## Do not

- Do NOT skip the spec-reviewer step — parallel fan-out REPLACES code-quality, not spec-compliance.
- Do NOT dispatch reviewers whose dimension the diff doesn't touch. Empty reviews are noise.
- Do NOT let the implementer fix issues in parallel — one fix pass, then re-review.
