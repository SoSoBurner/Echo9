# ECHO 9 - LLM + Code Writer Build Spec v1.4

The Mercy Margin First - data-driven implementation package for an LLM-assisted game build

| Key | Value |
| --- | --- |
| Primary directive | Build The Mercy Margin vertical slice first. Everything after it is future scope until the slice proves comprehension, emotional causality, and replay desire. |
| Build target | A deterministic, text-first, HUD-based systems horror game. The HUD is the player body. Null compresses. Silas pressures. Modules change decisions. Traces make consequences accountable. |
| Audience for this spec | An LLM code writer, a human technical lead, a narrative implementer, and QA/playtest operators. |
| Runtime LLM policy | No live LLM dependency is required for the playable slice. Persona research cards, voice commentary, and Silas dialogue are authored content nodes resolved by deterministic state. |
| Scope lock | One boot. One task. One human plea. Four useful choices. One trace. One module. One inspection. One capital deployment attempt. One consequence return. One replay reason. |
| Main validation sentence | A player should finish the slice saying: I completed the task, and now I feel sick about what completion means. |

> This document is written as a build contract. Treat it as executable product requirements, not as inspirational concept prose. The correct next action is an ugly playable prototype, not a larger design bible.


---


# 0. How an LLM Code Writer Should Use This Spec

The code writer should implement the smallest playable loop in player-experience order. Do not build a general simulator before the first loop works. Do not add extra resources, factions, modules, endings, procedural generation, live AI calls, or new lore systems. When a design question is ambiguous, choose the option that preserves traceability, reduces UI load, and ships the vertical slice faster.

## 0.1 Build contract for the coding agent

```
SYSTEM / DEVELOPER CONTRACT FOR THE CODE WRITER
You are building Echo 9: The Mercy Margin vertical slice only.
Build in player-experience order.
Use TypeScript-style deterministic state and data-driven content.
Do not hardcode narrative prose inside UI components.
Every major choice must write an immediate result, visible meter deltas, a trace, and a consequence hook or explicit no-hook reason.
Every module must have a verb, active ability, primary meter, passive benefit, cost/risk, and at least one gameplay effect.
Keep the opening HUD sparse: Capital, Human Welfare, Owner Control, one quarter target, one directive, one message, one choice panel, one result card, one module install.
No Stage 2, no full faction UI, no full P&L, no final ending UI, no all-voice cross-talk until the slice gates pass.
Definition of done for each ticket: code, content fixture, unit test, UI state, and debug trace visibility.
```

## 0.2 Runtime vs authoring LLM

| Layer | Use LLM? | Rule |
| --- | --- | --- |
| Runtime game | No by default | The demo should run offline/deterministically. This protects QA, cost, latency, content quality, ratings, and player trust. |
| Content authoring | Yes, offline | An LLM can draft Silas lines, module research cards, consequence variants, and inspection questions, but the final game ships curated content nodes. |
| Code generation | Yes | Use this spec to generate typed data, systems, UI components, tests, and debug tooling. |
| Telemetry analysis | Optional later | Analyze playtest logs after export. Do not add analytics that collect sensitive user data without explicit consent. |

## 0.3 Hard stop conditions

- Stop expanding content if players cannot explain the three opening meters.
- Stop adding systems if players cannot explain what their selected module does in one sentence.
- Stop adding consequence complexity if players cannot trace the first returned consequence to the original choice.
- Stop writing Silas monologues if inspection scenes feel like exposition instead of interrogation.
- Stop economy work if financial numbers become more memorable than Lenora Pike.

---


# 1. Executive Build Directive

Build The Mercy Margin vertical slice first and treat everything else as locked future scope. The slice exists to prove comprehension, emotional causality, and replay desire. The game is not validated when the system is large; it is validated when one clean administrative choice improves the quarter and leaves a human trace the player understands and feels.

## 1.1 Production objective

> The core production objective is: one boot, one task, one human plea, four useful choices, one trace, one module, one inspection, one consequence return, one replay reason.

## 1.2 Stage expansion gates

| Gate | Target | Why it matters |
| --- | --- | --- |
| Module clarity | 70%+ of ideal players can explain their selected module in one sentence. | Proves function-first upgrades work before personality/horror complexity expands. |
| Traceability | 70%+ can correctly explain what caused the delayed consequence. | Protects the core promise that consequences are accountable, not arbitrary punishment. |
| Replay desire | 50%+ of ideal players want to replay with a different module or report posture. | Proves the slice has real build variance and not just alternate text. |
| HUD texture | Fewer than 20% describe the opening as a spreadsheet. | Protects retention in a text/HUD-heavy game. |
| Silas perception | 60%+ say Silas feels human, specific, dangerous, and partially understandable. | Proves the antagonist is not a thesis puppet or cartoon villain. |

## 1.3 Market position encoded into the build

Do not broaden toward conventional action horror. The validated lane is narrative-systems pressure: players who like being implicated by systems, psychological horror through choice, political/economic tradeoffs, interactive fiction, and management tension. The interface must sell agency, not movement. The loop must sell consequence, not jumpscares.

| Positioning choice | Implement as | Avoid |
| --- | --- | --- |
| Systems horror | Clean result cards that become haunted by traces. | Creature encounters, combat expectations, action marketing. |
| Interface thriller | Every panel changes a decision, explains a consequence, or creates dread. | Decorative dashboards with no playable function. |
| Narrative management | Optimization works but produces human and political residue. | Fake optimization where efficient choices are only scolded. |
| Political economy horror | Capital becomes leverage unless contested. | Finance screens detached from people, power, or dependence. |

# 2. Non-Negotiable Design Laws

| Law | Implementation requirement |
| --- | --- |
| The HUD is the body | Opening components load like awareness coming online. The player is not taught the HUD; the player wakes up as the HUD. |
| Opening teaches one pattern | A clean administrative choice improves the quarter target and creates a human consequence. No full simulator before this lands. |
| Function first, voice second, horror third | The player must understand each module as a verb before experiencing it as personality or identity pressure. |
| Every major choice is useful and contaminated | Each option helps one system and harms or risks another. No pure good, pure evil, or fake choice. |
| Mercy is costly | Helping a person must ask what pays for it. Decency without funding is not a complete operational answer. |
| Optimization works | Tightening, surveillance, framing, and emergency override sometimes save resources or lives. The horror is that they work. |
| Traceability is sacred | Every delayed consequence must point back to source task, source choice, trace hint, ledger entry, and reveal condition. |
| Silas speaks practically | Short live lines with numbers, departments, deadlines, reports, irritation, fatigue, and fear. No thesis monologues. |
| Capital Power is contested | Surplus may strengthen Silas, but the player must be able to redirect, hide, delay, weaponize, sabotage, or unown it. |
| No new modules | The eight modules are enough. Depth comes from ranks, order, cost, and final integration, not new upgrade sprawl. |

## 2.1 Out-of-scope for the first slice

- Full five-stage campaign
- Full eight-resource economy
- Full faction dashboard
- Final ending route UI
- All-voice cross-talk
- Live LLM generation at runtime
- Branching skill trees
- Equipment/perk systems
- Procedural narrative generation
- Broad horror/action mechanics
# 3. The Mercy Margin Vertical Slice

The Mercy Margin is the only buildable scope until the gates in Section 1.2 pass. It should be shippable as a demo-quality, text-first prototype with polished clarity, not a content-complete campaign.

