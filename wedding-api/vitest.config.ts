import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
    // One shared test database: run files one after another.
    fileParallelism: false,
  },
})
