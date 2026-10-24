type ReactModule = typeof import('@vyrnforge/react/split-button');
type AngularModule = typeof import('@vyrnforge/angular/split-button');
type VueModule = typeof import('@vyrnforge/vue/split-button');
type ElementsModule = typeof import('@vyrnforge/elements/split-button');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
