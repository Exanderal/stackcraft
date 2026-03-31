import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ProjectConfig } from '../types.js'
import { injectOrmDeps, writeKyselyService, writeMigrateScript, writeModuleGeneratorIndex } from './orm.js'
import { copyTemplate } from './utils/copy.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, '..', '..', '..', 'templates')

export async function scaffoldNestjsRest(config: ProjectConfig) {
  const appDir = join(config.targetDir, 'apps', 'backend')
  await mkdir(appDir, { recursive: true })

  const dbProvider = config.database === 'postgres' ? 'postgresql' : 'mysql'

  await copyTemplate(join(TEMPLATES_DIR, 'api-nestjs-rest'), appDir, {
    projectName: config.projectName,
  })

  await copyTemplate(join(TEMPLATES_DIR, `orm-${config.orm}`), appDir, {
    projectName: config.projectName,
    dbProvider,
  })

  // Push ORM generator templates to workspace root, overwriting base TypeORM generators
  await copyTemplate(
    join(TEMPLATES_DIR, `orm-${config.orm}`, 'tools'),
    join(config.targetDir, 'tools'),
    { projectName: config.projectName, dbProvider },
  )

  await injectOrmDeps(appDir, config)

  if (config.orm === 'kysely') {
    await writeKyselyService(appDir, config)
    await writeMigrateScript(appDir, config)
  }

  await writeModuleGeneratorIndex(config.targetDir, config.backend)
  await setupRestCodegen(config.targetDir)
}

async function setupRestCodegen(targetDir: string) {
  const typesDir = join(targetDir, 'packages', 'types')

  await copyTemplate(join(TEMPLATES_DIR, 'types-rest'), typesDir, {})

  const pkgPath = join(typesDir, 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))

  pkg.devDependencies['@hey-api/openapi-ts'] = '^0.64.0'
  pkg.devDependencies['chokidar-cli'] = '^3.0.0'

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
}
