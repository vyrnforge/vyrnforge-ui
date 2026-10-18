import { access } from 'node:fs/promises';

for (const relative of [
  'documentation/README.md',
  'documentation/shared/README.md',
  'documentation/frameworks/README.md',
  'examples/README.md',
  'fixtures/README.md'
]) {
  await access(new URL(`../../${relative}`, import.meta.url));
}

process.stdout.write('documentation structure: ok\n');
