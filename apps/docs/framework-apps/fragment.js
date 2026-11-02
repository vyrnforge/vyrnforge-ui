const invalidWhitespaceParents = new Set(['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'COLGROUP']);

export function parseFragment(value) {
  const range = document.createRange();
  range.selectNode(document.body);
  return Array.from(range.createContextualFragment(value || '').childNodes);
}

export function textNodeValue(node) {
  const value = node.textContent || '';
  if (/^\s*$/.test(value) && invalidWhitespaceParents.has(node.parentElement?.tagName || '')) return null;
  return value;
}
