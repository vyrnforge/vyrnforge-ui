import {
  navigationIntentForArrow,
  resolveNavigationIndex,
  type CollectionDirection,
  type CollectionNavigationArrow,
  type CollectionNavigationIntent,
  type CollectionNavigationItem,
  type CollectionNavigationOptions,
  type CollectionOrientation,
} from '@vyrnforge/core/collection-navigation';

const items: readonly CollectionNavigationItem[] = [{}, { eligible: false }];
const intent: CollectionNavigationIntent = 'next';
const arrow: CollectionNavigationArrow = 'right';
const orientation: CollectionOrientation = 'horizontal';
const direction: CollectionDirection = 'ltr';
const options: CollectionNavigationOptions = { loop: false };

const next: number | null = resolveNavigationIndex(items, 0, intent, options);
const mapped: CollectionNavigationIntent | null = navigationIntentForArrow(arrow, orientation, direction);

void [next, mapped];
