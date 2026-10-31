import { defineConfig } from 'vitest/config';
import { publicPackageNames, publicPackageModel } from './tooling/package-model.mjs';

const packageProjects = publicPackageNames.map((name) => ({
  test: {
    name,
    environment: 'node',
    setupFiles: publicPackageModel[name].vitestSetup ? [publicPackageModel[name].vitestSetup] : [],
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
          name: 'repository-tooling',
          environment: 'node',
          include: ['tooling/**/*.test.mjs'],
          exclude: ['**/node_modules/**', '**/dist/**'],
          testTimeout: 30_000,
        },
      },
      {
        test: {
          name: 'docs',
          environment: 'node',
          include: ['apps/docs/**/*.test.mjs'],
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
