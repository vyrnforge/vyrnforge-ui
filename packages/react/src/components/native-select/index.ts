import { createElement, forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

export type NativeSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(props, ref) {
  return createElement('select', { ...props, ref, 'data-vf-native-select': '' });
});
