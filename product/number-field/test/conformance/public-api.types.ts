type ReactModule = typeof import('@vyrnforge/react/number-field');
type AngularModule = typeof import('@vyrnforge/angular/number-field');
type VueModule = typeof import('@vyrnforge/vue/number-field');
type ElementsModule = typeof import('@vyrnforge/elements/number-field');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
