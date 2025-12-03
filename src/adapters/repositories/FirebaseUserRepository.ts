import { User, UserRole } from '@domain/entities/User';
import { UserRepository } from '@domain/repositories/UserRepository';
import { firestore } from '@infrastructure/database/firestore/connection';

// Adapter: Firestore implementation of UserRepository
export class FirebaseUserRepository implements UserRepository {
  private readonly collection = firestore.collection('users');

  async findById(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return this.mapDocumentToUser(doc.id, doc.data());
  }

  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    if (!doc) {
      return null;
    }
    return this.mapDocumentToUser(doc.id, doc.data());
  }

  async save(user: User): Promise<void> {
    await this.collection.doc(user.id).set({
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  private mapDocumentToUser(id: string, data: FirebaseFirestore.DocumentData | undefined): User {
    if (!data) {
      throw new Error('Document data is undefined');
    }

    return User.create({
      id,
      email: data['email'] as string,
      passwordHash: data['passwordHash'] as string,
      createdAt:
        data['createdAt']?.toDate?.() ?? new Date((data['createdAt'] as string | Date) ?? Date.now()),
    });
  }
}

