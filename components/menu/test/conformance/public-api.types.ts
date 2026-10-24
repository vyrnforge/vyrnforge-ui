type ReactModule = typeof import('@vyrnforge/react/menu');
type AngularModule = typeof import('@vyrnforge/angular/menu');
type VueModule = typeof import('@vyrnforge/vue/menu');
type ElementsModule = typeof import('@vyrnforge/elements/menu');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
