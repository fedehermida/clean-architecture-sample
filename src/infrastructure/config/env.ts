// Infrastructure: Environment configuration
// All values should be provided via .env file (see .env.example)
// Only minimal safe defaults are provided for critical values

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return defaultValue;
  }
  return value;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return defaultValue;
  }
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number for environment variable ${key}: ${value}`);
  }
  return num;
}

export const env = {
  // Server
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 3000),
  HTTP_SERVER: getEnv('HTTP_SERVER', 'express').toLowerCase(),
  REPOSITORY_TYPE: getEnv('REPOSITORY_TYPE', 'inmemory').toLowerCase(),
  AUTH_PROVIDER: getEnv('AUTH_PROVIDER', 'inmemory').toLowerCase(),

  // JWT (for jwt auth provider)
  JWT_SECRET: getEnv('JWT_SECRET', 'clean-architecture-demo-secret'),

  // CORS
  FRONTEND_URL: process.env['FRONTEND_URL'],

  // PostgreSQL / TypeORM
  DB_HOST: getEnv('DB_HOST', 'localhost'),
  DB_PORT: getEnvNumber('DB_PORT', 5432),
  DB_NAME: getEnv('DB_NAME', 'clean_architecture'),
  DB_USER: getEnv('DB_USER', 'postgres'),
  DB_PASSWORD: getEnv('DB_PASSWORD', 'postgres'),

  // MongoDB / Mongoose
  MONGO_URI: process.env['MONGO_URI'],
  MONGO_HOST: getEnv('MONGO_HOST', 'localhost'),
  MONGO_PORT: getEnvNumber('MONGO_PORT', 27017),
  MONGO_DB_NAME: process.env['MONGO_DB_NAME'] ?? process.env['DB_NAME'] ?? 'clean_architecture',

  // Firebase / Firestore
  FIREBASE_PROJECT: getEnv('FIREBASE_PROJECT', 'clean-architecture-dev'),
  FIREBASE_AUTH_EMULATOR_HOST: process.env['FIREBASE_AUTH_EMULATOR_HOST'],
  FIRESTORE_EMULATOR_HOST: process.env['FIRESTORE_EMULATOR_HOST'],
  PUBSUB_EMULATOR_HOST: process.env['PUBSUB_EMULATOR_HOST'],
  FUNCTIONS_EMULATOR_HOST: process.env['FUNCTIONS_EMULATOR_HOST'],
  FIREBASE_DATABASE_EMULATOR_HOST: process.env['FIREBASE_DATABASE_EMULATOR_HOST'],
  FIREBASE_STORAGE_EMULATOR_HOST: process.env['FIREBASE_STORAGE_EMULATOR_HOST'],
} as const;
