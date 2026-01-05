import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Workspace projects with their own vitest.config.ts
  './apps/backend',
  './apps/frontend',
  './packages/shared',
  './packages/dto',
  './packages/validation',
]);
