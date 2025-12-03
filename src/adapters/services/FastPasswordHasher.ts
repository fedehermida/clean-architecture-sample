import 'reflect-metadata';
import { injectable } from 'inversify';
import { PasswordHasher } from '@application/services/PasswordHasher';
import { createHash } from 'node:crypto';

// Adapter: Fast password hasher implementation (NOT for production - demo/tests only)
@injectable()
export class FastPasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return createHash('sha256').update(plain).digest('hex');
  }
}
