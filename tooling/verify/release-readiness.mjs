import { readFile } from 'node:fs/promises';

const root = JSON.parse(await readFile('package.json', 'utf8'));
const support = JSON.parse(await readFile('tooling/testing/compatibility/support-status.json', 'utf8'));
const docsManifest = JSON.parse(await readFile('dist/docs/next/site-manifest.json', 'utf8'));

if (root.version.endsWith('-rebuild')) {
  throw new Error('Release validation cannot pass while the repository version is a rebuild bootstrap version');
}
if (support.status !== 'release-support') {
  throw new Error('Release validation requires compatibility metadata promoted to release-support');
}
if (docsManifest.version !== root.version) {
  throw new Error('Versioned documentation does not match the release package version');
}
for (const framework of ['react', 'angular', 'vue', 'elements']) {
  const entry = support.frameworks?.[framework];
  if (!entry || entry.status !== 'implemented') {
    throw new Error(`Release compatibility is not implemented for ${framework}`);
  }
}
if (support.browsers?.status !== 'release-qualified') {
  throw new Error('Release browser baseline has not been promoted to release-qualified');
}
if (support.ssrBundlers?.status !== 'release-qualified') {
  throw new Error('Release SSR/bundler compatibility remains unresolved');
}

process.stdout.write('release readiness: ok\n');
