type ReactModule = typeof import('@vyrnforge/react/context-menu');
type AngularModule = typeof import('@vyrnforge/angular/context-menu');
type VueModule = typeof import('@vyrnforge/vue/context-menu');
type ElementsModule = typeof import('@vyrnforge/elements/context-menu');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
