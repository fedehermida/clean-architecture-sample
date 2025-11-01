import 'reflect-metadata';
import { FastPasswordHasher } from '@infrastructure/services/FastPasswordHasher';
import { RegisterUser } from '@application/use-cases/RegisterUser';
import { GetUserById } from '@application/use-cases/GetUserById';
import { DeleteUser } from '@application/use-cases/DeleteUser';
import { ExpressHttpServer } from '@infrastructure/http/ExpressHttpServer';
import { createUserRepositoryFromEnv } from '@infrastructure/repositories/RepositoryFactory';

async function startServer() {
  // Create repository based on environment configuration
  const userRepo = await createUserRepositoryFromEnv();
  const hasher = new FastPasswordHasher();
  const registerUser = new RegisterUser(userRepo, hasher);
  const getUserById = new GetUserById(userRepo);
  const deleteUser = new DeleteUser(userRepo);

  const app = new ExpressHttpServer();
  app.useJson();

  app.post('/register', async (req, res) => {
    const result = await registerUser.execute(req.body as { email: string; password: string });
    if (!result.ok) {
      res.status(400).json({ error: result.error.message });
      return;
    }
    res.status(201).json(result.value);
  });

  app.get('/users/:id', async (req, res) => {
    const userId = req.params['id'];
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const result = await getUserById.execute(userId);
    if (!result.ok) {
      res.status(404).json({ error: result.error.message });
      return;
    }
    res.status(200).json(result.value);
  });

  app.delete('/users/:id', async (req, res) => {
    const userId = req.params['id'];
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const result = await deleteUser.execute(userId);
    if (!result.ok) {
      res.status(404).json({ error: result.error.message });
      return;
    }
    res.status(204).send('');
  });

  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      // Test database connection by performing a simple query
      await userRepo.findById('health-check-non-existent-id');
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
  });

  const port = Number(process.env['PORT'] ?? 3000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`HTTP server listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
});
