import 'reflect-metadata';
import { Container } from 'inversify';
import { DataSource } from 'typeorm';
import { TYPES } from './types';
import { env } from '@infrastructure/config/env';

// Application Layer - User Use Cases
import { RegisterUser } from '@application/use-cases/RegisterUser';
import { GetUserById } from '@application/use-cases/GetUserById';
import { GetUserByEmail } from '@application/use-cases/GetUserByEmail';
import { DeleteUser } from '@application/use-cases/DeleteUser';
import { LoginUser } from '@application/use-cases/LoginUser';
import { LogoutUser } from '@application/use-cases/LogoutUser';
// Application Layer - Product Use Cases
import { CreateProduct } from '@application/use-cases/CreateProduct';
import { GetProductById } from '@application/use-cases/GetProductById';
import { ListProducts } from '@application/use-cases/ListProducts';
import { DeleteProduct } from '@application/use-cases/DeleteProduct';
// Application Layer - Services
import { AuthenticationService } from '@application/services/AuthenticationService';
import { PasswordHasher } from '@application/services/PasswordHasher';

// Adapters Layer - Controllers
import { FastPasswordHasher } from '@adapters/services/FastPasswordHasher';
import { UserController } from '@adapters/http/controllers/UserController';
import { AuthController } from '@adapters/http/controllers/AuthController';
import { ProductController } from '@adapters/http/controllers/ProductController';
// Adapters Layer - User Repositories
import { UserRepository } from '@domain/repositories/UserRepository';
import { InMemoryUserRepository } from '@adapters/repositories/InMemoryUserRepository';
import { TypeOrmUserRepository } from '@adapters/repositories/TypeOrmUserRepository';
import { MongoUserRepository } from '@adapters/repositories/MongoUserRepository';
import { FirebaseUserRepository } from '@adapters/repositories/FirebaseUserRepository';
// Adapters Layer - Product Repositories
import { ProductRepository } from '@domain/repositories/ProductRepository';
import { InMemoryProductRepository } from '@adapters/repositories/InMemoryProductRepository';

// Auth Adapters
import { InMemoryAuthAdapter } from '@adapters/services/InMemoryAuthAdapter';
import { FirebaseAuthAdapter } from '@adapters/services/FirebaseAuthAdapter';
import { JwtAuthAdapter } from '@adapters/services/JwtAuthAdapter';

// Infrastructure Layer
import { ExpressHttpServer } from '@infrastructure/http/ExpressHttpServer';
import { FastifyHttpServer } from '@infrastructure/http/FastifyHttpServer';
import { HttpServer } from '@presentation/http/HttpServer';
import {
  createTypeOrmDataSource,
  initializeTypeOrmDataSource,
} from '@infrastructure/database/typeorm/data-source';
import { connectMongoose } from '@infrastructure/database/mongoose/connection';

// Application dependencies resolved from container
export interface AppDependencies {
  httpServer: HttpServer;
  userController: UserController;
  authController: AuthController;
  productController: ProductController;
}

// Infrastructure: Dependency Injection Container
// Only infrastructure concerns (swappable implementations) are bound to the container.
// Use cases and controllers are plain classes instantiated with resolved dependencies.
export async function createContainer(): Promise<AppDependencies> {
  const container = new Container();

  // ============================================================================
  // INFRASTRUCTURE BINDINGS (swappable implementations)
  // ============================================================================

  // User Repository Implementation Selection
  // Set REPOSITORY_TYPE environment variable to: 'inmemory', 'typeorm', 'mongoose', or 'firebase'
  const repositoryType = env.REPOSITORY_TYPE;

  if (repositoryType === 'typeorm') {
    // PostgreSQL with TypeORM
    const dataSource = createTypeOrmDataSource();
    await initializeTypeOrmDataSource(dataSource);
    container.bind<DataSource>(TYPES.DataSource).toConstantValue(dataSource);
    container.bind<UserRepository>(TYPES.UserRepository).to(TypeOrmUserRepository);
  } else if (repositoryType === 'mongoose') {
    // MongoDB with Mongoose ODM
    await connectMongoose();
    container.bind<UserRepository>(TYPES.UserRepository).to(MongoUserRepository);
  } else if (repositoryType === 'firebase') {
    // Firebase Firestore
    await import('@infrastructure/database/firestore/connection');
    container.bind<UserRepository>(TYPES.UserRepository).to(FirebaseUserRepository);
  } else {
    // In-Memory Repository (default, no database required)
    container.bind<UserRepository>(TYPES.UserRepository).to(InMemoryUserRepository);
  }

  // Product Repository (InMemory for now - can be extended to TypeORM/Mongoose/Firebase)
  container.bind<ProductRepository>(TYPES.ProductRepository).to(InMemoryProductRepository);

  // Password Hasher
  container.bind<PasswordHasher>(TYPES.PasswordHasher).to(FastPasswordHasher);

  // Authentication Provider Selection
  // Set AUTH_PROVIDER environment variable to: 'inmemory', 'firebase', or 'jwt'
  const authProvider = env.AUTH_PROVIDER;

  if (authProvider === 'firebase') {
    container.bind<AuthenticationService>(TYPES.AuthenticationService).to(FirebaseAuthAdapter);
  } else if (authProvider === 'jwt') {
    container.bind<AuthenticationService>(TYPES.AuthenticationService).to(JwtAuthAdapter);
  } else {
    container.bind<AuthenticationService>(TYPES.AuthenticationService).to(InMemoryAuthAdapter);
  }

  // HTTP Server Selection
  // Set HTTP_SERVER environment variable to: 'express' or 'fastify'
  if (env.HTTP_SERVER === 'fastify') {
    container.bind<HttpServer>(TYPES.HttpServer).to(FastifyHttpServer);
  } else {
    container.bind<HttpServer>(TYPES.HttpServer).to(ExpressHttpServer);
  }

  // ============================================================================
  // RESOLVE INFRASTRUCTURE DEPENDENCIES
  // ============================================================================

  const userRepository = container.get<UserRepository>(TYPES.UserRepository);
  const productRepository = container.get<ProductRepository>(TYPES.ProductRepository);
  const passwordHasher = container.get<PasswordHasher>(TYPES.PasswordHasher);
  const authService = container.get<AuthenticationService>(TYPES.AuthenticationService);
  const httpServer = container.get<HttpServer>(TYPES.HttpServer);

  // ============================================================================
  // WIRE USE CASES (plain classes, no DI decorators)
  // ============================================================================

  // User Use Cases
  const registerUser = new RegisterUser(userRepository, passwordHasher);
  const getUserById = new GetUserById(userRepository);
  const getUserByEmail = new GetUserByEmail(userRepository);
  const deleteUser = new DeleteUser(userRepository);
  const loginUser = new LoginUser(authService);
  const logoutUser = new LogoutUser(authService);

  // Product Use Cases
  const createProduct = new CreateProduct(productRepository);
  const getProductById = new GetProductById(productRepository);
  const listProducts = new ListProducts(productRepository);
  const deleteProduct = new DeleteProduct(productRepository);

  // ============================================================================
  // WIRE CONTROLLERS (plain classes, no DI decorators)
  // ============================================================================

  const userController = new UserController(
    registerUser,
    getUserById,
    getUserByEmail,
    deleteUser,
    userRepository,
  );

  const authController = new AuthController(loginUser, logoutUser, authService);

  const productController = new ProductController(
    createProduct,
    getProductById,
    listProducts,
    deleteProduct,
  );

  return {
    httpServer,
    userController,
    authController,
    productController,
  };
}
