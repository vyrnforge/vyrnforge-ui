import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupPackageProjection, preparePackageProjection } from './package-projection.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const packageId = process.argv[2];
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...options.env },
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with status ${result.status}`);
  }
}

if (!packageId) throw new Error('Usage: node tooling/product/build-projected-package.mjs <package-id>');

const projection = preparePackageProjection({ root, packageId, stageId: 'build' });
try {
  if (packageId === 'angular') {
    run(pnpm, [
      'exec',
      'ng-packagr',
      '-p',
      path.relative(root, path.join(projection.stageRoot, 'ng-package.json')),
      '--config',
      path.relative(root, path.join(projection.stageRoot, 'tsconfig.lib.json')),
    ]);
    run(process.execPath, ['tooling/packaging/normalize-angular-apf-output.mjs']);
  } else {
    if (packageId === 'web') run(process.execPath, ['tooling/tokens/generate.mjs', '--check']);
    run(pnpm, ['exec', 'tsc', '-p', path.relative(root, path.join(projection.stageRoot, 'tsconfig.json'))]);
    if (packageId === 'web') {
      run(process.execPath, ['packages/web/build/copy-assets.mjs'], {
        env: { VF_PACKAGE_SOURCE_ROOT: projection.sourceRoot },
      });
    }
  }
} finally {
  cleanupPackageProjection(root, packageId, 'build');
}
