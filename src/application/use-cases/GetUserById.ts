import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { UserRepository } from '@domain/repositories/UserRepository';
import { err, ok, Result } from '@shared/Result';
import { TYPES } from '@infrastructure/di/types';

@injectable()
export class GetUserById {
  constructor(@inject(TYPES.UserRepository) private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<Result<{ id: string; email: string; createdAt: Date }>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return err(new Error('User not found'));
    }

    return ok({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    });
  }
}

