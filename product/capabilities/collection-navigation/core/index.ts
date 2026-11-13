export interface CollectionNavigationItem {
  eligible?: boolean;
}

export type CollectionNavigationIntent = 'previous' | 'next' | 'first' | 'last';
export type CollectionNavigationArrow = 'left' | 'right' | 'up' | 'down';
export type CollectionOrientation = 'horizontal' | 'vertical';
export type CollectionDirection = 'ltr' | 'rtl';

export interface CollectionNavigationOptions {
  loop?: boolean;
}

function isEligible(item: CollectionNavigationItem | undefined): boolean {
  return item?.eligible !== false;
}

function firstEligibleIndex(items: readonly CollectionNavigationItem[]): number | null {
  const index = items.findIndex((item) => isEligible(item));
  return index === -1 ? null : index;
}

function lastEligibleIndex(items: readonly CollectionNavigationItem[]): number | null {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (isEligible(items[index])) return index;
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

export function resolveNavigationIndex(
  items: readonly CollectionNavigationItem[],
  currentIndex: number,
  intent: CollectionNavigationIntent,
  options: CollectionNavigationOptions = {},
): number | null {
  if (items.length === 0) return null;
  if (intent === 'first') return firstEligibleIndex(items);
  if (intent === 'last') return lastEligibleIndex(items);

  const first = firstEligibleIndex(items);
  if (first === null) return null;

  if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= items.length) {
    return intent === 'next' ? first : lastEligibleIndex(items);
  }

  const loop = options.loop ?? true;
  const step = intent === 'next' ? 1 : -1;
  let index = currentIndex;

  for (let visited = 0; visited < items.length; visited += 1) {
    const candidate = index + step;
    if (!loop && (candidate < 0 || candidate >= items.length)) return null;
    index = (candidate + items.length) % items.length;
    if (isEligible(items[index])) return index;
  }

  return null;
}
