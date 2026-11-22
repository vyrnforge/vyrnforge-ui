import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { assertGeneratedOutputCurrent } from './generation.mjs';
import { renderRuntimeTokens, renderThemeAuthoringData } from './render.mjs';

const target = fileURLToPath(new URL('../../packages/web/src/styles/tokens.css', import.meta.url));
const generated = [
  { target, expected: renderRuntimeTokens() },
  {
    target: fileURLToPath(new URL('../../packages/web/src/theme/defaults.generated.ts', import.meta.url)),
    expected: renderThemeAuthoringData(),
  },
];
const mode = process.argv[2] ?? '--check';

if (mode === '--write') {
  for (const output of generated) await writeFile(output.target, output.expected);
  process.stdout.write('runtime tokens generated; theme authoring defaults generated\n');
} else if (mode === '--check') {
  for (const output of generated) {
    const actual = await readFile(output.target, 'utf8');
    assertGeneratedOutputCurrent(actual, output.expected);
  }
  process.stdout.write('runtime tokens: generated output is current; theme authoring defaults are current\n');
} else {
  throw new Error(`Unknown token generation mode: ${mode}`);
}