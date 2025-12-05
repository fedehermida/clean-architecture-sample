import { HttpRequest, HttpResponse } from '@presentation/http/HttpTypes';
import { RegisterUser } from '@application/use-cases/RegisterUser';
import { GetUserById } from '@application/use-cases/GetUserById';
import { GetUserByEmail } from '@application/use-cases/GetUserByEmail';
import { DeleteUser } from '@application/use-cases/DeleteUser';
import { GetUserWithProducts } from '@application/use-cases/GetUserWithProducts';
import { AssociateProductWithUser } from '@application/use-cases/AssociateProductWithUser';
import { DisassociateProductFromUser } from '@application/use-cases/DisassociateProductFromUser';
import { UserRepository } from '@domain/repositories/UserRepository';

// Interface Adapter: HTTP controller adapting HTTP layer to Application layer (use cases)
export class UserController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly getUserById: GetUserById,
    private readonly getUserByEmail: GetUserByEmail,
    private readonly deleteUser: DeleteUser,
    private readonly getUserWithProducts: GetUserWithProducts,
    private readonly associateProductWithUser: AssociateProductWithUser,
    private readonly disassociateProductFromUser: DisassociateProductFromUser,
    private readonly userRepository: UserRepository,
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

    const result = await this.getUserById.execute({ userId });
    if (!result.ok) {
      res.status(404).json({ error: result.error.message });
      return;
    }
    res.status(200).json(result.value);
  }

  async getByEmail(req: HttpRequest, res: HttpResponse): Promise<void> {
    const email = req.query['email'] as string;
    const result = await this.getUserByEmail.execute({ email });
    if (!result.ok) {
      res.status(404).json({ error: result.error.message });
      return;
    }
    res.status(200).json(result.value);
  }

  async delete(req: HttpRequest, res: HttpResponse): Promise<void> {
    const userId = req.params['id'] as string;
    const result = await this.deleteUser.execute({ userId });
    if (!result.ok) {
      res.status(404).json({ error: result.error.message });
      return;
    }
    res.status(204).send('');
  }

  async getProducts(req: HttpRequest, res: HttpResponse): Promise<void> {
    const userId = req.params['id'];
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const result = await this.getUserWithProducts.execute({ userId });
    if (!result.ok) {
      res.status(404).json({ error: result.error.message });
      return;
    }
    res.status(200).json(result.value);
  }

  async addProduct(req: HttpRequest, res: HttpResponse): Promise<void> {
    const userId = req.params['id'];
    const productId = req.params['productId'];
    if (!userId || !productId) {
      res.status(400).json({ error: 'User ID and Product ID are required' });
      return;
    }

    const result = await this.associateProductWithUser.execute({ userId, productId });
    if (!result.ok) {
      res.status(404).json({ error: result.error.message });
      return;
    }
    res.status(201).json({ message: 'Product associated with user successfully' });
  }

  async removeProduct(req: HttpRequest, res: HttpResponse): Promise<void> {
    const userId = req.params['id'];
    const productId = req.params['productId'];
    if (!userId || !productId) {
      res.status(400).json({ error: 'User ID and Product ID are required' });
      return;
    }

    const result = await this.disassociateProductFromUser.execute({ userId, productId });
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
