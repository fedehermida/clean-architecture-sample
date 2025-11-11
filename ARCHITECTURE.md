# Clean Architecture Layers

This project follows Clean Architecture principles with clear separation of concerns across four main layers:

```
┌─────────────────────────────────────────────────────┐
│         Frameworks & Drivers (Outermost)            │
│  Infrastructure: HTTP frameworks, DB drivers        │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│           Interface Adapters                         │
│  Adapters: Controllers, Repository implementations  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│        Application Business Rules                    │
│  Application: Use cases, DTOs, Application services │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│           Enterprise Business Rules                  │
│  Domain: Entities, Repository interfaces (ports)    │
└─────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Domain Layer (`src/domain/`)
**Enterprise Business Rules** - Innermost layer, no dependencies

- **Entities** (`entities/`) - Core business objects with business logic
- **Repository Interfaces** (`repositories/`) - Ports defining what we need (not how)

**Key Principle**: Pure business logic, framework-independent

### 2. Application Layer (`src/application/`)
**Application Business Rules** - Orchestrates domain objects

- **Use Cases** (`use-cases/`) - Application-specific business logic
- **DTOs** (`dtos/`) - Data Transfer Objects for input/output
- **Service Interfaces** (`services/`) - Application service ports

**Key Principle**: Depends only on Domain, orchestrates business workflows

### 3. Interface Adapters Layer (`src/adapters/`)
**Interface Adapters** - Converts between layers

- **Repository Adapters** (`repositories/`) - Implements domain repository interfaces using infrastructure
- **HTTP Controllers** (`http/controllers/`) - Adapts HTTP requests to use cases
- **Service Adapters** (`services/`) - Implements application service interfaces

**Key Principle**: Translates between external world and application/domain layers

### 4. Frameworks & Drivers (`src/infrastructure/` & `src/presentation/`)
**Frameworks & Drivers** - Outermost layer, external concerns

- **HTTP Frameworks** (`infrastructure/http/`) - Express, Fastify implementations
- **Database Drivers** (`infrastructure/database/`) - TypeORM, MongoDB client setup
- **HTTP Abstractions** (`presentation/http/`) - Framework-agnostic HTTP interfaces

**Key Principle**: All the details about frameworks, databases, web servers

## Dependency Rule

**Dependencies point inward**: 
- Infrastructure → Adapters → Application → Domain
- Outer layers depend on inner layers, never the reverse

## Benefits

1. **Testability**: Inner layers can be tested without frameworks
2. **Independence**: Business logic independent of frameworks/databases
3. **Flexibility**: Easy to swap implementations (Express ↔ Fastify, Postgres ↔ MongoDB)
4. **Maintainability**: Clear boundaries and responsibilities

