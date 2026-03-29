import { execa } from 'execa'
import { scaffoldNestjsGraphql } from './scaffolders/api-nestjs-graphql.js'
import { scaffoldNestjsRest } from './scaffolders/api-nestjs-rest.js'
import { scaffoldBase } from './scaffolders/base.js'
import { scaffoldNextjs } from './scaffolders/web-nextjs.js'
import { scaffoldVite } from './scaffolders/web-vite.js'
import type { ProjectConfig } from './types.js'

export async function scaffold(config: ProjectConfig, onStep: (msg: string) => void) {
  onStep('Creating workspace...')
  await scaffoldBase(config)

  onStep('Adding backend...')
  if (config.backend === 'nestjs-graphql') {
    await scaffoldNestjsGraphql(config)
  } else {
    await scaffoldNestjsRest(config)
  }

  if (config.frontend === 'vite') {
    onStep('Adding Vite + React app...')
    await scaffoldVite(config)
  } else if (config.frontend === 'nextjs') {
    onStep('Adding Next.js app...')
    await scaffoldNextjs(config)
  }

  onStep('Installing dependencies...')
  await execa(config.packageManager, ['install'], { cwd: config.targetDir })
}
