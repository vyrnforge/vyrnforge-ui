import { readFileSync, rmSync, writeFileSync } from 'node:fs';

const file = 'packages/angular/package.json';
const manifest = JSON.parse(readFileSync(file, 'utf8'));
manifest.scripts = {
  ...manifest.scripts,
  build: 'ng-packagr -p ng-package.json --config tsconfig.lib.json && node ../../tooling/packaging/normalize-angular-apf-output.mjs',
};
writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
rmSync('tooling/verify/wire-angular-apf-finalizer.mjs');
rmSync('.github/workflows/wire-angular-apf-finalizer.yml');
