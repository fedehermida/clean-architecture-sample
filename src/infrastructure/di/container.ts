import 'reflect-metadata';
import { Container } from 'inversify';
import { DataSource } from 'typeorm';
import { TYPES } from './types';
import { env } from '@infrastructure/config/env';

// Application Layer
import { RegisterUser } from '@application/use-cases/RegisterUser';
import { GetUserById } from '@application/use-cases/GetUserById';
import { DeleteUser } from '@application/use-cases/DeleteUser';

// Adapters Layer
import { FastPasswordHasher } from '@adapters/services/FastPasswordHasher';
import { UserController } from '@adapters/http/controllers/UserController';
import { UserRepository } from '@domain/repositories/UserRepository';
import { PasswordHasher } from '@application/services/PasswordHasher';
import { InMemoryUserRepository } from '@adapters/repositories/InMemoryUserRepository';
import { TypeOrmUserRepository } from '@adapters/repositories/TypeOrmUserRepository';
import { MongoUserRepository } from '@adapters/repositories/MongoUserRepository';

// Infrastructure Layer
import { ExpressHttpServer } from '@infrastructure/http/ExpressHttpServer';
import { FastifyHttpServer } from '@infrastructure/http/FastifyHttpServer';
import { HttpServer } from '@presentation/http/HttpServer';
import {
  createTypeOrmDataSource,
  initializeTypeOrmDataSource,
} from '@infrastructure/database/typeorm/data-source';
import { connectMongoose } from '@infrastructure/database/mongoose/connection';

// Infrastructure: Dependency Injection Container
export async function createContainer(): Promise<Container> {
  const container = new Container();

  // Repository Implementation Selection
  // Choose ONE of the following configurations:

  // Option 1: In-Memory Repository (default, no database required)
  container.bind<UserRepository>(TYPES.UserRepository).to(InMemoryUserRepository);

  // Option 2: PostgreSQL with TypeORM
  // const dataSource = createTypeOrmDataSource();
  // await initializeTypeOrmDataSource(dataSource);
  // container.bind<DataSource>(TYPES.DataSource).toConstantValue(dataSource);
  // container.bind<UserRepository>(TYPES.UserRepository).to(TypeOrmUserRepository);

  // Option 3: MongoDB with Mongoose ODM
  // await connectMongoose();
  // container.bind<UserRepository>(TYPES.UserRepository).to(MongoUserRepository);

  // Bind services (adapters)
  container.bind<PasswordHasher>(TYPES.PasswordHasher).to(FastPasswordHasher);

  // Bind use cases (application layer)
  container.bind<RegisterUser>(TYPES.RegisterUser).to(RegisterUser);
  container.bind<GetUserById>(TYPES.GetUserById).to(GetUserById);
  container.bind<DeleteUser>(TYPES.DeleteUser).to(DeleteUser);

  // Bind controller (interface adapter)
  container.bind<UserController>(TYPES.UserController).to(UserController);

  // Bind HTTP server (infrastructure) - can switch between Express and Fastify
  if (env.HTTP_SERVER === 'fastify') {
    container.bind<HttpServer>(TYPES.HttpServer).to(FastifyHttpServer);
  } else {
    container.bind<HttpServer>(TYPES.HttpServer).to(ExpressHttpServer);
  }

  return container;
}
