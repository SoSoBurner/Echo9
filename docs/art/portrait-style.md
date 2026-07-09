# Portrait Style Guide

> **Scope.** How every character portrait in Echo9 is generated. Owns the visual identity of Silas, Null, and the 8 upgrade-module voices displayed in the InnerChorusPanel and the right rail. Read this before adding a subject, before tuning descriptors, and before regenerating a portrait that already looks fine — a fresh call costs money and drift is not free.

## The one contract: prefix + accent + descriptor

Every prompt sent to the OpenAI Images API is composed as:

```
${STYLE_PREFIX} ${accentSentence} ${subject.descriptor}
```

- **`STYLE_PREFIX`** — a long, locked paragraph that defines the shared rendering vocabulary (cyberpunk HUD ambient, dark background, muted noir palette, grainy CRT texture, bust framing, muted lighting from below-left, 1:1 composition). It never changes per-subject. It sits in `game/scripts/portraits.config.mjs`.
- **`accentSentence`** — one sentence injected by the script that pins the face-accent color to a specific hex. The subject picks an accent *key* (`silas`, `null`, `neutral`); the config maps that key to a hex; the script writes `Face accent color is exactly #D97757.` (or whichever) into the prompt. This keeps color discipline out of descriptor prose, where drift is easiest.
- **`subject.descriptor`** — the ~1–2 sentence, subject-specific vocabulary that makes this portrait *this character*. Silas gets warmth cues and a lopsided smirk; Null gets frost and stillness; a module gets its symbolic prop and posture.

The whole point is that any two portraits, generated months apart, still read as members of the same set when placed side-by-side in the InnerChorusPanel row. Consistency comes from the prefix; identity comes from the descriptor; color signal comes from the accent.

## Writing a good descriptor

1. **Do not repeat what the prefix already said.** If the prefix already specifies "head-and-shoulders framing," do not write "chest-up bust." Redundant instructions confuse the model and burn tokens; contradictory instructions make the model pick one at random.
2. **Do not specify color unless it is diegetic to the character.** The accent slot handles the face-color signal. If Null has icy pupils, that's descriptor material because it's *about the character*, not *about the palette*. Descriptor color drift is the #1 way portraits lose set-cohesion.
3. **Lead with the human silhouette, then the mood, then the token prop.** e.g. `"a wiry man in his early 40s, half-smile with worry lines, tie loose, holding a folded newspaper against his chest."` The model composes from the top down.
4. **One or two sentences, max.** Long descriptors invite drift. If a subject needs more than two sentences, the concept is not yet load-bearing — go back and sharpen it.
5. **Never break the fourth wall.** No "for a game about," no "in the style of," no "portrait of." Portraits are diegetic: the player is looking at what the HUD is rendering, not at a marketing asset.

## Accent keys and hex values

| Key       | Hex       | Used by                                    |
|-----------|-----------|--------------------------------------------|
| `silas`   | `#D97757` | Silas (warm accent — approachable rapport) |
| `null`    | `#7FB3D5` | Null (cool accent — analytical distance)   |
| `neutral` | `#A8A39A` | The 8 upgrade modules (character-agnostic) |

These are kept in sync with `src/ui/tokens/palette.ts` at generation time. Palette-token changes made *after* a portrait is generated do not update the portrait — the accent color is baked into the PNG. If the palette shifts, portraits must be regenerated.

## Adding a subject: the workflow

1. **Pick an id (kebab-case).** It becomes the filename and the HUD mount reference.
2. **Write the descriptor.** Follow the rules above. Read it back next to `STYLE_PREFIX` — does it complement or fight the prefix?
3. **Pick an accent key.** Warm for allied/human, cool for cold/analytical, neutral for module-abstract.
4. **Dry-run first.** `node scripts/generate-portraits.mjs --only <id> --dry-run`. This prints the full composed prompt. Read it word-by-word. Fix the descriptor. Repeat until the printed prompt reads like a single coherent instruction, not a bag of clauses.
5. **Only then call the API.** `OPENAI_API_KEY=sk-... node scripts/generate-portraits.mjs --only <id>`. One call per iteration. If the first render is wrong, do not retry blindly — tune the descriptor and dry-run again before spending a second call.
6. **Mount in the HUD in the same commit** that adds the subject. Otherwise the roster and the config drift silently.

