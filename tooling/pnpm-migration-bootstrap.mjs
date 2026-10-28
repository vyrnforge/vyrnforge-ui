import { readFile, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const packageNames = ['core', 'web', 'icons', 'react', 'angular', 'vue', 'elements'];
const workspacePaths = packageNames.map((name) => `packages/${name}`);

const root = JSON.parse(await readFile('package.json', 'utf8'));
root.packageManager = 'pnpm@12.16.1';
root.engines = { node: '>=24.18 <25', pnpm: '>=12.16.1 <13' };
for (const [name, script] of Object.entries(root.scripts ?? {})) {
  root.scripts[name] = script
    .replace(/npm run build --workspace (@vyrnforge\/[A-Za-z0-9-]+)/g, 'pnpm --filter $1 build')
    .replace(/npm run ([A-Za-z0-9:_-]+)/g, 'pnpm $1');
}
await writeFile('package.json', `${JSON.stringify(root, null, 2)}\n`);

for (const name of packageNames) {
  const file = `packages/${name}/package.json`;
  const manifest = JSON.parse(await readFile(file, 'utf8'));
  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const dependency of Object.keys(manifest[section] ?? {})) {
      if (dependency.startsWith('@vyrnforge/')) manifest[section][dependency] = 'workspace:*';
    }
  }
  await writeFile(file, `${JSON.stringify(manifest, null, 2)}\n`);
}

await writeFile('pnpm-workspace.yaml', `packages:\n${workspacePaths.map((item) => `  - ${item}`).join('\n')}\n`);
await rm('package-lock.json', { force: true });

for (const entry of await readdir('.github/workflows')) {
  if (!entry.endsWith('.yml') || entry === 'pnpm-migration-runner.yml') continue;
  const file = path.join('.github/workflows', entry);
  let source = await readFile(file, 'utf8');
  source = source
    .replace(/^\s*cache: npm\s*$/gm, '')
    .replace(/node-version-file: \.node-version\n(?!\s*package-manager-cache:)/g, 'node-version-file: .node-version\n          package-manager-cache: false\n')
    .replace(/(      - (?:name: Setup Node\n        )?uses: actions\/setup-node@v7\n        with:\n(?:          .+\n)+)(?!      - name: Enable pinned pnpm)/g, '$1      - name: Enable pinned pnpm\n        run: |\n          corepack enable\n          corepack install --global pnpm@12.16.1\n')
    .replace(/npm ci --ignore-scripts(?: --no-audit)?(?: --no-fund)?/g, 'pnpm install --frozen-lockfile --ignore-scripts')
    .replace(/npm run ([A-Za-z0-9:_-]+)/g, 'pnpm $1')
    .replaceAll('npx playwright', 'pnpm exec playwright');
  await writeFile(file, source);
}

for (const file of ['README.md', 'CONTRIBUTING.md', 'AGENTS.md']) {
  let source = await readFile(file, 'utf8');
  source = source
    .replace(/npm ci(?: --ignore-scripts)?(?: --no-audit)?(?: --no-fund)?/g, 'pnpm install --frozen-lockfile')
    .replace(/npm run ([A-Za-z0-9:_-]+)/g, 'pnpm $1')
    .replaceAll('npm install', 'pnpm install')
    .replaceAll('npx ', 'pnpm exec ');
  await writeFile(file, source);
}

const workspaceVerifier = 'tooling/verify/workspace-structure.mjs';
let verifier = await readFile(workspaceVerifier, 'utf8');
const marker = "const rootManifest = JSON.parse(await readFile('package.json', 'utf8'));";
const addition = `${marker}\nconst expectedPnpmWorkspace = \`packages:\\n\${expectedWorkspace.map((workspace) => \`  - \${workspace}\`).join('\\n')}\\n\`;\nconst actualPnpmWorkspace = await readFile('pnpm-workspace.yaml', 'utf8');\nif (actualPnpmWorkspace !== expectedPnpmWorkspace) throw new Error('pnpm-workspace.yaml must contain exactly the approved seven-package topology');\nif (rootManifest.packageManager !== 'pnpm@12.16.1') throw new Error('Repository packageManager must pin pnpm@12.16.1');`;
if (!verifier.includes('expectedPnpmWorkspace')) verifier = verifier.replace(marker, addition);
await writeFile(workspaceVerifier, verifier);

const consumerVerifier = 'tooling/verify/consumer-packages.mjs';
let consumer = await readFile(consumerVerifier, 'utf8');
consumer = consumer
  .replace('Unexpected npm pack result', 'Unexpected pnpm pack result')
  .replace("const raw = execFileSync('npm', ['pack', '--json', '--pack-destination', tarballDir, path.resolve('packages', name)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });\n    const result = JSON.parse(raw)[0];", "const raw = execFileSync('pnpm', ['--dir', path.resolve('packages', name), 'pack', '--pack-destination', tarballDir], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });\n    const filename = path.basename(raw.trim().split(/\\r?\\n/).at(-1));\n    const packedFiles = execFileSync('tar', ['-tzf', path.join(tarballDir, filename)], { encoding: 'utf8' }).trim().split(/\\r?\\n/).filter(Boolean).map((entry) => ({ path: entry.replace(/^package\\//, '') }));\n    const result = { name: manifest.name, filename, files: packedFiles };")
  .replace("execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', ...tarballs], { cwd: consumerDir, stdio: 'inherit' });", "execFileSync('pnpm', ['add', '--ignore-scripts', ...tarballs], { cwd: consumerDir, stdio: 'inherit' });")
  .replace("if (manifest.name !== `@vyrnforge/${name}`) throw new Error(`Installed consumer package mismatch for ${name}`);", "if (manifest.name !== `@vyrnforge/${name}`) throw new Error(`Installed consumer package mismatch for ${name}`);\n    for (const range of Object.values(manifest.dependencies ?? {})) if (typeof range === 'string' && range.startsWith('workspace:')) throw new Error(`${manifest.name} packed manifest leaked workspace protocol`);");
await writeFile(consumerVerifier, consumer);
