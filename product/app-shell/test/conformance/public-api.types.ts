type ReactModule = typeof import('@vyrnforge/react/app-shell');
type AngularModule = typeof import('@vyrnforge/angular/app-shell');
type VueModule = typeof import('@vyrnforge/vue/app-shell');
type ElementsModule = typeof import('@vyrnforge/elements/app-shell');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
