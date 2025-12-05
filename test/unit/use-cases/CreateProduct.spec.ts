import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProductRepository } from '@adapters/repositories/InMemoryProductRepository';
import { CreateProduct } from '@application/use-cases/CreateProduct';

describe('CreateProduct Use Case', () => {
  let repo: InMemoryProductRepository;
  let usecase: CreateProduct;
  const validUserId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    repo = new InMemoryProductRepository();
    usecase = new CreateProduct(repo);
  });

  describe('successful creation', () => {
    it('creates a product with valid input', async () => {
      const result = await usecase.execute({
        userId: validUserId,
        name: 'Test Product',
        description: 'A great product',
        price: 99.99,
        stock: 100,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.productId).toBeDefined();
        expect(typeof result.value.productId).toBe('string');
      }
    });

    it('stores the product in the repository', async () => {
      const result = await usecase.execute({
        userId: validUserId,
        name: 'Stored Product',
        description: 'Test',
        price: 50,
        stock: 10,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        const found = await repo.findById(result.value.productId);
        expect(found).not.toBeNull();
        expect(found?.name).toBe('Stored Product');
        expect(found?.userId).toBe(validUserId);
      }
    });

    it('allows empty description', async () => {
      const result = await usecase.execute({
        userId: validUserId,
        name: 'No Description',
        description: '',
        price: 25,
        stock: 5,
      });

      expect(result.ok).toBe(true);
    });
  });

  describe('validation', () => {
    it('returns error for empty name', async () => {
      const result = await usecase.execute({
        userId: validUserId,
        name: '',
        description: 'Test',
        price: 10,
        stock: 5,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Name is required');
      }
    });

    it('returns error for negative price', async () => {
      const result = await usecase.execute({
        userId: validUserId,
        name: 'Test',
        description: '',
        price: -10,
        stock: 5,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Price must be positive');
      }
    });

    it('returns error for negative stock', async () => {
      const result = await usecase.execute({
        userId: validUserId,
        name: 'Test',
        description: '',
        price: 10,
        stock: -5,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Stock cannot be negative');
      }
    });

    it('returns error for non-integer stock', async () => {
      const result = await usecase.execute({
        userId: validUserId,
        name: 'Test',
        description: '',
        price: 10,
        stock: 5.5,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Stock must be an integer');
      }
    });

    it('returns error for invalid userId format', async () => {
      const result = await usecase.execute({
        userId: 'invalid-uuid',
        name: 'Test',
        description: '',
        price: 10,
        stock: 5,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Invalid user ID format');
      }
    });
  });
});
