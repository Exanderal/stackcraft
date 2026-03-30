import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ProjectConfig } from '../types.js'

const DB_DOCKER = {
  postgres: {
    image: 'postgres:17-alpine',
    port: 5432,
    env: {
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'postgres',
    },
    healthcheck: `test: ['CMD-SHELL', 'pg_isready -U postgres']\n      interval: 5s\n      timeout: 5s\n      retries: 5`,
    envVars: {
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_PORT: '5432',
    },
  },
  mysql: {
    image: 'mysql:8-lts',
    port: 3306,
    env: {
      MYSQL_ROOT_PASSWORD: 'root',
      MYSQL_USER: 'mysql',
      MYSQL_PASSWORD: 'mysql',
    },
    healthcheck: `test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost']\n      interval: 5s\n      timeout: 5s\n      retries: 10`,
    envVars: {
      DB_USER: 'mysql',
      DB_PASSWORD: 'mysql',
      DB_PORT: '3306',
    },
  },
} as const

const FRONTEND_API_VAR = {
  vite: 'VITE_API_URL',
  nextjs: 'NEXT_PUBLIC_API_URL',
} as const

export async function setupDocker(config: ProjectConfig) {
  await writeDockerCompose(config)
  await writeBackendEnv(config)
  await writeFrontendEnv(config)
  await addDbScripts(config)
  await updateGitignore(config)
}

async function writeDockerCompose(config: ProjectConfig) {
  const db = DB_DOCKER[config.database]
  const dbName = config.projectName.replace(/-/g, '_')

  const envLines = Object.entries(db.env)
    .map(([k, v]) => `      ${k}: ${v}`)
    .join('\n')

  const volumeName = config.database === 'postgres' ? 'pgdata' : 'mysqldata'

  const content = `services:
  db:
    image: ${db.image}
    environment:
${envLines}
      ${config.database === 'postgres' ? 'POSTGRES_DB' : 'MYSQL_DATABASE'}: ${dbName}
    ports:
      - "${db.port}:${db.port}"
    volumes:
      - ${volumeName}:/var/lib/${config.database === 'postgres' ? 'postgresql/data' : 'mysql'}
    healthcheck:
      ${db.healthcheck}

volumes:
  ${volumeName}:
`

  await writeFile(join(config.targetDir, 'docker-compose.yml'), content, 'utf-8')
}

async function writeBackendEnv(config: ProjectConfig) {
  const db = DB_DOCKER[config.database]
  const dbName = config.projectName.replace(/-/g, '_')
  const backendDir = join(config.targetDir, 'apps', 'backend')

  const lines = [
    '# Database',
    `DB_HOST=localhost`,
    `DB_PORT=${db.envVars.DB_PORT}`,
    `DB_USER=${db.envVars.DB_USER}`,
    `DB_PASSWORD=${db.envVars.DB_PASSWORD}`,
    `DB_NAME=${dbName}`,
    '',
    '# App',
    'PORT=3000',
    'NODE_ENV=development',
    '',
  ].join('\n')

  await writeFile(join(backendDir, '.env'), lines, 'utf-8')
  await writeFile(join(backendDir, '.env.example'), lines, 'utf-8')
}

async function writeFrontendEnv(config: ProjectConfig) {
  const webDir = join(config.targetDir, 'apps', 'web')
  const apiVar = FRONTEND_API_VAR[config.frontend]

  const lines = [
    '# API',
    `${apiVar}=http://localhost:3000`,
    '',
  ].join('\n')

  await writeFile(join(webDir, '.env'), lines, 'utf-8')
  await writeFile(join(webDir, '.env.example'), lines, 'utf-8')
}

async function addDbScripts(config: ProjectConfig) {
  const pkgPath = join(config.targetDir, 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))

  pkg.scripts['db:start'] = 'docker compose up -d'
  pkg.scripts['db:stop'] = 'docker compose down'
  pkg.scripts['db:logs'] = 'docker compose logs -f db'

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
}

async function updateGitignore(config: ProjectConfig) {
  const gitignorePath = join(config.targetDir, '.gitignore')

  let content = ''
  try {
    content = await readFile(gitignorePath, 'utf-8')
  } catch {
    // file may not exist yet — we'll create it
  }

  if (!content.includes('.env')) {
    await writeFile(gitignorePath, content + '\n# environment\n**/.env\n', 'utf-8')
  }
}
