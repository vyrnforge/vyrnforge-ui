import { access, readFile } from 'node:fs/promises';

const registry = JSON.parse(await readFile(new URL('../../documentation/site/registry.json', import.meta.url), 'utf8'));
const requiredSharedSlugs = ['components/button', 'foundations/styling', 'foundations/accessibility', 'foundations/state-and-behavior', 'guides/testing'];
const requiredFrameworks = ['react', 'angular', 'vue', 'elements', 'native-web'];
for (const relative of ['documentation/README.md', 'documentation/site/registry.json', 'documentation/components/button.html', 'examples/README.md', 'fixtures/README.md', 'apps/docs/styles.css', 'apps/docs/client.js']) await access(new URL(`../../${relative}`, import.meta.url));
const slugs = new Set(registry.pages.map((page) => page.slug));
for (const slug of requiredSharedSlugs) if (!slugs.has(slug)) throw new Error(`Missing shared documentation page: ${slug}`);
for (const framework of requiredFrameworks) { const page = registry.pages.find((item) => item.framework === framework); if (!page) throw new Error(`Missing framework documentation adaptation: ${framework}`); if (page.kind !== 'framework') throw new Error(`${framework} documentation must be classified as framework adaptation content`); }
for (const page of registry.pages) if (page.source) await access(new URL(`../../${page.source}`, import.meta.url));
process.stdout.write('documentation source structure: ok\n');
