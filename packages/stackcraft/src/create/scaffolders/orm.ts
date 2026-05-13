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
    pkg.dependencies['kysely'] = '^0.28.14'
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
import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  // biome-ignore lint/suspicious/noExplicitAny: migration script uses dynamic DB types
  const db = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: process.env.DB_HOST,
        port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
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

  for (const it of results ?? []) {
    if (it.status === 'Success') console.log(\`✓ \${it.migrationName}\`);
    else if (it.status === 'Error') console.error(\`✗ \${it.migrationName}\`);
  }

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
import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FileMigrationProvider, Kysely, Migrator, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2/promise';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  // biome-ignore lint/suspicious/noExplicitAny: migration script uses dynamic DB types
  const db = new Kysely<any>({
    dialect: new MysqlDialect({
      pool: createPool({
        host: process.env.DB_HOST,
        port: Number.parseInt(process.env.DB_PORT ?? '3306', 10),
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

  for (const it of results ?? []) {
    if (it.status === 'Success') console.log(\`✓ \${it.migrationName}\`);
    else if (it.status === 'Error') console.error(\`✗ \${it.migrationName}\`);
  }

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

export async function writeBEClaudeMd(appDir: string, config: ProjectConfig) {
  const backendSection = config.backend === 'nestjs-graphql'
    ? GRAPHQL_SECTION
    : REST_SECTION

  const ormSection = config.orm === 'prisma'
    ? PRISMA_SECTION
    : KYSELY_SECTION

  await writeFile(join(appDir, 'CLAUDE.md'), `${backendSection}\n${ormSection}`, 'utf-8')
}

const REST_SECTION = `\
## Code generation

New modules are created with the Nx generator — never write module boilerplate by hand:

\`\`\`
nx g module <name>       # module / service / repository / model
nx g controller <name>   # REST controller for an existing module
\`\`\`

## Layer responsibilities

- **Controller**: HTTP decorators + delegate to service. No business logic.
- **Service**: Business logic only. Calls repository.
- **Repository**: Data access only. No logic.

Never skip a layer or let logic bleed across boundaries.

## DTOs for all inputs

Every \`@Body()\` and \`@Query()\` parameter uses a class-validator DTO class. Never accept \`any\` or raw objects across the HTTP boundary.

## Swagger decorators are mandatory

Every controller and every endpoint must have \`@ApiTags\`, \`@ApiOperation\`, and \`@ApiResponse\` decorators. The generated \`swagger.json\` is the source of truth for \`packages/types\` codegen — a missing or wrong decorator breaks the frontend type contract.

Run \`nx run types:codegen\` from the workspace root after changing controllers or DTOs to regenerate types in \`packages/types/src/rest\`.

## \`ValidationPipe\` is global

Set once in \`main.ts\`. Never add it per-route or per-controller.
`

const GRAPHQL_SECTION = `\
## Code generation

New modules are created with the Nx generator — never write module boilerplate by hand:

\`\`\`
nx g module <name>       # module / service / repository / model + GraphQL model
nx g resolver <name>     # GraphQL resolver for an existing module
\`\`\`

## Layer responsibilities

- **Resolver**: GraphQL decorators + delegate to service. No business logic.
- **Service**: Business logic only. Calls repository.
- **Repository**: Data access only. No logic.

Never skip a layer or let logic bleed across boundaries.

## \`@ObjectType\` models are separate from DB models

GraphQL output types and ORM entities are different classes. Never decorate a database entity with \`@ObjectType()\`.

## \`@InputType\` for mutation args

Mutations take a dedicated \`@InputType()\` class. Don't use multiple individual \`@Args()\` primitives except for simple id lookups.

## DataLoader for relational fields

Any resolver field that loads related entities must go through a DataLoader to prevent N+1 queries.

## \`schema.gql\` is never edited directly

It is auto-generated and is the source of truth for \`packages/types\` codegen. Any schema change must come from changing resolver or model code.

Run \`nx run types:codegen\` from the workspace root after schema changes to regenerate typed React Apollo hooks in \`packages/types\`.
`

const KYSELY_SECTION = `\
## Database: Kysely

### Migrations

Always create migrations with \`pnpm migration:new <name>\` — never write a migration file by hand. Run \`pnpm migration:run\` to apply, \`pnpm migration:revert\` to roll back one step.

Every new table must use the helpers from \`src/database/utils\`:
- \`withDefaults(createTable(db, 'name'))\` — uuid primary key + timestamps
- \`createIndex\` / \`createUniqueIndex\` for indexes

### \`database.types.ts\`

After every migration that adds or changes a table, update the \`Database\` interface in \`src/database/database.types.ts\` to match. This is the source of Kysely's type safety. The generated \`*.model.ts\` includes the exact snippet to add.

### Repositories

Always extend \`EntityRepository\`. Never inject \`KyselyService\` directly into a service — data access goes through the repository layer only.

Add filterable columns to \`protected filters\` using the \`where()\` helper. Don't write custom \`findBy*\` methods for simple equality filters.

### Seeds

\`pnpm db:seed\`
`

const PRISMA_SECTION = `\
## Database: Prisma

### Schema-first

All model changes start in \`prisma/schema.prisma\`. Never type a model manually or touch generated Prisma client files before updating the schema.

### Migrations

After editing \`schema.prisma\`, run \`pnpm migration:run\` (\`prisma migrate dev\`). Never use \`prisma db push\` outside of throwaway local environments — it bypasses migration history.

To generate a named migration: \`pnpm migration:new -- --name <name>\`.

### \`*.model.ts\`

The \`type\` in each \`*.model.ts\` mirrors the Prisma schema model and is used by the service and resolver/controller. Extend it when you add fields to the schema.

### Repositories

Repositories are the only layer that touches \`PrismaService\`. Services never call \`prisma.*\` directly.

### Seeds and tooling

- Seed: \`pnpm db:seed\`
- Prisma Studio: \`pnpm db:studio\`
`
