#!/usr/bin/env node
/**
 * play.mjs — local launcher for manual playtesting.
 *
 * Builds the production bundle, starts the vite preview server at
 * http://localhost:4173, and opens your default browser. Save data
 * (localStorage: echo9:autosave, echo9:comfort) persists across launches —
 * feels like a real game. To wipe, clear browser localStorage manually.
 *
 * Usage: npm run play
 * Stop:  Ctrl-C in the terminal running this script.
 */
import { spawn } from 'node:child_process'

const isWin = process.platform === 'win32'

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: isWin })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))))
    child.on('error', reject)
  })
}

async function main() {
  console.log('\n[play] building production bundle...\n')
  await run('npm', ['run', 'build'])

  console.log('\n[play] starting preview server at http://localhost:4173/')
  console.log('[play] browser will open automatically. Ctrl-C to stop.\n')

  const preview = spawn('npx', ['vite', 'preview', '--open'], {
    stdio: 'inherit',
    shell: isWin,
  })
  preview.on('exit', (code) => process.exit(code ?? 0))
}

main().catch((e) => {
  console.error('[play] failed:', e.message)
  process.exit(1)
})