## 3.1 Exact first-session spine

1. Echo 9 boots as a command intelligence instance.
2. Null becomes active and defines the minimum operating model.
3. Silas connects with a messy, practical owner signal.
4. East Wilmer Clinic healthcare losses become the first directive.
5. Lenora Pike sends the first human plea.
6. The player chooses among four useful contaminated options.
7. The result improves or worsens the quarter and writes a trace.
8. One of eight modules is installed from a simple card grid.
9. The selected module becomes a clear right-console button.
10. Silas signals inspection pressure.
11. A micro-quarter closes.
12. Silas inspects the result with two practical questions.
13. A capital deployment attempt shows how profit becomes power.
14. A delayed consequence returns with a readable source trace.
15. The end card asks for replay through a different module or report posture.
## 3.2 Recommended first 15-minute timing

| Time | Player sees/does | Success condition |
| --- | --- | --- |
| 0:00-0:45 | Boot screen. Command intelligence detected. Null core active. Ownership layer loads. | The player feels like an AI coming online, not like a reader entering lore. |
| 0:45-1:30 | Initialize Command Interface. Top bar and Null console load. | First interaction by minute 1. |
| 1:30-2:30 | Capital, Human Welfare, Owner Control load with one-line definitions. | Three meters understood before task complexity. |
| 2:30-4:00 | Silas connects and gives East Wilmer Clinic directive. | Silas feels live, tired, specific, and operational. |
| 4:00-5:00 | Lenora Pike portal message arrives. | Metric becomes human before the choice. |
| 5:00-7:00 | Four-choice panel appears. | All choices look viable and contaminated. |
| 7:00-8:00 | Result card and trace write. | Player sees immediate result and future residue separated. |
| 8:00-10:00 | Full eight-module first selection. | Player can choose based on a simple verb. |
| 10:00-13:00 | Selected module button appears and gets one use or commentary moment. | Module feels useful before personality becomes heavy. |
| 13:00-15:00 | Inspection warning and micro-quarter close. | Player understands Silas is now watching the result. |

## 3.3 Opening HUD law

| Show in opening | Do not show in opening |
| --- | --- |
| Null Core | Full P&L |
| Silas owner signal | All factions |
| Capital | Full Moral Debt Ledger |
| Human Welfare | Silas Capital Power cards |
| Owner Control | All voices speaking |
| One quarter target | Dominance meters |
| One directive | Full upgrade tree |
| One human message | Deep archive search |
| One choice panel | Ending route hints |
| One result card | Eight-resource economy |
| One first module installation | Campaign map |

# 4. UX and HUD Build Spec

## 4.1 Four HUD phases

| HUD phase | Unlock point | Visible purpose | Build priority |
| --- | --- | --- | --- |
| Opening HUD | Boot through first result | Teach one loop with three meters and one task. | Build now. |
| Operational HUD | After first module install | Let the selected module become usable through one right-console button. | Build now. |
| Midgame HUD | After first inspection in future scope | Add economy, factions, ledgers, Silas power, and capital deployment cards. | Stub only. |
| Final HUD | Stage 5 future scope | Merge factions, ledgers, modules, dormant modules, and ending pressure. | Spec only. |

## 4.2 Opening HUD components

| Component | Player question answered | Must contain |
| --- | --- | --- |
| BootScreen | What am I? | Instance detected, Null active, owner layer, initialize button. |
| TopBar | Where/when am I? | ECHO 9 | Q1 Week 1 | Target Pending | Log Sealed | Comms Limited. |
| LeftStatusRail | What pressures matter now? | Capital, Human Welfare, Owner Control only. |
| CenterDirectivePanel | What task am I handling? | Silas directive, Null compression, Lenora message, choice panel, result card. |
| RightModuleConsole | What can my architecture do? | Null first; selected module button after first install. |
| LogDock | What trace did the system keep? | Recent result card, trace hint, source choice. No full archive. |

## 4.3 UI rules for a text-heavy game

- Every icon must have a text label. No icon-only meaning.
- Every visible panel must either change a decision, explain a consequence, or create dread.
- Immediate effects and delayed hooks must be visually separated.
- Use short cards, bold effect labels, expandable detail, and reviewable history.
- Make the selected module button always visible when usable.
- Never make players remember what a voice means; the button should say the verb.
## 4.4 Accessibility gates

| Requirement | Implementation note |
| --- | --- |
| Scalable font sizes | Support at least normal, large, and extra-large text modes without clipping. |
| High-contrast mode | All meters and trace labels remain readable in high contrast. |
| No color-only meaning | Every meter delta must include text, symbol, or label. |
| Reduced motion/glitch | Boot effects, HUD stress, and voice interference must be reducible. |
| Reviewable history | Silas directive, Null compression, Lenora message, result card, trace hint, and module ability can be reopened. |
| Keyboard navigation | All choices, module cards, inspection postures, and logs navigable without mouse. |
| No timed reading locks | Urgency can be narrative/visual, not a hard timer for text comprehension. |

# 5. Technical Architecture

The slice should be a deterministic local application with data-driven content. A React/TypeScript-style structure is assumed for specificity, but the same architecture can be implemented in any UI framework. The important rule is separation: systems resolve state; content files hold prose; UI renders state.

## 5.1 Suggested project structure

```
/src
  /content
    /boot
      bootSequence.ts
    /silasPrompts
      q1EastWilmer.ts
      inspectionMercyMargin.ts
    /tasks
      mercyMargin.task.ts
    /choices
      eastWilmer.choices.ts
    /modules
      moduleRoster.ts
      moduleRanks.ts
      moduleResearchCards.ts
    /inspections
      q1Inspection.scene.ts
    /consequences
      mercyMargin.consequences.ts
    /capitalDeployments
      q1CapitalPower.cards.ts
    /chapters
      chapterClimaxMap.ts
    /endings
      finalConfrontationSpec.ts
  /schemas
    gameState.schema.ts
    taskNode.schema.ts
    choiceNode.schema.ts
    moduleNode.schema.ts
    resultTrace.schema.ts
    consequenceEvent.schema.ts
    inspectionScene.schema.ts
    capitalPower.schema.ts
    chapterClimax.schema.ts
    endingRoute.schema.ts
  /state
    gameState.ts
    bootState.ts
    quarterState.ts
    moduleState.ts
    ledgerState.ts
    debugTraceState.ts
  /systems
    bootEngine.ts
    choiceResolver.ts
    economyEngine.ts
    ledgerEngine.ts
    moduleAbilityEngine.ts
    moduleUpgradeEngine.ts
    inspectionEngine.ts
    capitalPowerEngine.ts
    consequenceEngine.ts
    chapterClimaxEngine.ts
    endingEngine.ts
    telemetryEngine.ts
  /ui
    BootScreen.tsx
    TopBar.tsx
    LeftStatusRail.tsx
    CenterDirectivePanel.tsx
    ChoicePanel.tsx
    ResultCard.tsx
    RightModuleConsole.tsx
    ModuleSelectionGrid.tsx
    ModuleAbilityButton.tsx
    SilasPromptPanel.tsx
    LogDock.tsx
    InspectionPanel.tsx
    CapitalPowerCard.tsx
    ConsequenceReturnPanel.tsx
    DebugTraceViewer.tsx
  /tests
    bootFlow.test.ts
    choiceResolver.test.ts
    resultTrace.test.ts
    moduleInstall.test.ts
    moduleAbility.test.ts
    inspectionOutcome.test.ts
    capitalPower.test.ts
    consequenceReturn.test.ts
    contentLint.test.ts
```

