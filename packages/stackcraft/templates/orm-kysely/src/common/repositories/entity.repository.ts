import type { Insertable, Selectable } from 'kysely';
import type { Database } from '../../database/database.types';
import { ReadonlyEntityRepository } from './readonly-entity.repository';

export abstract class EntityRepository<
  TableName extends keyof Database & string,
  TEntity = Selectable<Database[TableName]>,
  TFilters extends Record<string, unknown> = Record<string, never>,
> extends ReadonlyEntityRepository<TableName, TEntity, TFilters> {
  async create(data: Insertable<Database[TableName]>): Promise<TEntity> {
    const row = await this.db
      .insertInto(this.table)
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
    return row as TEntity;
  }

  async update(id: string | number, data: Partial<Insertable<Database[TableName]>>): Promise<TEntity> {
    const row = await this.db
      .updateTable(this.table)
      .set(data)
      // biome-ignore lint/suspicious/noExplicitAny: column 'id' cannot be inferred from a generic TableName without schema knowledge
      .where('id' as any, '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
    return row as TEntity;
  }

  async remove(id: string | number): Promise<void> {
    await this.db
      .deleteFrom(this.table)
      // biome-ignore lint/suspicious/noExplicitAny: column 'id' cannot be inferred from a generic TableName without schema knowledge
      .where('id' as any, '=', id)
      .execute();
  }
}
