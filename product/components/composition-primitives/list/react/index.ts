import { createElement, forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/** Semantic list host; List never becomes a Listbox or Menu. */
export type ListElement = 'ul' | 'ol';
export type ListVariant = 'plain' | 'divided' | 'bordered';
export type ListSize = 'sm' | 'md' | 'lg';
export type ListSpacing = 'none' | 'sm' | 'md' | 'lg';
export type ListMarker = 'none' | 'auto';

/** Native list properties. The \`start\` attribute is meaningful only when \`as="ol"\`. */
export interface ListProps extends Omit<ComponentPropsWithoutRef<'ol'>, 'role' | 'children'> {
  as?: ListElement;
  variant?: ListVariant;
  size?: ListSize;
  spacing?: ListSpacing;
  marker?: ListMarker;
  children?: ReactNode;
}

/** A semantic li with optional presentational leading and trailing slots. */
export interface ListItemProps extends Omit<ComponentPropsWithoutRef<'li'>, 'role' | 'children'> {
  children?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
}

/** React List: native structure, no local interaction state or focus controller. */
export const List = forwardRef<HTMLUListElement | HTMLOListElement, ListProps>(
  function List({ as: Host = 'ul', variant = 'plain', size = 'md', spacing = 'none',
    marker = 'none', children, ...nativeProps }, ref) {
    return createElement(Host, {
      ...nativeProps,
      ref,
      role: 'list',
      'data-vf-list': '',
      'data-vf-list-variant': variant,
      'data-vf-list-size': size,
      'data-vf-list-spacing': spacing,
      'data-vf-list-marker': marker,
    }, children);
  }
);

/** React ListItem: retains li semantics and delegates actions to authored controls. */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem({ leading, trailing, children, ...nativeProps }, ref) {
    return createElement('li', { ...nativeProps, ref, 'data-vf-list-item': '' },
      createElement('div', { 'data-vf-list-item-layout': '' },
        leading == null ? null : createElement('div', { 'data-vf-list-item-leading': '' }, leading),
        createElement('div', { 'data-vf-list-item-content': '' }, children),
        trailing == null ? null : createElement('div', { 'data-vf-list-item-trailing': '' }, trailing),
      ));
  }
);
