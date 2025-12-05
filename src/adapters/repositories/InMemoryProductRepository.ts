import 'reflect-metadata';
import { injectable } from 'inversify';
import { Product } from '@domain/entities/Product';
import { ProductRepository } from '@domain/repositories/ProductRepository';

// Adapter: InMemory implementation of ProductRepository with many-to-many user-product support
@injectable()
export class InMemoryProductRepository implements ProductRepository {
  private productsById = new Map<string, Product>();
  // Many-to-many: Map of userId -> Set of productIds
  private userProductAssociations = new Map<string, Set<string>>();

  async findById(id: string): Promise<Product | null> {
    return this.productsById.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Product[]> {
    const productIds = this.userProductAssociations.get(userId);
    if (!productIds || productIds.size === 0) {
      return [];
    }

    return Array.from(productIds)
      .map((id) => this.productsById.get(id))
      .filter((product): product is Product => product !== undefined);
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.productsById.values());
  }

  async save(product: Product): Promise<void> {
    this.productsById.set(product.id, product);
  }

  async deleteById(id: string): Promise<void> {
    this.productsById.delete(id);
    // Remove all associations for this product
    for (const productIds of this.userProductAssociations.values()) {
      productIds.delete(id);
    }
  }

  async associateWithUser(productId: string, userId: string, _product?: Product): Promise<void> {
    // product parameter is optional and unused for in-memory (product already saved via save())
    if (!this.userProductAssociations.has(userId)) {
      this.userProductAssociations.set(userId, new Set());
    }
    this.userProductAssociations.get(userId)!.add(productId);
  }

  async disassociateFromUser(productId: string, userId: string): Promise<void> {
    const productIds = this.userProductAssociations.get(userId);
    if (productIds) {
      productIds.delete(productId);
    }
  }
}
