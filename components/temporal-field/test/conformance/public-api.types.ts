type ReactModule = typeof import('@vyrnforge/react/temporal-field');
type AngularModule = typeof import('@vyrnforge/angular/temporal-field');
type VueModule = typeof import('@vyrnforge/vue/temporal-field');
type ElementsModule = typeof import('@vyrnforge/elements/temporal-field');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
