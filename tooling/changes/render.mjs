import { mkdir, writeFile } from 'node:fs/promises';
import { discoverChangeFragments, renderUnreleasedChanges } from './fragments.mjs';

const fragments = discoverChangeFragments();
const output = process.argv[2] || 'dist/releases/unreleased.md';
await mkdir(new URL('../../dist/releases/', import.meta.url), { recursive: true });
await writeFile(output, renderUnreleasedChanges(fragments));
process.stdout.write(`change preview: ${fragments.length} fragments -> ${output}\n`);
