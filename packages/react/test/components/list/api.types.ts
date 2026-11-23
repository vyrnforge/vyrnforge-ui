import { createElement, type Ref } from 'react';
import {
  List, ListItem,
  type ListProps, type ListItemProps, type ListElement,
  type ListVariant, type ListSize, type ListSpacing, type ListMarker,
  type ListGutter, type ListIndent, type ListDividerInset,
} from '@vyrnforge/react/list';
import { List as RootList, ListItem as RootListItem } from '@vyrnforge/react';

const semantic: ListProps = {
  'aria-label': 'People', children: createElement(ListItem, null, 'Alex Chen'),
};
const ordered: ListProps = { as: 'ol', start: 3, marker: 'auto', spacing: 'sm' };
const bordered: ListProps = { variant: 'bordered', size: 'lg', spacing: 'lg',
  gutter: 'none', indent: 'md', dividerInset: 'gutter' };
const gutter: ListGutter = 'auto';
const indent: ListIndent = 'lg';
const dividerInset: ListDividerInset = 'gutter';
const row: ListItemProps = {
  children: 'Report', leading: createElement('span', null, 'Icon'),
  trailing: createElement('button', { type: 'button', disabled: true }, 'Open'),
  className: 'report',
};
const kind: ListElement = 'ul';
const variant: ListVariant = 'divided';
const size: ListSize = 'md';
const spacing: ListSpacing = 'none';
const marker: ListMarker = 'auto';
const listRef: Ref<HTMLUListElement | HTMLOListElement> | undefined = undefined;
const itemRef: Ref<HTMLLIElement> | undefined = undefined;

// @ts-expect-error List must remain native ul or ol
const wrongHost: ListProps = { as: 'div' };
// @ts-expect-error List does not support Listbox role
const wrongRole: ListProps = { role: 'listbox' };
// @ts-expect-error ListItem cannot become option
const wrongItemRole: ListItemProps = { role: 'option' };
// @ts-expect-error unsupported appearance variant
const wrongVariant: ListProps = { variant: 'raised' };
// @ts-expect-error unsupported size
const wrongSize: ListProps = { size: 'xl' };
// @ts-expect-error unsupported spacing token
const wrongSpacing: ListProps = { spacing: 'tiny' };
// @ts-expect-error unsupported marker mode
const wrongMarker: ListProps = { marker: 'roman' };
// @ts-expect-error invalid gutter choice
const wrongGutter: ListProps = { gutter: 'wide' };
// @ts-expect-error invalid indentation
const wrongIndent: ListProps = { indent: '4rem' };
// @ts-expect-error inset may only align to gutter
const wrongInset: ListProps = { dividerInset: 'content' };
// @ts-expect-error no List-owned selection state
const wrongSelected: ListProps = { selected: true };
// @ts-expect-error no synthetic ListItem loading state
const wrongLoading: ListItemProps = { loading: true };

void [List, ListItem, RootList, RootListItem, semantic, ordered, bordered, row,
  kind, variant, size, spacing, marker, gutter, indent, dividerInset,
  listRef, itemRef, wrongHost, wrongRole,
  wrongItemRole, wrongVariant, wrongSize, wrongSpacing, wrongMarker,
  wrongGutter, wrongIndent, wrongInset, wrongSelected, wrongLoading];

