// Infrastructure: Environment configuration
export const env = {
  // Server
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  PORT: Number(process.env['PORT'] ?? 3000),
  HTTP_SERVER: process.env['HTTP_SERVER']?.toLowerCase() ?? 'express',

  // CORS
  FRONTEND_URL: process.env['FRONTEND_URL'],

  // PostgreSQL / TypeORM
  DB_HOST: process.env['DB_HOST'] ?? 'localhost',
  DB_PORT: Number(process.env['DB_PORT'] ?? 5432),
  DB_NAME: process.env['DB_NAME'] ?? 'clean_architecture',
  DB_USER: process.env['DB_USER'] ?? 'postgres',
  DB_PASSWORD: process.env['DB_PASSWORD'] ?? 'postgres',

  // MongoDB / Mongoose
  MONGO_URI: process.env['MONGO_URI'],
  MONGO_HOST: process.env['MONGO_HOST'] ?? 'localhost',
  MONGO_PORT: Number(process.env['MONGO_PORT'] ?? 27017),
  MONGO_DB_NAME: process.env['MONGO_DB_NAME'] ?? process.env['DB_NAME'] ?? 'clean_architecture',
} as const;



