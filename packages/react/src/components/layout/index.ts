import { createElement, forwardRef } from 'react';
import type { FieldsetHTMLAttributes, HTMLAttributes } from 'react';
import type {
  AspectRatio as AspectRatioValue,
  ClusterAlign,
  ClusterJustify,
  ContainerSize,
  InlineAlign,
  InlineJustify,
  LayoutSpace,
  RadioGroupOrientation,
  StackAlign,
  StackJustify,
} from '@vyrnforge/web/layout';

export type AspectRatio = AspectRatioValue;
export type {
  ClusterAlign,
  ClusterJustify,
  ContainerSize,
  InlineAlign,
  InlineJustify,
  LayoutSpace,
  RadioGroupOrientation,
  StackAlign,
  StackJustify,
} from '@vyrnforge/web/layout';

export type LayoutElement = 'div' | 'span' | 'section' | 'main' | 'article' | 'aside' | 'nav' | 'header' | 'footer' | 'form' | 'ul' | 'ol';

export interface StackProps extends HTMLAttributes<HTMLElement> { as?: LayoutElement; gap?: LayoutSpace; align?: StackAlign; justify?: StackJustify; }
export interface InlineProps extends HTMLAttributes<HTMLElement> { as?: LayoutElement; gap?: LayoutSpace; align?: InlineAlign; justify?: InlineJustify; }
export interface ClusterProps extends HTMLAttributes<HTMLElement> { as?: LayoutElement; gap?: LayoutSpace; align?: ClusterAlign; justify?: ClusterJustify; }
export interface GridProps extends HTMLAttributes<HTMLElement> { as?: LayoutElement; gap?: LayoutSpace; }
export interface ContainerProps extends HTMLAttributes<HTMLElement> { as?: LayoutElement; size?: ContainerSize; gutter?: LayoutSpace; }
export interface AspectRatioProps extends HTMLAttributes<HTMLElement> { as?: LayoutElement; ratio?: AspectRatio; }
export interface FieldProps extends HTMLAttributes<HTMLElement> { as?: LayoutElement; gap?: LayoutSpace; }
export interface FieldsetProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> { gap?: LayoutSpace; }
export type InputGroupProps = HTMLAttributes<HTMLDivElement>;
export interface RadioGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> { gap?: LayoutSpace; orientation?: RadioGroupOrientation; }

export const Stack = forwardRef<HTMLElement, StackProps>(function Stack({ as = 'div', gap = 'md', align = 'stretch', justify = 'start', ...nativeProps }, ref) {
  return createElement(as, { ...nativeProps, ref, 'data-vf-stack': '', 'data-vf-stack-gap': gap, 'data-vf-stack-align': align, 'data-vf-stack-justify': justify });
});

export const Inline = forwardRef<HTMLElement, InlineProps>(function Inline({ as = 'div', gap = 'md', align = 'center', justify = 'start', ...nativeProps }, ref) {
  return createElement(as, { ...nativeProps, ref, 'data-vf-inline': '', 'data-vf-inline-gap': gap, 'data-vf-inline-align': align, 'data-vf-inline-justify': justify });
});

export const Cluster = forwardRef<HTMLElement, ClusterProps>(function Cluster({ as = 'div', gap = 'md', align = 'center', justify = 'start', ...nativeProps }, ref) {
  return createElement(as, { ...nativeProps, ref, 'data-vf-cluster': '', 'data-vf-cluster-gap': gap, 'data-vf-cluster-align': align, 'data-vf-cluster-justify': justify });
});

export const Grid = forwardRef<HTMLElement, GridProps>(function Grid({ as = 'div', gap = 'md', ...nativeProps }, ref) {
  return createElement(as, { ...nativeProps, ref, 'data-vf-grid': '', 'data-vf-grid-gap': gap });
});

export const Container = forwardRef<HTMLElement, ContainerProps>(function Container({ as = 'div', size = 'xl', gutter = 'md', ...nativeProps }, ref) {
  return createElement(as, { ...nativeProps, ref, 'data-vf-container': '', 'data-vf-container-size': size, 'data-vf-container-gutter': gutter });
});

export const AspectRatio = forwardRef<HTMLElement, AspectRatioProps>(function AspectRatio({ as = 'div', ratio = 'square', ...nativeProps }, ref) {
  return createElement(as, { ...nativeProps, ref, 'data-vf-aspect-ratio': '', 'data-vf-aspect-ratio-value': ratio });
});

export const Field = forwardRef<HTMLElement, FieldProps>(function Field({ as = 'div', gap = 'xs', ...nativeProps }, ref) {
  return createElement(as, { ...nativeProps, ref, 'data-vf-field': '', 'data-vf-field-gap': gap });
});

export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(function Fieldset({ gap = 'sm', ...nativeProps }, ref) {
  return createElement('fieldset', { ...nativeProps, ref, 'data-vf-fieldset': '', 'data-vf-fieldset-gap': gap });
});

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(nativeProps, ref) {
  return createElement('div', { ...nativeProps, ref, 'data-vf-input-group': '' });
});

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup({ gap = 'sm', orientation = 'vertical', ...nativeProps }, ref) {
  return createElement('fieldset', { ...nativeProps, ref, 'data-vf-radio-group': '', 'data-vf-radio-group-gap': gap, 'data-vf-radio-group-orientation': orientation });
});
