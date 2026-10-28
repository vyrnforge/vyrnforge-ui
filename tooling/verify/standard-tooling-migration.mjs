import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packageNames = ['core', 'web', 'icons', 'react', 'angular', 'vue', 'elements'];
const internalNames = new Set(packageNames.map((name) => `@vyrnforge/${name}`));

function readJson(relative) {
  return JSON.parse(readFileSync(path.join(root, relative), 'utf8'));
}
function writeJson(relative, value) {
  const file = path.join(root, relative);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
function write(relative, content) {
  const file = path.join(root, relative);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
}
function walk(relativeRoots) {
  const files = [];
  for (const relativeRoot of relativeRoots) {
    const absoluteRoot = path.join(root, relativeRoot);
    if (!existsSync(absoluteRoot)) continue;
    const stack = [absoluteRoot];
    while (stack.length) {
      const current = stack.pop();
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
        const absolute = path.join(current, entry.name);
        if (entry.isDirectory()) stack.push(absolute);
        else files.push(path.relative(root, absolute).replaceAll('\\', '/'));
      }
    }
  }
  return files.sort();
}

const pkg = readJson('package.json');
pkg.packageManager = 'pnpm@12.16.1';
pkg.engines = { node: '>=24.18 <25', pnpm: '>=12.16 <13' };
delete pkg.workspaces;
pkg.scripts = {
  clean: 'node tooling/clean.mjs',
  format: 'prettier --write .',
  'format:check': 'prettier --check .',
  'generate:tokens': 'node tooling/tokens/generate.mjs',
  'verify:tokens': 'node tooling/tokens/generate.mjs --check',
  build: 'nx run-many -t build',
  'build:docs': 'nx run docs:build',
  lint: 'nx run-many -t lint',
  typecheck: 'nx run-many -t typecheck',
  test: 'nx run-many -t test',
  'test:unit': 'vitest run',
  'test:browser': 'cross-env VF_COMPONENT_PORT=web playwright test --project=chromium',
  'test:browser:cross': 'cross-env VF_COMPONENT_PORT=web playwright test',
  check: 'pnpm format:check && nx run-many -t lint,typecheck,test,build && pnpm verify:structure && pnpm verify:boundaries && pnpm verify:architecture',
  'check:full': 'pnpm check',
  'check:changed': 'nx affected -t lint,typecheck,test,build',
  'verify:structure': 'node tooling/verify/workspace-structure.mjs',
  'verify:testing-structure': 'node tooling/verify/testing-structure.mjs',
  'verify:boundaries': 'node tooling/verify/package-boundaries.mjs',
  'verify:architecture': 'node tooling/verify/architecture-rules.mjs',
  'verify:package-contracts': 'node tooling/verify/package-contracts.mjs',
  'verify:compatibility': 'node tooling/verify/compatibility.mjs',
  'verify:workflows': 'node tooling/verify/workflows.mjs',
  'verify:packages': 'node tooling/verify/package-artifacts.mjs',
  'impact:plan': 'node tooling/impact/plan.mjs',
  changeset: 'changeset',
  'changeset:status': 'changeset status',
  'release:version': 'changeset version',
  release: 'pnpm verify:packages && changeset publish'
};
pkg.devDependencies = {
  ...pkg.devDependencies,
  '@arethetypeswrong/cli': '0.18.5',
  '@axe-core/playwright': '4.14.0',
  '@changesets/cli': '3.0.3',
  '@microsoft/api-extractor': '7.59.4',
  'cross-env': '10.1.0',
  'ng-packagr': '22.2.5',
  'nx': '24.0.2',
  'prettier': '3.9.0',
  'publint': '0.3.25',
  'vitest': '5.0.5'
};
writeJson('package.json', pkg);

const toolingPkg = readJson('tooling/package.json');
toolingPkg.engines = { node: '>=24.18 <25', pnpm: '>=12.16 <13' };
writeJson('tooling/package.json', toolingPkg);

for (const name of packageNames) {
  const manifestPath = `packages/${name}/package.json`;
  const manifest = readJson(manifestPath);
  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const dependency of Object.keys(manifest[section] ?? {})) {
      if (internalNames.has(dependency)) manifest[section][dependency] = 'workspace:*';
    }
  }
  writeJson(manifestPath, manifest);

  writeJson(`packages/${name}/tsconfig.test.json`, {
    extends: '../../tsconfig.base.json',
    compilerOptions: {
      noEmit: true,
      declaration: false,
      declarationMap: false,
      sourceMap: false,
      types: []
    },
    include: ['test/**/*.types.ts']
  });

  const sourceTypecheck = name === 'angular'
    ? `pnpm exec ngc -p packages/${name}/tsconfig.json --noEmit`
    : `pnpm exec tsc -p packages/${name}/tsconfig.json --noEmit`;
  writeJson(`packages/${name}/project.json`, {
    name: `@vyrnforge/${name}`,
    $schema: '../../node_modules/nx/schemas/project-schema.json',
    sourceRoot: `packages/${name}/src`,
    projectType: 'library',
    tags: ['scope:public', name === 'core' ? 'platform:neutral' : `platform:${name}`],
    targets: {
      build: {
        executor: 'nx:run-commands',
        outputs: ['{projectRoot}/dist'],
        options: { command: `pnpm --filter @vyrnforge/${name} run build` }
      },
      lint: {
        executor: 'nx:run-commands',
        options: { command: `pnpm exec eslint packages/${name}/src packages/${name}/test --max-warnings=0` }
      },
      typecheck: {
        executor: 'nx:run-commands',
        dependsOn: ['^build'],
        options: { command: `${sourceTypecheck} && pnpm exec tsc -p packages/${name}/tsconfig.test.json` }
      },
      test: {
        executor: 'nx:run-commands',
        dependsOn: ['build'],
        options: { command: `pnpm exec vitest run --project ${name} --passWithNoTests` }
      }
    }
  });
}

