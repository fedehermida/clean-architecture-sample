import { describe, it, expect, beforeEach } from 'vitest';
import { AuthController } from '@adapters/http/controllers/AuthController';
import { LoginUser } from '@application/use-cases/LoginUser';
import { LogoutUser } from '@application/use-cases/LogoutUser';
import { InMemoryAuthAdapter } from '@adapters/services/InMemoryAuthAdapter';
import { HttpRequest, HttpResponse } from '@presentation/http/HttpTypes';

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

describe('AuthController', () => {
  let authController: AuthController;
  let authService: InMemoryAuthAdapter;
  let loginUser: LoginUser;
  let logoutUser: LogoutUser;

  beforeEach(async () => {
    authService = new InMemoryAuthAdapter();
    loginUser = new LoginUser(authService);
    logoutUser = new LogoutUser(authService);
    authController = new AuthController(loginUser, logoutUser, authService);

    // Create a test user directly in the auth service
    await authService.createUser('test@example.com', 'password123');
  });

  describe('login', () => {
    it('returns 200 and token on successful login', async () => {
      const req = createMockRequest({
        body: { email: 'test@example.com', password: 'password123' },
      });
      const res = createMockResponse();

      await authController.login(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('expiresAt');
    });

    it('returns 401 on invalid credentials', async () => {
      const req = createMockRequest({
        body: { email: 'test@example.com', password: 'wrongpassword' },
      });
      const res = createMockResponse();

      await authController.login(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 401 when user does not exist', async () => {
      const req = createMockRequest({
        body: { email: 'nonexistent@example.com', password: 'password123' },
      });
      const res = createMockResponse();

      await authController.login(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('logout', () => {
    it('returns 200 on successful logout', async () => {
      // First login to get a token
      const loginReq = createMockRequest({
        body: { email: 'test@example.com', password: 'password123' },
      });
      const loginRes = createMockResponse();
      await authController.login(loginReq, loginRes);
      const token = (loginRes.body as { token: string }).token;

      // Then logout
      const logoutReq = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      });
      const logoutRes = createMockResponse();

      await authController.logout(logoutReq, logoutRes);

      expect(logoutRes.statusCode).toBe(200);
      expect(logoutRes.body).toEqual({ message: 'Logged out successfully' });
    });

    it('returns 400 when no token provided', async () => {
      const req = createMockRequest({});
      const res = createMockResponse();

      await authController.logout(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'No token provided' });
    });
  });

  describe('me', () => {
    it('returns 200 and user info with valid token', async () => {
      // First login to get a token
      const loginReq = createMockRequest({
        body: { email: 'test@example.com', password: 'password123' },
      });
      const loginRes = createMockResponse();
      await authController.login(loginReq, loginRes);
      const token = (loginRes.body as { token: string }).token;

      // Get current user
      const meReq = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      });
      const meRes = createMockResponse();

      await authController.me(meReq, meRes);

      expect(meRes.statusCode).toBe(200);
      expect(meRes.body).toMatchObject({
        email: 'test@example.com',
      });
    });

    it('returns 401 when no token provided', async () => {
      const req = createMockRequest({});
      const res = createMockResponse();

      await authController.me(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'No token provided' });
    });

    it('returns 401 with invalid token', async () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer invalid-token' },
      });
      const res = createMockResponse();

      await authController.me(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid or expired token' });
    });

    it('handles authorization header as array', async () => {
      // First login to get a token
      const loginReq = createMockRequest({
        body: { email: 'test@example.com', password: 'password123' },
      });
      const loginRes = createMockResponse();
      await authController.login(loginReq, loginRes);
      const token = (loginRes.body as { token: string }).token;

      // Get current user with array header
      const meReq = createMockRequest({
        headers: { authorization: [`Bearer ${token}`] },
      });
      const meRes = createMockResponse();

      await authController.me(meReq, meRes);

      expect(meRes.statusCode).toBe(200);
      expect(meRes.body).toMatchObject({
        email: 'test@example.com',
      });
    });
  });
});
