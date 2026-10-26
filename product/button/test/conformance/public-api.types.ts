import type { ButtonSize as ReactSize, ButtonVariant as ReactVariant } from '@vyrnforge/react/button';
import type { ButtonSize as AngularSize, ButtonVariant as AngularVariant } from '@vyrnforge/angular/button';
import type { ButtonSize as VueSize, ButtonVariant as VueVariant } from '@vyrnforge/vue/button';

const variants: [ReactVariant, AngularVariant, VueVariant] = ['primary', 'secondary', 'ghost'];
const sizes: [ReactSize, AngularSize, VueSize] = ['sm', 'md', 'lg'];
void [variants, sizes];
