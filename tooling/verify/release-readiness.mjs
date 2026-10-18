import { readFile } from 'node:fs/promises';

const root = JSON.parse(await readFile('package.json', 'utf8'));
const support = JSON.parse(await readFile('tooling/compatibility/support-status.json', 'utf8'));
const docsManifest = JSON.parse(await readFile('dist/docs/next/site-manifest.json', 'utf8'));

if (root.version.endsWith('-rebuild')) {
  throw new Error('Release validation cannot pass while the repository version is a rebuild bootstrap version');
}
if (support.status === 'bootstrap') {
  throw new Error('Release validation requires a non-bootstrap compatibility status');
}
if (docsManifest.version !== root.version) {
  throw new Error('Versioned documentation does not match the release package version');
}
for (const [framework, range] of Object.entries(support.frameworks ?? {})) {
  if (String(range).includes('not-yet') || String(range).includes('not-implemented')) {
    throw new Error(`Release compatibility is unresolved for ${framework}: ${range}`);
  }
}

process.stdout.write('release readiness: ok\n');
