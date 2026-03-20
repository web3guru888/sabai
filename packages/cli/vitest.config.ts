import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30000, // CLI tests are slower (file I/O + subprocess)
  },
});
