import 'reflect-metadata'; // Must be imported before TypeORM
import { UserRepository } from '@domain/repositories/UserRepository';
import { InMemoryUserRepository } from './InMemoryUserRepository';
import { TypeOrmUserRepository } from './TypeOrmUserRepository';
import { MongoUserRepository } from './MongoUserRepository';
import { DataSource } from 'typeorm';
import { MongoClient } from 'mongodb';
import {
  createTypeOrmDataSource,
  initializeTypeOrmDataSource,
} from '../database/typeorm/data-source';
import {
  createMongoClient,
  connectMongoClient,
  initializeDatabase as initMongo,
} from '../database/mongodb';

export type RepositoryType = 'inmemory' | 'postgres' | 'mongodb';

export interface RepositoryConfig {
  type: RepositoryType;
  dataSource?: DataSource;
  mongoClient?: MongoClient;
  databaseName?: string;
}

export async function createUserRepository(config: RepositoryConfig): Promise<UserRepository> {
  switch (config.type) {
    case 'inmemory':
      return new InMemoryUserRepository();

    case 'postgres': {
      let dataSource = config.dataSource;
      if (!dataSource) {
        dataSource = createTypeOrmDataSource();
        await initializeTypeOrmDataSource(dataSource);
      }
      return new TypeOrmUserRepository(dataSource);
    }

    case 'mongodb': {
      const dbName =
        config.databaseName ??
        process.env['MONGO_DB_NAME'] ??
        process.env['DB_NAME'] ??
        'clean_architecture';

      let client = config.mongoClient;
      if (!client) {
        client = createMongoClient();
        await connectMongoClient(client);
        await initMongo(client, dbName);
      }

      return new MongoUserRepository(client, dbName);
    }

    default:
      throw new Error(`Unsupported repository type: ${config.type}`);
  }
}

export async function createUserRepositoryFromEnv(): Promise<UserRepository> {
  const repoType = (process.env['REPOSITORY_TYPE'] ?? 'inmemory').toLowerCase() as RepositoryType;

  const config: RepositoryConfig = {
    type: repoType,
    databaseName: process.env['MONGO_DB_NAME'] ?? process.env['DB_NAME'] ?? 'clean_architecture',
  };

  return createUserRepository(config);
}
