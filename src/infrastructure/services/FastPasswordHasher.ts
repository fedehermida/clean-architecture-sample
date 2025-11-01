import { PasswordHasher } from '@application/services/PasswordHasher';
import { createHash } from 'node:crypto';

// NOT for production: simple fast hash for demo/tests.
export class FastPasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return createHash('sha256').update(plain).digest('hex');
  }
}


