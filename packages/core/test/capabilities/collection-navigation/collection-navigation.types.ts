import {
  enabledIndexForValue,
  firstEnabledIndex,
  lastEnabledIndex,
  resolveEnabledIndex,
  type CollectionNavigationIntent,
  type CollectionNavigationItem,
} from '@vyrnforge/core/collection-navigation';

const items: readonly CollectionNavigationItem[] = [{}, { disabled: true }];
const intent: CollectionNavigationIntent = 'next';

const first: number | null = firstEnabledIndex(items);
const last: number | null = lastEnabledIndex(items);
const next: number | null = resolveEnabledIndex(items, 0, intent);
const byValue: number | null = enabledIndexForValue([{ value: 'a' }], (item) => item.value === 'a');

void [first, last, next, byValue];
