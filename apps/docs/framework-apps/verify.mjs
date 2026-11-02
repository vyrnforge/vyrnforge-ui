import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

const renderers = Object.freeze({
  react: {
    file: 'renderers/react.js',
    marker: "'data-vf-docs-renderer': 'react'",
    entrypoints: ['@vyrnforge/react/app-shell', '@vyrnforge/react/input', '@vyrnforge/react/side-nav'],
  },
  angular: {
    file: 'renderers/angular.ts',
    marker: 'data-vf-docs-renderer="angular"',
    entrypoints: ['@vyrnforge/angular/app-shell', '@vyrnforge/angular/input', '@vyrnforge/angular/side-nav'],
  },
  vue: {
    file: 'renderers/vue.js',
    marker: "'data-vf-docs-renderer': 'vue'",
    entrypoints: ['@vyrnforge/vue/app-shell', '@vyrnforge/vue/input', '@vyrnforge/vue/side-nav'],
  },
});

const forbiddenRuntimeInjection = [
  'dangerouslySetInnerHTML',
  '[innerHTML]',
  'DomSanitizer',
  'bypassSecurityTrustHtml',
  'v-html',
];

for (const [framework, contract] of Object.entries(renderers)) {
  const source = await readFile(path.join(packageRoot, contract.file), 'utf8');

  for (const token of forbiddenRuntimeInjection) {
    if (source.includes(token)) {
      throw new Error(`${framework} docs renderer must not inject generated page HTML with ${token}`);
    }
  }

  for (const entrypoint of contract.entrypoints) {
    if (!source.includes(`from '${entrypoint}'`)) {
      throw new Error(`${framework} docs renderer must consume public entrypoint ${entrypoint}`);
    }
  }

  if (!source.includes(contract.marker)) {
    throw new Error(`Framework docs renderer marker is missing for ${framework}`);
  }
}

const fragmentSource = await readFile(path.join(packageRoot, 'fragment.js'), 'utf8');
if (fragmentSource.includes('.innerHTML')) {
  throw new Error('Shared docs fragment parsing must not write through innerHTML');
}

console.log('Framework app renderer contracts verified.');
