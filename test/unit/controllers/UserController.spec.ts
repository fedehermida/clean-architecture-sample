import { describe, it, expect, beforeEach, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { UserController } from '@adapters/http/controllers/UserController';
import { RegisterUser } from '@application/use-cases/RegisterUser';
import { GetUserById } from '@application/use-cases/GetUserById';
import { GetUserByEmail } from '@application/use-cases/GetUserByEmail';
import { DeleteUser } from '@application/use-cases/DeleteUser';
import { InMemoryUserRepository } from '@adapters/repositories/InMemoryUserRepository';
import { FastPasswordHasher } from '@adapters/services/FastPasswordHasher';
import { HttpRequest, HttpResponse } from '@presentation/http/HttpTypes';
import { User } from '@domain/entities/User';

// Mock HttpResponse factory
function createMockResponse(): HttpResponse & {
  statusCode: number;
  body: unknown;
} {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: unknown) {
      this.body = data;
    },
    send(body: string) {
      this.body = body;
    },
  };
  return res;
}

// Mock HttpRequest factory
function createMockRequest(overrides: Partial<HttpRequest> = {}): HttpRequest {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  };
}

describe('UserController', () => {
  let userController: UserController;
  let userRepository: InMemoryUserRepository;
  let registerUser: RegisterUser;
  let getUserById: GetUserById;
  let getUserByEmail: GetUserByEmail;
  let deleteUser: DeleteUser;
  let passwordHasher: FastPasswordHasher;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    passwordHasher = new FastPasswordHasher();
    registerUser = new RegisterUser(userRepository, passwordHasher);
    getUserById = new GetUserById(userRepository);
    getUserByEmail = new GetUserByEmail(userRepository);
    deleteUser = new DeleteUser(userRepository);
    userController = new UserController(
      registerUser,
      getUserById,
      getUserByEmail,
      deleteUser,
      userRepository,
    );
  });

  describe('register', () => {
    it('returns 201 on successful registration', async () => {
      const req = createMockRequest({
        body: { email: 'test@example.com', password: 'password123' },
      });
      const res = createMockResponse();

      await userController.register(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        userId: expect.any(String),
      });
    });

    it('returns 400 on invalid email', async () => {
      const req = createMockRequest({
        body: { email: 'invalid-email', password: 'password123' },
      });
      const res = createMockResponse();

      await userController.register(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 on missing password', async () => {
      const req = createMockRequest({
        body: { email: 'test@example.com', password: '' },
      });
      const res = createMockResponse();

      await userController.register(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 on duplicate email', async () => {
      // First registration
      const req1 = createMockRequest({
        body: { email: 'test@example.com', password: 'password123' },
      });
      await userController.register(req1, createMockResponse());

      // Second registration with same email
      const req2 = createMockRequest({
        body: { email: 'test@example.com', password: 'password456' },
      });
      const res = createMockResponse();

      await userController.register(req2, res);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('getById', () => {
    it('returns 200 and user on success', async () => {
      // Register a user first with valid UUID
      const userId = randomUUID();
      const user = User.create({
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hash',
      });
      await userRepository.save(user);

      const req = createMockRequest({ params: { id: userId } });
      const res = createMockResponse();

      await userController.getById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        id: userId,
        email: 'test@example.com',
      });
    });

    it('returns 400 when id is missing', async () => {
      const req = createMockRequest({ params: {} });
      const res = createMockResponse();

      await userController.getById(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'User ID is required' });
    });

    it('returns 404 when user not found', async () => {
      const nonExistentId = randomUUID();
      const req = createMockRequest({ params: { id: nonExistentId } });
      const res = createMockResponse();

      await userController.getById(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('getByEmail', () => {
    it('returns 200 and user on success', async () => {
      const user = User.create({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hash',
      });
      await userRepository.save(user);

      const req = createMockRequest({ query: { email: 'test@example.com' } });
      const res = createMockResponse();

      await userController.getByEmail(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        id: 'user-123',
        email: 'test@example.com',
      });
    });

    it('returns 404 when user not found', async () => {
      const req = createMockRequest({ query: { email: 'nonexistent@example.com' } });
      const res = createMockResponse();

      await userController.getByEmail(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('delete', () => {
    it('returns 204 on successful deletion', async () => {
      const userId = randomUUID();
      const user = User.create({
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hash',
      });
      await userRepository.save(user);

      const req = createMockRequest({ params: { id: userId } });
      const res = createMockResponse();

      await userController.delete(req, res);

      expect(res.statusCode).toBe(204);
      expect(res.body).toBe('');
    });

    it('returns 404 when user not found', async () => {
      const nonExistentId = randomUUID();
      const req = createMockRequest({ params: { id: nonExistentId } });
      const res = createMockResponse();

      await userController.delete(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('healthCheck', () => {
    it('returns 200 when database is connected', async () => {
      const res = createMockResponse();

      await userController.healthCheck(res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        status: 'healthy',
        database: 'connected',
      });
    });

    it('returns 503 when database throws error', async () => {
      // Create a mock repository that throws
      const failingRepo = {
        findById: vi.fn().mockRejectedValue(new Error('Connection failed')),
      } as unknown as InMemoryUserRepository;

      const controller = new UserController(
        registerUser,
        getUserById,
        getUserByEmail,
        deleteUser,
        failingRepo,
      );

      const res = createMockResponse();

      await controller.healthCheck(res);

      expect(res.statusCode).toBe(503);
      expect(res.body).toMatchObject({
        status: 'unhealthy',
        database: 'disconnected',
        error: 'Connection failed',
      });
    });
  });
});
