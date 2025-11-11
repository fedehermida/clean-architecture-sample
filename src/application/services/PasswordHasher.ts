// Application Layer: Service interface (port) for password hashing
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
}


