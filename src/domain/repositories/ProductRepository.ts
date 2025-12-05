import { Product } from '../entities/Product';

// Domain Layer: Repository port (interface) - defines what we need, not how it's implemented
export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findByUserId(userId: string): Promise<Product[]>;
  findAll(): Promise<Product[]>;
  save(product: Product): Promise<void>;
  deleteById(id: string): Promise<void>;
}
