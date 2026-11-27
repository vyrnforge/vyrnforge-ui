import { createElement, createRef } from 'react';
import { TextField, type TextFieldProps } from '@vyrnforge/react/text-field';
const props: TextFieldProps = { label: 'Email', type: 'email', fieldSize: 'sm', size: 20, required: true };
void createElement(TextField, { ...props, ref: createRef<HTMLInputElement>() });
void createElement(TextField, { label: 'Notes', multiline: true, rows: 3, autosize: true, ref: createRef<HTMLTextAreaElement>() });
// @ts-expect-error multiline cannot take native input type
void createElement(TextField, { label: 'Notes', multiline: true, type: 'email' });
// @ts-expect-error visual size is distinct from native size
void createElement(TextField, { label: 'Email', size: 'sm' });
// @ts-expect-error a visible label is required
void createElement(TextField, { name: 'email' });

void createElement(TextField, { label: 'Message', autosize: true, minRows: 1, maxRows: 6, ref: createRef<HTMLTextAreaElement>() });
void createElement(TextField, { label: 'Email', type: 'email', autosize: false });
// @ts-expect-error auto-expansion cannot use an input-only type
void createElement(TextField, { label: 'Password', type: 'password', autosize: true });
// @ts-expect-error explicit single-line mode contradicts autosize
void createElement(TextField, { label: 'Message', multiline: false, autosize: true });
// @ts-expect-error fixed multiline must be intentional
void createElement(TextField, { label: 'Message', rows: 4 });
