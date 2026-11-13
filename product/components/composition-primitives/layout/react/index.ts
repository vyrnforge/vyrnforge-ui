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

type ElementRef<Element extends LayoutElement> = HTMLElementTagNameMap[Element];
type PolymorphicProps<Element extends LayoutElement, OwnProps> =
  OwnProps & { as?: Element } & Omit<ComponentPropsWithoutRef<Element>, keyof OwnProps | 'as'>;
type PolymorphicComponent<OwnProps, DefaultElement extends LayoutElement> =
  <Element extends LayoutElement = DefaultElement>(
    props: PolymorphicProps<Element, OwnProps> & { ref?: Ref<ElementRef<Element>> }
  ) => ReactElement | null;

function polymorphic<OwnProps, DefaultElement extends LayoutElement>(
  render: (props: Record<string, unknown>, ref: Ref<HTMLElement>) => ReactElement | null,
): PolymorphicComponent<OwnProps, DefaultElement> {
  return forwardRef<HTMLElement, Record<string, unknown>>(render) as PolymorphicComponent<OwnProps, DefaultElement>;
}

interface StackOwnProps { gap?: LayoutSpace; align?: StackAlign; justify?: StackJustify; }
interface InlineOwnProps { gap?: LayoutSpace; align?: InlineAlign; justify?: InlineJustify; }
interface ClusterOwnProps { gap?: LayoutSpace; align?: ClusterAlign; justify?: ClusterJustify; }
interface AutoGridOwnProps { gap?: LayoutSpace; }
interface ContainerOwnProps { size?: ContainerSize; gutter?: LayoutSpace; }
interface ControlGroupOwnProps { orientation?: ControlGroupOrientation; }

export type StackProps<Element extends LayoutElement = 'div'> = PolymorphicProps<Element, StackOwnProps>;
export type InlineProps<Element extends LayoutElement = 'div'> = PolymorphicProps<Element, InlineOwnProps>;
export type ClusterProps<Element extends LayoutElement = 'div'> = PolymorphicProps<Element, ClusterOwnProps>;
export type AutoGridProps<Element extends LayoutElement = 'div'> = PolymorphicProps<Element, AutoGridOwnProps>;
export type ContainerProps<Element extends LayoutElement = 'div'> = PolymorphicProps<Element, ContainerOwnProps>;
export type ControlGroupProps<Element extends LayoutElement = 'div'> = PolymorphicProps<Element, ControlGroupOwnProps>;

export const Stack = polymorphic<StackOwnProps, 'div'>((props, ref) => {
  const { as = 'div', gap = 'md', align = 'stretch', justify = 'start', ...nativeProps } = props;
  return createElement(as as LayoutElement, { ...nativeProps, ref, 'data-vf-stack': '', 'data-vf-stack-gap': gap, 'data-vf-stack-align': align, 'data-vf-stack-justify': justify });
});

export const Inline = polymorphic<InlineOwnProps, 'div'>((props, ref) => {
  const { as = 'div', gap = 'md', align = 'center', justify = 'start', ...nativeProps } = props;
  return createElement(as as LayoutElement, { ...nativeProps, ref, 'data-vf-inline': '', 'data-vf-inline-gap': gap, 'data-vf-inline-align': align, 'data-vf-inline-justify': justify });
});

export const Cluster = polymorphic<ClusterOwnProps, 'div'>((props, ref) => {
  const { as = 'div', gap = 'md', align = 'center', justify = 'start', ...nativeProps } = props;
  return createElement(as as LayoutElement, { ...nativeProps, ref, 'data-vf-cluster': '', 'data-vf-cluster-gap': gap, 'data-vf-cluster-align': align, 'data-vf-cluster-justify': justify });
});

export const AutoGrid = polymorphic<AutoGridOwnProps, 'div'>((props, ref) => {
  const { as = 'div', gap = 'md', ...nativeProps } = props;
  return createElement(as as LayoutElement, { ...nativeProps, ref, 'data-vf-auto-grid': '', 'data-vf-auto-grid-gap': gap });
});

export const Container = polymorphic<ContainerOwnProps, 'div'>((props, ref) => {
  const { as = 'div', size = 'xl', gutter = 'md', ...nativeProps } = props;
  return createElement(as as LayoutElement, { ...nativeProps, ref, 'data-vf-container': '', 'data-vf-container-size': size, 'data-vf-container-gutter': gutter });
});

export const ControlGroup = polymorphic<ControlGroupOwnProps, 'div'>((props, ref) => {
  const { as = 'div', orientation = 'horizontal', ...nativeProps } = props;
  return createElement(as as LayoutElement, {
    ...nativeProps,
    ref,
    'data-vf-control-group': '',
    'data-vf-control-group-orientation': orientation,
  });
});
