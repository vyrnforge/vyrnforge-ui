import { createElement, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export type FileInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput(props, ref) {
  return createElement('input', { ...props, ref, type: 'file', 'data-vf-file-input': '' });
});
