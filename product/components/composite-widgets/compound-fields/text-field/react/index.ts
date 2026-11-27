import { createElement, forwardRef, useId, type ReactNode, type Ref } from 'react';
import { Input, type InputProps } from '../input/index.js';
import { Textarea, type TextareaProps } from '../textarea/index.js';

export interface TextFieldAppearanceProps {
  label: string;
  description?: ReactNode;
  error?: string;
  status?: 'warning' | 'success';
  variant?: 'outlined' | 'filled' | 'underlined';
  labelPlacement?: 'outside' | 'floating';
  fieldSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  textAlign?: 'start' | 'center' | 'end';
  leading?: ReactNode;
  trailing?: ReactNode;
  prefix?: string;
  suffix?: string;
}

export type TextFieldInputProps = TextFieldAppearanceProps &
  Omit<InputProps, 'children' | 'dangerouslySetInnerHTML' | 'prefix' | 'type' | 'variant'> & {
    multiline?: false;
    type?: 'text' | 'email' | 'url' | 'tel' | 'search' | 'password' | 'number';
    autosize?: false;
  };

export type TextFieldTextareaProps = TextFieldAppearanceProps &
  Omit<TextareaProps, 'children' | 'dangerouslySetInnerHTML' | 'prefix' | 'variant'> & {
    type?: never;
  } &
  ({ multiline: true; autosize?: boolean } | { multiline?: true; autosize: true });

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
      labelPlacement = 'outside',
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
    const floating = labelPlacement === 'floating';
    const alwaysRaised = Boolean(rest.multiline || rest.autosize || rest.type === 'number' || leading || trailing || prefix || suffix);
    const relationships = {
      id,
      'aria-describedby': describedBy,
      'aria-invalid': hasError ? true : rest['aria-invalid'],
      'data-vf-text-field-value': '',
      placeholder: floating ? rest.placeholder || ' ' : rest.placeholder,
    };
    let control: ReactNode;
    if (rest.multiline || rest.autosize) {
      const { multiline, autosize, type, ...native } = rest;
      void multiline;
      void type;
      control = createElement(Textarea, {
        ...native,
        ...relationships,
        variant: 'unstyled',
        autosize: autosize ?? false,
        resize: native.resize ?? 'vertical',
        ref: ref as Ref<HTMLTextAreaElement>,
      });
    } else {
      const { multiline, autosize, ...native } = rest;
      void multiline;
      void autosize;
      control = createElement(Input, {
        ...native,
        ...relationships,
        variant: 'unstyled',
        ref: ref as Ref<HTMLInputElement>,
      });
    }
    const fieldLabel = createElement('label', { htmlFor: id, 'data-vf-text-field-label': '' }, label);
    return createElement(
      'div',
      {
        'data-vf-text-field': '',
        'data-vf-text-field-variant': variant,
        'data-vf-text-field-label-placement': labelPlacement,
        'data-vf-text-field-always-raised': floating && alwaysRaised ? '' : undefined,
        'data-vf-text-field-size': fieldSize,
        'data-vf-text-field-full-width': fullWidth ? '' : undefined,
        'data-vf-text-field-status': hasError ? undefined : status,
        'data-vf-text-field-align': textAlign,
        dir: props.dir,
        hidden: props.hidden,
      },
      floating ? null : fieldLabel,
      createElement(
        'div',
        { 'data-vf-text-field-control': '', 'data-vf-editor-surface': '' },
        floating ? fieldLabel : null,
        floating && variant === 'outlined'
          ? createElement(
              'fieldset',
              { 'data-vf-text-field-outline': '', 'aria-hidden': true },
              createElement('legend', null, createElement('span', null, label)),
            )
          : null,
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