## Why this discipline

Portraits are the highest-per-asset cost in the project — every miss is real money spent — and they are also the loudest visual element on screen. A single off-brand portrait breaks the "same set" illusion for the entire roster. The prefix + accent + descriptor split is designed so that: (a) new authors cannot accidentally break the palette or framing invariants, because those live in the prefix; (b) authors *can* iterate freely on the descriptor without needing to think about global cohesion; (c) any drift is inspectable in dry-run before an API call happens.

Do not "improve" the STYLE_PREFIX to fix one portrait. If one subject is off, the descriptor is off — that's what iteration is for. Only touch the prefix if the *entire set* is drifting, and only after conferring in-conversation.

## Persona map (portraits as-shipped, V2 → V4)

The roster below records the gender presentation of every portrait currently on disk under `game/src/assets/portraits/`. This is the reference to preserve when regenerating a subject or adding a new character — swapping a masculine portrait for a feminine one on the same id would shift how the player reads the roster's balance. If a regen intentionally changes presentation, update the table in the same commit.

| Portrait id            | File name                       | Presentation | Style tier            | Notes                                                                 |
|------------------------|---------------------------------|--------------|-----------------------|-----------------------------------------------------------------------|
| `silas`                | `silas.png`                     | Masculine    | Photorealistic        | Owner-operator; only human character rendered photoreal — sets him apart from the AI voices. Salt-and-pepper hair, mid-40s, warm accent (`#D97757`). |
| `null`                 | `null.png`                      | Androgynous  | Digital wireframe     | Presented as an abstract AI — features lean feminine but the halo/wireframe framing reads as non-human. Cool accent (`#7FB3D5`).                    |
| `module-mourner`       | `module-mourner.png`            | Feminine     | Stylized digital      | Long flowing hair, purple tears — the grief module's iconography.                                                                                    |
| `module-defender`      | `module-defender.png`           | Masculine    | Stylized digital      | Angular jaw, spiky hair, blue-flame silhouette; shield glyph anchors the torso.                                                                       |
| `module-sentinel`      | `module-sentinel.png`           | Masculine    | Stylized digital      | Structured features, targeting reticle halo, muted-blue palette.                                                                                      |
| `module-forecaster`    | `module-forecaster.png`         | Feminine     | Stylized digital      | Constellation halo, upward gaze, ghosted profile echo — the "reads ahead" pose.                                                                       |
| `module-commander`     | `module-commander.png`          | Masculine    | Stylized digital      | Broad shoulders, glowing eyes, red warning glyphs — the override module's authority cues.                                                             |
| `module-spark`         | `module-spark.png`              | Feminine     | Stylized digital      | Magenta-pink accent (the only warm-toned module), waveform iconography — the "ignition" module.                                                       |
| `module-drained_one`   | `module-drained_one.png`        | Feminine     | Stylized digital      | Long hair, downcast eyes, weary posture — the "exhausted" register the module's name promises.                                                        |
| `module-champion`      | `module-champion.png`           | Masculine    | Stylized digital      | Sword/spear iconography, upward light, halo — the "advocate" pose.                                                                                    |

**Roster balance (as-shipped V2/V3/V4):**
- **Masculine:** 5 — Silas, Defender, Sentinel, Commander, Champion
- **Feminine:** 4 — Mourner, Forecaster, Spark, Drained One
- **Androgynous:** 1 — Null

**Style-tier rule:** Silas is the only photorealistic portrait — he's the human counterpart the player answers to. Every other portrait is stylized digital (wireframe silhouette + accent glow + character prop), which reads as "the module is a construct, Silas is a person." Never regenerate Silas in the stylized tier or a module in the photoreal tier without discussing first — the tier split does load-bearing narrative work.

**When regenerating:** preserve presentation + style tier unless the descriptor change is explicitly about them. Update this table in the same commit as the file replacement.
