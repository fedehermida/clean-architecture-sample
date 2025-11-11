import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { User } from '@domain/entities/User';
import { UserRepository } from '@domain/repositories/UserRepository';
import { UserEntity } from '@infrastructure/database/typeorm/UserEntity';
import { TYPES } from '@infrastructure/di/types';

// Adapter: TypeORM implementation of UserRepository
@injectable()
export class TypeOrmUserRepository implements UserRepository {
  private repository: Repository<UserEntity>;

  constructor(@inject(TYPES.DataSource) private readonly dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserEntity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      return null;
    }
    return this.mapEntityToUser(entity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    if (!entity) {
      return null;
    }
    return this.mapEntityToUser(entity);
  }

  async save(user: User): Promise<void> {
    const entity = this.mapUserToEntity(user);
    await this.repository.save(entity);
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private mapEntityToUser(entity: UserEntity): User {
    return User.create({
      id: entity.id,
      email: entity.email,
      passwordHash: entity.passwordHash,
      createdAt: entity.createdAt,
    });
  }

  private mapUserToEntity(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.id;
    entity.email = user.email;
    entity.passwordHash = user.passwordHash;
    entity.createdAt = user.createdAt;
    return entity;
  }
}
