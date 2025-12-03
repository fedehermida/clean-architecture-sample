import { describe, it, expect } from 'vitest';
import { Product } from '@domain/entities/Product';

describe('Product Entity', () => {
  describe('creation', () => {
    it('creates a product with all properties', () => {
      const product = Product.create({
        id: '123',
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        stock: 10,
      });

      expect(product.id).toBe('123');
      expect(product.name).toBe('Test Product');
      expect(product.description).toBe('A test product');
      expect(product.price).toBe(99.99);
      expect(product.stock).toBe(10);
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });

    it('sets createdAt and updatedAt to the same time when not provided', () => {
      const product = Product.create({
        id: '123',
        name: 'Test',
        description: '',
        price: 10,
        stock: 5,
      });

      expect(product.createdAt.getTime()).toBe(product.updatedAt.getTime());
    });
  });

  describe('isInStock', () => {
    it('returns true when stock > 0', () => {
      const product = Product.create({
        id: '1',
        name: 'In Stock',
        description: '',
        price: 10,
        stock: 5,
      });

      expect(product.isInStock()).toBe(true);
    });

    it('returns false when stock is 0', () => {
      const product = Product.create({
        id: '1',
        name: 'Out of Stock',
        description: '',
        price: 10,
        stock: 0,
      });

      expect(product.isInStock()).toBe(false);
    });
  });

  describe('canFulfillOrder', () => {
    it('returns true when stock is sufficient', () => {
      const product = Product.create({
        id: '1',
        name: 'Test',
        description: '',
        price: 10,
        stock: 10,
      });

      expect(product.canFulfillOrder(5)).toBe(true);
      expect(product.canFulfillOrder(10)).toBe(true);
    });

    it('returns false when stock is insufficient', () => {
      const product = Product.create({
        id: '1',
        name: 'Test',
        description: '',
        price: 10,
        stock: 5,
      });

      expect(product.canFulfillOrder(6)).toBe(false);
    });
  });

  describe('reduceStock', () => {
    it('returns new product with reduced stock', () => {
      const product = Product.create({
        id: '1',
        name: 'Test',
        description: '',
        price: 10,
        stock: 10,
      });

      const reduced = product.reduceStock(3);

      expect(reduced.stock).toBe(7);
      expect(product.stock).toBe(10); // Original unchanged (immutability)
    });

    it('throws error when insufficient stock', () => {
      const product = Product.create({
        id: '1',
        name: 'Test',
        description: '',
        price: 10,
        stock: 5,
      });

      expect(() => product.reduceStock(10)).toThrow('Insufficient stock');
    });
  });

  describe('increaseStock', () => {
    it('returns new product with increased stock', () => {
      const product = Product.create({
        id: '1',
        name: 'Test',
        description: '',
        price: 10,
        stock: 5,
      });

      const increased = product.increaseStock(10);

      expect(increased.stock).toBe(15);
      expect(product.stock).toBe(5); // Original unchanged (immutability)
    });
  });
});
