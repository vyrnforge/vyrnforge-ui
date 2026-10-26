type ReactModule = typeof import('@vyrnforge/react/multi-select');
type AngularModule = typeof import('@vyrnforge/angular/multi-select');
type VueModule = typeof import('@vyrnforge/vue/multi-select');
type ElementsModule = typeof import('@vyrnforge/elements/multi-select');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
