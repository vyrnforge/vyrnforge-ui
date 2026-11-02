import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.dirname(packageRoot);
const workspaceRoot = path.resolve(docsRoot, '../..');

const renderers = Object.freeze({
  react: {
    file: 'renderers/react.tsx',
    marker: 'data-vf-docs-renderer="react"',
    entrypoints: [
      '@vyrnforge/react/app-shell',
      '@vyrnforge/react/button',
      '@vyrnforge/react/input',
      '@vyrnforge/react/link',
      '@vyrnforge/react/side-nav',
      '@vyrnforge/react/surface',
      '@vyrnforge/react/text',
      '@vyrnforge/react/textarea',
    ],
  },
  angular: {
    file: 'renderers/angular.ts',
    marker: 'data-vf-docs-renderer="angular"',
    entrypoints: [
      '@vyrnforge/angular/app-shell',
      '@vyrnforge/angular/button',
      '@vyrnforge/angular/input',
      '@vyrnforge/angular/link',
      '@vyrnforge/angular/side-nav',
      '@vyrnforge/angular/surface',
      '@vyrnforge/angular/text',
      '@vyrnforge/angular/textarea',
    ],
  },
  vue: {
    file: 'renderers/vue.js',
    marker: "'data-vf-docs-renderer': 'vue'",
    entrypoints: [
      '@vyrnforge/vue/app-shell',
      '@vyrnforge/vue/button',
      '@vyrnforge/vue/input',
      '@vyrnforge/vue/link',
      '@vyrnforge/vue/side-nav',
      '@vyrnforge/vue/surface',
      '@vyrnforge/vue/text',
      '@vyrnforge/vue/textarea',
    ],
  },
});

const forbiddenRuntimeInjection = [
  'dangerouslySetInnerHTML',
  '[innerHTML]',
  'DomSanitizer',
  'bypassSecurityTrustHtml',
  'v-html',
];

const forbiddenReverseDetection = [
  'componentFor(',
  "hasAttribute('data-vf-side-nav",
  "replaceAll('data-vf-side-nav",
];

for (const [framework, contract] of Object.entries(renderers)) {
  const source = await readFile(path.join(packageRoot, contract.file), 'utf8');

  for (const token of forbiddenRuntimeInjection) {
    if (source.includes(token)) {
      throw new Error(`${framework} docs renderer must not inject generated page HTML with ${token}`);
    }
  }
  for (const token of forbiddenReverseDetection) {
    if (source.includes(token)) {
      throw new Error(`${framework} docs renderer must not infer framework components from generated DOM hooks with ${token}`);
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
  if (!source.includes('model.mainContent')) {
    throw new Error(`${framework} docs renderer must support structured model-native page content`);
  }
}

const reactSource = await readFile(path.join(packageRoot, renderers.react.file), 'utf8');
for (const token of [
  "from '../playground'",
  'data-vf-docs-search-owner="react"',
  'data-vf-example-owner="react"',
  'onClick={() => setExpanded',
  'onChange={(event: React.ChangeEvent<HTMLTextAreaElement>)',
]) {
  if (!reactSource.includes(token)) {
    throw new Error(`Model-native React docs must keep React-owned interaction token: ${token}`);
  }
}
if (reactSource.includes('data-vf-example-data')) {
  throw new Error('Model-native React examples must not serialize data for the legacy DOM client');
}

const fragmentSource = await readFile(path.join(packageRoot, 'fragment.js'), 'utf8');
if (fragmentSource.includes('.innerHTML')) {
  throw new Error('Shared docs fragment parsing must not write through innerHTML');
}

const frameworkBuild = await readFile(path.join(docsRoot, 'build-framework-docs.mjs'), 'utf8');
for (const token of ['sourceFormat === \'model\'', 'resolveDocumentationContent(', '{ mainContent }']) {
  if (!frameworkBuild.includes(token)) {
    throw new Error(`Framework docs build is missing model-native contract token: ${token}`);
  }
}

const buttonModel = path.join(workspaceRoot, 'product/components/button/docs/index.json');
const buttonHtml = path.join(workspaceRoot, 'product/components/button/docs/index.html');
if (!existsSync(buttonModel)) throw new Error('Button documentation must use the model-native index.json source');
if (existsSync(buttonHtml)) throw new Error('Button documentation must not retain index.html as a competing semantic source');

for (const framework of ['native-web', 'react', 'angular', 'vue']) {
  const legacyOverlay = path.join(workspaceRoot, `product/components/button/docs/frameworks/${framework}.html`);
  if (existsSync(legacyOverlay)) {
    throw new Error(`Button ${framework} adaptation must live in the structured content model, not ${legacyOverlay}`);
  }
}

console.log('Framework app renderer contracts verified.');
