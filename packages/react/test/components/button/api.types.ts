import type { ButtonProps, ButtonSize, ButtonVariant } from '@vyrnforge/react/button';

const props: ButtonProps = {
  variant: 'secondary',
  size: 'lg',
  loading: true,
  type: 'submit',
  disabled: false,
  name: 'save',
  value: 'yes',
  'aria-label': 'Save'
};
const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost'];
const sizes: ButtonSize[] = ['sm', 'md', 'lg'];
// @ts-expect-error Unsupported presentation variants are not public API.
const invalidVariant: ButtonVariant = 'danger';
// @ts-expect-error Typography roles are not a Button configuration axis.
const invalidTextVariant: ButtonProps = { textVariant: 'label-sm' };
void [props, variants, sizes, invalidVariant, invalidTextVariant];
