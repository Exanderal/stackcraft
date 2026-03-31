import { Kysely } from 'kysely';

export async function createIndex(
  db: Kysely<any>,
  table: string,
  columns: string | string[],
  opts?: { unique?: boolean; name?: string },
) {
  const cols = Array.isArray(columns) ? columns : [columns];
  const name = opts?.name ?? `idx_${table}_${cols.join('_')}`;
  let b = db.schema.createIndex(name).on(table).columns(cols);
  if (opts?.unique) b = (b as any).unique();
  await b.execute();
}

export const createUniqueIndex = (
  db: Kysely<any>,
  table: string,
  columns: string | string[],
) => createIndex(db, table, columns, { unique: true });
