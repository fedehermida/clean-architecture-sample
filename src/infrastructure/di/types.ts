// Infrastructure: Dependency Injection type symbols
export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),

  // Database Connections
  DataSource: Symbol.for('DataSource'),

  // Services
  PasswordHasher: Symbol.for('PasswordHasher'),

  // Use Cases
  RegisterUser: Symbol.for('RegisterUser'),
  GetUserById: Symbol.for('GetUserById'),
  DeleteUser: Symbol.for('DeleteUser'),

  // Controllers
  UserController: Symbol.for('UserController'),

  // HTTP Server
  HttpServer: Symbol.for('HttpServer'),
} as const;
