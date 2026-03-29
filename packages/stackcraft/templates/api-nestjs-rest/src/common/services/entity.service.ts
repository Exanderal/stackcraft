import { DeepPartial } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { EntityRepository } from '../repositories/entity.repository';
import { ReadonlyEntityService } from './readonly-entity.service';

export abstract class EntityService<
  T extends BaseEntity,
> extends ReadonlyEntityService<T> {
  constructor(protected readonly repository: EntityRepository<T>) {
    super(repository);
  }

  create(data: DeepPartial<T>): Promise<T> {
    return this.repository.create(data);
  }

  update(id: string, data: DeepPartial<T>): Promise<T> {
    return this.repository.update(id, data);
  }

  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
