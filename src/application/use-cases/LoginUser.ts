import { AuthenticationService, AuthToken } from '@application/services/AuthenticationService';
import { err, ok, Result } from '@shared/Result';
import { z } from 'zod';

// Input validation schema
export const LoginUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginUserDTO = z.infer<typeof LoginUserSchema>;

// Application Layer: Use case for user authentication (login)
export class LoginUser {
  constructor(private readonly authService: AuthenticationService) {}

  async execute(input: LoginUserDTO): Promise<Result<AuthToken>> {
    const parse = LoginUserSchema.safeParse(input);
    if (!parse.success) {
      return err(new Error(parse.error.issues.map((i) => i.message).join(', ')));
    }

    const token = await this.authService.authenticate(parse.data.email, parse.data.password);
    if (!token) {
      return err(new Error('Invalid email or password'));
    }

    return ok(token);
  }
}
