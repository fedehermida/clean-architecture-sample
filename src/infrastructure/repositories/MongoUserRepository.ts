import { Collection, MongoClient } from 'mongodb';
import { User } from '@domain/entities/User';
import { UserRepository } from '@domain/repositories/UserRepository';

interface UserDocument {
  _id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export class MongoUserRepository implements UserRepository {
  private collection: Collection<UserDocument>;

  constructor(client: MongoClient, databaseName: string, collectionName: string = 'users') {
    const db = client.db(databaseName);
    this.collection = db.collection<UserDocument>(collectionName);
  }

  async findById(id: string): Promise<User | null> {
    const document = await this.collection.findOne({ _id: id } as Partial<UserDocument>);
    if (!document) {
      return null;
    }
    return this.mapDocumentToUser(document);
  }

  async findByEmail(email: string): Promise<User | null> {
    const document = await this.collection.findOne({ email } as Partial<UserDocument>);
    if (!document) {
      return null;
    }
    return this.mapDocumentToUser(document);
  }

  async save(user: User): Promise<void> {
    await this.collection.updateOne(
      { _id: user.id } as Partial<UserDocument>,
      {
        $set: {
          _id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          createdAt: user.createdAt,
        } as UserDocument,
      },
      { upsert: true },
    );
  }

  async deleteById(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id } as Partial<UserDocument>);
  }

  private mapDocumentToUser(document: UserDocument): User {
    return User.create({
      id: document._id,
      email: document.email,
      passwordHash: document.passwordHash,
      createdAt:
        document.createdAt instanceof Date ? document.createdAt : new Date(document.createdAt),
    });
  }
}
