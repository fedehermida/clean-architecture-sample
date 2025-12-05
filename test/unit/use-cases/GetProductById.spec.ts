import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProductRepository } from '@adapters/repositories/InMemoryProductRepository';
import { GetProductById } from '@application/use-cases/GetProductById';
import { Product } from '@domain/entities/Product';

describe('GetProductById Use Case', () => {
  let repo: InMemoryProductRepository;
  let usecase: GetProductById;

  const productId = '550e8400-e29b-41d4-a716-446655440001';
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const nonExistentId = '550e8400-e29b-41d4-a716-446655440099';

  beforeEach(() => {
    repo = new InMemoryProductRepository();
    usecase = new GetProductById(repo);
  });

  describe('successful retrieval', () => {
    it('returns product data when product exists', async () => {
      const product = Product.create({
        id: productId,
        userId,
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        stock: 10,
      });
      await repo.save(product);

      const result = await usecase.execute({ productId });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(productId);
        expect(result.value.name).toBe('Test Product');
        expect(result.value.description).toBe('A test product');
        expect(result.value.price).toBe(99.99);
        expect(result.value.stock).toBe(10);
        expect(result.value.isInStock).toBe(true);
      }
    });

    it('returns isInStock as false when stock is 0', async () => {
      const product = Product.create({
        id: productId,
        userId,
        name: 'Out of Stock',
        description: '',
        price: 50,
        stock: 0,
      });
      await repo.save(product);

      const result = await usecase.execute({ productId });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.isInStock).toBe(false);
      }
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
