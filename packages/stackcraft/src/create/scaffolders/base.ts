import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ProjectConfig } from '../types.js'
import { copyTemplate } from './utils/copy.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, '..', '..', '..', 'templates')

export async function scaffoldBase(config: ProjectConfig) {
  await mkdir(join(config.targetDir, 'apps'), { recursive: true })
  await mkdir(join(config.targetDir, 'packages'), { recursive: true })

  await copyTemplate(join(TEMPLATES_DIR, 'base'), config.targetDir, {
    projectName: config.projectName,
  })
}
