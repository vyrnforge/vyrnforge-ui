import {
  enabledIndexForValue,
  firstEnabledIndex,
  lastEnabledIndex,
  resolveEnabledIndex,
  type CollectionNavigationIntent,
  type CollectionNavigationItem,
} from '@vyrnforge/core/collection-navigation';

interface ValueItem extends CollectionNavigationItem {
  value: string;
}

const items: readonly CollectionNavigationItem[] = [{}, { disabled: true }];
const valueItems: readonly ValueItem[] = [{ value: 'a' }];
const intent: CollectionNavigationIntent = 'next';

const first: number | null = firstEnabledIndex(items);
const last: number | null = lastEnabledIndex(items);
const next: number | null = resolveEnabledIndex(items, 0, intent);
const byValue: number | null = enabledIndexForValue(valueItems, (item) => item.value === 'a');

void [first, last, next, byValue];