for (const file of walk(['packages', 'product', 'tooling', 'apps'])) {
  if (!/\.(?:mjs|cjs|js|mts|cts|ts|tsx)$/.test(file)) continue;
  const absolute = path.join(root, file);
  let content = readFileSync(absolute, 'utf8');
  const before = content;
  content = content
    .replace(/import\s+test\s+from\s+(['"])node:test\1;?/g, "import { test } from 'vitest';")
    .replace(/from\s+(['"])node:test\1/g, "from 'vitest'");
  if (content !== before) writeFileSync(absolute, content);
}

write('pnpm-workspace.yaml', `packages:
  - packages/core
  - packages/web
  - packages/icons
  - packages/react
  - packages/angular
  - packages/vue
  - packages/elements
`);

writeJson('nx.json', {
  $schema: './node_modules/nx/schemas/nx-schema.json',
  defaultBase: 'main',
  namedInputs: {
    default: ['{projectRoot}/**/*', 'sharedGlobals'],
    production: ['default', '!{projectRoot}/test/**/*', '!{projectRoot}/**/*.test.*'],
    sharedGlobals: [
      '{workspaceRoot}/pnpm-lock.yaml',
      '{workspaceRoot}/pnpm-workspace.yaml',
      '{workspaceRoot}/tsconfig.base.json',
      '{workspaceRoot}/eslint.config.mjs',
      '{workspaceRoot}/stylelint.config.mjs'
    ]
  },
  targetDefaults: {
    build: { dependsOn: ['^build'], cache: true, inputs: ['production', '^production'], outputs: ['{projectRoot}/dist'] },
    lint: { cache: true, inputs: ['default', '^default'] },
    typecheck: { dependsOn: ['^build'], cache: true, inputs: ['default', '^default'] },
    test: { dependsOn: ['build'], cache: true, inputs: ['default', '^production'] },
    browser: { dependsOn: ['^build'], cache: false },
    package: { dependsOn: ['build'], cache: false }
  }
});

write('vitest.config.mjs', `import { defineConfig } from 'vitest/config';

const packageProjects = ${JSON.stringify(packageNames)}.map((name) => ({
  test: {
    name,
    environment: 'node',
    include: [\`packages/\${name}/test/**/*.test.mjs\`],
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
`);

write('prettier.config.mjs', `export default {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 120,
};
`);

writeJson('.changeset/config.json', {
  $schema: 'https://unpkg.com/@changesets/config@3.1.1/schema.json',
  changelog: '@changesets/cli/changelog',
  commit: false,
  fixed: [],
  linked: [],
  access: 'restricted',
  baseBranch: 'main',
  updateInternalDependencies: 'patch',
  ignore: [],
  privatePackages: { version: true, tag: false }
});
write('.changeset/README.md', `# Changesets

Changesets is the source of package release intent and version calculation.
VyrnForge compatibility, migration and release-evidence requirements remain canonical project policy.
`);

const gitignorePath = path.join(root, '.gitignore');
let gitignore = readFileSync(gitignorePath, 'utf8');
for (const entry of ['.nx/', '.pnpm-store/', 'tmp/package-validation/']) {
  if (!gitignore.includes(entry)) gitignore += `${gitignore.endsWith('\n') ? '' : '\n'}${entry}\n`;
}
writeFileSync(gitignorePath, gitignore);

const discoveryPath = path.join(root, 'tooling/testing/discover-product-units.mjs');
let discovery = readFileSync(discoveryPath, 'utf8');
discovery = discovery.replace(
  /function workspacePackages\(root\) \{[\s\S]*?\n\}/,
  `function workspacePackages(root) {
  return ${JSON.stringify(packageNames)}.filter((name) => existingPath(root, \`packages/\${name}/package.json\`));
}`
);
discovery = discovery.replace(
  /config: `\$\{browserRoot\}\/playwright\.config\.mjs`, /,
  ''
);
discovery = discovery.replace(
  /for \(const browserPath of \[component\.browser\.fixture, component\.browser\.config, component\.browser\.tests\]\)/,
  'for (const browserPath of [component.browser.fixture, component.browser.tests])'
);
writeFileSync(discoveryPath, discovery);

const workspaceVerifierPath = path.join(root, 'tooling/verify/workspace-structure.mjs');
let workspaceVerifier = readFileSync(workspaceVerifierPath, 'utf8');
workspaceVerifier = workspaceVerifier.replace(
  /const packageJson = JSON\.parse\(await readFile\(new URL\('\.\.\/\.\.\/package\.json', import\.meta\.url\), 'utf8'\)\);/,
  `const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
const pnpmWorkspace = await readFile(new URL('../../pnpm-workspace.yaml', import.meta.url), 'utf8');`
);
workspaceVerifier = workspaceVerifier.replace(
  /if \(JSON\.stringify\(packageJson\.workspaces\) !== JSON\.stringify\(expectedWorkspaces\)\) \{\n  throw new Error\(`Root workspaces must be exactly the public packages: \$\{expectedWorkspaces\.join\(', '\)\}`\);\n\}/,
  `const workspaceEntries = [...pnpmWorkspace.matchAll(/^\\s*-\\s+(packages\\/[^\\s]+)\\s*$/gm)].map((match) => match[1]);
if (JSON.stringify(workspaceEntries) !== JSON.stringify(expectedWorkspaces)) {
  throw new Error(\`pnpm workspace must contain exactly the public packages: \${expectedWorkspaces.join(', ')}\`);
}
if ('workspaces' in packageJson) throw new Error('npm workspaces must not remain after the pnpm migration');`
);
writeFileSync(workspaceVerifierPath, workspaceVerifier);

rmSync(path.join(root, 'package-lock.json'), { force: true });

const obsoleteTestingFiles = [
  'tooling/testing/check-component-types-batch.mjs',
  'tooling/testing/check-component-types.mjs',
  'tooling/testing/run-component-browser.mjs',
  'tooling/testing/run-component-ssr-batch.mjs',
  'tooling/testing/run-component-ssr.mjs',
  'tooling/testing/run-owned-unit.mjs',
  'tooling/testing/component-browser-config.mjs',
  'tooling/testing/component-browser-config.test.mjs',
  'tooling/testing/component-browser-runtime.mjs'
];
for (const file of obsoleteTestingFiles) rmSync(path.join(root, file), { force: true });

for (const file of walk(['product'])) {
  if (/^product\/[^/]+\/test\/browser\/playwright\.config\.mjs$/.test(file)) rmSync(path.join(root, file), { force: true });
}

writeJson('tooling/project.json', {
  name: 'repository-tooling',
  $schema: '../node_modules/nx/schemas/project-schema.json',
  sourceRoot: 'tooling',
  projectType: 'library',
  tags: ['scope:repository'],
  targets: {
    lint: { executor: 'nx:run-commands', options: { command: 'pnpm exec eslint tooling --max-warnings=0' } },
    test: { executor: 'nx:run-commands', options: { command: 'pnpm exec vitest run --project repository --passWithNoTests' } }
  }
});
writeJson('product/project.json', {
  name: 'product-conformance',
  $schema: '../node_modules/nx/schemas/project-schema.json',
  sourceRoot: 'product',
  projectType: 'library',
  tags: ['scope:product'],
  targets: {
    lint: { executor: 'nx:run-commands', options: { command: 'pnpm exec eslint product --max-warnings=0' } },
    test: { executor: 'nx:run-commands', options: { command: 'pnpm exec vitest run --project product --passWithNoTests' } },
    browser: { executor: 'nx:run-commands', dependsOn: ['^build'], options: { command: 'pnpm exec playwright test --project=chromium' } }
  }
});
writeJson('apps/docs/project.json', {
  name: 'docs',
  $schema: '../../node_modules/nx/schemas/project-schema.json',
  sourceRoot: 'apps/docs',
  projectType: 'application',
  tags: ['scope:docs'],
  targets: {
    build: { executor: 'nx:run-commands', outputs: ['{workspaceRoot}/dist/docs'], options: { command: 'node apps/docs/build.mjs' } },
    lint: { executor: 'nx:run-commands', options: { command: 'pnpm exec eslint apps/docs documentation --max-warnings=0' } },
    test: { executor: 'nx:run-commands', options: { command: 'pnpm exec vitest run --project repository --passWithNoTests' } }
  }
});

for (const doc of ['README.md', 'CONTRIBUTING.md', 'tooling/README.md', 'tooling/testing/README.md']) {
  const absolute = path.join(root, doc);
  if (!existsSync(absolute)) continue;
  let content = readFileSync(absolute, 'utf8');
  content = content
    .replaceAll('npm ci --ignore-scripts --no-audit --no-fund', 'pnpm install --frozen-lockfile --ignore-scripts')
    .replaceAll('npm ci', 'pnpm install --frozen-lockfile')
    .replaceAll('npm run ', 'pnpm ');
  writeFileSync(absolute, content);
}

console.log('standard tooling migration applied');
