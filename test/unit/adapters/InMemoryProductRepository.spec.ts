import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProductRepository } from '@adapters/repositories/InMemoryProductRepository';
import { Product } from '@domain/entities/Product';

describe('InMemoryProductRepository', () => {
  let repo: InMemoryProductRepository;

  beforeEach(() => {
    repo = new InMemoryProductRepository();
  });

  describe('save and findById', () => {
    it('saves and retrieves a product by ID', async () => {
      const product = Product.create({
        id: 'product-1',
        name: 'Test Product',
        description: 'A test',
        price: 99.99,
        stock: 10,
      });

      await repo.save(product);
      const found = await repo.findById('product-1');

      expect(found).not.toBeNull();
      expect(found?.id).toBe('product-1');
      expect(found?.name).toBe('Test Product');
    });

    it('returns null for non-existent ID', async () => {
      const found = await repo.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns empty array when no products', async () => {
      const products = await repo.findAll();
      expect(products).toEqual([]);
    });

    it('returns all saved products', async () => {
      const product1 = Product.create({
        id: '1',
        name: 'Product 1',
        description: '',
        price: 10,
        stock: 5,
      });
      const product2 = Product.create({
        id: '2',
        name: 'Product 2',
        description: '',
        price: 20,
        stock: 10,
      });

      await repo.save(product1);
      await repo.save(product2);

      const products = await repo.findAll();
      expect(products.length).toBe(2);
    });
  });

  describe('deleteById', () => {
    it('removes a product', async () => {
      const product = Product.create({
        id: 'to-delete',
        name: 'Delete Me',
        description: '',
        price: 10,
        stock: 5,
      });

      await repo.save(product);
      await repo.deleteById('to-delete');

      const found = await repo.findById('to-delete');
      expect(found).toBeNull();
    });

    it('does nothing for non-existent ID', async () => {
      // Should not throw
      await repo.deleteById('non-existent');
    });
  });

  describe('update behavior', () => {
    it('overwrites existing product with same ID', async () => {
      const original = Product.create({
        id: 'product-1',
        name: 'Original',
        description: '',
        price: 10,
        stock: 5,
      });

      const updated = Product.create({
        id: 'product-1',
        name: 'Updated',
        description: 'New description',
        price: 20,
        stock: 15,
      });

      await repo.save(original);
      await repo.save(updated);

      const found = await repo.findById('product-1');
      expect(found?.name).toBe('Updated');
      expect(found?.price).toBe(20);
    });
  });
});
