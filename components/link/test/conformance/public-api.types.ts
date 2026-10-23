type ReactControl = typeof import('@vyrnforge/react/link').Link;
type AngularControl = typeof import('@vyrnforge/angular/link').VfLinkDirective;
type VueControl = typeof import('@vyrnforge/vue/link').Link;
const reactControl: ReactControl | undefined = undefined;
const angularControl: AngularControl | undefined = undefined;
const vueControl: VueControl | undefined = undefined;
void [reactControl, angularControl, vueControl];
