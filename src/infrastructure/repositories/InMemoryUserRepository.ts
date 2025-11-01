import { User } from '@domain/entities/User';
import { UserRepository } from '@domain/repositories/UserRepository';

export class InMemoryUserRepository implements UserRepository {
  private usersByEmail = new Map<string, User>();
  private usersById = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.usersById.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) ?? null;
  }

  async save(user: User): Promise<void> {
    this.usersByEmail.set(user.email, user);
    this.usersById.set(user.id, user);
  }

  async deleteById(id: string): Promise<void> {
    const user = this.usersById.get(id);
    if (user) {
      this.usersById.delete(id);
      this.usersByEmail.delete(user.email);
    }
  }
}


