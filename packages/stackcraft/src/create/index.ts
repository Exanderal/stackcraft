import { cancel, intro, isCancel, outro, select, spinner, text } from '@clack/prompts'
import { resolve } from 'node:path'
import { scaffold } from './scaffold.js'
import type { Backend, Database, Frontend, PackageManager, ProjectConfig } from './types.js'

export async function create() {
  intro('stackcraft — spin up a production-ready monorepo')

  const projectName = await text({
    message: 'Project name',
    placeholder: 'my-app',
    validate: (v) => (!v ? 'Required' : undefined),
  })
  if (isCancel(projectName)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const backend = await select({
    message: 'Backend',
    options: [
      { value: 'nestjs-rest', label: 'NestJS REST', hint: 'REST API with TypeORM' },
      { value: 'nestjs-graphql', label: 'NestJS GraphQL', hint: 'Code-first GraphQL with TypeORM' },
    ],
  })
  if (isCancel(backend)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const frontend = await select({
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

  const database = await select({
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

  const packageManager = await select({
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

  const config: ProjectConfig = {
    projectName: projectName as string,
    frontend: frontend as Frontend,
    backend: backend as Backend,
    database: database as Database,
    packageManager: packageManager as PackageManager,
    targetDir: resolve(process.cwd(), projectName as string),
  }

  const s = spinner()
  s.start('Scaffolding your project...')
  await scaffold(config, (msg) => s.message(msg))
  s.stop('Done!')

  outro(`cd ${config.projectName} && ${config.packageManager} dev`)
}
