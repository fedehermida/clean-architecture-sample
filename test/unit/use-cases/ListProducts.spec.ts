import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProductRepository } from '@adapters/repositories/InMemoryProductRepository';
import { ListProducts } from '@application/use-cases/ListProducts';
import { Product } from '@domain/entities/Product';

describe('ListProducts Use Case', () => {
  let repo: InMemoryProductRepository;
  let usecase: ListProducts;
  const userId = 'user-123';

  beforeEach(() => {
    repo = new InMemoryProductRepository();
    usecase = new ListProducts(repo);
  });

  describe('listing products', () => {
    it('returns empty array when no products exist', async () => {
      const result = await usecase.execute();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('returns all products', async () => {
      const product1 = Product.create({
        id: '1',
        userId,
        name: 'Product 1',
        description: 'First',
        price: 10,
        stock: 5,
      });
      const product2 = Product.create({
        id: '2',
        userId,
        name: 'Product 2',
        description: 'Second',
        price: 20,
        stock: 10,
      });

      await repo.save(product1);
      await repo.save(product2);

      const result = await usecase.execute();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(2);
        expect(result.value.map((p) => p.name)).toContain('Product 1');
        expect(result.value.map((p) => p.name)).toContain('Product 2');
      }
    });

    it('includes isInStock for each product', async () => {
      const inStock = Product.create({
        id: '1',
        userId,
        name: 'In Stock',
        description: '',
        price: 10,
        stock: 5,
      });
      const outOfStock = Product.create({
        id: '2',
        userId,
        name: 'Out of Stock',
        description: '',
        price: 20,
        stock: 0,
      });

      await repo.save(inStock);
      await repo.save(outOfStock);

      const result = await usecase.execute();

      expect(result.ok).toBe(true);
      if (result.ok) {
        const inStockProduct = result.value.find((p) => p.name === 'In Stock');
        const outOfStockProduct = result.value.find((p) => p.name === 'Out of Stock');

        expect(inStockProduct?.isInStock).toBe(true);
        expect(outOfStockProduct?.isInStock).toBe(false);
      }
    });
  });
});
