import { User } from '../entities/User';

// Domain Layer: Repository port (interface) - defines what we need, not how it's implemented
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  deleteById(id: string): Promise<void>;
}


