import type { Kysely, Selectable } from 'kysely';
import type { Database } from '../../database/database.types';

export function where(column: string) {
  return (qb: any, value: unknown) => qb.where(column, '=', value);
}

export abstract class ReadonlyEntityRepository<
  TableName extends keyof Database & string,
  TEntity = Selectable<Database[TableName]>,
  TFilters extends Record<string, unknown> = Record<string, never>,
> {
  constructor(protected readonly db: Kysely<Database>) {}

  protected abstract table: TableName;

  protected filters: Partial<Record<keyof TFilters, (qb: any, value: unknown) => any>> = {};

  protected queryable() {
    return this.db.selectFrom(this.table);
  }

  async findAll(filters?: Partial<TFilters>): Promise<TEntity[]> {
    let q = this.queryable();
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        const fn = this.filters[key as keyof TFilters];
        if (value !== undefined && fn) q = fn(q, value);
      }
    }
    return (await q.selectAll().execute()) as TEntity[];
  }

  async findById(id: string | number): Promise<TEntity | null> {
    const row = await this.queryable()
      .selectAll()
      // biome-ignore lint/suspicious/noExplicitAny: column 'id' cannot be inferred from a generic TableName without schema knowledge
      .where('id' as any, '=', id)
      .executeTakeFirst();
    return row ? (row as TEntity) : null;
  }

  protected mapFromDB(row: Selectable<Database[TableName]>): TEntity {
    return row as TEntity;
  }
}
