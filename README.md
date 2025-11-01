## Clean Architecture TypeScript Starter

This project is a minimal, modern TypeScript starter implementing Clean Architecture principles.

- TypeScript strict mode, path aliases
- ESLint (flat config) + Prettier
- Vitest for testing
- Multiple repository implementations (InMemory, PostgreSQL, MongoDB)
- Dockerized with Docker Compose
- Framework-agnostic HTTP layer (Express/Fastify)

### Scripts
- `dev`: run development server with tsx
- `build`: compile to dist
- `test`: run unit tests
- `lint`: run ESLint
- `format`: run Prettier

### Structure
- `src/domain`: entities and repository/service interfaces
- `src/application`: use-cases and DTOs
- `src/infrastructure`: concrete implementations (repositories, HTTP adapters, database connections)
- `src/presentation`: I/O layer (HTTP, CLI, etc.)
- `src/shared`: cross-cutting utilities

### Docker

#### Quick Start with Docker Compose

Start all services (PostgreSQL, MongoDB, and the application):

```bash
docker-compose up -d
```

Stop all services:

```bash
docker-compose down
```

View logs:

```bash
docker-compose logs -f app
```

#### Development Mode (with Hot Reload)

By default, Docker Compose runs in development mode with hot reloading:

```bash
docker-compose up --build
```

Changes to files in the `src` directory will automatically trigger a server restart via nodemon.

#### Production Mode

To run in production mode, set the `DOCKERFILE` environment variable:

```bash
DOCKERFILE=Dockerfile docker-compose up --build
```

Or build and run the production image manually:

```bash
docker build -t clean-architecture-ts -f Dockerfile .
```

#### Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

The Docker Compose setup includes:
- **PostgreSQL** on port 5432
- **MongoDB** on port 27017
- **Application** on port 3000 (with hot reload in dev mode)

**Development features:**
- Source code is mounted as volumes for instant changes
- Nodemon automatically restarts the server on file changes
- All dependencies (including dev) are installed

All services are configured to work together out of the box.

### API Testing

A Postman collection is included for easy API testing:

1. **Import the collection:**
   - Open Postman
   - Click Import
   - Select `Clean-Architecture-API.postman_collection.json`

2. **Import the environment (optional):**
   - Import `postman-env.postman_environment.json`
   - Select the "Clean Architecture - Local" environment

3. **Available endpoints:**
   - `POST /register` - Register a new user
   - `GET /users/:id` - Get user by ID
   - `DELETE /users/:id` - Delete user by ID

The collection includes:
- Example requests with sample data
- Test scripts that automatically save user IDs
- Example responses for success and error cases
- Environment variables for easy configuration


