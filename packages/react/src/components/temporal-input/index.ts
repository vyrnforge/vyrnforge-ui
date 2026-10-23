import { createElement, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import type { TemporalInputType } from '@vyrnforge/web/temporal-input';

export type { TemporalInputType } from '@vyrnforge/web/temporal-input';

export interface TemporalInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: TemporalInputType;
}

export const TemporalInput = forwardRef<HTMLInputElement, TemporalInputProps>(function TemporalInput(
  { type = 'date', ...nativeProps },
  ref
) {
  return createElement('input', { ...nativeProps, ref, type, 'data-vf-temporal-input': '' });
});
