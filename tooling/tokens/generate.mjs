import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { renderRuntimeTokens } from './render.mjs';

const target = fileURLToPath(new URL('../../packages/web/src/styles/tokens.css', import.meta.url));
const expected = renderRuntimeTokens();
const mode = process.argv[2] ?? '--check';

if (mode === '--write') {
  await writeFile(target, expected);
  process.stdout.write('runtime tokens generated\n');
} else if (mode === '--check') {
  const actual = await readFile(target, 'utf8');
  if (actual !== expected) {
    throw new Error('packages/web/src/styles/tokens.css is stale; run npm run generate:tokens');
  }
  process.stdout.write('runtime tokens: generated output is current\n');
} else {
  throw new Error(`Unknown token generation mode: ${mode}`);
}
