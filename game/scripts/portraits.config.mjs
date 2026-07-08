/**
 * portraits.config.mjs — Locked style + subject list for OpenAI Images pipeline
 * (Sprint V1, PLAN.md §9 visual identity + user Q23 answer on style discipline).
 *
 * Every prompt sent to the OpenAI Images API is `${STYLE_PREFIX} ${subject.descriptor}`.
 * Keeping the prefix in one place is the whole point: every portrait shares the
 * same rendering vocabulary (palette, lighting, texture, framing), so Silas,
 * Null, and the 8 upgrade portraits all read as members of the same set. If a
 * future portrait feels off-brand, it is almost always the descriptor drifting
 * from the STYLE_PREFIX contract — not the prefix that needs adjusting.
 *
 * The subjects list is deliberately empty for V1 (dry-run scaffolding only).
 * V2 adds Silas. V3 adds Null. V4 adds the 8 modules. Landing them incrementally
 * lets each portrait be inspected before generating the next batch — cheaper
 * iteration than regenerating 10 images every time we tune the prefix.
 *
 * .mjs (not .ts) so the plain Node script runner can import it without a
 * TypeScript compile step. The script is one-off tooling — the whole "type
 * safety at build time" argument doesn't apply.
 */

/**
 * Shared vocabulary that opens every prompt. Every subject's descriptor is
 * appended AFTER this prefix.
 *
 * Locked pillars:
 *   - Cyberpunk HUD ambient — Echo9 is a program coming online, not a
 *     photorealistic character portrait. Aesthetic must telegraph "in-world
 *     diegetic overlay" not "PR headshot."
 *   - Dark background — matches the #0A0B0D HUD background locked in §9. A
 *     bright bg would fight the mask cutout and force alpha-channel work.
 *   - Muted palette + accent — the palette tokens carry the color signal;
 *     portraits should not compete. Warm accent for Silas (silas-accent hex
 *     #D97757), cool accent for Null (null-accent hex #7FB3D5), neutral for
 *     module upgrades.
 *   - Bust framing — headline area (~40% of composition), no full body,
 *     directly-front or 3/4 turn. Consistent framing across all subjects is
 *     what makes them read as a set in the InnerChorusPanel roster.
 */
export const STYLE_PREFIX =
  'A cyberpunk HUD portrait bust for a diegetic in-game AI dashboard overlay. ' +
  'Dark near-black background (#0A0B0D). Muted noir palette with a single ' +
  'accent color highlighting the face. Grainy CRT scan-line texture. ' +
  'Program-come-alive vibe — not a photograph, not a stylized illustration; ' +
  'a rendered ambient portrait as if displayed on a monochrome tactical ' +
  'screen. Head-and-shoulders framing, subject centered, direct or 3/4 gaze. ' +
  'Muted lighting from below-left, a soft rim light from behind. Square 1:1 ' +
  'composition, ready for WebP export at 512×512.'

/**
 * Subject roster. Each entry becomes one API call; the id feeds the output
 * filename (`<id>.webp`). Add a subject here in the same commit as the code
 * that mounts it in the HUD.
 *
 * Fields:
 *   id         — filename slug, kebab-case, matches HUD mount references
 *   name       — human-readable name (used in --help and logs)
 *   descriptor — subject-specific vocabulary appended AFTER STYLE_PREFIX; must
 *                complement the prefix, not fight it (e.g., don't specify a
 *                different framing or a color that clashes with the accent)
 *   accent     — 'silas' | 'null' | 'neutral' (which token color to emphasize
 *                as the face highlight); the script injects the hex into the
 *                final prompt
 */
export const SUBJECTS = /** @type {const} */ ([
  // V2 adds: silas
  // V3 adds: null
  // V4 adds: forecaster, morane-audit, upstream-forgiveness, bargain-hunt,
  //          collateral-caretaker, veiled-syndicate, deferral-atlas,
  //          witness-liturgy  (8 modules × 1 portrait each)
])

/**
 * Accent hex per accent key. Kept in sync with src/ui/tokens/palette.ts —
 * if the palette shifts these must shift too, but for portraits we're baking
 * the color into the PNG at generation time, so any subsequent palette change
 * still requires a re-generation to update the accent. That's fine: portraits
 * are shipping assets, palette is runtime chrome.
 */
export const ACCENT_HEXES = /** @type {const} */ ({
  silas: '#D97757',
  null: '#7FB3D5',
  neutral: '#A8A39A',
})

/**
 * Where the script writes WebP output. Matches V2/V3/V4 mount points in
 * InnerChorusPanel and the right-column Silas/Null slots.
 */
export const OUTPUT_DIR = 'src/assets/portraits'

/** OpenAI Images API — pinned so a future SDK version bump can't drift the model. */
export const OPENAI_IMAGE_MODEL = 'gpt-image-1'

/** Square, tight, HUD-scale. 512×512 fits both the right-rail slot and the InnerChorusPanel row. */
export const OPENAI_IMAGE_SIZE = '512x512'