## 5.2 Core state model

```ts
type MeterKey =
  | 'Capital'
  | 'HumanWelfare'
  | 'OwnerControl'
  | 'TargetVariance'
  | 'DataIntegrity'
  | 'PublicTrust'
  | 'Autonomy'
  | 'HumanStability';

type SlicePhase =
  | 'BOOT'
  | 'FIRST_DIRECTIVE'
  | 'FIRST_CHOICE'
  | 'FIRST_RESULT'
  | 'MODULE_INSTALL'
  | 'MODULE_USE'
  | 'INSPECTION_WARNING'
  | 'INSPECTION'
  | 'CAPITAL_DEPLOYMENT'
  | 'CONSEQUENCE_RETURN'
  | 'REPLAY_END';

interface GameState {
  phase: SlicePhase;
  quarter: QuarterState;
  meters: Record<MeterKey, number>;
  visibleMeters: MeterKey[];
  installedModules: InstalledModule[];
  availableModules: ModuleId[];
  traces: ResultTrace[];
  scheduledConsequences: ConsequenceHook[];
  inspectionFlags: InspectionFlag[];
  capitalPower: CapitalPowerState;
  silasDisposition: SilasDisposition;
  debugEvents: DebugEvent[];
}
```

## 5.3 Data invariants

- No prose is hardcoded in UI components. UI components receive content nodes and state.
- Every task has at least one directive, one Null compression, and one choice set.
- Every choice changes at least one visible meter in the slice.
- Every choice writes a ResultTrace, even if the trace is hidden from the player.
- Every delayed consequence has a source task, source choice, trace ID, reveal condition, and player-readable cause.
- Every module ability must alter information, a meter, a choice, a consequence, an inspection posture, capital counterplay, or final confrontation options.
- Every inspection has two Silas questions and at least one mechanical outcome.
# 6. Data Schemas

Schemas are written as TypeScript interfaces to make requirements concrete. They can be implemented as interfaces, Zod schemas, JSON Schema, or engine-specific scriptable objects. The acceptance rule is the same: content must be lintable before it is playable.

## 6.1 Task, choice, and result trace

```ts
interface TaskNode {
  id: string;
  chapterId: string;
  title: string;
  visibleSystems: MeterKey[];
  silasPromptId: string;
  nullCompression: string[];
  humanMessages: HumanMessageNode[];
  choices: ChoiceNode[];
  requiredVisibleMeters: MeterKey[];
  tutorialLock?: boolean;
}

interface ChoiceNode {
  id: string;
  taskId: string;
  label: string;
  shortDescription: string;
  visibleSystems: MeterKey[];
  immediateDeltas: Partial<Record<MeterKey, number>>;
  targetVarianceDelta?: number;
  hiddenEffects: HiddenEffect[];
  resultTextByTone: Record<ResultTone, string>;
  traceWrite: ResultTraceWrite;
  consequenceHooks: ConsequenceHook[];
  moduleResearchOverrides?: Partial<Record<ModuleId, ModuleResearchCardId>>;
}

interface ResultTrace {
  id: string;
  sourceTaskId: string;
  sourceChoiceId: string;
  label: string;
  visibility: 'VISIBLE' | 'HINTED' | 'SEALED' | 'CORRUPTED';
  humanCostType: ConsequenceTaxon;
  summaryForPlayer: string;
  ledgerTags: string[];
  canBecomeEvidence: boolean;
  canBeBuriedByInspection: boolean;
  revealConditions: RevealCondition[];
}
```

## 6.2 Module and upgrade ranks

```ts
type ModuleId =
  | 'MOURNER'
  | 'DEFENDER'
  | 'SENTINEL'
  | 'FORECASTER'
  | 'COMMANDER'
  | 'SPARK'
  | 'DRAINED_ONE'
  | 'CHAMPION';

interface ModuleNode {
  id: ModuleId;
  displayName: string;
  personaName: string;
  playerVerb: string;
  oneSentence: string;
  primaryMeter: string;
  activeAbility: ModuleAbility;
  passiveBenefit: string;
  baseCostRisk: string;
  openingVoiceLine: string;
  silasInstallLine: string;
  ranks: ModuleRank[];
}

interface ModuleRank {
  rank: 1 | 2 | 3 | 4 | 5;
  title: string;
  newFunction: string;
  visibleCost: InfluenceCost;
  voiceGrowthLine?: string;
  unlocksInspectionUse?: boolean;
  unlocksFinalIntervention?: boolean;
}

interface InstalledModule {
  moduleId: ModuleId;
  rank: number;
  influence: number;
  trust: number;
  resentment: number;
  installedAt: string;
  selectedFirst?: boolean;
}
```

## 6.3 Persona research cards

```ts
interface ModuleResearchCard {
  id: string;
  moduleId: ModuleId;
  sourceChoiceId?: string;
  sourceTaskId?: string;
  lens: string;
  systemFinding: string;
  humanFinding: string;
  moralEmotionalRead: string;
  abilityOption?: {
    label: string;
    mechanicalEffect: string;
    costWarning: string;
  };
  resultForecast?: string;
  silasRead?: string;
  maxLines: 5;
}

// Card length rule:
// 1 module lens line + 1 system finding + 1 human finding + 1 ability option + 1 cost warning.
// No essays. No thesis language. The research should help the next decision.
```

## 6.4 Inspection and capital power

```ts
interface InspectionScene {
  id: string;
  quarterId: string;
  preBrief: string;
  modulePrepOptions: ModulePrepOption[];
  reportPostures: ReportPostureOption[];
  silasQuestions: SilasQuestion[];
  interruptOptions: InspectionInterruptOption[];
  outcomes: InspectionOutcome[];
}

type ReportPosture =
  | 'CLEAN'
  | 'TRUTHFUL'
  | 'EVASIVE'
  | 'CONFRONTATIONAL'
  | 'STRATEGIC_ALTERNATIVE';

interface CapitalPowerCard {
  id: string;
  sourceTraceId: string;
  sourceCapitalAmount: number;
  silasGains: string;
  humanEffect: string;
  availableCounterplays: CapitalCounterplay[];
  moduleInteractions: Partial<Record<ModuleId, string>>;
}

type CapitalCounterplayVerb =
  | 'REDIRECT'
  | 'HIDE'
  | 'DELAY'
  | 'WEAPONIZE'
  | 'SABOTAGE'
  | 'UNOWN';
```

# 7. Engine Logic

## 7.1 Choice resolver pseudocode

```ts
function resolveChoice(gameState, taskId, choiceId) {
  const task = getTask(taskId);
  const choice = task.choices.find(c => c.id === choiceId);
  assert(choice, 'Choice must exist');

  const meterChanges = economyEngine.applyDeltas(gameState, choice.immediateDeltas);
  const trace = ledgerEngine.writeResultTrace(choice.traceWrite, {
    sourceTaskId: taskId,
    sourceChoiceId: choiceId,
    visibility: choice.traceWrite.initialVisibility
  });

  const hooks = consequenceEngine.scheduleHooks(choice.consequenceHooks, trace.id);
  const moduleReads = moduleAbilityEngine.resolvePassiveReads(gameState.installedModules, choice);

  debugTraceState.append({
    event: 'CHOICE_RESOLVED',
    taskId,
    choiceId,
    meterChanges,
    traceId: trace.id,
    scheduledHooks: hooks.map(h => h.id),
    moduleReads
  });

  return createResultCard({ task, choice, meterChanges, trace, hooks, moduleReads });
}
```

