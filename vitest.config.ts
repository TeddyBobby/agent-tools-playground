import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pure function tests only — no DOM needed.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
