type ReactControl = typeof import('@vyrnforge/react/number-input').NumberInput;
type AngularControl = typeof import('@vyrnforge/angular/number-input').VfNumberInputDirective;
type VueControl = typeof import('@vyrnforge/vue/number-input').NumberInput;
const values: [ReactControl | undefined, AngularControl | undefined, VueControl | undefined] = [undefined, undefined, undefined];
void values;
