import { readFileSync, rmSync, writeFileSync } from 'node:fs';

const packages = ['core', 'web', 'icons', 'react', 'angular', 'vue', 'elements'];
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
for (const name of packages) packageJson.devDependencies[`@vyrnforge/${name}`] = 'workspace:*';
writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`);

const vitestPath = 'vitest.config.mjs';
let vitest = readFileSync(vitestPath, 'utf8');
vitest = vitest.replace(
  "environment: 'node',\n    include: [`packages/${name}/test/**/*.test.mjs`],",
  "environment: 'node',\n    setupFiles: name === 'angular' ? ['./tooling/testing/angular-vitest.setup.mjs'] : [],\n    include: [`packages/${name}/test/**/*.test.mjs`],",
);
writeFileSync(vitestPath, vitest);

writeFileSync(
  'tooling/testing/angular-vitest.setup.mjs',
  "// Angular libraries are published in partial-Ivy APF form. Load the compiler in the Node test runtime so direct package-import SSR smoke tests can execute without an application linker.\nimport '@angular/compiler';\n",
);

rmSync('pnpm-lock.yaml', { force: true });
rmSync('tooling/verify/fix-angular-test-runtime.mjs', { force: true });
rmSync('.github/workflows/fix-angular-test-runtime.yml', { force: true });
