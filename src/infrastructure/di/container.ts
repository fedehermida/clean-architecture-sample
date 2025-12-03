// DEPRECATED: This file is kept for backwards compatibility.
// Use the factory-based approach in './factories.ts' instead.
//
// The new approach uses pure TypeScript factory functions:
// - No Inversify dependency
// - No reflect-metadata
// - No decorators
// - Maximum educational clarity
//
// Migration:
//   Before: import { createContainer } from '@infrastructure/di/container';
//   After:  import { bootstrap } from '@infrastructure/di/factories';

// Re-export from factories for backwards compatibility
export { bootstrap as createContainer, type AppDependencies } from './factories';
