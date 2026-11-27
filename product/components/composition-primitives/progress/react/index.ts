import { createElement, forwardRef, type ComponentPropsWithoutRef } from 'react';

export type ProgressProps = Omit<ComponentPropsWithoutRef<'progress'>, 'value' | 'max' | 'role'> & {
  value?: number;
  max?: number;
};

/** Native progress: omit value for unknown completion. */
export const Progress = forwardRef<HTMLProgressElement, ProgressProps>(function Progress(
  { value, max, ...props },
  ref,
) {
  return createElement('progress', { ...props, ref, value, max, 'data-vf-progress': '' });
});