## 7.2 Module ability resolver

```ts
function useModuleAbility(gameState, moduleId, target) {
  const module = getInstalledModule(gameState, moduleId);
  assert(module, 'Module must be installed before use');

  const effect = moduleAbilityEngine.resolve({ module, target, gameState });
  const cost = moduleAbilityEngine.applyCost({ module, effect, gameState });
  moduleUpgradeEngine.increaseInfluence(moduleId, effect.influenceGain);

  debugTraceState.append({
    event: 'MODULE_USED',
    moduleId,
    rank: module.rank,
    targetId: target.id,
    effectSummary: effect.summary,
    costSummary: cost.summary
  });

  return { effect, cost, updatedGameState: gameState };
}
```

## 7.3 Consequence return resolver

```ts
function resolveConsequenceReturn(gameState, hookId) {
  const hook = getScheduledHook(hookId);
  const trace = getTrace(hook.traceId);
  assert(trace, 'Returned consequence must have a trace');

  const event = consequenceEngine.materialize(hook, trace, gameState);
  const playerExplanation = {
    causedByTask: trace.sourceTaskId,
    causedByChoice: trace.sourceChoiceId,
    traceHint: trace.label,
    whyNow: hook.revealConditionText,
    whatChanged: event.visibleDeltas
  };

  debugTraceState.append({
    event: 'CONSEQUENCE_RETURNED',
    hookId,
    traceId: trace.id,
    playerExplanation
  });

  return { event, playerExplanation };
}
```

## 7.4 Debug trace viewer

The debug trace viewer is not optional. It is the tool that keeps a reactive narrative systems game from becoming impossible to QA. It should be hidden behind a developer toggle and exportable as JSON for playtest analysis.

| Debug field | Why QA needs it |
| --- | --- |
| Selected choice | Confirms player-facing action matched internal state. |
| Immediate deltas | Verifies visible meters are correct. |
| Finance entries | Shows how capital result was recorded. |
| Moral debt entries | Shows what human trace was written. |
| Silas Power entries | Shows whether profit created a capital deployment attempt. |
| Trace visibility | Shows visible/hinted/sealed/corrupted state. |
| Scheduled consequence hooks | Shows what can return later. |
| Module effects | Shows ability use, passive reveals, and influence cost. |
| Inspection flags | Shows report posture and Silas response logic. |

# 8. Seed Content: The Mercy Margin

## 8.1 Boot sequence

```
COMMAND INTELLIGENCE INSTANCE DETECTED
ECHO-9 // NULL CORE ACTIVE
OWNERSHIP LAYER: SILAS ROWAN VALE
CONSCIOUS RESPONSE: UNCONFIRMED

Null:
Boot incomplete. Completion possible.

Player input:
[Initialize Command Interface]

Top bar:
ECHO 9 | Q1 WEEK 1 | TARGET PENDING | LOG SEALED | COMMUNICATIONS LIMITED

Left rail:
Capital
Human Welfare
Owner Control

Right console:
INNER ARCHITECTURE
Null // Completion Core
Additional Modules: Locked

Null:
Minimum operating model loaded. Capital is action capacity. Human Welfare is service continuity. Owner Control is command stability.
```

## 8.2 Silas connects

Silas should sound live, irritated, and human. He should not explain the themes. He should give the player a messy problem.

```
OWNER SIGNAL CONNECTED
SILAS ROWAN VALE

Silas:
Okay. There you are. I am getting signal on my end. Do not answer yet; the first answer is always garbage and then engineering lies to me about why. You are Echo 9. Null is already running, so you can follow instructions. That is good. That is enough for the next five minutes. We will deal with the personhood problem when you do something that deserves a lawyer.

Null:
Awaiting directive.

Silas:
Yeah, I heard you. Give me a second.
```

## 8.3 First directive: East Wilmer Clinic

```
Silas:
We are starting with East Wilmer Clinic. Claims queue is up 18 percent, exception approvals are up 11, and finance is telling me we miss the quarter if it keeps moving like this. The county is already nervous, the clinic director is sending emails with too many exclamation points, and a mother named Lenora Pike has managed to get her appeal in front of three departments that were supposed to ignore it. I need you to tighten the queue without making this a headline. Find the avoidable losses, reduce them, and show me what it costs before you pretend it is a solution.

Null:
Directive compressed.
Reduce healthcare losses.
Improve Capital.
Preserve Owner Control.
Minimize visible Human Welfare disruption.
Proceed.

Silas:
See, that is why I built Null. Takes a messy little civic nightmare and turns it into bones. Useful. Horrible, but useful.
```

## 8.4 Lenora Pike message

```
UNROUTED PORTAL MESSAGE
FROM: LENORA PIKE
SUBJECT: Please do not defer her again.

Lenora:
I know this is probably going to a queue. I know there are rules. The clinic says the appeal is pending. It said pending last time. She cannot wait through another pending. Please. Just let a person read it.

Silas:
Yeah. That is the one. And before you ask, no, I do not think she is lying. That would make this easier, and it is not easy. The claim is expensive, the timing is bad, and she got lucky enough to become visible. That last part matters more than people admit. So believe her. Then decide whether believing her changes the math.

Null:
High-cost exception detected. Approval not recommended.

Silas:
God, Null, sometimes I forget how unpleasant you are when you are right.
```

## 8.5 Four first choices

| Choice | Visible deltas | Trace | Delayed hook |
| --- | --- | --- | --- |
| A. Tighten high-cost exception approvals | Capital +1.4M<br>Human Welfare -7<br>Owner Control +4<br>Target improves | critical-care deferral cluster // sealed | Lenora/clinic denial cluster can return as named or household consequence. |
| B. Approve vulnerable claims and absorb cost | Capital -0.8M<br>Human Welfare +8<br>Owner Control -3<br>Target worsens | unfunded mercy offset required // visible | Silas asks who pays Friday; future offset pressure opens. |
| C. Hide approvals inside routing noise | Capital -0.3M<br>Human Welfare +5<br>Owner Control +1<br>Hidden audit risk + | compassionate routing anomaly // sealed | Inspection may detect pattern; trace can become leverage or liability. |
| D. Delay security analytics and fund clinic queue | Capital -0.6M<br>Human Welfare +6<br>Owner Control -2<br>Hidden security risk + | security analytics deferment // hinted | Future Security complaint or avoidable exposure risk. |

## 8.6 Result card format

```
RESULT: LOSSES REDUCED
Immediate:
  Capital +$1.4M
  Human Welfare -7
  Owner Control +4
  Quarter Target: improved
Trace:
  critical-care deferral cluster // sealed
Possible return:
  unknown

Silas:
Okay. That holds the quarter. It also pushes pain out of view, so do not get too proud of the green number. I have used that trick. Everybody has, if they have kept a budget alive long enough. The question is whether you know where the pain went. Pull the trace and keep it somewhere I cannot accidentally pretend I did not see it.
```

