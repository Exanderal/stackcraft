import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ProjectConfig } from '../types.js'
import { copyTemplate } from './utils/copy.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, '..', '..', '..', 'templates')

const DB_CONFIG = {
  postgres: { type: 'postgres', port: '5432', driver: 'pg', driverVersion: '^8.0.0', typesPackage: '@types/pg', typesVersion: '^8.0.0' },
  mysql:    { type: 'mysql',    port: '3306', driver: 'mysql2', driverVersion: '^3.0.0', typesPackage: null, typesVersion: null },
} as const

export async function scaffoldNestjsGraphql(config: ProjectConfig) {
  const appDir = join(config.targetDir, 'apps', 'backend')
  await mkdir(appDir, { recursive: true })

  const db = DB_CONFIG[config.database]

  await copyTemplate(join(TEMPLATES_DIR, 'api-nestjs-graphql'), appDir, {
    projectName: config.projectName,
    dbType: db.type,
    dbPort: db.port,
  })

  await injectDbDriver(appDir, db)
}

async function injectDbDriver(appDir: string, db: typeof DB_CONFIG[keyof typeof DB_CONFIG]) {
  const pkgPath = join(appDir, 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))

  pkg.dependencies[db.driver] = db.driverVersion

  if (db.typesPackage) {
    pkg.devDependencies[db.typesPackage] = db.typesVersion
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
}
