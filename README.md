# Clean Architecture TypeScript

A comprehensive demonstration of Clean Architecture principles in TypeScript. This project is designed as an **educational resource** to clearly show the benefits of proper architectural separation.

## Table of Contents

- [What is Clean Architecture?](#what-is-clean-architecture)
- [The Problem It Solves](#the-problem-it-solves)
- [How It Works](#how-it-works)
- [Benefits Demonstrated](#benefits-demonstrated)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Configuration](#configuration)

---

## What is Clean Architecture?

Clean Architecture organizes code into **concentric layers** where dependencies only point **inward**. The inner layers contain business logic and have no knowledge of the outer layers (databases, frameworks, UI).

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#e1f5fe', 'primaryTextColor': '#01579b', 'primaryBorderColor': '#01579b', 'lineColor': '#01579b', 'secondaryColor': '#fff3e0', 'tertiaryColor': '#e8f5e9'}}}%%
flowchart TB
    subgraph outer["🔧 Infrastructure Layer"]
        direction TB
        subgraph adapters["🔌 Adapters Layer"]
            direction TB
            subgraph app["📋 Application Layer"]
                direction TB
                subgraph domain["💎 Domain Layer"]
                    entities["Entities<br/>(User, Product)"]
                    ports["Ports<br/>(Repository Interfaces)"]
                end
                usecases["Use Cases<br/>(RegisterUser, CreateProduct)"]
                services["Service Interfaces<br/>(PasswordHasher, AuthService)"]
            end
            controllers["Controllers<br/>(UserController, ProductController)"]
            repos["Repository Implementations<br/>(InMemory, TypeORM, Mongoose, Firebase)"]
            serviceImpl["Service Implementations<br/>(FastPasswordHasher, JwtAuthAdapter)"]
        end
        http["HTTP Servers<br/>(Express, Fastify)"]
        db["Databases<br/>(PostgreSQL, MongoDB, Firestore)"]
        di["DI Container<br/>(Inversify)"]
    end

    style domain fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
    style app fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style adapters fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style outer fill:#fce4ec,stroke:#c2185b,stroke-width:2px
```

### The Golden Rule

> **Dependencies can only point INWARD. Inner layers know nothing about outer layers.**

```mermaid
flowchart LR
    subgraph " "
        direction LR
        D["💎 Domain"]
        A["📋 Application"]
        AD["🔌 Adapters"]
        I["🔧 Infrastructure"]
    end

    I --> AD --> A --> D

    style D fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style A fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style AD fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style I fill:#fce4ec,stroke:#c2185b,stroke-width:2px
```

---

## The Problem It Solves

### ❌ Traditional Architecture (Tightly Coupled)

In a traditional approach, your business logic is **mixed** with infrastructure concerns:

```mermaid
flowchart TB
    subgraph traditional["❌ Traditional: Everything is connected"]
        controller["Controller"] --> businessLogic["Business Logic"]
        businessLogic --> postgres[(PostgreSQL)]
        businessLogic --> express["Express"]

        controller -.- express
    end

    problem["😱 Problem: Changing the database<br/>requires rewriting business logic!"]

    style traditional fill:#ffebee,stroke:#c62828
    style problem fill:#ffcdd2,stroke:#c62828
```

### ✅ Clean Architecture (Loosely Coupled)

With Clean Architecture, business logic depends on **abstractions** (interfaces), not implementations:

```mermaid
flowchart TB
    subgraph clean["✅ Clean Architecture: Loosely Coupled"]
        usecase["Use Case<br/>(RegisterUser)"]

        interface["📋 Interface<br/>(UserRepository)"]

        usecase --> interface

        subgraph implementations["Swappable Implementations"]
            inmem["InMemoryUserRepository"]
            typeorm["TypeOrmUserRepository"]
            mongo["MongoUserRepository"]
            firebase["FirebaseUserRepository"]
        end

        interface -.-> inmem
        interface -.-> typeorm
        interface -.-> mongo
        interface -.-> firebase
    end

    solution["✨ Solution: Swap implementations<br/>without touching business logic!"]

    style clean fill:#e8f5e9,stroke:#2e7d32
    style interface fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style solution fill:#c8e6c9,stroke:#2e7d32
```

---

## How It Works

### Step 1: Define the Domain (Core Business)

The **Domain Layer** defines your business entities and the interfaces they need:

```mermaid
classDiagram
    class User {
        +string id
        +string email
        +string passwordHash
        +Date createdAt
        +create() User
    }

    class Product {
        +string id
        +string name
        +number price
        +number stock
        +isInStock() bool
        +reduceStock(qty) Product
    }

    class UserRepository {
        <<interface>>
        +findById(id) User
        +findByEmail(email) User
        +save(user) void
        +deleteById(id) void
    }

    class ProductRepository {
        <<interface>>
        +findById(id) Product
        +findAll() Product[]
        +save(product) void
        +deleteById(id) void
    }
```

**Key insight**: The repository interfaces (ports) are in the Domain layer. They define **WHAT** operations are needed, not **HOW** they're implemented.

### Step 2: Create Use Cases (Application Logic)

Use cases orchestrate the business operations. They depend **only** on interfaces:

```mermaid
flowchart LR
    subgraph "Application Layer"
        RegisterUser["RegisterUser<br/>Use Case"]
        CreateProduct["CreateProduct<br/>Use Case"]
    end

    subgraph "Dependencies (Interfaces)"
        UserRepo["UserRepository<br/>(interface)"]
        ProductRepo["ProductRepository<br/>(interface)"]
        Hasher["PasswordHasher<br/>(interface)"]
    end

    RegisterUser --> UserRepo
    RegisterUser --> Hasher
    CreateProduct --> ProductRepo

    style RegisterUser fill:#fff3e0,stroke:#ef6c00
    style CreateProduct fill:#fff3e0,stroke:#ef6c00
    style UserRepo fill:#e1f5fe,stroke:#0277bd
    style ProductRepo fill:#e1f5fe,stroke:#0277bd
    style Hasher fill:#e1f5fe,stroke:#0277bd
```

```typescript
// Use case depends on INTERFACE, not implementation
export class RegisterUser {
  constructor(
    private readonly userRepository: UserRepository,  // Interface!
    private readonly passwordHasher: PasswordHasher,  // Interface!
  ) {}

  async execute(input: RegisterUserDTO): Promise<Result<{ userId: string }>> {
    // Business logic here - no database/framework knowledge
  }
}
```

### Step 3: Implement Adapters

The **Adapters Layer** provides concrete implementations of the interfaces:

```mermaid
flowchart TB
    subgraph "Repository Implementations"
        interface["UserRepository<br/>(interface)"]

        inmem["InMemoryUserRepository<br/>📦 Map storage"]
        typeorm["TypeOrmUserRepository<br/>🐘 PostgreSQL"]
        mongo["MongoUserRepository<br/>🍃 MongoDB"]
        firebase["FirebaseUserRepository<br/>🔥 Firestore"]
    end

    inmem -.->|implements| interface
    typeorm -.->|implements| interface
    mongo -.->|implements| interface
    firebase -.->|implements| interface

    style interface fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style inmem fill:#e8f5e9,stroke:#2e7d32
    style typeorm fill:#e3f2fd,stroke:#1565c0
    style mongo fill:#e8f5e9,stroke:#2e7d32
    style firebase fill:#fff8e1,stroke:#f57c00
```

### Step 4: Wire Everything (Dependency Injection)

The **Infrastructure Layer** wires everything together based on configuration:

```mermaid
flowchart TB
    subgraph "Environment Variables"
        env["REPOSITORY_TYPE=mongoose<br/>AUTH_PROVIDER=jwt<br/>HTTP_SERVER=fastify"]
    end

    subgraph "DI Container"
        container["container.ts"]
    end

    subgraph "Bound Implementations"
        repo["MongoUserRepository"]
        auth["JwtAuthAdapter"]
        http["FastifyHttpServer"]
    end

    env --> container
    container -->|binds| repo
    container -->|binds| auth
    container -->|binds| http

    style env fill:#f3e5f5,stroke:#7b1fa2
    style container fill:#e1f5fe,stroke:#0277bd
```

---

## Benefits Demonstrated

### 1️⃣ Infrastructure Swappability

Change your database with **one environment variable**:

```mermaid
flowchart LR
    subgraph "Same Use Case Code"
        UC["RegisterUser"]
    end

    subgraph "Config Change"
        ENV1["REPOSITORY_TYPE=inmemory"]
        ENV2["REPOSITORY_TYPE=typeorm"]
        ENV3["REPOSITORY_TYPE=mongoose"]
        ENV4["REPOSITORY_TYPE=firebase"]
    end

    subgraph "Different Databases"
        MEM[(In-Memory)]
        PG[(PostgreSQL)]
        MONGO[(MongoDB)]
        FIRE[(Firestore)]
    end

    ENV1 -.-> MEM
    ENV2 -.-> PG
    ENV3 -.-> MONGO
    ENV4 -.-> FIRE

    UC --> ENV1
    UC --> ENV2
    UC --> ENV3
    UC --> ENV4

    style UC fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
```

### 2️⃣ Testability

Test business logic **without any database**:

```mermaid
flowchart TB
    subgraph "Unit Test"
        test["RegisterUser.spec.ts"]
        usecase["RegisterUser"]
        mock["InMemoryUserRepository"]
    end

    test -->|creates| mock
    test -->|creates| usecase
    usecase -->|uses| mock

    note["✅ No database setup<br/>✅ Fast execution<br/>✅ Isolated tests"]

    style test fill:#e8f5e9,stroke:#2e7d32
    style mock fill:#e1f5fe,stroke:#0277bd
    style note fill:#c8e6c9,stroke:#2e7d32
```

```typescript
// Test WITHOUT a real database
const repo = new InMemoryUserRepository();
const hasher = new FastPasswordHasher();
const usecase = new RegisterUser(repo, hasher);

const result = await usecase.execute({
  email: 'test@example.com',
  password: 'password123',
});

expect(result.ok).toBe(true);
```

### 3️⃣ Separation of Concerns

Each layer has a **single responsibility**:

```mermaid
flowchart TB
    subgraph domain["💎 Domain Layer"]
        d1["Defines business entities"]
        d2["Defines repository contracts"]
        d3["Contains business rules"]
    end

    subgraph app["📋 Application Layer"]
        a1["Orchestrates use cases"]
        a2["Validates input (DTOs)"]
        a3["Returns Result types"]
    end

    subgraph adapters["🔌 Adapters Layer"]
        ad1["Implements repositories"]
        ad2["HTTP controllers"]
        ad3["External service adapters"]
    end

    subgraph infra["🔧 Infrastructure Layer"]
        i1["DI container setup"]
        i2["Database connections"]
        i3["HTTP server config"]
    end

    style domain fill:#e8f5e9,stroke:#2e7d32
    style app fill:#fff3e0,stroke:#ef6c00
    style adapters fill:#e1f5fe,stroke:#0277bd
    style infra fill:#fce4ec,stroke:#c2185b
```

---

## Project Structure

```
src/
├── domain/                          # 💎 Enterprise Business Rules
│   ├── entities/
│   │   ├── User.ts                  # User entity with factory pattern
│   │   └── Product.ts               # Product entity with business rules
│   └── repositories/
│       ├── UserRepository.ts        # User repository interface (port)
│       └── ProductRepository.ts     # Product repository interface (port)
│
├── application/                     # 📋 Application Business Rules
│   ├── use-cases/
│   │   ├── RegisterUser.ts          # User registration
│   │   ├── GetUserById.ts           # Get user by ID
│   │   ├── GetUserByEmail.ts        # Get user by email
│   │   ├── DeleteUser.ts            # Delete user
│   │   ├── LoginUser.ts             # Authentication
│   │   ├── LogoutUser.ts            # Token revocation
│   │   ├── CreateProduct.ts         # Create product
│   │   ├── GetProductById.ts        # Get product by ID
│   │   ├── ListProducts.ts          # List all products
│   │   └── DeleteProduct.ts         # Delete product
│   └── services/
│       ├── PasswordHasher.ts        # Password hashing interface
│       └── AuthenticationService.ts # Auth service interface
│
├── adapters/                        # 🔌 Interface Adapters
│   ├── repositories/
│   │   ├── InMemoryUserRepository.ts    # In-memory (testing)
│   │   ├── TypeOrmUserRepository.ts     # PostgreSQL
│   │   ├── MongoUserRepository.ts       # MongoDB
│   │   ├── FirebaseUserRepository.ts    # Firestore
│   │   └── InMemoryProductRepository.ts # In-memory products
│   ├── services/
│   │   ├── FastPasswordHasher.ts        # SHA256 hasher
│   │   ├── InMemoryAuthAdapter.ts       # In-memory auth
│   │   ├── FirebaseAuthAdapter.ts       # Firebase Auth
│   │   └── JwtAuthAdapter.ts            # JWT-based auth
│   └── http/controllers/
│       ├── UserController.ts            # User endpoints
│       ├── AuthController.ts            # Auth endpoints
│       └── ProductController.ts         # Product endpoints
│
├── infrastructure/                  # 🔧 Frameworks & Drivers
│   ├── http/
│   │   ├── ExpressHttpServer.ts     # Express implementation
│   │   └── FastifyHttpServer.ts     # Fastify implementation
│   ├── database/
│   │   ├── typeorm/                 # PostgreSQL setup
│   │   ├── mongoose/                # MongoDB setup
│   │   └── firestore/               # Firebase setup
│   └── di/
│       ├── container.ts             # DI container wiring
│       └── types.ts                 # Injection tokens
│
├── presentation/http/               # HTTP Abstractions
│   ├── server.ts                    # Application entry point
│   ├── HttpServer.ts                # HTTP server interface
│   └── HttpTypes.ts                 # Request/Response types
│
└── shared/
    └── Result.ts                    # Functional error handling
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.10.0
- Docker & Docker Compose (optional)

### Quick Start (No Database Required)

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server (uses in-memory storage)
npm run dev
```

The API will be available at `http://localhost:3000`

### With Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

---

## API Reference

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Register a new user |
| `GET` | `/users/:id` | Get user by UUID |
| `GET` | `/users?email=...` | Get user by email |
| `DELETE` | `/users/:id` | Delete user |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Login and get token |
| `POST` | `/auth/logout` | Logout (revoke token) |
| `GET` | `/auth/me` | Get current user |

### Product Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/products` | Create a product |
| `GET` | `/products` | List all products |
| `GET` | `/products/:id` | Get product by UUID |
| `DELETE` | `/products/:id` | Delete product |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Check API and database status |

### API Documentation

- **OpenAPI/Swagger**: See `openapi.yaml`
- **Postman Collection**: Import `Clean-Architecture-API.postman_collection.json`

---

## Testing

### Test Structure

```
test/
├── unit/
│   ├── domain/                 # Entity tests
│   │   ├── User.spec.ts
│   │   └── Product.spec.ts
│   ├── use-cases/              # Use case tests (all 10 use cases)
│   │   ├── RegisterUser.spec.ts
│   │   ├── CreateProduct.spec.ts
│   │   └── ...
│   └── adapters/               # Adapter tests
│       ├── InMemoryUserRepository.spec.ts
│       ├── InMemoryProductRepository.spec.ts
│       └── InMemoryAuthAdapter.spec.ts
└── integration/
    └── UserFlow.spec.ts        # End-to-end flow tests
```

### Running Tests

```bash
# Run all tests (watch mode)
npm test

# Run tests once
npm run test:run

# Run specific test
npx vitest run test/unit/use-cases/RegisterUser.spec.ts
```

### Test Results

```
✓ 93 tests passing
✓ 16 test files
✓ ~700ms execution time
```

---

## Configuration

### Environment Variables

| Variable | Default | Options |
|----------|---------|---------|
| `PORT` | `3000` | Any port number |
| `REPOSITORY_TYPE` | `inmemory` | `inmemory`, `typeorm`, `mongoose`, `firebase` |
| `AUTH_PROVIDER` | `inmemory` | `inmemory`, `firebase`, `jwt` |
| `HTTP_SERVER` | `express` | `express`, `fastify` |

### Switching Infrastructure

```mermaid
flowchart LR
    subgraph "Change .env file"
        before["REPOSITORY_TYPE=inmemory"]
        after["REPOSITORY_TYPE=mongoose"]
    end

    subgraph "Result"
        result["🎉 Now using MongoDB!<br/>No code changes needed"]
    end

    before -->|"Edit"| after
    after --> result

    style result fill:#e8f5e9,stroke:#2e7d32
```

---

## Design Patterns Used

| Pattern | Usage |
|---------|-------|
| **Dependency Injection** | Inversify for IoC container |
| **Repository Pattern** | Abstract data access behind interfaces |
| **Factory Pattern** | Entity creation via `User.create()`, `Product.create()` |
| **Adapter Pattern** | Bridge use cases to infrastructure |
| **Result Type** | Functional error handling (no exceptions) |
| **DTO Pattern** | Input validation with Zod schemas |

---

## Technologies

| Category | Technologies |
|----------|--------------|
| **Runtime** | Node.js 20+, TypeScript 5.6 |
| **HTTP** | Express 4, Fastify 4 |
| **Databases** | PostgreSQL (TypeORM), MongoDB (Mongoose), Firebase Firestore |
| **Auth** | Firebase Auth, JWT |
| **DI** | Inversify |
| **Validation** | Zod |
| **Testing** | Vitest |

---

## References

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [The Clean Architecture (book)](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)

---

## License

MIT
