import { createElement, forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import type {
  ClusterAlign,
  ClusterJustify,
  ContainerSize,
  LayoutSpace,
  StackAlign,
  StackJustify,
} from '@vyrnforge/web/layout';

export type { ClusterAlign, ClusterJustify, ContainerSize, LayoutSpace, StackAlign, StackJustify } from '@vyrnforge/web/layout';

export type LayoutElement = 'div' | 'section' | 'main' | 'article' | 'aside' | 'nav' | 'header' | 'footer' | 'form' | 'ul' | 'ol';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: LayoutElement;
  gap?: LayoutSpace;
  align?: StackAlign;
  justify?: StackJustify;
}

export interface ClusterProps extends HTMLAttributes<HTMLElement> {
  as?: LayoutElement;
  gap?: LayoutSpace;
  align?: ClusterAlign;
  justify?: ClusterJustify;
}

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: LayoutElement;
  size?: ContainerSize;
  gutter?: LayoutSpace;
}

export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { as = 'div', gap = 'md', align = 'stretch', justify = 'start', ...nativeProps },
  ref
) {
  return createElement(as, {
    ...nativeProps,
    ref,
    'data-vf-stack': '',
    'data-vf-stack-gap': gap,
    'data-vf-stack-align': align,
    'data-vf-stack-justify': justify,
  });
});

export const Cluster = forwardRef<HTMLElement, ClusterProps>(function Cluster(
  { as = 'div', gap = 'md', align = 'center', justify = 'start', ...nativeProps },
  ref
) {
  return createElement(as, {
    ...nativeProps,
    ref,
    'data-vf-cluster': '',
    'data-vf-cluster-gap': gap,
    'data-vf-cluster-align': align,
    'data-vf-cluster-justify': justify,
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
