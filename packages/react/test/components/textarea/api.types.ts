import { Textarea, type TextareaProps } from '@vyrnforge/react/textarea';

const props: TextareaProps = { name: 'notes', rows: 4, cols: 30, wrap: 'soft', required: true, readOnly: true, minLength: 3, maxLength: 200, 'aria-describedby': 'notes-help' };
const textarea: typeof Textarea = Textarea;
// @ts-expect-error textarea has no native type attribute.
const invalid: TextareaProps = { type: 'text' };
void [props, textarea, invalid];
