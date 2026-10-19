import type { ButtonSize, ButtonVariant } from '@vyrnforge/vue/button';

const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost'];
const sizes: ButtonSize[] = ['sm', 'md', 'lg'];
// @ts-expect-error Unsupported presentation variants are not public API.
const invalidVariant: ButtonVariant = 'link';
void [variants, sizes, invalidVariant];
