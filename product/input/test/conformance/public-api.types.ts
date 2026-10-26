import type { InputType as WebInputType } from '@vyrnforge/web/input';
import type { InputType as ReactInputType } from '@vyrnforge/react/input';
import type { InputType as AngularInputType } from '@vyrnforge/angular/input';
import type { InputType as VueInputType } from '@vyrnforge/vue/input';

type ReactInput = typeof import('@vyrnforge/react/input').Input;
type AngularInput = typeof import('@vyrnforge/angular/input').VfInputDirective;
type VueInput = typeof import('@vyrnforge/vue/input').Input;

const types: [WebInputType, ReactInputType, AngularInputType, VueInputType] = ['text', 'email', 'search', 'url'];
const reactInput: ReactInput | undefined = undefined;
const angularInput: AngularInput | undefined = undefined;
const vueInput: VueInput | undefined = undefined;
// @ts-expect-error specialized native controls require separate component review.
const invalidWeb: WebInputType = 'checkbox';
// @ts-expect-error all typed ports share the same narrowed vocabulary.
const invalidReact: ReactInputType = 'date';
void [types, reactInput, angularInput, vueInput, invalidWeb, invalidReact];
