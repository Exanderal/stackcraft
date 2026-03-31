import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Backend, ProjectConfig } from '../types.js'

const MODULE_GENERATOR_INDEX_REST = `\
const { formatFiles, generateFiles, names } = require('@nx/devkit');
const { execSync } = require('node:child_process');
const { join } = require('node:path');

module.exports = async function (tree, options) {
  const n = names(options.name);
  const modulePath = \`apps/backend/src/modules/\${n.fileName}\`;

  generateFiles(tree, join(__dirname, 'files'), modulePath, { ...n, tmpl: '' });

  await formatFiles(tree);

  console.log(\`\\n✓ Module created at \${modulePath}/\`);
  console.log(\`  → Import \${n.className}Module in app.module.ts\\n\`);

  return () => {
    execSync(\`npx prettier --write \${modulePath}\`, {
      cwd: tree.root,
      stdio: 'inherit',
    });
  };
};
`

const MODULE_GENERATOR_INDEX_GRAPHQL = `\
const { formatFiles, generateFiles, names } = require('@nx/devkit');
const { execSync } = require('node:child_process');
const { join } = require('node:path');

module.exports = async function (tree, options) {
  const n = names(options.name);
  const modulePath = \`apps/backend/src/modules/\${n.fileName}\`;

  generateFiles(tree, join(__dirname, 'files'), modulePath, { ...n, tmpl: '' });
  generateFiles(tree, join(__dirname, 'graphql-files'), modulePath, { ...n, tmpl: '' });

  await formatFiles(tree);

  console.log(\`\\n✓ Module created at \${modulePath}/\`);
  console.log(\`  → Import \${n.className}Module in app.module.ts\\n\`);

  return () => {
    execSync(\`npx prettier --write \${modulePath}\`, {
      cwd: tree.root,
      stdio: 'inherit',
    });
  };
};
`

export async function writeModuleGeneratorIndex(targetDir: string, backend: Backend) {
  const dest = join(targetDir, 'tools', 'generators', 'module')
  await mkdir(dest, { recursive: true })
  const content = backend === 'nestjs-graphql'
    ? MODULE_GENERATOR_INDEX_GRAPHQL
    : MODULE_GENERATOR_INDEX_REST
  await writeFile(join(dest, 'index.js'), content, 'utf-8')
}

export async function injectOrmDeps(appDir: string, config: ProjectConfig) {
  const pkgPath = join(appDir, 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))

  if (config.orm === 'prisma') {
    pkg.dependencies['@prisma/client'] = '^6.0.0'
    pkg.devDependencies['prisma'] = '^6.0.0'
    pkg.devDependencies['tsx'] = '^4.0.0'

    pkg.scripts['migration:run'] = 'prisma migrate dev'
    pkg.scripts['migration:deploy'] = 'prisma migrate deploy'
    pkg.scripts['migration:new'] = 'prisma migrate dev --name'
    pkg.scripts['db:seed'] = 'prisma db seed'
    pkg.scripts['db:studio'] = 'prisma studio'
    pkg.scripts['postinstall'] = 'prisma generate'

    pkg.prisma = { seed: 'tsx prisma/seeds/seed.ts' }
  } else {
    // kysely
    pkg.dependencies['kysely'] = '^0.27.0'
    pkg.devDependencies['tsx'] = '^4.0.0'

    if (config.database === 'postgres') {
      pkg.dependencies['pg'] = '^8.0.0'
      pkg.devDependencies['@types/pg'] = '^8.0.0'
    } else {
      pkg.dependencies['mysql2'] = '^3.0.0'
    }

    pkg.scripts['migration:run'] = 'tsx scripts/migrate.ts'
    pkg.scripts['migration:revert'] = 'tsx scripts/migrate.ts --down'
    pkg.scripts['migration:new'] = 'tsx scripts/migration-create.ts'
    pkg.scripts['db:seed'] = 'tsx src/database/seeds/seed.ts'
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
}

export async function writeKyselyService(appDir: string, config: ProjectConfig) {
  const destDir = join(appDir, 'src', 'modules', 'database')
  await mkdir(destDir, { recursive: true })

  let content: string

  if (config.database === 'postgres') {
    content = `import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { Database } from '../../database/database.types';

@Injectable()
export class KyselyService implements OnModuleDestroy {
  readonly db: Kysely<Database>;

  constructor() {
    this.db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: new Pool({
          host: process.env.DB_HOST ?? 'localhost',
          port: parseInt(process.env.DB_PORT ?? '5432', 10),
          user: process.env.DB_USER ?? 'postgres',
          password: process.env.DB_PASSWORD ?? '',
          database: process.env.DB_NAME ?? 'app',
        }),
      }),
    });
  }

  async onModuleDestroy() {
    await this.db.destroy();
  }
}
`
  } else {
    content = `import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2/promise';
import type { Database } from '../../database/database.types';

@Injectable()
export class KyselyService implements OnModuleDestroy {
  readonly db: Kysely<Database>;

  constructor() {
    this.db = new Kysely<Database>({
      dialect: new MysqlDialect({
        pool: createPool({
          host: process.env.DB_HOST ?? 'localhost',
          port: parseInt(process.env.DB_PORT ?? '3306', 10),
          user: process.env.DB_USER ?? 'mysql',
          password: process.env.DB_PASSWORD ?? '',
          database: process.env.DB_NAME ?? 'app',
        }),
      }),
    });
  }

  async onModuleDestroy() {
    await this.db.destroy();
  }
}
`
  }

  await writeFile(join(destDir, 'kysely.service.ts'), content, 'utf-8')
}

export async function writeMigrateScript(appDir: string, config: ProjectConfig) {
  const destDir = join(appDir, 'scripts')
  await mkdir(destDir, { recursive: true })

  let content: string

  if (config.database === 'postgres') {
    content = `import 'dotenv/config';
import { Kysely, PostgresDialect, Migrator, FileMigrationProvider } from 'kysely';
import { Pool } from 'pg';
import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const db = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path: { join },
      migrationFolder: join(__dirname, '../src/database/migrations'),
    }),
  });

  const down = process.argv.includes('--down');
  const { error, results } = down
    ? await migrator.migrateDown()
    : await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') console.log(\`✓ \${it.migrationName}\`);
    else if (it.status === 'Error') console.error(\`✗ \${it.migrationName}\`);
  });

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  await db.destroy();
}

migrate();
`
  } else {
    content = `import 'dotenv/config';
import { Kysely, MysqlDialect, Migrator, FileMigrationProvider } from 'kysely';
import { createPool } from 'mysql2/promise';
import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const db = new Kysely<any>({
    dialect: new MysqlDialect({
      pool: createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '3306', 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path: { join },
      migrationFolder: join(__dirname, '../src/database/migrations'),
    }),
  });

  const down = process.argv.includes('--down');
  const { error, results } = down
    ? await migrator.migrateDown()
    : await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') console.log(\`✓ \${it.migrationName}\`);
    else if (it.status === 'Error') console.error(\`✗ \${it.migrationName}\`);
  });

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  await db.destroy();
}

migrate();
`
  }

  await writeFile(join(destDir, 'migrate.ts'), content, 'utf-8')
}
