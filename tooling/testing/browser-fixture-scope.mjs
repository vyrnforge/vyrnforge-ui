// Resolve fixture preparation only. Spec selection continues to use VF_COMPONENTS.
export function selectedBrowserFixtureOwners({ selectedComponents, patterns, port }) {
  const selected = new Set(selectedComponents);
  if (!selectedComponents.size) return selected;
  for (const pattern of patterns) {
    if (!selectedComponents.has(pattern.unitId)) continue;
    for (const reference of pattern.exampleReferences ?? []) {
      if (reference.evidence.port === port) selected.add(reference.owner.replace(/^component:/, ''));
    }
  }
  return selected;
}

export async function resolveBrowserFixtureScope({ roots, port, load }) {
  const ordered = [];
  const complete = new Set();
  const active = new Set();

  async function visit(id, requiredBy) {
    if (complete.has(id)) return;
    if (active.has(id)) {
      throw new Error(`Browser fixture dependency cycle: ${[...active, id].join(' -> ')}`);
    }
    const entry = await load(id);
    if (!entry) {
      throw new Error(`Missing ${port} browser fixture dependency ${id} required by ${requiredBy ?? 'selected scope'}.`);
    }
    active.add(id);
    for (const dependency of entry.definition.dependencies?.[port] ?? []) {
      await visit(dependency, id);
    }
    active.delete(id);
    complete.add(id);
    ordered.push(entry);
  }

  for (const id of roots) await visit(id);
  return ordered;
}
