import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '@adapters/repositories/InMemoryUserRepository';
import { FastPasswordHasher } from '@adapters/services/FastPasswordHasher';
import { InMemoryAuthAdapter } from '@adapters/services/InMemoryAuthAdapter';
import { RegisterUser } from '@application/use-cases/RegisterUser';
import { GetUserById } from '@application/use-cases/GetUserById';
import { GetUserByEmail } from '@application/use-cases/GetUserByEmail';
import { DeleteUser } from '@application/use-cases/DeleteUser';
import { LoginUser } from '@application/use-cases/LoginUser';
import { LogoutUser } from '@application/use-cases/LogoutUser';

describe('User Flow Integration Tests', () => {
  // Shared dependencies (simulating DI container)
  let userRepo: InMemoryUserRepository;
  let passwordHasher: FastPasswordHasher;
  let authAdapter: InMemoryAuthAdapter;

  // Use cases
  let registerUser: RegisterUser;
  let getUserById: GetUserById;
  let getUserByEmail: GetUserByEmail;
  let deleteUser: DeleteUser;
  let loginUser: LoginUser;
  let logoutUser: LogoutUser;

  beforeEach(() => {
    // Initialize shared dependencies
    userRepo = new InMemoryUserRepository();
    passwordHasher = new FastPasswordHasher();
    authAdapter = new InMemoryAuthAdapter();

    // Initialize use cases with shared dependencies
    registerUser = new RegisterUser(userRepo, passwordHasher);
    getUserById = new GetUserById(userRepo);
    getUserByEmail = new GetUserByEmail(userRepo);
    deleteUser = new DeleteUser(userRepo);
    loginUser = new LoginUser(authAdapter);
    logoutUser = new LogoutUser(authAdapter);
  });

  describe('Complete User Lifecycle', () => {
    it('registers, retrieves, and deletes a user', async () => {
      // 1. Register
      const registerResult = await registerUser.execute({
        email: 'lifecycle@example.com',
        password: 'password123',
      });
      expect(registerResult.ok).toBe(true);

      const userId = registerResult.ok ? registerResult.value.userId : '';

      // 2. Retrieve by ID
      const getByIdResult = await getUserById.execute({ userId });
      expect(getByIdResult.ok).toBe(true);
      if (getByIdResult.ok) {
        expect(getByIdResult.value.email).toBe('lifecycle@example.com');
      }

      // 3. Retrieve by Email
      const getByEmailResult = await getUserByEmail.execute({ email: 'lifecycle@example.com' });
      expect(getByEmailResult.ok).toBe(true);
      if (getByEmailResult.ok) {
        expect(getByEmailResult.value.id).toBe(userId);
      }

      // 4. Delete
      const deleteResult = await deleteUser.execute({ userId });
      expect(deleteResult.ok).toBe(true);

      // 5. Verify deletion
      const afterDeleteResult = await getUserById.execute({ userId });
      expect(afterDeleteResult.ok).toBe(false);
    });
  });

  describe('Authentication Flow', () => {
    it('creates user, logs in, verifies token, and logs out', async () => {
      const email = 'auth@example.com';
      const password = 'password123';

      // 1. Create user in auth system
      await authAdapter.createUser(email, password);

      // 2. Login
      const loginResult = await loginUser.execute({ email, password });
      expect(loginResult.ok).toBe(true);

      const token = loginResult.ok ? loginResult.value.token : '';

      // 3. Verify token
      const verifiedUser = await authAdapter.verifyToken(token);
      expect(verifiedUser).not.toBeNull();
      expect(verifiedUser?.email).toBe(email);

      // 4. Logout
      const logoutResult = await logoutUser.execute({ token });
      expect(logoutResult.ok).toBe(true);

      // 5. Token should be invalid after logout
      const afterLogout = await authAdapter.verifyToken(token);
      expect(afterLogout).toBeNull();
    });
  });

  describe('Repository Swappability Demo', () => {
    it('demonstrates use cases work with any UserRepository implementation', async () => {
      // This test demonstrates the power of Clean Architecture:
      // The same use cases work with any repository implementation

      // Using InMemory repository
      const inMemoryRepo = new InMemoryUserRepository();
      const registerWithInMemory = new RegisterUser(inMemoryRepo, passwordHasher);

      const result1 = await registerWithInMemory.execute({
        email: 'swap1@example.com',
        password: 'password123',
      });
      expect(result1.ok).toBe(true);

      // Could swap to TypeORM, Mongoose, or Firebase repository
      // without changing any use case code!
      // const typeormRepo = new TypeOrmUserRepository(dataSource);
      // const registerWithTypeOrm = new RegisterUser(typeormRepo, passwordHasher);
      // Would work exactly the same way
    });
  });

  describe('Auth Provider Swappability Demo', () => {
    it('demonstrates use cases work with any AuthenticationService implementation', async () => {
      // This test demonstrates that auth providers are swappable

      // Using InMemory auth adapter
      const inMemoryAuth = new InMemoryAuthAdapter();
      const loginWithInMemory = new LoginUser(inMemoryAuth);

      await inMemoryAuth.createUser('swap@example.com', 'password123');
      const result = await loginWithInMemory.execute({
        email: 'swap@example.com',
        password: 'password123',
      });
      expect(result.ok).toBe(true);

      // Could swap to Firebase, JWT, or any other auth provider
      // without changing any use case code!
      // const firebaseAuth = new FirebaseAuthAdapter();
      // const loginWithFirebase = new LoginUser(firebaseAuth);
      // Would work exactly the same way
    });
  });

  describe('Error Handling Across Use Cases', () => {
    it('propagates errors correctly through the flow', async () => {
      // Try to get non-existent user (using valid UUID format)
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440099';
      const getResult = await getUserById.execute({ userId: nonExistentId });
      expect(getResult.ok).toBe(false);

      // Try to delete non-existent user
      const deleteResult = await deleteUser.execute({ userId: nonExistentId });
      expect(deleteResult.ok).toBe(false);

      // Try to login with wrong credentials
      const loginResult = await loginUser.execute({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
      expect(loginResult.ok).toBe(false);
    });
  });
});
