import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { discoverProductGraph } from '../../tooling/product/discover-product-graph.mjs';
import { componentUsageGroup } from './component-usage-groups.mjs';

export function documentationRegistry(root) {
  const base = JSON.parse(readFileSync(path.join(root, 'documentation/site/registry.json'), 'utf8'));
  const manualComponents = (base.pages ?? []).filter((page) => /^components\//.test(page.slug ?? ''));
  if (manualComponents.length) {
    throw new Error('Component documentation routes are discovered from the Product Graph; remove manual component routes from documentation/site/registry.json');
  }

  const graph = discoverProductGraph(root);
  const componentPages = graph.components
    .filter((component) => component.publicEntrypoints.length > 0 || component.status === 'implemented')
    .map((component) => {
      const usageGroup = componentUsageGroup(component.documentationGroup);
      const docsRoot = component.facets.docs;
      if (!docsRoot) throw new Error(`${component.id} is public/implemented but missing product-owned documentation`);

      const modelSource = `${docsRoot}index.json`;
      const htmlSource = `${docsRoot}index.html`;
      const hasModel = existsSync(path.join(root, modelSource));
      const hasHtml = existsSync(path.join(root, htmlSource));
      if (!hasModel && !hasHtml) {
        throw new Error(`${component.id} documentation has no supported index.json or index.html source under ${docsRoot}`);
      }

      return {
        slug: `components/${component.unitId}`,
        title: component.name,
        group: 'Components',
        subgroup: usageGroup.title,
        subgroupId: usageGroup.id,
        kind: 'component',
        component: component.unitId,
        source: hasModel ? modelSource : htmlSource,
        sourceFormat: hasModel ? 'model' : 'html',
        surfaces: Object.keys(component.surfaces).sort(),
      };
    });

  const [home, ...rest] = base.pages ?? [];
  return { ...base, pages: [...(home ? [home] : []), ...componentPages, ...rest] };
}
