import { sql, CreateTableBuilder } from 'kysely';

export function withUuid<T extends string, C extends string>(
  builder: CreateTableBuilder<T, C>,
  dialect: 'postgres' | 'mysql' = 'postgres',
) {
  const defaultFn =
    dialect === 'mysql' ? sql`(UUID())` : sql`gen_random_uuid()`;
  return builder.addColumn('id', 'uuid', (col) =>
    col.primaryKey().defaultTo(defaultFn),
  );
}

export function withTimestamps<T extends string, C extends string>(
  builder: CreateTableBuilder<T, C>,
) {
  return builder
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    );
}

// Shorthand: uuid primary key + timestamps
export function withDefaults<T extends string, C extends string>(
  builder: CreateTableBuilder<T, C>,
  dialect: 'postgres' | 'mysql' = 'postgres',
) {
  return withTimestamps(withUuid(builder, dialect));
}
