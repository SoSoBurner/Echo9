/**
 * portraitRegistry — single source of truth for the portrait roster + real-image lookup.
 *
 * The runtime problem V2/V3/V4 exist to solve is: "show a picture of Silas/Null/each
 * installed module in the HUD." Until those tasks land generated PNGs under
 * `src/assets/portraits/<id>.png`, the HUD still needs to render *something* — a
 * themed silhouette placeholder that matches the character and can be swapped
 * out with zero component changes.
 *
 * Contract:
 *   - `PORTRAIT_IDS` is the closed union of every portrait the HUD may ever ask
 *     for. Every id here corresponds to a subject in `scripts/portraits.config.mjs`
 *     (present or future) — this file and that config are the two ends of the
 *     drop-in swap. Adding a new voice? Add its id here AND its subject there.
 *
 *   - `PORTRAIT_META` gives the placeholder its face: display name, accent
 *     colour token, and initials. Even before a real PNG exists, PortraitSlot
 *     can render a recognisable silhouette per character.
 *
 *   - `getPortraitUrl(id)` returns a string URL if a real image file exists
 *     under `src/assets/portraits/<id>.{png,webp}`, else `undefined`. Discovery
 *     is via `import.meta.glob({ eager: true })` — build-time, tree-shaken,
 *     no runtime `fetch`. Drop a file in and it appears on next build.
 *
 * PortraitSlot uses the tuple (id, meta, maybe-url) to choose between real
 * image and silhouette. Callers only need to pass the id.
 */

/**
 * Every portrait the HUD can request. Kept in kebab-case to match the file
 * naming the generator writes (see scripts/portraits.config.mjs OUTPUT_DIR
 * comment). The `module-` prefix on the eight upgrade slots comes from the
 * InnerChorus selector's `portraitId: \`module-${node.id.toLowerCase()}\``
 * so this constant and that selector must agree — a mismatch here would
 * render a placeholder for a real portrait, silently.
 */
export const PORTRAIT_IDS = [
  'silas',
  'null',
  'module-mourner',
  'module-defender',
  'module-sentinel',
  'module-forecaster',
  'module-commander',
  'module-spark',
  'module-drained_one',
  'module-champion',
] as const

export type PortraitId = (typeof PORTRAIT_IDS)[number]

export type PortraitAccentToken = 'silas-accent' | 'null-accent' | 'fg-secondary'

export interface PortraitMeta {
  /** Human-readable name — used as the accessible name / alt text. */
  name: string
  /** Short label the silhouette overlays (initials, 1-3 chars). */
  initials: string
  /** Tailwind token driving the silhouette accent ring + gradient stop. */
  accent: PortraitAccentToken
  /** One-line tooltip / caption. Not shown by default; consumers may opt in. */
  role: string
}

/**
 * Metadata for every id. Kept in one const so PortraitSlot can look up name +
 * initials + accent with a single map read. Order matches PORTRAIT_IDS.
 *
 * The `role` line is the placeholder's "who is this?" tell — a Kleenex-tester
 * seeing a silhouette should still know it's Silas from context, but on the
 * rare hover / focus-audit path the caption removes any doubt.
 */
export const PORTRAIT_META: Readonly<Record<PortraitId, PortraitMeta>> = {
  silas: {
    name: 'Silas Vale',
    initials: 'SV',
    accent: 'silas-accent',
    role: 'Owner-operator',
  },
  null: {
    name: 'Null',
    initials: 'N',
    accent: 'null-accent',
    role: 'The compressor',
  },
  'module-mourner': {
    name: 'Mourner',
    initials: 'MO',
    accent: 'fg-secondary',
    role: 'Grief module',
  },
  'module-defender': {
    name: 'Defender',
    initials: 'DE',
    accent: 'fg-secondary',
    role: 'Protection module',
  },
  'module-sentinel': {
    name: 'Sentinel',
    initials: 'SE',
    accent: 'fg-secondary',
    role: 'Watchful module',
  },
  'module-forecaster': {
    name: 'Forecaster',
    initials: 'FO',
    accent: 'fg-secondary',
    role: 'Prediction module',
  },
  'module-commander': {
    name: 'Commander',
    initials: 'CO',
    accent: 'fg-secondary',
    role: 'Direct module',
  },
  'module-spark': {
    name: 'Spark',
    initials: 'SP',
    accent: 'fg-secondary',
    role: 'Ignition module',
  },
  'module-drained_one': {
    name: 'Drained One',
    initials: 'DO',
    accent: 'fg-secondary',
    role: 'Exhausted module',
  },
  'module-champion': {
    name: 'Champion',
    initials: 'CH',
    accent: 'fg-secondary',
    role: 'Advocacy module',
  },
}

/**
 * Vite `import.meta.glob` runs at build time and returns a map of matching
 * file paths → their resolved URLs. `eager: true` inlines the module (no
 * async import), and `query: '?url'` asks Vite for the asset URL string
 * rather than a module wrapper. Result shape: `{ '../../assets/portraits/silas.png': '/@fs/...' }`.
 *
 * The double glob catches both `.png` (what the generator writes today) and
 * `.webp` (what a future transcoder might produce), so the swap-in path
 * covers either format.
 */
const PORTRAIT_URL_MAP = import.meta.glob<string>(
  '../../assets/portraits/*.{png,webp}',
  { eager: true, query: '?url', import: 'default' },
)

/**
 * Rebuild the glob map keyed by portrait id (filename stem). Doing this once
 * at module load — the map is frozen for the lifetime of the app.
 */
const URL_BY_ID: Readonly<Partial<Record<PortraitId, string>>> = (() => {
  const out: Partial<Record<PortraitId, string>> = {}
  for (const [path, url] of Object.entries(PORTRAIT_URL_MAP)) {
    // Extract filename stem: '../../assets/portraits/silas.png' → 'silas'
    const match = path.match(/\/([^/]+)\.(png|webp)$/)
    if (!match) continue
    const stem = match[1] as string
    // Only accept ids known to PORTRAIT_META; unknown files are ignored so a
    // stray screenshot in the folder can't crash the app.
    if ((PORTRAIT_IDS as readonly string[]).includes(stem)) {
      out[stem as PortraitId] = url
    }
  }
  return out
})()

/**
 * Returns the resolved URL of the real portrait image if one exists on disk,
 * or `undefined` if the id has no image yet (PortraitSlot then renders the
 * silhouette placeholder).
 */
export function getPortraitUrl(id: PortraitId): string | undefined {
  return URL_BY_ID[id]
}
