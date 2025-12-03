// Application Layer: Service interface (port) for authentication
// This abstraction allows swapping authentication providers without changing business logic

export interface AuthToken {
  token: string;
  expiresAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthenticationService {
  /**
   * Verify user credentials and return a token
   */
  authenticate(email: string, password: string): Promise<AuthToken | null>;

  /**
   * Verify a token and return the authenticated user
   */
  verifyToken(token: string): Promise<AuthUser | null>;

  /**
   * Revoke/invalidate a token (logout)
   */
  revokeToken(token: string): Promise<void>;

  /**
   * Create a new user in the auth provider
   * Returns the user ID from the auth provider
   */
  createUser(email: string, password: string): Promise<string>;

  /**
   * Delete a user from the auth provider
   */
  deleteUser(userId: string): Promise<void>;
}
