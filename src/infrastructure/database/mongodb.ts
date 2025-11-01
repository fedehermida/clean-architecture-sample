import { MongoClient } from 'mongodb';

export function createMongoClient(): MongoClient {
  const connectionString =
    process.env['MONGO_URI'] ??
    `mongodb://${process.env['MONGO_HOST'] ?? 'localhost'}:${process.env['MONGO_PORT'] ?? 27017}`;

  return new MongoClient(connectionString, {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    minPoolSize: 5,
    maxIdleTimeMS: 30000
  });
}

export async function connectMongoClient(client: MongoClient): Promise<void> {
  try {
    await client.connect();
    // Verify connection
    await client.db('admin').command({ ping: 1 });
  } catch (error) {
    throw new Error(`Failed to connect to MongoDB: ${error}`);
  }
}

export async function initializeDatabase(client: MongoClient, databaseName: string): Promise<void> {
  const db = client.db(databaseName);
  const collection = db.collection('users');

  // Create indexes
  await collection.createIndex({ email: 1 }, { unique: true });
  await collection.createIndex({ _id: 1 });
}

export async function closeMongoClient(client: MongoClient): Promise<void> {
  await client.close();
}

