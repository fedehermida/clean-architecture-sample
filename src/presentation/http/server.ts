// Load environment variables from .env file (must be first import)
import 'dotenv/config';

// Infrastructure: Dependency Injection (Pure factory functions - no reflect-metadata needed)
import { bootstrap, AppDependencies } from '@infrastructure/di/factories';
// Infrastructure: Configuration
import { env } from '@infrastructure/config/env';

let appDependencies: AppDependencies | null = null;

async function startServer() {
  // Initialize application with factory-based dependency injection
  // No Inversify, no decorators - just pure TypeScript factory functions
  appDependencies = await bootstrap();

  const { httpServer: app, userController, authController, productController } = appDependencies;

  // Configure HTTP server
  const corsResult = app.useCors();
  if (corsResult instanceof Promise) {
    await corsResult;
  }
  app.useJson();

  // User routes
  app.post('/register', (req, res) => userController.register(req, res));
  app.get('/users', (req, res) => userController.getByEmail(req, res));
  app.get('/users/:id', (req, res) => userController.getById(req, res));
  app.delete('/users/:id', (req, res) => userController.delete(req, res));

  // Auth routes
  app.post('/auth/login', (req, res) => authController.login(req, res));
  app.post('/auth/logout', (req, res) => authController.logout(req, res));
  app.get('/auth/me', (req, res) => authController.me(req, res));

  // Product routes
  app.post('/products', (req, res) => productController.create(req, res));
  app.get('/products', (req, res) => productController.list(req, res));
  app.get('/products/:id', (req, res) => productController.getById(req, res));
  app.delete('/products/:id', (req, res) => productController.delete(req, res));

  // Health check
  app.get('/health', (req, res) => userController.healthCheck(res));

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`HTTP server listening on http://localhost:${env.PORT}`);
  });
}

// Graceful shutdown
async function shutdown() {
  // eslint-disable-next-line no-console
  console.log('\nShutting down gracefully...');
  if (appDependencies) {
    await appDependencies.cleanup();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
});
