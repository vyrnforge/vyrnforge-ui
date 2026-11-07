import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupPackageProjection, preparePackageProjection } from './package-projection.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const packageId = process.argv[2];
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} exited with status ${result.status}`);
}

if (!packageId) throw new Error('Usage: node tooling/product/typecheck-projected-package.mjs <package-id>');

const projection = preparePackageProjection({ root, packageId, stageId: 'typecheck' });
try {
  if (packageId === 'angular') {
    run(pnpm, ['exec', 'ngc', '-p', path.relative(root, path.join(projection.stageRoot, 'tsconfig.json')), '--noEmit']);
  } else {
    run(pnpm, ['exec', 'tsc', '-p', path.relative(root, path.join(projection.stageRoot, 'tsconfig.json')), '--noEmit']);
  }
} finally {
  cleanupPackageProjection(root, packageId, 'typecheck');
}
