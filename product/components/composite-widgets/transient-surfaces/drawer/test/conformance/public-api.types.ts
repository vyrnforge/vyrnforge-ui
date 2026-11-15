type ReactModule = typeof import('@vyrnforge/react/drawer');
type AngularModule = typeof import('@vyrnforge/angular/drawer');
type VueModule = typeof import('@vyrnforge/vue/drawer');
type ElementsModule = typeof import('@vyrnforge/elements/drawer');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
