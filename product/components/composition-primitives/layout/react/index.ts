import { createElement, forwardRef } from 'react';
import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  CSSProperties,
  ReactElement,
} from 'react';

/**
 * Structural hosts only. Native interactive controls retain their own semantics.
 * The shared Web layout stylesheet owns every visual rule.
 */
export type LayoutElement =
  | 'div' | 'section' | 'header' | 'footer' | 'main' | 'aside'
  | 'article' | 'nav' | 'ul' | 'ol' | 'form' | 'fieldset' | 'label';

export type LayoutGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type FlowDirection = 'block' | 'inline';
export type FlowWrap = 'nowrap' | 'wrap';
export type FlowAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type FlowJustify = 'start' | 'center' | 'end' | 'space-between';

type NativeLayoutProps<Element extends LayoutElement> =
  Omit<ComponentPropsWithoutRef<Element>, 'as' | 'direction'>;

type FlowOptions = {
  /** Author a native semantic host; defaults to div. */
  as?: LayoutElement;
  direction?: FlowDirection;
  wrap?: FlowWrap;
  gap?: LayoutGap;
  align?: FlowAlign;
  justify?: FlowJustify;
};

export type FlowProps<Element extends LayoutElement = LayoutElement> =
  Element extends LayoutElement
    ? Omit<FlowOptions, 'as'> & { as?: Element } & NativeLayoutProps<Element>
    : never;

export type AutoGridProps<Element extends LayoutElement = LayoutElement> =
  Element extends LayoutElement
    ? {
        as?: Element;
        gap?: LayoutGap;
        /** A valid CSS track length such as 12rem or 200px. Defaults to 16rem. */
        minItemSize?: string;
      } & NativeLayoutProps<Element>
    : never;

// Mirrors VyrnForge Text's polymorphic React port: the public signature
// preserves host-native props and refs without a framework-neutral JSX type.
const createLayoutElement = createElement as (type: LayoutElement, props: object) => ReactElement;

const FlowImpl = forwardRef<HTMLElement, FlowProps<LayoutElement>>(function Flow(
  { as = 'div', direction = 'block', wrap, gap, align, justify, ...nativeProps },
  ref
) {
  return createLayoutElement(as, {
    ...nativeProps,
    ref,
    'data-vf-flow': '',
    'data-vf-flow-direction': direction,
    'data-vf-flow-wrap': wrap,
    'data-vf-flow-gap': gap,
    'data-vf-flow-align': align,
    'data-vf-flow-justify': justify,
  });
});

export const Flow = FlowImpl as <Element extends LayoutElement = 'div'>(
  props: FlowProps<Element> & { ref?: ComponentPropsWithRef<Element>['ref'] }
) => ReactElement | null;

const AutoGridImpl = forwardRef<HTMLElement, AutoGridProps<LayoutElement>>(function AutoGrid(
  { as = 'div', gap, minItemSize, style, ...nativeProps },
  ref
) {
  // Only this custom property is mapped. All geometry stays in canonical CSS.
  const resolvedStyle: CSSProperties | undefined = minItemSize === undefined
    ? style
    : { ...style, '--vf-auto-grid-min-item-size': minItemSize } as CSSProperties;
  return createLayoutElement(as, {
    ...nativeProps,
    ref,
    style: resolvedStyle,
    'data-vf-auto-grid': '',
    'data-vf-auto-grid-gap': gap,
  });
});

export const AutoGrid = AutoGridImpl as <Element extends LayoutElement = 'div'>(
  props: AutoGridProps<Element> & { ref?: ComponentPropsWithRef<Element>['ref'] }
) => ReactElement | null;
