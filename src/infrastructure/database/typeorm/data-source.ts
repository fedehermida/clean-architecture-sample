import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from './UserEntity';
import { ProductEntity } from './ProductEntity';
import { UserProductEntity } from './UserProductEntity';
import { env } from '@infrastructure/config/env';

// Framework & Driver: TypeORM DataSource configuration and initialization
export function createTypeOrmDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    entities: [UserEntity, ProductEntity, UserProductEntity],
    synchronize: true, // Automatically create/update database schema
    logging: env.NODE_ENV === 'development',
  });
}

export async function initializeTypeOrmDataSource(dataSource: DataSource): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
}
