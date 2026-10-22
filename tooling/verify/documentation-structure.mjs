import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentationRegistry } from '../docs/registry.mjs';
import { discoverProductUnits } from '../testing/discover-product-units.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const registry = documentationRegistry(root);
const discovery = discoverProductUnits(root);
const requiredSharedSlugs = [
  'foundations/styling',
  'foundations/accessibility',
  'foundations/state-and-behavior',
  'guides/testing',
  'guides/migration',
  'guides/diagnostics',
  'support/developer-support',
];
const requiredFrameworks = ['react', 'angular', 'vue', 'elements', 'native-web'];
const requiredComponentSections = ['Overview', 'Installation and imports', 'Quick start', 'Accessibility', 'Styling', 'Framework API', 'Compatibility'];
for (const relative of ['documentation/README.md', 'documentation/site/registry.json', 'components/README.md', 'fixtures/README.md', 'apps/docs/styles.css', 'apps/docs/client.js', 'tooling/docs/examples.mjs', 'tooling/docs/registry.mjs']) await access(path.join(root, relative));
const slugs = new Set(registry.pages.map((page) => page.slug));
for (const slug of requiredSharedSlugs) if (!slugs.has(slug)) throw new Error(`Missing shared documentation page: ${slug}`);
for (const framework of requiredFrameworks) {
  const page = registry.pages.find((item) => item.framework === framework);
  if (!page || page.kind !== 'framework') throw new Error(`Missing framework documentation adaptation: ${framework}`);
}
for (const page of registry.pages) if (page.source) await access(path.join(root, page.source));
for (const component of discovery.components) {
  const page = registry.pages.find((item) => item.slug === `components/${component.component}`);
  if (!page || page.source !== component.documentationSource) throw new Error(`${component.component} documentation route was not discovered from its ownership slice`);
  const source = await readFile(path.join(root, component.documentationSource), 'utf8');
  for (const section of requiredComponentSections) if (!source.includes(`<h2>${section}</h2>`)) throw new Error(`${component.component} documentation missing universal section: ${section}`);
  for (const manifestPath of component.exampleManifests) {
    const manifest = JSON.parse(await readFile(path.join(root, manifestPath), 'utf8'));
    if (!manifest.id.startsWith(`${component.component}/`)) throw new Error(`${manifestPath} id must be owned by ${component.component}`);
    if (!manifest.frameworks?.[manifest.defaultFramework]) throw new Error(`${manifest.id} default framework must be implemented by the example`);
    for (const config of Object.values(manifest.frameworks ?? {})) if (!config.source) throw new Error(`${manifest.id} contains an example surface without a source file`); else await access(path.join(root, path.dirname(manifestPath), config.source));
    if (!source.includes(`data-vf-example="${manifest.id}"`)) throw new Error(`${component.component} documentation must compose executable example ${manifest.id}`);
  }
}
process.stdout.write(`documentation source structure: ${discovery.components.length} discovered component pages and L0 DX surfaces ok\n`);
