import { cp, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { verifyPublicCssVariableReferences } from './verify-css-token-references.mjs';

const sourceRoot = process.env.VF_PACKAGE_SOURCE_ROOT
  ? pathToFileURL(`${path.resolve(process.env.VF_PACKAGE_SOURCE_ROOT)}${path.sep}`)
  : new URL('../src/', import.meta.url);

await verifyPublicCssVariableReferences({ cssRoot: sourceRoot });

const dist = new URL('../dist/', import.meta.url);
await mkdir(dist, { recursive: true });
await copyFile(new URL('styles.css', sourceRoot), new URL('../dist/styles.css', import.meta.url));
await cp(new URL('styles/', sourceRoot), new URL('../dist/styles/', import.meta.url), { recursive: true });
await cp(new URL('components/', sourceRoot), new URL('../dist/components/', import.meta.url), { recursive: true });
await cp(new URL('foundations/', sourceRoot), new URL('../dist/foundations/', import.meta.url), { recursive: true });
