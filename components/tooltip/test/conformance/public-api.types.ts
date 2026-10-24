type ReactModule = typeof import('@vyrnforge/react/tooltip');
type AngularModule = typeof import('@vyrnforge/angular/tooltip');
type VueModule = typeof import('@vyrnforge/vue/tooltip');
type ElementsModule = typeof import('@vyrnforge/elements/tooltip');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
