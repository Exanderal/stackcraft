import { access, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const distScaffold = join(fileURLToPath(import.meta.url), '..', '..', 'dist', 'create', 'scaffold.js')
const { scaffold } = await import(distScaffold)

const targetDir = join(tmpdir(), `stackcraft-e2e-${Date.now()}`)

const CHECKS = [
  'package.json',
  'nx.json',
  'pnpm-workspace.yaml',
  'docker-compose.yml',
  '.gitignore',
  'README.md',
  'apps/backend/package.json',
  'apps/backend/.env',
  'apps/backend/.env.example',
  'apps/backend/src/app.module.ts',
  'apps/web/package.json',
  'apps/web/.env',
  'apps/web/.env.example',
  'packages/types/package.json',
  'tools/generators/generators.json',
]

async function run() {
  console.log(`\nScaffolding test project to ${targetDir}...\n`)

  try {
    await scaffold(
      {
        projectName: 'e2e-test',
        frontend: 'vite',
        backend: 'nestjs-rest',
        database: 'postgres',
        mobile: 'none',
        linter: 'eslint',
        packageManager: 'pnpm',
        targetDir,
      },
      (msg) => console.log(`  ${msg}`),
    )
  } catch (err) {
    console.error('\nScaffold failed:', err.message)
    process.exit(1)
  }

  console.log('\nChecking output...\n')

  let failed = false
  for (const file of CHECKS) {
    try {
      await access(join(targetDir, file))
      console.log(`  ✓  ${file}`)
    } catch {
      console.error(`  ✗  ${file}  ← MISSING`)
      failed = true
    }
  }

  await rm(targetDir, { recursive: true, force: true })

  if (failed) {
    console.error('\nE2E failed — one or more expected files are missing.\n')
    process.exit(1)
  }

  console.log('\nE2E passed.\n')
}

run()
