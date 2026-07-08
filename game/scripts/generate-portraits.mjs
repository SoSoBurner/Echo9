#!/usr/bin/env node
/**
 * scripts/generate-portraits.mjs — OpenAI Images pipeline for Echo9 (V1).
 *
 * Reads STYLE_PREFIX + SUBJECTS from portraits.config.mjs, builds prompts,
 * calls the Images API, and writes WebP files to src/assets/portraits/<id>.webp.
 *
 * Flags:
 *   --dry-run          Print prompts to stdout; DO NOT call the API. Cheap
 *                      verification that a new subject or descriptor is shaped
 *                      the way you want before spending tokens.
 *   --only <id>        Generate a single subject. V2/V3/V4 each want batched
 *                      but single-subject runs, so this is the primary flag.
 *   --list             Print id + name of every subject in the config, then exit.
 *   --help             Print usage.
 *
 * API key handling:
 *   Read OPENAI_API_KEY from process.env. NEVER read from a file — a checked-in
 *   .env or .openai-key would leak the key. Users invoke with
 *   `OPENAI_API_KEY=sk-... node scripts/generate-portraits.mjs --only silas`.
 *
 * Cost discipline:
 *   Every non-dry-run call costs the caller money. The script:
 *     1. Prints the full prompt before calling, so mistakes surface first.
 *     2. Refuses to call the API if OPENAI_API_KEY is unset — better a clear
 *        error than a silent no-op that looks like a bug.
 *     3. Does NOT retry on failure — a 500 or content-policy rejection
 *        should NOT trigger a second call automatically.
 *
 * Node runtime: uses native fetch (Node 18+). No SDK dependency — a plain
 * POST keeps the script small and avoids pinning an SDK version that would
 * drift from the API. If OpenAI breaks the API shape, this script fails
 * loudly with the response body attached, which is what we want.
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  STYLE_PREFIX,
  SUBJECTS,
  ACCENT_HEXES,
  OUTPUT_DIR,
  OPENAI_IMAGE_MODEL,
  OPENAI_IMAGE_SIZE,
} from './portraits.config.mjs'

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/images/generations'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = resolve(__dirname, '..')

// ---------------------------------------------------------------------------
// Argv parsing (kept tiny — this is a one-off script, not a CLI)
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { dryRun: false, only: null, list: false, help: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--list') args.list = true
    else if (a === '--help' || a === '-h') args.help = true
    else if (a === '--only') {
      args.only = argv[++i]
      if (!args.only) fail('--only requires a subject id')
    } else {
      fail(`Unknown argument: ${a}. Try --help.`)
    }
  }
  return args
}

function printUsage() {
  process.stdout.write(
    [
      'Usage: node scripts/generate-portraits.mjs [--dry-run] [--only <id>] [--list] [--help]',
      '',
      'Flags:',
      '  --dry-run          Print prompts, do not call the API.',
      '  --only <id>        Generate a single subject (see --list for ids).',
      '  --list             Print all configured subjects and exit.',
      '  --help             Show this message.',
      '',
      'Environment:',
      '  OPENAI_API_KEY     Required for non-dry-run calls. Read from env only.',
      '',
    ].join('\n'),
  )
}

function fail(msg) {
  process.stderr.write(`generate-portraits: ${msg}\n`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Prompt shaping
// ---------------------------------------------------------------------------

/**
 * Build the final prompt string for a subject. STYLE_PREFIX + a resolved
 * accent-hex sentence + the subject descriptor. Kept pure so tests can call it
 * without hitting the API.
 */
export function buildPrompt(subject) {
  const hex = ACCENT_HEXES[subject.accent]
  if (!hex) {
    throw new Error(
      `Subject "${subject.id}" has unknown accent "${subject.accent}". ` +
        `Expected one of: ${Object.keys(ACCENT_HEXES).join(', ')}.`,
    )
  }
  const accentSentence = `Face accent color is exactly ${hex}.`
  return `${STYLE_PREFIX} ${accentSentence} ${subject.descriptor}`
}

