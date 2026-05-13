/**
 * Runs scaffold + pnpm install for every key config variant and checks that
 * no packages are blocked by pnpm's build-script allowlist.
 *
 * Usage:
 *   node scripts/e2e-variants.mjs
 *
 * Requires a built dist — run `pnpm build` first.
 */

import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const distScaffold = join(fileURLToPath(import.meta.url), '..', '..', 'dist', 'create', 'scaffold.js')
const { scaffold } = await import(distScaffold)

// Every variant that exercises a distinct set of packages.
// Together they cover all pnpm allowBuilds entries in the base template.
const VARIANTS = [
  {
    label: 'rest  + eslint + prisma + vite    + none',
    backend: 'nestjs-rest',    frontend: 'vite',   orm: 'prisma', linter: 'eslint', mobile: 'none',
  },
  {
    label: 'graphql + biome + prisma + vite   + none',
    backend: 'nestjs-graphql', frontend: 'vite',   orm: 'prisma', linter: 'biome',  mobile: 'none',
  },
  {
    label: 'rest  + biome + kysely + vite     + none',
    backend: 'nestjs-rest',    frontend: 'vite',   orm: 'kysely', linter: 'biome',  mobile: 'none',
  },
  {
    label: 'graphql + eslint + kysely + vite  + none',
    backend: 'nestjs-graphql', frontend: 'vite',   orm: 'kysely', linter: 'eslint', mobile: 'none',
  },
  {
    label: 'rest  + eslint + prisma + nextjs  + none',
    backend: 'nestjs-rest',    frontend: 'nextjs', orm: 'prisma', linter: 'eslint', mobile: 'none',
  },
  {
    label: 'rest  + eslint + prisma + vite    + expo',
    backend: 'nestjs-rest',    frontend: 'vite',   orm: 'prisma', linter: 'eslint', mobile: 'expo',
  },
]

const COMMON = { projectName: 'e2e-test', database: 'postgres', packageManager: 'pnpm' }

const results = []
const dirs = []

for (const { label, ...config } of VARIANTS) {
  const targetDir = join(tmpdir(), `stackcraft-variants-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  dirs.push(targetDir)

  process.stdout.write(`  [ ] ${label}\r`)

  try {
    await scaffold({ ...COMMON, ...config, targetDir }, () => {})
    results.push({ label, passed: true })
    console.log(`  [✓] ${label}`)
  } catch (err) {
    const ignoredBuilds = err.output?.stdout?.match(/\[ERR_PNPM_IGNORED_BUILDS\][^\n]*/)?.[0]
    const reason = ignoredBuilds ?? err.message
    results.push({ label, passed: false, reason })
    console.log(`  [✗] ${label}`)
    console.log(`      ${reason}`)
  }
}

console.log('\nCleaning up...')
await Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true })))

const failed = results.filter((r) => !r.passed)

console.log(`\n${results.length - failed.length}/${results.length} variants passed.\n`)

if (failed.length > 0) {
  process.exit(1)
}
