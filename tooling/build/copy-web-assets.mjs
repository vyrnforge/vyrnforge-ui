import { cp, copyFile, mkdir } from 'node:fs/promises';

const dist = new URL('../../packages/web/dist/', import.meta.url);
await mkdir(dist, { recursive: true });
await copyFile(
  new URL('../../packages/web/src/styles.css', import.meta.url),
  new URL('../../packages/web/dist/styles.css', import.meta.url)
);
await cp(
  new URL('../../packages/web/src/styles/', import.meta.url),
  new URL('../../packages/web/dist/styles/', import.meta.url),
  { recursive: true }
);
