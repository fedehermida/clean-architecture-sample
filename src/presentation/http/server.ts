// Load environment variables from .env file (must be first import)
import 'dotenv/config';
import 'reflect-metadata';
// Infrastructure: Dependency Injection
import { createContainer } from '@infrastructure/di/container';
// Infrastructure: Configuration
import { env } from '@infrastructure/config/env';

async function startServer() {
  // Initialize dependency injection container and resolve dependencies
  const { httpServer: app, userController, authController, productController } =
    await createContainer();

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
  app.get('/users/:id/products', (req, res) => userController.getProducts(req, res));
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

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
});
