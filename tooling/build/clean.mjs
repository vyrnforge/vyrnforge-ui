import { rm } from 'node:fs/promises';

for (const name of ['core', 'web', 'react', 'angular', 'vue', 'elements']) {
  await rm(new URL(`../../packages/${name}/dist/`, import.meta.url), { recursive: true, force: true });
}
