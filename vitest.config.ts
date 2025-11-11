import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'html']
    },
    include: ['test/**/*.spec.ts']
  },
  resolve: {
    alias: {
      '@domain': '/src/domain',
      '@application': '/src/application',
      '@adapters': '/src/adapters',
      '@infrastructure': '/src/infrastructure',
      '@presentation': '/src/presentation',
      '@shared': '/src/shared'
    }
  }
});