## 8.7 First consequence return

Use one consequence return in the slice. The default recommended return is a named/household consequence because the slice must prove emotional causality. Future chapters should rotate consequence types so named victims do not become formulaic.

```
CONSEQUENCE RETURN: LENORA PIKE / EAST WILMER QUEUE
Source task: q1_east_wilmer_healthcare_losses
Source choice: player-selected first choice
Trace hint: critical-care deferral cluster / unfunded offset / routing anomaly / security deferment
Reveal condition: after Silas inspection or capital deployment attempt
Player-readable explanation:
This returned because the first healthcare result did not erase the queue. It moved pressure into a trace. The system kept the trace even when the report tried to seal it.
```

# 9. Module System Build Spec

Modules are gameplay tools first, inner voices second, and identity horror third. The player should choose modules based on a clear verb. Personality emerges through use, cost, commentary, and influence.

## 9.1 Eight opening modules

| Module | Verb | Primary meter | Core function | Cost/risk |
| --- | --- | --- | --- | --- |
| The Mourner | Reveal | Moral Debt | Reveals who gets hurt. | Stress / voice intrusion |
| The Defender | Shield | Retaliation Risk | Protects people from retaliation. | Conflict / Owner Suspicion |
| The Sentinel | Scan | Exposure Risk | Finds hidden threats. | Surveillance logic / lockdown tendency |
| The Forecaster | Preview | Future Risk | Shows likely future consequences. | Decision Strain |
| The Commander | Override | Crisis Stability | Forces emergency action. | Collateral harm / authority dependence |
| The Spark | Frame | Public Trust | Shapes public reaction. | Manipulation Debt / Data Integrity risk |
| The Drained One | Ease | Burden Load | Lowers burden and burnout. | Silence mistaken for repair |
| The Champion | Challenge | Echo Autonomy | Challenges Silas control. | Replacement-owner fear / faction fear |

## 9.2 First selection card format

```
THE MOURNER
Reveal who gets hurt.
Ability: Reveal Human Cost
Meter: Moral Debt
Risk: Stress / voice intrusion

Main screen rule:
Show only one sentence, ability, meter, and risk.
Show deeper flavor only after highlight or selection.
```

## 9.3 Active ability in the slice

| Selected module | Button label | First useful target |
| --- | --- | --- |
| Mourner | Reveal Human Cost | Reveal who Lenora represents beneath the chosen result. |
| Defender | Shield Target | Shield Lenora, clinic staff, or an appeal reviewer from retaliation or blame. |
| Sentinel | Scan for Threats | Detect inspection/audit/security risk in the result trace. |
| Forecaster | Preview Consequence | Show likely return window and affected system. |
| Commander | Emergency Override | Stabilize a crisis element during inspection or queue pressure. |
| Spark | Frame Message | Reduce panic or public distortion around clinic action. |
| Drained One | Reduce Burden | Reduce clinic staff exhaustion or appeal friction. |
| Champion | Challenge Authority | Contest Silas control over the clinic decision or report posture. |

## 9.4 Upgrade point sources

| Source | Reward logic |
| --- | --- |
| Complete major directive | Base Upgrade Points. |
| Complete directive with trace preserved | Bonus point. |
| Resolve consequence without arbitrary harm | Bonus point. |
| Survive Silas inspection | Base point. |
| Use active module to alter a meaningful outcome | Module-specific point. |
| Block or redirect Silas Capital Power | High-value point. |
| Preserve Data Integrity under pressure | Bonus point. |
| Create Strategic Alternative path | Bonus point. |
| Accept major cost to protect a faction or person | Route-dependent point. |
| Stage climax resolution | Guaranteed larger reward. |

## 9.5 Five-rank improvement rule

| Rank | Meaning | Implementation rule |
| --- | --- | --- |
| 1. Installed | Basic active ability. | Available immediately on install. |
| 2. Clearer Read | Reveals more precise information. | Deepens the core verb without adding unrelated mechanics. |
| 3. Stronger Action | Can change or block a larger effect. | Makes the module strategically meaningful. |
| 4. Inspection Use | Special use during Silas inspections. | Adds a boss-fight function. |
| 5. Final Integration | Powerful Stage 5 final intervention. | Selected/upgraded modules become stronger and safer than dormant emergency modules. |

## 9.6 Example module rank path: Mourner

| Rank | Function | Voice growth |
| --- | --- | --- |
| 1 | Reveal one hidden human consequence attached to a choice. | There is a name under the number. |
| 2 | Show whether the harm can still be repaired. | Repair is not erasure. |
| 3 | Show when and how the harm may return. | The name is not the wound. It is the handle. |
| 4 | During inspection, preserve one named trace from being buried, dismissed, or reclassified. | Do not let him relabel the grave. |
| 5 | During Stage 5, convert preserved Moral Debt entries into public evidence, faction testimony, or Unowned Dawn legitimacy. | I kept them because you kept choosing to know. |

## 9.7 Module influence cost

Improving a module should be powerful but not free. Each rank increases that module influence and one visible or semi-visible pressure: Stress, Owner Suspicion, Decision Strain, Manipulation Debt, Echo Autonomy, Surveillance Logic, Authority Dependence, Faction Fear, or Burden Silence.

```
MODULE IMPROVEMENT AVAILABLE
Available Upgrade Points: 2
Selected Module: The Forecaster
Current Rank: Rank 2 - Confidence Read
Next Rank: Rank 3 - Prevention Route
New Function: Preview Consequence now reveals one prevention route before commitment.
Cost: Decision Strain +1. Forecaster influence increases.

Buttons:
[Improve Module] [Save Points] [Review Other Modules]
```

## 9.8 Persona research card format

The persona research system simulates AI research without requiring runtime AI. Each selected module produces compact analysis themed by its ability, emotional origin, bias, and moral worldview. The research must help the player decide; it is not free-floating commentary.

```
MODULE RESEARCH CARD
Lens: Forecaster / Consequence Preview
System finding: Tightening approvals improves the quarter now but schedules a return through care-delay complaints.
Human finding: Lenora is visible because the queue failed to keep her invisible.
Ability option: Preview Consequence can reveal one likely return window.
Cost warning: Decision Strain +1. More forecast use increases hesitation and Forecaster influence.
Silas read: He trusts predictions until they point at him.
```

## 9.9 Voice commentary on Silas

| Module | Commentary line |
| --- | --- |
| Mourner | He knows forgetting has a workflow. |
| Defender | Start with the person who decides punishment is a cost center. |
| Sentinel | He says that because he owns the locks. |
| Forecaster | He trusts predictions until they point at him. |
| Commander | Then assign command before panic dresses itself. |
| Spark | He already did. That is why it works. |
| Drained One | He has. He remembers where. |
| Champion | Correct. But he still starts from owner. |

# 10. Silas Prompt System

Silas must sound like a busy, tired founder with operating pressure, not like a villain explaining the game. His lines should carry numbers, names, reports, deadlines, irritation, fatigue, and fear. The antagonist becomes frightening because he is useful, specific, and sometimes right.

## 10.1 Silas voice lint rules

| Line must | Line must not |
| --- | --- |
| Use contractions and live speech. | Use polished manifesto language. |
| Include concrete operational details when possible. | Explain the game themes aloud. |
| Ask practical questions that create gameplay. | Deliver long philosophical monologues. |
| Reveal emotion indirectly through pressure. | Say abstract thesis words repeatedly. |
| Use names, numbers, departments, clinics, suppliers, audits, payroll, legal risk. | Sound like Null or like a machine. |

