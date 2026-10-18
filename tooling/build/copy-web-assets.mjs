import { copyFile, mkdir } from 'node:fs/promises';

await mkdir(new URL('../../packages/web/dist/', import.meta.url), { recursive: true });
await copyFile(
  new URL('../../packages/web/src/styles.css', import.meta.url),
  new URL('../../packages/web/dist/styles.css', import.meta.url)
);
