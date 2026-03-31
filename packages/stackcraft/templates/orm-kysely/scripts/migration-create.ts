import { writeFileSync } from 'node:fs';

const name = process.argv[2];
if (!name) {
  console.error('Usage: pnpm migration:new <name>');
  process.exit(1);
}

const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const path = `src/database/migrations/${ts}-${name}.ts`;

writeFileSync(
  path,
  `import { Kysely } from 'kysely';
import { withDefaults, createTable, dropTable } from '../utils';

export async function up(db: Kysely<any>): Promise<void> {
  await withDefaults(
    createTable(db, '${name}')
      // .addColumn('name', 'varchar(255)', (col) => col.notNull())
  ).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await dropTable(db, '${name}');
}
`,
);

console.log('Created:', path);