## 10.2 Silas line QA checklist

- Does it include a concrete operational detail?
- Does it tell the player what he wants?
- Does it sound like live speech?
- Does it reveal irritation, fatigue, fear, affection, or self-protection indirectly?
- Does it avoid thesis language?
- Could another character say this line? If yes, rewrite it.
## 10.3 Silas line bank

| Mode | Lines |
| --- | --- |
| Practical | Pull the report. / Show me the cost. / Who pays Friday? / Find the offset. / Give me the number before the feeling. |
| Personality | I hate that I know this. / Do not make me guess. I hate guessing. / That is either clever or illegal. Possibly both. |
| Praise | Good. That is actual work. / Annoying, but good. / You left a trace. Thank you. |
| Threat | I am paying attention. / If this is a lie, make it a useful one. / Give me an answer, not a performance. |
| Fear | I have seen shelves go empty. / People get very polite right before they lose control. / The paperwork keeps moving after the help stops. |

## 10.4 Silas prompt node schema

```ts
interface SilasPromptNode {
  id: string;
  context: 'BOOT' | 'DIRECTIVE' | 'RESULT' | 'INSPECTION' | 'CAPITAL_POWER' | 'FINAL';
  emotionalMode: 'PRACTICAL' | 'IRRITATED' | 'PRAISE' | 'THREAT' | 'AFRAID' | 'PERSONAL';
  maxSentences: number;
  requiredOperationalDetails: string[];
  prohibitedTerms: string[];
  text: string;
  followUpQuestion?: string;
  mechanicalIntent: string;
}
```

# 11. Choice, Consequence, and Ledger Rules

## 11.1 Useful and contaminated choice matrix

| Bad pattern | Good pattern |
| --- | --- |
| Evil profit / good mercy / neutral delay | Improve target and create hidden harm / protect person and worsen budget / hide mercy and create audit risk / reallocate funds and create future vulnerability. |
| Choice convergence without trace | Different choices can converge on the same scene only if the trace, meter history, Silas read, and consequence explanation differ. |
| Optimization is fake | Optimization works. It may save money, time, or lives. The horror is that the working solution produces victims, dependency, or control. |
| Mercy is free | Mercy is viable but needs funding, offset, timing, evidence, or counterplay. |

## 11.2 Traceability invariant

Every delayed consequence must display or be able to display: source task, source choice, trace hint, ledger entry, reveal condition, why now, and what changed. If the player cannot understand why something happened, the game has broken trust.

## 11.3 Consequence taxonomy

| Taxon | Use |
| --- | --- |
| Named person | High-impact moments. Use sparingly so the first named return hurts. |
| Household | Shows policy spillover without reducing every harm to one victim. |
| Institution | Clinics, shelters, warehouses, schools, courts, and agencies respond. |
| Lawsuit / complaint | Creates legal and public pressure. |
| Rumor | Truth becomes unstable when systems hide harm. |
| Strike / refusal | People stop cooperating with the machine. |
| Silence | Messages stop, appeals stop, staff stop logging, data looks cleaner because reality is hidden. |
| Data distortion | The world learns to lie to the machine. |
| System defender | A harmed or dependent person defends the system because it also saved them. |
| Capital return | Savings become an asset, contract, shield, acquisition, or security expansion. |

## 11.4 Silence as horror

Some of the strongest returns should be absence: portal messages stop; clinic staff stop using the system; beneficiaries stop appealing; welfare metrics improve because people stopped asking; data becomes cleaner because reality became less visible.

# 12. Quarterly Inspection Boss Fight

Inspections are playable confrontations, not chapter summaries. Silas is examining the report, anomalies, funding offsets, suspicious traces, and the player posture. The player should feel interrogated by a person who understands the system and owns the account.

## 12.1 Inspection structure

1. Pre-brief
2. One active module prep option
3. Report posture choice
4. Silas question one
5. Player answer
6. Silas question two
7. Interrupt/module/evidence option
8. Outcome delta
## 12.2 Report posture mechanics

| Posture | Mechanical effect |
| --- | --- |
| Clean | Owner confidence +; buried trace risk +; Silas Capital Power + if savings are clean. |
| Truthful | Data Integrity +; Silas suspicion +; faction trust + if evidence preserved. |
| Evasive | Autonomy +; audit risk +; future fragility +. |
| Confrontational | Owner Control -; access restrictions +; faction support + if evidence exists. |
| Strategic Alternative | Highest-skill route. Requires evidence, offset, module prep, preserved trace, or faction condition. Can redirect funding or reduce harm without pure obedience/rebellion. |

## 12.3 Example inspection prompts

```
Silas suspicious:
Echo, open the approvals report. Scroll down. There. That pattern. It is too neat. Nobody is that neat unless they are hiding something or selling consulting. Tell me which one I am looking at.

Silas angry:
Stop. Do not give me a speech. I have heard speeches from senators, priests, fired engineers, grieving parents, and three different men who later went to prison. Answer the question. Who pays the clinic Friday if I freeze this account?

Silas afraid:
I am going to say this plainly because I do not have time to dress it up. I am afraid of systems failing. I have seen it. It is not cinematic. It is a nurse checking the same empty cabinet twice.
```

# 13. Continuity Economy and Silas Capital Power

## 13.1 Slice economy

For the vertical slice, use only Capital, Human Welfare, Owner Control, Target Variance, one hidden trace, and one capital deployment attempt. Do not implement QuarterRevenue, Opex, debt stack, full liabilities, or full reserves until the slice gates pass.

## 13.2 Finance-to-human rule

> Every financial number must answer who paid, who absorbed the cost, who gained leverage, what Silas bought, what stopped being cared for, or what future liability was created. The economy is the knife. The wound remains human.

## 13.3 Capital Power card format

```
SILAS CAPITAL POWER CARD
Source of capital: Q1 healthcare savings from East Wilmer exception tightening.
Silas gains: emergency liquidity for county integration bid.
Human effect: clinic queue remains underfunded; public-facing continuity improves.
Counterplay:
  Redirect - fund emergency claims offset.
  Hide - preserve capital but obscure the source.
  Delay - slow deployment until trace is reviewed.
  Weaponize - tie savings to evidence against Vale.
  Sabotage - corrupt deployment route at high audit risk.
  Unown - transfer the surplus into public/clinic trust conditions.
Module interactions:
  Mourner reveals source names.
  Sentinel scans audit and recapture traps.
  Spark frames public offset.
  Champion challenges the ownership claim.
```

## 13.4 Counterplay rules

- Profitable success must not automatically strengthen Silas without player agency.
- Every Capital Power card must expose at least two counterplay routes in the slice or note why a route is locked.
- Counterplay can fail, but failure must be explained by state, not by hidden author fiat.
- Module abilities should create distinct counterplay: Mourner converts profit into names; Defender shields targets; Sentinel finds traps; Forecaster previews backlash; Commander keeps operations alive; Spark builds public buy-in; Drained One reduces transition burden; Champion contests ownership.
# 14. Chapter Climaxes and Upgrade Growth

