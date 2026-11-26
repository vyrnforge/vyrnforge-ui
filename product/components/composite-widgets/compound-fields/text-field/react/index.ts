import { createElement, forwardRef, useId, type ReactNode, type Ref } from 'react';
import { Input, type InputProps } from '../input/index.js';
import { Textarea, type TextareaProps } from '../textarea/index.js';

export interface TextFieldAppearanceProps {
  label: string;
  description?: ReactNode;
  error?: string;
  status?: 'warning' | 'success';
  variant?: 'outlined' | 'filled';
  fieldSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  textAlign?: 'start' | 'center' | 'end';
  leading?: ReactNode;
  trailing?: ReactNode;
  prefix?: string;
  suffix?: string;
}

export type TextFieldInputProps = TextFieldAppearanceProps &
  Omit<InputProps, 'children' | 'dangerouslySetInnerHTML' | 'prefix' | 'type'> & {
    multiline?: false;
    type?: 'text' | 'email' | 'url' | 'tel' | 'search' | 'password' | 'number';
    autosize?: never;
  };

export type TextFieldTextareaProps = TextFieldAppearanceProps &
  Omit<TextareaProps, 'children' | 'dangerouslySetInnerHTML' | 'prefix'> & {
    multiline: true;
    type?: never;
    autosize?: boolean;
  };

export type TextFieldProps = TextFieldInputProps | TextFieldTextareaProps;

/** One native editing control, with visible field relationships and shared Web styling. */
export const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  function TextField(props, ref) {
    const generatedId = useId();
    const {
      label,
      description,
      error,
      status,
      variant = 'outlined',
      fieldSize,
      fullWidth,
      textAlign,
      leading,
      trailing,
      prefix,
      suffix,
      id = generatedId,
      ...rest
    } = props;
    const descriptionId = generatedId + '-description';
    const errorId = generatedId + '-error';
    const hasDescription = description != null && description !== false && description !== '';
    const hasError = typeof error === 'string' && error.trim().length > 0;
    const describedBy =
      [
        ...new Set([
          ...(rest['aria-describedby'] ?? '').split(/\s+/).filter(Boolean),
          ...(hasDescription ? [descriptionId] : []),
          ...(hasError ? [errorId] : []),
        ]),
      ].join(' ') || undefined;
    const relationships = {
      id,
      'aria-describedby': describedBy,
      'aria-invalid': hasError ? true : rest['aria-invalid'],
      'data-vf-text-field-value': '',
    };
    let control: ReactNode;
    if (rest.multiline) {
      const { multiline, autosize, type, ...native } = rest;
      void multiline;
      void type;
      control = createElement(Textarea, {
        ...native,
        ...relationships,
        ...{ 'data-vf-text-field-autosize': autosize ? '' : undefined },
        ref: ref as Ref<HTMLTextAreaElement>,
      });
    } else {
      const { multiline, autosize, ...native } = rest;
      void multiline;
      void autosize;
      control = createElement(Input, { ...native, ...relationships, ref: ref as Ref<HTMLInputElement> });
    }
    return createElement(
      'div',
      {
        'data-vf-text-field': '',
        'data-vf-text-field-variant': variant,
        'data-vf-text-field-size': fieldSize,
        'data-vf-text-field-full-width': fullWidth ? '' : undefined,
        'data-vf-text-field-status': hasError ? undefined : status,
        'data-vf-text-field-align': textAlign,
        dir: props.dir,
        hidden: props.hidden,
      },
      createElement('label', { htmlFor: id, 'data-vf-text-field-label': '' }, label),
      createElement(
        'div',
        { 'data-vf-text-field-control': '' },
        leading == null ? null : createElement('span', { 'data-vf-text-field-leading': '' }, leading),
        prefix == null ? null : createElement('span', { 'data-vf-text-field-prefix': '' }, prefix),
        control,
        suffix == null ? null : createElement('span', { 'data-vf-text-field-suffix': '' }, suffix),
        trailing == null ? null : createElement('span', { 'data-vf-text-field-trailing': '' }, trailing),
      ),
      hasDescription
        ? createElement('div', { id: descriptionId, 'data-vf-text-field-description': '' }, description)
        : null,
      hasError ? createElement('div', { id: errorId, 'data-vf-text-field-error': '' }, error) : null,
    );
  },
);
