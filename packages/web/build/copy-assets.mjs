import { cp, copyFile, mkdir } from 'node:fs/promises';
import { verifyPublicCssVariableReferences } from './verify-css-token-references.mjs';

await verifyPublicCssVariableReferences();

const dist = new URL('../dist/', import.meta.url);
await mkdir(dist, { recursive: true });
await copyFile(new URL('../src/styles.css', import.meta.url), new URL('../dist/styles.css', import.meta.url));
await cp(new URL('../src/styles/', import.meta.url), new URL('../dist/styles/', import.meta.url), { recursive: true });
await cp(new URL('../src/components/', import.meta.url), new URL('../dist/components/', import.meta.url), { recursive: true });
