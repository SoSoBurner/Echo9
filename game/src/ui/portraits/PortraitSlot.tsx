/**
 * PortraitSlot — single-source portrait renderer.
 *
 * Renders either a real portrait image (when one has been dropped under
 * `src/assets/portraits/<id>.{png,webp}`) or a themed silhouette placeholder
 * carrying the character's name + initials + accent colour.
 *
 * The point of the placeholder is Kleenex-testing: the HUD must LOOK finished
 * even while V2/V3/V4 are waiting on generated PNGs. A greyish blob doesn't
 * work — a blob with "SV" + amber ring reads unambiguously as Silas.
 *
 * Swap-in contract:
 *   1. Add a subject to `scripts/portraits.config.mjs` with matching id.
 *   2. Run the generator, PNG lands at `src/assets/portraits/<id>.png`.
 *   3. Next build: `import.meta.glob` picks up the file, `getPortraitUrl(id)`
 *      returns its URL, this component renders <img> instead of silhouette.
 *   4. No consumer code changes — id stays stable.
 *
 * Accessibility:
 *   - `alt` on <img> and `aria-label` on the silhouette both use the character
 *     name from PORTRAIT_META. Screen readers announce "Silas Vale portrait"
 *     regardless of whether the real image is loaded.
 *   - `data-portrait-id` is on the outer element for E2E targeting / debug
 *     inspection / future V4 CSS overrides.
 */
import { getPortraitUrl, PORTRAIT_META, type PortraitId } from './portraitRegistry'

export type PortraitSize = 'sm' | 'md' | 'lg'

export interface PortraitSlotProps {
  portraitId: PortraitId
  /** sm ≈ chorus row, md ≈ right-column top slot, lg ≈ splash / lore panel. */
  size?: PortraitSize
  /** Extra classes for layout tweaks at the call site. */
  className?: string
}

/**
 * Tailwind size lookup. Kept as a plain object so a caller can grep for the
 * exact class strings when auditing size drift.
 */
const SIZE_CLASS: Readonly<Record<PortraitSize, string>> = {
  sm: 'w-8 h-8 text-[9px]',
  md: 'w-24 h-24 text-lg',
  lg: 'w-40 h-40 text-2xl',
}

/**
 * Accent → Tailwind ring / gradient stop tokens. The silas / null accents come
 * from PLAN.md §9 palette; the neutral module accent uses fg-secondary so the
 * eight upgrade slots read as a set distinct from the two named characters.
 */
const ACCENT_RING: Readonly<Record<string, string>> = {
  'silas-accent': 'ring-silas-accent',
  'null-accent': 'ring-null-accent',
  'fg-secondary': 'ring-fg-secondary',
}
const ACCENT_TEXT: Readonly<Record<string, string>> = {
  'silas-accent': 'text-silas-accent',
  'null-accent': 'text-null-accent',
  'fg-secondary': 'text-fg-secondary',
}

export function PortraitSlot({
  portraitId,
  size = 'sm',
  className = '',
}: PortraitSlotProps) {
  const meta = PORTRAIT_META[portraitId]
  const url = getPortraitUrl(portraitId)
  const sizeClass = SIZE_CLASS[size]
  const ringClass = ACCENT_RING[meta.accent] ?? 'ring-fg-secondary'
  const textClass = ACCENT_TEXT[meta.accent] ?? 'text-fg-secondary'

  // Real image path: <img> with alt text so screen readers get the name.
  // The wrapper <div> keeps the accent ring identical to the placeholder so
  // swap-in is visually stable — the frame stays put, only the interior swaps.
  if (url !== undefined) {
    return (
      <div
        data-portrait-id={portraitId}
        data-portrait-state="loaded"
        className={`
          ${sizeClass}
          rounded-full overflow-hidden shrink-0
          ring-2 ${ringClass}
          ${className}
        `}
      >
        <img
          src={url}
          alt={`${meta.name} portrait`}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    )
  }

  // Placeholder path: bust silhouette + initials + accent ring. The SVG is
  // inline so no network round-trip; the shape is a stylised head-and-shoulders
  // outline in the background colour with the initials floating on top.
  return (
    <div
      data-portrait-id={portraitId}
      data-portrait-state="placeholder"
      role="img"
      aria-label={`${meta.name} portrait placeholder`}
      className={`
        ${sizeClass}
        relative rounded-full overflow-hidden shrink-0
        bg-gradient-to-br from-sealed-dim to-background
        ring-2 ${ringClass}
        flex items-center justify-center
        font-mono font-semibold ${textClass}
        ${className}
      `}
    >
      {/*
        Bust silhouette — a soft dark oval at the top (head) and a wider
        rounded trapezoid at the bottom (shoulders). Rendered at 50% opacity
        so the initials read clearly on top. viewBox is 100x100 so the shapes
        scale linearly with the container size.
      */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full opacity-40"
        aria-hidden="true"
      >
        {/* Shoulders */}
        <path
          d="M 15 100 Q 15 65 50 65 Q 85 65 85 100 Z"
          fill="currentColor"
        />
        {/* Head */}
        <circle cx="50" cy="42" r="18" fill="currentColor" />
      </svg>
      <span aria-hidden="true" className="relative z-10">
        {meta.initials}
      </span>
    </div>
  )
}
