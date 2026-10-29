import { defineConfig } from 'vitest/config';

const packageProjects = ['core', 'web', 'icons', 'react', 'angular', 'vue', 'elements'].map((name) => ({
  test: {
    name,
    environment: 'node',
    setupFiles: name === 'angular' ? ['./tooling/testing/angular-vitest.setup.mjs'] : [],
    include: [`packages/${name}/test/**/*.test.mjs`],
    testTimeout: 30_000,
  },
}));

export default defineConfig({
  test: {
    projects: [
      ...packageProjects,
      {
        test: {
          name: 'repository',
          environment: 'node',
          include: ['tooling/**/*.test.mjs', 'apps/docs/**/*.test.mjs'],
          exclude: ['**/node_modules/**', '**/dist/**'],
          testTimeout: 30_000,
        },
      },
      {
        test: {
          name: 'product',
          environment: 'node',
          include: ['product/_test-support/**/*.test.mjs'],
          exclude: ['product/*/test/browser/**'],
          testTimeout: 30_000,
        },
      },
    ],
    coverage: { reportsDirectory: 'coverage' },
  },
});
