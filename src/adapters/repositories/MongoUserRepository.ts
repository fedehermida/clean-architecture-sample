import { User, UserRole } from '@domain/entities/User';
import { UserRepository } from '@domain/repositories/UserRepository';
import { UserModel, UserDocument } from '@infrastructure/database/mongoose/UserModel';

// Adapter: MongoDB implementation of UserRepository using Mongoose ODM
export class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const document = await UserModel.findById(id).exec();
    if (!document) {
      return null;
    }
    return this.mapDocumentToUser(document);
  }

  async findByEmail(email: string): Promise<User | null> {
    const document = await UserModel.findOne({ email }).exec();
    if (!document) {
      return null;
    }
    return this.mapDocumentToUser(document);
  }

  async save(user: User): Promise<void> {
    await UserModel.findOneAndUpdate(
      { _id: user.id },
      {
        _id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
      },
      {
        upsert: true,
        new: true,
      },
    ).exec();
  }

  async deleteById(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id).exec();
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
