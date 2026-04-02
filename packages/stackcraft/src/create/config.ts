import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Backend, Database, Frontend, Linter, Mobile, ORM, PackageManager } from './types.js'

export interface ConfigFile {
  name?: string
  backend?: Backend
  orm?: ORM
  frontend?: Frontend
  mobile?: Mobile
  database?: Database
  packageManager?: PackageManager
  linter?: Linter
}

const VALID: Record<keyof ConfigFile, readonly string[]> = {
  name: [],
  backend: ['nestjs-rest', 'nestjs-graphql'],
  orm: ['prisma', 'kysely'],
  frontend: ['vite', 'nextjs'],
  mobile: ['none', 'expo'],
  database: ['postgres', 'mysql'],
  packageManager: ['pnpm', 'npm'],
  linter: ['eslint', 'biome'],
}

export async function loadConfig(configPath: string): Promise<ConfigFile> {
  const abs = resolve(process.cwd(), configPath)
  let raw: string
  try {
    raw = await readFile(abs, 'utf-8')
  } catch {
    throw new Error(`Config file not found: ${abs}`)
  }

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`Config file is not valid JSON: ${abs}`)
  }

  const errors: string[] = []

  for (const [field, valid] of Object.entries(VALID)) {
    const key = field as keyof ConfigFile
    const value = parsed[key]
    if (value === undefined) continue
    if (key === 'name') {
      if (typeof value !== 'string' || !value.trim()) {
        errors.push(`"name" must be a non-empty string`)
      }
      continue
    }
    if (!valid.includes(value as string)) {
      errors.push(`"${key}" must be one of: ${valid.join(', ')} — got "${value}"`)
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid config:\n${errors.map((e) => `  • ${e}`).join('\n')}`)
  }

  return parsed as ConfigFile
}
