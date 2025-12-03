import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProductRepository } from '@adapters/repositories/InMemoryProductRepository';
import { DeleteProduct } from '@application/use-cases/DeleteProduct';
import { Product } from '@domain/entities/Product';

describe('DeleteProduct Use Case', () => {
  let repo: InMemoryProductRepository;
  let usecase: DeleteProduct;

  const productId = '550e8400-e29b-41d4-a716-446655440001';
  const nonExistentId = '550e8400-e29b-41d4-a716-446655440099';

  beforeEach(() => {
    repo = new InMemoryProductRepository();
    usecase = new DeleteProduct(repo);
  });

  describe('successful deletion', () => {
    it('deletes an existing product', async () => {
      const product = Product.create({
        id: productId,
        name: 'To Delete',
        description: '',
        price: 10,
        stock: 5,
      });
      await repo.save(product);

      const result = await usecase.execute({ productId });

      expect(result.ok).toBe(true);
    });

    it('product is no longer findable after deletion', async () => {
      const product = Product.create({
        id: productId,
        name: 'To Delete',
        description: '',
        price: 10,
        stock: 5,
      });
      await repo.save(product);

      await usecase.execute({ productId });

      const found = await repo.findById(productId);
      expect(found).toBeNull();
    });
  });

  describe('product not found', () => {
    it('returns error when product does not exist', async () => {
      const result = await usecase.execute({ productId: nonExistentId });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Product not found');
      }
    });
  });

  describe('validation', () => {
    it('returns error for invalid UUID format', async () => {
      const result = await usecase.execute({ productId: 'invalid-id' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Invalid product ID format');
      }
    });
  });
});
