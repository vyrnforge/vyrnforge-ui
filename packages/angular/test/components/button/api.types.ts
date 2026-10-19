import type { ButtonSize, ButtonVariant } from '@vyrnforge/angular/button';

const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost'];
const sizes: ButtonSize[] = ['sm', 'md', 'lg'];
// @ts-expect-error Unsupported control sizes are not public API.
const invalidSize: ButtonSize = 'xl';
void [variants, sizes, invalidSize];
