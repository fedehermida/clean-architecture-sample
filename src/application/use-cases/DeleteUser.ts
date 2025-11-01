import { UserRepository } from '@domain/repositories/UserRepository';
import { err, ok, Result } from '@shared/Result';

export class DeleteUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<Result<void>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return err(new Error('User not found'));
    }

    await this.userRepository.deleteById(userId);
    return ok(undefined);
  }
}

