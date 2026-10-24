import {
  resolveEnabledIndex,
  type CollectionNavigationIntent,
  type CollectionNavigationItem,
  type CollectionNavigationOptions,
} from '../collection-navigation/index.js';

export interface CompositeFocusItem extends CollectionNavigationItem {
  id?: string;
}

export function resolveCompositeFocusIndex(
  items: readonly CompositeFocusItem[],
  currentIndex: number,
  intent: CollectionNavigationIntent,
  options: CollectionNavigationOptions = {},
): number | null {
  return resolveEnabledIndex(items, currentIndex, intent, options);
}

export function rovingTabIndex(itemIndex: number, activeIndex: number | null, disabled = false): 0 | -1 {
  return !disabled && activeIndex === itemIndex ? 0 : -1;
}

export function activeDescendantId(
  items: readonly CompositeFocusItem[],
  activeIndex: number | null,
): string | null {
  if (activeIndex == null || activeIndex < 0 || activeIndex >= items.length) return null;
  const item = items[activeIndex];
  return item && !item.disabled && item.id ? item.id : null;
}
