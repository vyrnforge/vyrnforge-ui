import { readFileSync } from 'node:fs';
import path from 'node:path';
import { discoverProductUnits } from '../../tooling/testing/discover-product-units.mjs';
import { componentUsageGroup } from './component-usage-groups.mjs';

function titleCase(id) {
  return id.split('-').map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : part).join(' ');
}

export function documentationRegistry(root) {
  const base = JSON.parse(readFileSync(path.join(root, 'documentation/site/registry.json'), 'utf8'));
  const manualComponents = (base.pages ?? []).filter((page) => /^components\//.test(page.slug ?? ''));
  if (manualComponents.length) throw new Error('Component documentation routes are discovered from product/<id>/docs; remove manual component routes from documentation/site/registry.json');
  const componentPages = discoverProductUnits(root).components.map((component) => {
    const usageGroup = componentUsageGroup(component.documentationGroup);
    return {
      slug: `components/${component.component}`,
      title: titleCase(component.component),
      group: 'Components',
      subgroup: usageGroup.title,
      subgroupId: usageGroup.id,
      kind: 'component',
      component: component.component,
      source: component.documentationSource,
    };
  });
  const [home, ...rest] = base.pages ?? [];
  return { ...base, pages: [...(home ? [home] : []), ...componentPages, ...rest] };
}
