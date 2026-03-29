import { DeepPartial } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { ReadonlyEntityRepository } from './readonly-entity.repository';

export abstract class EntityRepository<
  T extends BaseEntity,
> extends ReadonlyEntityRepository<T> {
  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T> {
    await this.repo.update(id, data as any);
    return this.findById(id) as Promise<T>;
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
