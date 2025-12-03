import 'reflect-metadata';
import { injectable } from 'inversify';
import { Product } from '@domain/entities/Product';
import { ProductRepository } from '@domain/repositories/ProductRepository';

// Adapter: InMemory implementation of ProductRepository (for testing/development)
@injectable()
export class InMemoryProductRepository implements ProductRepository {
  private productsById = new Map<string, Product>();

  async findById(id: string): Promise<Product | null> {
    return this.productsById.get(id) ?? null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.productsById.values());
  }

  async save(product: Product): Promise<void> {
    this.productsById.set(product.id, product);
  }

  async deleteById(id: string): Promise<void> {
    this.productsById.delete(id);
  }
}
