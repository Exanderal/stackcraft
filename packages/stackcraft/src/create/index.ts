import { cancel, intro, isCancel, outro, select, spinner, text } from '@clack/prompts'
import { resolve } from 'node:path'
import { loadConfig } from './config.js'
import { scaffold } from './scaffold.js'
import type { Backend, Database, Frontend, Linter, Mobile, ORM, PackageManager, ProjectConfig } from './types.js'

interface CreateOptions {
  fullMode?: boolean
  configPath?: string
}

export async function create({ fullMode = false, configPath }: CreateOptions = {}) {
  const cfg = configPath ? await loadConfig(configPath) : {}

  intro('stackcraft — spin up a production-ready monorepo')

  const projectName = cfg.name ?? await text({
    message: 'Project name',
    placeholder: 'my-app',
    validate: (v) => (!v ? 'Required' : undefined),
  })
  if (isCancel(projectName)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const backend = cfg.backend ?? await select({
    message: 'Backend',
    options: [
      { value: 'nestjs-rest', label: 'NestJS REST', hint: 'REST API' },
      { value: 'nestjs-graphql', label: 'NestJS GraphQL', hint: 'Code-first GraphQL' },
    ],
  })
  if (isCancel(backend)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const ormFromConfig = cfg.orm
  let orm: ORM
  if (ormFromConfig) {
    orm = ormFromConfig
  } else if (fullMode) {
    const ormAnswer = await select({
      message: 'ORM',
      options: [
        { value: 'prisma', label: 'Prisma', hint: 'recommended — schema-first, great DX' },
        { value: 'kysely', label: 'Kysely', hint: 'type-safe SQL query builder' },
      ],
    })
    if (isCancel(ormAnswer)) {
      cancel('Cancelled.')
      process.exit(0)
    }
    orm = ormAnswer as ORM
  } else {
    orm = 'prisma'
  }

  const frontend = cfg.frontend ?? await select({
    message: 'Frontend',
    options: [
      { value: 'vite', label: 'Vite + React', hint: 'Fast dev server, great for SPAs' },
      { value: 'nextjs', label: 'Next.js', hint: 'Full-stack React with SSR/SSG' },
    ],
  })
  if (isCancel(frontend)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const mobile = cfg.mobile ?? await select({
    message: 'Mobile',
    options: [
      { value: 'none', label: 'None' },
      { value: 'expo', label: 'Expo', hint: 'React Native with Expo Router' },
    ],
  })
  if (isCancel(mobile)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const database = cfg.database ?? await select({
    message: 'Database',
    options: [
      { value: 'postgres', label: 'PostgreSQL', hint: 'recommended' },
      { value: 'mysql', label: 'MySQL' },
    ],
  })
  if (isCancel(database)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const packageManager = cfg.packageManager ?? await select({
    message: 'Package manager',
    options: [
      { value: 'pnpm', label: 'pnpm', hint: 'recommended' },
      { value: 'npm', label: 'npm' },
    ],
  })
  if (isCancel(packageManager)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const linterFromConfig = cfg.linter
  let linter: Linter
  if (linterFromConfig) {
    linter = linterFromConfig
  } else if (fullMode) {
    const linterAnswer = await select({
      message: 'Linter / formatter',
      options: [
        { value: 'eslint', label: 'ESLint + Prettier', hint: 'recommended' },
        { value: 'biome', label: 'Biome', hint: 'fast all-in-one, replaces both' },
      ],
    })
    if (isCancel(linterAnswer)) {
      cancel('Cancelled.')
      process.exit(0)
    }
    linter = linterAnswer as Linter
  } else {
    linter = 'eslint'
  }

  const config: ProjectConfig = {
    projectName: projectName as string,
    frontend: frontend as Frontend,
    backend: backend as Backend,
    database: database as Database,
    mobile: mobile as Mobile,
    linter,
    orm,
    packageManager: packageManager as PackageManager,
    targetDir: resolve(process.cwd(), projectName as string),
  }

  const s = spinner()
  s.start('Scaffolding your project...')
  await scaffold(config, (msg) => s.message(msg))
  s.stop('Done!')

  outro(`cd ${config.projectName} && ${config.packageManager} dev`)
}
