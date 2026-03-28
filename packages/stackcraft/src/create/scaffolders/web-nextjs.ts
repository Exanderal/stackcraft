import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ProjectConfig } from '../types.js'
import { copyTemplate } from './utils/copy.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, '..', '..', '..', 'templates')

export async function scaffoldNextjs(config: ProjectConfig) {
  const appDir = join(config.targetDir, 'apps', 'web')
  await mkdir(appDir, { recursive: true })

  await copyTemplate(join(TEMPLATES_DIR, 'web-nextjs'), appDir, {
    projectName: config.projectName,
  })
}
