export interface CollectionNavigationItem {
  disabled?: boolean;
}

export type CollectionNavigationIntent = 'previous' | 'next' | 'first' | 'last';

export function firstEnabledIndex(items: readonly CollectionNavigationItem[]): number | null {
  const index = items.findIndex((item) => !item.disabled);
  return index === -1 ? null : index;
}

export function lastEnabledIndex(items: readonly CollectionNavigationItem[]): number | null {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!items[index]?.disabled) return index;
  }
  return null;
}

export function resolveEnabledIndex(
  items: readonly CollectionNavigationItem[],
  currentIndex: number,
  intent: CollectionNavigationIntent,
): number | null {
  if (items.length === 0) return null;
  if (intent === 'first') return firstEnabledIndex(items);
  if (intent === 'last') return lastEnabledIndex(items);

  const enabledCount = items.reduce((count, item) => count + (item.disabled ? 0 : 1), 0);
  if (enabledCount === 0) return null;

  const step = intent === 'next' ? 1 : -1;
  let index = Number.isInteger(currentIndex) ? currentIndex : -1;
  for (let visited = 0; visited < items.length; visited += 1) {
    index = (index + step + items.length) % items.length;
    if (!items[index]?.disabled) return index;
  }
  return null;
}

export function enabledIndexForValue<T extends CollectionNavigationItem>(
  items: readonly T[],
  predicate: (item: T) => boolean,
): number | null {
  const index = items.findIndex((item) => !item.disabled && predicate(item));
  return index === -1 ? firstEnabledIndex(items) : index;
}
