import { Product } from '../entities/Product';

// Domain Layer: Repository port (interface) - defines what we need, not how it's implemented
// Supports many-to-many relationship between users and products
export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findByUserId(userId: string): Promise<Product[]>;
  findAll(): Promise<Product[]>;
  save(product: Product): Promise<void>;
  deleteById(id: string): Promise<void>;
  // Many-to-many relationship methods
  // For document databases (Mongo/Firebase), pass the Product when creating new associations
  associateWithUser(productId: string, userId: string, product?: Product): Promise<void>;
  disassociateFromUser(productId: string, userId: string): Promise<void>;
}
