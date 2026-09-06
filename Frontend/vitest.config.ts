import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    // Node 24 requires vmForks or vmThreads pool for proper __vitest_worker__ injection
    pool: 'vmForks',
  },
});