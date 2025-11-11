// Load environment variables from .env file (must be first import)
import 'dotenv/config';
import 'reflect-metadata';
// Infrastructure: Dependency Injection
import { createContainer } from '@infrastructure/di/container';
import { TYPES } from '@infrastructure/di/types';
// Infrastructure: Configuration
import { env } from '@infrastructure/config/env';
// Presentation: HTTP abstractions
import { HttpServer } from '@presentation/http/HttpServer';
// Adapters: Controllers
import { UserController } from '@adapters/http/controllers/UserController';

async function startServer() {
  // Initialize dependency injection container
  const container = await createContainer();

  // Resolve dependencies from container
  const app = container.get<HttpServer>(TYPES.HttpServer);
  const userController = container.get<UserController>(TYPES.UserController);

  // Configure HTTP server
  const corsResult = app.useCors();
  if (corsResult instanceof Promise) {
    await corsResult;
  }
  app.useJson();

  // Wire up routes using adapters (controllers)
  app.post('/register', (req, res) => userController.register(req, res));
  app.get('/users/:id', (req, res) => userController.getById(req, res));
  app.delete('/users/:id', (req, res) => userController.delete(req, res));
  app.get('/health', (req, res) => userController.healthCheck(res));

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`HTTP server listening on http://localhost:${env.PORT}`);
  });
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
});