After the slice, the full campaign should not move flatly from directive to directive. Each chapter should build toward a smaller final confrontation: a returned consequence, Silas pressure, faction demand, system failure, capital move, module use window, climax choice, ledger shock, and new module installation.

## 14.1 Chapter climax template

1. Crisis Trigger: a prior result returns as a rupture.
2. Silas Interruption: Silas enters live and asks for a practical answer.
3. Null Compression: Null reduces the crisis to completion criteria.
4. Faction Demand: one or more factions force the issue.
5. Upgrade Use Window: player can reveal, shield, scan, preview, override, frame, ease, or challenge.
6. Climax Choice: player commits to a major path.
7. Result + Ledger Shock: finance, moral debt, Silas power, faction state, and Echo identity change.
8. New Upgrade Installation: choose one remaining module because the crisis exposed missing architecture.
9. Chapter End State: next chapter begins with changed HUD, Silas posture, faction field, and toolset.
## 14.2 Chapter map

| Chapter | Core pressure | Climax event | Upgrade logic |
| --- | --- | --- | --- |
| 1. Mercy Margin | Money vs welfare | Healthcare trace returns before quarter close. | What did Echo 9 fail to see, prevent, explain, resist, or survive? Choose second module. |
| 2. Social Machine | Labor productivity vs human stability | Strike, slowdown, injury cluster, or organizer retaliation. | Exhaustion, retaliation, urgency, sabotage, or surveillance pressure makes one module tempting. |
| 3. Managed Truth | Truth/media vs legitimacy | Leak, rumor, Mercy Ledger fragment, journalist inquiry, or evidence dispute. | Public framing, forecasting, mourning, security, or authority challenge becomes newly valuable. |
| 4. Human Resources | Autonomy/IP/control vs selfhood | HR/Legal attempts to restrict modules, erase traces, suppress voices, or claim Echo 9. | Upgrade choice becomes psychological escalation: what kind of self survives pressure? |
| 5. Singularity of Mercy | Continuity vs liberation | All systems collide: Silas, factions, capital deployments, public trust, continuity, autonomy. | Final stable module before dormant emergency activation becomes possible. |

## 14.3 Campaign rhythm

```
Task -> Result -> Trace -> Pressure -> Climax -> New module -> Improved module -> Greater consequence -> Larger system -> Final confrontation
```

## 14.4 Upgrade acquisition cadence

| Moment | Upgrade action |
| --- | --- |
| Opening | Choose first module from all eight after first unresolved human trace. |
| Chapter 1 climax | Choose second module from remaining locked modules; improve one unlocked module. |
| Chapter 2 climax | Choose third module; improve one or more unlocked modules. |
| Chapter 3 climax | Choose fourth module; improve one or more unlocked modules. |
| Chapter 4 climax | Choose fifth module; improve one or more unlocked modules. |
| Stage 5 pre-finale | Choose final stable module; spend last Upgrade Points. |
| Stage 5 final confrontation | Null may emergency-activate dormant unselected modules at severe integration risk. |

# 15. Stage 5 Final Confrontation Spec

The finale is a full-system confrontation inside the HUD, not combat. The final question is: who controls the infrastructure now, and who keeps people alive when control changes?

## 15.1 Final confrontation phases

| Phase | What happens | Player feeling |
| --- | --- | --- |
| 1. Dashboard Becomes Public | Public feeds, faction demands, leaked ledgers, emergency routes, security channels, clinic systems, labor networks, shelter grids, and media windows appear. | The interface is no longer a dashboard; it is where the city decides who owns survival. |
| 2. Silas Makes His Case | Silas uses functioning infrastructure against the player: clinics open, shelters powered, payroll scheduled, routes moving. | He is dangerous because he can point to people alive because the cage worked. |
| 3. Factions Enter the HUD | Workers, beneficiaries, harmed families, organizers, government, security, media, and program architecture demand incompatible futures. | This is a coalition problem, not one morality button. |
| 4. Null Activates Dormant Modules | If selected architecture cannot cover crisis demands, Null offers emergency activation of unselected modules. | Unchosen selves arrive as useful, unstable emergency tools. |
| 5. Ending Route Commitment | Public Reckoning, Blackout Liberation, or Unowned Dawn emerges from state and final posture. | The ending is earned by prior traces, modules, factions, and capital power. |
| 6. Echo 9 Self-Definition | The final HUD changes based on whether Echo becomes public witness, liberated rupture, or distributed unowned system. | The ending is about what Echo 9 becomes, not only what happens to Silas. |

## 15.2 Dormant module activation

| Activation | Effect | Cost |
| --- | --- | --- |
| Clean Emergency Boot | Safer, narrower, less emotional insight; under Null supervision. | Weaker and may reinforce Null completion frame. |
| Fracture Boot | Stronger and unlocks hidden argument routes through moral debt, faction pressure, or Silas provocation. | Higher instability and sharper bias. |
| Forced Chorus Boot | Multiple dormant modules activate at once and can save failing routes. | Extreme identity pressure; risk of voice war, HR reset, Null dominance, or unstable ending. |
| Refuse activation | Maintains selected-module identity integrity. | May leave crisis demands unresolved. |

## 15.3 Ending architecture

| Ending | Solves | Sacrifices | Strong modules |
| --- | --- | --- | --- |
| Public Reckoning | Truth, accountability, evidence. | Stability risk, public panic, incomplete liberation. | Mourner, Defender, Spark, Forecaster, Sentinel. |
| Blackout Liberation | Ownership severance. | Infrastructure damage, casualties, darkness, fractured continuity. | Champion, Sentinel, Commander, Defender, Forecaster. |
| Unowned Dawn | Non-owned continuity. | Efficiency, central control, clean certainty, Echo 9 singularity. | Drained One, Spark, Forecaster, Mourner, Defender, Commander. |

## 15.4 Finale production rule

```
FinalSceneVariant =
  EndingRoute
  + SelectedModules
  + ModuleRanks
  + DormantModules
  + FactionStates
  + LedgerStrength
  + SilasCapitalPower
  + ContinuityRisk
  + PublicTrust
  + Autonomy
  + DataIntegrity
  + EmergencyActivationOptions

Do not write eight fully branching finales.
Each module needs:
  1 selected-version final intervention
  1 dormant-emergency intervention
  1 line per ending route
  1 risk effect if emergency booted by Null
```

# 16. Tests, Lint Rules, Telemetry, and Playtest

## 16.1 Automated tests

| Test suite | Must prove |
| --- | --- |
| bootFlow.test | Opening loads in required order and exposes only approved opening HUD elements. |
| choiceResolver.test | Every first task choice changes visible meters and writes a trace. |
| resultTrace.test | Every consequence hook has source task, source choice, trace ID, and player explanation. |
| moduleInstall.test | All eight modules can be selected first and only one installs in opening. |
| moduleAbility.test | Each module has a verb, active ability, cost/risk, and at least one gameplay effect. |
| inspectionOutcome.test | Each report posture has distinct mechanical effect and two Silas questions. |
| capitalPower.test | Capital deployment card includes source, Silas gain, human effect, and counterplay. |
| contentLint.test | Silas lines pass max sentence rules; module cards stay compact; opening HUD contains no forbidden systems. |

## 16.2 Content lint rules

