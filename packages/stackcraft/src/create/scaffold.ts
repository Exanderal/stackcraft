import { x } from 'tinyexec'
import { scaffoldNestjsGraphql } from './scaffolders/api-nestjs-graphql.js'
import { scaffoldNestjsRest } from './scaffolders/api-nestjs-rest.js'
import { scaffoldBase } from './scaffolders/base.js'
import { scaffoldExpo } from './scaffolders/mobile-expo.js'
import { setupDocker } from './scaffolders/setup-docker.js'
import { setupLinter } from './scaffolders/setup-linter.js'
import { scaffoldNextjs } from './scaffolders/web-nextjs.js'
import { scaffoldVite } from './scaffolders/web-vite.js'
import { wireClientIntegration } from './scaffolders/wire-client.js'
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

  if (config.mobile === 'expo') {
    onStep('Adding Expo mobile app...')
    await scaffoldExpo(config)
  }

  onStep('Configuring linter...')
  await setupLinter(config)

  onStep('Setting up Docker and environment...')
  await setupDocker(config)

  onStep('Wiring client integration...')
  await wireClientIntegration(config)

  onStep('Installing dependencies...')
  await x(config.packageManager, ['install'], { nodeOptions: { cwd: config.targetDir }, throwOnError: true })
}
