import 'reflect-metadata';
import mongoose from 'mongoose';
import { env } from '@infrastructure/config/env';

// Framework & Driver: Mongoose connection configuration and initialization
export async function connectMongoose(): Promise<void> {
  const connectionString =
    env.MONGO_URI ?? `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}`;

  const fullConnectionString = `${connectionString}/${env.MONGO_DB_NAME}`;

  try {
    await mongoose.connect(fullConnectionString, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
    });

    // Verify connection
    await mongoose.connection.db?.admin().ping();
  } catch (error) {
    throw new Error(`Failed to connect to MongoDB: ${error}`);
  }
}

export async function disconnectMongoose(): Promise<void> {
  await mongoose.disconnect();
}