// ---------------------------------------------------------------------------
// Subject filtering
// ---------------------------------------------------------------------------

function resolveSubjects(args) {
  if (SUBJECTS.length === 0) {
    process.stderr.write(
      'No subjects configured in portraits.config.mjs. V1 ships with an empty ' +
        'roster; V2/V3/V4 add Silas / Null / modules.\n',
    )
    return []
  }
  if (args.only === null) return [...SUBJECTS]
  const found = SUBJECTS.find((s) => s.id === args.only)
  if (!found) {
    fail(
      `--only "${args.only}" did not match any subject. Try --list to see available ids.`,
    )
  }
  return [found]
}

// ---------------------------------------------------------------------------
// OpenAI Images API call
// ---------------------------------------------------------------------------

async function callImagesApi(prompt, apiKey) {
  const body = {
    model: OPENAI_IMAGE_MODEL,
    prompt,
    size: OPENAI_IMAGE_SIZE,
    n: 1,
    // Request b64_json so we don't have to make a second request for the URL.
    response_format: 'b64_json',
  }
  const res = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI API ${res.status}: ${text}`)
  }
  const json = await res.json()
  const b64 = json?.data?.[0]?.b64_json
  if (!b64) {
    throw new Error(`OpenAI response missing data[0].b64_json: ${JSON.stringify(json)}`)
  }
  return Buffer.from(b64, 'base64')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    printUsage()
    return
  }

  if (args.list) {
    if (SUBJECTS.length === 0) {
      process.stdout.write('(no subjects configured yet — V1 is scaffolding only)\n')
      return
    }
    for (const s of SUBJECTS) {
      process.stdout.write(`  ${s.id}\t${s.name}\n`)
    }
    return
  }

  const subjects = resolveSubjects(args)
  if (subjects.length === 0) return

  // Dry-run gate: just print prompts. Cheap, always safe.
  if (args.dryRun) {
    for (const s of subjects) {
      const prompt = buildPrompt(s)
      process.stdout.write(`\n[dry-run] ${s.id} — ${s.name}\n${prompt}\n`)
    }
    return
  }

  // Non-dry-run: require the key. Refuse to spend money on a silent
  // fallback.
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    fail(
      'OPENAI_API_KEY is not set. Run with e.g. ' +
        '`OPENAI_API_KEY=sk-... node scripts/generate-portraits.mjs --only silas` ' +
        'or use --dry-run to print prompts without spending tokens.',
    )
  }

  const outDir = resolve(REPO_ROOT, OUTPUT_DIR)
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true })
    process.stdout.write(`Created output directory: ${OUTPUT_DIR}\n`)
  }

  for (const s of subjects) {
    const prompt = buildPrompt(s)
    process.stdout.write(`\n[generating] ${s.id} — ${s.name}\n${prompt}\n`)
    const buffer = await callImagesApi(prompt, apiKey)
    // OpenAI returns PNG in b64_json — we write .png here. A future sprint
    // (or V2 landing sprint) can pipe through a WebP transcoder if the
    // filesize matters; for a 512×512 portrait, PNG is fine.
    const outPath = resolve(outDir, `${s.id}.png`)
    writeFileSync(outPath, buffer)
    process.stdout.write(`  -> wrote ${OUTPUT_DIR}/${s.id}.png (${buffer.length} bytes)\n`)
  }
}

// Only run when invoked as the entry script, not when imported for tests.
// Use pathToFileURL because Windows paths need file:///C:/... (three slashes);
// a naive `file://` + path builds a two-slash URL and the equality check silently
// fails, turning the whole CLI into a no-op on Windows.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    process.stderr.write(`generate-portraits: ${err.message}\n`)
    process.exit(1)
  })
}

// Suppress "unused import" warning under ES lint for readFileSync (kept for
// future --schema-check flag). This module is a script, not a library.
void readFileSync
