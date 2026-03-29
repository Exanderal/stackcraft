import { FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

export abstract class ReadonlyEntityRepository<T extends BaseEntity> {
  constructor(protected readonly repo: Repository<T>) {}

  findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find(options);
  }

  findByIds(ids: string[]): Promise<T[]> {
    return this.repo.findBy({ id: In(ids) } as FindOptionsWhere<T>);
  }

  findById(id: string): Promise<T | null> {
    return this.repo.findOneBy({ id } as FindOptionsWhere<T>);
  }

  findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repo.findOneBy(where);
  }
}
