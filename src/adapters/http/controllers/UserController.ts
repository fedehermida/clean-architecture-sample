import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { HttpRequest, HttpResponse } from '@presentation/http/HttpTypes';
import { RegisterUser } from '@application/use-cases/RegisterUser';
import { GetUserById } from '@application/use-cases/GetUserById';
import { DeleteUser } from '@application/use-cases/DeleteUser';
import { UserRepository } from '@domain/repositories/UserRepository';
import { TYPES } from '@infrastructure/di/types';

// Interface Adapter: HTTP controller adapting HTTP layer to Application layer (use cases)
@injectable()
export class UserController {
  constructor(
    @inject(TYPES.RegisterUser) private readonly registerUser: RegisterUser,
    @inject(TYPES.GetUserById) private readonly getUserById: GetUserById,
    @inject(TYPES.DeleteUser) private readonly deleteUser: DeleteUser,
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
  ) {}

  async register(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.registerUser.execute(req.body as { email: string; password: string });
    if (!result.ok) {
      res.status(400).json({ error: result.error.message });
      return;
    }
    res.status(201).json(result.value);
  }

  async getById(req: HttpRequest, res: HttpResponse): Promise<void> {
    const userId = req.params['id'];
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const result = await this.getUserById.execute(userId);
    if (!result.ok) {
      res.status(404).json({ error: result.error.message });
      return;
    }
    res.status(200).json(result.value);
  }

  async delete(req: HttpRequest, res: HttpResponse): Promise<void> {
    const userId = req.params['id'];
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const result = await this.deleteUser.execute(userId);
    if (!result.ok) {
      res.status(404).json({ error: result.error.message });
      return;
    }
    res.status(204).send('');
  }

  async healthCheck(res: HttpResponse): Promise<void> {
    try {
      // Test database connection by performing a simple query
      await this.userRepository.findById('health-check-non-existent-id');
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
