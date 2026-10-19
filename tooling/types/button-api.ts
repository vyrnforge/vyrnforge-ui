import type {
  ButtonProps as ReactButtonProps,
  ButtonSize as ReactButtonSize,
  ButtonVariant as ReactButtonVariant
} from '@vyrnforge/react/button';
import type {
  ButtonSize as AngularButtonSize,
  ButtonVariant as AngularButtonVariant
} from '@vyrnforge/angular/button';
import type {
  ButtonSize as VueButtonSize,
  ButtonVariant as VueButtonVariant
} from '@vyrnforge/vue/button';

const reactProps: ReactButtonProps = {
  variant: 'secondary',
  size: 'lg',
  loading: true,
  type: 'submit',
  disabled: false,
  name: 'save',
  value: 'yes',
  'aria-label': 'Save'
};

const variants: [ReactButtonVariant, AngularButtonVariant, VueButtonVariant] = [
  'primary',
  'secondary',
  'ghost'
];
const sizes: [ReactButtonSize, AngularButtonSize, VueButtonSize] = ['sm', 'md', 'lg'];

// @ts-expect-error Unsupported presentation variants are not public API.
const invalidReactVariant: ReactButtonVariant = 'danger';
// @ts-expect-error Unsupported control sizes are not public API.
const invalidAngularSize: AngularButtonSize = 'xl';
// @ts-expect-error Framework ports share the same semantic variant vocabulary.
const invalidVueVariant: VueButtonVariant = 'link';

void [reactProps, variants, sizes, invalidReactVariant, invalidAngularSize, invalidVueVariant];
