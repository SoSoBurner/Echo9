# V2/V3/V4 — Portraits landed (sprint-end analysis)

**Sprints collapsed:** V2 (Silas) + V3 (Null) + V4 (8 module upgrades)
**Capture:** `game/test-results/v2-portraits/*.png`
**Trinity:** `tsc -b` green · `oxlint` green (pre-existing vite.config triple-slash warning only) · `vitest run` 632/632 green

---

## What shipped

- 10 PNG portraits landed under `game/src/assets/portraits/`:
  - `silas.png` (V2), `null.png` (V3), 8 × `module-<id>.png` (V4)
- Filenames match the closed `PORTRAIT_IDS` union in `game/src/ui/portraits/portraitRegistry.ts` — no code change needed. Vite's `import.meta.glob('../../assets/portraits/*.{png,webp}')` picks them up at build time. `getPortraitUrl(id)` now returns real URLs instead of `undefined`, and `PortraitSlot` swaps from silhouette placeholder to `<img>` automatically.
- `docs/art/portrait-style.md` gained a persona map documenting the gender presentation + style tier of every shipped portrait, so future regens preserve the roster balance (5M / 4F / 1 androgynous) and the intentional Silas-photoreal / modules-stylized split.

## Sprint collapse rationale

The plan had V2, V3, V4 as three sequential sprints, each with a separate generate-portraits API call and a separate sprint-end ritual. User delivered all 10 portraits in one drop (`docs/art/Silas Portait.png` + `docs/art/Echo9_Upgrade_Portraits.zip`), which means the API-call gate the plan was structured around is already past. Sequencing three separate commits for the same visual change would produce three ~identical playtest captures. Landing them as one commit is cleaner and preserves the plan's actual acceptance signal — the HUD showing real portraits.

## Mockup-parity findings

**Working as intended:**
- `07-result-01.png` — the right rail's large Silas slot now renders the photoreal portrait (dark suit, salt-and-pepper hair) inside the accent-ring frame. Compared to the pre-portrait `03-hud-fresh.png` from E3 (which showed the "SV" initials placeholder), the character presence is fully landed.
- Left column's `INNER CHORUS → SILAS VALE` row shows a small circular portrait swatch — the photoreal Silas cropped to the row's compact height. The style tier hierarchy is legible: Silas is a photograph, everything else will be stylized when its module is installed.
- Silas' tutorial line is still visible in the row ("The chorus is here, Echo — every voice you file, I read too." from E3's `SILAS_DISCLOSE_LINES.INNER_CHORUS`).

**Deltas from `HUD Mockup.png`:**
- Portrait files are PNG at ~2 MB each — ~20 MB total across the roster. The plan spec'd WebP. This isn't a code issue (registry accepts both formats) but it will hurt initial-load bytes on itch.io / GitHub Pages. Options: (a) transcode to WebP in a follow-up sprint, (b) lazy-load module portraits via dynamic import so only installed modules pull their file. Recommend (a) as a small V-track polish sprint before ship-gate.
- Module portraits aren't yet visible in the playtest capture because the walker only installs `MOURNER` and the InnerChorus panel only expands to Silas + one module at maturity stage 2. Once C-track content lands multi-module playtests, this will surface. The registry mapping is unit-verified by the existing panel tests.

## Persona map (also in `docs/art/portrait-style.md`)

**Masculine (5):** Silas, Defender, Sentinel, Commander, Champion
**Feminine (4):** Mourner, Forecaster, Spark, Drained One
**Androgynous (1):** Null

Style tiers:
- **Photorealistic:** Silas only — the human character the player answers to.
- **Stylized digital (wireframe + accent glow + prop):** everything else — reads as "the modules are constructs; Silas is a person."

## Spec-adherence findings

- Registry hasn't changed since V1 landed — no drift between file names and `PORTRAIT_IDS`. The kebab-case + `module-` prefix contract holds for all 10 subjects.
- No test additions were required: `getPortraitUrl` returns `undefined` when the file is absent and a real URL string when present. The type surface (`string | undefined`) is identical; the runtime behavior is the interesting change, and it's already covered by the panel render tests reading `PortraitSlot` markup.
- Silas' §10 lint and every other content-lint gate is unaffected (portraits aren't voice lines).

## Regressions

- None. Full suite 632/632.
- Bundle-size concern flagged above (PNGs vs. WebP). Not a regression today — only a shipping-cost note.

## Carry-ins to next sprints

1. **WebP transcode pass** — one small V-track sprint to convert `*.png` → `*.webp` under `assets/portraits/`. The registry glob already accepts both extensions, so the code change is nil. The saving is likely 60–80% per file (~4–8 MB across the roster).
2. **V5 (chrome + typography + tokens)** — still owed. Now that the visual identity is anchored by the real portraits, V5's typography and border decisions can be graded against a more complete HUD.
3. **Ship-gate perf-baseline recheck** — the persist / render perf gates are unchanged, but the first-load bytes have grown. Add a note in `docs/perf-baseline.md` after the WebP transcode.