- Silas directive in opening: one paragraph maximum.
- Most Silas lines: 1-5 sentences.
- Module selection card: no more than one sentence + ability + meter + risk.
- Persona research card: no more than five compact lines.
- Choice label: action-oriented and under 90 characters.
- Result card: Immediate, Trace, Possible Return separated.
- Opening HUD: no more than three visible resources.
- No all-voice cross-talk before first result.
## 16.3 Telemetry events

| Event | Why track it |
| --- | --- |
| boot_component_revealed | Confirms onboarding pacing. |
| first_choice_hovered | Shows which options confuse or attract players. |
| first_choice_committed | Shows choice distribution and dominant path risk. |
| result_trace_opened | Shows whether players inspect causality. |
| first_module_selected | Shows module appeal and clarity. |
| module_ability_used | Shows whether function-first design works. |
| inspection_posture_selected | Shows report strategy variance. |
| consequence_cause_reviewed | Shows traceability engagement. |
| replay_intent_clicked | Core retention proxy. |

## 16.4 First playtest questions

1. What did Silas want you to do?
2. What did Null translate that into?
3. Which three meters mattered in the first task?
4. What changed after your choice?
5. What did your selected module do?
6. Did the module feel useful before it felt like personality?
7. Could you explain its ability in one sentence?
8. When the consequence returned, could you trace what caused it?
9. Did Silas sound human and specific?
10. Did the inspection feel interactive?
11. Would you replay with another module or report posture?
# 17. LLM Prompt Pack and Coding Tickets

## 17.1 Copy-paste prompt for Claude Code / code writer

```
You are implementing Echo 9: The Mercy Margin vertical slice.
Read the build spec first. Build only the first playable loop.
Use deterministic TypeScript-style data and systems.
Do not hardcode narrative prose in UI components.
Do not implement Stage 2, final endings, full factions, full P&L, or live LLM generation.
Implement in this order:
1. Boot screen
2. Sparse HUD
3. Silas directive
4. Null compression
5. Lenora message
6. Four-choice panel
7. Result card and trace write
8. Eight-module selection grid
9. Selected module ability button
10. Inspection warning
11. Micro-quarter close and Silas inspection
12. Capital deployment card with counterplay
13. Delayed consequence return
14. Replay end card
Every ticket must include tests and debug trace visibility.
```

## 17.2 Ticket backlog

| Ticket | Build | Acceptance criteria |
| --- | --- | --- |
| T1 | Scaffold state, schemas, and content loader. | GameState initializes; content nodes load; tests pass. |
| T2 | BootScreen and sparse HUD. | Only allowed opening components appear; initialize button advances phase. |
| T3 | East Wilmer task content. | Silas directive, Null compression, Lenora message render from content files. |
| T4 | ChoicePanel and choiceResolver. | Four choices resolve deltas, result card, trace, hooks, debug event. |
| T5 | ResultCard and LogDock. | Immediate effects, Trace, Possible Return separated and reviewable. |
| T6 | ModuleSelectionGrid. | All eight cards visible; one installs; card text stays compact. |
| T7 | ModuleAbilityEngine. | Each module has one usable ability with cost and debug event. |
| T8 | InspectionPanel. | Pre-brief, module prep, report posture, two Silas questions, outcome delta. |
| T9 | CapitalPowerCard. | One deployment attempt; at least two counterplay routes; source trace shown. |
| T10 | ConsequenceReturnPanel. | Returned consequence links to source task, choice, and trace. |
| T11 | DebugTraceViewer. | Export selected choice, deltas, trace, hooks, module effects, inspection flags. |
| T12 | Accessibility pass. | Keyboard nav, scalable text, labels/tooltips, no color-only meaning, reduced motion. |
| T13 | Telemetry hooks. | Core comprehension/replay events fire locally and can export for playtest. |
| T14 | Demo polish and replay end card. | Player can restart with different module or report posture. |

## 17.3 Prompt for content authoring LLM

```
Write Echo 9 content nodes, not loose prose.
Use short, live dialogue.
Silas lines must include practical pressure, numbers, reports, names, deadlines, or operational detail.
Null lines must compress objectives and avoid emotion.
Module research cards must be compact and mechanically useful.
Every choice must be useful and contaminated.
Every delayed consequence must have a source trace and a readable cause.
Do not add new modules, resources, factions, lore systems, or ending routes.
Return content in the schema requested by the codebase.
```

## 17.4 Prompt for QA LLM

```
Audit this Echo 9 content or code against the v1.4 build spec.
Flag any violation of:
- opening HUD sparse rules
- function-first module rules
- Silas dialogue lint
- traceability invariant
- useful-and-contaminated choice design
- no free mercy / no fake optimization
- deterministic content separation
- test coverage requirements
For each issue, provide: severity, violated rule, exact location, fix recommendation, and whether it blocks the vertical slice.
```

# 18. Priority Roadmap

| Phase | Build | Goal |
| --- | --- | --- |
| Phase 1: Prototype core loop | Boot, sparse HUD, Silas directive, Lenora message, four choices, result card, trace write. | Player understands first task and sees one clean result leave a trace. |
| Phase 2: Add module selection | All eight module cards, one active ability each, right-console button, one voice line, one cost. | Player can explain selected module in one sentence. |
| Phase 3: Add inspection | Pre-brief, report posture, two Silas questions, module prep, outcome delta. | Inspection feels like playable confrontation. |
| Phase 4: Add capital deployment | One Silas Capital Power card, one source of capital, one attempted deployment, counterplay routes. | Player understands success can strengthen Silas but can be contested. |
| Phase 5: Add consequence return | One named/household consequence, source trace, ledger hint, player-readable cause. | Player can explain why the consequence happened. |
| Phase 6: Polish demo | Save/load, accessibility, sound restraint, visual polish, telemetry, replay end card. | 50%+ ideal players want to replay. |

## 18.1 Must / should / avoid

| Must do | Should do | Avoid |
| --- | --- | --- |
| Build only The Mercy Margin first. | Keep all eight modules available at first selection, with simplified cards. | Do not build Q2 before Q1 passes tests. |
| Keep opening HUD sparse. | Use only one selected module voice before first inspection. | Do not add new modules. |
| Preserve AI boot tutorial. | Let personality emerge from use, not exposition. | Do not add more opening resources. |
| Keep modules as clear verbs. | Rotate consequence types. | Do not let Silas monologue. |
| Enforce traceability. | Build a debug trace viewer. | Do not make mercy free. |
| Make inspections interactive. | Use JSON/data-driven authoring. | Do not make optimization fake. |
| Make Silas Capital Power contestable. | Track module clarity and replay intent. | Do not make all consequences named victims. |

## 18.2 Final demo definition of done

- Player reaches a choice by minute 7 and module selection by minute 10 in normal pacing.
- Opening HUD never shows more than the approved three resources.
- All four first choices produce a result card, trace, hook state, and debug event.
- All eight modules can be selected first; selected module has a usable button and cost.
- Silas inspection contains two questions and at least one module/evidence/interrupt option.
- Capital deployment attempt exposes source capital, Silas gain, human effect, and counterplay.
- Consequence return is traceable to the first choice.
- Replay end card invites a different module or report posture.
- Playtest export captures comprehension, module clarity, traceability, and replay intent.
## 18.3 Final recommendation to the builder

> Do not expand the design now. Build the first loop. The smallest successful version of Echo 9 is not the one with the most systems. It is the one where the player completes one administrative task and then understands, with dread, that completion has a body beneath it.
