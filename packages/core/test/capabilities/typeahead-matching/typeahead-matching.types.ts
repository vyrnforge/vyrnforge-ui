import {
  findTypeaheadMatch,
  type TypeaheadItem,
  type TypeaheadMatchOptions,
} from '@vyrnforge/core/typeahead-matching';

const items: readonly TypeaheadItem[] = [
  { textValue: 'Alpha' },
  { textValue: 'Beta', eligible: false },
];
const options: TypeaheadMatchOptions = { startIndex: 0, wrap: true, locale: 'en' };
const match: number | null = findTypeaheadMatch(items, 'a', options);

void match;
