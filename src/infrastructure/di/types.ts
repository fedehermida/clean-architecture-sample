// Infrastructure: Dependency Injection type symbols
// Only swappable infrastructure dependencies are bound to the container.
// Use cases and controllers are plain classes wired manually.
export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  ProductRepository: Symbol.for('ProductRepository'),

  // Database Connections
  DataSource: Symbol.for('DataSource'),

  // Services
  PasswordHasher: Symbol.for('PasswordHasher'),
  AuthenticationService: Symbol.for('AuthenticationService'),

  // HTTP Server
  HttpServer: Symbol.for('HttpServer'),
} as const;
