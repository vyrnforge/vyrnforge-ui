import { execFileSync } from 'node:child_process';
import process from 'node:process';
import { browserPortNames } from '../package-model.mjs';

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

for (const port of browserPortNames) {
  process.stdout.write(`\n=== VyrnForge browser matrix: ${port} ===\n`);
  execFileSync(pnpm, ['exec', 'playwright', 'test'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      VF_COMPONENT_PORT: port,
      VF_COMPONENTS: '',
    },
  });
}
