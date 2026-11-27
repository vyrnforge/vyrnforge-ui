import { createElement, forwardRef, type ComponentPropsWithoutRef } from 'react';

export type LoadingSize = 'sm' | 'md' | 'lg';
export type LoadingVariant = 'spinner' | 'dots' | 'bars' | 'pulse';
export type LoadingPlaceholderShape = 'block' | 'line' | 'circle';

export interface LoadingProps extends ComponentPropsWithoutRef<'div'> {
  size?: LoadingSize;
}

/** Presentation scope only. The caller owns busy/status semantics and async state. */
export const Loading = forwardRef<HTMLDivElement, LoadingProps>(function Loading(
  { size = 'md', ...props }, ref,
) {
  return createElement('div', { ...props, ref, 'data-vf-loading': '', 'data-vf-loading-size': size });
});

export interface LoadingIndicatorProps extends Omit<ComponentPropsWithoutRef<'span'>,
  'children' | 'role' | 'aria-hidden' | 'tabIndex' | 'dangerouslySetInnerHTML'> {
  variant?: LoadingVariant;
}

/** Decorative; pair with an authored status when needed. */
export const LoadingIndicator = forwardRef<HTMLSpanElement, LoadingIndicatorProps>(function LoadingIndicator(
  { variant = 'spinner', ...props }, ref,
) {
  return createElement('span', { ...props, ref, 'aria-hidden': true,
    'data-vf-loading-indicator': '', 'data-vf-loading-variant': variant });
});

/** Legacy compatibility part. New compositions should import Skeleton. */
export interface LoadingPlaceholderProps extends Omit<ComponentPropsWithoutRef<'div'>,
  'children' | 'role' | 'aria-hidden' | 'tabIndex' | 'dangerouslySetInnerHTML'> {
  shape?: LoadingPlaceholderShape;
}

export const LoadingPlaceholder = forwardRef<HTMLDivElement, LoadingPlaceholderProps>(function LoadingPlaceholder(
  { shape = 'block', ...props }, ref,
) {
  return createElement('div', { ...props, ref, 'aria-hidden': true,
    'data-vf-loading-placeholder': '', 'data-vf-loading-placeholder-shape': shape });
});

/** Legacy compatibility part. New compositions should import Progress. */
export type LoadingProgressProps = Omit<ComponentPropsWithoutRef<'progress'>, 'value' | 'max' | 'role'> & {
  /** Omit for indeterminate progress. Native HTML owns the value semantics. */
  value?: number;
  max?: number;
};

export const LoadingProgress = forwardRef<HTMLProgressElement, LoadingProgressProps>(function LoadingProgress(
  { value, max, ...props }, ref,
) {
  return createElement('progress', { ...props, ref, value, max, 'data-vf-loading-progress': '' });
});

export type LoadingCustomProps = ComponentPropsWithoutRef<'div'>;

export const LoadingCustom = forwardRef<HTMLDivElement, LoadingCustomProps>(function LoadingCustom(props, ref) {
  return createElement('div', { ...props, ref, 'data-vf-loading-custom': '' });
});
