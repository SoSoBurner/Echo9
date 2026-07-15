#!/usr/bin/env node
/**
 * scripts/transcode-portraits.mjs — portrait diet: PNG → WebP transcoder.
 *
 * WHY: build-itch.mjs gates the itch zip at 2 MB gzip-equivalent (PLAN.md §13),
 * but the 10 generated portraits under src/assets/portraits/ are ~2 MB PNGs
 * each (~20 MB total). PNGs barely shrink under gzip. WebP at q≈82 / 512 px
 * max dimension brings the whole roster under ~1.2 MB with no visible loss at
 * HUD render sizes (largest slot is PortraitSlot `lg` = 160 CSS px → 512 px
 * source is >2x even at 1.5x DPR).
 *
 * portraitRegistry.ts discovers portraits via
 *   import.meta.glob('../../assets/portraits/*.{png,webp}')
 * so .webp files are picked up automatically on next build. NOTE: the glob
 * imports BOTH formats — after transcoding, the source PNGs must be deleted
 * or they will double-bundle into dist. Use --delete for that.
 *
 * USAGE (from game/):
 *   npm i -D sharp                                   # one-time, if not installed
 *   node scripts/transcode-portraits.mjs             # write .webp next to each .png
 *   node scripts/transcode-portraits.mjs --delete    # …and remove the source PNGs
 *   node scripts/transcode-portraits.mjs --quality 82 --max 512   # explicit knobs
 *
 * Exit codes: 0 = all transcoded (and under budget), 1 = failure or budget miss.
 */
import { readdirSync, statSync, unlinkSync } from 'node:fs'
import { join, resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url))
const GAME_DIR = resolve(SCRIPTS_DIR, '..')
const PORTRAITS_DIR = join(GAME_DIR, 'src', 'assets', 'portraits')

// Budget for the WHOLE roster (10 files) — mirrors the itch-zip diet target.
const TOTAL_BUDGET_BYTES = 1.2 * 1024 * 1024

// ------------------------------------------------------------ arg parsing
const args = process.argv.slice(2)
function flagValue(name, fallback) {
  const i = args.indexOf(`--${name}`)
  if (i === -1 || i + 1 >= args.length) return fallback
  const n = Number(args[i + 1])
  return Number.isFinite(n) ? n : fallback
}
const QUALITY = flagValue('quality', 82) // WebP quality: 80–85 is the sweet spot
const MAX_DIM = flagValue('max', 512) // max width/height; only ever shrinks
const DELETE_PNGS = args.includes('--delete')

// ------------------------------------------------------------ sharp import
let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error(
    '[transcode-portraits] FAIL: `sharp` is not installed.\n' +
      '  Fix: run `npm i -D sharp` from game/ then re-run this script.',
  )
  process.exit(1)
}

// ------------------------------------------------------------ transcode
const pngs = readdirSync(PORTRAITS_DIR).filter((f) => f.endsWith('.png'))
if (pngs.length === 0) {
  console.log(`[transcode-portraits] no .png files under ${PORTRAITS_DIR} — nothing to do`)
  process.exit(0)
}

let totalBefore = 0
let totalAfter = 0
const rows = []
for (const file of pngs) {
  const src = join(PORTRAITS_DIR, file)
  const out = join(PORTRAITS_DIR, `${basename(file, '.png')}.webp`)
  const before = statSync(src).size
  // fit: 'inside' + withoutEnlargement — cap the long edge at MAX_DIM but
  // never upscale a smaller source.
  await sharp(src)
    .resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out)
  const after = statSync(out).size
  totalBefore += before
  totalAfter += after
  rows.push([file, before, after])
}

const kb = (b) => `${(b / 1024).toFixed(0)} KB`
console.log(`[transcode-portraits] quality=${QUALITY} maxDim=${MAX_DIM}px`)
for (const [file, before, after] of rows) {
  console.log(
    `  ${file.padEnd(28)} ${kb(before).padStart(9)} -> ${kb(after).padStart(8)} ` +
      `(${((1 - after / before) * 100).toFixed(1)}% smaller)`,
  )
}
console.log(
  `  TOTAL ${kb(totalBefore)} -> ${kb(totalAfter)} ` +
    `(budget ${kb(TOTAL_BUDGET_BYTES)} for the roster)`,
)

if (totalAfter >= TOTAL_BUDGET_BYTES) {
  console.error(
    `[transcode-portraits] FAIL: roster total ${kb(totalAfter)} exceeds ` +
      `${kb(TOTAL_BUDGET_BYTES)} budget — lower --quality or --max and re-run.`,
  )
  process.exit(1)
}

if (DELETE_PNGS) {
  for (const file of pngs) unlinkSync(join(PORTRAITS_DIR, file))
  console.log(
    `[transcode-portraits] deleted ${pngs.length} source PNGs ` +
      `(registry glob would otherwise double-bundle both formats)`,
  )
} else {
  console.log(
    '[transcode-portraits] NOTE: source PNGs kept. portraitRegistry.ts globs ' +
      '*.{png,webp} — delete the PNGs (re-run with --delete) before building ' +
      'for itch or both formats will ship in dist/.',
  )
}
