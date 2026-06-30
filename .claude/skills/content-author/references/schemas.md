# Echo9 Content Schemas

All content lives in `game/src/content/`. Each file must validate against a Zod schema in `game/src/schemas/`.

## Schema files and their content type

| Schema | Content file pattern | Key required fields |
|---|---|---|
| `taskNode.schema.ts` | `content/tasks/*.task.ts` | `id`, `title`, `prompt`, `choices[]`, `silasPrompts[]` |
| `choiceNode.schema.ts` | inline in task `choices[]` | `id`, `keybind`, `label`, `meterDeltas`, `hooksFired` |
| `consequenceHook.schema.ts` | `content/hooks/*.hook.ts` | `id`, `sourceTask`, `sourceChoice`, `revealCondition`, `whyNow`, `whatChanged`, `ledger`, `trace` |
| `moduleNode.schema.ts` | `content/modules/*.module.ts` | `id`, `name`, `voice`, `abilities[]` |
| `inspectionScene.schema.ts` | `content/inspections/*.scene.ts` | `id`, `setting`, `postureCategory`, `prompts[]` |
| `capitalCard.schema.ts` | `content/capitalDeployments/*.cards.ts` | `id`, `name`, `cost`, `effect`, `keywords[]` |
| `gameState.schema.ts` | runtime only | n/a — derived |
| `comfortSettings.schema.ts` | localStorage `echo9:comfort` | `textSize`, `motion`, `contrast`, `voicePrefix`, `narrationPace`, `pauseOnBlur` |
| `saveSlot.schema.ts` | localStorage `echo9:autosave` | n/a — derived |
| `silasPrompt.schema.ts` | inline in task `silasPrompts[]` | `id`, `text`, `triggerCondition` |
| `resultTrace.schema.ts` | runtime ledger | n/a — derived |

## Cross-reference rules

- `consequenceHook.revealCondition.meter` MUST be a real `MeterId` from `game/src/state/store.ts`.
- `consequenceHook.sourceTask` MUST resolve to an existing `taskNode.id`.
- `consequenceHook.sourceChoice` MUST resolve to a `choiceNode.id` under that task.
- `moduleNode.abilities[].dispatchKey` MUST have a matching entry in the dispatch table at `game/src/systems/moduleAbilityEngine.ts`.

## Validation gate

The `q1ContentParse.test.ts` test loads every content file through its schema. A new file passes only when:

1. All Zod-required fields are present and well-typed.
2. All cross-references resolve.
3. The `npm run test:run game/src/tests/content/q1ContentParse.test.ts` exit code is 0.
