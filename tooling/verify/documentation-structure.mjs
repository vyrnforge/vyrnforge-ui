import { access, readFile } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const registry = JSON.parse(await readFile(new URL('documentation/site/registry.json', root), 'utf8'));
const requiredSharedSlugs = ['components/button', 'foundations/styling', 'foundations/accessibility', 'foundations/state-and-behavior', 'guides/testing'];
const requiredFrameworks = ['react', 'angular', 'vue', 'elements', 'native-web'];
const requiredButtonSections = ['Overview', 'Installation and imports', 'Quick start', 'Anatomy', 'Variants and sizes', 'State', 'Behavior', 'Interaction', 'Accessibility', 'Forms', 'Styling', 'Framework API', 'CSR and SSR', 'Examples', "Do / Don't", 'Testing guidance', 'Compatibility'];
const requiredFiles = [
  'documentation/README.md',
  'documentation/site/registry.json',
  'documentation/components/button.html',
  'examples/README.md',
  'examples/button/basic/example.json',
  'examples/button/basic/native-web.html',
  'examples/button/basic/react.tsx',
  'examples/button/basic/angular.ts',
  'examples/button/basic/vue.ts',
  'fixtures/README.md',
  'apps/docs/styles.css',
  'apps/docs/client.js',
  'tooling/docs/examples.mjs'
];
for (const relative of requiredFiles) await access(new URL(relative, root));

const slugs = new Set(registry.pages.map((page) => page.slug));
for (const slug of requiredSharedSlugs) if (!slugs.has(slug)) throw new Error(`Missing shared documentation page: ${slug}`);
for (const framework of requiredFrameworks) {
  const page = registry.pages.find((item) => item.framework === framework);
  if (!page) throw new Error(`Missing framework documentation adaptation: ${framework}`);
  if (page.kind !== 'framework') throw new Error(`${framework} documentation must be classified as framework adaptation content`);
}
for (const page of registry.pages) if (page.source) await access(new URL(page.source, root));

const buttonSource = await readFile(new URL('documentation/components/button.html', root), 'utf8');
if (!buttonSource.includes('<div data-vf-example="button/basic"></div>')) throw new Error('Button documentation must compose its executable quick-start example');
if (buttonSource.includes('first new-generation component baseline')) throw new Error('Public Button documentation must not expose rebuild-history status language');
for (const section of requiredButtonSections) if (!buttonSource.includes(`<h2>${section}</h2>`)) throw new Error(`Button documentation missing standard section: ${section}`);

const exampleManifest = JSON.parse(await readFile(new URL('examples/button/basic/example.json', root), 'utf8'));
if (exampleManifest.id !== 'button/basic') throw new Error('Button example id must match examples/button/basic');
if (exampleManifest.defaultFramework !== 'react') throw new Error('Button example should default to React while retaining explicit framework selection');
for (const framework of ['native-web', 'react', 'angular', 'vue']) {
  const config = exampleManifest.frameworks?.[framework];
  if (!config?.source) throw new Error(`Button executable example missing ${framework} source`);
  await access(new URL(`examples/button/basic/${config.source}`, root));
}
if (exampleManifest.frameworks?.elements) throw new Error('Button docs must not imply an Elements surface before Button Elements is implemented');

process.stdout.write('documentation source structure: executable Button documentation ok\n');
