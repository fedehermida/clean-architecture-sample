import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { randomUUID } from 'node:crypto';
import { UserRepository } from '@domain/repositories/UserRepository';
import { User } from '@domain/entities/User';
import { PasswordHasher } from '@application/services/PasswordHasher';
import { RegisterUserDTO, RegisterUserSchema } from '@application/dtos/RegisterUserDTO';
import { err, ok, Result } from '@shared/Result';
import { TYPES } from '@infrastructure/di/types';

// Application Layer: Use case implementing application business rules
@injectable()
export class RegisterUser {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
    @inject(TYPES.PasswordHasher) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserDTO): Promise<Result<{ userId: string }>> {
    const parse = RegisterUserSchema.safeParse(input);
    if (!parse.success) {
      return err(new Error(parse.error.issues.map((i) => i.message).join(', ')));
    }

    const existing = await this.userRepository.findByEmail(parse.data.email);
    if (existing) {
      return err(new Error('Email already in use'));
    }

    const passwordHash = await this.passwordHasher.hash(parse.data.password);
    const user = User.create({ id: randomUUID(), email: parse.data.email, passwordHash });
    await this.userRepository.save(user);

    return ok({ userId: user.id });
  }
}
