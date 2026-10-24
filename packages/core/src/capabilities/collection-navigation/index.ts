export interface CollectionNavigationItem {
  disabled?: boolean;
}

export type CollectionNavigationIntent = 'previous' | 'next' | 'first' | 'last';
export type CollectionNavigationArrow = 'left' | 'right' | 'up' | 'down';
export type CollectionOrientation = 'horizontal' | 'vertical';
export type CollectionDirection = 'ltr' | 'rtl';

export interface CollectionNavigationOptions {
  loop?: boolean;
}

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

export function navigationIntentForArrow(
  arrow: CollectionNavigationArrow,
  orientation: CollectionOrientation,
  direction: CollectionDirection = 'ltr',
): CollectionNavigationIntent | null {
  if (orientation === 'vertical') {
    if (arrow === 'down') return 'next';
    if (arrow === 'up') return 'previous';
    return null;
  }
  if (arrow === 'right') return direction === 'rtl' ? 'previous' : 'next';
  if (arrow === 'left') return direction === 'rtl' ? 'next' : 'previous';
  return null;
}

export function resolveEnabledIndex(
  items: readonly CollectionNavigationItem[],
  currentIndex: number,
  intent: CollectionNavigationIntent,
  options: CollectionNavigationOptions = {},
): number | null {
  if (items.length === 0) return null;
  if (intent === 'first') return firstEnabledIndex(items);
  if (intent === 'last') return lastEnabledIndex(items);

  const enabledCount = items.reduce((count, item) => count + (item.disabled ? 0 : 1), 0);
  if (enabledCount === 0) return null;

  const loop = options.loop ?? true;
  const step = intent === 'next' ? 1 : -1;
  let index = Number.isInteger(currentIndex) ? currentIndex : step > 0 ? -1 : items.length;
  for (let visited = 0; visited < items.length; visited += 1) {
    const candidate = index + step;
    if (!loop && (candidate < 0 || candidate >= items.length)) return null;
    index = (candidate + items.length) % items.length;
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
