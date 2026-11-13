import { createElement, forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactElement, Ref } from 'react';
import type {
  ClusterAlign,
  ClusterJustify,
  ContainerSize,
  ControlGroupOrientation,
  InlineAlign,
  InlineJustify,
  LayoutSpace,
  StackAlign,
  StackJustify,
} from '@vyrnforge/web/layout';

export type {
  ClusterAlign,
  ClusterJustify,
  ContainerSize,
  ControlGroupOrientation,
  InlineAlign,
  InlineJustify,
  LayoutSpace,
  StackAlign,
  StackJustify,
} from '@vyrnforge/web/layout';

export type LayoutElement =
  | 'div'
  | 'span'
  | 'section'
  | 'main'
  | 'article'
  | 'aside'
  | 'nav'
  | 'header'
  | 'footer'
  | 'form'
  | 'fieldset'
  | 'ul'
  | 'ol';

export type StackProps<Element extends LayoutElement = 'div'> = {
  as?: Element;
  gap?: LayoutSpace;
  align?: StackAlign;
  justify?: StackJustify;
} & Omit<ComponentPropsWithoutRef<Element>, 'as' | 'gap' | 'align' | 'justify'>;

export type InlineProps<Element extends LayoutElement = 'div'> = {
  as?: Element;
  gap?: LayoutSpace;
  align?: InlineAlign;
  justify?: InlineJustify;
} & Omit<ComponentPropsWithoutRef<Element>, 'as' | 'gap' | 'align' | 'justify'>;

export type ClusterProps<Element extends LayoutElement = 'div'> = {
  as?: Element;
  gap?: LayoutSpace;
  align?: ClusterAlign;
  justify?: ClusterJustify;
} & Omit<ComponentPropsWithoutRef<Element>, 'as' | 'gap' | 'align' | 'justify'>;

export type AutoGridProps<Element extends LayoutElement = 'div'> = {
  as?: Element;
  gap?: LayoutSpace;
} & Omit<ComponentPropsWithoutRef<Element>, 'as' | 'gap'>;

export type ContainerProps<Element extends LayoutElement = 'div'> = {
  as?: Element;
  size?: ContainerSize;
  gutter?: LayoutSpace;
} & Omit<ComponentPropsWithoutRef<Element>, 'as' | 'size' | 'gutter'>;

export type ControlGroupProps<Element extends LayoutElement = 'div'> = {
  as?: Element;
  orientation?: ControlGroupOrientation;
} & Omit<ComponentPropsWithoutRef<Element>, 'as' | 'orientation'>;

function createPolymorphic<DefaultElement extends LayoutElement>(
  render: (props: Record<string, unknown>, ref: Ref<HTMLElement>) => ReactElement | null,
) {
  return forwardRef<HTMLElement, Record<string, unknown>>(render);
}

export const Stack = createPolymorphic<'div'>((props, ref) => {
  const { as = 'div', gap = 'md', align = 'stretch', justify = 'start', ...nativeProps } = props;
  return createElement(as as LayoutElement, { ...nativeProps, ref, 'data-vf-stack': '', 'data-vf-stack-gap': gap, 'data-vf-stack-align': align, 'data-vf-stack-justify': justify });
}) as <Element extends LayoutElement = 'div'>(props: StackProps<Element> & { ref?: Ref<HTMLElementTagNameMap[Element]> }) => ReactElement | null;

export const Inline = createPolymorphic<'div'>((props, ref) => {
  const { as = 'div', gap = 'md', align = 'center', justify = 'start', ...nativeProps } = props;
  return createElement(as as LayoutElement, { ...nativeProps, ref, 'data-vf-inline': '', 'data-vf-inline-gap': gap, 'data-vf-inline-align': align, 'data-vf-inline-justify': justify });
}) as <Element extends LayoutElement = 'div'>(props: InlineProps<Element> & { ref?: Ref<HTMLElementTagNameMap[Element]> }) => ReactElement | null;

export const Cluster = createPolymorphic<'div'>((props, ref) => {
  const { as = 'div', gap = 'md', align = 'center', justify = 'start', ...nativeProps } = props;
  return createElement(as as LayoutElement, { ...nativeProps, ref, 'data-vf-cluster': '', 'data-vf-cluster-gap': gap, 'data-vf-cluster-align': align, 'data-vf-cluster-justify': justify });
}) as <Element extends LayoutElement = 'div'>(props: ClusterProps<Element> & { ref?: Ref<HTMLElementTagNameMap[Element]> }) => ReactElement | null;

export const AutoGrid = createPolymorphic<'div'>((props, ref) => {
  const { as = 'div', gap = 'md', ...nativeProps } = props;
  return createElement(as as LayoutElement, { ...nativeProps, ref, 'data-vf-auto-grid': '', 'data-vf-auto-grid-gap': gap });
}) as <Element extends LayoutElement = 'div'>(props: AutoGridProps<Element> & { ref?: Ref<HTMLElementTagNameMap[Element]> }) => ReactElement | null;

export const Container = createPolymorphic<'div'>((props, ref) => {
  const { as = 'div', size = 'xl', gutter = 'md', ...nativeProps } = props;
  return createElement(as as LayoutElement, { ...nativeProps, ref, 'data-vf-container': '', 'data-vf-container-size': size, 'data-vf-container-gutter': gutter });
}) as <Element extends LayoutElement = 'div'>(props: ContainerProps<Element> & { ref?: Ref<HTMLElementTagNameMap[Element]> }) => ReactElement | null;

export const ControlGroup = createPolymorphic<'div'>((props, ref) => {
  const { as = 'div', orientation = 'horizontal', ...nativeProps } = props;
  return createElement(as as LayoutElement, {
    ...nativeProps,
    ref,
    'data-vf-control-group': '',
    'data-vf-control-group-orientation': orientation,
  });
}) as <Element extends LayoutElement = 'div'>(props: ControlGroupProps<Element> & { ref?: Ref<HTMLElementTagNameMap[Element]> }) => ReactElement | null;
