export interface TypeaheadItem {
  textValue: string;
  eligible?: boolean;
}

export interface TypeaheadMatchOptions {
  startIndex?: number;
  wrap?: boolean;
  locale?: string | readonly string[];
}

function normalizeTypeaheadText(value: string, locale?: string | readonly string[]): string {
  const locales = typeof locale === 'string' || locale === undefined ? locale : [...locale];
  return value
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase(locales);
}

export function findTypeaheadMatch(
  items: readonly TypeaheadItem[],
  query: string,
  options: TypeaheadMatchOptions = {},
): number | null {
  if (items.length === 0) return null;

  const normalizedQuery = normalizeTypeaheadText(query, options.locale);
  if (!normalizedQuery) return null;

  const start = Number.isInteger(options.startIndex)
    && (options.startIndex ?? -1) >= 0
    && (options.startIndex ?? -1) < items.length
    ? (options.startIndex ?? -1)
    : -1;
  const wrap = options.wrap ?? true;

  for (let offset = 1; offset <= items.length; offset += 1) {
    const rawIndex = start + offset;
    if (!wrap && rawIndex >= items.length) break;
    const index = ((rawIndex % items.length) + items.length) % items.length;
    const item = items[index];
    if (!item || item.eligible === false) continue;
    if (normalizeTypeaheadText(item.textValue, options.locale).startsWith(normalizedQuery)) return index;
  }

  return null;
}
