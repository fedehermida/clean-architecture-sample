// Infrastructure: Pure TypeScript factory functions for dependency injection
// No decorators, no reflect-metadata, maximum educational clarity

import { env } from '@infrastructure/config/env';

// Domain Repositories
import { UserRepository } from '@domain/repositories/UserRepository';
import { ProductRepository } from '@domain/repositories/ProductRepository';

// Repository Implementations
import { InMemoryUserRepository } from '@adapters/repositories/InMemoryUserRepository';
import { TypeOrmUserRepository } from '@adapters/repositories/TypeOrmUserRepository';
import { MongoUserRepository } from '@adapters/repositories/MongoUserRepository';
import { FirebaseUserRepository } from '@adapters/repositories/FirebaseUserRepository';
import { InMemoryProductRepository } from '@adapters/repositories/InMemoryProductRepository';

// Application Services
import { PasswordHasher } from '@application/services/PasswordHasher';
import { AuthenticationService } from '@application/services/AuthenticationService';
import { EventDispatcher } from '@application/services/EventDispatcher';

// Service Implementations
import { FastPasswordHasher } from '@adapters/services/FastPasswordHasher';
import { InMemoryAuthAdapter } from '@adapters/services/InMemoryAuthAdapter';
import { FirebaseAuthAdapter } from '@adapters/services/FirebaseAuthAdapter';
import { JwtAuthAdapter } from '@adapters/services/JwtAuthAdapter';
import { InMemoryEventDispatcher } from '@adapters/services/InMemoryEventDispatcher';

// Use Cases
import { RegisterUser } from '@application/use-cases/RegisterUser';
import { GetUserById } from '@application/use-cases/GetUserById';
import { GetUserByEmail } from '@application/use-cases/GetUserByEmail';
import { DeleteUser } from '@application/use-cases/DeleteUser';
import { LoginUser } from '@application/use-cases/LoginUser';
import { LogoutUser } from '@application/use-cases/LogoutUser';
import { CreateProduct } from '@application/use-cases/CreateProduct';
import { GetProductById } from '@application/use-cases/GetProductById';
import { ListProducts } from '@application/use-cases/ListProducts';
import { DeleteProduct } from '@application/use-cases/DeleteProduct';

// Controllers
import { UserController } from '@adapters/http/controllers/UserController';
import { AuthController } from '@adapters/http/controllers/AuthController';
import { ProductController } from '@adapters/http/controllers/ProductController';

// HTTP Server
import { HttpServer } from '@presentation/http/HttpServer';
import { ExpressHttpServer } from '@infrastructure/http/ExpressHttpServer';
import { FastifyHttpServer } from '@infrastructure/http/FastifyHttpServer';

// Database connections
import {
  createTypeOrmDataSource,
  initializeTypeOrmDataSource,
} from '@infrastructure/database/typeorm/data-source';
import { connectMongoose } from '@infrastructure/database/mongoose/connection';
import { DataSource } from 'typeorm';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export type RepositoryType = 'inmemory' | 'typeorm' | 'mongoose' | 'firebase';
export type AuthProviderType = 'inmemory' | 'firebase' | 'jwt';
export type HttpServerType = 'express' | 'fastify';

export interface AppConfig {
  repositoryType: RepositoryType;
  authProvider: AuthProviderType;
  httpServer: HttpServerType;
}

// ============================================================================
// APPLICATION DEPENDENCIES (what bootstrap() returns)
// ============================================================================

export interface AppDependencies {
  // Infrastructure
  httpServer: HttpServer;
  eventDispatcher: EventDispatcher;

  // Controllers
  userController: UserController;
  authController: AuthController;
  productController: ProductController;

