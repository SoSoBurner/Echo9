/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Path aliases mirror tsconfig.app.json (PLAN.md §11)
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@state':   r('./src/state'),
      '@schemas': r('./src/schemas'),
      '@content': r('./src/content'),
      '@systems': r('./src/systems'),
      '@ui':      r('./src/ui'),
      '@tests':   r('./src/tests'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    css: true,
    typecheck: { tsconfig: './tsconfig.test.json' },
  },
})
