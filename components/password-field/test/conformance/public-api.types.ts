type ReactModule = typeof import('@vyrnforge/react/password-field');
type AngularModule = typeof import('@vyrnforge/angular/password-field');
type VueModule = typeof import('@vyrnforge/vue/password-field');
type ElementsModule = typeof import('@vyrnforge/elements/password-field');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