  // Cleanup function for graceful shutdown
  cleanup: () => Promise<void>;
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

// Create user repository based on configuration
async function createUserRepository(
  type: RepositoryType,
  dataSource?: DataSource,
): Promise<UserRepository> {
  switch (type) {
    case 'typeorm':
      if (!dataSource) {
        throw new Error('DataSource required for TypeORM repository');
      }
      return new TypeOrmUserRepository(dataSource);

    case 'mongoose':
      return new MongoUserRepository();

    case 'firebase':
      return new FirebaseUserRepository();

    case 'inmemory':
    default:
      return new InMemoryUserRepository();
  }
}

// Create product repository based on configuration
function createProductRepository(_type: RepositoryType): ProductRepository {
  // For now, only in-memory is implemented for products
  // This can be extended to support other types
  return new InMemoryProductRepository();
}

// Create password hasher
function createPasswordHasher(): PasswordHasher {
  return new FastPasswordHasher();
}

// Create authentication service based on configuration
function createAuthService(type: AuthProviderType): AuthenticationService {
  switch (type) {
    case 'firebase':
      return new FirebaseAuthAdapter();

    case 'jwt':
      return new JwtAuthAdapter();

    case 'inmemory':
    default:
      return new InMemoryAuthAdapter();
  }
}

// Create event dispatcher
function createEventDispatcher(): EventDispatcher {
  return new InMemoryEventDispatcher();
}

// Create HTTP server based on configuration
function createHttpServer(type: HttpServerType): HttpServer {
  switch (type) {
    case 'fastify':
      return new FastifyHttpServer();

    case 'express':
    default:
      return new ExpressHttpServer();
  }
}

// Wire user-related use cases
function createUserUseCases(
  userRepository: UserRepository,
  passwordHasher: PasswordHasher,
) {
  return {
    registerUser: new RegisterUser(userRepository, passwordHasher),
    getUserById: new GetUserById(userRepository),
    getUserByEmail: new GetUserByEmail(userRepository),
    deleteUser: new DeleteUser(userRepository),
  };
}

// Wire auth-related use cases
function createAuthUseCases(authService: AuthenticationService) {
  return {
    loginUser: new LoginUser(authService),
    logoutUser: new LogoutUser(authService),
  };
}

// Wire product-related use cases
function createProductUseCases(productRepository: ProductRepository) {
  return {
    createProduct: new CreateProduct(productRepository),
    getProductById: new GetProductById(productRepository),
    listProducts: new ListProducts(productRepository),
    deleteProduct: new DeleteProduct(productRepository),
  };
}

// ============================================================================
// BOOTSTRAP FUNCTION (Composition Root)
// ============================================================================

export async function bootstrap(config?: Partial<AppConfig>): Promise<AppDependencies> {
  // Merge with defaults from environment
  const finalConfig: AppConfig = {
    repositoryType: config?.repositoryType ?? (env.REPOSITORY_TYPE as RepositoryType),
    authProvider: config?.authProvider ?? (env.AUTH_PROVIDER as AuthProviderType),
    httpServer: config?.httpServer ?? (env.HTTP_SERVER as HttpServerType),
  };

  let dataSource: DataSource | undefined;
  let cleanup = async () => {};

  // ============================================================================
  // INFRASTRUCTURE SETUP
  // ============================================================================

  // Initialize database connection if needed
  if (finalConfig.repositoryType === 'typeorm') {
    dataSource = createTypeOrmDataSource();
    await initializeTypeOrmDataSource(dataSource);
    cleanup = async () => {
      if (dataSource?.isInitialized) {
        await dataSource.destroy();
      }
    };
  } else if (finalConfig.repositoryType === 'mongoose') {
    await connectMongoose();
    cleanup = async () => {
      const mongoose = await import('mongoose');
      await mongoose.default.disconnect();
    };
  } else if (finalConfig.repositoryType === 'firebase') {
    await import('@infrastructure/database/firestore/connection');
  }

  // ============================================================================
  // CREATE INFRASTRUCTURE DEPENDENCIES
  // ============================================================================

  const userRepository = await createUserRepository(finalConfig.repositoryType, dataSource);
  const productRepository = createProductRepository(finalConfig.repositoryType);
  const passwordHasher = createPasswordHasher();
  const authService = createAuthService(finalConfig.authProvider);
  const eventDispatcher = createEventDispatcher();
  const httpServer = createHttpServer(finalConfig.httpServer);

  // ============================================================================
  // WIRE USE CASES
  // ============================================================================

  const userUseCases = createUserUseCases(userRepository, passwordHasher);
  const authUseCases = createAuthUseCases(authService);
  const productUseCases = createProductUseCases(productRepository);

  // ============================================================================
  // WIRE CONTROLLERS
  // ============================================================================

  const userController = new UserController(
    userUseCases.registerUser,
    userUseCases.getUserById,
    userUseCases.getUserByEmail,
    userUseCases.deleteUser,
    userRepository,
  );

  const authController = new AuthController(
    authUseCases.loginUser,
    authUseCases.logoutUser,
    authService,
  );

  const productController = new ProductController(
    productUseCases.createProduct,
    productUseCases.getProductById,
    productUseCases.listProducts,
    productUseCases.deleteProduct,
  );

  // ============================================================================
  // RETURN APPLICATION DEPENDENCIES
  // ============================================================================

  return {
    httpServer,
    eventDispatcher,
    userController,
    authController,
    productController,
    cleanup,
  };
}

// ============================================================================
// CONVENIENCE FUNCTION FOR TESTING
// ============================================================================

export function bootstrapForTesting(): Promise<AppDependencies> {
  return bootstrap({
    repositoryType: 'inmemory',
    authProvider: 'inmemory',
    httpServer: 'express',
  });
}
