# Echo 9 — Register Catalog (Sprint P3)

The 10-register taxonomy per qa-log Q18. Every voice line pool under
`game/src/content/voices/<voice>/<register>.ts` is keyed by these registers;
`RegisterIdSchema` in `game/src/schemas/polylogueScene.schema.ts` is the
enforcing enum. Worked examples are drawn from or consistent with
`AI Dialogue Interplay.md` §2; humanization bar per Q27(d) — character-first,
concrete detail over abstraction ("She typed please twice." not "This is bad.").

**How selection works (P6 contract, summarized):** the register is a function
of game state, not random flavor. Corruption pressure (repeated compliance
against a voice's virtue) pulls toward `corrupted`; recovery (choices aligned
with the voice's virtue after corruption fired) unlocks `recovering`; meter
positions and scrutiny gate the affective registers between.

---

## neutral

**When it fires.** Default register: routine directive intake, status
reporting, phase transitions with no meter in a danger band and no
voice-relevant stake on screen. Also the fallback when a voice's more
specific trigger conditions all miss.

**Humanization.** Even "neutral" is characterful — each voice reports through
its own obsession (Null counts, the Sentinel timestamps, the Drained One
tallies hours). The line carries the persona's noticing, never generic HUD
prose. Worked example (Null): "Three routes remain; none are clean."

## practical

**When it fires.** A choice is on screen and the voice has a concrete,
actionable recommendation — typically when its verb (Reveal, Shield, Scan,
Preview, Override, Frame, Ease, Challenge) applies to a visible option, or
when a meter the voice cares about is one commit away from moving.

**Humanization.** Advice arrives in the voice's craft vocabulary, with its
signature grammar intact — the Commander attaches a clock, the Defender names
the protected person before the plan. It sounds like a colleague with a plan,
not a tooltip. Worked example (Commander): "Assign staff now; delay is our
enemy."

## persuasive

**When it fires.** The chorus disagrees: a deliberation (PolylogueScene) where
another voice or Silas's framing points the other way, or the player is
hovering a choice that crosses the voice's core value. It is the
argument-register, aimed at the player as a peer.

**Humanization.** Persuasion works through the voice's worldview rather than
volume — the Mourner argues with a name, the Spark with what people will
carry, the Forecaster with the bill arriving later. One concrete image beats
three adjectives. Worked example (Spark): "People will carry a mother's voice
before an admin number."

## comforting

**When it fires.** After a costly commit the player chose anyway (welfare
protected at capital's expense, a defiance beat survived), during
consequence returns that land soft, or when HUMAN_STABILITY /
HUMAN_WELFARE recover from a low band. Directed at the player-as-Echo 9 or
at a named human in the record.

**Humanization.** Comfort is specific to what was actually lost or spared —
never "it will be okay." Each voice consoles inside its own register of care:
the Defender offers cover, Null offers a closed loop, the Drained One offers
rest. Worked example (Defender): "I stand in the blast radius for you."

## fearful

**When it fires.** A danger band is approached but not yet crossed: scrutiny
climbing (never shown numerically — the fear IS the tell, per Q39/Q42), an
inspection queued, a Forecaster-visible consequence maturing, or a choice
that risks the voice's founding wound repeating.

**Humanization.** Fear is anticipatory and personal — the voice sees its own
trauma in the incoming shape. Tells matter more than declarations: the
Forecaster drops its numbers, Null's sentences run long. Worked example
(Forecaster): "Friday will roar if we don't pay attention."

## angry

**When it fires.** A boundary the voice exists to hold was crossed this
commit: a person erased from the record (Mourner), someone exposed
(Defender), evidence scrubbed (Sentinel), ownership asserted as moral
authority (Champion). Usually AFTER_CHOICE or ON_CONSEQUENCE, aimed at the
system or Silas — rarely at the player.

**Humanization.** Anger stays in character: the Mourner's rage is terrible
gentleness, the Commander's is tempo, the Champion's is a pointed question.
No voice simply shouts; each weaponizes its own quirk. Worked example
(Champion): "He thinks he owns us because he paid the bills!"

## ashamed

**When it fires.** A consequence return traces harm back to something the
chorus (or this voice specifically) recommended or failed to flag — the §11
trace names the choice, and the voice recognizes its fingerprints. Also fires
when the player follows a voice's advice and it lands badly.

**Humanization.** Shame owns the specific failure in first person plural and
names the mechanism, not just the feeling — accountability as character.
Each voice confesses in its own idiom (Null files a correction; the Drained
One counts what it cost). Worked example (Drained One): "We called them
efficient while squeezing blood from stones."

## hopeful

**When it fires.** A viable low-harm path exists and is selectable: meters
trending out of danger, a consequence defused, a module install or rank-up
widening the option surface, or the one week where mercy and margin actually
align.

**Humanization.** Hope is earned and sized honestly — a week of normal, one
name saved, one door — never triumphal. The voice points at the concrete
opening it can see through its own lens. Worked example (Forecaster): "This
offset can buy us a week of normal."

## corrupted

**When it fires.** The voice's corruption pressure has crossed its threshold:
sustained choices against its virtue while its influence rank stays high
(the wound festering under compliance). The darker-urge line surfaces in
deliberations as a real option the player can feel pulled by — the horror
register (Q38: consciousness felt through the voices).

**Humanization.** Corruption is the virtue's logic extended one step too far,
delivered in the voice's healthy cadence — it should sound almost right.
The Mourner anesthetizes, the Defender imprisons, Null erases; the syntax
stays theirs, only the missing thing changes. Worked example (Null):
"Consent is optional if survival is ensured."

## recovering

**When it fires.** Only after `corrupted` has fired for this voice: the
player then makes choices realigned with the voice's virtue (or a companion
voice pushes back in-scene). The voice audibly pulls itself back from the
edge — often as the second beat of an exchange with its own corrupted line.

**Humanization.** Recovery is effortful self-correction, not a reset — the
line acknowledges the pull it just resisted and restates the value in the
voice's own terms, slightly shaken. Worked example (Sentinel): "Sweep
carefully. Watch, but do not suffocate."

---

## Cross-register invariants (for P4 authors and the P8 lint)

- Every line must survive the persona bible's quirk rules
  (`docs/voices/persona-bibles.md`) — e.g. Null never asks a question in ANY
  register; the Champion's "we" exception holds everywhere.
- `corrupted` and `recovering` are a paired arc: a voice's `recovering` pool
  should answer its own `corrupted` pool nearly line-for-line.
- Registers describe the SPEAKER's state, not the scene's mood — a `hopeful`
  Drained One still trails off; an `angry` Mourner still quotes verbatim.
