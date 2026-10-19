import { readFileSync } from 'node:fs';
import path from 'node:path';
import { discoverProductUnits } from '../testing/discover-product-units.mjs';

function titleCase(id) {
  return id.split('-').map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : part).join(' ');
}

export function documentationRegistry(root) {
  const base = JSON.parse(readFileSync(path.join(root, 'documentation/site/registry.json'), 'utf8'));
  const manualComponents = (base.pages ?? []).filter((page) => /^components\//.test(page.slug ?? ''));
  if (manualComponents.length) throw new Error('Component documentation routes are discovered from components/<id>/docs; remove manual component routes from documentation/site/registry.json');
  const componentPages = discoverProductUnits(root).components.map((component) => ({
    slug: `components/${component.component}`,
    title: titleCase(component.component),
    group: 'Components',
    kind: 'component',
    component: component.component,
    source: component.documentationSource
  }));
  const [home, ...rest] = base.pages ?? [];
  return { ...base, pages: [...(home ? [home] : []), ...componentPages, ...rest] };
}
