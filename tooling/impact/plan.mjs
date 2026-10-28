import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const sharedInfrastructure = [
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'nx.json',
  'tsconfig.base.json',
  'eslint.config.mjs',
  'stylelint.config.mjs',
  'playwright.config.mjs',
];

function componentFromPath(filePath) {
  const product = /^product\/([^/]+)\//.exec(filePath)?.[1];
  if (product && !product.startsWith('_')) return product;
  return /^packages\/(?:web|react|angular|vue|elements)\/src\/components\/([^/]+)\//.exec(filePath)?.[1] ?? null;
}

function packageFromPath(filePath) {
  return /^packages\/([^/]+)\//.exec(filePath)?.[1] ?? null;
}

export function createSemanticImpact(paths) {
  const components = new Set();
  const packages = new Set();
  let repositoryWide = false;
  let docs = false;

  for (const filePath of paths) {
    const component = componentFromPath(filePath);
    const packageName = packageFromPath(filePath);
    if (component) components.add(component);
    if (packageName) packages.add(packageName);
    repositoryWide ||= sharedInfrastructure.includes(filePath) || filePath.startsWith('tooling/');
    docs ||= filePath.startsWith('documentation/') || filePath.startsWith('apps/docs/');
  }

  const evidence = new Set(['architecture']);
  if (packages.size || repositoryWide) evidence.add('package-artifacts');
  if (components.size || repositoryWide) evidence.add('browser');
  if (docs || repositoryWide) evidence.add('docs');

  return {
    changedPaths: [...paths].sort(),
    components: [...components].sort(),
    packages: [...packages].sort(),
    repositoryWide,
    semanticEvidence: [...evidence].sort(),
    orchestration: 'nx',
  };
}

export function changedPathsFromGit(base, head) {
  if (!base || !head) throw new Error('Both --base and --head are required');
  return execFileSync('git', ['diff', '--name-only', `${base}...${head}`], { encoding: 'utf8' })
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean);
}

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const files = arg('--files');
  const paths = files
    ? files.split(',').map((value) => value.trim()).filter(Boolean)
    : changedPathsFromGit(arg('--base'), arg('--head'));
  process.stdout.write(`${JSON.stringify(createSemanticImpact(paths), null, 2)}\n`);
}
