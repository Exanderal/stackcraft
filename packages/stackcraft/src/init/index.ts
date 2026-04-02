import { outro } from '@clack/prompts'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const SCHEMA_URL = 'https://unpkg.com/@exanderal/stackcraft/schema.json'

const DEFAULT_CONFIG = {
  $schema: SCHEMA_URL,
  name: 'my-app',
  backend: 'nestjs-rest',
  orm: 'prisma',
  frontend: 'vite',
  mobile: 'none',
  database: 'postgres',
  packageManager: 'pnpm',
  linter: 'eslint',
}

const OPTIONS: Array<{ field: string; values: string[] }> = [
  { field: 'backend', values: ['nestjs-rest', 'nestjs-graphql'] },
  { field: 'orm', values: ['prisma', 'kysely'] },
  { field: 'frontend', values: ['vite', 'nextjs'] },
  { field: 'mobile', values: ['none', 'expo'] },
  { field: 'database', values: ['postgres', 'mysql'] },
  { field: 'packageManager', values: ['pnpm', 'npm'] },
  { field: 'linter', values: ['eslint', 'biome'] },
]

export async function init() {
  const dest = join(process.cwd(), 'stackcraft.config.json')
  await writeFile(dest, JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n', 'utf-8')

  const col = Math.max(...OPTIONS.map((o) => o.field.length))

  console.log('\n  Created stackcraft.config.json\n')
  console.log('  Edit the file to customize your stack:\n')

  for (const { field, values } of OPTIONS) {
    const padding = ' '.repeat(col - field.length + 2)
    console.log(`    ${field}${padding}${values.join(' | ')}`)
  }

  console.log('')
  outro('Run: npx stackcraft --config stackcraft.config.json')
}
