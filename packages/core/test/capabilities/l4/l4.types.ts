import { findTypeaheadMatch, type TypeaheadItem } from '../../../src/capabilities/typeahead-matching/index.js';
import { toggleSelection } from '../../../src/capabilities/selection-operations/index.js';
import { resolveCompositeFocusIndex, type CompositeFocusItem } from '../../../src/capabilities/composite-focus/index.js';

const items: readonly TypeaheadItem[] = [{ textValue: 'One' }];
const match: number | null = findTypeaheadMatch(items, 'o');
const selected: string[] = toggleSelection(['a'], 'b');
const focusItems: readonly CompositeFocusItem[] = [{ id: 'one' }];
const focusIndex: number | null = resolveCompositeFocusIndex(focusItems, 0, 'next');
void [match, selected, focusIndex];
