import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { ReadonlyEntityRepository } from '../repositories/readonly-entity.repository';

export abstract class ReadonlyEntityService<T extends BaseEntity> {
  constructor(protected readonly repository: ReadonlyEntityRepository<T>) {}

  findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.findAll(options);
  }

  findByIds(ids: string[]): Promise<T[]> {
    return this.repository.findByIds(ids);
  }

  findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne(where);
  }
}
