import { Kysely } from 'kysely';
import type { Database } from '../../database/database.types';

export function where(column: string) {
  return (qb: any, value: unknown) => qb.where(column, '=', value);
}

export abstract class ReadonlyEntityRepository<
  TEntity,
  TFilters extends Record<string, unknown> = Record<string, never>,
> {
  constructor(protected readonly db: Kysely<Database>) {}

  protected abstract table: string;

  protected filters: Partial<
    Record<keyof TFilters, (qb: any, value: any) => any>
  > = {};

  protected queryable() {
    return this.db.selectFrom(this.table as any);
  }

  async findAll(filters?: Partial<TFilters>): Promise<TEntity[]> {
    let q = this.queryable();
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        const fn = (this.filters as any)[key];
        if (value !== undefined && fn) q = fn(q, value);
      }
    }
    return (await q.selectAll().execute()).map((r) => this.mapFromDB(r as any));
  }

  async findById(id: string | number): Promise<TEntity | null> {
    const row = await this.queryable()
      .selectAll()
      .where(`${this.table}.id` as any, '=', id)
      .executeTakeFirst();
    return row ? this.mapFromDB(row as any) : null;
  }

  protected mapFromDB(row: any): TEntity {
    return row;
  }
}
