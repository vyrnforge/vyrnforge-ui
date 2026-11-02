import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const sourcePath = path.join(root, 'apps/docs/build-framework-apps.mjs');
const source = await readFile(sourcePath, 'utf8');

const forbiddenRuntimeInjection = [
  'dangerouslySetInnerHTML',
  '[innerHTML]',
  'DomSanitizer',
  'bypassSecurityTrustHtml',
  'v-html'
];

for (const token of forbiddenRuntimeInjection) {
  if (source.includes(token)) {
    throw new Error(`Framework docs renderer must not inject generated page HTML with ${token}`);
  }
}

const requiredPublicSurfaces = [
  '@vyrnforge/react/app-shell',
  '@vyrnforge/react/input',
  '@vyrnforge/react/side-nav',
  '@vyrnforge/angular/app-shell',
  '@vyrnforge/angular/input',
  '@vyrnforge/angular/side-nav',
  '@vyrnforge/vue/app-shell',
  '@vyrnforge/vue/input',
  '@vyrnforge/vue/side-nav'
];

for (const entrypoint of requiredPublicSurfaces) {
  if (!source.includes(`from '${entrypoint}'`)) {
    throw new Error(`Framework docs renderer must consume public entrypoint ${entrypoint}`);
  }
}

for (const framework of ['react', 'angular', 'vue']) {
  if (!source.includes(`data-vf-docs-renderer': '${framework}`) && !source.includes(`data-vf-docs-renderer="${framework}"`)) {
    throw new Error(`Framework docs renderer marker is missing for ${framework}`);
  }
}

console.log('Framework renderer contract verified.');
