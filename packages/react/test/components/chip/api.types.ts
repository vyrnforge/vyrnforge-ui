import { createRef } from 'react';
import { Chip, type ChipProps } from '@vyrnforge/react/chip';
import { Chip as RootChip } from '@vyrnforge/react';
const basic: ChipProps = { children: 'Draft' };
const select: ChipProps = { children: 'Open', selectable: true, selected: true, onSelectedChange: () => {} };
const remove: ChipProps = { children: 'Design', onRemove: () => {}, removeLabel: 'Remove Design', removeRef: createRef<HTMLButtonElement>() };
// @ts-expect-error selection is explicit
const noMode: ChipProps = { children: 'Open', selected: true };
// @ts-expect-error removal must have an accessible label
const noName: ChipProps = { children: 'Design', onRemove: () => {} };
// @ts-expect-error semantic tone has to be approved
const invalidTone: ChipProps = { children: 'Review', tone: 'success' };
// @ts-expect-error root is not a focus target
const invalidFocus: ChipProps = { children: 'Review', tabIndex: 0 };
void [Chip, RootChip, basic, select, remove, noMode, noName, invalidTone, invalidFocus];
