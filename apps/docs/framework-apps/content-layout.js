function headingId(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'section';
}

function uniqueHeadingId(value, usedIds) {
  const base = headingId(value);
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) id = `${base}-${suffix++}`;
  usedIds.add(id);
  return id;
}

function currentNavigationGroup(navigation = []) {
  for (const group of navigation) {
    if ((group.items || []).some((item) => item.current)) return group.label;
    if ((group.subgroups || []).some((subgroup) => (subgroup.items || []).some((item) => item.current))) {
      return group.label;
    }
  }
  return null;
}

export function buildContentLayoutModel(content, navigation = [], homeHref = './') {
  if (!content) return null;
  const usedIds = new Set();
  const headings = [];
  const sections = (content.sections || []).map((section) => {
    const id = uniqueHeadingId(section.title, usedIds);
    headings.push({ id, title: section.title, level: 2 });
    const blocks = (section.blocks || []).map((block) => {
      if (block.type !== 'heading') return block;
      const blockId = uniqueHeadingId(block.text, usedIds);
      headings.push({ id: blockId, title: block.text, level: Math.min(6, Math.max(3, Number(block.level) || 3)) });
      return { ...block, id: blockId };
    });
    return { ...section, id, blocks };
  });
  const groupLabel = currentNavigationGroup(navigation);
  return {
    content: { ...content, sections },
    headings,
    breadcrumbs: [
      { label: 'Docs', href: homeHref },
      ...(groupLabel ? [{ label: groupLabel }] : []),
      { label: content.pageTitle, current: true },
    ],
  };
}
