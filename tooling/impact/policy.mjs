import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { browserPortNames } from '../package-model.mjs';

export const modes = new Set(['local', 'pr', 'main', 'scheduled', 'release']);
export const broadModes = new Set(['scheduled', 'release']);
export const broadInfrastructure = new Set([
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'nx.json',
  'tsconfig.base.json',
  'eslint.config.mjs',
  'stylelint.config.mjs',
  'playwright.config.mjs',
  'vitest.config.mjs',
  'prettier.config.mjs',
  'tooling/package-model.mjs',
  '.node-version',
  '.nvmrc',
]);
export const broadWorkflowPaths = new Set([
  '.github/workflows/_targeted-validation.yml',
  '.github/workflows/ci.yml',
  '.github/workflows/main.yml',
  '.github/workflows/scheduled.yml',
  '.github/workflows/release.yml',
]);
export const narrowWorkflowEvidence = new Map([
  ['.github/workflows/docs-pages.yml', ['docs']],
  ['.github/workflows/actions-retention.yml', []],
]);
export const publicSurfaceBasenames = new Set([
  'package.json',
  'project.json',
  'tsconfig.json',
  'tsconfig.lib.json',
  'ng-package.json',
]);
export const evidenceOrder = ['architecture', 'impact', 'release', 'package-artifacts', 'docs', 'browser', 'visual'];
export const logicalScopeOrder = [
  'architecture',
  'pure-core',
  'port-integration',
  'type-level',
  'component-contract',
  'cross-port-conformance',
  'browser-behavior',
  'visual-regression',
  'csr-ssr-hydration',
  'package-public-entrypoint',
  'consumer-validation',
  'docs-validation',
  'release-intent',
  'impact-engine',
];
export const preferredPortOrder = browserPortNames;

const docsProject = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../apps/docs/project.json', import.meta.url)), 'utf8'),
);
export const docsPackageDependencies = new Set(
  (docsProject.implicitDependencies ?? [])
    .map((dependency) => /^@vyrnforge\/([^/]+)$/.exec(dependency)?.[1])
    .filter(Boolean),
);
