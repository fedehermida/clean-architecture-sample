import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from './UserEntity';

export function createTypeOrmDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: process.env['DB_HOST'] ?? 'localhost',
    port: Number(process.env['DB_PORT'] ?? 5432),
    database: process.env['DB_NAME'] ?? 'clean_architecture',
    username: process.env['DB_USER'] ?? 'postgres',
    password: process.env['DB_PASSWORD'] ?? 'postgres',
    entities: [UserEntity],
    synchronize: true, // Automatically create/update database schema
    logging: process.env['NODE_ENV'] === 'development'
  });
}

export async function initializeTypeOrmDataSource(dataSource: DataSource): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
}

