import { ReadonlyEntityRepository } from './readonly-entity.repository';

export abstract class EntityRepository<
  TEntity,
  TFilters extends Record<string, unknown> = Record<string, never>,
  TInsert = Omit<TEntity, 'id' | 'createdAt' | 'updatedAt'>,
> extends ReadonlyEntityRepository<TEntity, TFilters> {
  async create(data: TInsert): Promise<TEntity> {
    const row = await this.db
      .insertInto(this.table as any)
      .values(data as any)
      .returningAll()
      .executeTakeFirstOrThrow();
    return this.mapFromDB(row as any);
  }

  async update(id: string | number, data: Partial<TInsert>): Promise<TEntity> {
    const row = await this.db
      .updateTable(this.table as any)
      .set(data as any)
      .where(`${this.table}.id` as any, '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
    return this.mapFromDB(row as any);
  }

  async remove(id: string | number): Promise<void> {
    await this.db
      .deleteFrom(this.table as any)
      .where(`${this.table}.id` as any, '=', id)
      .execute();
  }
}
