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

const link: ChipProps = { children: 'Docs', href: '/docs', linkRef: createRef<HTMLAnchorElement>() };
const removableLink: ChipProps = { children: 'Docs', href: '/docs', onRemove() {}, removeLabel: 'Remove Docs' };
// @ts-expect-error navigation and selection are mutually exclusive
const selectableLink: ChipProps = { children: 'Docs', href: '/docs', selectable: true };
// @ts-expect-error a native link is not a button action
const actionLink: ChipProps = { children: 'Docs', href: '/docs', onClick() {} };
// @ts-expect-error link ref must be an anchor
const wrongLinkRef: ChipProps = { children: 'Docs', href: '/docs', linkRef: createRef<HTMLButtonElement>() };
void [link, removableLink, selectableLink, actionLink, wrongLinkRef];
