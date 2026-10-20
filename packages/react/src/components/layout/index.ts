import { createElement, forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import type {
  ContainerSize,
  LayoutSpace,
  StackAlign,
  StackDirection,
  StackJustify,
} from '@vyrnforge/web/layout';

export type { ContainerSize, LayoutSpace, StackAlign, StackDirection, StackJustify } from '@vyrnforge/web/layout';

export type LayoutElement = 'div' | 'section' | 'main' | 'article' | 'aside' | 'nav' | 'header' | 'footer' | 'form' | 'ul' | 'ol';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: LayoutElement;
  direction?: StackDirection;
  gap?: LayoutSpace;
  align?: StackAlign;
  justify?: StackJustify;
}

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: LayoutElement;
  size?: ContainerSize;
  gutter?: LayoutSpace;
}

export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { as = 'div', direction = 'block', gap = 'md', align = 'stretch', justify = 'start', ...nativeProps },
  ref
) {
  return createElement(as, {
    ...nativeProps,
    ref,
    'data-vf-stack': '',
    'data-vf-stack-direction': direction,
    'data-vf-stack-gap': gap,
    'data-vf-stack-align': align,
    'data-vf-stack-justify': justify,
  });
});

export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  { as = 'div', size = 'xl', gutter = 'md', ...nativeProps },
  ref
) {
  return createElement(as, {
    ...nativeProps,
    ref,
    'data-vf-container': '',
    'data-vf-container-size': size,
    'data-vf-container-gutter': gutter,
  });
});
