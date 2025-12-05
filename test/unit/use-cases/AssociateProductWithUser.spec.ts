import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProductRepository } from '@adapters/repositories/InMemoryProductRepository';
import { InMemoryUserRepository } from '@adapters/repositories/InMemoryUserRepository';
import { AssociateProductWithUser } from '@application/use-cases/AssociateProductWithUser';
import { Product } from '@domain/entities/Product';
import { User } from '@domain/entities/User';

describe('AssociateProductWithUser Use Case', () => {
  let productRepo: InMemoryProductRepository;
  let userRepo: InMemoryUserRepository;
  let usecase: AssociateProductWithUser;

  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const userId2 = '550e8400-e29b-41d4-a716-446655440002';
  const productId = '550e8400-e29b-41d4-a716-446655440001';
  const nonExistentId = '550e8400-e29b-41d4-a716-446655440099';

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    userRepo = new InMemoryUserRepository();
    usecase = new AssociateProductWithUser(productRepo, userRepo);
  });

  describe('successful association', () => {
    it('associates a product with a user', async () => {
      const user = User.create({
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
      });
      await userRepo.save(user);

      const product = Product.create({
        id: productId,
        name: 'Test Product',
        description: '',
        price: 10,
        stock: 5,
      });
      await productRepo.save(product);

      const result = await usecase.execute({ userId, productId });

      expect(result.ok).toBe(true);
    });

    it('product appears in user products after association', async () => {
      const user = User.create({
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
      });
      await userRepo.save(user);

      const product = Product.create({
        id: productId,
        name: 'Test Product',
        description: '',
        price: 10,
        stock: 5,
      });
      await productRepo.save(product);

      await usecase.execute({ userId, productId });

      const userProducts = await productRepo.findByUserId(userId);
      expect(userProducts.length).toBe(1);
      expect(userProducts[0]?.id).toBe(productId);
    });

    it('allows same product to be associated with multiple users', async () => {
      const user1 = User.create({
        id: userId,
        email: 'test1@example.com',
        passwordHash: 'hashedpassword',
      });
      const user2 = User.create({
        id: userId2,
        email: 'test2@example.com',
        passwordHash: 'hashedpassword',
      });
      await userRepo.save(user1);
      await userRepo.save(user2);

      const product = Product.create({
        id: productId,
        name: 'Shared Product',
        description: '',
        price: 50,
        stock: 100,
      });
      await productRepo.save(product);

      await usecase.execute({ userId, productId });
      await usecase.execute({ userId: userId2, productId });

      const user1Products = await productRepo.findByUserId(userId);
      const user2Products = await productRepo.findByUserId(userId2);

      expect(user1Products.length).toBe(1);
      expect(user2Products.length).toBe(1);
      expect(user1Products[0]?.id).toBe(productId);
      expect(user2Products[0]?.id).toBe(productId);
    });
  });

  describe('user not found', () => {
    it('returns error when user does not exist', async () => {
      const product = Product.create({
        id: productId,
        name: 'Test Product',
        description: '',
        price: 10,
        stock: 5,
      });
      await productRepo.save(product);

      const result = await usecase.execute({ userId: nonExistentId, productId });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('User not found');
      }
    });
  });

  describe('product not found', () => {
    it('returns error when product does not exist', async () => {
      const user = User.create({
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
      });
      await userRepo.save(user);

      const result = await usecase.execute({ userId, productId: nonExistentId });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Product not found');
      }
    });
  });

  describe('validation', () => {
    it('returns error for invalid user UUID format', async () => {
      const result = await usecase.execute({ userId: 'invalid-id', productId });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Invalid user ID format');
      }
    });

    it('returns error for invalid product UUID format', async () => {
      const result = await usecase.execute({ userId, productId: 'invalid-id' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Invalid product ID format');
      }
    });
  });
});
